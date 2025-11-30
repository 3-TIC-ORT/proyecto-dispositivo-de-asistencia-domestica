if (typeof connect2Server === "function") {
    connect2Server();
  }
  
  const modal = document.getElementById("modalObjeto");
  const inputNombreObjeto = document.getElementById("nombreObjeto");
  const contenedor = document.getElementById("contenedorObjetos");
  
  document.addEventListener("DOMContentLoaded", function () {
  if (typeof getEvent !== "function") return;

  getEvent("listarObjetos", function (lista) {
    if (!Array.isArray(lista)) return;

    lista.forEach(function (obj) {
      if (obj && obj.objeto) {
        crearTarjetaObjeto(obj.objeto);
      }
    });
  });
});

  
  function abrirModalObjeto() {
    if (modal) modal.classList.add("activo");
  }
  
  function cerrarModalObjeto() {
    if (!modal) return;
    modal.classList.remove("activo");
    if (inputNombreObjeto) inputNombreObjeto.value = "";
  }
  
  function agregarObjeto() {
  const nombreObjeto = inputNombreObjeto.value.trim();
  if (!nombreObjeto) {
    alert("Por favor, ingresa el nombre del objeto.");
    return;
  }

  const normalizado = nombreObjeto.toUpperCase();

  crearTarjetaObjeto(normalizado);

  if (typeof postEvent === "function") {
    postEvent("agregarObjeto", { objeto: normalizado }, function (resp) {
      console.log("Objeto guardado en backend:", resp);
    });
  }

  cerrarModalObjeto();
}

  
  function crearTarjetaObjeto(nombre) {
    const nuevaTarjeta = document.createElement("div");
    nuevaTarjeta.className = "tarjeta-objeto";
  
    nuevaTarjeta.innerHTML = `
      <span class="nombre-objeto">${nombre}</span>
      <button class="btn-eliminar-objeto" onclick="eliminarObjeto(this)">
        <i class="fas fa-trash-alt"></i> Eliminar objeto
      </button>
    `;
  
    if (!contenedor) return;
    const botonAgregar = contenedor.querySelector(".boton-agregar-objeto");
    if (botonAgregar && botonAgregar.parentNode) {
      botonAgregar.parentNode.insertBefore(nuevaTarjeta, botonAgregar.nextSibling);
    } else {
      contenedor.appendChild(nuevaTarjeta);
    }
  }
  
  function eliminarObjeto(boton) {
    const tarjeta = boton.closest(".tarjeta-objeto");
    if (!tarjeta) return;
  
    const nombreSpan = tarjeta.querySelector(".nombre-objeto");
    const nombre = nombreSpan ? nombreSpan.textContent.trim() : "";
  
    if (nombre && typeof postEvent === "function") {
      postEvent("eliminarObjeto", { objeto: nombre }, function (resp) {
        console.log("Objeto eliminado en backend:", resp);
      });
    }
  
    tarjeta.remove();
  }
  
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        cerrarModalObjeto();
      }
    });
  }
  