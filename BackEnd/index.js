import fs from "fs";
import { subscribePOSTEvent, subscribeGETEvent, realTimeEvent, startServer } from "soquetic";

// --- Funciones de archivo ---
function leerArchivo(nombreArchivo) {
  try {
    const data = fs.readFileSync(nombreArchivo, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function guardarArchivo(nombreArchivo, datos) {
  fs.writeFileSync(nombreArchivo, JSON.stringify(datos, null, 2));
}

// --- USUARIOS ---
subscribePOSTEvent("signup", (data) => {
  const { username, password } = data;
  let usuarios = leerArchivo("usuarios.json");

  if (usuarios.find((u) => u.username === username)) {
    return { ok: false, msg: "⚠️ El usuario ya existe" };
  }

  usuarios.push({ username, password });
  guardarArchivo("usuarios.json", usuarios);
  return { ok: true, msg: "Usuario registrado con éxito" };
});

subscribePOSTEvent("login", (data) => {
  const { username, password } = data;
  let usuarios = leerArchivo("usuarios.json");
  const user = usuarios.find((u) => u.username === username && u.password === password);

  if (user) {
    return { ok: true, msg: "Bienvenido " + username };
  } else {
    return { ok: false, msg: "Usuario o contraseña incorrectos" };
  }
});

// --- RECORDATORIOS ---
subscribePOSTEvent("agregarRecordatorio", (data) => {
  const { titulo, fecha, hora, avisarAntesMinutos = 0 } = data;
  let recordatorios = leerArchivo("recordatorios.json");

  recordatorios.push({ titulo, fecha, hora, avisarAntesMinutos });
  guardarArchivo("recordatorios.json", recordatorios);

  realTimeEvent("nuevoRecordatorio", { titulo, fecha, hora });
  return { ok: true, msg: "Recordatorio agregado con éxito" };
});

subscribeGETEvent("listarRecordatorios", () => {
  return leerArchivo("recordatorios.json");
});

// --- OBJETOS ---
subscribePOSTEvent("agregarObjeto", (data) => {
  const { objeto } = data;
  let objetos = leerArchivo("objetos.json");
  objetos.push({ objeto });
  guardarArchivo("objetos.json", objetos);
  return { ok: true, msg: "Objeto agregado: " + objeto };
});

subscribePOSTEvent("eliminarObjeto", (data) => {
  const { objeto } = data;
  let objetos = leerArchivo("objetos.json");
  objetos = objetos.filter((o) => o.objeto !== objeto);
  guardarArchivo("objetos.json", objetos);
  return { ok: true, msg: "Objeto eliminado: " + objeto };
});

subscribeGETEvent("listarObjetos", () => {
  return leerArchivo("objetos.json");
});

// --- TAREAS ---
subscribePOSTEvent("agregarTarea", (data) => {
  const { tarea } = data;
  let tareas = leerArchivo("tareas.json");
  tareas.push({ tarea, realizada: false });
  guardarArchivo("tareas.json", tareas);
  return { ok: true, msg: "Tarea agregada: " + tarea };
});

subscribePOSTEvent("marcarTareaRealizada", (data) => {
  const { tarea } = data;
  let tareas = leerArchivo("tareas.json");
  let tareaObj = tareas.find((t) => t.tarea === tarea);
  if (tareaObj) {
    tareaObj.realizada = true;
    guardarArchivo("tareas.json", tareas);
    return { ok: true, msg: "Tarea realizada: " + tarea };
  } else {
    return { ok: false, msg: "Tarea no encontrada: " + tarea };
  }
});

subscribePOSTEvent("eliminarTarea", (data) => {
  const { tarea } = data;
  let tareas = leerArchivo("tareas.json");
  tareas = tareas.filter((t) => t.tarea !== tarea);
  guardarArchivo("tareas.json", tareas);
  return { ok: true, msg: "Tarea eliminada: " + tarea };
});

subscribeGETEvent("listarTareas", () => {
  return leerArchivo("tareas.json");
});

// --- INICIAR SERVIDOR ---
startServer(3000, true);