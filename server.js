const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    /\.netlify\.app$/,
    /\.netlify\.live$/,
    /\.vercel\.app$/,
    /\.vercel\.live$/
  ],
  credentials: true
}));
app.use(express.json({ limit: "10mb" })); // Increased for base64 audio notes

// Mount API routes
app.use("/api/family", require("./routes/family"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/items", require("./routes/items"));
app.use("/api/lists", require("./routes/lists"));
app.use("/api/history", require("./routes/history"));
app.use("/api/sync", require("./routes/sync"));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`GharList MERN Backend listening on port ${PORT}`);
});
