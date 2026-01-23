#!/usr/bin/env python3
"""
Compute per-player Elo ratings from team matches stored in YAML.

Assumptions:
- Matches are processed in chronological order (date ascending).
- Each match is between exactly two teams ("team1" and "team2").
- Team size can vary (1..3 players).
- Result is given as "X:Y" where X is team1 score, Y is team2 score.
  - If you want best-of / sets, you can map scores to a win/draw/loss.
- Elo updates are performed per match and distributed to players.

Dependencies:
  pip install pyyaml

Usage:
  python elo_from_yaml.py matches.yml --out ratings.json
  python elo_from_yaml.py matches.yml --k 32 --initial 1500
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import date, datetime
from typing import Any, Dict, List, Tuple

import yaml


# ----------------------------
# Configuration / Core Elo
# ----------------------------

@dataclass(frozen=True)
class EloConfig:
    initial_rating: float = 1500.0
    k_factor: float = 24.0
    scale: float = 400.0
    # How to compute a team rating from player ratings:
    # "average" is the most common/simple choice.
    team_aggregation: str = "average"  # future: "sum", "median", etc.

    # How to distribute a team delta to players:
    # - "equal": split equally
    # - "weighted": split with mild weighting by player deviation from team avg
    distribution: str = "equal"
    weighted_alpha: float = 0.25  # only used for distribution="weighted"
    # α=1.0 -> per-player = team_delta / n (Team has one Elo outcome; players split it.)
    # α=0.0 -> per-player = team_delta (Each player should receive the same magnitude adjustment, regardless of team size.)
    # 0<α<1 -> hybrid
    team_size_exponent: float = 1.0
    # Dynamic K based on games played (GP)
    dynamic_k: bool = False
    k_new_mult: float = 1.5
    k_mid_mult: float = 1.25
    k_new_gp: int = 2
    k_mid_gp: int = 4


def expected_score(r_a: float, r_b: float, scale: float = 400.0) -> float:
    """Expected score for A against B."""
    return 1.0 / (1.0 + 10 ** ((r_b - r_a) / scale))


def parse_match_score(score_str: str) -> Tuple[float, float]: # legacy function, not used in current code
    """
    Parse "X:Y" -> (S1, S2) where S are Elo scores (1/0.5/0) by default.
    If your matches can draw, set score "1:1" or "0:0" accordingly.

    Current logic:
    - X > Y => team1 win => (1.0, 0.0)
    - X < Y => team2 win => (0.0, 1.0)
    - X == Y => draw => (0.5, 0.5)
    """
    if not isinstance(score_str, str) or ":" not in score_str:
        raise ValueError(f"Invalid score format: {score_str!r}. Expected 'X:Y'.")

    left, right = score_str.split(":", 1)
    x = int(left.strip())
    y = int(right.strip())

    if x > y:
        return 1.0, 0.0
    if x < y:
        return 0.0, 1.0
    return 0.5, 0.5


def parse_match_score_fractional(score_str: str) -> Tuple[float, float, int, int]:
    """
    Parse "X:Y" -> (S1, S2, X, Y)

    Fractional scoring:
      - If X+Y > 0: S1 = X/(X+Y), S2 = Y/(X+Y)
      - If X==0 and Y==0: treat as draw => (0.5, 0.5)

    Returns the original integers too, for W/L/D stats.
    """
    if not isinstance(score_str, str) or ":" not in score_str:
        raise ValueError(f"Invalid score format: {score_str!r}. Expected 'X:Y'.")

    left, right = score_str.split(":", 1)
    x = int(left.strip())
    y = int(right.strip())

    total = x + y
    if total == 0:
        return 0.5, 0.5, x, y

    return x / total, y / total, x, y


def effective_k_for_player(cfg: EloConfig, games_played: int) -> float:
    """
    Dynamic K schedule:
      GP < k_new_gp      -> k_factor * k_new_mult
      GP < k_mid_gp      -> k_factor * k_mid_mult
      else               -> k_factor
    """
    if not cfg.dynamic_k:
        return cfg.k_factor

    if games_played < cfg.k_new_gp:
        return cfg.k_factor * cfg.k_new_mult
    if games_played < cfg.k_mid_gp:
        return cfg.k_factor * cfg.k_mid_mult
    return cfg.k_factor


def team_rating(players: List[str], ratings: Dict[str, float], cfg: EloConfig) -> float:
    vals = [ratings[p] for p in players]
    if cfg.team_aggregation == "average":
        return sum(vals) / len(vals)
    raise ValueError(f"Unsupported team_aggregation={cfg.team_aggregation!r}")


def distribute_delta(
    team_players: List[str],
    ratings: Dict[str, float],
    team_delta: float,
    cfg: EloConfig,
) -> Dict[str, float]:
    """
    Return per-player deltas that sum to team_delta.
    """
    n = len(team_players)
    if n == 0:
        raise ValueError("Team has no players.")

    if cfg.distribution == "equal":
        per = team_delta / n
        return {p: per for p in team_players}

    if cfg.distribution == "weighted":
        # Mild weighting based on distance from team average.
        # Intuition: players far from the team mean are a bit more “responsible”.
        avg = sum(ratings[p] for p in team_players) / n
        devs = [abs(ratings[p] - avg) for p in team_players]
        base = 1.0
        weights = [base + cfg.weighted_alpha * d / 100.0 for d in devs]  # normalize dev scale
        wsum = sum(weights)
        return {p: team_delta * (w / wsum) for p, w in zip(team_players, weights)}

    raise ValueError(f"Unsupported distribution={cfg.distribution!r}")


# ----------------------------
# YAML parsing
# ----------------------------

def parse_iso_date(d: Any) -> date:
    if isinstance(d, date) and not isinstance(d, datetime):
        return d
    if isinstance(d, str):
        s = d.strip()
        # Accept both YYYY-MM-DD and YYYY-M-D variants
        parts = s.split("-")
        if len(parts) == 3 and all(parts):
            y, m, day = (int(parts[0]), int(parts[1]), int(parts[2]))
            return date(y, m, day)
        raise ValueError(f"Invalid date string: {d!r}")
    raise ValueError(f"Invalid date: {d!r} (expected YYYY-MM-DD string)")



def normalize_player_name(name: str) -> str:
    return name.strip().casefold()


def load_matches(path: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Reads tournaments and flattens them into a single match list.

    Returns:
      (matches, tournaments)

    Each match dict contains:
      id, date, axis, allies, result, tournament_name
    """
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if not isinstance(data, list):
        raise ValueError("Top-level YAML must be a list.")

    matches: List[Dict[str, Any]] = []
    tournaments: List[Dict[str, Any]] = []

    for item in data:
        if not isinstance(item, dict) or len(item) != 1:
            raise ValueError(f"Each top-level item must be a single-key dict. Got: {item!r}")

        key, payload = next(iter(item.items()))
        if key != "tournament":
            raise ValueError(f"Unsupported top-level key {key!r}. Expected 'tournament'.")

        if not isinstance(payload, list):
            raise ValueError(f"'tournament' must be a list. Got: {payload!r}")

        tournament_name: str | None = None

        # First pass: find name (if present)
        for entry in payload:
            if isinstance(entry, dict) and "name" in entry:
                tournament_name = str(entry["name"])
                break

        if not tournament_name:
            tournament_name = "unknown_tournament"

        tournaments.append({"name": tournament_name})

        # Second pass: parse matches
        for entry in payload:
            if not isinstance(entry, dict) or len(entry) != 1:
                continue  # ignore unexpected items gracefully

            entry_key, entry_payload = next(iter(entry.items()))

            if entry_key == "name":
                continue

            match_id = str(entry_key)

            if not (isinstance(entry_payload, list) and len(entry_payload) >= 3):
                raise ValueError(f"Match {match_id} in {tournament_name} must be a list [date, teams, result]. Got: {entry_payload!r}")

            m_date = parse_iso_date(entry_payload[0])
            teams_obj = entry_payload[1]
            result_str = entry_payload[2]

            if not isinstance(teams_obj, dict) or "axis" not in teams_obj or "allies" not in teams_obj:
                raise ValueError(
                    f"Match {match_id} in {tournament_name} teams must include axis/allies. Got: {teams_obj!r}"
                )

            axis = [normalize_player_name(x) for x in teams_obj["axis"]]
            allies = [normalize_player_name(x) for x in teams_obj["allies"]]

            matches.append(
                {
                    "id": match_id,
                    "date": m_date,
                    "axis": axis,
                    "allies": allies,
                    "result": str(result_str),
                    "tournament": tournament_name,
                }
            )

    # Sort by date, stable tie-breakers: tournament then match id
    matches.sort(key=lambda m: (m["date"], m["tournament"], m["id"]))
    return matches, tournaments


