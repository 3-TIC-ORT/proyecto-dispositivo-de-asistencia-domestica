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
  let recordatorios = fs.readFileSync("recordatorios.json", "utf-8");
  let recordatoriosjson = JSON.parse(recordatorios);

  recordatoriosjson.push({
    titulo: data.titulo,
    fecha: data.fecha,
    hora: data.hora,
    Avisar: data.Avisar
  });

  let recordatorioFinal = JSON.stringify(recordatoriosjson, null, 2);
  fs.writeFileSync("recordatorios.json", recordatorioFinal);

  realTimeEvent("nuevoRecordatorio", data);

  return { ok: true, msg: "Recordatorio agregado con éxito" };
});

subscribeGETEvent("listarRecordatorios", () => {
  let recordatorios = fs.readFileSync("recordatorios.json", "utf-8");
  return JSON.parse(recordatorios);
});

// --- OBJETOS ---
subscribePOSTEvent("agregarObjeto", (data) => {
  let objetos = fs.readFileSync("objetos.json", "utf-8");
  let objetosjson = JSON.parse(objetos);

  objetosjson.push({ objeto: data.objeto });

  let objetoFinal = JSON.stringify(objetosjson, null, 2);
  fs.writeFileSync("objetos.json", objetoFinal);

  return { ok: true, msg: "Objeto agregado"};
});

subscribePOSTEvent("eliminarObjeto", (data) => {
  let objetos = fs.readFileSync("objetos.json", "utf-8");
  let objetosjson = JSON.parse(objetos);

  let objetosFinales = [];
  for (let i = 0; i < objetosjson.length; i++) {
    if (objetosjson[i].objeto != data.objeto) {
      objetosFinales.push(objetosjson[i]);
    }
  }

  let objetoFinal = JSON.stringify(objetosFinales, null, 2);
  fs.writeFileSync("objetos.json", objetoFinal);

  return { ok: true, msg: "Objeto eliminado"};
});

subscribeGETEvent("listarObjetos", () => {
  let objetos = fs.readFileSync("objetos.json", "utf-8");
  return JSON.parse(objetos);
});

// --- TAREAS ---
subscribePOSTEvent("agregarTarea", (data) => {
  let tareas = fs.readFileSync("tareas.json", "utf-8");
  let tareasjson = JSON.parse(tareas);

  tareasjson.push({ tarea: data.tarea, realizada: false });

  let tareaFinal = JSON.stringify(tareasjson, null, 2);
  fs.writeFileSync("tareas.json", tareaFinal);

  return { ok: true, msg: "Tarea agregada"};
});

subscribePOSTEvent("marcarTareaRealizada", (data) => {
  let tareas = fs.readFileSync("tareas.json", "utf-8");
  let tareasjson = JSON.parse(tareas);

  for (let i = 0; i < tareasjson.length; i++) {
    if (tareasjson[i].tarea == data.tarea) {
      tareasjson[i].realizada = true;
    }
  }

  let tareaFinal = JSON.stringify(tareasjson, null, 2);
  fs.writeFileSync("tareas.json", tareaFinal);

  return { ok: true, msg: "Tarea marcada como realizada"};
});

subscribePOSTEvent("eliminarTarea", (data) => {
  let tareas = fs.readFileSync("tareas.json", "utf-8");
  let tareasjson = JSON.parse(tareas);

  let tareasFinales = [];
  for (let i = 0; i < tareasjson.length; i++) {
    if (tareasjson[i].tarea != data.tarea) {
      tareasFinales.push(tareasjson[i]);
    }
  }

  let tareaFinal = JSON.stringify(tareasFinales, null, 2);
  fs.writeFileSync("tareas.json", tareaFinal);

  return { ok: true, msg: "Tarea eliminada" };
});

subscribeGETEvent("listarTareas", () => {
  let tareas = fs.readFileSync("tareas.json", "utf-8");
  return JSON.parse(tareas);
});

// --- INICIAR SERVIDOR ---
startServer(3000, true);
