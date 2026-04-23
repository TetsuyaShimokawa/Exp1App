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
  // choices: { [trial_id]: "A" | "B" }
  const [choices, setChoices] = useState({});
  // blockStartTime: timestamp when this block was first displayed
  const [rowStartTimes, setRowStartTimes] = useState({});
  const [blockMountTime] = useState(() => Date.now());

  const probability = blockTrials[0]?.probability;

  // Record start time for each row on first render
  useEffect(() => {
    const now = Date.now();
    const times = {};
    blockTrials.forEach((t) => {
      times[t.trial_id] = now;
    });
    setRowStartTimes(times);
    setChoices({});
  }, [blockTrials]);

  function handleChoice(trialId, choice) {
    if (!rowStartTimes[trialId]) {
      setRowStartTimes((prev) => ({ ...prev, [trialId]: Date.now() }));
    }
    setChoices((prev) => ({ ...prev, [trialId]: choice }));
  }

  const allAnswered = blockTrials.every((t) => choices[t.trial_id]);

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

  const completed = Object.keys(choices).length;
  const total = blockTrials.length;

  return (
    <div className="screen">
      {condition === "HIGH" && (
        <div className="digit-banner">
          <p className="label">覚える数字</p>
          <p className="digit-string">{digitString}</p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontWeight: 700, color: "#3a86ff", fontSize: "0.9rem" }}>
          ブロック {blockIndex + 1} / {totalBlocks}
        </p>
        <p className="block-progress">
          {completed} / {total} 行回答済み
        </p>
      </div>

      <div className="progress-bar-wrapper">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      </div>

      <p className="mpl-header">
        確率 p = {probability} のとき、以下の選択をしてください
      </p>

      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div className="mpl-table-wrapper">
          <table className="mpl-table">
            <thead>
              <tr>
                <th>行</th>
                <th className="option-a-text">
                  選択肢 A（くじ）
                  <br />
                  <span style={{ fontWeight: 400, fontSize: "0.82rem" }}>
                    確率 {probability} で ¥1,000
                  </span>
                </th>
                <th className="option-b-text">
                  選択肢 B（確実）
                  <br />
                  <span style={{ fontWeight: 400, fontSize: "0.82rem" }}>
                    確実に受け取れる金額
                  </span>
                </th>
                <th>A を選ぶ</th>
                <th>B を選ぶ</th>
              </tr>
            </thead>
            <tbody>
              {blockTrials.map((trial) => {
                const chosen = choices[trial.trial_id];
                return (
                  <tr
                    key={trial.trial_id}
                    className={chosen ? `selected-${chosen}` : ""}
                  >
                    <td style={{ color: "#888", fontSize: "0.85rem" }}>
                      {trial.row}
                    </td>
                    <td className="option-a-text">
                      {probability} × ¥1,000
                    </td>
                    <td className="option-b-text">¥{trial.option_b_amount}</td>
                    <td>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={trial.trial_id}
                          value="A"
                          checked={chosen === "A"}
                          onChange={() => handleChoice(trial.trial_id, "A")}
                        />
                        A
                      </label>
                    </td>
                    <td>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={trial.trial_id}
                          value="B"
                          checked={chosen === "B"}
                          onChange={() => handleChoice(trial.trial_id, "B")}
                        />
                        B
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {!allAnswered && (
        <p className="warning" style={{ fontSize: "0.85rem" }}>
          すべての行に回答してから「次へ」を押してください
        </p>
      )}

      {saving && <p className="saving">保存中...</p>}

      <button
        className="btn-primary btn-full"
        onClick={handleNext}
        disabled={!allAnswered || saving}
      >
        次へ
      </button>
    </div>
  );
}
