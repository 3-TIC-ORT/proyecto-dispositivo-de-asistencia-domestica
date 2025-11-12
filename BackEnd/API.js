import OpenAI from "openai";
import player from "play-sound";
import fs from "fs";

const openai = new OpenAI({
  apiKey: ""});


// Función para convertir texto a voz
export async function convertirTextoAVoz() {
  try {
    const texto = "Hola, soy tu asistente de voz funcionando correctamente.";
    
    // Generar el audio con la API de OpenAI
    const respuesta = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy", // elegí otra de las soportadas si querés (nova, coral, verse, etc.)
      input: texto,
    });  

    // Guardar el audio como archivo
    const arrayBuffer = await respuesta.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = "./voz.mp3";
    fs.writeFileSync(filePath, buffer);

    console.log("✅ Audio generado correctamente:", filePath);

    // Reproducir el audio automáticamente
    const reproductor = player();
    reproductor.play(filePath, (err) => {
      if (err) {
        console.error("Error al reproducir el audio:", err);
      } else {
        console.log("🎵 Reproducción finalizada.");
      }
    });

  } catch (error) {
    console.error("❌ Error al generar audio:", error);
  }
}


/*
export async function convertirTextoAVoz() {
  try {
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",    // Asegúrate de que este modelo soporte español
      voice: "coral",           // Voz en español (reemplaza con la voz correcta si es diferente)
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
*/
convertirTextoAVoz();
