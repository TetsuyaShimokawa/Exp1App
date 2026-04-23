from pydantic import BaseModel


class ChoiceResult(BaseModel):
    session_id: str
    participant_id: str
    condition: str       # "HIGH" or "LOW"
    trial_id: str
    probability: float
    row: int
    option_b_amount: int
    choice: str          # "A" or "B"
    response_time_ms: int
