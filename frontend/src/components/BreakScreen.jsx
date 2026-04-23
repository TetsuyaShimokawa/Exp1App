export default function BreakScreen({ remainingBlocks, condition, digitString, onContinue }) {
  return (
    <div className="screen center-screen">
      <div className="center-card">
        <h2>休憩</h2>
        <p>残り {remainingBlocks} ブロックあります。</p>
        <p>準備ができたら「続ける」を押してください。</p>

        {condition === "HIGH" && (
          <div className="digit-banner" style={{ width: "100%" }}>
            <p className="label">引き続き覚えておく数字</p>
            <p className="digit-string">{digitString}</p>
          </div>
        )}

        <button className="btn-primary btn-full" onClick={onContinue}>
          続ける
        </button>
      </div>
    </div>
  );
}
