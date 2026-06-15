require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const connectDB = require("./config/db");
const policyRoutes = require("./routes/policyRoutes");
const customerRoutes = require("./routes/customerRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();
const port = process.env.PORT || 3000;

// ========== Firebase Admin Setup ==========
const decodedKey = Buffer.from(process.env.FB_SERVICE_KEY, "base64").toString(
  "utf8",
);
const serviceAccount = JSON.parse(decodedKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ========== Middleware ==========
app.use(cors());
app.use(express.json());

// ========== Database Connection ==========
connectDB();

// ========== Route Mounting ==========
// Policy routes (includes /policies, /all-policies, /popular-policies, etc.)
app.use(policyRoutes);
app.use(customerRoutes);
app.use(applicationRoutes);

// ========== Base Route ==========
app.get("/", (req, res) => {
  res.send("🚀 TrustLife server is running with Mongoose!");
});

// ========== Start Server ==========
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
