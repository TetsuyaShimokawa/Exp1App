import { useState } from "react";

export default function DigitCheckScreen({ digitString, onPass, phase }) {
  const [input, setInput] = useState("");
  const [failed, setFailed] = useState(false);
  const [showAgain, setShowAgain] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed === digitString) {
      setFailed(false);
      onPass();
    } else {
      setFailed(true);
      setShowAgain(true);
      setInput("");
    }
  }

  return (
    <div className="screen center-screen">
      <div className="center-card" style={{ maxWidth: 500 }}>
        <h2>
          {phase === "final"
            ? "最終確認：数字を入力してください"
            : "記憶確認"}
        </h2>

        {!showAgain ? (
          <p>実験中に覚えていただいた7桁の数字を入力してください。</p>
        ) : (
          <>
            <p className="error">
              正しくありません。もう一度数字を確認してください。
            </p>
            <div className="digit-box-prominent">
              <p className="label">覚える数字</p>
              <p className="digit-display">{digitString}</p>
            </div>
          </>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="text"
            className={`digit-check-input${failed ? " error-input" : ""}`}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setFailed(false);
            }}
            placeholder="7桁の数字"
            maxLength={7}
            autoFocus
          />
          <button type="submit" className="btn-primary btn-full">
            確認する
          </button>
        </form>
      </div>
    </div>
  );
}
