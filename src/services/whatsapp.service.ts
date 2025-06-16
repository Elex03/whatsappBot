import axios from "axios";

// Define aquí directamente tus credenciales
const API_BASE = "https://graph.facebook.com/v18.0";
const API_TOKEN = "EAAOZBUCrqLhQBO9DCgvSfXZCHWoloxOd5DWQONWMZCZCXP7hwG8UazwNURTi5VsU7Kqs6BgtZCnkWf2zjOUzRToDLhZBcEh8ZBpC9WYwHmYY16NAoqdwkkvPHV8Y5YH4SB2CdcdiKkumQK36b8VtH96LvhhyVHbNZACQLhJtF9oqs5hj6vHneT2NN9z7myupYyADqZBwmGEi1iLWyiQVSzrmnQSIOoZA9CWDOTTiYZD";
const PHONE_ID = "727605997092548";

export async function sendTextMessage(to: string, text: string) {
  try {
    const res = await axios.post(
      `${API_BASE}/${PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error: any) {
    console.error("Error sending message", error?.response?.data || error?.message);
    throw error;
  }
}
