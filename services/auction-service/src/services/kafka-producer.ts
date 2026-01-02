import { Kafka, Producer } from "kafkajs";

let producer: Producer | null = null;

export const initKafkaProducer = async () => {
  const kafka = new Kafka({
    clientId: "auction-service",
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

export const emitAuctionEndedEvent = async (auction: {
  id: string;
  title: string;
  winnerId?: string;
  winnerName?: string;
  winnerEmail?: string;
  finalPrice: number;
  totalBids: number;
  endTime: Date;
}) => {
  if (!producer) {
    console.error("Kafka Producer not initialized");
    return;
  }

  const event = {
    eventType: "AUCTION_ENDED",
    auctionId: auction.id,
    title: auction.title,
    winnerId: auction.winnerId || null,
    winnerName: auction.winnerName || null,
    winnerEmail: auction.winnerEmail || null,
    finalPrice: auction.finalPrice,
    totalBids: auction.totalBids,
    endTime: auction.endTime,
    timestamp: new Date().toISOString(),
  };

  try {
    await producer.send({
      topic: "auctions",
      acks: -1, // Wait for all in-sync replicas to acknowledge
      timeout: 30000, // Timeout after 30 seconds
      messages: [
        {
          key: auction.id, // Partition by auction ID for ordering
          value: JSON.stringify(event),
        },
      ],
    });
  } catch (error) {
    console.error("Failed to emit auction ended event:", error);
  }
};

export const disconnectKafkaProducer = async () => {
  if (producer) {
    await producer.disconnect();
  }
};