# ----------------------------
# Rating computation
# ----------------------------

def compute_elo(
    matches: List[Dict[str, Any]],
    cfg: EloConfig
    ) -> Tuple[
        Dict[str, float],
        Dict[str, Dict[str, int]],
        Dict[str, Dict[str, int]],
        List[Dict[str, Any]],
        Dict[str, List[Dict[str, Any]]],
    ]:
    """
    Returns:
      - final ratings dict
      - per-player stats dict: {player: {"W": int, "L": int, "D": int, "GP": int}}
      - side stats dict: {"axis": {"W":..,"L":..,"D":..,"GP":..}, "allies": {...}}
      - per-match log entries
      - per-player rating history for plotting
    """
    ratings: Dict[str, float] = {}
    stats: Dict[str, Dict[str, int]] = {}
    log: List[Dict[str, Any]] = []
    rating_history: Dict[str, List[Dict[str, Any]]] = {}

    side_stats: Dict[str, Dict[str, int]] = {
        "axis": {"W": 0, "L": 0, "D": 0, "GP": 0},
        "allies": {"W": 0, "L": 0, "D": 0, "GP": 0},
    }

    def ensure_players(players: List[str]) -> None:
        for p in players:
            if p not in ratings:
                ratings[p] = float(cfg.initial_rating)
            if p not in stats:
                stats[p] = {"W": 0, "L": 0, "D": 0, "GP": 0}
            if p not in rating_history:
                rating_history[p] = []

    for m in matches:
        axis = m["axis"]
        allies = m["allies"]
        ensure_players(axis)
        ensure_players(allies)

        r_axis = team_rating(axis, ratings, cfg)
        r_allies = team_rating(allies, ratings, cfg)

        e_axis = expected_score(r_axis, r_allies, cfg.scale)
        e_allies = 1.0 - e_axis

        s_axis, s_allies, x, y = parse_match_score_fractional(m["result"])

        # Compute the match "surprise" once (no K yet)
        surprise_axis = (s_axis - e_axis)
        surprise_allies = (s_allies - e_allies)

        # Size scaling (n^alpha) applies regardless of K policy
        n_axis = len(axis)
        n_allies = len(allies)
        size_div_axis = (n_axis ** cfg.team_size_exponent)
        size_div_allies = (n_allies ** cfg.team_size_exponent)

        avg_k_axis_pre = sum(effective_k_for_player(cfg, stats[p]["GP"]) for p in axis) / n_axis
        avg_k_allies_pre = sum(effective_k_for_player(cfg, stats[p]["GP"]) for p in allies) / n_allies

        # For logging / traceability (works for both equal + weighted)
        d_axis_per_player = (avg_k_axis_pre * surprise_axis) / size_div_axis
        d_allies_per_player = (avg_k_allies_pre * surprise_allies) / size_div_allies


        # Build per-player deltas using each player's effective K
        # Note: use stats[p]["GP"] BEFORE incrementing GP for this match
        if cfg.distribution == "equal":
            deltas_axis = {
                p: (effective_k_for_player(cfg, stats[p]["GP"]) * surprise_axis) / size_div_axis
                for p in axis
            }
            deltas_allies = {
                p: (effective_k_for_player(cfg, stats[p]["GP"]) * surprise_allies) / size_div_allies
                for p in allies
            }

        elif cfg.distribution == "weighted":
            # For weighted, we need a team-level total to redistribute.
            # Use the average effective K across the team as the team K for this match.
            k_axis_eff = avg_k_axis_pre
            k_allies_eff = avg_k_allies_pre

            d_axis_team_eff = k_axis_eff * surprise_axis
            d_allies_team_eff = k_allies_eff * surprise_allies

            d_axis_per_player = d_axis_team_eff / size_div_axis
            d_allies_per_player = d_allies_team_eff / size_div_allies

            effective_axis_team_delta = d_axis_per_player * n_axis
            effective_allies_team_delta = d_allies_per_player * n_allies

            deltas_axis = distribute_delta(axis, ratings, effective_axis_team_delta, cfg)
            deltas_allies = distribute_delta(allies, ratings, effective_allies_team_delta, cfg)

        else:
            raise ValueError(f"Unsupported distribution={cfg.distribution!r}")

        involved = axis + allies
        ratings_before_players = {p: ratings[p] for p in involved}
        gp_before_players = {p: stats[p]["GP"] for p in involved}

        for p, d in deltas_axis.items():
            ratings[p] += d
        for p, d in deltas_allies.items():
            ratings[p] += d

        # Record post-match rating snapshot for charting
        match_date = m["date"].isoformat()
        for p in set(axis + allies):
            rating_history[p].append(
                {"date": match_date, "rating": float(ratings[p])}
            )

        # Append per-player history for plotting
        for p in axis:
            rating_history.setdefault(p, []).append(
                {
                    "date": m["date"].isoformat(),
                    "tournament": m.get("tournament", ""),
                    "match_id": m["id"],
                    "side": "axis",
                    "result": m["result"],
                    "gp_before": gp_before_players[p],
                    "delta": deltas_axis[p],
                    "rating_before": ratings_before_players[p],
                    "rating_after": ratings[p],
                }
            )

        for p in allies:
            rating_history.setdefault(p, []).append(
                {
                    "date": m["date"].isoformat(),
                    "tournament": m.get("tournament", ""),
                    "match_id": m["id"],
                    "side": "allies",
                    "result": m["result"],
                    "gp_before": gp_before_players[p],
                    "delta": deltas_allies[p],
                    "rating_before": ratings_before_players[p],
                    "rating_after": ratings[p],
                }
            )

        # W/L/D is based on integer comparison (x vs y)
        side_stats["axis"]["GP"] += 1
        side_stats["allies"]["GP"] += 1

        if x > y:
            # axis win
            for p in axis:
                stats[p]["W"] += 1
                stats[p]["GP"] += 1
            for p in allies:
                stats[p]["L"] += 1
                stats[p]["GP"] += 1
            side_stats["axis"]["W"] += 1
            side_stats["allies"]["L"] += 1
            outcome = "axis_win"
        elif x < y:
            # allies win
            for p in axis:
                stats[p]["L"] += 1
                stats[p]["GP"] += 1
            for p in allies:
                stats[p]["W"] += 1
                stats[p]["GP"] += 1
            side_stats["axis"]["L"] += 1
            side_stats["allies"]["W"] += 1
            outcome = "allies_win"
        else:
            for p in axis:
                stats[p]["D"] += 1
                stats[p]["GP"] += 1
            for p in allies:
                stats[p]["D"] += 1
                stats[p]["GP"] += 1
            side_stats["axis"]["D"] += 1
            side_stats["allies"]["D"] += 1
            outcome = "draw"

        log.append(
            {
                "id": m["id"],
                "date": m["date"].isoformat(),
                "tournament": m.get("tournament", ""),
                "axis": axis,
                "allies": allies,
                "result": m["result"],
                "parsed_score": {"x": x, "y": y, "s_axis": s_axis, "s_allies": s_allies},
                "axis_rating_before": r_axis,
                "allies_rating_before": r_allies,
                "expected_axis": e_axis,
                "expected_allies": e_allies,
                "axis_delta_per_player": d_axis_per_player,
                "axis_player_deltas": deltas_axis,
                "allies_player_deltas": deltas_allies,
                "allies_delta_per_player": d_allies_per_player,
                "surprise_axis": surprise_axis,
                "surprise_allies": surprise_allies,
                "n_axis": n_axis,
                "n_allies": n_allies,
                "dynamic_k": cfg.dynamic_k,
                "outcome": outcome,
                "avg_k_axis": avg_k_axis_pre,
                "avg_k_allies": avg_k_allies_pre,
                "effective_axis_team_delta": sum(deltas_axis.values()),
                "effective_allies_team_delta": sum(deltas_allies.values()),
            }
        )

    return ratings, stats, side_stats, log, rating_history


