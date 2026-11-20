
const base = [
    { user: 'guia', pass: '123', rol: 'Eco-Guía', url: 'ecoguia.html' },
    { user: 'ciudadano', pass: '123', rol: 'Ciudadano', url: 'ciudadano.html' },
    { user: 'ciudadano2', pass: '123', rol: 'Ciudadano', url: 'ciudadano.html' }
];

class RetoEco {
    constructor(id, titulo, descripcion, puntos) {
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.puntos = parseInt(puntos);
    }
}

function iniciarSesion(e) {
    e.preventDefault();

    const inputUser = document.getElementById('inputUser').value.trim().toLowerCase();
    const inputPass = document.getElementById('inputPass').value.trim();

    const usuarioAutenticado = base.find(
        u => u.user === inputUser && u.pass === inputPass
    );

    if (usuarioAutenticado) {
        sessionStorage.setItem('sesionActiva', JSON.stringify(usuarioAutenticado));
        window.location.href = usuarioAutenticado.url;
    } else {
        document.getElementById('errorMsg').classList.remove('d-none');
    }
}

function verificarAcceso(rolRequerido) {
    const sesion = JSON.parse(sessionStorage.getItem('sesionActiva'));

    if (!sesion) {
        window.location.href = 'index.html';
    } else if (sesion.rol !== rolRequerido) {
        window.location.href = sesion.url;
    } else {
        document.getElementById('infoUsuario').textContent =
            `👤 ${sesion.user} (${sesion.rol})`;
    }
}

function cerrarSesion() {
    sessionStorage.removeItem('sesionActiva');
    window.location.href = 'index.html';
}

function crearReto(e) {
    e.preventDefault();

    const titulo = document.getElementById('tituloReto').value.trim();
    const descripcion = document.getElementById('descReto').value.trim();
    const puntos = document.getElementById('puntosReto').value;

    let retosEco = JSON.parse(localStorage.getItem('retosEco')) || [];
    const nuevoId = retosEco.length + 1;

    const nuevoReto = new RetoEco(nuevoId, titulo, descripcion, puntos);

    retosEco.push(nuevoReto);
    localStorage.setItem('retosEco', JSON.stringify(retosEco));

    document.getElementById('formReto').reset();
    mostrarRetosGuia();
}

function mostrarRetosGuia() {
    const contenedor = document.getElementById('listaRetosGuia');
    const retosEco = JSON.parse(localStorage.getItem('retosEco')) || [];

    let html = '';

    retosEco.forEach(reto => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card shadow-sm h-100">
                    <div class="card-body">
                        <h5 class="card-title text-success fw-bold">
                            #${reto.id} - ${reto.titulo}
                        </h5>

                        <p class="card-text">${reto.descripcion}</p>

                        <div class="input-group mt-3">
                            <span class="input-group-text">Pts:</span>

                            <input type="number"
                                id="puntos-${reto.id}"
                                class="form-control"
                                value="${reto.puntos}"
                                min="1">

                            <button class="btn btn-outline-success fw-bold"
                                onclick="actualizarPuntos(${reto.id})">
                                Actualizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}

function actualizarPuntos(idReto) {
    let retosEco = JSON.parse(localStorage.getItem('retosEco')) || [];

    const nuevoValor = document.getElementById(`puntos-${idReto}`).value;
    const retoEncontrado = retosEco.find(r => r.id === idReto);

    if (retoEncontrado && nuevoValor > 0) {
        retoEncontrado.puntos = parseInt(nuevoValor);

        localStorage.setItem('retosEco', JSON.stringify(retosEco));
        mostrarRetosGuia();
    }
}

function mostrarRetosCiudadano() {
    const sesion = JSON.parse(sessionStorage.getItem('sesionActiva'));
    const contenedor = document.getElementById('listaRetosCiudadano');
    const spanPuntos = document.getElementById('totalPuntos');

    const retosEco = JSON.parse(localStorage.getItem('retosEco')) || [];
    const llaveProgreso = `progreso_${sesion.user}`;

    const progresoIndividual =
        JSON.parse(localStorage.getItem(llaveProgreso)) || [];

    let html = '';
    let sumaPuntos = 0;

    retosEco.forEach(reto => {
        const yaCompletado = progresoIndividual.find(
            p => p.retoId === reto.id && p.completado === true
        );

        if (yaCompletado) {
            sumaPuntos += reto.puntos;
        }

        html += `
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm h-100 ${yaCompletado ? 'border-success' : ''}">
                    <div class="card-body d-flex flex-column justify-content-between">

                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-warning text-dark">
                                    ${reto.puntos} pts
                                </span>

                                ${yaCompletado
                                    ? '<span class="badge bg-success">✅ Completado</span>'
                                    : ''
                                }
                            </div>

                            <h5 class="card-title fw-bold">${reto.titulo}</h5>
                            <p class="card-text text-muted">${reto.descripcion}</p>
                        </div>

                        <div class="mt-3">
                            ${yaCompletado
                                ? '<button class="btn btn-secondary w-100" disabled>Reto Superado</button>'
                                : `<button class="btn btn-primary w-100 fw-bold" onclick="completarReto(${reto.id})">Marcar como Completado</button>`
                            }
                        </div>

                    </div>
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;

    if (spanPuntos) {
        spanPuntos.textContent = sumaPuntos;
    }
}

function completarReto(idReto) {
    const sesion = JSON.parse(sessionStorage.getItem('sesionActiva'));

    const llaveProgreso = `progreso_${sesion.user}`;

    let progresoIndividual =
        JSON.parse(localStorage.getItem(llaveProgreso)) || [];

    if (!progresoIndividual.find(p => p.retoId === idReto)) {
        progresoIndividual.push({
            retoId: idReto,
            completado: true
        });

        localStorage.setItem(
            llaveProgreso,
            JSON.stringify(progresoIndividual)
        );
    }

    mostrarRetosCiudadano();
}
