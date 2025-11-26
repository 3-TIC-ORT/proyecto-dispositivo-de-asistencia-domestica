// Conecto con el backend SoqueTIC (puerto 3000 por defecto)
connect2Server();

var toggleActivo = true;

function abrirModal() {
    document.getElementById('modal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('mensaje').value = '';
    document.getElementById('fecha').value = '';
    document.getElementById('horario').value = '';
    
    toggleActivo = true;
    var circulo = document.getElementById('circulo');
    var toggle = document.getElementById('toggle');
    circulo.style.left = '25px';
    toggle.style.backgroundColor = '#ff5722';
}

function cambiarToggle() {
    var circulo = document.getElementById('circulo');
    var toggle = document.getElementById('toggle');
    
    if (toggleActivo) {
        circulo.style.left = '5px';
        toggle.style.backgroundColor = '#ccc';
        toggleActivo = false;
    } else {
        circulo.style.left = '25px';
        toggle.style.backgroundColor = '#ff5722';
        toggleActivo = true;
    }
}

// Función para formatear la fecha
function formatearFecha(fechaInput) {
    if (!fechaInput) return 'Sin fecha';
    
    var fecha = new Date(fechaInput + 'T00:00:00');
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    var manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    if (fecha.getTime() === hoy.getTime()) {
        return 'Hoy';
    } else if (fecha.getTime() === manana.getTime()) {
        return 'Mañana';
    } else {
        var dia = ('0' + fecha.getDate()).slice(-2);
        var mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
        var año = fecha.getFullYear();
        return dia + '/' + mes + '/' + año;
    }
}

function agregarRecordatorio() {
    var mensaje = document.getElementById('mensaje').value;
    var fecha = document.getElementById('fecha').value;
    var horario = document.getElementById('horario').value;

    if (mensaje && fecha && horario) {

        console.log("→ Voy a crear tarjeta con:", mensaje, fecha, horario);

        // 1) PRIMERO creo la tarjeta en el front
        crearTarjeta(mensaje, fecha, horario, toggleActivo);

        // 2) Después calculo los minutos para el backend
        var avisarAntesMinutos = toggleActivo ? 10 : 0;

        // 3) Intento mandar al backend, pero si falla NO quiero romper el front
        try {
            postEvent(
                "agregarRecordatorio",
                {
                    titulo: mensaje,
                    fecha: fecha,
                    hora: horario,
                    avisarAntesMinutos: avisarAntesMinutos
                },
                function(respuesta) {
                    console.log("Respuesta del backend:", respuesta);
                }
            );
        } catch (err) {
            console.error("Error al llamar a postEvent:", err);
        }

        cerrarModal();
    } else {
        alert('Completa todos los campos');
    }
}
function crearTarjeta(mensaje, fecha, horario, avisar) {
    var contenedor = document.querySelector('.contenedor-objetos');
    var nuevaTarjeta = document.createElement('div');
    nuevaTarjeta.className = 'tarjeta';
    
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
              <div class="toggle-small ${avisar ? 'on' : 'off'}">
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
    const tarjeta = boton.closest('.tarjeta');

    tarjeta.classList.add('tarjeta-realizada');

    boton.textContent = 'Realizada';
    boton.disabled = true;
}

function eliminarTarea(boton) {
    const tarjeta = boton.closest('.tarjeta');
    tarjeta.remove();
}

