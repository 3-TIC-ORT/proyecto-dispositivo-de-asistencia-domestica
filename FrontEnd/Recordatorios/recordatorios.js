connect2Server();

var toggleActivo = true;

document.addEventListener("DOMContentLoaded", function () {
  var contenedor = document.querySelector(".contenedor-objetos");
  if (!contenedor) return;
  if (typeof getEvent !== "function") return;

  getEvent("listarRecordatorios", function (lista) {
    if (!Array.isArray(lista)) {
      console.warn("listarRecordatorios devolvió algo raro:", lista);
      return;
    }

    lista.forEach(function (rec) {
      if (!rec || !rec.titulo) return;

      var mensaje = rec.titulo;
      var fecha = rec.fecha || "";
      var horario = rec.hora || "";

      var minutosAviso =
        typeof rec.avisarAntesMinutos === "number"
          ? rec.avisarAntesMinutos
          : 10;
      var avisar = minutosAviso > 0;

      crearTarjeta(mensaje, fecha, horario, avisar);
    });
  });
});

function abrirModal() {
  document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("mensaje").value = "";
  document.getElementById("fecha").value = "";
  document.getElementById("horario").value = "";

  toggleActivo = true;
  var circulo = document.getElementById("circulo");
  var toggle = document.getElementById("toggle");
  circulo.style.left = "25px";
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
    circulo.style.left = "25px";
    toggle.style.backgroundColor = "#ff5722";
    toggleActivo = true;
  }
}

function formatearFecha(fechaInput) {
  if (!fechaInput) return "Sin fecha";

  var fecha = new Date(fechaInput + "T00:00:00");
  var hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  var manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  if (fecha.getTime() === hoy.getTime()) {
    return "Hoy";
  } else if (fecha.getTime() === manana.getTime()) {
    return "Mañana";
  } else {
    var dia = ("0" + fecha.getDate()).slice(-2);
    var mes = ("0" + (fecha.getMonth() + 1)).slice(-2);
    var año = fecha.getFullYear();
    return dia + "/" + mes + "/" + año;
  }
}

function agregarRecordatorio() {
  var mensaje = document.getElementById("mensaje").value;
  var fecha = document.getElementById("fecha").value;
  var horario = document.getElementById("horario").value;

  if (!mensaje || !fecha || !horario) {
    alert("Completa todos los campos");
    return;
  }

  var avisarAntesMinutos = toggleActivo ? 10 : 0;

  crearTarjeta(mensaje, fecha, horario, toggleActivo);

  if (typeof postEvent === "function") {
    postEvent(
      "agregarRecordatorio",
      {
        titulo: mensaje,
        fecha: fecha,
        hora: horario,
        avisarAntesMinutos: avisarAntesMinutos
      },
      function (respuesta) {
        console.log("Respuesta del backend:", respuesta);
      }
    );
  }

  cerrarModal();
}

function crearTarjeta(mensaje, fecha, horario, avisar) {
  var contenedor = document.querySelector(".contenedor-objetos");
  var nuevaTarjeta = document.createElement("div");
  nuevaTarjeta.className = "tarjeta";

  var fechaFormateada = formatearFecha(fecha);

  nuevaTarjeta.innerHTML = `
    <div class="tarjeta-header">
        <span class="mensaje-label">MENSAJE:</span>
        <span class="mensaje-texto">${mensaje}</span>
    </div>

    <div class="tarjeta-info">
        <div class="tarjeta-info-titulo">INFORMACIÓN ADICIONAL</div>

        <div class="info-fila-doble">
            <div class="info-group">
                <span class="info-label">FECHA:</span>
                <span class="info-valor">${fechaFormateada}</span>
            </div>
            <div class="info-group">
                <span class="info-label">HORARIO:</span>
                <span class="info-valor">${horario}</span>
            </div>
        </div>

        <div class="avisar-antes">
            <span class="info-label">AVISAR ANTES:</span>
            <div class="toggle-small ${avisar ? "on" : "off"}">
                <div class="toggle-small-circle"></div>
            </div>
        </div>
    </div>

    <div class="tarjeta-botones">
        <button class="btn-tarjeta btn-realizada" onclick="marcarRealizada(this)">
            Marcar como realizada
            <img src="Iconotick.png">
        </button>

        <button class="btn-tarjeta btn-eliminar" onclick="eliminarTarea(this)">
            Eliminar tarea
            <img src="Iconobasura.png">
        </button>
    </div>
  `;

  contenedor.appendChild(nuevaTarjeta);
}

function marcarRealizada(boton) {
  const tarjeta = boton.closest(".tarjeta");
  if (!tarjeta) return;

  const mensajeNodo = tarjeta.querySelector(".mensaje-texto");
  const valores = tarjeta.querySelectorAll(".info-valor");

  const mensaje = mensajeNodo ? mensajeNodo.textContent.trim() : "";
  const fechaTexto = valores[0] ? valores[0].textContent.trim() : "";
  const horaTexto = valores[1] ? valores[1].textContent.trim() : "";

  const textoTarea = mensaje + " · " + fechaTexto + " · " + horaTexto;

  if (typeof postEvent === "function") {
    postEvent(
      "agregarTarea",
      { tarea: textoTarea },
      function (resp) {
        console.log("Tarea enviada a tareas:", resp);

        if (resp && resp.ok) {
          postEvent(
            "marcarTareaRealizada",
            { tarea: textoTarea },
            function (resp2) {
              console.log("Tarea marcada como realizada:", resp2);
            }
          );
        }
      }
    );
  }

  tarjeta.remove();
}

function eliminarTarea(boton) {
  const tarjeta = boton.closest(".tarjeta");
  if (!tarjeta) return;
  tarjeta.remove();
}
