import { Kafka } from "kafkajs";

export const createTopics = async () => {
  const kafka = new Kafka({
    clientId: "user-service-admin",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });

  const admin = kafka.admin();

  try {
    await admin.connect();
    console.log("Kafka Admin connected");

    const topics = await admin.listTopics();

    if (!topics.includes("achievements")) {
      await admin.createTopics({
        topics: [
          {
            topic: "achievements",
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
      console.log("Topic 'achievements' created successfully");
    } else {
      console.log("Topic 'achievements' already exists");
    }

    // Describe topic to show configuration
    const topicMetadata = await admin.fetchTopicMetadata({
      topics: ["achievements"],
    });
    const achievementsMetadata = topicMetadata.topics.find(
      (t) => t.name === "achievements"
    );

    if (achievementsMetadata) {
      console.log(`Topic 'achievements' info:`);
      console.log(`   - Partitions: ${achievementsMetadata.partitions.length}`);
      achievementsMetadata.partitions.forEach((p) => {
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
