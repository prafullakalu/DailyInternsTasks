import { useReducer, useState } from "react";
import "./ComplexCounter.css";

const initialState = {
  count: 0,
  history: []
};

function counterReducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return {
        count: state.count + 1,
        history: [...state.history, state.count]
      };

    case "DECREMENT":
      return {
        count: state.count - 1,
        history: [...state.history, state.count]
      };

    case "RESET":
      return {
        count: 0,
        history: [...state.history, state.count]
      };

    case "SET_VALUE":
      return {
        count: Number(action.payload),
        history: [...state.history, state.count]
      };

    default:
      return state;
  }
}

function ComplexCounter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="counterContainer">
      <h2 className="countDisplay">{state.count}</h2>

      <div className="buttonGroup">
        <button onClick={() => dispatch({ type: "INCREMENT" })}>
          Increment
        </button>

        <button onClick={() => dispatch({ type: "DECREMENT" })}>
          Decrement
        </button>

        <button onClick={() => dispatch({ type: "RESET" })}>
          Reset
        </button>
      </div>

      <div className="inputSection">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Set value"
        />
        <button
          onClick={() =>
            dispatch({ type: "SET_VALUE", payload: inputValue })
          }
        >
          Set
        </button>
      </div>

      <div className="historySection">
        <h3>History:</h3>
        <ul>
          {state.history.map((value, index) => (
            <li key={index}>{value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ComplexCounter;
