function abrirModal() {
    document.getElementById('modal').classList.add('activo');
  }

  function cerrarModal() {
    document.getElementById('modal').classList.remove('activo');
  }

  function toggleSwitch(element) {
    element.classList.toggle('activo');
  }

  document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
      cerrarModal();
    }
  });