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
  lockedGuess: string;
  solution: string;
  submitted: boolean;
  outcome: "playing" | "won" | "lost";
};

type PlayersState = Record<PlayerId, PlayerRoundState>;

const PLAYER_IDS: PlayerId[] = ["left", "right"];

const createInitialPlayerState = (): PlayerRoundState => ({
  guesses: [],
  currentGuess: "",
  lockedGuess: "",
  solution: "",
  submitted: false,
  outcome: "playing",
});

const createInitialPlayersState = (): PlayersState => ({
  left: createInitialPlayerState(),
  right: createInitialPlayerState(),
});

function App() {
  const [players, setPlayers] = useState<PlayersState>(
    createInitialPlayersState,
  );
  const [activePlayerId, setActivePlayerId] = useState<PlayerId>("left");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [col, setCol] = useState(5);
  const [roundStatus, setRoundStatus] = useState<RoundStatus>("typing");
  const [currentRow, setCurrentRow] = useState(0);

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
          lockedGuess: "",
          solution: leftSolution || "",
          submitted: false,
          outcome: "playing",
        },
        right: {
          guesses: [],
          currentGuess: "",
          lockedGuess: "",
          solution: rightSolution || "",
          submitted: false,
          outcome: "playing",
        },
      });
      setCurrentRow(0);
      setRoundStatus("typing");
      setActivePlayerId("left");
    };

    getSolutions();
  }, [col]);

  useEffect(() => {
    if (roundStatus !== "revealed") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPlayers((previousPlayers) => {
        const updatedPlayers: PlayersState = {
          left: { ...previousPlayers.left },
          right: { ...previousPlayers.right },
        };

        PLAYER_IDS.forEach((playerId) => {
          const player = previousPlayers[playerId];
          const lastGuess = player.guesses.at(-1)?.toLowerCase();
          const won = player.outcome === "won" || lastGuess === player.solution;
          const lost =
            player.outcome === "lost" || (!won && player.guesses.length >= 6);

          updatedPlayers[playerId] = {
            ...player,
            currentGuess: "",
            lockedGuess: "",
            submitted: false,
            outcome: won ? "won" : lost ? "lost" : "playing",
          };
        });

        return updatedPlayers;
      });

      setCurrentRow((previousRow) => previousRow + 1);
      setRoundStatus("typing");
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [roundStatus]);

  const handleKeyPress = (playerId: PlayerId, key: string) => {
    setPlayers((previousPlayers) => {
      if (roundStatus === "revealed") {
        return previousPlayers;
      }
      const activePlayer = previousPlayers[playerId];
      if (
        activePlayer.submitted ||
        activePlayer.outcome !== "playing" ||
        activePlayer.guesses.length === 6
      ) {
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
            lockedGuess: activePlayer.currentGuess,
            currentGuess: "",
            submitted: true,
          },
        };

        const bothSubmitted = PLAYER_IDS.every(
          (id) => updatedPlayers[id].submitted,
        );
        setRoundStatus(bothSubmitted ? "revealed" : "waiting_for_both");

        if (!bothSubmitted) {
          return updatedPlayers;
        }
        return {
          left: {
            ...updatedPlayers.left,
            guesses: [
              ...updatedPlayers.left.guesses,
              updatedPlayers.left.lockedGuess,
            ],
          },
          right: {
            ...updatedPlayers.right,
            guesses: [
              ...updatedPlayers.right.guesses,
              updatedPlayers.right.lockedGuess,
            ],
          },
        };
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
    setCurrentRow(0);
    setRoundStatus("typing");
    setPlayers(createInitialPlayersState());
    setIsMenuOpen(false);
    setActivePlayerId("left");
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
      <p>Row {currentRow + 1}</p>
      <p>Status: {roundStatus}</p>

      {PLAYER_IDS.map((playerId) => (
        <section
          key={playerId}
          className={`player-panel ${activePlayerId === playerId ? "player-panel-active" : ""}`}
          onClick={() => setActivePlayerId(playerId)}
          onFocusCapture={() => setActivePlayerId(playerId)}
          tabIndex={0}
        >
          <h2>{playerId === "left" ? "Left player" : "Right player"}</h2>
          <p>Outcome: {players[playerId].outcome}</p>
          <Grid
            guesses={players[playerId].guesses}
            currentGuess={players[playerId].currentGuess}
            solution={players[playerId].solution}
            col={col}
            isActive={activePlayerId === playerId}
          />
          <Keyboard
            playerId={playerId}
            activePlayerId={activePlayerId}
            isGameOver={
              players[playerId].submitted ||
              roundStatus === "revealed" ||
              players[playerId].outcome !== "playing"
            }
            onKeyPress={handleKeyPress}
            keyboardStates={keyboardStates[playerId]}
          />
        </section>
      ))}

      {isMenuOpen && <MainMenuModal col={col} handleClick={handleNewGame} />}
    </div>
  );
}

export default App;
