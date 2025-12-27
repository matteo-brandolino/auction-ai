import {
  MongoDBContainer,
  StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import { KafkaContainer, StartedKafkaContainer } from "@testcontainers/kafka";
import mongoose from "mongoose";
import { Kafka, Producer } from "kafkajs";

import { Auction } from "../../services/auction-service/src/models/Auction";
import { Item } from "../../services/item-service/src/models/Item";
import { Bid } from "../../services/bid-service/src/models/Bid";

import {
  initKafkaConsumer,
  disconnectKafkaConsumer,
} from "../../services/auction-service/src/services/kafka-consumer";

describe("E2E: Complete Auction Flow", () => {
  let mongoContainer: StartedMongoDBContainer;
  let kafkaContainer: StartedKafkaContainer;
  let producer: Producer;
  let kafka: Kafka;

  beforeAll(async () => {
    mongoContainer = await new MongoDBContainer("mongo:7").start();
    const mongoHost = mongoContainer.getHost();
    const mongoPort = mongoContainer.getMappedPort(27017);
    const mongoUri = `mongodb://${mongoHost}:${mongoPort}/bidwars-e2e?directConnection=true`;

    await mongoose.connect(mongoUri);

    kafkaContainer = await new KafkaContainer("confluentinc/cp-kafka:7.6.1")
      .withExposedPorts(9093)
      .start();

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const kafkaHost = kafkaContainer.getHost();
    const kafkaPort = kafkaContainer.getMappedPort(9093);
    const brokers = `${kafkaHost}:${kafkaPort}`;

    kafka = new Kafka({
      clientId: "e2e-test",
      brokers: [brokers],
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });

    const admin = kafka.admin();
    await admin.connect();
    await admin.createTopics({
      topics: [
        { topic: "bids", numPartitions: 1, replicationFactor: 1 },
        { topic: "__consumer_offsets", numPartitions: 1, replicationFactor: 1 },
      ],
    });
    await admin.disconnect();
    console.log("✅ Kafka topics created");

    producer = kafka.producer();
    await producer.connect();

    process.env.KAFKA_BROKER = brokers;
    await initKafkaConsumer();

    // Give everything time to initialize
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }, 180000); // 3 minutes timeout

  afterAll(async () => {
    await disconnectKafkaConsumer();
    await producer.disconnect();
    await mongoose.disconnect();
    await kafkaContainer.stop();
    await mongoContainer.stop();
  }, 60000);

  afterEach(async () => {
    // Clean database between tests
    await Item.deleteMany({});
    await Auction.deleteMany({});
    await Bid.deleteMany({});
  });

  test("E2E: Complete auction flow - create item → auction → bid → update", async () => {
    // ============================================
    // STEP 1: Create Item (Item Service)
    // ============================================

    const sellerId = new mongoose.Types.ObjectId();
    const item = await Item.create({
      title: "iPhone 14 Pro Max",
      description: "Brand new iPhone 14 Pro Max 256GB",
      category: "electronics",
      condition: "new",
      images: ["https://example.com/iphone.jpg"],
      ownerId: sellerId,
      status: "available",
    });

    expect(item).toBeDefined();
    expect(item.title).toBe("iPhone 14 Pro Max");

    // ============================================
    // STEP 2: Create Auction (Auction Service)
    // ============================================

    const auction = await Auction.create({
      title: "iPhone 14 Pro Max Auction",
      description: "New iPhone auction",
      itemId: item._id,
      sellerId: sellerId,
      category: "electronics",
      startingPrice: 100,
      currentPrice: 100,
      minIncrement: 10,
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000), // 1 hour from now
      originalEndTime: new Date(Date.now() + 3600000),
      status: "draft",
    });

    expect(auction).toBeDefined();
    expect(auction.itemId.toString()).toBe(item._id.toString());

    // ============================================
    // STEP 3: Publish Auction (change status to active)
    // ============================================

    auction.status = "active";
    await auction.save();

    expect(auction.status).toBe("active");

    // ============================================
    // STEP 4: Create Bid (Bid Service)
    // ============================================

    const bidderId = new mongoose.Types.ObjectId();
    const bid = await Bid.create({
      auctionId: auction._id,
      bidderId: bidderId,
      amount: 150,
      status: "pending",
      timestamp: new Date(),
    });

    expect(bid).toBeDefined();
    expect(bid.amount).toBe(150);

    // ============================================
    // STEP 5: Publish Bid Event to Kafka (Bid Service)
    // ============================================

    const bidEvent = {
      eventType: "BID_PLACED",
      bidId: bid._id.toString(),
      auctionId: auction._id.toString(),
      bidderId: bidderId.toString(),
      amount: 150,
      timestamp: new Date().toISOString(),
    };

    await producer.send({
      topic: "bids",
      messages: [
        {
          key: auction._id.toString(),
          value: JSON.stringify(bidEvent),
        },
      ],
    });

    // ============================================
    // STEP 6: Wait for Kafka Consumer to Process
    // ============================================

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // ============================================
    // STEP 7: Verify Auction was Updated
    // ============================================

    const updatedAuction = await Auction.findById(auction._id);

    expect(updatedAuction).not.toBeNull();
    expect(updatedAuction!.currentPrice).toBe(150);
    expect(updatedAuction!.totalBids).toBe(1);
    expect(updatedAuction!.winnerId?.toString()).toBe(bidderId.toString());
    expect(updatedAuction!.uniqueBidders).toHaveLength(1);
  }, 60000); // 1 minute timeout for test

  test("E2E: Multiple bids from different bidders", async () => {
    const sellerId = new mongoose.Types.ObjectId();
    const item = await Item.create({
      title: "MacBook Pro",
      description: "16-inch MacBook Pro",
      category: "electronics",
      condition: "new",
      images: ["https://example.com/macbook.jpg"],
      ownerId: sellerId,
      status: "available",
    });

    const auction = await Auction.create({
      title: "MacBook Pro Auction",
      description: "MacBook auction",
      itemId: item._id,
      sellerId: sellerId,
      category: "electronics",
      startingPrice: 500,
      currentPrice: 500,
      minIncrement: 50,
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      originalEndTime: new Date(Date.now() + 3600000),
      status: "active",
    });

    const bidder1 = new mongoose.Types.ObjectId();
    const bidder2 = new mongoose.Types.ObjectId();

    // Bid 1: $600 from bidder1
    await producer.send({
      topic: "bids",
      messages: [
        {
          key: auction._id.toString(),
          value: JSON.stringify({
            eventType: "BID_PLACED",
            bidId: new mongoose.Types.ObjectId().toString(),
            auctionId: auction._id.toString(),
            bidderId: bidder1.toString(),
            amount: 600,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Bid 2: $650 from bidder2
    await producer.send({
      topic: "bids",
      messages: [
        {
          key: auction._id.toString(),
          value: JSON.stringify({
            eventType: "BID_PLACED",
            bidId: new mongoose.Types.ObjectId().toString(),
            auctionId: auction._id.toString(),
            bidderId: bidder2.toString(),
            amount: 650,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Bid 3: $700 from bidder1 again
    await producer.send({
      topic: "bids",
      messages: [
        {
          key: auction._id.toString(),
          value: JSON.stringify({
            eventType: "BID_PLACED",
            bidId: new mongoose.Types.ObjectId().toString(),
            auctionId: auction._id.toString(),
            bidderId: bidder1.toString(),
            amount: 700,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const updatedAuction = await Auction.findById(auction._id);

    expect(updatedAuction!.currentPrice).toBe(700);
    expect(updatedAuction!.totalBids).toBe(3);
    expect(updatedAuction!.uniqueBidders).toHaveLength(2);
    expect(updatedAuction!.winnerId?.toString()).toBe(bidder1.toString());
  }, 60000);
});
