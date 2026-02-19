import { useEffect, useState, useCallback } from "react";
import "./LiveNews.css";

function LiveNews() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts"
      );

      const data = await response.json();

      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="newsContainer">
      <div className="headerSection">
        <h1>Live News</h1>
        <button
          type="button"
          onClick={(e) => {
            e && e.preventDefault();
            fetchPosts();
          }}
        >
          Refresh
        </button>
      </div>

      {loading && <p className="loadingText">Loading...</p>}

      {!loading && (
        <div className="postGrid">
          {posts.map((post) => (
            <div key={post.id} className="postCard">
              <h3>{post.title}</h3>
              <p>{post.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LiveNews;
