import fs from "fs";
import { subscribePOSTEvent, subscribeGETEvent, realTimeEvent, startServer } from "soquetic";

function leerArchivo(nombreArchivo) {
  try {
    const data = fs.readFileSync(nombreArchivo, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function signup(data){

    let usuarios = fs.readFileSync(nombreArchivo, "utf-8");

    let usuariosjson = JSON.parse(usuarios);

    usuariosjson.push({"username": data.nombre, "password": data.contraseña});

    let usuariosFinal = JSON.stringify(datos, null, 2)

    fs.writeFileSync(nombreArchivo, usuariosFinal);

    return { ok: true, msg: "Usuario registrado con éxito" }
}


function login (data) {

  let usuarios = fs.readFileSync("usuarios.json", "utf-8");

  let usuariosjson = JSON.parse(usuarios);


  for (let  i = 0; i < usuariosjson.length; i++){
    if (usuariosjson[i].username == data.username){
      return { ok: true, msg: "Iniciado con éxito" }
    }
    else {
      return { ok: false, msg: "Verificar los datos" }

    }

  }

}

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