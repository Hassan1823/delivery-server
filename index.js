import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import connectToMongoDB from "./db/connectToMongoDB.js";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import shippingRoutes from "./routes/shipment.routes.js";

const app = express();
config();
const PORT = process.env.PORT || 8000;

app.use(express.json());
//app.use(urlencoded({ extended: true }))
// app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://delivery-clinet.vercel.app"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/shipping", shippingRoutes);

// ~ setting the server is running
app.get("/", (req, res) => {
  res.send("<h1>🚀 Server is Running ...</h1>");
});

// ! for the invalid routes
app.all("*", (req, res, next) => {
  const err = new Error(`❌ Invalid ${req.originalUrl} API Route`);
  err.statusCode = 404;
  next(err);
});

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`🚀 Server is running on port ${PORT}`);
});