def print_run_header(cfg: EloConfig, tournaments: List[Dict[str, Any]], match_count: int) -> None:
    tournament_names = [t.get("name", "unknown") for t in tournaments]
    print("Run configuration:")
    print(f"  initial_rating:     {cfg.initial_rating}")
    print(f"  k_factor:           {cfg.k_factor}")
    print(f"  scale:              {cfg.scale}")
    print(f"  dynamic_k:          {cfg.dynamic_k}")
    if cfg.dynamic_k:
        print(f"  k_new_gp:           {cfg.k_new_gp} (mult {cfg.k_new_mult})")
        print(f"  k_mid_gp:           {cfg.k_mid_gp} (mult {cfg.k_mid_mult})")
    print(f"  team_aggregation:   {cfg.team_aggregation}")
    print(f"  team_size_exponent: {cfg.team_size_exponent}")
    print(f"  distribution:       {cfg.distribution}")
    if cfg.distribution == "weighted":
        print(f"  weighted_alpha:     {cfg.weighted_alpha}")
    print(f"  tournaments:        {len(tournaments)}")
    if tournament_names:
        # avoid overly long single-line output if many tournaments
        print(f"  tournament_names:   {', '.join(tournament_names)}")
    print(f"  matches_processed:  {match_count}")
    print()


