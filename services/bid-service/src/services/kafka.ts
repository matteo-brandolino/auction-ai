import { Kafka, Producer } from "kafkajs";

let producer: Producer | null = null;

export const initKafkaProducer = async () => {
  const kafka = new Kafka({
    clientId: "bid-service",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });

  producer = kafka.producer();
  await producer.connect();
  console.log("Kafka Producer connected");
};

export const publishBidEvent = async (bidData: {
  eventType: string;
  bidId: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  bidderEmail: string;
  amount: number;
  timestamp: Date;
}) => {
  if (!producer) {
    throw new Error("Kafka producer not initialized");
  }

  await producer.send({
    topic: "bids",
    messages: [
      {
        key: bidData.auctionId, // Kafka uses key for partition
        value: JSON.stringify(bidData),
      },
    ],
  });

  console.log(`Bid event published to Kafka:`, bidData.eventType);
};

export const disconnectKafkaProducer = async () => {
  if (producer) {
    await producer.disconnect();
    console.log("Kafka Producer disconnected");
  }
};
