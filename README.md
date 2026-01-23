# EloRating_Axis-Allies

Elo Rating Calculation for the game **Axis & Allies**

A Python-based Elo rating system designed for **team-based Axis & Allies matches**.  
The system processes historical match data from YAML files and computes **individual player ratings** while accounting for **team size differences, partial victories, player experience, and long-term rating stability**.

This is **not a simple win/loss ladder**—it is a mathematically consistent extension of Elo adapted for team play...As described by chatGPT.

---

## Core Idea

Each match produces a **team-level outcome**, which is then translated into **per-player rating changes** using configurable scaling rules.

At a high level, every match follows this flow:

1. Compute **team ratings** from player ratings  
2. Compute **expected outcome** using the Elo formula  
3. Convert the match score into a **fractional result**  
4. Compute how “surprising” the result was  
5. Apply **K-factor scaling**  
6. Adjust for **team size**  
7. Distribute the result to individual players  
8. Update ratings and statistics  

---

## Features

- **Team-based Elo calculations** with configurable team size scaling
- **Fractional scoring** (e.g., `2:1`, `3:2`) instead of just win/loss/draw
- **Dynamic K-factor** based on games played (higher volatility for new players)
- **Multiple distribution methods** for splitting team rating changes
- **Tournament organization** with chronological match processing
- **Side statistics** (Axis vs Allies balance)
- **Detailed match logs** for full traceability

---

## Requirements

```bash
pip install pyyaml
```

## Usage

### Basic Usage

```bash
python game_elo.py matches.yaml
```

### With Custom Parameters

```bash
python game_elo.py matches.yaml --k 32 --initial 1500 --out ratings.json
```

### Advanced Options

```bash
python game_elo.py matches.yaml \
  --k 32 \
  --initial 1500 \
  --scale 400 \
  --team-size-exponent 1.0 \
  --distribution equal \
  --dynamic-k \
  --k-new-gp 2 \
  --k-mid-gp 4 \
  --out ratings.json
```

## Command-Line Options

| Option | Default | Description |
|--------|---------|-------------|
| `--initial` | 1500.0 | Initial rating for new players |
| `--k` | 32.0 | K-factor (rating volatility) |
| `--scale` | 400.0 | Elo logistic scale (typically 400) |
| `--team-size-exponent` | 1.0 | Team size scaling: 1.0 = split by size, 0.0 = equal per player |
| `--distribution` | equal | How to split rating changes: `equal` or `weighted` |
| `--weighted-alpha` | 0.25 | Weight strength (only for weighted distribution) |
| `--dynamic-k` | false | Enable dynamic K-factor based on games played |
| `--k-new-gp` | 2 | Games played threshold for new player multiplier |
| `--k-mid-gp` | 4 | Games played threshold for mid-experience multiplier |
| `--k-new-mult` | 1.5 | K multiplier for new players |
| `--k-mid-mult` | 1.25 | K multiplier for mid-experience players |
| `--out` | - | Optional JSON output file for ratings and detailed logs |

---

## YAML Match Format

```yaml
- tournament:
  - name: "Tournament Name"
  - match1:
    - 2025-07-01  # Date (YYYY-MM-DD)
    - { axis: ["Player1", "Player2"], allies: ["Player3", "Player4", "Player5"] }
    - "2:1"  # Score (axis:allies)
  - match2:
    - 2025-07-08
    - { axis: ["Player3"], allies: ["Player1"] }
    - "0:1"
```

### Match Components

1. **Date**: ISO format (YYYY-MM-DD)
2. **Teams**: Two teams labeled `axis` and `allies`, each with 1-3 players
3. **Result**: Score in "X:Y" format where X is axis score and Y is allies score

## Output

### Console Output

```
Run configuration:
  initial_rating:     1500
  k_factor:           32
  scale:              400
  dynamic_k:          True
  ...

Final Elo ratings:
  player1              1623   GP: 12  W:  8  L:  3  D:  1
  player2              1587   GP: 15  W:  9  L:  5  D:  1
  ...

Side summary:
  Axis:   GP: 25  W: 11  L: 12  D:  2
  Allies: GP: 25  W: 12  L: 11  D:  2
```

### JSON Output (Optional)

When using `--out ratings.json`, generates:
- Final player ratings
- Per-player statistics (W/L/D/GP)
- Side balance statistics
- Detailed match-by-match logs with:
  - Rating changes per player
  - Expected vs actual scores
  - Surprise factors
  - Dynamic K values used

