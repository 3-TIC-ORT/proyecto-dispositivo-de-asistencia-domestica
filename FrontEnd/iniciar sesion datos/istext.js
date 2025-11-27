connect2Server();

const inputUsuario   = document.getElementById("usuario");
const inputPassword  = document.getElementById("contrasena");
const mensajeError   = document.getElementById("mensajeError");
const botonLogin     = document.getElementById("btnLogin");

if (botonLogin) {
  botonLogin.addEventListener("click", iniciarSesion);
}

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

  mensajeError.textContent = "";

  if (!username || !password) {
    mensajeError.textContent = "Completá usuario y contraseña.";
    return;
  }

 
  postEvent(
    "login",
    { username: username, password: password },
    (resp) => {
      if (resp && resp.ok) {
       
        location.href = "/FrontEnd/pantalla de inicio/inicio.html";
      } else {
        mensajeError.textContent = resp?.msg || "Usuario o contraseña incorrectos.";
      }
    }
  );
}
