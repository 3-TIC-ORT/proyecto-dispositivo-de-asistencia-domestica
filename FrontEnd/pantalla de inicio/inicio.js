connect2Server();

const cajas = document.querySelectorAll(".cajarecor");
const cajaRecordatorios = cajas[0];

// =================== RECORDATORIOS ===================

function limpiarFilasRecordatorios() {
  if (!cajaRecordatorios) return;

  const titulo = cajaRecordatorios.querySelector("h2");
  let nodo = titulo.nextElementSibling;
  while (nodo) {
    const siguiente = nodo.nextElementSibling;
    nodo.remove();
    nodo = siguiente;
  }
}

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
  limpiarFilasRecordatorios();

  lista.forEach((rec) => {
    const fila = crearFilaRecordatorio(rec);
    cajaRecordatorios.appendChild(fila);
  });
}

// Pedir al back todos los recordatorios guardados
getEvent("listarRecordatorios", (lista) => {
  if (!Array.isArray(lista)) {
    console.warn("listarRecordatorios devolvió algo raro:", lista);
    return;
  }
  renderizarRecordatorios(lista);
});

// Cuando desde la pantalla de Recordatorios se agrega uno nuevo,
// el back emite "nuevoRecordatorio" y lo agregamos a la columna.
subscribeRealTimeEvent("nuevoRecordatorio", (rec) => {
  if (!cajaRecordatorios) return;
  const fila = crearFilaRecordatorio(rec);
  cajaRecordatorios.appendChild(fila);
});

// =================== TAREAS REALIZADAS (caja de abajo) ===================

const contenedorTareas = document.querySelector(".grupo-botones-tareas");

function limpiarTareasInicio() {
  if (!contenedorTareas) return;
  contenedorTareas.innerHTML = "";
}

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
  limpiarTareasInicio();

  lista.forEach((tarea) => {
    const chip = crearChipTarea(tarea);
    contenedorTareas.appendChild(chip);
  });
}

// Pedimos las tareas realizadas al back y las mostramos en el footer
getEvent("listarTareas", (lista) => {
  if (!Array.isArray(lista)) {
    console.warn("listarTareas devolvió algo raro:", lista);
    return;
  }
  renderizarTareasInicio(lista);
});