## Configuration Details

### Team Size Scaling

The `--team-size-exponent` parameter controls how team size affects rating changes:

- **1.0 (default)**: Rating change is split equally among team members
  - Example: Team of 3 wins 30 points → each player gets 10 points
- **0.0**: Each player gets the full team rating change
  - Example: Team of 3 wins 30 points → each player gets 30 points
- **0.5**: Hybrid approach (square root scaling)

### Distribution Methods

- **equal**: Rating changes split equally among team members
- **weighted**: Players farther from team average get slightly larger adjustments

### Dynamic K-Factor

When enabled with `--dynamic-k`:
- New players (GP < k-new-gp): K × k-new-mult
- Mid-experience (GP < k-mid-gp): K × k-mid-mult
- Experienced players: Base K

This allows new players' ratings to stabilize faster.

## Parameter Tuning Guidelines

### Recommended Defaults (Axis & Allies)

```css
--k 24
--dynamic-k
--team-size-exponent 0.5
--distribution weighted
```

#### K-Factor

- 16–24: Conservative, long campaigns
- 24–32: Balanced (recommended)
- 32+: Short tournaments, fast movement

#### Dynamic K

- Enable if:
    - New players join frequently
    - You want faster convergence early
- Disable if:
    - All players are experienced
    - Historical data is already stable

#### Team Size Exponent

- 1.0: Strict team-based play
- 0.5: Best balance for mixed team sizes
- 0.0: Individual impact dominates

#### Distribution

- equal: Maximum predictability
- weighted: Better long-term accuracy


## Examples

### Example 1: Basic Tournament Processing

```bash
python game_elo.py matches_fake.yaml
```

### Example 2: Conservative Ratings with Dynamic K

```bash
python game_elo.py matches.yaml --k 24 --dynamic-k --out results.json
```

### Example 3: Equal Per-Player Impact

```bash
python game_elo.py matches.yaml --team-size-exponent 0.0
```

## Player Name Handling

Player names are normalized (case-insensitive, whitespace-trimmed) to ensure consistency. "John Smith", "john smith", and "JOHN SMITH" are treated as the same player.

---

## How the Elo System Works

### 1. Player and Team Ratings

Each player has an individual Elo rating (default: **1500**).

A team’s rating is computed as the **average** of its players’ ratings:

TeamRating = (R₁ + R₂ + … + Rₙ) / n

This ensures:
- Larger teams do not automatically have higher ratings
- Strong players raise team strength proportionally

---

### 2. Expected Outcome

The expected score for Axis vs Allies is computed using the standard Elo logistic function:

E_axis = 1 / (1 + 10^((R_allies − R_axis) / scale))
E_allies = 1 − E_axis

Where:
- `scale` is typically **400**
- Expected values lie in **[0.0, 1.0]**

---

### 3. Fractional Match Scoring

Instead of reducing matches to win/loss/draw, **actual scores are preserved**.

| Match Result | Axis Score | Allies Score |
|-------------|------------|--------------|
| `"1:0"` | 1.0 | 0.0 |
| `"2:1"` | 0.667 | 0.333 |
| `"3:2"` | 0.600 | 0.400 |
| `"0:0"` | 0.5 | 0.5 |

This allows:
- Close wins to matter less than dominant wins
- Partial victories to influence ratings smoothly

Win/Loss/Draw statistics are still tracked using integer comparison.

---

### 4. Surprise Factor (Core Elo Signal)

For each team:

Surprise = ActualScore − ExpectedScore

- Positive → better than expected
- Negative → worse than expected
- Zero → exactly as expected

This value drives **all rating changes**.

---

### 5. K-Factor (Volatility Control)

The K-factor determines **how fast ratings change**.

Δ = K × Surprise

- Higher K → faster movement, less stability
- Lower K → slower movement, more stability

---

### 6. Dynamic K-Factor (Optional)

When `--dynamic-k` is enabled, K depends on player experience:

| Games Played (GP) | Effective K |
|------------------|-------------|
| GP < k-new-gp | K × k-new-mult |
| GP < k-mid-gp | K × k-mid-mult |
| Otherwise | K |

Dynamic K is applied **per player**, not per team.

---

### 7. Team Size Scaling (`team-size-exponent`)

Team-based Elo introduces a critical design choice:

> Should players in larger teams gain less rating per match?

This system answers that via:

PerPlayerDelta ∝ 1 / (team_size ^ α)

Where `α = team-size-exponent`.

