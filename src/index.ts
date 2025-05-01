import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import homeRoutes from "./routes/homeRoutes";
import userRoutes from "./routes/userRoutes";
import itemRoutes from "./routes/itemRoutes";
import dotenv from "dotenv";

dotenv.config();
//const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const app = express();
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const allowedOrigins = [
  "http://78.47.140.225:4020",
  "http://localhost:4020",
  "http://localhost:3000",
  "http://78.47.140.225:3020",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`,
  );
  next();
});

app.options("*", cors());

app.use(express.json());

const PORT = parseInt(process.env.PORT || "4000", 10);

app.use("/api/homes", homeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/homes", itemRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Home Inventory API" });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "An error occurred",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});
