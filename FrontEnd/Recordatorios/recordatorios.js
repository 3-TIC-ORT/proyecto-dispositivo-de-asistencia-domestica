// Variable para el estado del toggle
var toggleActivo = true;

// Función para abrir el modal
function abrirModal() {
    document.getElementById('modal').style.display = 'flex';
}

// Función para cerrar el modal
function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('mensaje').value = '';
    document.getElementById('fecha').value = '';
    document.getElementById('horario').value = '';
    // Resetear toggle
    toggleActivo = true;
    var circulo = document.getElementById('circulo');
    var toggle = document.getElementById('toggle');
    circulo.style.left = '25px';
    toggle.style.backgroundColor = '#ff5722';
}

// Función para cambiar el toggle
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

// Función para agregar recordatorio
function agregarRecordatorio() {
    var mensaje = document.getElementById('mensaje').value;
    var fecha = document.getElementById('fecha').value;
    var horario = document.getElementById('horario').value;

    if (mensaje != '' && fecha != '' && horario != '') {
        // Crear nueva tarjeta
        crearTarjeta(mensaje, fecha, horario, toggleActivo);
        cerrarModal();
    } else {
        alert('Completa todos los campos');
    }
}

// Función para crear una nueva tarjeta
function crearTarjeta(mensaje, fecha, horario, avisar) {
    var contenedor = document.querySelector('.contenedor');
    var nuevaTarjeta = document.createElement('div');
    nuevaTarjeta.className = 'tarjeta';
    
    var fechaFormateada = formatearFecha(fecha);
    var toggleColor = avisar ? '#ff5722' : '#ccc';
    var togglePosicion = avisar ? '25px' : '5px';
    
    nuevaTarjeta.innerHTML = `
        <div class="tarjeta-header">
            <span class="mensaje-label">MENSAJE:</span>
            <span class="mensaje-texto">${mensaje}</span>
        </div>
        <div class="tarjeta-info">
            <div class="info-titulo">INFORMACIÓN ADICIONAL</div>
            <div class="info-detalles">
                <div class="info-item">
                    <span class="info-label">FECHA:</span>
                    <span class="info-valor">${fechaFormateada}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">HORARIO:</span>
                    <span class="info-valor">${horario}</span>
                </div>
            </div>
            <div class="avisar-antes">
                <span>AVISAR ANTES:</span>
                <div class="toggle" style="background-color: ${toggleColor}">
                    <div class="toggle-circulo" style="left: ${togglePosicion}"></div>
                </div>
            </div>
        </div>
        <div class="tarjeta-botones">
            <button class="btn-tarjeta btn-realizada" onclick="marcarRealizada(this)">
                Marcar como realizada ✓
            </button>
            <button class="btn-tarjeta btn-eliminar" onclick="eliminarTarea(this)">
                Eliminar tarea 🗑️
            </button>
        </div>
    `;
    
    contenedor.appendChild(nuevaTarjeta);
}

// Función para marcar tarea como realizada
function marcarRealizada(boton) {
    var tarjeta = boton.closest('.tarjeta');
    tarjeta.style.opacity = '0.6';
    
    var mensajeTexto = tarjeta.querySelector('.mensaje-texto');
    mensajeTexto.style.textDecoration = 'line-through';
    
    boton.disabled = true;
    boton.style.cursor = 'not-allowed';
    boton.style.opacity = '0.7';
    boton.textContent = 'Realizada ✓';
}

// Función para eliminar tarea
function eliminarTarea(boton) {
    var tarjeta = boton.closest('.tarjeta');
    tarjeta.style.transition = 'all 0.3s ease';
    tarjeta.style.transform = 'scale(0)';
    tarjeta.style.opacity = '0';
    
    setTimeout(function() {
        tarjeta.remove();
    }, 300);
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    var modal = document.getElementById('modal');
    if (event.target === modal) {
        cerrarModal();
    }
}