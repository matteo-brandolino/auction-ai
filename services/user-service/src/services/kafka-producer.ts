import { Kafka, Producer } from "kafkajs";

let producer: Producer | null = null;

export const initKafkaProducer = async () => {
  const kafka = new Kafka({
    clientId: "user-service",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });

  producer = kafka.producer({
    idempotent: true, // Prevents duplicate messages on retry
    maxInFlightRequests: 5, // Max concurrent requests per broker connection
    retry: {
      initialRetryTime: 300, // First retry after 300ms
      retries: 8, // Retry up to 8 times before failing
      factor: 0.2, // Jitter factor to prevent thundering herd
      multiplier: 2, // Exponential backoff multiplier
      maxRetryTime: 30000, // Cap retry delay at 30 seconds
    },
  });
  await producer.connect();
  console.log("Kafka Producer connected (idempotent mode)");
};

export const publishAchievementEvent = async (event: {
  eventType: string;
  userId: string;
  achievementId: string;
  achievementName: string;
  achievementDescription: string;
  achievementIcon: string;
  achievementPoints: number;
  timestamp: Date;
}) => {
  if (!producer) {
    console.error("Kafka producer not initialized");
    return;
  }

  try {
    await producer.send({
      topic: "achievements",
      acks: -1, // Wait for all in-sync replicas to acknowledge
      timeout: 30000, // Timeout after 30 seconds
      messages: [
        {
          value: JSON.stringify(event),
        },
      ],
    });
  } catch (error) {
    console.error("Error publishing achievement event:", error);
  }
};

export const disconnectKafkaProducer = async () => {
  if (producer) {
    await producer.disconnect();
    console.log("Kafka Producer disconnected");
  }
};
