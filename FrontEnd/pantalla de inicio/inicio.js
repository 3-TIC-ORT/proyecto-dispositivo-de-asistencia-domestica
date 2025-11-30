connect2Server();

const cajas = document.querySelectorAll(".cajarecor");
const cajaRecordatorios = cajas[0];
const cajaRecordatoriosDiarios = cajas[1];
const cajaObjetos = cajas[2];
const contenedorObjetosInicio = cajaObjetos ? cajaObjetos.querySelector(".Botoncitos") : null;


function crearFilaRecordatorio(rec) {
  const fila = document.createElement("div");
  fila.classList.add("fila-recordatorio");

  const btnTexto = document.createElement("button");
  btnTexto.classList.add("texto-recordatorio");
  const linkTexto = document.createElement("a");
  linkTexto.href = "/FrontEnd/Recordatorios/recordatorios.html";
  linkTexto.textContent = rec.titulo || "Recordatorio";
  btnTexto.appendChild(linkTexto);

  const btnFecha = document.createElement("button");
  btnFecha.classList.add("dato-recordatorio");
  const linkFecha = document.createElement("a");
  linkFecha.href = "/FrontEnd/Recordatorios/recordatorios.html";
  linkFecha.textContent = rec.fecha || "-";
  btnFecha.appendChild(linkFecha);

  const btnHora = document.createElement("button");
  btnHora.classList.add("dato-recordatorio");
  const linkHora = document.createElement("a");
  linkHora.href = "/FrontEnd/Recordatorios/recordatorios.html";
  linkHora.textContent = rec.hora || "-";
  btnHora.appendChild(linkHora);

  fila.appendChild(btnTexto);
  fila.appendChild(btnFecha);
  fila.appendChild(btnHora);

  return fila;
}

function renderizarRecordatorios(lista) {
  if (!cajaRecordatorios) return;

  lista.forEach((rec) => {
    const fila = crearFilaRecordatorio(rec);
    cajaRecordatorios.appendChild(fila);
  });
}

getEvent("listarRecordatorios", (lista) => {
  if (!Array.isArray(lista)) {
    console.warn("listarRecordatorios devolvió algo raro:", lista);
    return;
  }
  renderizarRecordatorios(lista);
});

subscribeRealTimeEvent("nuevoRecordatorio", (rec) => {
  if (!cajaRecordatorios) return;
  const fila = crearFilaRecordatorio(rec);
  cajaRecordatorios.appendChild(fila);
});

function crearFilaRecordatorioDiario(rec) {
  const fila = document.createElement("div");
  fila.classList.add("fila-recordatorio");

  const btnTexto = document.createElement("button");
  btnTexto.classList.add("texto-recordatorio");
  const linkTexto = document.createElement("a");
  linkTexto.href = "/FrontEnd/Recordatorios diarios/Diarios.html";
  linkTexto.textContent = rec.titulo || "Recordatorio";
  btnTexto.appendChild(linkTexto);

  const btnFecha = document.createElement("button");
  btnFecha.classList.add("dato-recordatorio");
  const linkFecha = document.createElement("a");
  linkFecha.href = "/FrontEnd/Recordatorios diarios/Diarios.html";
  linkFecha.textContent = "Hoy";
  btnFecha.appendChild(linkFecha);

  const btnHora = document.createElement("button");
  btnHora.classList.add("dato-recordatorio");
  const linkHora = document.createElement("a");
  linkHora.href = "/FrontEnd/Recordatorios diarios/Diarios.html";
  linkHora.textContent = rec.desde || "-";
  btnHora.appendChild(linkHora);

  fila.appendChild(btnTexto);
  fila.appendChild(btnFecha);
  fila.appendChild(btnHora);

  return fila;
}

function renderizarRecordatoriosDiarios(lista) {
  if (!cajaRecordatoriosDiarios) return;

  lista.forEach((rec) => {
    const fila = crearFilaRecordatorioDiario(rec);
    cajaRecordatoriosDiarios.appendChild(fila);
  });
}

getEvent("listarRecordatoriosDiarios", (lista) => {
  if (!Array.isArray(lista)) {
    console.warn("listarRecordatoriosDiarios devolvió algo raro:", lista);
    return;
  }
  renderizarRecordatoriosDiarios(lista);
});

function crearBotonObjetoInicio(nombre) {
  const btn = document.createElement("button");
  btn.classList.add("caji");

  const link = document.createElement("a");
  link.href = "/FrontEnd/Recordatorios salir casa/Casa.html";
  link.textContent = nombre;

  btn.appendChild(link);
  return btn;
}

function renderizarObjetosInicio(lista) {
  if (!contenedorObjetosInicio) return;

  lista.forEach((obj) => {
    if (!obj || !obj.objeto) return;
    const boton = crearBotonObjetoInicio(obj.objeto);
    contenedorObjetosInicio.appendChild(boton);
  });
}

getEvent("listarObjetos", (lista) => {
  if (!Array.isArray(lista)) {
    console.warn("listarObjetos devolvió algo raro:", lista);
    return;
  }
  renderizarObjetosInicio(lista);
});


const contenedorTareas = document.querySelector(".grupo-botones-tareas");

function parsearTextoTarea(tareaStr) {
  const partes = (tareaStr || "").split(" · ");
  return {
    mensaje: partes[0] || "",
    fecha: partes[1] || "",
    hora: partes[2] || "",
  };
}

function crearChipTarea(tarea) {
  const datos = parsearTextoTarea(tarea.tarea);
  const cont = document.createElement("div");
  cont.classList.add("contenedor-tarea");

  const linkMensaje = document.createElement("a");
  linkMensaje.href = "/FrontEnd/Tareas Realizadss/Realizadas.html";
  linkMensaje.classList.add("texto-tarea");
  linkMensaje.textContent = datos.mensaje || "Tarea";

  const linkFecha = document.createElement("a");
  linkFecha.href = "/FrontEnd/Tareas Realizadss/Realizadas.html";
  linkFecha.classList.add("circulo-mini");
  linkFecha.textContent = datos.fecha || "-";

  const linkHora = document.createElement("a");
  linkHora.href = "/FrontEnd/Tareas Realizadss/Realizadas.html";
  linkHora.classList.add("circulo-mini");
  linkHora.textContent = datos.hora || "-";

  cont.appendChild(linkMensaje);
  cont.appendChild(linkFecha);
  cont.appendChild(linkHora);

  return cont;
}

function renderizarTareasInicio(lista) {
  if (!contenedorTareas) return;

  lista.forEach((tarea) => {
    const chip = crearChipTarea(tarea);
    contenedorTareas.appendChild(chip);
  });
}

getEvent("listarTareas", (lista) => {
  if (!Array.isArray(lista)) {
    console.warn("listarTareas devolvió algo raro:", lista);
    return;
  }

  const realizadas = lista.filter((t) => t.realizada === true);

  renderizarTareasInicio(realizadas);
});
