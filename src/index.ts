import express from "express";
import dotenv from "dotenv";
import { getWebhook, postWebHook } from "./controller/whatsappWebHook.controller";

dotenv.config();

const app = express();

app.use(express.json());
app.get("/webhook", getWebhook);
app.post("/webhook", postWebHook);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
