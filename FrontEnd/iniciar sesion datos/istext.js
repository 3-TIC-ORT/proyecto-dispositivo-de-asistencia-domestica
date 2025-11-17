// Conexión con el servidor SoqueTIC (por defecto puerto 3000)
connect2Server(); // porque en el backend hiciste startServer(3000, true);

// Referencias a los elementos del DOM
const inputUsuario = document.getElementById("usuario");
const inputContrasena = document.getElementById("contrasena");
const btnLogin = document.getElementById("btnLogin");
const mensajeError = document.getElementById("mensajeError");

// Escuchar click en el botón "Confirmar"
btnLogin.addEventListener("click", (e) => {
  e.preventDefault(); // evitamos recargar la página

  // Limpiar mensaje previo
  mensajeError.textContent = "";

  const username = inputUsuario.value.trim();
  const password = inputContrasena.value;

  // Validación básica
  if (!username || !password) {
    mensajeError.textContent = "Completá usuario y contraseña.";
    return;
  }

  // Enviar al backend usando SoqueTIC
  postEvent(
    "login",
    { username: username, password: password },
    (data) => {
      // data viene de subscribePOSTEvent("login", ...) del backend
      if (data.ok) {
        // Login correcto: ir a inicio.html
        // Uso la misma ruta que tenías en el onclick original:
        window.location.href = "/FrontEnd/pantalla de inicio/inicio.html";
      } else {
        // Login incorrecto: mostrar mensaje
        mensajeError.textContent = data.msg || "Usuario o contraseña incorrectos.";
      }
    }
  );
});
