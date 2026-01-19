import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { ScheduledEmail } from "../entities/ScheduledEmail";
import { SentEmail } from "../entities/SentEmail";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [ScheduledEmail, SentEmail],
});

export const connectDB = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("✅ Database connected");
  }
};
