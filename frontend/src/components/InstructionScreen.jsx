export default function InstructionScreen({ condition, digitString, onNext }) {
  return (
    <div className="screen">
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a2e" }}>
        実験の説明
      </h2>

      <div className="card">
        <p style={{ fontWeight: 700, fontSize: "1.05rem" }}>
          これはお金に関する選択課題です。
        </p>
        <ul className="instruction-list">
          <li>
            各問いで、<span className="option-a-text">選択肢A</span>（くじ）と
            <span className="option-b-text"> 選択肢B</span>（確実な金額）を比べ、
            どちらが好ましいかを選んでください。
          </li>
          <li>
            <span className="option-a-text">選択肢A</span>：確率 <em>p</em> で
            ¥1,000 を受け取り、それ以外の場合は ¥0 になるくじです。
          </li>
          <li>
            <span className="option-b-text">選択肢B</span>：確実に受け取れる金額です。
          </li>
          <li>
            各確率ブロックには10行の選択肢があります。全行を選んでから「次へ」を押してください。
          </li>
          <li>正解・不正解はありません。あなたの正直な好みを選んでください。</li>
        </ul>
      </div>

      {condition === "HIGH" && (
        <div className="digit-box-prominent">
          <p className="label">
            ⚠️ 以下の7桁の数字を実験中ずっと覚えてください
          </p>
          <p className="digit-display">{digitString}</p>
        </div>
      )}

      <button className="btn-primary btn-full" onClick={onNext}>
        {condition === "HIGH" ? "数字を覚えたら、次へ進む" : "実験を開始する"}
      </button>
    </div>
  );
}
