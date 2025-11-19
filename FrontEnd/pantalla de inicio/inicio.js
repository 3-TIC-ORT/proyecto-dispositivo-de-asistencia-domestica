// Conectamos con el backend por SoqueTIC
connect2Server();

// ---------------
// REFERENCIAS A LA UI
// ---------------

// Todas las cajas con recordatorios (usamos el orden, NO cambiamos clases)
const cajas = document.querySelectorAll(".cajarecor");

// Primera cajita: "Recordatorios" (no diarios)
const cajaRecordatorios = cajas[0]; // h2 = "Recordatorios"

// Dentro de esa caja vamos a poner las filas dinámicas
// (no cambiamos clases, solo borramos las que venían de ejemplo)
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

// Crea una fila con 3 botones usando TUS clases
function crearFilaRecordatorio(rec) {
  // rec: { titulo, fecha, hora, avisarAntesMinutos }

  const fila = document.createElement("div");
  fila.classList.add("fila-recordatorio");

  // Botón texto (titulo)
  const btnTexto = document.createElement("button");
  btnTexto.classList.add("texto-recordatorio");
  const linkTexto = document.createElement("a");
  linkTexto.href = "/FrontEnd/Recordatorios/recordatorios.html";
  linkTexto.textContent = rec.titulo || "Recordatorio";
  btnTexto.appendChild(linkTexto);

  // Botón fecha
  const btnFecha = document.createElement("button");
  btnFecha.classList.add("dato-recordatorio");
  const linkFecha = document.createElement("a");
  linkFecha.href = "/FrontEnd/Recordatorios/recordatorios.html";

  // Si querés ser más pro, acá podrías transformar fecha a "Hoy"
  linkFecha.textContent = rec.fecha || "-";
  btnFecha.appendChild(linkFecha);

  // Botón hora
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

// RENDER: limpia la caja y pone todas las filas
function renderizarRecordatorios(lista) {
  if (!cajaRecordatorios) return;
  limpiarFilasRecordatorios();

  lista.forEach((rec) => {
    const fila = crearFilaRecordatorio(rec);
    cajaRecordatorios.appendChild(fila);
  });
}

// ---------------
// CARGA INICIAL
// ---------------

// Apenas carga la página, pedimos todos los recordatorios al backend
getEvent("listarRecordatorios", (lista) => {
  if (!Array.isArray(lista)) {
    console.warn("listarRecordatorios devolvió algo raro:", lista);
    return;
  }
  renderizarRecordatorios(lista);
});

// ---------------
// ACTUALIZACIÓN EN TIEMPO REAL
// ---------------

// Cuando desde otra página se hace agregarRecordatorio y el backend hace
// realTimeEvent("nuevoRecordatorio", data)
// esto se dispara y agregamos UNA fila nueva al final
subscribeRealTimeEvent("nuevoRecordatorio", (rec) => {
  if (!cajaRecordatorios) return;
  const fila = crearFilaRecordatorio(rec);
  cajaRecordatorios.appendChild(fila);
});
