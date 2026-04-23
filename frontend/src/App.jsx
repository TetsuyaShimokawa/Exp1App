import { useState } from "react";
import { startSession, saveResult } from "./api/api";
import SetupScreen from "./components/SetupScreen";
import InstructionScreen from "./components/InstructionScreen";
import DigitCheckScreen from "./components/DigitCheckScreen";
import MPLScreen from "./components/MPLScreen";
import BreakScreen from "./components/BreakScreen";
import FinishScreen from "./components/FinishScreen";
import "./App.css";

const SCREEN = {
  SETUP: "SETUP",
  INSTRUCTION: "INSTRUCTION",
  DIGIT_CHECK: "DIGIT_CHECK",
  MPL: "MPL",
  BREAK: "BREAK",
  FINISH: "FINISH",
};

/** BDM: pick one random choice, resolve reward */
function computeBDM(allChoices) {
  if (!allChoices.length) return null;
  const selected = allChoices[Math.floor(Math.random() * allChoices.length)];
  let reward = 0;
  let outcomeLabel = "";
  if (selected.choice === "B") {
    reward = selected.option_b_amount;
    outcomeLabel = `選択肢B（確実に ${reward}円）`;
  } else {
    const hit = Math.random() < selected.probability;
    reward = hit ? 1000 : 0;
    outcomeLabel = hit
      ? `選択肢A（くじ当たり → 1,000円）`
      : `選択肢A（くじ外れ → 0円）`;
  }
  return {
    selected,
    reward,
    outcomeLabel,
    total: reward + 1000,
  };
}

export default function App() {
  const [screen, setScreen] = useState(SCREEN.SETUP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [participantId, setParticipantId] = useState("");
  const [condition, setCondition] = useState("LOW");
  const [digitStrings, setDigitStrings] = useState([]); // per-block digit strings
  const [blocks, setBlocks] = useState([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

  // Compliance tracking
  const [complianceLog, setComplianceLog] = useState([]); // {blockIdx, typed, correct}

  // All choices for BDM
  const [allChoices, setAllChoices] = useState([]);
  const [bdmResult, setBdmResult] = useState(null);

  async function handleSetup(pid, name) {
    setLoading(true);
    setError(null);
    try {
      const data = await startSession(pid, name);
      setSessionId(data.session_id);
      setParticipantId(pid);
      setCondition(data.condition);
      setDigitStrings(data.digit_strings || []);

      const blockMap = new Map();
      for (const trial of data.trials) {
        if (!blockMap.has(trial.block)) blockMap.set(trial.block, []);
        blockMap.get(trial.block).push(trial);
      }
      const sortedBlocks = Array.from(blockMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([, trials]) => trials.sort((x, y) => x.row - y.row));
      setBlocks(sortedBlocks);
      setCurrentBlockIndex(0);
      setScreen(SCREEN.INSTRUCTION);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleInstructionNext() {
    if (condition === "HIGH") {
      setScreen(SCREEN.DIGIT_CHECK); // confirm initial digit
    } else {
      setScreen(SCREEN.MPL);
    }
  }

  function handleDigitCheckPass() {
    setScreen(SCREEN.MPL);
  }

  async function handleBlockComplete(rowResults) {
    setSaving(true);
    try {
      await Promise.all(
        rowResults.map((r) =>
          saveResult({
            session_id: sessionId,
            participant_id: participantId,
            condition,
            trial_id: r.trial_id,
            probability: r.probability,
            row: r.row,
            option_b_amount: r.option_b_amount,
            choice: r.choice,
            response_time_ms: r.response_time_ms,
          })
        )
      );
      setAllChoices((prev) => [...prev, ...rowResults]);

      const nextBlockIndex = currentBlockIndex + 1;
      if (nextBlockIndex >= blocks.length) {
        // All blocks done — compute BDM and finish
        const allC = [...allChoices, ...rowResults];
        setBdmResult(computeBDM(allC));
        setScreen(SCREEN.FINISH);
      } else {
        setCurrentBlockIndex(nextBlockIndex);
        setScreen(SCREEN.BREAK);
      }
    } catch (e) {
      alert(`保存エラー: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  /** Called from BreakScreen after digit recall attempt */
  function handleBreakDone(typedDigit) {
    if (condition === "HIGH" && typedDigit !== undefined) {
      const expected = digitStrings[currentBlockIndex - 1] || "";
      setComplianceLog((prev) => [
        ...prev,
        {
          blockIdx: currentBlockIndex - 1,
          typed: typedDigit,
          correct: typedDigit.trim() === expected,
        },
      ]);
    }
    setScreen(SCREEN.MPL);
  }

  const currentDigit = digitStrings[currentBlockIndex] || "";
  const nextDigit =
    currentBlockIndex + 1 < digitStrings.length
      ? digitStrings[currentBlockIndex + 1]
      : null;
  // digit shown in break = digit for completed block
  const breakCheckDigit = digitStrings[currentBlockIndex - 1] || "";
  const breakNextDigit = currentDigit; // next block's digit

  switch (screen) {
    case SCREEN.SETUP:
      return <SetupScreen onSetup={handleSetup} loading={loading} error={error} />;

    case SCREEN.INSTRUCTION:
      return (
        <InstructionScreen
          condition={condition}
          digitString={currentDigit}
          onNext={handleInstructionNext}
        />
      );

    case SCREEN.DIGIT_CHECK:
      return (
        <DigitCheckScreen
          digitString={currentDigit}
          onPass={handleDigitCheckPass}
          phase="pre"
        />
      );

    case SCREEN.MPL:
      return (
        <MPLScreen
          blockTrials={blocks[currentBlockIndex] || []}
          blockIndex={currentBlockIndex}
          totalBlocks={blocks.length}
          condition={condition}
          digitString={currentDigit}
          onBlockComplete={handleBlockComplete}
          saving={saving}
        />
      );

    case SCREEN.BREAK:
      return (
        <BreakScreen
          remainingBlocks={blocks.length - currentBlockIndex}
          condition={condition}
          checkDigit={breakCheckDigit}
          nextDigit={breakNextDigit}
          onContinue={handleBreakDone}
        />
      );

    case SCREEN.FINISH:
      return (
        <FinishScreen
          participantId={participantId}
          bdmResult={bdmResult}
          complianceLog={complianceLog}
          condition={condition}
          allChoices={allChoices}
        />
      );

    default:
      return null;
  }
}
