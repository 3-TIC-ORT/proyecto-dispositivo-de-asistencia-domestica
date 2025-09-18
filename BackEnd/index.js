function leerUsuarios() {
  try {
    const data = fs.readFileSync("usuarios.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function guardarUsuarios(usuarios) {
  fs.writeFileSync("usuarios.json", JSON.stringify(usuarios, null, 2));
}

function signup(username, password) {
  let usuarios = leerUsuarios();

  if (usuarios.find(u => u.username === username)) {
    console.log("⚠️ El usuario ya existe");
    return;
  }

  usuarios.push({ username, password });
  guardarUsuarios(usuarios);

  console.log("✅ Usuario registrado con éxito");
}

function login(username, password) {
  let usuarios = leerUsuarios();

  const user = usuarios.find(u => u.username === username && u.password === password);
  if (user) {
    console.log("✅ Login exitoso, bienvenido " + username);
  } else {
    console.log("❌ Usuario o contraseña incorrectos");
  }
}

// --- DEMO ---
// PRIMERA EJECUCIÓN: registra a juan
signup("juan", "1234");