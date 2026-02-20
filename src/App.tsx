import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Grid from "./components/Grid";
import Keyboard from "./components/Keyboard";
import { getKeyboardStates } from "./utils";
import { getRandomWord } from "./wordService";
import MainMenuModal from "./components/MainMenuModal";

type PlayerId = "left" | "right";
type RoundStatus = "typing" | "waiting_for_both" | "revealed";

type PlayerRoundState = {
  guesses: string[];
  currentGuess: string;
  solution: string;
  submitted: boolean;
};

type PlayersState = Record<PlayerId, PlayerRoundState>;

const PLAYER_IDS: PlayerId[] = ["left", "right"];

const createInitialPlayerState = (): PlayerRoundState => ({
  guesses: [],
  currentGuess: "",
  solution: "",
  submitted: false,
});

const createInitialPlayersState = (): PlayersState => ({
  left: createInitialPlayerState(),
  right: createInitialPlayerState(),
});

function App() {
  const [players, setPlayers] = useState<PlayersState>(
    createInitialPlayersState,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [col, setCol] = useState(5);
  const [roundStatus, setRoundStatus] = useState<RoundStatus>("typing");
  const [roundNumber, setRoundNumber] = useState(1);

  useEffect(() => {
    const getSolutions = async () => {
      const [leftSolution, rightSolution] = await Promise.all([
        getRandomWord(col),
        getRandomWord(col),
      ]);

      setPlayers({
        left: {
          guesses: [],
          currentGuess: "",
          solution: leftSolution || "",
          submitted: false,
        },
        right: {
          guesses: [],
          currentGuess: "",
          solution: rightSolution || "",
          submitted: false,
        },
      });
      setRoundStatus("typing");
    };

    getSolutions();
  }, [col, roundNumber]);

  const handleKeyPress = (playerId: PlayerId, key: string) => {
    setPlayers((previousPlayers) => {
      if (roundStatus === "revealed") {
        return previousPlayers;
      }
      const activePlayer = previousPlayers[playerId];
      if (activePlayer.submitted || activePlayer.guesses.length === 6) {
        return previousPlayers;
      }

      if (key === "ENTER") {
        if (activePlayer.currentGuess.length !== col) {
          return previousPlayers;
        }

        const updatedPlayers: PlayersState = {
          ...previousPlayers,
          [playerId]: {
            ...activePlayer,
            guesses: [...activePlayer.guesses, activePlayer.currentGuess],
            currentGuess: "",
            submitted: true,
          },
        };

        const bothSubmitted = PLAYER_IDS.every(
          (id) => updatedPlayers[id].submitted,
        );
        setRoundStatus(bothSubmitted ? "revealed" : "waiting_for_both");

        if (bothSubmitted) {
          const leftWon =
            updatedPlayers.left.guesses.at(-1)?.toLowerCase() ===
            updatedPlayers.left.solution;
          const rightWon =
            updatedPlayers.right.guesses.at(-1)?.toLowerCase() ===
            updatedPlayers.right.solution;

          setTimeout(() => {
            if (leftWon && rightWon) {
              alert("Both players solved their word!");
            } else if (leftWon) {
              alert("Left player wins this round!");
            } else if (rightWon) {
              alert("Right player wins this round!");
            } else {
              alert("No one solved their word this round.");
            }
          }, 300);
        }
        return updatedPlayers;
      }
      if (key === "BACKSPACE") {
        return {
          ...previousPlayers,
          [playerId]: {
            ...activePlayer,
            currentGuess: activePlayer.currentGuess.slice(0, -1),
          },
        };
      }

      if (activePlayer.currentGuess.length >= col) {
        return previousPlayers;
      }

      return {
        ...previousPlayers,
        [playerId]: {
          ...activePlayer,
          currentGuess: activePlayer.currentGuess + key,
        },
      };
    });
  };

  const handleNewGame = (nextCol: number) => {
    setCol(nextCol);
    setRoundNumber(1);
    setRoundStatus("typing");
    setPlayers(createInitialPlayersState());
    setIsMenuOpen(false);
  };

  const handleNextRound = () => {
    if (roundStatus !== "revealed") {
      return;
    }

    setRoundNumber((previousRound) => previousRound + 1);
  };

  const keyboardStates = useMemo(
    () => ({
      left: getKeyboardStates(players.left.guesses, players.left.solution),
      right: getKeyboardStates(players.right.guesses, players.right.solution),
    }),
    [players],
  );

  return (
    <div className="app">
      <button className="btn-menu" onClick={() => setIsMenuOpen(true)}>
        New game?
      </button>
      <p>Round {roundNumber}</p>
      <p>Status: {roundStatus}</p>

      {PLAYER_IDS.map((playerId) => (
        <section key={playerId}>
          <h2>{playerId === "left" ? "Left player" : "Right player"}</h2>
          <Grid
            guesses={players[playerId].guesses}
            currentGuess={players[playerId].currentGuess}
            solution={players[playerId].solution}
            col={col}
          />
          <Keyboard
            isGameOver={
              players[playerId].submitted || roundStatus === "revealed"
            }
            onKeyPress={(key: string) => handleKeyPress(playerId, key)}
            keyboardStates={keyboardStates[playerId]}
          />
        </section>
      ))}

      {roundStatus === "revealed" && (
        <button className="btn-menu" onClick={handleNextRound}>
          Next round
        </button>
      )}

      {isMenuOpen && <MainMenuModal col={col} handleClick={handleNewGame} />}
    </div>
  );
}

export default App;
