# EloRating_Axis-Allies

Elo Rating Calculation for the game Axis and Allies

A Python-based Elo rating system designed for team-based Axis & Allies matches. This system processes historical match data from YAML files and computes individual player ratings, supporting variable team sizes, fractional scoring, and advanced features like dynamic K-factors.

## Features

- **Team-based Elo calculations** with configurable team size scaling
- **Fractional scoring** (e.g., 2:1, 3:2) instead of just win/loss/draw
- **Dynamic K-factor** based on games played (higher adjustments for new players)
- **Multiple distribution methods** for splitting team rating changes among players
- **Tournament organization** with chronological match processing
- **Comprehensive statistics** including W/L/D records, side balance analysis
- **Detailed match logs** with rating changes, expected scores, and surprises

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

## YAML Match Format

Matches are organized in tournaments. Each tournament contains a name and a list of matches.

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

### Scoring Rules

- Fractional scores: If X+Y > 0, axis gets X/(X+Y), allies get Y/(X+Y)
- Draw: "0:0" or equal scores (e.g., "1:1") = 0.5 for each team
- Win/Loss stats are based on integer comparison (X > Y, X < Y, X == Y)

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

## License

This project is open source and available for use in rating Axis & Allies matches and similar team-based games.
