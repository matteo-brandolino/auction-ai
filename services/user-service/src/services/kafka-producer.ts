import { Kafka, Producer } from "kafkajs";

let producer: Producer | null = null;

export const initKafkaProducer = async () => {
  const kafka = new Kafka({
    clientId: "user-service",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });

  producer = kafka.producer();
  await producer.connect();
  console.log("Kafka Producer connected");
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
