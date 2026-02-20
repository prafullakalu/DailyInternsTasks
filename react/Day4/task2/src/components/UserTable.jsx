import { useSelector, useDispatch } from "react-redux";
import { Table, Button, Popconfirm, Tag } from "antd";
import { deleteUser } from "../features/users/usersSlice";

function UsersTable() {
  const users = useSelector((state) => state.users.users);
  const dispatch = useDispatch();

  const handleDelete = (id) => {
    dispatch(deleteUser(id));
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: "Admin", value: "Admin" },
        { text: "Editor", value: "Editor" },
        { text: "Viewer", value: "Viewer" }
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => {
        const color =
          role === "Admin"
            ? "red"
            : role === "Editor"
            ? "blue"
            : "green";
        return <Tag color={color}>{role}</Tag>;
      }
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      pagination={{ pageSize: 5 }}
      bordered
    />
  );
}

export default UsersTable;