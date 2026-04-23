import random
import string

PROB_LEVELS = [
    0.01, 0.02, 0.03, 0.05, 0.07, 0.10, 0.15, 0.20, 0.25, 0.30,
    0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80,
    0.85, 0.90, 0.92, 0.93, 0.95, 0.97, 0.98, 0.99,
]

# 20 safe amounts: ¥50 to ¥1000 in steps of ¥50
SAFE_AMOUNTS = [50 * i for i in range(1, 21)]

DIGIT_CHANGE_EVERY = 3  # new 7-digit string every N blocks


def make_digit_string() -> str:
    first = random.choice("123456789")
    rest = "".join(random.choices(string.digits, k=6))
    return first + rest


def generate_digit_strings(n_blocks: int) -> list[str]:
    """Returns one digit string per block; rotates every DIGIT_CHANGE_EVERY blocks."""
    strings = []
    current = ""
    for i in range(n_blocks):
        if i % DIGIT_CHANGE_EVERY == 0:
            current = make_digit_string()
        strings.append(current)
    return strings


def generate_all_trials() -> list[dict]:
    """7 probability levels × 40 rows = 280 trials. Block order randomised."""
    prob_levels = PROB_LEVELS.copy()
    random.shuffle(prob_levels)

    trials = []
    counter = 1
    for block_idx, prob in enumerate(prob_levels):
        for row_idx, safe_amount in enumerate(SAFE_AMOUNTS):
            trials.append({
                "trial_id": f"t{counter:03d}",
                "block": block_idx + 1,
                "probability": prob,
                "row": row_idx + 1,
                "option_a_prob": prob,
                "option_a_amount": 1000,
                "option_b_amount": safe_amount,
            })
            counter += 1
    return trials
