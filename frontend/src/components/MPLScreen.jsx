import { useState, useEffect } from "react";

export default function MPLScreen({
  blockTrials,
  blockIndex,
  totalBlocks,
  condition,
  digitString,
  onBlockComplete,
  saving,
}) {
  const [choices, setChoices] = useState({});
  const [rowStartTimes, setRowStartTimes] = useState({});
  const [blockMountTime] = useState(() => Date.now());

  const probability = blockTrials[0]?.probability;
  const probPct = probability != null ? Math.round(probability * 100) : "";

  useEffect(() => {
    const now = Date.now();
    const times = {};
    blockTrials.forEach((t) => { times[t.trial_id] = now; });
    setRowStartTimes(times);
    setChoices({});
  }, [blockTrials]);

  /** Input assistance: enforce monotone choices */
  function handleChoice(clickedId, choice) {
    const idx = blockTrials.findIndex((t) => t.trial_id === clickedId);
    setChoices((prev) => {
      const next = { ...prev, [clickedId]: choice };
      if (choice === "B") {
        // all rows BELOW also → B (higher safe amount → prefer safe)
        for (let i = idx + 1; i < blockTrials.length; i++)
          next[blockTrials[i].trial_id] = "B";
      } else {
        // choice A: all rows ABOVE also → A (lower safe amount → prefer risky)
        for (let i = 0; i < idx; i++)
          next[blockTrials[i].trial_id] = "A";
      }
      return next;
    });
    if (!rowStartTimes[clickedId])
      setRowStartTimes((prev) => ({ ...prev, [clickedId]: Date.now() }));
  }

  const allAnswered = blockTrials.every((t) => choices[t.trial_id]);
  const answered = Object.keys(choices).length;

  function handleNext() {
    if (!allAnswered) return;
    const now = Date.now();
    const results = blockTrials.map((t) => ({
      trial_id: t.trial_id,
      probability: t.probability,
      row: t.row,
      option_b_amount: t.option_b_amount,
      choice: choices[t.trial_id],
      response_time_ms: now - (rowStartTimes[t.trial_id] || blockMountTime),
    }));
    onBlockComplete(results);
  }

  return (
    <div className="screen">
      {condition === "HIGH" && (
        <div className="digit-banner">
          <span className="label">覚える数字：</span>
          <span className="digit-string">{digitString}</span>
        </div>
      )}

      <div style={{ padding: "0 16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>ブロック {blockIndex + 1} / {totalBlocks}</h2>
          <span style={{ fontSize: "0.85rem", color: "#666" }}>
            {answered} / {blockTrials.length} 行回答済み
          </span>
        </div>

        <div style={{ background: "#e8f4fd", borderRadius: 6, padding: "8px 12px", marginBottom: 10, fontSize: "0.88rem" }}>
          <strong>選択肢A</strong>：確率 <strong>{probPct}%</strong> で 1,000円（外れ→0円）
          ／ <strong>選択肢B</strong>：表の金額を確実に受け取る
        </div>

        <p style={{ fontSize: "0.78rem", color: "#888", margin: "0 0 8px" }}>
          ヒント：AかBをクリックすると上下の行が自動補完されます。変更したい行は押し直せます。
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={th}>行</th>
                <th style={th}>選択肢B（確実額）</th>
                <th style={{ ...th, color: "#1565c0" }}>A を選ぶ</th>
                <th style={{ ...th, color: "#2e7d32" }}>B を選ぶ</th>
              </tr>
            </thead>
            <tbody>
              {blockTrials.map((trial, idx) => {
                const c = choices[trial.trial_id];
                return (
                  <tr
                    key={trial.trial_id}
                    style={{
                      background: c === "A" ? "#e3f2fd" : c === "B" ? "#e8f5e9" : idx % 2 === 0 ? "#fff" : "#fafafa",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <td style={td}>{idx + 1}</td>
                    <td style={{ ...td, fontWeight: 600 }}>¥{trial.option_b_amount.toLocaleString()}</td>
                    <td style={td}>
                      <button
                        onClick={() => handleChoice(trial.trial_id, "A")}
                        style={{ ...btn, background: c === "A" ? "#1565c0" : "#e3f2fd", color: c === "A" ? "#fff" : "#1565c0", border: "1px solid #1565c0" }}
                      >A</button>
                    </td>
                    <td style={td}>
                      <button
                        onClick={() => handleChoice(trial.trial_id, "B")}
                        style={{ ...btn, background: c === "B" ? "#2e7d32" : "#e8f5e9", color: c === "B" ? "#fff" : "#2e7d32", border: "1px solid #2e7d32" }}
                      >B</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          className="btn-primary btn-full"
          style={{ marginTop: 16 }}
          disabled={!allAnswered || saving}
          onClick={handleNext}
        >
          {saving ? "保存中..." : "次のブロックへ →"}
        </button>
      </div>
    </div>
  );
}

const th = { padding: "8px 10px", textAlign: "center", borderBottom: "2px solid #ccc", whiteSpace: "nowrap" };
const td = { padding: "4px 10px", textAlign: "center" };
const btn = { padding: "3px 14px", borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: "0.88rem" };
