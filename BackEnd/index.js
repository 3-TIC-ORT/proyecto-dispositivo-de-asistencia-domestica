import fs from "fs";
import {
  subscribePOSTEvent,
  subscribeGETEvent,
  realTimeEvent,
  startServer,
} from "soquetic";
import { SerialPort, ReadlineParser } from "serialport";
import { convertirTextoAVoz } from "./API.js";

// ---------------------------
// Función para leer archivos JSON
// ---------------------------
function leerArchivo(path) {
  if (!fs.existsSync(path)) return [];
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch (err) {
    console.error("Error leyendo archivo", path, err);
    return [];
  }
}

// ---------------------------
// HARDWARE DAD (SERIALPORT) + LÓGICA DE GEL
// ---------------------------

// CAMBIÁ ESTE PATH SI TU DAD CAMBIA DE PUERTO (ahora está en COM6)
const SERIAL_PATH = "COM6";
const BAUD_RATE = 9600;

// Estado para la lógica del DAD
let usuarioAusente = false;
let reconocimientoEnProgreso = false;
let temporizadorReconocimiento = null;

let port = null;
let parser = null;

try {
  port = new SerialPort({
    path: SERIAL_PATH,
    baudRate: BAUD_RATE,
  });

  parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  console.log(`✅ Puerto serie abierto en ${SERIAL_PATH} a ${BAUD_RATE} baudios`);

  port.on("open", () => {
    console.log("✔ Arduino conectado correctamente.");
  });

  // LECTURA DE DATOS DEL ARDUINO (GEL + TUS LOGS)
  parser.on("data", async (msg) => {
    const data = msg.trim();
    console.log("Arduino →", data);

    //----------------------------------------------------
    // 1) Arduino detecta movimiento
    //----------------------------------------------------
    if (data.includes("Movimiento detectado")) {
      console.log(
        "[EVENTO] Movimiento detectado, Arduino verifica usuario (15s)"
      );

      usuarioAusente = false;
      reconocimientoEnProgreso = true;

      clearTimeout(temporizadorReconocimiento);

      temporizadorReconocimiento = setTimeout(async () => {
        if (!usuarioAusente) {
          console.log(
            "[BACKEND] Usuario presente. Reproduciendo recordatorio."
          );

          const texto = "Recordatorio pendiente.";

          try {
            const nombreArchivo = await convertirTextoAVoz(texto);
            console.log("[AUDIO] Archivo generado:", nombreArchivo);
          } catch (err) {
            console.error(
              "❌ Error al generar audio:",
              err?.message || err
            );
          }

          // Igual mandamos PLAY al Arduino
          enviarComando("PLAY:2");
        }

        reconocimientoEnProgreso = false;
      }, 15000);

      return;
    }

    //----------------------------------------------------
    // 2) Botón presionado durante reconocimiento → usuario ausente
    //----------------------------------------------------
    if (data === "1") {
      console.log(
        "[EVENTO] Usuario ausente → NO reproducir recordatorios."
      );
      usuarioAusente = true;
      reconocimientoEnProgreso = false;

      clearTimeout(temporizadorReconocimiento);
      return;
    }

    //----------------------------------------------------
    // 3) Botón presionado durante recordatorio completado
    //----------------------------------------------------
    if (data === "RECORDATORIO_COMPLETADO") {
      console.log("[EVENTO] Recordatorio completado por el usuario.");
      // Acá podrían marcar en JSON que se completó una tarea/recordatorio
      return;
    }

    //----------------------------------------------------
    // 4) Caso original tuyo: USUARIO_NO_PRESENTE
    //----------------------------------------------------
    if (data === "USUARIO_NO_PRESENTE") {
      console.log(
        "[EVENTO] Usuario NO presente. Backend desactiva recordatorios."
      );
      // Si querés, acá podés guardar algo en tus JSON
      return;
    }

    //----------------------------------------------------
    // 5) Otros textos informativos
    //----------------------------------------------------
    if (data.includes("Recordatorio") || data.includes("Usuario")) {
      console.log("[INFO ARDUINO]", data);
    }
  });

  port.on("error", (err) => {
    console.error("⚠️ Error en el puerto serie:", err.message);
  });
} catch (err) {
  console.error("⚠️ No se pudo abrir el puerto serie:", err.message);
}

