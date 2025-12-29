import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { sendNotification } from "./websocket";
import { NotificationPayload } from "../types/notifications";

let consumer: Consumer | null = null;

export const initKafkaConsumer = async () => {
  const kafka = new Kafka({
    clientId: "notification-service",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });

  consumer = kafka.consumer({
    groupId: "notification-processors",
  });

  await consumer.connect();

  await consumer.subscribe({
    topics: ["bids"], // TODO: Add more topics as needed: ["bids", "auctions"...]
    fromBeginning: false,
  });

  console.log("Subscribed to topics: bids");

  await consumer.run({
    autoCommit: false,
    eachMessage: async (payload: EachMessagePayload) => {
      await processEvent(payload);
    },
  });
};

const processEvent = async (payload: EachMessagePayload) => {
  const { topic, partition, message } = payload;

  try {
    const event = JSON.parse(message.value?.toString() || "{}");

    console.log("Received event:", {
      topic,
      partition,
      offset: message.offset,
      eventType: event.eventType,
    });

    if (topic === "bids") {
      await handleBidEvent(event);
    }

    // Commit offset after successful processing
    await consumer?.commitOffsets([
      {
        topic,
        partition,
        offset: (parseInt(message.offset) + 1).toString(),
      },
    ]);

    console.log("Event processed and offset committed");
  } catch (error) {
    console.error("Error processing event:", error);
  }
};

const handleBidEvent = async (event: any) => {
  if (event.eventType === "BID_PLACED") {
    const { auctionId, bidderId, amount, bidId } = event;

    // Broadcast to all watching the auction (real-time updates)
    const broadcastNotification: NotificationPayload = {
      type: "BID_PLACED",
      data: {
        auctionId,
        bidderId,
        amount,
        bidId: bidId || `temp-${Date.now()}`,
        message: `New bid: $${amount}`,
      },
      timestamp: new Date(),
    };

    sendNotification(broadcastNotification);
  }
};

export const disconnectKafkaConsumer = async () => {
  if (consumer) {
    await consumer.disconnect();
    console.log("Kafka Consumer disconnected");
  }
};
