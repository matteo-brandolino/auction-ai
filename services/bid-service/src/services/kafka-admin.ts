import { Kafka } from "kafkajs";

export const createTopics = async () => {
  const kafka = new Kafka({
    clientId: "bid-service-admin",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });

  const admin = kafka.admin();

  try {
    await admin.connect();
    console.log("📋 Kafka Admin connected");

    const topics = await admin.listTopics();

    if (!topics.includes("bids")) {
      await admin.createTopics({
        topics: [
          {
            topic: "bids",
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
      console.log("✅ Topic 'bids' created successfully");
    } else {
      console.log("✅ Topic 'bids' already exists");
    }

    // Describe topic to show configuration
    const topicMetadata = await admin.fetchTopicMetadata({ topics: ["bids"] });
    const bidsMetadata = topicMetadata.topics.find((t) => t.name === "bids");

    if (bidsMetadata) {
      console.log(`📊 Topic 'bids' info:`);
      console.log(`   - Partitions: ${bidsMetadata.partitions.length}`);
      bidsMetadata.partitions.forEach((p) => {
        console.log(`   - Partition ${p.partitionId}: Leader=${p.leader}`);
      });
    }

    await admin.disconnect();
    console.log("📋 Kafka Admin disconnected");
  } catch (error) {
    console.error("❌ Failed to create topics:", error);
    throw error;
  }
};
