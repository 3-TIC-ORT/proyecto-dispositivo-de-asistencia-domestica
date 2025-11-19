import fs from "fs";
import {
  subscribePOSTEvent,
  subscribeGETEvent,
  realTimeEvent,
  startServer,
} from "soquetic";
import { SerialPort, ReadlineParser } from "serialport";

// ⚠️ Voz desactivada para que no rompa por falta de API key
// import { convertirTextoAVoz } from "./API.js";

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
// HARDWARE DAD (SERIALPORT)
// ---------------------------

// CAMBIÁ ESTE PATH POR EL COM REAL DE TU DAD (ej: "COM3", "COM4", etc.)
const SERIAL_PATH = "COM6";
const BAUD_RATE = 9600;

let port = null;
let parser = null;

try {
  port = new SerialPort({
    path: SERIAL_PATH,
    baudRate: BAUD_RATE,
  });

  parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  console.log(`✅ Puerto serie abierto en ${SERIAL_PATH} a ${BAUD_RATE} baudios`);

  parser.on("data", (msg) => {
    const data = msg.trim();
    console.log("Arduino →", data);

    if (data.includes("Movimiento detectado")) {
      console.log("[EVENTO] Movimiento detectado. Arduino pidió verificación.");
    }

    if (data === "USUARIO_NO_PRESENTE") {
      console.log("[EVENTO] Usuario NO presente. Backend desactiva recordatorios.");
      // Acá podrías marcar cosas en JSON, etc.
    }

    if (data === "RECORDATORIO_COMPLETADO") {
      console.log("[EVENTO] Recordatorio completado.");
      // Registrar en tareas/recordatorios si querés
    }

    if (data.startsWith("Usuario")) {
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
    console.warn("⚠️ No hay puerto serie abierto, no se puede enviar comando:", cmd);
    return;
  }
  port.write(cmd + "\n");
  console.log("Backend → Arduino:", cmd);
}

// Ejemplo: pedir STATUS cada 30 segundos
setInterval(() => {
  enviarComando("STATUS");
}, 30000);

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
