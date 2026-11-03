let estudianteActual = null;
let idEditando = null;
let idDetalle = null;
let idPorEliminar = null;

const $ = (id) => document.getElementById(id);

async function llamar(ruta, opciones = {}) {
  const respuesta = await fetch('/api' + ruta, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      'x-estudiante-id': estudianteActual || '',
    },
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(datos.error || 'Ocurrió un error inesperado');
  }
  return datos;
}

function formatearFecha(texto) {
  return new Date(texto).toLocaleString('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function mostrarAviso(texto, esError = false) {
  const aviso = $('aviso');
  aviso.textContent = texto;
  aviso.className = esError ? 'aviso aviso-error' : 'aviso';
  aviso.hidden = false;
  setTimeout(() => { aviso.hidden = true; }, 3000);
}

function crearBoton(texto, clase, alHacerClic) {
  const boton = document.createElement('button');
  boton.className = 'btn ' + clase;
  boton.textContent = texto;
  boton.addEventListener('click', alHacerClic);
  return boton;
}

async function cargarEstudiantes() {
  const estudiantes = await llamar('/estudiantes');
  const select = $('select-estudiante');
  const estudiantePrevio = estudianteActual;
  select.innerHTML = '';
  estudiantes.forEach((e) => {
    const opcion = document.createElement('option');
    opcion.value = e.id;
    opcion.textContent = e.nombre;
    select.appendChild(opcion);
  });
  if (estudiantes.some((e) => String(e.id) === estudiantePrevio)) {
    select.value = estudiantePrevio;
  }
  estudianteActual = select.value;
}

async function cargarMaterias(idSeleccionado = $('campo-materia').value) {
  const materias = await llamar('/materias');
  const select = $('campo-materia');
  select.innerHTML = '';
  const vacia = document.createElement('option');
  vacia.value = '';
  vacia.textContent = 'Selecciona una materia';
  select.appendChild(vacia);
  materias.forEach((m) => {
    const opcion = document.createElement('option');
    opcion.value = m.id;
    opcion.textContent = m.nombre;
    select.appendChild(opcion);
  });
  if (materias.some((m) => String(m.id) === String(idSeleccionado))) {
    select.value = idSeleccionado;
  }
}

function crearTarjeta(apunte) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta';

  const etiqueta = document.createElement('span');
  etiqueta.className = 'etiqueta';
  etiqueta.textContent = apunte.materia;

  const titulo = document.createElement('h3');
  titulo.textContent = apunte.titulo;

  const fecha = document.createElement('p');
  fecha.className = 'fecha';
  fecha.textContent = 'Creado: ' + formatearFecha(apunte.fecha_creacion);

  const acciones = document.createElement('div');
  acciones.className = 'acciones';
  acciones.append(
    crearBoton('Ver', 'btn-primario', () => abrirDetalle(apunte.id)),
    crearBoton('Editar', 'btn-secundario', () => abrirFormularioEdicion(apunte.id)),
    crearBoton('Eliminar', 'btn-peligro', () => pedirConfirmacion(apunte.id))
  );

  tarjeta.append(etiqueta, titulo, fecha, acciones);
  return tarjeta;
}

async function cargarApuntes() {
  const apuntes = await llamar('/apuntes');
  const lista = $('lista-apuntes');
  lista.innerHTML = '';
  apuntes.forEach((a) => lista.appendChild(crearTarjeta(a)));
  $('mensaje-vacio').hidden = apuntes.length > 0;
}

async function abrirDetalle(id) {
  try {
    const a = await llamar('/apuntes/' + id);
    idDetalle = id;
    $('detalle-materia').textContent = a.materia;
    $('detalle-titulo').textContent = a.titulo;
    $('detalle-contenido').textContent = a.contenido;
    let fechas = 'Creado: ' + formatearFecha(a.fecha_creacion);
    if (a.fecha_modificacion) {
      fechas += ' | Modificado: ' + formatearFecha(a.fecha_modificacion);
    }
    $('detalle-fechas').textContent = fechas;
    $('ventana-detalle').showModal();
  } catch (error) {
    mostrarAviso(error.message, true);
  }
}

function abrirFormularioNuevo() {
  idEditando = null;
  $('titulo-formulario').textContent = 'Nuevo apunte';
  $('formulario').reset();
  $('error-formulario').textContent = '';
  $('error-formulario').hidden = true;
  $('ventana-formulario').showModal();
  $('campo-titulo').focus();
}

async function abrirFormularioEdicion(id) {
  try {
    const a = await llamar('/apuntes/' + id);
    idEditando = id;
    $('titulo-formulario').textContent = 'Editar apunte';
    $('campo-titulo').value = a.titulo;
    $('campo-materia').value = a.id_materia;
    $('campo-contenido').value = a.contenido;
    $('error-formulario').textContent = '';
    $('error-formulario').hidden = true;
    $('ventana-formulario').showModal();
  } catch (error) {
    mostrarAviso(error.message, true);
  }
}

