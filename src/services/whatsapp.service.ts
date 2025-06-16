import axios from "axios";
import { API_BASE, API_TOKEN, PHONE_ID } from "../config/server.config";

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
