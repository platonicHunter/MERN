import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import connectMongoDB from "./db/connectMongoDb.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

//middleware
app.use(express.json()); //to parase req.body
app.use(express.urlencoded({ extended: true })); //to pass from data(urlencoded)
app.use(cookieParser());
// for iMage
app.use("/uploads/images", express.static("uploads/images"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  connectMongoDB();
  console.log(`Server is running on port http://localhost:${PORT}`);
});
