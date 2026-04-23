import { useState } from "react";

/**
 * BreakScreen — shown between MPL blocks.
 * For HIGH group: (1) recall check for current digit, (2) show next digit if changed.
 */
export default function BreakScreen({
  remainingBlocks,
  condition,
  checkDigit,   // digit to recall (completed block's digit)
  nextDigit,    // digit for next block
  onContinue,   // (typedDigit?: string) => void
}) {
  const isHigh = condition === "HIGH";
  const digitChanged = isHigh && nextDigit !== checkDigit;

  // Step 1: recall check  Step 2: show next digit (if changed)
  const [step, setStep] = useState(isHigh ? "check" : "ready");
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleCheckSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    if (digitChanged) {
      setStep("new_digit");
    } else {
      setStep("ready");
    }
  }

  if (step === "check") {
    return (
      <div className="screen center-screen">
        <div className="center-card" style={{ maxWidth: 480 }}>
          <h2>ブロック間チェック</h2>
          <p>覚えている7桁の数字を入力してください。</p>
          <form onSubmit={handleCheckSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              className="digit-check-input"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="7桁の数字"
              maxLength={7}
              autoFocus
            />
            <button type="submit" className="btn-primary btn-full" disabled={typed.length === 0}>
              確認する
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === "new_digit") {
    return (
      <div className="screen center-screen">
        <div className="center-card" style={{ maxWidth: 480 }}>
          <h2>新しい数字を覚えてください</h2>
          {submitted && (
            <p style={{ color: typed.trim() === checkDigit ? "#2e7d32" : "#c62828" }}>
              {typed.trim() === checkDigit ? "✓ 正解でした" : `✗ 正解は ${checkDigit} でした`}
            </p>
          )}
          <div className="digit-banner" style={{ width: "100%", margin: "12px 0" }}>
            <p className="label">次のブロックの数字</p>
            <p className="digit-string">{nextDigit}</p>
          </div>
          <p>この数字を覚えたら「続ける」を押してください。</p>
          <button className="btn-primary btn-full" onClick={() => onContinue(typed)}>
            続ける
          </button>
        </div>
      </div>
    );
  }

  // step === "ready"
  return (
    <div className="screen center-screen">
      <div className="center-card">
        <h2>休憩</h2>
        {submitted && isHigh && (
          <p style={{ color: typed.trim() === checkDigit ? "#2e7d32" : "#c62828" }}>
            {typed.trim() === checkDigit ? "✓ 正解でした" : `✗ 正解は ${checkDigit} でした`}
          </p>
        )}
        <p>残り {remainingBlocks} ブロックあります。</p>
        {isHigh && (
          <div className="digit-banner" style={{ width: "100%", margin: "8px 0" }}>
            <p className="label">引き続き覚えておく数字</p>
            <p className="digit-string">{nextDigit}</p>
          </div>
        )}
        <p>準備ができたら「続ける」を押してください。</p>
        <button className="btn-primary btn-full" onClick={() => onContinue(typed)}>
          続ける
        </button>
      </div>
    </div>
  );
}
