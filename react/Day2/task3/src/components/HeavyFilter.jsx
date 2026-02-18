import { useState, useMemo } from "react";
import "./HeavyFilter.css";


const massiveList = Array.from({ length: 5000 }, (_, index) => {
  return `Item Number ${index + 1}`;
});

function HeavyFilter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const filteredItems = useMemo(() => {
    console.log("Filtering heavy list...");

    return massiveList.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase().trim().replace(/\s+/g, " "))
    );
  }, [searchTerm]);


  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);
  };

  return (
    <div className={isDarkTheme ? "container dark" : "container light"}>
      <h1 className="title">Heavy Lifter Filter</h1>

      <input
        type="text"
        placeholder="Search items..."
        className="searchInput"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <button className="themeButton" onClick={toggleTheme}>
        Toggle {isDarkTheme ? "Light" : "Dark"} Mode
      </button>

      <div className="results">
        <p className="resultCount">
          Results: {filteredItems.length}
        </p>

        <ul>
          {filteredItems.slice(0, 20).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default HeavyFilter;