# ----------------------------
# Web JSON export
# ----------------------------

def build_web_payload(
    cfg: EloConfig,
    tournaments: List[Dict[str, Any]],
    matches: List[Dict[str, Any]],
    ratings: Dict[str, float],
    stats: Dict[str, Dict[str, int]],
    side_stats: Dict[str, Dict[str, int]],
    log: List[Dict[str, Any]],
    rating_history: Dict[str, List[Dict[str, Any]]],
) -> Dict[str, Any]:
    """
    Create a stable, web-friendly JSON payload for GitHub Pages.

    Notes:
    - Keep full precision in JSON. Round in the UI.
    - `rating_history` is per-player time series for plotting.
    """
    tournament_names = [t.get("name", "unknown") for t in tournaments]

    players_sorted = sorted(
        ratings.keys(),
        key=lambda p: (-(ratings[p]), p),
    )

    return {
        "meta": {
            "schema_version": 1,
            "generated_at": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
            "tournaments": tournament_names,
            "matches_processed": len(matches),
        },
        "config": {
            "initial_rating": cfg.initial_rating,
            "k_factor": cfg.k_factor,
            "scale": cfg.scale,
            "dynamic_k": cfg.dynamic_k,
            "k_new_gp": cfg.k_new_gp,
            "k_mid_gp": cfg.k_mid_gp,
            "k_new_mult": cfg.k_new_mult,
            "k_mid_mult": cfg.k_mid_mult,
            "team_aggregation": cfg.team_aggregation,
            "team_size_exponent": cfg.team_size_exponent,
            "distribution": cfg.distribution,
            "weighted_alpha": cfg.weighted_alpha if cfg.distribution == "weighted" else None,
        },
        "players": {
            p: {
                "rating": ratings[p],
                "stats": stats[p],
                "rating_history": rating_history.get(p, []),
            }
            for p in players_sorted
        },
        "side_stats": side_stats,
        # Keep this if you want a match table / debugging in the UI:
        "matches": log,
    }



