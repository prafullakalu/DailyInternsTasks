import { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GlobalSearch.css";

const initialState = {
  data: [],
  loading: false,
  error: null
};

function searchReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };

    case "FETCH_SUCCESS":
      return { data: action.payload, loading: false, error: null };

    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

function GlobalSearch() {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (value) => {
    setQuery(value);

    if (!value.trim()) {
      dispatch({ type: "FETCH_SUCCESS", payload: [] });
      return;
    }

    dispatch({ type: "FETCH_START" });

    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users?q=${value}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (error) {
      dispatch({ type: "FETCH_ERROR", payload: error.message });
    }
  };

  return (
    <div className="searchContainer">
      <h1>User Directory</h1>

      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="searchInput"
      />

      {state.loading && <p className="loadingText">Searching...</p>}

      {state.error && (
        <p className="errorText">{state.error}</p>
      )}

      {!state.loading && state.data.length === 0 && query && (
        <p>No users found.</p>
      )}

      <div className="resultList">
        {state.data.map((user) => (
          <div
            key={user.id}
            className="resultCard"
            onClick={() => navigate(`/user/${user.id}`)}
          >
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GlobalSearch;
