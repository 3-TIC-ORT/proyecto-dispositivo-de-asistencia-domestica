if (typeof connect2Server === "function") {
  connect2Server();
}

const inputs = document.querySelectorAll(".campo");
const inputUsuario = inputs[0];
const inputPassword = inputs[1];
const botonConfirmar = document.querySelector(".boton-confirmar");

if (botonConfirmar) {
  botonConfirmar.addEventListener("click", crearCuenta);
}

function crearCuenta() {
  const nombre = inputUsuario.value.trim();
  const contraseña = inputPassword.value.trim();

  if (!nombre || !contraseña) {
    alert("Por favor completá todos los campos.");
    return;
  }

  postEvent(
    "signup",
    { nombre: nombre, contraseña: contraseña },
    (resp) => {
      if (resp && resp.ok) {
        alert("Cuenta creada con éxito.");
        location.href = "../pantalla de inicio/inicio.html";
      } else {
        alert(resp && resp.msg ? resp.msg : "Error creando la cuenta.");
      }
    }
  );
}
