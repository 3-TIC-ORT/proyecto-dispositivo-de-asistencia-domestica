import fs from "fs";
import {
  subscribePOSTEvent,
  subscribeGETEvent,
  realTimeEvent,
  startServer,
} from "soquetic";
import { SerialPort, ReadlineParser } from "serialport";
import { convertirTextoAVoz } from "./API.js";

let usuarioAusente = false;
let reconocimientoEnProgreso = false;
let temporizadorReconocimiento = null;

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
const port = new SerialPort({
  path: "COM3",   // <-- cambiar si tu Arduino usa otro puerto
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

port.on("open", () => {
  console.log("✔ Arduino conectado correctamente.");
});

//-----------------------------------------------------
// ESCUCHA DE DATOS DEL ARDUINO
//-----------------------------------------------------
parser.on("data", async (msg) => {
  const data = msg.trim();
  console.log("Arduino →", data);

  //----------------------------------------------------
  // 1) Movimiento detectado → Arduino está esperando botón
  //----------------------------------------------------
  if (data.includes("Movimiento detectado")) {
    console.log("[EVENTO] Inicia reconocimiento (15s)");

    usuarioAusente = false;
    reconocimientoEnProgreso = true;

    clearTimeout(temporizadorReconocimiento);

    temporizadorReconocimiento = setTimeout(async () => {
      if (!usuarioAusente) {
        console.log("[BACKEND] Usuario presente → Emitiendo recordatorio...");

        const texto = "Tienes un recordatorio pendiente.";
        await convertirTextoAVoz(texto);

        console.log("🎵 Recordatorio reproducido en la computadora ✅");
      }

      reconocimientoEnProgreso = false;
    }, 15000); // 15 segundos
  }

  //----------------------------------------------------
  // 2) Usuario presionó botón → AUSENTE
  //----------------------------------------------------
  if (data === "1") {
    console.log("[EVENTO] Usuario AUSENTE → NO reproducir recordatorios.");

    usuarioAusente = true;

    clearTimeout(temporizadorReconocimiento);
  }

  //----------------------------------------------------
  // 3) Arduino confirma que completó recordatorio
  //----------------------------------------------------
  if (data === "RECORDATORIO_COMPLETADO") {
    console.log("[EVENTO] Usuario completó el recordatorio ✅");
  }
});

//-----------------------------------------------------
// FUNCIÓN PARA ENVIAR COMANDOS AL ARDUINO (SI NECESITÁS FUTURO USO)
//-----------------------------------------------------
function enviarComando(cmd) {
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
