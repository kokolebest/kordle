import { useState } from "react";
import "./MainMenuModal.css";

const MainMenuModal = ({col, handleClick}) => {
    const [selectedCol, setSelectedCol] = useState(col);

    const handleChange = (e) => {
        setSelectedCol(Number(e.target.value));
    }

    return (
    <div className="mainMenu">
      <h4>longeur du mot à deviner</h4>
      <select value={selectedCol} onChange={handleChange}>
        <option value={4}>4</option>
        <option value={5}>5</option>
        <option value={6}>6</option>
      </select>
      <button className="btn-main-menu" onClick={() => handleClick(selectedCol)}>
        GO!
      </button>
    </div>
  );
};

export default MainMenuModal;
