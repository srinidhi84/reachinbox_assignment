import "reflect-metadata"; // if using TypeORM
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/db";
import emailRoutes from "./routes/emailRoutes";

const app = express(); // ← must declare app first!

// Enable CORS BEFORE routes
app.use(cors({
  origin: "http://localhost:3000", // your frontend URL
}));

app.use(express.json()); // parse JSON bodies

// Use your routes
app.use("/api", emailRoutes);

const PORT = process.env.PORT || 4000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected!");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
