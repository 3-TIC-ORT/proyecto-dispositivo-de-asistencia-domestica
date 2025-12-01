connect2Server();

var toggleActivo = true;

document.addEventListener("DOMContentLoaded", function () {
  var cont = document.querySelector(".contenedor-objetos");
  if (!cont) return;
  if (typeof getEvent !== "function") return;

  getEvent("listarRecordatoriosDiarios", function (lista) {
    if (!Array.isArray(lista)) {
      console.warn("listarRecordatoriosDiarios devolvió algo raro:", lista);
      return;
    }

    lista.forEach(function (rec) {
      var mensaje = rec.titulo || "";
      var frecuenciaTexto = rec.frecuenciaTexto || rec.frecuencia || "";
      var veces = rec.vecesDia != null ? String(rec.vecesDia) : "";
      var minutos = rec.intervaloMin != null ? String(rec.intervaloMin) : "";
      var horaInicio = rec.desde || "";
      var horaFin = rec.hasta || "";
      crearTarjeta(mensaje, true, frecuenciaTexto, veces, minutos, horaInicio, horaFin);
    });
  });
});

function abrirModal() {
  document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";

  document.getElementById("mensaje").value = "";
  document.getElementById("frecuencia").value = "";
  document.getElementById("veces").value = "";
  document.getElementById("minutos").value = "";
  document.getElementById("horaInicio").value = "";
  document.getElementById("horaFin").value = "";

  toggleActivo = true;
  var circulo = document.getElementById("circulo");
  var toggle = document.getElementById("toggle");
  circulo.style.left = "28px";
  toggle.style.backgroundColor = "#ff5722";
}

function cambiarToggle() {
  var circulo = document.getElementById("circulo");
  var toggle = document.getElementById("toggle");

  if (toggleActivo) {
    circulo.style.left = "5px";
    toggle.style.backgroundColor = "#ccc";
    toggleActivo = false;
  } else {
    circulo.style.left = "28px";
    toggle.style.backgroundColor = "#ff5722";
    toggleActivo = true;
  }
}

function agregarRecordatorio() {
  var mensaje = document.getElementById("mensaje").value.trim();
  var frecuencia = document.getElementById("frecuencia").value;
  var veces = document.getElementById("veces").value.trim();
  var minutos = document.getElementById("minutos").value.trim();
  var horaInicio = document.getElementById("horaInicio").value;
  var horaFin = document.getElementById("horaFin").value;

  if (mensaje !== "" && frecuencia !== "" && veces !== "" && minutos !== "") {
    var frecuenciaTexto = frecuencia;
    var frecuenciaSistema = "cadaXMin";

    crearTarjeta(mensaje, toggleActivo, frecuenciaTexto, veces, minutos, horaInicio, horaFin);

    if (typeof postEvent === "function") {
      postEvent(
        "agregarRecordatorioDiario",
        {
          titulo: mensaje,
          frecuencia: frecuenciaSistema,
          frecuenciaTexto: frecuenciaTexto,
          vecesDia: parseInt(veces, 10) || null,
          intervaloMin: parseInt(minutos, 10) || null,
          desde: horaInicio || "00:00",
          hasta: horaFin || "23:59"
        },
        function (resp) {
          console.log("Recordatorio diario guardado en backend:", resp);
        }
      );
    }

    cerrarModal();
  } else {
    alert("Completa mensaje, frecuencia, veces al día y minutos entre repeticiones");
  }
}

function crearTarjeta(mensaje, avisar, frecuencia, veces, minutos, horaInicio, horaFin) {
  var cont = document.querySelector(".contenedor-objetos");
  var card = document.createElement("div");
  card.className = "tarjeta";

  var masDeUna = parseInt(veces, 10) > 1;

  var horariosExtra = "";

  if (horaInicio) {
    horariosExtra += `
      <div class="info-fila">
        <span class="info-label">DESDE:</span>
        <span class="info-valor">${horaInicio}</span>
      </div>
    `;
  }

  if (horaFin) {
    horariosExtra += `
      <div class="info-fila">
        <span class="info-label">HASTA:</span>
        <span class="info-valor">${horaFin}</span>
      </div>
    `;
  }

  card.innerHTML = `
    <div class="tarjeta-header">
      <span class="mensaje-label">MENSAJE:</span>
      <span class="mensaje-texto">${mensaje}</span>
    </div>

    <div class="tarjeta-info">
      <div class="tarjeta-info-titulo">INFORMACIÓN ADICIONAL</div>

      <div class="avisar-antes">
        <span class="info-label">AVISAR ANTES:</span>
        <div class="toggle-small ${avisar ? "on" : "off"}">
          <div class="toggle-small-circle"></div>
        </div>
      </div>

      <div class="mas-veces-dia">
        <span class="info-label">MAS DE UNA VEZ AL DIA:</span>
        <div class="toggle-small ${masDeUna ? "on" : "off"}">
          <div class="toggle-small-circle"></div>
        </div>
      </div>

      <div class="info-fila">
        <span class="info-label">FRECUENCIA:</span>
        <span class="info-valor">${frecuencia}</span>
      </div>

      <div class="info-fila">
        <span class="info-label">VECES AL DÍA:</span>
        <span class="info-valor">${veces}</span>
      </div>

      <div class="info-fila">
        <span class="info-label">CADA (min):</span>
        <span class="info-valor">${minutos}</span>
      </div>

      ${horariosExtra}
    </div>

    <div class="tarjeta-botones">
      <button class="btn-tarjeta btn-realizada" onclick="toggleRealizada(this)">
        Marcar como realizada
        <img src="Iconotick.png">
      </button>

      <button class="btn-tarjeta btn-eliminar" onclick="eliminarTarea(this)">
        Eliminar tarea
        <img src="Iconobasura.png">
      </button>
    </div>
  `;

  cont.appendChild(card);
}

function toggleRealizada(btn) {
  const tarjeta = btn.closest(".tarjeta");
  if (!tarjeta) return;
  tarjeta.classList.toggle("tarjeta-diaria-completada");
}

function eliminarTarea(btn) {
  const tarjeta = btn.closest(".tarjeta");
  if (!tarjeta) return;

  const mensajeNodo = tarjeta.querySelector(".mensaje-texto");
  const titulo = mensajeNodo ? mensajeNodo.textContent.trim() : "";

  if (titulo && typeof postEvent === "function") {
    postEvent(
      "eliminarRecordatorioDiario",
      { titulo: titulo },
      function (resp) {
        console.log("Recordatorio diario eliminado en backend:", resp);
      }
    );
  }

  tarjeta.remove();
}
