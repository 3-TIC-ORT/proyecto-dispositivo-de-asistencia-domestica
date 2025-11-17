import fs from "fs";
import { convertirTextoAVoz } from "./API.js";
import {
  subscribePOSTEvent,
  subscribeGETEvent,
  realTimeEvent,
  startServer,
} from "soquetic";
import { ReadlineParser, SerialPort } from "serialport";

//---------------------------------------------------
//  BACKEND PARA CONECTAR CON TU HARDWARE
//---------------------------------------------------
const { SerialPort, ReadlineParser } = require("serialport");

// Cambia el path por tu puerto COM/tty
const port = new SerialPort({
  path: "COM3",  
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

console.log("Esperando mensajes del dispositivo...");

parser.on("data", (msg) => {
  const data = msg.trim();
  console.log("Arduino →", data);

  //---------------------------------------------------
  // 🔹 Evento: se detecta movimiento
  //---------------------------------------------------
  if (data.includes("Movimiento detectado")) {
    console.log("[EVENTO] Movimiento detectado. Arduino pidió verificación.");
    // Aquí tu backend NO debe hacer nada: Arduino reproduce solo
  }

  //---------------------------------------------------
  // 🔹 Evento: usuario NO está (apretó botón durante verificación)
  //---------------------------------------------------
  if (data === "USUARIO_NO_PRESENTE") {
    console.log("[EVENTO] Usuario NO presente. Backend desactiva recordatorios.");

    // Aquí haces lo que necesites en tu backend:
    // guardar en BD, pausar recordatorios, etc.
  }

  //---------------------------------------------------
  // 🔹 Evento: usuario completó el recordatorio
  //---------------------------------------------------
  if (data === "RECORDATORIO_COMPLETADO") {
    console.log("[EVENTO] Recordatorio completado.");

    // Lógica backend → registrar tarea completada en base de datos
  }

  //---------------------------------------------------
  // 🔹 Estado del Arduino devuelto por "STATUS"
  //---------------------------------------------------
  if (data.startsWith("Usuario")) {
    console.log("[INFO ARDUINO]", data);
  }
});

//--------------------------------------------
// Función backend → enviar comando al Arduino
//--------------------------------------------
function enviarComando(cmd) {
  port.write(cmd + "\n");
  console.log("Backend → Arduino:", cmd);
}

//--------------------------------------------
// Ejemplo: pedir el estado cada 30 segundos
//--------------------------------------------
setInterval(() => {
  enviarComando("STATUS");
}, 30000);


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