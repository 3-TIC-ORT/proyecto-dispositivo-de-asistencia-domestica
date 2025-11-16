const inputNombre = document.getElementById("inputNombre");
const editarBtn = document.getElementById("editarBtn");



// Ajustar ancho automáticamente
function autoResize() {
    inputNombre.style.width = (inputNombre.value.length + 1) + "ch";
}

// Llamar una vez al inicio
autoResize();

// Al tocar el lapicito → habilitar edición
editarBtn.addEventListener("click", () => {
    inputNombre.disabled = false;
    inputNombre.focus();

    // Colocar cursor al final
    inputNombre.selectionStart = inputNombre.value.length;
    inputNombre.selectionEnd = inputNombre.value.length;
});

// Detectar cambios en tiempo real
inputNombre.addEventListener("input", autoResize);

// Cuando pierde foco → guardar y bloquear
inputNombre.addEventListener("blur", () => {
    inputNombre.disabled = true;
    localStorage.setItem("nombreUsuario", inputNombre.value.trim());
});
