import React from "react";

const ListItem = React.memo(
  function ListItem({ item, onDelete }) {
  console.log("Rendering:", item.name);

  return (
    <div className="listItem">
      <span>{item.name}</span>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  );
});

export default ListItem;
