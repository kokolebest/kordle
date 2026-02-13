import { useEffect, useState } from "react";
import "./App.css";
import Grid from "./components/Grid";
import Keyboard from "./components/Keyboard";
import { getKeyboardStates } from "./utils";
import { getRandomWord } from "./wordService";
import MainMenuModal from "./components/MainMenuModal";

function App() {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [solution, setSolution] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [col, setCol] = useState(5);

  useEffect(() => {
    const getSolution = async () => {
      const newSolution = await getRandomWord();
      setSolution(newSolution);
    };

    getSolution();
  }, []);

  console.log(solution);

  const handleKeyPress = (key: string) => {
    if (guesses.length === 6) {
      return;
    }

    if (key === "ENTER") {
      if (currentGuess.length === 5) {
        setGuesses([...guesses, currentGuess]);
        if (currentGuess.toLowerCase() === solution) {
          setTimeout(() => {
            alert("T'as gagné!");
          }, 500);
          setIsGameOver(true);
        } else if (guesses.length === 5) {
          setTimeout(() => {
            alert(`Yikes tu suces le mot était "${solution}"!`);
          }, 500);
        }
      }
      setCurrentGuess("");
    } else if (key === "BACKSPACE") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const keyboardStates = getKeyboardStates(guesses, solution);

  return (
    <div className="app">
      <button className="btn-menu" onClick={() => setIsMenuOpen(true)}>
        New game?
      </button>
      <Grid guesses={guesses} currentGuess={currentGuess} solution={solution} />
      <Keyboard
        isGameOver={isGameOver}
        onKeyPress={handleKeyPress}
        keyboardStates={keyboardStates}
      />
      {isMenuOpen && <MainMenuModal col={col} />}
    </div>
  );
}

export default App;
