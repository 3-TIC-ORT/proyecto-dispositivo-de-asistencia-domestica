import fs from "fs";


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
function signup(username, password) {
  let usuarios = leerArchivo("usuarios.json");
  if (usuarios.find(u => u.username === username)) {
    console.log("⚠️ El usuario ya existe");
    return;
  }
  usuarios.push({ username, password });
  guardarArchivo("usuarios.json", usuarios);
  console.log("Usuario registrado con éxito");
}

function login(username, password) {
  let usuarios = leerArchivo("usuarios.json");
  const user = usuarios.find(u => u.username === username && u.password === password);
  if (user) {
    console.log("Bienvenido " + username);
  } else {
    console.log("Usuario o contraseña incorrectos");
  }
}

// --- RECORDATORIOS ---
function agregarRecordatorio(titulo, fecha, hora, avisarAntesMinutos = 0) {
  let recordatorios = leerArchivo("recordatorios.json");
  recordatorios.push({ titulo, fecha, hora, avisarAntesMinutos });
  guardarArchivo("recordatorios.json", recordatorios);
  console.log("Recordatorio agregado: " + titulo);
}

// --- OBJETOS ---
function agregarObjeto(objeto) {
  let objetos = leerArchivo("objetos.json");
  objetos.push({ objeto });
  guardarArchivo("objetos.json", objetos);
  console.log("Objeto agregado: " + objeto);
}

function eliminarObjeto(objeto) {
  let objetos = leerArchivo("objetos.json");
  objetos = objetos.filter(o => o.objeto !== objeto);
  guardarArchivo("objetos.json", objetos);
  console.log("Objeto eliminado: " + objeto);
}

// --- TAREAS ---
function agregarTarea(tarea) {
  let tareas = leerArchivo("tareas.json");
  tareas.push({ tarea, realizada: false });
  guardarArchivo("tareas.json", tareas);
  console.log("Tarea agregada: " + tarea);
}

function marcarTareaRealizada(tarea) {
  let tareas = leerArchivo("tareas.json");
  let tareaObj = tareas.find(t => t.tarea === tarea);
  if (tareaObj) {
    tareaObj.realizada = true;
    guardarArchivo("tareas.json", tareas);
    console.log("Tarea realizada: " + tarea);
  } else {
    console.log("Tarea no encontrada: " + tarea);
  }
}

function eliminarTarea(tarea) {
  let tareas = leerArchivo("tareas.json");
  tareas = tareas.filter(t => t.tarea !== tarea);
  guardarArchivo("tareas.json", tareas);
  console.log("Tarea eliminada: " + tarea);
}

// --- DEMO ---
signup("juan", "1234");
signup("Lucas", "912");
signup("Yoni", "31");

login("juan", "1234");
login("Lucas", "912");
login("Yoni", "31");

agregarRecordatorio("Cita médica", "2025-09-26", "15:00", 30);
agregarObjeto("Mochila");
agregarObjeto("Llaves");
agregarObjeto("Celular");
agregarTarea("Hacer la cama");
agregarTarea("Lavar los platos");
agregarTarea("Poner la mesa");
marcarTareaRealizada("Hacer la cama");
eliminarObjeto("Llaves");
eliminarTarea("Lavar los platos");
eliminarTarea("Poner la mesa");