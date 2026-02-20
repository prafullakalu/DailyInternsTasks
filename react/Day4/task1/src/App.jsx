import { useSelector, useDispatch } from "react-redux";
import { Button, Typography, InputNumber, message } from "antd";
import { increment, decrement, reset, setValue } from "./features/counter/counterSlice";
import { useEffect, useState } from "react";

const { Title } = Typography;

function App() {
  const count = useSelector((state) => state.counter.count);
  const history = useSelector((state) => state.counter.history);
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState(null);

  useEffect(() => {
    if (count !== 0 && count % 10 === 0) {
      message.success(`🎉 Count reached ${count}!`);
    }
  }, [count]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <Title level={2}>{count}</Title>

      <div style={{ marginBottom: "20px" }}>
        <Button type="primary" onClick={() => dispatch(increment())}>
          Increment
        </Button>

        <Button
          style={{ marginLeft: "10px" }}
          danger
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </Button>

        <Button
          style={{ marginLeft: "10px" }}
          onClick={() => dispatch(reset())}
        >
          Reset
        </Button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <InputNumber
          value={inputValue}
          onChange={(value) => setInputValue(value)}
          placeholder="Set value"
        />

        <Button
          style={{ marginLeft: "10px" }}
          onClick={() => dispatch(setValue(inputValue))}
        >
          Set
        </Button>
      </div>

      <div>
        <Title level={4}>History</Title>
        <ul>
          {history.map((value, index) => (
            <li key={index}>{value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;