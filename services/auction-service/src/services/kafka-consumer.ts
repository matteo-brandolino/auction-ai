import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { Auction } from "../models/Auction";
import mongoose from "mongoose";

let consumer: Consumer | null = null;

/**
 * Initialize Kafka consumer to listen for bid events
 * - Consumer group: "auction-processors" for horizontal scaling
 * - Manual offset commit for at-least-once delivery guarantee
 */
export const initKafkaConsumer = async () => {
  const kafka = new Kafka({
    clientId: "auction-service",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });

  consumer = kafka.consumer({
    groupId: "auction-processors",
  });

  await consumer.connect();
  console.log("✅ Kafka Consumer connected");

  await consumer.subscribe({
    topic: "bids",
    fromBeginning: false, // Only process new messages
  });

  console.log("Subscribed to topic: bids");

  await consumer.run({
    autoCommit: false, // Manual commit for precise control
    eachMessage: async (payload: EachMessagePayload) => {
      await processBidEvent(payload);
    },
  });
};

/**
 * Process a single bid event from Kafka
 */
const processBidEvent = async (payload: EachMessagePayload) => {
  const { topic, partition, message } = payload;

  try {
    const bidEvent = JSON.parse(message.value?.toString() || "{}");

    console.log("Received bid event:", {
      topic,
      partition,
      offset: message.offset,
      key: message.key?.toString(),
      eventType: bidEvent.eventType,
    });

    if (bidEvent.eventType === "BID_PLACED") {
      await updateAuctionFromBid(bidEvent);
    }

    // Commit offset after successful processing (at-least-once delivery)
    await consumer?.commitOffsets([
      {
        topic,
        partition,
        offset: (parseInt(message.offset) + 1).toString(),
      },
    ]);

    console.log("✅ Bid processed and offset committed");
  } catch (error) {
    console.error("❌ Error processing bid event:", error);
    // Don't commit offset - message will be reprocessed
  }
};

/**
 * Update auction with bid data
 */
const updateAuctionFromBid = async (bidEvent: {
  bidId: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  timestamp: Date;
}) => {
  const { auctionId, bidderId, amount } = bidEvent;

  const auction = await Auction.findById(auctionId);

  if (!auction) {
    console.warn(`⚠️ Auction ${auctionId} not found - skipping update`);
    return;
  }

  if (auction.status !== "active") {
    console.warn(
      `⚠️ Auction ${auctionId} is ${auction.status} - skipping update`
    );
    return;
  }

  auction.currentPrice = amount;
  auction.totalBids += 1;
  const bidderObjectId = new mongoose.Types.ObjectId(bidderId);
  auction.winnerId = bidderObjectId;

  if (!auction.uniqueBidders.some((id) => id.toString() === bidderId)) {
    auction.uniqueBidders.push(bidderObjectId);
  }

  await auction.save();

  console.log(`📊 Auction ${auctionId} updated:`, {
    currentPrice: auction.currentPrice,
    totalBids: auction.totalBids,
    uniqueBidders: auction.uniqueBidders.length,
    winnerId: auction.winnerId,
  });
};

/**
 * Disconnect consumer gracefully
 */
export const disconnectKafkaConsumer = async () => {
  if (consumer) {
    await consumer.disconnect();
    console.log("❌ Kafka Consumer disconnected");
  }
};
