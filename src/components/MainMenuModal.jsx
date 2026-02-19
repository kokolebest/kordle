import { useState } from "react";
import "./mainMenuModal.css";

const MainMenuModal = ({col, isMenuOpen}) => {

    const handleChange = (e) => {
        setCol(e.target.value);
    }

    return (
        <div className="mainMenu">
            <h4>longeur du mot à deviner</h4>
            <select onChange={handleChange}>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
            </select>
            <button class="btn-main-menu" onClick={() => setIsMenuOpen(false)}>GO!</button>

        </div>
    );
};

export default MainMenuModal;
