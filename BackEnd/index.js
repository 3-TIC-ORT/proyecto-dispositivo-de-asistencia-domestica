import fs from "fs";
import { convertirTextoAVoz } from "./API.js";
import {
  subscribePOSTEvent,
  subscribeGETEvent,
  realTimeEvent,
  startServer,
} from "soquetic";
import { ReadlineParser, SerialPort } from "serialport";

let usuarioAusente = false;
let reconocimientoEnProgreso = false;
let temporizadorReconocimiento = null;

// Cambiar puerto
const port = new SerialPort({
  path: "COM5",
  baudRate: 9600,
});

// *** ESTA LÍNEA DEBE EXISTIR ANTES DE USAR parser ***
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

port.on("open", () => {
  console.log("✔ Arduino conectado correctamente.");
});

//-----------------------------------------------------
//  LECTURA DE DATOS DEL ARDUINO  (PEGAR DESPUÉS DE DEFINIR parser)
//-----------------------------------------------------
parser.on("data", async (msg) => {
  const data = msg.trim();
  console.log("Arduino →", data);

  //----------------------------------------------------
  // 1) Arduino detecta movimiento
  //----------------------------------------------------
  if (data.includes("Movimiento detectado")) {
    console.log("[EVENTO] Movimiento detectado, Arduino verifica usuario (15s)");

    usuarioAusente = false;
    reconocimientoEnProgreso = true;

    clearTimeout(temporizadorReconocimiento);

    temporizadorReconocimiento = setTimeout(async () => {
      if (!usuarioAusente) {
        console.log("[BACKEND] Usuario presente. Reproduciendo recordatorio.");

        const texto = "Recordatorio pendiente.";
        const nombreArchivo = await convertirTextoAVoz(texto);

        console.log("[AUDIO] Archivo generado:", nombreArchivo);

        enviarComando("PLAY:2");
      }

      reconocimientoEnProgreso = false;
    }, 15000);
  }

  //----------------------------------------------------
  // 2) Botón presionado durante reconocimiento
  //----------------------------------------------------
  if (data === "1") {
    console.log("[EVENTO] Usuario ausente → NO reproducir recordatorios.");
    usuarioAusente = true;
    reconocimientoEnProgreso = false;

    clearTimeout(temporizadorReconocimiento);
    return;
  }

  //----------------------------------------------------
  // 3) Botón presionado durante recordatorio
  //----------------------------------------------------
  if (data === "RECORDATORIO_COMPLETADO") {
    console.log("[EVENTO] Recordatorio completado por el usuario.");
    return;
  }

  //----------------------------------------------------
  // 4) Otros textos informativos
  //----------------------------------------------------
  if (data.includes("Recordatorio") || data.includes("Usuario")) {
    console.log("[INFO] Arduino:", data);
  }
});

//-----------------------------------------------------
//  FUNCIÓN PARA ENVIAR COMANDOS AL ARDUINO
//-----------------------------------------------------
function enviarComando(cmd) {
  port.write(cmd + "\n");
  console.log("Backend → Arduino:", cmd);
}

export { enviarComando };

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

subscribePOSTEvent("agregarRecordatorio", (data) => {
  let recordatorios = leerArchivo("recordatorios.json");

  recordatorios.push({
    titulo: data.titulo,
    fecha: data.fecha,
    hora: data.hora,
    AvisarAntes: data.AvisarAntes,
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

startServer(3000, true);