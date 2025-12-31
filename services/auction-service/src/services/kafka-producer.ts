import { Kafka, Producer } from "kafkajs";

let producer: Producer | null = null;

export const initKafkaProducer = async () => {
  const kafka = new Kafka({
    clientId: "auction-service",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });

  producer = kafka.producer();
  await producer.connect();
  console.log("Kafka Producer connected");
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
      messages: [
        {
          key: auction.id,
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
