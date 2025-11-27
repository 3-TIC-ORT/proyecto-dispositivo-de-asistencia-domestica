connect2Server();

function parsearTextoTarea(tareaStr) {
  const partes = (tareaStr || "").split(" · ");
  return {
    mensaje: partes[0] || "",
    fecha: partes[1] || "",
    hora: partes[2] || "",
  };
}

function crearTarjetaTarea(tareaObj) {
  const datos = parsearTextoTarea(tareaObj.tarea);

  const tarjeta = document.createElement("div");
  tarjeta.classList.add("tarjeta");
  tarjeta.dataset.tarea = tareaObj.tarea;

  tarjeta.innerHTML = `
    <div class="mensaje">
      <span class="label">MENSAJE:</span>
      ${datos.mensaje}
    </div>

    <div class="info-titulo">INFORMACION ADICIONAL</div>

    <div class="info">
      <span>FECHA: <b>${datos.fecha || "-"}</b></span>
      <span>HORARIO: <b>${datos.hora || "-"}</b></span>
    </div>

    <div class="toggle-box">
      <span>AVISAR ANTES:</span>
      <div class="toggle on"><div class="circle"></div></div>
    </div>

    <button class="btn-no-realizada" onclick="eliminarTarea(this)">
      Eliminar tarea
      <img src="/Imagenes/TIck.png">
    </button>
  `;

  return tarjeta;
}

document.addEventListener("DOMContentLoaded", function () {
  const grid = document.querySelector(".grid");
  if (!grid) return;

  // Quito la tarjeta de ejemplo del HTML
  grid.innerHTML = "";

  getEvent("listarTareas", function (lista) {
    if (!Array.isArray(lista)) {
      console.warn("listarTareas devolvió algo raro:", lista);
      return;
    }

    lista.forEach(function (t) {
      const tarjeta = crearTarjetaTarea(t);
      grid.appendChild(tarjeta);
    });
  });
});

function eliminarTarea(boton) {
  const tarjeta = boton.closest(".tarjeta");
  if (!tarjeta) return;

  const tareaTexto = tarjeta.dataset.tarea || "";

  if (tareaTexto) {
    postEvent(
      "eliminarTarea",
      { tarea: tareaTexto },
      function (resp) {
        console.log("Tarea eliminada en backend:", resp);
      }
    );
  }

  tarjeta.remove();
}
