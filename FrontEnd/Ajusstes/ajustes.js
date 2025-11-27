const inputNombre = document.getElementById("inputNombre");
const editarBtn = document.getElementById("editarBtn");



function autoResize() {
    inputNombre.style.width = (inputNombre.value.length + 1) + "ch";
}


autoResize();


editarBtn.addEventListener("click", () => {
    inputNombre.disabled = false;
    inputNombre.focus();

    inputNombre.selectionStart = inputNombre.value.length;
    inputNombre.selectionEnd = inputNombre.value.length;
});

inputNombre.addEventListener("input", autoResize);

inputNombre.addEventListener("blur", () => {
    inputNombre.disabled = true;
    localStorage.setItem("nombreUsuario", inputNombre.value.trim());
});
