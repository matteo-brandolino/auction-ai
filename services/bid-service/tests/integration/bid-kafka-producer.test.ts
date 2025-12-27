import { KafkaContainer, StartedKafkaContainer } from "@testcontainers/kafka";
import { Kafka, Producer, Consumer, Partitioners } from "kafkajs";

describe("Bid Service - Kafka Producer Integration", () => {
  let kafkaContainer: StartedKafkaContainer;
  let producer: Producer;
  let consumer: Consumer;
  let kafka: Kafka;

  beforeAll(async () => {
    kafkaContainer = await new KafkaContainer("confluentinc/cp-kafka:7.6.1")
      .withExposedPorts(9093)
      .start();

    const host = kafkaContainer.getHost();
    const port = kafkaContainer.getMappedPort(9093);
    const brokers = `${host}:${port}`;

    kafka = new Kafka({
      clientId: "test-client",
      brokers: [brokers],
    });

    producer = kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });
    await producer.connect();

    consumer = kafka.consumer({ groupId: "test-group" });
    await consumer.connect();
    await consumer.subscribe({ topic: "bids", fromBeginning: true });

    // wait kafka setup, avoid error during setup
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, 120000);

  afterAll(async () => {
    await producer.disconnect();
    await consumer.disconnect();
    await kafkaContainer.stop();
  }, 60000);

  test("should publish bid event to Kafka", async () => {
    const bidEvent = {
      eventType: "BID_PLACED",
      bidId: "123",
      auctionId: "auction-456",
      bidderId: "user-789",
      amount: 100,
      timestamp: new Date().toISOString(),
    };

    await producer.send({
      topic: "bids",
      messages: [
        {
          key: bidEvent.auctionId,
          value: JSON.stringify(bidEvent),
        },
      ],
    });

    const receivedMessages: any[] = [];
    let messageReceived = false;

    await consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value?.toString() || "{}");
        receivedMessages.push(event);
        messageReceived = true;
      },
    });

    // wait for message
    const startTime = Date.now();
    while (!messageReceived && Date.now() - startTime < 5000) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    expect(receivedMessages.length).toBeGreaterThan(0);
    expect(receivedMessages[0]).toMatchObject({
      eventType: "BID_PLACED",
      bidId: "123",
      auctionId: "auction-456",
      amount: 100,
    });
  });
});
