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

// ============================
//  SERIAL
// ============================
const port = new SerialPort({
  path: "COM3",
  baudRate: 9600,
});
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

port.on("open", () => {
  console.log("✔ Arduino conectado correctamente.");
});

// ============================
//  LECTURA ARDUINO
// ============================
parser.on("data", async (msg) => {
  const data = msg.trim();
  console.log("Arduino →", data);

  if (data === "1") {
    console.log("[EVENTO] Movimiento detectado → iniciando reconocimiento (15s)");

    usuarioAusente = false;
    reconocimientoEnProgreso = true;

    clearTimeout(temporizadorReconocimiento);

    temporizadorReconocimiento = setTimeout(async () => {
      if (!usuarioAusente) {
        const texto = "Recordatorio pendiente.";
        const nombreArchivo = await convertirTextoAVoz(texto);

        //const nombreArchivo = await convertirTextoAVoz(texto);

        console.log("[AUDIO] Archivo generado:", nombreArchivo);
      }
      reconocimientoEnProgreso = false;
    }, 15000);
  }

  if (data === "3") {
    console.log("[EVENTO] Botón presionado → usuario AUSENTE");
    usuarioAusente = true;
    clearTimeout(temporizadorReconocimiento);
  }

  if (data === "RECORDATORIO_COMPLETADO") {
    console.log("[EVENTO] Usuario completó el recordatorio");
  }
});

// ============================
// FUNCIÓN UTILIDAD
// ============================
function leerArchivo(ruta) {
  if (!fs.existsSync(ruta)) return [];
  return JSON.parse(fs.readFileSync(ruta));
}

// ------------------------------------------------------------
// USUARIOS
// ------------------------------------------------------------
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
  else return { ok: false, msg: "Verificar datos" };
});

// ------------------------------------------------------------
// RECORDATORIOS NORMALES
// ------------------------------------------------------------
subscribePOSTEvent("agregarRecordatorio", (data) => {
  let recordatorios = leerArchivo("recordatorios.json");

  recordatorios.push({
    titulo: data.titulo,
    fecha: data.fecha,
    hora: data.hora,
    avisarAntesMinutos: data.avisarAntesMinutos ?? 10,
    avisoPrevioEmitido: false,
    recordatorioEmitido: false,
  });

  fs.writeFileSync("recordatorios.json", JSON.stringify(recordatorios, null, 2));

  realTimeEvent("nuevoRecordatorio", data);

  return { ok: true, msg: "Recordatorio agregado con éxito" };
});

subscribeGETEvent("listarRecordatorios", () => leerArchivo("recordatorios.json"));

subscribePOSTEvent("eliminarRecordatorio", (data) => {
  let recordatorios = leerArchivo("recordatorios.json");

  recordatorios = recordatorios.filter((r) => r.titulo !== data.titulo);

  fs.writeFileSync("recordatorios.json", JSON.stringify(recordatorios, null, 2));

  return { ok: true, msg: "Recordatorio eliminado" };
});

// ------------------------------------------------------------
// OBJETOS
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// TAREAS
// ------------------------------------------------------------
subscribePOSTEvent("agregarTarea", (data) => {
  let tareas = leerArchivo("tareas.json");

  tareas.push({ tarea: data.tarea, realizada: false });

  fs.writeFileSync("tareas.json", JSON.stringify(tareas, null, 2));

  return { ok: true, msg: "Tarea agregada" };
});

