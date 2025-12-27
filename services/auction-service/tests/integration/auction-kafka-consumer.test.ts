import { KafkaContainer, StartedKafkaContainer } from "@testcontainers/kafka";
import {
  MongoDBContainer,
  StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import { Kafka, Producer, Partitioners } from "kafkajs";
import mongoose from "mongoose";
import { Auction } from "../../src/models/Auction";
import {
  initKafkaConsumer,
  disconnectKafkaConsumer,
} from "../../src/services/kafka-consumer";

describe("Auction Service - Kafka Consumer Integration", () => {
  let kafkaContainer: StartedKafkaContainer;
  let mongoContainer: StartedMongoDBContainer;
  let producer: Producer;
  let kafka: Kafka;

  beforeAll(async () => {
    kafkaContainer = await new KafkaContainer("confluentinc/cp-kafka:7.6.1")
      .withExposedPorts(9093)
      .start();

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const kafkaHost = kafkaContainer.getHost();
    const kafkaPort = kafkaContainer.getMappedPort(9093);
    const brokers = `${kafkaHost}:${kafkaPort}`;

    kafka = new Kafka({
      clientId: "test-admin",
      brokers: [brokers],
    });

    const admin = kafka.admin();
    await admin.connect();
    await admin.createTopics({
      topics: [
        {
          topic: "bids",
          numPartitions: 1,
          replicationFactor: 1,
        },
        {
          topic: "__consumer_offsets",
          numPartitions: 1,
          replicationFactor: 1,
        },
      ],
    });
    await admin.disconnect();

    mongoContainer = await new MongoDBContainer("mongo:7").start();

    const mongoHost = mongoContainer.getHost();
    const mongoPort = mongoContainer.getMappedPort(27017);
    const mongoUri = `mongodb://${mongoHost}:${mongoPort}/test?directConnection=true`;

    await mongoose.connect(mongoUri);

    process.env.KAFKA_BROKER = brokers;

    // create Kafka producer (simulates Bid Service)
    kafka = new Kafka({
      clientId: "test-producer",
      brokers: [brokers],
    });

    producer = kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });
    await producer.connect();

    await initKafkaConsumer();

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }, 120000);

  afterAll(async () => {
    await disconnectKafkaConsumer();
    await producer.disconnect();
    await mongoose.disconnect();
    await kafkaContainer.stop();
    await mongoContainer.stop();
  }, 60000);

  afterEach(async () => {
    await Auction.deleteMany({});
  });

  test("should update auction when bid event is received", async () => {
    // Create an active auction in DB
    const auction = await Auction.create({
      title: "Test Auction",
      description: "Test auction for consumer",
      itemId: new mongoose.Types.ObjectId(),
      sellerId: new mongoose.Types.ObjectId(),
      category: "electronics",
      startingPrice: 100,
      currentPrice: 100,
      minIncrement: 10,
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      originalEndTime: new Date(Date.now() + 3600000),
      status: "active",
      totalBids: 0,
      uniqueBidders: [],
    });

    const bidderId = new mongoose.Types.ObjectId().toString();
    const bidEvent = {
      eventType: "BID_PLACED",
      bidId: new mongoose.Types.ObjectId().toString(),
      auctionId: auction._id.toString(),
      bidderId: bidderId,
      amount: 150,
      timestamp: new Date().toISOString(),
    };

    // publish the bid event to Kafka (simulate Bid Service)
    await producer.send({
      topic: "bids",
      messages: [
        {
          key: bidEvent.auctionId,
          value: JSON.stringify(bidEvent),
        },
      ],
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const updatedAuction = await Auction.findById(auction._id);

    expect(updatedAuction).not.toBeNull();
    expect(updatedAuction!.currentPrice).toBe(150);
    expect(updatedAuction!.totalBids).toBe(1);
    expect(updatedAuction!.winnerId?.toString()).toBe(bidderId);
    expect(updatedAuction!.uniqueBidders).toHaveLength(1);
    expect(updatedAuction!.uniqueBidders[0].toString()).toBe(bidderId);
  });

  test("should track multiple unique bidders", async () => {
    const auction = await Auction.create({
      title: "Multi-bidder Auction",
      description: "Test multiple bidders",
      itemId: new mongoose.Types.ObjectId(),
      sellerId: new mongoose.Types.ObjectId(),
      category: "electronics",
      startingPrice: 100,
      currentPrice: 100,
      minIncrement: 10,
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      originalEndTime: new Date(Date.now() + 3600000),
      status: "active",
      totalBids: 0,
      uniqueBidders: [],
    });

    const bidder1 = new mongoose.Types.ObjectId().toString();
    const bidder2 = new mongoose.Types.ObjectId().toString();

    // First bid from bidder1
    await producer.send({
      topic: "bids",
      messages: [
        {
          key: auction._id.toString(),
          value: JSON.stringify({
            eventType: "BID_PLACED",
            bidId: new mongoose.Types.ObjectId().toString(),
            auctionId: auction._id.toString(),
            bidderId: bidder1,
            amount: 110,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Second bid from bidder2
    await producer.send({
      topic: "bids",
      messages: [
        {
          key: auction._id.toString(),
          value: JSON.stringify({
            eventType: "BID_PLACED",
            bidId: new mongoose.Types.ObjectId().toString(),
            auctionId: auction._id.toString(),
            bidderId: bidder2,
            amount: 120,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Third bid from bidder1 again (should not add to uniqueBidders)
    await producer.send({
      topic: "bids",
      messages: [
        {
          key: auction._id.toString(),
          value: JSON.stringify({
            eventType: "BID_PLACED",
            bidId: new mongoose.Types.ObjectId().toString(),
            auctionId: auction._id.toString(),
            bidderId: bidder1,
            amount: 130,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify final state
    const updatedAuction = await Auction.findById(auction._id);

    expect(updatedAuction!.currentPrice).toBe(130);
    expect(updatedAuction!.totalBids).toBe(3);
    expect(updatedAuction!.uniqueBidders).toHaveLength(2); // Only 2 unique
    expect(updatedAuction!.winnerId?.toString()).toBe(bidder1);
  }, 15000); // avoid thrown: "Exceeded timeout of 5000 ms for a test.

  test("should not update auction if status is not active", async () => {
    // create a DRAFT auction
    const auction = await Auction.create({
      title: "Draft Auction",
      description: "Test non-active auction",
      itemId: new mongoose.Types.ObjectId(),
      sellerId: new mongoose.Types.ObjectId(),
      category: "electronics",
      startingPrice: 100,
      currentPrice: 100,
      minIncrement: 10,
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      originalEndTime: new Date(Date.now() + 3600000),
      status: "draft",
      totalBids: 0,
      uniqueBidders: [],
    });

    const bidderId = new mongoose.Types.ObjectId().toString();

    await producer.send({
      topic: "bids",
      messages: [
        {
          key: auction._id.toString(),
          value: JSON.stringify({
            eventType: "BID_PLACED",
            bidId: new mongoose.Types.ObjectId().toString(),
            auctionId: auction._id.toString(),
            bidderId: bidderId,
            amount: 150,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Auction should NOT be updated
    const updatedAuction = await Auction.findById(auction._id);

    expect(updatedAuction!.currentPrice).toBe(100); // Still starting price
    expect(updatedAuction!.totalBids).toBe(0);
    expect(updatedAuction!.winnerId).toBeNull();
  });
});
