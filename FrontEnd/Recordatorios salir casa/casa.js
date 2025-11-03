// --- 1. Obtener Referencias a los Elementos ---
// (Asegurate de que tu casa.html tenga estos IDs)

const modal = document.getElementById('modalObjeto');
const inputNombreObjeto = document.getElementById('nombreObjeto');
const contenedor = document.getElementById('contenedorObjetos');

// --- 2. Funciones de Apertura y Cierre del Modal ---

/**
 * Abre el modal de objetos usando la clase 'activo'.
 */
function abrirModalObjeto() {
    if (modal) {
        modal.classList.add('activo');
    }
}

/**
 * Cierra el modal de objetos y limpia el input.
 */
function cerrarModalObjeto() {
    if (modal) {
        modal.classList.remove('activo');
        if (inputNombreObjeto) {
            inputNombreObjeto.value = ''; // Limpiar el input
        }
    }
}

// --- 3. Funciones Principales (Agregar, Crear, Eliminar) ---

/**
 * Función que se llama al apretar "Agregar" en el modal.
 * Obtiene los datos, los valida y llama a crearTarjetaObjeto.
 */
function agregarObjeto() {
    const nombreObjeto = inputNombreObjeto.value.trim();

    if (nombreObjeto) {
        // Convertir a mayúsculas como en la imagen
        crearTarjetaObjeto(nombreObjeto.toUpperCase()); 
        cerrarModalObjeto();
    } else {
        alert('Por favor, ingresa el nombre del objeto.');
    }
}

/**
 * Crea el HTML de la nueva tarjeta y la añade al DOM.
 * @param {string} nombre - El nombre del objeto para la tarjeta.
 */
function crearTarjetaObjeto(nombre) {
    const nuevaTarjeta = document.createElement('div');
    // Asegurate que tu .css tenga esta clase
    nuevaTarjeta.className = 'tarjeta-objeto'; 
    
    // Definir el HTML interno de la tarjeta
    nuevaTarjeta.innerHTML = `
        <span class="nombre-objeto">${nombre}</span>
        <button class="btn-eliminar-objeto" onclick="eliminarObjeto(this)">
            <i class="fas fa-trash-alt"></i> Eliminar objeto
        </button>
    `;
    
    // Agregar la nueva tarjeta al contenedor
    if (contenedor) {
        // Busca el botón de agregar
        const botonAgregar = contenedor.querySelector('.boton-agregar-objeto');
        
        if (botonAgregar) {
            // Inserta la nueva tarjeta justo después del botón "+"
            botonAgregar.parentNode.insertBefore(nuevaTarjeta, botonAgregar.nextSibling);
        } else {
            // Si no encuentra el botón, lo agrega al final (menos ideal)
            contenedor.appendChild(nuevaTarjeta);
        }
    }
}

/**
 * Elimina la tarjeta al hacer clic en el botón "Eliminar".
 * @param {HTMLElement} boton - El botón "Eliminar" que fue presionado.
 */
function eliminarObjeto(boton) {
    // .closest() busca el ancestro más cercano que coincida con .tarjeta-objeto
    const tarjeta = boton.closest('.tarjeta-objeto'); 
    if (tarjeta) {
        tarjeta.remove();
    }
}

if (modal) {
    modal.addEventListener('click', function(e) {
        // Si el clic fue sobre el fondo (el modal) y no sobre el contenido
        if (e.target === modal) { 
            cerrarModalObjeto();
        }
    });
}