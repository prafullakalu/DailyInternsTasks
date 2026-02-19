import { Routes, Route } from "react-router-dom";
import GlobalSearch from "./components/GlobalSearch";
import UserDetail from "./pages/UserDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<GlobalSearch />} />
      <Route path="/user/:id" element={<UserDetail />} />
    </Routes>
  );
}

export default App;
