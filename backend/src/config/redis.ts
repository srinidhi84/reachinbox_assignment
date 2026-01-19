import Redis from "ioredis";

export const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
};



export const redisClient = new Redis(redisConfig);

redisClient.on("ready", () => console.log("✅ Redis client ready"));
redisClient.on("error", (err) => console.error("❌ Redis error", err));
