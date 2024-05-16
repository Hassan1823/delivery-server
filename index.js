import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import shippingRoutes from "./routes/shipment.routes.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8000;

app.use(express.json());
//app.use(urlencoded({ extended: true }))
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/shipping", shippingRoutes);

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`🚀 Server is running on port ${PORT}`);
});
