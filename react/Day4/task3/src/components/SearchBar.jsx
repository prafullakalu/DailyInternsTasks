import { Input } from "antd";
import { useDispatch } from "react-redux";
import { fetchShows } from "../features/shows/showsSlice";

const { Search } = Input;

function SearchBar() {
  const dispatch = useDispatch();

  const handleSearch = (value) => {
    if (value.trim()) {
      dispatch(fetchShows(value));
    }
  };

  return (
    <Search
      placeholder="Search TV shows..."
      enterButton
      onSearch={handleSearch}
    />
  );
}

export default SearchBar;