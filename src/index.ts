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
app.post("/webhook", async (req: Request, res: Response) => {
  try {
    const entry = req.body.entry?.[0];
    const messages = entry?.changes?.[0]?.value?.messages;

    if (!messages) {
      res.sendStatus(200);
      return;
    }

    const message = messages[0];
    const from = message.from;
    const receivedText = message.text?.body;

    console.log(`Mensaje recibido de ${from}: ${receivedText}`);

    // Envía una respuesta automática
    await sendTextMessage(from, "Bienvenido a FarmaNova. Aca podras consultar la disponibilidad y los precios de nuestros medicamentos !");
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
