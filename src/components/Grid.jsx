import "./Grid.css";
import {getLetterStates} from "../utils";



const Grid = ({ guesses, currentGuess, solution, col }) => {
  const rows = 6;
  const cols = col;

  const allGuesses = [...guesses];
  if (currentGuess) {
    allGuesses.push(currentGuess);
  }
  while (allGuesses.length < rows) {
    allGuesses.push('');
  }

  return (
    <div className="grid">
      {Array(rows)
        .fill()
        .map((_, rowIndex) => {
          const isComplete = guesses.length > rowIndex;
          const states = isComplete ? getLetterStates(allGuesses[rowIndex], solution) : Array(5).fill('');
          return (
            <div key={rowIndex} className="row">
              {Array(cols)
                .fill()
                .map((_, colIndex) => {
                  const letter = allGuesses[rowIndex]?.[colIndex] || "";
                  const letterState = states[colIndex];
                  return (
                    <div key={`${rowIndex}-${colIndex}`} className={`cell cell-${letterState}`}>
                      {letter}
                    </div>
                  );
                })}
            </div>
          );
        })}
    </div>
  );
};

export default Grid;
