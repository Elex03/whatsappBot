import express from "express";
import { getWebhook, postWebHook } from "./controller/whatsappWebHook.controller";
import { PORT } from "./config/server.config";

const app = express();

app.use(express.json());
app.get("/webhook", getWebhook);
app.post("/webhook", postWebHook);

const port = PORT || 4000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});