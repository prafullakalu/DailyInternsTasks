import { useState, useEffect, useCallback } from "react";
import ListItem from "./ListItem";
import "./Dashboard.css";


function Dashboard() {
  const [items, setItems] = useState([
    { id: 1, name: "Laptop" },
    { id: 2, name: "Phone" },
    { id: 3, name: "Tablet" }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Update time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleDelete = useCallback((id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  return (
    <div className="dashboardContainer">
      <h1>Optimized Dashboard</h1>

      <div className="timeDisplay">
        Current Time: {currentTime}
      </div>

      <div className="listContainer">
        {items.map((item) => (
          <ListItem
            key={item.id}
            item={item}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
