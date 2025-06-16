// src/controller/whatsapp.controller.ts
import { Request, Response } from "express";
import { sendTextMessage } from "../services/whatsapp.service";

export async function sendMessage(req: Request, res: Response) {
    const { phone, text, reply } = req.body;

    if (!phone || !text || !reply) {
        return res.status(400).json({ error: "phone, text and reply are required" });
    }

    try {
        // Envías el mensaje con la respuesta 'reply'
        const result = await sendTextMessage(phone, reply);
        return res.json(result);
    } catch (error: any) {
        console.error("Error sending WhatsApp message:", error?.response?.data || error.message);
        return res.status(500).json({ error: "Failed to send message" });
    }
}