subscribePOSTEvent("marcarTareaRealizada", (data) => {
  let tareas = leerArchivo("tareas.json");

  for (let t of tareas) {
    if (t.tarea === data.tarea) t.realizada = true;
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

// ====================================================================
// ⭐⭐⭐ RECORDATORIOS DIARIOS — NUEVO ⭐⭐⭐
// ====================================================================

// AGREGAR DIARIO
subscribePOSTEvent("agregarRecordatorioDiario", (data) => {
  let diarios = leerArchivo("recordatoriosDiarios.json");

  diarios.push({
    titulo: data.titulo,
    frecuencia: data.frecuencia,          // "cadaXMin" | "vecesDia"
    vecesDia: data.vecesDia || null,
    intervaloMin: data.intervaloMin || null,
    desde: data.desde,
    hasta: data.hasta,

    // Control interno
    ultimaEjecucion: null,
    avisoPrevioEmitido: false,
  });

  fs.writeFileSync(
    "recordatoriosDiarios.json",
    JSON.stringify(diarios, null, 2)
  );

  return { ok: true, msg: "Recordatorio diario agregado con éxito" };
});

// LISTAR
subscribeGETEvent("listarRecordatoriosDiarios", () =>
  leerArchivo("recordatoriosDiarios.json")
);

subscribePOSTEvent("eliminarRecordatorioDiario", (data) => {
  let diarios = leerArchivo("recordatoriosDiarios.json");

  diarios = diarios.filter((d) => d.titulo !== data.titulo);

  fs.writeFileSync(
    "recordatoriosDiarios.json",
    JSON.stringify(diarios, null, 2)
  );

  return { ok: true, msg: "Recordatorio diario eliminado" };
});


// ====================================================================
// SISTEMA AUTOMÁTICO — DIARIOS
// ====================================================================
setInterval(async () => {
  let diarios = leerArchivo("recordatoriosDiarios.json");
  const ahora = new Date();
  const horaActual = ahora.toTimeString().slice(0, 5);

  for (let rec of diarios) {
    const dentroDelHorario =
      horaActual >= rec.desde && horaActual <= rec.hasta;

    if (!dentroDelHorario) continue;

    let debeEjecutar = false;

    if (rec.frecuencia === "cadaXMin") {
      if (!rec.ultimaEjecucion) debeEjecutar = true;
      else {
        const anterior = new Date(rec.ultimaEjecucion);
        const diffMin = (ahora - anterior) / 60000;
        if (diffMin >= rec.intervaloMin) debeEjecutar = true;
      }
    }

    if (debeEjecutar && !usuarioAusente) {
      const texto = `Recordatorio diario: ${rec.titulo}`;
      const nombreArchivo = await convertirTextoAVoz(texto);
      console.log("[DIARIO] Emitido:", nombreArchivo);

      rec.ultimaEjecucion = ahora;
    }
  }

  fs.writeFileSync(
    "recordatoriosDiarios.json",
    JSON.stringify(diarios, null, 2)
  );
}, 1000);

// ------------------------------------------------------------
// SISTEMA DE RECORDATORIOS NORMALES (usa avisarAntesMinutos)
// ------------------------------------------------------------
setInterval(async () => {
  const recordatorios = leerArchivo("recordatorios.json");
  const ahora = new Date();
  const fechaHoy = ahora.toISOString().slice(0, 10);
  const horaActual = ahora.toTimeString().slice(0, 5);

  for (let rec of recordatorios) {
    const fechaHoraRec = new Date(`${rec.fecha}T${rec.hora}:00`);

    const minutosAviso = rec.avisarAntesMinutos ?? 10;
    const fechaHoraAviso = new Date(fechaHoraRec - minutosAviso * 60000);

    if (!rec.avisoPrevioEmitido && minutosAviso > 0) {
      if (ahora >= fechaHoraAviso && ahora < fechaHoraRec) {
        if (!usuarioAusente) {
          let texto;
          if (minutosAviso === 1) {
            texto = `Acordate que en 1 minuto tenés que ${rec.titulo}`;
          } else {
            texto = `Acordate que en ${minutosAviso} minutos tenés que ${rec.titulo}`;
          }
          const nombreArchivo = await convertirTextoAVoz(texto);
          console.log("[AVISO PREVIO] Generado:", nombreArchivo);
        }
        rec.avisoPrevioEmitido = true;
      }
    }

    if (
      !rec.recordatorioEmitido &&
      rec.fecha === fechaHoy &&
      rec.hora === horaActual
    ) {
      if (!usuarioAusente) {
        const texto = `Recordatorio: ${rec.titulo}`;
        const nombreArchivo = await convertirTextoAVoz(texto);
        console.log("[RECORDATORIO] Generado:", nombreArchivo);
      }
      rec.recordatorioEmitido = true;
    }
  }

  fs.writeFileSync("recordatorios.json", JSON.stringify(recordatorios, null, 2));
}, 1000);

// ------------------------------------------------------------
// INICIAR SERVIDOR
// ------------------------------------------------------------
startServer(3000, true);
console.log("✅ Backend DAD iniciado en puerto 3000")
