import { Table, Button, Popconfirm, message } from "antd"
import "./InventoryTable.css"
import { useDispatch, useSelector } from "react-redux"
import { deleteRow } from "../feture/deleterowSlice"

function InventoryTable() {
  const dispatch = useDispatch()
  const data = useSelector((state) => state.deleteRow.data)

  const handleDelete = (id) => {
    dispatch(deleteRow(id))
    message.success("Row deleted successfully")
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: "Price ($)",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this row?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary" danger>
            Delete
          </Button>
        </Popconfirm>
      )
    }
  ]

  return (
    <Table
      className="inventory-table"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ pageSize: 5 }}
    />
  )
}

export default InventoryTable