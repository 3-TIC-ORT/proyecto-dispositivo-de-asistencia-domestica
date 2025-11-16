// ===============================
//   VARIABLES
// ===============================
var toggleActivo = true; // Avisar antes

// ===============================
//   MODAL
// ===============================
function abrirModal() {
    document.getElementById('modal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';

    document.getElementById('mensaje').value = '';
    document.getElementById('frecuencia').value = '';
    document.getElementById('veces').value = '';
    document.getElementById('minutos').value = '';
    document.getElementById('horaInicio').value = '';
    document.getElementById('horaFin').value = '';

    toggleActivo = true;
    var circulo = document.getElementById('circulo');
    var toggle = document.getElementById('toggle');
    circulo.style.left = '28px';
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
        circulo.style.left = '28px';
        toggle.style.backgroundColor = '#ff5722';
        toggleActivo = true;
    }
}

// ===============================
//   AGREGAR TARJETA
// ===============================
function agregarRecordatorio() {
    var mensaje = document.getElementById('mensaje').value.trim();
    var frecuencia = document.getElementById('frecuencia').value;
    var veces = document.getElementById('veces').value.trim();
    var minutos = document.getElementById('minutos').value.trim();
    var horaInicio = document.getElementById('horaInicio').value;
    var horaFin = document.getElementById('horaFin').value;

    if (mensaje !== '' && frecuencia !== '' && veces !== '' && minutos !== '') {
        crearTarjeta(mensaje, toggleActivo, frecuencia, veces, minutos, horaInicio, horaFin);
        cerrarModal();
    } else {
        alert('Completa mensaje, frecuencia, veces al día y minutos entre repeticiones');
    }
}

// ===============================
//   CREAR TARJETA
// ===============================
function crearTarjeta(mensaje, avisar, frecuencia, veces, minutos, horaInicio, horaFin) {
    var cont = document.querySelector('.contenedor-objetos');
    var card = document.createElement('div');
    card.className = 'tarjeta';

    var masDeUna = parseInt(veces, 10) > 1;

    // filas opcionales
    var horariosExtra = '';

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
                <div class="toggle-small ${avisar ? 'on' : 'off'}">
                    <div class="toggle-small-circle"></div>
                </div>
            </div>

            <div class="mas-veces-dia">
                <span class="info-label">MAS DE UNA VEZ AL DIA:</span>
                <div class="toggle-small ${masDeUna ? 'on' : 'off'}">
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

    cont.appendChild(card);
}

// ===============================
//   ACCIONES DE BOTONES
// ===============================
function marcarRealizada(btn) {
    const tarjeta = btn.closest('.tarjeta');
    tarjeta.remove();
}

function eliminarTarea(btn) {
    const tarjeta = btn.closest('.tarjeta');
    tarjeta.remove();
}
