import { useParams } from "react-router-dom";
import "./Pages.css";

function UserDetail() {
  const { id } = useParams();

  return (
    <div className="pageContainer">
      <h1>User Detail Page</h1>
      <div className="userCard">
        <p>User ID:</p>
        <h2>{id}</h2>
      </div>
    </div>
  );
}

export default UserDetail;
