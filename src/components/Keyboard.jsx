import { useEffect } from "react";
import "./Keyboard.css";

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Enter','Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace']
];


const Keyboard = ({
  playerId,
  activePlayerId,
  onKeyPress,
  keyboardStates,
  isGameOver,
}) => {
  const isActivePlayer = playerId === activePlayerId;
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isGameOver || !isActivePlayer) {
        return;
      }

      const key = event.key;
      if (key === "Enter" || key === "Backspace" || /^[a-z]$/i.test(key)) {
        event.preventDefault();
        onKeyPress(playerId, key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActivePlayer, isGameOver, onKeyPress, playerId]);



    const handleClick = (key) => {
    if (!isGameOver) {
      onKeyPress(playerId, key.toUpperCase());
    }

    };

  return (
    <div className={`keyboard ${isActivePlayer ? "keyboard-active" : ""}`}>
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            const state = key.length === 1 ? keyboardStates[key] : "";

              return (
              <button
                key={key}
                onClick={() => handleClick(key)}
                className={`keyboard-key ${key === "Enter" || key === "Backspace" ? "keyboard-key-wide" : ""} ${state}`}
              >
                {key === "Backspace" ? "⌫" : key}
              </button>
            );
          })}
        </div>
        ))}
    </div>
  );
};

export default Keyboard;