import dotenv from "dotenv";

dotenv.config();

export const API_BASE = process.env.WHATSAPP_API_BASE!;
export const API_TOKEN = process.env.WHATSAPP_API_TOKEN!;
export const PHONE_ID = process.env.WHATSAPP_PHONE_ID!;
