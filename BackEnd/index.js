import fs from "fs";
import { convertirTextoAVoz } from "./API.js";
import {
  subscribePOSTEvent,
  subscribeGETEvent,
  realTimeEvent,
  startServer,
} from "soquetic";
import { ReadlineParser, SerialPort } from "serialport";

// Función para obtener la fecha y hora actuales en formato 'dd-MM-yyyy HH:mm'
function obtenerFechaYHoraActual() {
  const ahora = new Date();
  const dia = ahora.getDate().toString().padStart(2, '0');   // Día con 2 dígitos
  const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');  // Mes con 2 dígitos (los meses empiezan desde 0)
  const año = ahora.getFullYear();
  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  return `${dia}-${mes}-${año} ${horas}:${minutos}`;
}

// Función para leer el archivo JSON
function leerArchivo(nombreArchivo) {
  try {
    const data = fs.readFileSync(nombreArchivo);
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer el archivo:", error);
    return [];
  }
}

// Función que verifica los recordatorios y ejecuta send si hay coincidencias de fecha y hora
function verificarRecordatorios() {
  const recordatorios = leerArchivo("recordatorios.json");
  const fechaYHoraActual = obtenerFechaYHoraActual(); // Correcta referencia aquí
  
  // Buscar recordatorios cuya fecha y hora coincidan con la fecha y hora actuales
  const recordatorioCoincidente = recordatorios.find(
    (r) => `${r.fecha} ${r.hora}` === fechaYHoraActual
  );

  if (recordatorioCoincidente) {
    console.log("Se encontró un recordatorio para la fecha y hora actual:", recordatorioCoincidente);
    send({ mensaje: `Recordatorio: ${recordatorioCoincidente.titulo}` });  // 'titulo' en lugar de 'mensaje'
  }
}

// Función que envía el mensaje al Arduino



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

function send(data) {
  port.write(data + "\n");
}

parser.on("data", (msjHardware) => {
  // Lo que sea que tengas que hacer
});



// Verificar los recordatorios cada minuto (o el intervalo que prefieras)
setInterval(verificarRecordatorios, 60000); // 60000ms = 1 minuto

// También podrías llamarlo manualmente en alguna otra parte del código, dependiendo de cuándo lo necesites.
verificarRecordatorios();  // Esto se ejecuta inmediatamente al inicio

// =======================
// Lógica para manejar eventos POST y GET
// =======================
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