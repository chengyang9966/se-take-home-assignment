import { Button, Col, List, Row, Tag, Typography } from "antd";
import { useOrderStore } from "../store/OrderStore";
import dayjs from "dayjs";
import CustomTag from "../components/Tag";
import CustomList from "../components/List";
import { defaultDateTimeFormat } from "../helper/dateTime";

const HomePage = () => {
  const {
    addOrder,
    pendingOrders,
    completedOrders,
    removeOrder,
    numbersOfBots,
    addBot,
    removeBot,
    bots,
  } = useOrderStore();
  return (
    <Row gutter={16}>
      <Col span={12}>
        <Typography.Title level={3}>Orders</Typography.Title>
        <Row justify={"space-between"}>
          <Button
            onClick={() =>
              addOrder({
                type: "NORMAL",
                status: "PENDING",
                orderProcessingTime: 10,
              })
            }
          >
            New Normal Order
          </Button>
          <Button
            onClick={() =>
              addOrder({
                type: "VIP",
                status: "PENDING",
                orderProcessingTime: 10,
              })
            }
          >
            New VIP Order
          </Button>
        </Row>
        <CustomList
          dataSource={pendingOrders}
          title="Pending Orders"
          renderItem={(order) => (
            <List.Item
              key={order.id}
              actions={[
                <Button
                  onClick={() => removeOrder(order.id)}
                  type="primary"
                  danger
                  disabled={["PROCESSING", "COMPLETED"].includes(order.status)}
                >
                  Cancel Order
                </Button>,
              ]}
              extra={<CustomTag status={order.status} />}
            >
              <List.Item.Meta
                title={
                  <Typography.Text>
                    Order Number:{" "}
                    <Typography.Text strong>
                      {order.orderNumber}
                    </Typography.Text>
                  </Typography.Text>
                }
                description={
                  <>
                    <Tag color={order.type === "NORMAL" ? "default" : "gold"}>
                      {order.type}
                    </Tag>
                    <Typography.Text type="secondary">
                      {dayjs(order.createdAt).format(defaultDateTimeFormat)}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />

        <CustomList
          dataSource={completedOrders}
          title="Completed Orders"
          renderItem={(order) => (
            <List.Item
              key={order.id}
              extra={<CustomTag status={order.status} />}
            >
              <List.Item.Meta
                title={
                  <Typography.Text>
                    Order Number:{" "}
                    <Typography.Text strong>
                      {order.orderNumber}
                    </Typography.Text>
                  </Typography.Text>
                }
                description={
                  <>
                    <Tag color={order.type === "NORMAL" ? "default" : "gold"}>
                      {order.type}
                    </Tag>
                    <Typography.Text type="secondary">
                      {dayjs(order.createdAt).format(defaultDateTimeFormat)}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Col>

      <Col span={12}>
        <Typography.Title level={3}>Bot</Typography.Title>
        <Row justify={"space-between"}>
          <Button variant="outlined" onClick={addBot}>
            + Bot
          </Button>
          <Button variant="outlined" onClick={removeBot}>
            - Bot
          </Button>
        </Row>
        <Typography.Text>{`Number of Active Bots: ${numbersOfBots}`}</Typography.Text>

        <CustomList
          dataSource={bots}
          title="Bots"
          renderItem={(bot) => (
            <List.Item
              key={bot.id}
              extra={
                <Tag
                  color={bot.status === "PROCESSING" ? "processing" : "default"}
                >
                  {bot.status}
                </Tag>
              }
            >
              <List.Item.Meta
                title={
                  bot.status === "PROCESSING"?
                  <Typography.Text>
                    Processing Order Number:{" "}
                    <Typography.Text strong>{bot.orderNumber}</Typography.Text>
                  </Typography.Text>:
                  <Typography.Text>
                    No Order Assigned
                  </Typography.Text>
                }
                description={
                  <>
                    <Typography.Text type="secondary">
                      {dayjs(bot.createdAt).format(defaultDateTimeFormat)}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Col>
    </Row>
  );
};

export default HomePage;
