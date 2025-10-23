function abrirModal() {
    document.getElementById('modal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('mensaje').value = '';
    document.getElementById('fecha').value = '';
    document.getElementById('horario').value = '';
}

function agregarRecordatorio() {
    var mensaje = document.getElementById('mensaje').value;
    var fecha = document.getElementById('fecha').value;
    var horario = document.getElementById('horario').value;

    if (mensaje != '' && fecha != '' && horario != '') {
        alert('Recordatorio agregado!');
        cerrarModal();
    } else {
        alert('Completa todos los campos');
    }
}

var toggleActivo = true;

function cambiarToggle() {
    var circulo = document.getElementById('circulo');
    var toggle = document.getElementById('toggle');
    
    if (toggleActivo) {
        circulo.style.left = '5px';
        toggle.style.backgroundColor = '#ccc';
        toggleActivo = false;
    } else {
        circulo.style.left = '25px';
        toggle.style.backgroundColor = '#ff5722';
        toggleActivo = true;
    }
}
