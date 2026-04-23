export default function FinishScreen({ participantId, bdmResult, complianceLog, condition, allChoices }) {
  const compliance =
    condition === "HIGH" && complianceLog.length > 0
      ? (complianceLog.filter((c) => c.correct).length / complianceLog.length) * 100
      : null;

  function downloadCSV() {
    const header = "trial_id,probability,option_b_amount,choice,response_time_ms\n";
    const rows = allChoices
      .map((c) => `${c.trial_id},${c.probability},${c.option_b_amount},${c.choice},${c.response_time_ms}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8-sig;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exp1_${participantId}_choices.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="screen center-screen">
      <div className="center-card" style={{ maxWidth: 540 }}>
        <h2>実験完了</h2>
        <p>ご参加ありがとうございました。</p>

        {/* BDM Result */}
        {bdmResult && (
          <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 8, padding: 16, margin: "16px 0" }}>
            <h3 style={{ margin: "0 0 10px", color: "#2e7d32" }}>🎲 報酬抽選結果</h3>
            <p style={{ margin: "4px 0" }}>
              <strong>抽選された試行：</strong>確率 {Math.round(bdmResult.selected.probability * 100)}%、
              選択肢B = ¥{bdmResult.selected.option_b_amount.toLocaleString()}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>あなたの選択：</strong>{bdmResult.outcomeLabel}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>パフォーマンス報酬：</strong>¥{bdmResult.reward.toLocaleString()}
            </p>
            <hr style={{ margin: "10px 0" }} />
            <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#1b5e20" }}>
              合計（基本謝礼 ¥1,000 + 報酬 ¥{bdmResult.reward.toLocaleString()}）
              ＝ <span style={{ fontSize: "1.3rem" }}>¥{bdmResult.total.toLocaleString()}</span>
            </p>
          </div>
        )}

        {/* Compliance (HIGH group) */}
        {compliance !== null && (
          <p style={{ color: "#555", fontSize: "0.9rem" }}>
            数字記憶チェック正答率：{compliance.toFixed(0)}%（{complianceLog.filter((c) => c.correct).length} / {complianceLog.length} 回正解）
          </p>
        )}

        {/* CSV Download */}
        <button
          onClick={downloadCSV}
          style={{ ...dlBtn, marginTop: 8 }}
        >
          📥 自分の回答データをダウンロード（CSV）
        </button>

        <p style={{ marginTop: 16, color: "#888", fontSize: "0.85rem" }}>
          参加者ID：<strong>{participantId}</strong><br />
          この画面は実験者がお呼びするまでそのままにしておいてください。
        </p>
      </div>
    </div>
  );
}

const dlBtn = {
  width: "100%", padding: "10px 16px", background: "#1976d2", color: "#fff",
  border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.95rem", fontWeight: 600,
};
