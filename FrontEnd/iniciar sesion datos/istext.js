// Conectamos con el backend usando SoqueTIC
connect2Server();

// Tomamos los elementos del DOM
const inputUsuario   = document.getElementById("usuario");
const inputPassword  = document.getElementById("contrasena");
const mensajeError   = document.getElementById("mensajeError");
const botonLogin     = document.getElementById("btnLogin");

// Escuchamos el click en el botón "Confirmar"
if (botonLogin) {
  botonLogin.addEventListener("click", iniciarSesion);
}

// (Opcional) Enter para iniciar sesión
[ inputUsuario, inputPassword ].forEach((input) => {
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      iniciarSesion();
    }
  });
});

function iniciarSesion() {
  const username = inputUsuario.value.trim();
  const password = inputPassword.value.trim();

  // Limpiar mensaje previo
  mensajeError.textContent = "";

  if (!username || !password) {
    mensajeError.textContent = "Completá usuario y contraseña.";
    return;
  }

  // Llamamos al backend: evento "login"
  // El backend espera { username, password }
  postEvent(
    "login",
    { username: username, password: password },
    (resp) => {
      if (resp && resp.ok) {
        // Opcional: alert de éxito
        // alert(resp.msg || "Inicio de sesión exitoso.");
        // Redirigir a la pantalla de inicio
        location.href = "/FrontEnd/pantalla de inicio/inicio.html";
      } else {
        mensajeError.textContent = resp?.msg || "Usuario o contraseña incorrectos.";
      }
    }
  );
}
