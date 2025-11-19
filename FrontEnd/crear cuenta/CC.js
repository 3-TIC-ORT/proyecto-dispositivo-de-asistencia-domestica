// Conexión con el backend usando SoqueTIC
connect2Server();

// Tomo los elementos SIN cambiar class ni id
const inputs = document.querySelectorAll(".campo");
const inputUsuario = inputs[0];
const inputPassword = inputs[1];
const botonConfirmar = document.querySelector(".boton-confirmar");

// Le asigno el click por JS (no hace falta onclick en el HTML)
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

  // Enviar al backend usando SoqueTIC
  postEvent(
    "signup",
    { nombre: nombre, contraseña: contraseña },
    (resp) => {
      if (resp && resp.ok) {
        alert("Cuenta creada con éxito.");
        // Redirigir a la pantalla de inicio
        location.href = "/FrontEnd/pantalla de inicio/inicio.html";
    } else {
        alert(resp?.msg || "Error creando la cuenta.");
    }
  
    }
  );
}
