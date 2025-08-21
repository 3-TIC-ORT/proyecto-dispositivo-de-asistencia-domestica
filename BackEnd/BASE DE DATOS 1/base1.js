const usuarios = {
    "usuarios": [
      { "nombre": "juan", "contraseña": "12345" },
      { "nombre": "maria", "contraseña": "abcd" },
      { "nombre": "pedro", "contraseña": "qwerty" }
    ]
  };
  
  const nombreInput = prompt("Ingresa tu nombre de usuario:");
  const contraseñaInput = prompt("Ingresa tu contraseña:");
  
  const usuarioEncontrado = usuarios.usuarios.find(
    u => u.nombre === nombreInput && u.contraseña === contraseñaInput
  );
  
  if (usuarioEncontrado) {
    alert("¡Inicio de sesión exitoso!");
  } else {
    alert("Usuario o contraseña incorrectos.");
  }