// server.js

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const alertSchema = new mongoose.Schema({
    telegramId: String,
    selectedChain: String,
    selectedToken: {
      name: String,
      symbol: String,
      address: String,
    },
    preferredCurrency: String,
    alertCondition: String,
    alertPercentage: Number,
    alertPrice: Number,
  });

const Alert = mongoose.model("Alert", alertSchema);

// Route to create alerts
app.post("/api/alerts", async (req, res) => {
  const alertData = req.body;
  const newAlert = new Alert(alertData);
  await newAlert.save();
  res.status(201).send("Alert created successfully");
});

setInterval(async () => {
    const alerts = await Alert.find();
  
    alerts.forEach(async (alert) => {
      const currentPrice = await getCurrentPrice(
        alert.selectedChain,
        alert.selectedToken.address,
        alert.preferredCurrency
      );
  
      if (checkAlertCondition(currentPrice, alert)) {
        await sendTelegramNotification(alert.telegramId, currentPrice);
      }
    });
  }, 10000);

// Function to fetch current token price
const getCurrentPrice = async (chainId, tokenAddress, currency) => {
  try {
    const response = await fetch(
      `https://api.odos.xyz/pricing/token/${chainId}/${tokenAddress}?currencyId=${currency}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching price: ${response.statusText}`);
    }

    const data = await response.json();
    return data.price;
  } catch (error) {
    console.error("Error fetching current price:", error);
    return null;
  }
};

// Function to check alert condition
const checkAlertCondition = (currentPrice, alert) => {
    console.log(currentPrice, alert.alertPrice)
  switch (alert.alertCondition) {
    case ">":
      return currentPrice > alert.alertPrice;
    case ">=":
      return currentPrice >= alert.alertPrice;
    case "==":
      return currentPrice === alert.alertPrice;
    case "<":
      return currentPrice < alert.alertPrice;
    case "<=":
      return currentPrice <= alert.alertPrice;
    default:
      return false;
  }
};

// Function to send Telegram notification
const sendTelegramNotification = async (telegramId, price) => {
  const botToken = process.env.BOT_TOKEN; // Your Telegram bot token
  const message = `Price alert triggered! Current price: ${price}`;
  console.log(message, botToken)

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
      }),
    });
  
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  
    console.log("Message sent successfully!");
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
