import { useDispatch, useSelector } from "react-redux"
import { Button, Space, Statistic, Switch, Card } from "antd"
import "./CounterAntd.css"
import { PlusOutlined, MinusOutlined, ReloadOutlined } from "@ant-design/icons"
import { increment, decrement, reset, toggleLock } from "../feture/counterSlice"

function CounterAntd() {
  const dispatch = useDispatch()
  const { value, locked } = useSelector((state) => state.counter)

  return (
    <Card className="counter-card" style={{ width: 400, margin: "50px auto", textAlign: "center" }}>
      <Statistic title="Global Counter" value={value} />

      <Space style={{ marginTop: 20 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => dispatch(increment())}
          disabled={locked}
        >
          Increment
        </Button>

        <Button
          danger
          icon={<MinusOutlined />}
          onClick={() => dispatch(decrement())}
          disabled={locked}
        >
          Decrement
        </Button>

        <Button
          icon={<ReloadOutlined />}
          onClick={() => dispatch(reset())}
        >
          Reset
        </Button>
      </Space>

      <div style={{ marginTop: 20 }}>
        <Switch
          checked={locked}
          onChange={() => dispatch(toggleLock())}
        />
        <span style={{ marginLeft: 10 }}>
          {locked ? "Locked" : "Unlocked"}
        </span>
      </div>
    </Card>
  )
}

export default CounterAntd