// Función para enviar comandos al Arduino (solo si el puerto existe)
function enviarComando(cmd) {
  if (!port) {
    console.warn(
      "⚠️ No hay puerto serie abierto, no se puede enviar comando:",
      cmd
    );
    return;
  }
  port.write(cmd + "\n");
  console.log("Backend → Arduino:", cmd);
}

// Ejemplo: pedir STATUS cada 30 segundos
setInterval(() => {
  enviarComando("STATUS");
}, 30000);

// Si en algún otro archivo quieren usar enviarComando
export { enviarComando };

// ---------------------------
// EVENTOS USUARIOS: SIGNUP / LOGIN
// ---------------------------

subscribePOSTEvent("signup", (data) => {
  let usuarios = leerArchivo("usuarios.json");

  usuarios.push({ username: data.nombre, password: data.contraseña });

  fs.writeFileSync("usuarios.json", JSON.stringify(usuarios, null, 2));

  return { ok: true, msg: "Usuario registrado con éxito" };
});

subscribePOSTEvent("login", (data) => {
  let usuarios = leerArchivo("usuarios.json");

  const user = usuarios.find(
    (u) => u.username === data.username && u.password === data.password
  );

  if (user) {
    return { ok: true, msg: "Inicio de sesión exitoso" };
  } else {
    return { ok: false, msg: "Verificar los datos" };
  }
});

// ---------------------------
// EVENTOS RECORDATORIOS
// ---------------------------

subscribePOSTEvent("agregarRecordatorio", (data) => {
  let recordatorios = leerArchivo("recordatorios.json");

  recordatorios.push({
    titulo: data.titulo,
    fecha: data.fecha,
    hora: data.hora,
    avisarAntesMinutos: data.avisarAntesMinutos,
  });

  fs.writeFileSync(
    "recordatorios.json",
    JSON.stringify(recordatorios, null, 2)
  );

  // Aviso en tiempo real para la pantalla de inicio
  realTimeEvent("nuevoRecordatorio", data);

  return { ok: true, msg: "Recordatorio agregado con éxito" };
});

subscribeGETEvent("listarRecordatorios", () => {
  return leerArchivo("recordatorios.json");
});

// ---------------------------
// EVENTOS OBJETOS
// ---------------------------

subscribePOSTEvent("agregarObjeto", (data) => {
  let objetos = leerArchivo("objetos.json");

  objetos.push({ objeto: data.objeto });

  fs.writeFileSync("objetos.json", JSON.stringify(objetos, null, 2));

  return { ok: true, msg: "Objeto agregado" };
});

subscribePOSTEvent("eliminarObjeto", (data) => {
  let objetos = leerArchivo("objetos.json");

  objetos = objetos.filter((o) => o.objeto !== data.objeto);

  fs.writeFileSync("objetos.json", JSON.stringify(objetos, null, 2));

  return { ok: true, msg: "Objeto eliminado" };
});

subscribeGETEvent("listarObjetos", () => {
  return leerArchivo("objetos.json");
});

// ---------------------------
// EVENTOS TAREAS
// ---------------------------

subscribePOSTEvent("agregarTarea", (data) => {
  let tareas = leerArchivo("tareas.json");

  tareas.push({ tarea: data.tarea, realizada: false });

  fs.writeFileSync("tareas.json", JSON.stringify(tareas, null, 2));

  return { ok: true, msg: "Tarea agregada" };
});

subscribePOSTEvent("marcarTareaRealizada", (data) => {
  let tareas = leerArchivo("tareas.json");

  for (let i = 0; i < tareas.length; i++) {
    if (tareas[i].tarea === data.tarea) {
      tareas[i].realizada = true;
    }
  }

  fs.writeFileSync("tareas.json", JSON.stringify(tareas, null, 2));

  return { ok: true, msg: "Tarea marcada como realizada" };
});

subscribePOSTEvent("eliminarTarea", (data) => {
  let tareas = leerArchivo("tareas.json");

  tareas = tareas.filter((t) => t.tarea !== data.tarea);

  fs.writeFileSync("tareas.json", JSON.stringify(tareas, null, 2));

  return { ok: true, msg: "Tarea eliminada" };
});

subscribeGETEvent("listarTareas", () => leerArchivo("tareas.json"));

// ---------------------------
// INICIAR SERVIDOR
// ---------------------------

startServer(3000, true);
console.log("✅ Backend DAD iniciado en puerto 3000");
