import { useState } from "react";
import { startSession, saveResult } from "./api/api";
import SetupScreen from "./components/SetupScreen";
import InstructionScreen from "./components/InstructionScreen";
import DigitCheckScreen from "./components/DigitCheckScreen";
import MPLScreen from "./components/MPLScreen";
import BreakScreen from "./components/BreakScreen";
import FinalDigitCheckScreen from "./components/FinalDigitCheckScreen";
import FinishScreen from "./components/FinishScreen";
import "./App.css";

// App screens enum
const SCREEN = {
  SETUP: "SETUP",
  INSTRUCTION: "INSTRUCTION",
  DIGIT_CHECK: "DIGIT_CHECK",
  MPL: "MPL",
  BREAK: "BREAK",
  FINAL_DIGIT_CHECK: "FINAL_DIGIT_CHECK",
  FINISH: "FINISH",
};

export default function App() {
  const [screen, setScreen] = useState(SCREEN.SETUP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Session data
  const [sessionId, setSessionId] = useState(null);
  const [participantId, setParticipantId] = useState("");
  const [condition, setCondition] = useState("LOW");
  const [digitString, setDigitString] = useState("");

  // Trial data — grouped by probability block
  // blocks: Array of Array<trial> — each inner array is one probability block
  const [blocks, setBlocks] = useState([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

  // ---- Setup ----
  async function handleSetup(pid, name) {
    setLoading(true);
    setError(null);
    try {
      const data = await startSession(pid, name);
      setSessionId(data.session_id);
      setParticipantId(pid);
      setCondition(data.condition);
      setDigitString(data.digit_string || "");

      // Group trials by block number (already ordered by server)
      const blockMap = new Map();
      for (const trial of data.trials) {
        if (!blockMap.has(trial.block)) blockMap.set(trial.block, []);
        blockMap.get(trial.block).push(trial);
      }
      // Sort blocks by block number, sort rows within each block
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

  // ---- Instruction → next ----
  function handleInstructionNext() {
    if (condition === "HIGH") {
      setScreen(SCREEN.DIGIT_CHECK);
    } else {
      setScreen(SCREEN.MPL);
    }
  }

  // ---- Digit check (pre-task) passed ----
  function handleDigitCheckPass() {
    setScreen(SCREEN.MPL);
  }

  // ---- MPL block complete ----
  async function handleBlockComplete(rowResults) {
    setSaving(true);
    try {
      // Save each row result to backend
      const savePromises = rowResults.map((r) =>
        saveResult({
          session_id: sessionId,
          participant_id: participantId,
          condition: condition,
          trial_id: r.trial_id,
          probability: r.probability,
          row: r.row,
          option_b_amount: r.option_b_amount,
          choice: r.choice,
          response_time_ms: r.response_time_ms,
        })
      );
      await Promise.all(savePromises);

      const nextBlockIndex = currentBlockIndex + 1;

      if (nextBlockIndex >= blocks.length) {
        // All blocks done
        if (condition === "HIGH") {
          setScreen(SCREEN.FINAL_DIGIT_CHECK);
        } else {
          setScreen(SCREEN.FINISH);
        }
      } else {
        setCurrentBlockIndex(nextBlockIndex);
        setScreen(SCREEN.BREAK);
      }
    } catch (e) {
      // Non-fatal: alert and allow continue
      alert(`結果の保存中にエラーが発生しました: ${e.message}\n再試行してください。`);
    } finally {
      setSaving(false);
    }
  }

  // ---- Break → continue ----
  function handleBreakContinue() {
    setScreen(SCREEN.MPL);
  }

  // ---- Final digit check passed ----
  function handleFinalDigitPass() {
    setScreen(SCREEN.FINISH);
  }

  const remainingBlocks = blocks.length - currentBlockIndex - 1;

  switch (screen) {
    case SCREEN.SETUP:
      return (
        <SetupScreen onSetup={handleSetup} loading={loading} error={error} />
      );

    case SCREEN.INSTRUCTION:
      return (
        <InstructionScreen
          condition={condition}
          digitString={digitString}
          onNext={handleInstructionNext}
        />
      );

    case SCREEN.DIGIT_CHECK:
      return (
        <DigitCheckScreen
          digitString={digitString}
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
          digitString={digitString}
          onBlockComplete={handleBlockComplete}
          saving={saving}
        />
      );

    case SCREEN.BREAK:
      return (
        <BreakScreen
          remainingBlocks={remainingBlocks}
          condition={condition}
          digitString={digitString}
          onContinue={handleBreakContinue}
        />
      );

    case SCREEN.FINAL_DIGIT_CHECK:
      return (
        <FinalDigitCheckScreen
          digitString={digitString}
          onPass={handleFinalDigitPass}
        />
      );

    case SCREEN.FINISH:
      return <FinishScreen participantId={participantId} />;

    default:
      return null;
  }
}