# ----------------------------
# CLI
# ----------------------------

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("yaml_path", help="Path to YAML match file")
    ap.add_argument("--out", default="", help="Optional JSON output path for final ratings + log")
    ap.add_argument("--initial", type=float, default=1500.0, help="Initial rating for new players")
    ap.add_argument("--k", type=float, default=32.0, help="K-factor")
    ap.add_argument("--scale", type=float, default=400.0, help="Elo logistic scale (typically 400)")
    ap.add_argument("--distribution", choices=["equal", "weighted"], default="equal")
    ap.add_argument("--weighted-alpha", type=float, default=0.25, help="Weight strength (only for weighted distribution)")
    ap.add_argument("--team-aggregation", choices=["average"], default="average", help="How to compute team rating from player ratings")
    ap.add_argument(
        "--team-size-exponent",
        type=float,
        default=1.0,
        help="α in per-player delta = team_delta / n^α. 1.0=split by team size (Model A), 0.0=per-player equal (Model B).",
    )
    ap.add_argument("--dynamic-k", action="store_true", help="Enable dynamic K based on games played (GP)")
    ap.add_argument("--k-new-mult", type=float, default=1.5, help="K multiplier for players with GP < k-new-gp")
    ap.add_argument("--k-mid-mult", type=float, default=1.25, help="K multiplier for players with GP < k-mid-gp (and >= k-new-gp)")
    ap.add_argument("--k-new-gp", type=int, default=2, help="GP threshold for new-player K multiplier")
    ap.add_argument("--k-mid-gp", type=int, default=4, help="GP threshold for mid-player K multiplier")
    ap.add_argument(
        "--web-out",
        default="docs/data/elo.json",
        help="Write web-friendly JSON (for GitHub Pages), default: docs/data/elo.json",
    )


    args = ap.parse_args()

    if args.team_size_exponent < 0.0 or args.team_size_exponent > 2.0:
        raise ValueError("--team-size-exponent must be >= 0.0, <= 2.0 and is typically 0.0 or 1.0")

    if args.dynamic_k:
        if args.k_new_gp < 0 or args.k_mid_gp < 0:
            raise ValueError("k-new-gp and k-mid-gp must be non-negative")
        if args.k_mid_gp < args.k_new_gp:
            raise ValueError("k-mid-gp must be >= k-new-gp")
        if args.k_new_mult < 1.0 or args.k_mid_mult < 1.0:
            raise ValueError("K multipliers should typically be >= 1.0")

    cfg = EloConfig(
        initial_rating=args.initial,
        k_factor=args.k,
        scale=args.scale,
        distribution=args.distribution,
        weighted_alpha=args.weighted_alpha,
        team_aggregation=args.team_aggregation,
        team_size_exponent=args.team_size_exponent,
        dynamic_k=args.dynamic_k,
        k_new_mult=args.k_new_mult,
        k_mid_mult=args.k_mid_mult,
        k_new_gp=args.k_new_gp,
        k_mid_gp=args.k_mid_gp,
    )

    matches, tournaments = load_matches(args.yaml_path)
    ratings, stats, side_stats, log, rating_history = compute_elo(matches, cfg)

    print_run_header(cfg, tournaments, len(matches))

    leaderboard = sorted(ratings.items(), key=lambda kv: kv[1], reverse=True)
    print("Final Elo ratings:")
    for name, r in leaderboard:
        s = stats[name]
        print(f"  {name:20s} {r:8.0f}   GP:{s['GP']:3d}  W:{s['W']:3d}  L:{s['L']:3d}  D:{s['D']:3d}")

    print("\nSide summary:")
    print(
        f"  Axis:   GP:{side_stats['axis']['GP']:3d}  W:{side_stats['axis']['W']:3d}  "
        f"L:{side_stats['axis']['L']:3d}  D:{side_stats['axis']['D']:3d}"
    )
    print(
        f"  Allies: GP:{side_stats['allies']['GP']:3d}  W:{side_stats['allies']['W']:3d}  "
        f"L:{side_stats['allies']['L']:3d}  D:{side_stats['allies']['D']:3d}"
    )

    web_payload = build_web_payload(cfg, tournaments, matches, ratings, stats, side_stats, log, rating_history)
    if args.web_out:
        with open(args.web_out, "w", encoding="utf-8") as f:
            json.dump(web_payload, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
