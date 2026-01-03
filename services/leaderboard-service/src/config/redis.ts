import Redis from "ioredis";

let redis: Redis | null = null;

export const initRedis = () => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on("connect", () => {
    console.log("Redis connected");
  });

  redis.on("error", (err) => {
    console.error("Redis error:", err);
  });

  return redis;
};

export const getRedis = (): Redis => {
  if (!redis) {
    throw new Error("Redis not initialized");
  }
  return redis;
};

export const disconnectRedis = async () => {
  if (redis) {
    await redis.quit();
    console.log("Redis disconnected");
  }
};
