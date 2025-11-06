import fs from "fs";
import { convertirTextoAVoz } from "./API.js";
import {
  subscribePOSTEvent,
  subscribeGETEvent,
  realTimeEvent,
  startServer,
} from "soquetic";
import { ReadlineParser, SerialPort } from "serialport";

convertirTextoAVoz()


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
  if (user) return { ok: true, msg: "Inicio de sesión exitoso" };
  else return { ok: false, msg: "Verificar los datos" };
});


subscribePOSTEvent("agregarRecordatorio", (data) => {
  let recordatorios = leerArchivo("recordatorios.json");
  recordatorios.push({
    titulo: data.titulo,
    fecha: data.fecha,
    hora: data.hora,
    Avisar: data.Avisar,
  });
  fs.writeFileSync(
    "recordatorios.json",
    JSON.stringify(recordatorios, null, 2)
  );
  realTimeEvent("nuevoRecordatorio", data);
  return { ok: true, msg: "Recordatorio agregado con éxito" };
});

subscribeGETEvent("listarRecordatorios", () => leerArchivo("recordatorios.json"));

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

subscribeGETEvent("listarObjetos", () => leerArchivo("objetos.json"));

subscribePOSTEvent("agregarTarea", (data) => {
  let tareas = leerArchivo("tareas.json");
  tareas.push({ tarea: data.tarea, realizada: false });
  fs.writeFileSync("tareas.json", JSON.stringify(tareas, null, 2));
  return { ok: true, msg: "Tarea agregada" };
});

subscribePOSTEvent("marcarTareaRealizada", (data) => {
  let tareas = leerArchivo("tareas.json");
  for (let i = 0; i < tareas.length; i++) {
    if (tareas[i].tarea === data.tarea) tareas[i].realizada = true;
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

// =======================
// CONEXIÓN CON HARDWARE (Arduino)
// =======================
const port = new SerialPort({
  path: "COM3",
  baudRate: 9600,
});

const parser = new ReadlineParser();
port.pipe(parser);

port.on("open", () => {
  console.log("Puerto serial abierto correctamente");
});

parser.on("data", (status) => {
  let mensaje = status.trim();
  console.log("Mensaje desde Arduino:", mensaje);
  realTimeEvent("mensajeArduino", { data: mensaje });
});

// Enviar color RGB al Arduino
subscribePOSTEvent("colorSeleccionado", (color) => {
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5, 7), 16);
  port.write(`${red},${green},${blue}\n`);
  return { ok: true, msg: "Color enviado al Arduino" };
});

// Enviar mensajes personalizados al Arduino
subscribePOSTEvent("enviarMensaje", (data) => {
  if (!data.mensaje) return { ok: false, msg: "Falta el mensaje" };
  port.write(data.mensaje + "\n");
  return { ok: true, msg: "Mensaje enviado al Arduino" };
});


startServer(3000, true);
