if (typeof connect2Server === "function") {
  connect2Server();
}

const inputUsuarioLogin = document.getElementById("usuario");
const inputPasswordLogin = document.getElementById("contrasena");
const mensajeError = document.getElementById("mensajeError");
const botonLogin = document.getElementById("btnLogin");

if (botonLogin) {
  botonLogin.addEventListener("click", iniciarSesion);
}

[inputUsuarioLogin, inputPasswordLogin].forEach((input) => {
  if (!input) return;
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      iniciarSesion();
    }
  });
});

function iniciarSesion() {
  const username = inputUsuarioLogin.value.trim();
  const password = inputPasswordLogin.value.trim();

  if (mensajeError) {
    mensajeError.textContent = "";
  }

  if (!username || !password) {
    if (mensajeError) {
      mensajeError.textContent = "Completá usuario y contraseña.";
    } else {
      alert("Completá usuario y contraseña.");
    }
    return;
  }

  postEvent(
    "login",
    { username: username, password: password },
    (resp) => {
      if (resp && resp.ok) {
        location.href = "../pantalla de inicio/inicio.html";
      } else {
        const msg = resp && resp.msg ? resp.msg : "Usuario o contraseña incorrectos.";
        if (mensajeError) {
          mensajeError.textContent = msg;
        } else {
          alert(msg);
        }
      }
    }
  );
}
