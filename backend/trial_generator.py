import random
import string

PROB_LEVELS = [0.05, 0.10, 0.25, 0.50, 0.75, 0.90, 0.95]

# 40 safe amounts: ¥25 to ¥1000 in steps of ¥25
SAFE_AMOUNTS = [25 * i for i in range(1, 41)]

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
