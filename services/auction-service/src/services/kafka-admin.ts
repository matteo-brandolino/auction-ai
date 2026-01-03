import { Kafka } from "kafkajs";

export const createTopics = async () => {
  const kafka = new Kafka({
    clientId: "auction-service-admin",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });

  const admin = kafka.admin();

  try {
    await admin.connect();
    console.log("Kafka Admin connected");

    const topics = await admin.listTopics();

    if (!topics.includes("auctions")) {
      await admin.createTopics({
        topics: [
          {
            topic: "auctions",
            numPartitions: 1, // 1 for development, 3+ for production
            replicationFactor: 1, // 1 for development, 3 for production
            configEntries: [
              {
                name: "retention.ms",
                value: "604800000", // 7 days
              },
              {
                name: "cleanup.policy",
                value: "delete", // Delete old messages after retention
              },
            ],
          },
        ],
      });
      console.log("Topic 'auctions' created successfully");
    } else {
      console.log("Topic 'auctions' already exists");
    }

    // Describe topic to show configuration
    const topicMetadata = await admin.fetchTopicMetadata({
      topics: ["auctions"],
    });
    const auctionsMetadata = topicMetadata.topics.find(
      (t) => t.name === "auctions"
    );

    if (auctionsMetadata) {
      console.log(`Topic 'auctions' info:`);
      console.log(`   - Partitions: ${auctionsMetadata.partitions.length}`);
      auctionsMetadata.partitions.forEach((p) => {
        console.log(`   - Partition ${p.partitionId}: Leader=${p.leader}`);
      });
    }

    await admin.disconnect();
    console.log("Kafka Admin disconnected");
  } catch (error) {
    console.error("Failed to create topics:", error);
    throw error;
  }
};
