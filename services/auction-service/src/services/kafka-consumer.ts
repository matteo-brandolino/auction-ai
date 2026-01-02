import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { Auction } from "../models/Auction";
import { ProcessedMessage } from "../models/ProcessedMessage";
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

  await consumer.subscribe({
    topic: "bids",
    fromBeginning: false, // Only process new messages
  });

  await consumer.run({
    autoCommit: false, // Manual commit for precise control
    eachMessage: async (payload: EachMessagePayload) => {
      await processBidEvent(payload);
    },
  });
};

const processBidEvent = async (payload: EachMessagePayload) => {
  const { topic, partition, message } = payload;

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
    console.error("❌ Error processing bid event:", error);
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

  // Check if auction has ended (endTime in the past)
  const now = new Date();
  const hasEnded = auction.endTime < now;

  if (hasEnded && auction.status === "active") {
    console.log(`🏁 Auction ${auctionId} has ended - auto-closing`);

    // Close the auction
    auction.status = "ended";
    await auction.save();

    console.log(`✅ Auction ${auctionId} closed:`, {
      endTime: auction.endTime,
      finalPrice: auction.currentPrice,
      winnerId: auction.winnerId?.toString() || "No winner",
      totalBids: auction.totalBids,
    });

    // Note: Bid that arrived after end time is not processed
    console.warn(`⚠️ Bid ${bidEvent.bidId} arrived after auction ended - rejected`);
    return;
  }

  if (auction.status !== "active") {
    console.warn(
      `⚠️ Auction ${auctionId} is ${auction.status} - skipping update`
    );
    return;
  }

  // Auction is active and not ended - process bid normally
  auction.currentPrice = amount;
  auction.totalBids += 1;
  const bidderObjectId = new mongoose.Types.ObjectId(bidderId);
  auction.winnerId = bidderObjectId;

  if (!auction.uniqueBidders.some((id) => id.toString() === bidderId)) {
    auction.uniqueBidders.push(bidderObjectId);
  }

  await auction.save();

  console.log(`✅ Auction ${auctionId} updated:`, {
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
    console.log("Kafka Consumer disconnected");
  }
};
