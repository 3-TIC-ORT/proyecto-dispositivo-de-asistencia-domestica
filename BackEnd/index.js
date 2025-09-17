import fs from "fs";

// Leer usuarios
function leerUsuarios() {
  return JSON.parse(fs.readFileSync("usuarios.json", "utf-8"));
}

// Guardar usuarios
function guardarUsuarios(usuarios) {
  fs.writeFileSync("usuarios.json", JSON.stringify(usuarios, null, 2));
}

// Signup
function signup(username, password) {
  let usuarios = leerUsuarios();

  if (usuarios.find(u => u.username === username)) {
    console.log("⚠️ El usuario ya existe");
    return;
  }

  usuarios.push({ username, password });
  guardarUsuarios(usuarios);
  console.log("Usuario registrado con éxito");
}

// Login
function login(username, password) {
  let usuarios = leerUsuarios();

  const user = usuarios.find(u => u.username === username && u.password === password);
  if (user) {
    console.log("Login exitoso, bienvenido " + username);
  } else {
    console.log(" Usuario o contraseña incorrectos");
  }
}

// ---- DEMO ----
signup("juan", "1234");
login("juan", "1234");
login("juan", "xxxx");