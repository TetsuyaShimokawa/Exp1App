import { useState } from "react";

export default function SetupScreen({ onSetup, loading, error }) {
  const [participantId, setParticipantId] = useState("");
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!participantId.trim() || !name.trim()) {
      setValidationError("参加者IDと氏名の両方を入力してください");
      return;
    }
    setValidationError("");
    onSetup(participantId.trim(), name.trim());
  }

  return (
    <div className="screen setup-screen">
      <h1>実験 1</h1>
      <p className="subtitle">認知負荷 × 選択課題</p>

      <form onSubmit={handleSubmit} className="setup-form">
        <div className="field">
          <label htmlFor="participantId">参加者ID</label>
          <input
            id="participantId"
            type="text"
            value={participantId}
            onChange={(e) => setParticipantId(e.target.value)}
            placeholder="例：P001"
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="name">氏名</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：山田太郎"
          />
        </div>

        {validationError && <p className="error">{validationError}</p>}
        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "読み込み中..." : "実験を始める"}
        </button>
      </form>
    </div>
  );
}
