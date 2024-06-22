import { createClient, RedisClientType } from "redis";
import { REDIS_PASSWORD, REDIS_PORT, REDIS_HOST } from "../config";

class RedisClient {
  private redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient({
      password: REDIS_PASSWORD,
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    });
  }

  public async connect() {
    try {
      await this.redisClient.connect();
      console.log("Connected to Redis");
    } catch (error) {
      console.error("Error connecting to Redis:", error);
    }
  }

  public async setWithExpiry(
    key: string,
    value: string,
    expiryTimeInSeconds: number
  ) {
    try {
      await this.redisClient.setEx(key, expiryTimeInSeconds, value);
      console.log(
        `Set ${key} in Redis with expiry ${expiryTimeInSeconds} seconds`
      );
    } catch (error) {
      console.error("Error setting value in Redis:", error);
    }
  }

  public async set(key: string, value: string) {
    try {
      await this.redisClient.set(key, value);
      console.log(`Set ${key} in Redis`);
    } catch (error) {
      console.error("Error setting value in Redis:", error);
    }
  }

  public async get(key: string): Promise<string | null> {
    try {
      const result = await this.redisClient.get(key);
      console.log("Redis get result", result);
      return result;
    } catch (error) {
      console.error("Error getting value from Redis:", error);
      return null;
    }
  }

  public async delete(key: string) {
    try {
      const count = await this.redisClient.del(key);
      console.log(`Deleted ${count} keys (${key}) from Redis`);
    } catch (error) {
      console.error("Error deleting key from Redis:", error);
    }
  }

  public async flushDatabase() {
    try {
      await this.redisClient.flushDb();
      console.log("Flush redis");
    } catch (error: any) {
      console.error('Error flushing redis: ', error);
    }
  }
}

export const redisClient = new RedisClient()