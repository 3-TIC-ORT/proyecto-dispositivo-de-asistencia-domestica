import fs from "fs";
import { convertirTextoAVoz } from "./API.js";
import {
  subscribePOSTEvent,
  subscribeGETEvent,
  realTimeEvent,
  startServer,
} from "soquetic";

convertirTextoAVoz();

function leerArchivo(nombreArchivo) {
  try {
    const data = fs.readFileSync(nombreArchivo, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

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
    Avisar: data.Avisar,
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

subscribeGETEvent("listarTareas", () => {
  return leerArchivo("tareas.json");
});

startServer(3000, true);
