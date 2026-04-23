import random

# 7 probability levels for MPL
PROB_LEVELS = [0.05, 0.10, 0.25, 0.50, 0.75, 0.90, 0.95]

# 10 safe amounts for Option B (yen)
SAFE_AMOUNTS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 950]


def generate_all_trials() -> list[dict]:
    """
    Generate all MPL trials for Experiment 1.
    - 7 probability levels × 10 rows = 70 trials total
    - Option A: (p chance of ¥1000, otherwise ¥0)
    - Option B: certain amount x_safe (yen)
    - Probability blocks are randomized in order.
    """
    # Shuffle the order of probability blocks
    prob_levels = PROB_LEVELS.copy()
    random.shuffle(prob_levels)

    trials = []
    trial_id_counter = 1

    for block_idx, prob in enumerate(prob_levels):
        for row_idx, safe_amount in enumerate(SAFE_AMOUNTS):
            trial = {
                "trial_id": f"t{trial_id_counter:03d}",
                "block": block_idx + 1,
                "probability": prob,
                "row": row_idx + 1,
                "option_a_prob": prob,
                "option_a_amount": 1000,
                "option_b_amount": safe_amount,
            }
            trials.append(trial)
            trial_id_counter += 1

    return trials
