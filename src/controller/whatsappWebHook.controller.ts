import axios from "axios";
import { Request, Response } from "express";

import { sendTextMessage } from "../services/whatsapp.service";
import { API_TOKEN, PHONE_ID } from "../config/server.config";
import { getMedicinePerCoincidence } from "../api/services/getRequest";

const userStates: Record<string, { esperandoNombre: boolean }> = {};

export const getWebhook = (req: Request, res: Response) => {
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
};

const sendInteractiveMessage = async (to: string) => {
  await axios.post(
    `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "¡Hola! Por favor elige una opción:",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "consultar_disponibilidad",
                title: "Información",
              },
            },
            {
              type: "reply",
              reply: {
                id: "soporte",
                title: "Soporte",
              },
            },
            {
              type: "reply",
              reply: {
                id: "horarios",
                title: "Horarios",
              },
            },
          ],
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
};
export const postWebHook = async (req: Request, res: Response) => {
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
    const buttonReplyId = message?.interactive?.button_reply?.id;
    const receivedText = message?.text?.body?.trim().toLowerCase();

    console.log(
      `Mensaje recibido de ${from}: ${receivedText || buttonReplyId}`
    );

    if (receivedText === "menu") {
      await sendInteractiveMessage(from); // Menú: disponibilidad / precio
      res.sendStatus(200);
    }

    if (receivedText === "hola" || receivedText === "hi") {
      await sendTextMessage(
        from,
        "¡Hola! ¿En qué puedo ayudarte? Escribe *menu* para ver las opciones."
      );

      await fetch(
        `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_TOKEN}`, // usa tu token
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            type: "document",
            document: {
              link: "https://rua.ua.es/dspace/bitstream/10045/4298/1/TEMA%201_INTRODUCCION%20A%20LA%20PSICOLOG%C3%8DA.pdf", // tu URL pública
              filename: "informacion.pdf", // nombre que verá el usuario
            },
          }),
        }
      );

      res.sendStatus(200);
    }

    if (
      buttonReplyId === "consultar_disponibilidad" ||
      receivedText === "info"
    ) {
      userStates[from] = { esperandoNombre: true };
      console.log(userStates[from]?.esperandoNombre);
      await sendTextMessage(
        from,
        "Por favor, indícame el nombre del medicamento que deseas buscar."
      );
      res.sendStatus(200);
    }
    if (userStates[from]?.esperandoNombre && receivedText) {
      const resultados = await getMedicinePerCoincidence(receivedText);

      if (resultados.length > 0) {
        const lista = resultados
          .map(
            (m: any, i: number) =>
              `${i + 1}. ${m.descripcion} - ${m.precio ?? "Sin precio"}`
          )
          .join("\n");

        await sendTextMessage(from, `✅ Medicamentos encontrados:\n${lista}`);
      } else {
        await sendTextMessage(
          from,
          `❌ No se encontraron medicamentos que coincidan con: "${receivedText}"`
        );
      }
      await sendTextMessage(
        from,
        "¿Hay algo más que desees realizar? Escribe *menu* para ver las opciones."
      );
      delete userStates[from]; // limpia estado

      res.sendStatus(200);
    }

    // if (buttonReplyId === "consultar_precio" || receivedText === "precio") {
    //   await sendTextMessage(from, "Por favor, dime el nombre del medicamento para consultar su precio.");
    //    res.sendStatus(200);
    // }

    // // Paso 3: búsqueda por coincidencia
    // if (receivedText && receivedText.length > 2) {
    //   const lista = await getMedicinePerCoincidence(receivedText); // devuelve lista o []

    //   if (lista.length > 0) {
    //     // const lista = coincidencias
    //     //   .map((m: any, i: number) => `${i + 1}. ${m.nombre} - ${m.precio ?? 'Sin precio'}`)
    //     //   .join("\n");

    //     await sendTextMessage(from, `✅ Medicamentos encontrados:\n${lista}`);
    //   } else {
    //     await sendTextMessage(from, `❌ No se encontraron medicamentos que coincidan con: "${receivedText}"`);
    //   }

    //   // Paso 4: preguntar si desea hacer algo más
    //   await sendTextMessage(from, "¿Hay algo más que desees realizar? Escribe *menu* para ver las opciones.");
    //   res.sendStatus(200);
    // }

    // Si no coincide con nada
    // await sendTextMessage(from, "No entendí tu mensaje. Escribe *menu* para ver las opciones.");
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};