| α | Behavior |
|---|---------|
| 1.0 | Team delta split equally (classic team Elo) |
| 0.0 | Each player receives full impact |
| 0.5 | Hybrid (square-root scaling) |

This parameter is **one of the most important tuning knobs**.

---

### 8. Distribution Methods

Once the per-player delta is known:

- **equal**  
  All players receive the same adjustment.

- **weighted**  
  Players further from the team’s average rating receive slightly larger adjustments.

Weighted distribution:
- Helps pull outliers toward true skill
- Preserves total team impact

---

### 9. Rating Precision

- Ratings are stored internally as **floating-point values**
- Rounding is applied **only for display**
- This avoids long-term bias and drift

## License

This project is open source and available for use in rating Axis & Allies matches and similar team-based games.

## Mathematical Appendix

### Overview

This Elo system is an extension of the classical Elo model, adapted for:

- Team-based matches
- Variable team sizes
- Fractional (non-binary) match results
- Player-specific rating volatility (dynamic K)

All calculations are deterministic and zero-sum per match.

---

### 1. Team Rating

Each player *p* has an individual rating:

```
R_p
```

A team *T* consisting of *n* players has a team rating computed as the average:

```
R_T = (R_1 + R_2 + ... + R_n) / n
```

This prevents larger teams from having inflated ratings purely due to size.

---

### 2. Expected Score

The expected score for team A against team B is computed using the Elo logistic function:

```
E_A = 1 / (1 + 10^((R_B - R_A) / scale))
E_B = 1 - E_A
```

Where:
- `scale` is typically 400
- Expected scores lie in the interval [0, 1]

---

### 3. Fractional Match Score

Given a match result in the form `"X:Y"`:

- If X + Y > 0:

```
S_A = X / (X + Y)
S_B = Y / (X + Y)
```

- If X = Y = 0 (explicit draw):

```
S_A = 0.5
S_B = 0.5
```

This allows partial victories (e.g. 2:1) to influence ratings proportionally.

---

### 4. Surprise (Performance Signal)

The Elo adjustment signal is the difference between actual and expected score:

```
Δ_A = S_A - E_A
Δ_B = S_B - E_B
```

- Positive value → better than expected
- Negative value → worse than expected
- Zero → exactly as expected

---

### 5. Dynamic K-Factor

Each player has an effective K-factor based on games played (GP):

```
K_p =
  K × k_new_mult   if GP_p < k_new_gp
  K × k_mid_mult   if GP_p < k_mid_gp
  K               otherwise
```

If dynamic K is disabled:

```
K_p = K
```

Dynamic K accelerates convergence for new players while preserving long-term stability.

---

### 6. Team Size Scaling

To prevent large teams from receiving disproportionate rating changes, per-player updates are scaled by team size:

```
size_divisor = |T|^α
```

Where:
- `|T|` = number of players on the team
- `α` = team-size-exponent

Common values:
- α = 1.0 → strict team split
- α = 0.5 → hybrid (square-root scaling)
- α = 0.0 → full individual impact

---

### 7. Per-Player Rating Update (Equal Distribution)

For player *p* on team *T*:

```
ΔR_p = (K_p × Δ_T) / (|T|^α)
```

Where:
- `K_p` = effective K for player p
- `Δ_T` = team surprise value
- `|T|` = team size
- `α` = team-size-exponent

---

### 8. Weighted Distribution (Optional)

For weighted distribution, a team-level delta is computed first:

```
K_T = average(K_p for p in T)
ΔR_T = (K_T × Δ_T) / (|T|^α)
```

This team delta is then redistributed among players based on deviation from team average rating:

```
weight_p = 1 + weighted_alpha × |R_p − R_T| / 100
ΔR_p = ΔR_T × (weight_p / Σ weight_p)
```

This preserves:

```
Σ ΔR_p (team) = ΔR_T
```

---

### 9. Conservation Properties

This system guarantees:

- Zero-sum per match:
  ```
  Σ ΔR_axis + Σ ΔR_allies = 0
  ```
- Stable global rating mean
- No rating inflation or deflation (unless K parameters are changed)

---

### 10. Precision and Rounding

- Ratings are stored internally as floating-point values
- No rounding is applied during calculations
- Rounding is performed only for display or export

This avoids long-term bias and numerical drift.

---

### Summary Formula

For a player *p* on team *T*:

```
ΔR_p = (K_p × (S_T − E_T)) / (|T|^α)
```

With optional redistribution if weighted mode is enabled.
