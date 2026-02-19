export const getRandomWord = async (col) => {
  try {
    const response = await fetch(
      `https://random-word-api.herokuapp.com/word?length=${col}`,
    );

    const [word] = await response.json();
    return word;
  } catch (e) {
    console.error("Error:", e);
  }
};
