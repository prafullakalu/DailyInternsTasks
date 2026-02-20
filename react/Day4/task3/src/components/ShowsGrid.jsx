import { useSelector } from "react-redux";
import { Row, Col, Card, Spin, Alert } from "antd";

function ShowsGrid() {
  const { shows, loading, error } = useSelector(
    (state) => state.shows
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <Row gutter={[16, 16]} style={{ marginTop: "30px" }}>
      {shows.map((show) => (
        <Col key={show.id} xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            cover={
              <img
                alt={show.name}
                src={
                  show.image?.medium ||
                  "https://via.placeholder.com/210x295?text=No+Image"
                }
              />
            }
          >
            <Card.Meta
              title={show.name}
              description={show.premiered || "No release date"}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default ShowsGrid;