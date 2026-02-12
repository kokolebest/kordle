export const getRandomWord = async () => {
  try {
    const response = await fetch(
      "https://random-word-api.herokuapp.com/word?length=5",
    );

    const [word] = await response.json();
    return word;
  } catch (e) {
    console.error("Error:", e);
  }
};
