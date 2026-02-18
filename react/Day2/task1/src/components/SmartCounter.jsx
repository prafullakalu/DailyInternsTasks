import { useState, useEffect } from "react";
import "./SmartCounter.css";

function SmartCounter() {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let intervalId;

    if (isActive) {
      intervalId = setInterval(() => {
        setCount((prevCount) => prevCount + 1);
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isActive]);

  const toggleCounter = () => {
    setIsActive((prevState) => !prevState);
  };

  const resetCounter = () => {
    setCount(0);
    setIsActive(false);
  };

  return (
    <div className="counterContainer">
      <h1 className="title">Smart Counter</h1>

      <div className="countDisplay">{count}</div>

      <div className="buttonGroup">
        <button className="startButton" onClick={toggleCounter}>
          {isActive ? "Pause" : "Start"}
        </button>

        <button className="resetButton" onClick={resetCounter}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default SmartCounter;
