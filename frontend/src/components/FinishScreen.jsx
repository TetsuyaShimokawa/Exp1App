export default function FinishScreen({ participantId }) {
  return (
    <div className="screen center-screen">
      <div className="center-card">
        <h2>実験完了</h2>
        <p>ご参加ありがとうございました。</p>
        <p>以下の参加者IDを実験者にお伝えください。</p>
        <div className="participant-id-display">{participantId}</div>
        <p style={{ fontSize: "0.85rem", color: "#888" }}>
          画面はそのままにしておいてください。
        </p>
      </div>
    </div>
  );
}
