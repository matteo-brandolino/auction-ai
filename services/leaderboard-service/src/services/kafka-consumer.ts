import { Kafka, Consumer } from "kafkajs";
import { handleBidPlaced, handleAuctionEnded } from "./stats-aggregator";
import { ProcessedMessage } from "../models/ProcessedMessage";

let consumer: Consumer | null = null;

export const initKafkaConsumer = async () => {
  const kafka = new Kafka({
    clientId: "leaderboard-service",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });

  consumer = kafka.consumer({ groupId: "leaderboard-service-group" });

  await consumer.connect();
  console.log("Kafka Consumer connected");

  await consumer.subscribe({ topic: "bids", fromBeginning: false });
  await consumer.subscribe({ topic: "auctions", fromBeginning: false });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const messageId = `${topic}-${partition}-${message.offset}`;

        const existingMessage = await ProcessedMessage.findOne({ messageId });
        if (existingMessage) {
          console.log(`⏭️ Message ${messageId} already processed - skipping`);
          await consumer?.commitOffsets([
            {
              topic,
              partition,
              offset: (parseInt(message.offset) + 1).toString(),
            },
          ]);
          return;
        }

        const value = message.value?.toString();
        if (!value) return;

        const event = JSON.parse(value);

        if (topic === "bids" && event.eventType === "BID_PLACED") {
          await handleBidPlaced({
            bidId: event.bidId,
            auctionId: event.auctionId,
            bidderId: event.bidderId,
            bidderName: event.bidderName,
            bidderEmail: event.bidderEmail,
            amount: event.amount,
            timestamp: new Date(event.timestamp),
          });
        } else if (topic === "auctions" && event.eventType === "AUCTION_ENDED") {
          await handleAuctionEnded({
            id: event.auctionId,
            title: event.title,
            winnerId: event.winnerId,
            winnerName: event.winnerName,
            winnerEmail: event.winnerEmail,
            finalPrice: event.finalPrice,
            totalBids: event.totalBids,
            endTime: new Date(event.endTime),
          });
        }

        await ProcessedMessage.create({
          messageId,
          topic,
        });

        await consumer?.commitOffsets([
          {
            topic,
            partition,
            offset: (parseInt(message.offset) + 1).toString(),
          },
        ]);
      } catch (error) {
        console.error("Error processing Kafka message:", error);
      }
    },
  });
};

export const disconnectKafkaConsumer = async () => {
  if (consumer) {
    await consumer.disconnect();
    console.log("Kafka Consumer disconnected");
  }
};