async function guardarApunte(evento) {
  evento.preventDefault();
  const campos = [
    { id: 'campo-titulo', nombre: 'el título', valor: $('campo-titulo').value.trim() },
    { id: 'campo-materia', nombre: 'una materia', valor: $('campo-materia').value },
    { id: 'campo-contenido', nombre: 'el contenido', valor: $('campo-contenido').value.trim() },
  ];
  const faltantes = campos.filter((campo) => !campo.valor);
  const zonaError = $('error-formulario');
  if (faltantes.length > 0) {
    zonaError.textContent = `Completa los campos obligatorios: ${faltantes.map((campo) => campo.nombre).join(', ')}.`;
    zonaError.hidden = false;
    $(faltantes[0].id).focus();
    return;
  }
  zonaError.textContent = '';
  zonaError.hidden = true;

  const datos = {
    titulo: $('campo-titulo').value.trim(),
    idMateria: $('campo-materia').value,
    contenido: $('campo-contenido').value.trim(),
  };
  try {
    if (idEditando) {
      await llamar('/apuntes/' + idEditando, { method: 'PUT', body: JSON.stringify(datos) });
      mostrarAviso('Apunte actualizado');
    } else {
      await llamar('/apuntes', { method: 'POST', body: JSON.stringify(datos) });
      mostrarAviso('Apunte guardado');
    }
    $('ventana-formulario').close();
    await cargarApuntes();
  } catch (error) {
    const zonaError = $('error-formulario');
    zonaError.textContent = error.message;
    zonaError.hidden = false;
  }
}

function pedirConfirmacion(id) {
  idPorEliminar = id;
  $('ventana-confirmar').showModal();
}

async function confirmarEliminacion() {
  try {
    await llamar('/apuntes/' + idPorEliminar + '?confirmar=true', { method: 'DELETE' });
    $('ventana-confirmar').close();
    mostrarAviso('Apunte eliminado');
    await cargarApuntes();
  } catch (error) {
    $('ventana-confirmar').close();
    mostrarAviso(error.message, true);
  }
}

function abrirFormularioEntidad(tipo) {
  const esEstudiante = tipo === 'estudiante';
  const dialogo = esEstudiante ? 'ventana-estudiante' : 'ventana-materia';
  const formulario = esEstudiante ? 'formulario-estudiante' : 'formulario-materia';
  const campo = esEstudiante ? 'campo-estudiante' : 'campo-nueva-materia';
  const error = esEstudiante ? 'error-estudiante' : 'error-materia';
  $(formulario).reset();
  $(error).textContent = '';
  $(error).hidden = true;
  $(dialogo).showModal();
  $(campo).focus();
}

async function guardarEntidad(evento, tipo) {
  evento.preventDefault();
  const esEstudiante = tipo === 'estudiante';
  const nombre = $(esEstudiante ? 'campo-estudiante' : 'campo-nueva-materia').value;
  const error = $(esEstudiante ? 'error-estudiante' : 'error-materia');
  const dialogo = $(esEstudiante ? 'ventana-estudiante' : 'ventana-materia');

  if (!nombre.trim()) {
    error.textContent = esEstudiante
      ? 'Escribe el nombre del estudiante.'
      : 'Escribe el nombre de la materia.';
    error.hidden = false;
    $(esEstudiante ? 'campo-estudiante' : 'campo-nueva-materia').focus();
    return;
  }

  try {
    const entidad = await llamar('/' + (esEstudiante ? 'estudiantes' : 'materias'), {
      method: 'POST',
      body: JSON.stringify({ nombre: nombre.trim() }),
    });
    if (esEstudiante) {
      estudianteActual = String(entidad.id);
      await cargarEstudiantes();
      $('select-estudiante').value = estudianteActual;
      await cargarApuntes();
      mostrarAviso('Estudiante agregado');
    } else {
      await cargarMaterias(entidad.id);
      mostrarAviso('Materia agregada');
    }
    dialogo.close();
  } catch (errorGuardar) {
    error.textContent = errorGuardar.message;
    error.hidden = false;
  }
}

$('btn-nuevo').addEventListener('click', abrirFormularioNuevo);
$('formulario').addEventListener('submit', guardarApunte);
$('btn-cancelar-form').addEventListener('click', () => $('ventana-formulario').close());
$('btn-nuevo-estudiante').addEventListener('click', () => abrirFormularioEntidad('estudiante'));
$('formulario-estudiante').addEventListener('submit', (evento) => guardarEntidad(evento, 'estudiante'));
$('btn-cancelar-estudiante').addEventListener('click', () => $('ventana-estudiante').close());
$('btn-nueva-materia').addEventListener('click', () => abrirFormularioEntidad('materia'));
$('formulario-materia').addEventListener('submit', (evento) => guardarEntidad(evento, 'materia'));
$('btn-cancelar-materia').addEventListener('click', () => $('ventana-materia').close());

$('btn-detalle-cerrar').addEventListener('click', () => $('ventana-detalle').close());
$('btn-detalle-editar').addEventListener('click', () => {
  $('ventana-detalle').close();
  abrirFormularioEdicion(idDetalle);
});
$('btn-detalle-eliminar').addEventListener('click', () => {
  $('ventana-detalle').close();
  pedirConfirmacion(idDetalle);
});

$('btn-cancelar-eliminar').addEventListener('click', () => $('ventana-confirmar').close());
$('btn-confirmar-eliminar').addEventListener('click', confirmarEliminacion);

$('select-estudiante').addEventListener('change', async (e) => {
  estudianteActual = e.target.value;
  try {
    await cargarApuntes();
  } catch (error) {
    mostrarAviso(error.message, true);
  }
});

async function iniciar() {
  try {
    await cargarEstudiantes();
    await cargarMaterias();
    await cargarApuntes();
  } catch (error) {
    mostrarAviso(error.message, true);
  }
}

iniciar();