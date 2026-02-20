import SearchBar from "./components/SearchBar";
import ShowsGrid from "./components/ShowsGrid";

function App() {
  return (
    <div style={{ padding: "40px" }}>
      <h2>TV Show Search</h2>
      <SearchBar />
      <ShowsGrid />
    </div>
  );
}

export default App;