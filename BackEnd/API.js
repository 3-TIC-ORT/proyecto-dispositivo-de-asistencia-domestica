import OpenAI from "openai";
import { playAudio } from "openai/helpers/audio";

const openai = new OpenAI();

async function convertirTextoAVoz() {
  try {
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",    // Asegúrate de que este modelo soporte español
      voice: "coral_es",           // Voz en español (reemplaza con la voz correcta si es diferente)
      input: "¡Hoy es un día maravilloso para construir algo que la gente ame!",
      instructions: "Hablar en un tono alegre y positivo.",
      response_format: "wav",      // Formato de salida
    });

    // Reproducir el audio generado
    await playAudio(response);
  } catch (error) {
    console.error("Error al generar audio:", error);
  }
}

convertirTextoAVoz();
