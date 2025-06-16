import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { sendTextMessage } from "./services/whatsapp.service";

dotenv.config();

const app = express();

app.use(express.json());
app.get("/webhook", (req: Request, res: Response) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "tu_token_aqui";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED.");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Después: Recibir mensajes cuando Meta hace POST

app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;
    if (!messages) {
      res.sendStatus(200);
      return;
    }

    const message = messages[0];
    const from = message.from;
    const receivedText = message.text?.body.trim();

    console.log(`Mensaje recibido de ${from}: ${receivedText}`);

    let reply = "";

    // Si el mensaje es un saludo o vacío, mostramos el menú
    if (
      receivedText.toLowerCase() === "hola" ||
      receivedText.toLowerCase() === "menu" ||
      receivedText === ""
    ) {
      reply =
        "¡Hola! Por favor elige una opción:\n1️⃣ Información\n2️⃣ Soporte\n3️⃣ Horarios";
    } else if (receivedText === "1") {
      reply = "Has seleccionado Información. ¿En qué te puedo ayudar específicamente?";
    } else if (receivedText === "2") {
      reply = "Has seleccionado Soporte. Por favor, describe tu problema.";
    } else if (receivedText === "3") {
      reply = "Nuestros horarios son de 8am a 5pm, de lunes a viernes.";
    } else {
      reply =
        "No entendí tu mensaje. Por favor, escribe 'menu' para ver las opciones.";
    }

    await sendTextMessage(from, reply);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
