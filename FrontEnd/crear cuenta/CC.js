if (typeof connect2Server === "function") {
  connect2Server();
}

const camposSignup = document.querySelectorAll(".campo");
const inputUsuarioSignup = camposSignup[0];
const inputPasswordSignup = camposSignup[1];
const botonConfirmar = document.querySelector(".boton-confirmar");

if (botonConfirmar) {
  botonConfirmar.addEventListener("click", crearCuenta);
}

function crearCuenta() {
  const username = inputUsuarioSignup.value.trim();
  const password = inputPasswordSignup.value.trim();

  if (!username || !password) {
    alert("Por favor completá todos los campos.");
    return;
  }

  postEvent(
    "signup",
    { username: username, password: password },
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
