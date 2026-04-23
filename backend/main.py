import csv
import io
import random
import string
import uuid
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models.session import SessionStartRequest
from models.result import ChoiceResult
from trial_generator import generate_all_trials

app = FastAPI(title="Exp1App API — Cognitive Load × MPL RCT")

# CORS: 開発環境 + Render デプロイ URL
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://exp1app-frontend.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# インメモリストレージ
sessions: dict[str, dict[str, Any]] = {}
results: list[dict[str, Any]] = []

CONDITIONS = ["HIGH", "LOW"]


def generate_digit_string(length: int = 7) -> str:
    """ランダムな7桁の数字列を生成する（先頭ゼロなし）。"""
    first = random.choice("123456789")
    rest = "".join(random.choices(string.digits, k=length - 1))
    return first + rest


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------
@app.get("/health")
def health_check():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# POST /api/session/start
# ---------------------------------------------------------------------------
@app.post("/api/session/start")
def start_session(req: SessionStartRequest):
    if not req.participant_id.strip() or not req.name.strip():
        raise HTTPException(status_code=400, detail="participant_id と name は必須です")

    session_id = str(uuid.uuid4())
    condition = random.choice(CONDITIONS)
    digit_string = generate_digit_string(7) if condition == "HIGH" else ""
    trials = generate_all_trials()

    sessions[session_id] = {
        "participant_id": req.participant_id.strip(),
        "name": req.name.strip(),
        "condition": condition,
        "digit_string": digit_string,
        "trials": trials,
        "created_at": datetime.now().isoformat(),
    }

    return {
        "session_id": session_id,
        "condition": condition,
        "digit_string": digit_string,
        "trials": trials,
    }


# ---------------------------------------------------------------------------
# POST /api/results
# ---------------------------------------------------------------------------
@app.post("/api/results")
def save_result(result: ChoiceResult):
    if result.session_id not in sessions:
        raise HTTPException(status_code=404, detail="セッションが見つかりません")

    session = sessions[result.session_id]
    record = result.model_dump()
    record["name"] = session.get("name", "")
    record["digit_string"] = session.get("digit_string", "")
    record["timestamp"] = datetime.now().isoformat()
    results.append(record)
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# GET /api/results/csv  (admin endpoint — download all results)
# ---------------------------------------------------------------------------
CSV_COLUMNS = [
    "participant_id",
    "name",
    "condition",
    "digit_string",
    "trial_id",
    "probability",
    "row",
    "option_b_amount",
    "choice",
    "response_time_ms",
    "timestamp",
]


@app.get("/api/results/csv")
def download_all_csv():
    if not results:
        raise HTTPException(status_code=404, detail="結果がまだありません")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"Exp1_results_{timestamp}.csv"

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=CSV_COLUMNS, extrasaction="ignore")
    writer.writeheader()
    for r in results:
        writer.writerow({col: r.get(col, "") for col in CSV_COLUMNS})

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8-sig")]),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
