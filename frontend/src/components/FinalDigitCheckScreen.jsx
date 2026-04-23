import DigitCheckScreen from "./DigitCheckScreen";

export default function FinalDigitCheckScreen({ digitString, onPass }) {
  return (
    <DigitCheckScreen
      digitString={digitString}
      onPass={onPass}
      phase="final"
    />
  );
}
