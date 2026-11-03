document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('container-rutas');
    const contenedorFavoritos = document.getElementById('container-favoritos');
    const panelFavoritosCompleto = document.querySelector('.favoritos-panel');
    const buscadorTexto = document.getElementById('buscador-texto');
    const filtroProvincia = document.getElementById('filtro-provincia');
    
    let todasLasRutas = [];
    
    // Mapeo completo de imágenes reales según la empresa del JSON
    const imagenesEmpresas = {
        "TUASA": "../media/tuasa.jpg",
        "LUMACA": "../media/lumaca.jpeg",
        "GRUPO CARIBEÑOS": "../media/caribenos.jpeg",
        "EUPSA": "../media/eupsa.jpeg",
        "PULMITAN DE LIBERIA": "../media/pulmitan.jpg",
        "AUTOTRANSPORTES LOPEZ S.A.": "../media/tuetal.jpg",
        "HERMANOS BONILLA": "../media/pueblo.jpg",
        "TRANS MONTECILLOS": "../media/montecillos.jpg",
        "CARRILLOS-CHILAMATE": "../media/carrillos.jpg"
    };

    // FIX: Se agrega la constante que faltaba para evitar un ReferenceError en la ejecución
    const IMAGEN_DEFECTO = "../media/bus-generico.jpg";

    const sesion = JSON.parse(localStorage.getItem('sesionActiva'));
    const tieneSesion = sesion !== null;

    if (!tieneSesion && panelFavoritosCompleto) {
        panelFavoritosCompleto.style.display = 'none';
        document.querySelector('.main').style.gridTemplateColumns = '1fr';
    }

    let favoritos = tieneSesion ? (JSON.parse(localStorage.getItem('rutasFavoritas')) || []) : [];

    //se carga el archivo JSON de rutas y se renderizan las rutas en la página
    fetch('../data/rutas.json')
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error('No se pudo cargar el archivo de rutas');
            }
            return respuesta.json();
        })
        .then(rutas => {
            todasLasRutas = rutas;
            renderizarRutas(todasLasRutas);
            if (tieneSesion) renderizarFavoritos();
        })
        .catch(error => {
            console.error('Error:', error);
            contenedor.innerHTML = `<p style="color: red; font-weight: bold;">Error al cargar las rutas de autobus</p>`;
        });
    function renderizarRutas(rutasFiltradas) {
        contenedor.innerHTML = '';

        if (rutasFiltradas.length === 0) {
            contenedor.innerHTML = `<p class="routes-grid-empty-msg">No se encontraron rutas que coincidan con la búsqueda</p>`;
            return;
        }

        const htmlTarjetas = [];

        rutasFiltradas.forEach(ruta => {
            const rutaImagenBus = imagenesEmpresas[ruta.empresa] || IMAGEN_DEFECTO;
            const avisoNoDisponible = !ruta.habilitada 
                ? `<div class="alerta-roja">Esta ruta no se encuentra disponible actualmente</div>` 
                : '';

            const botonGoogleMaps = ruta.habilitada
                ? `<a href="${ruta.mapaUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; width: 100%; display: block;">
                        <button type="button" class="btn-mapa-activo">Ver ruta en Google Maps</button>
                    </a>`
                : `<button type="button" disabled class="btn-mapa-bloqueado">Ruta no disponible</button>`;

            const textoProvincias = ruta.provincias.join(', ');
            const esFav = favoritos.some(fav => fav.id === ruta.id);
            
            let textoBotonFav = '➕ Añadir a Favoritos';
            let atributoDeshabilitado = '';
            let claseFavorito = '';

            if (!tieneSesion) {
                // Se optimiza el texto para mantener dimensiones limpias en los botones de las tarjetas
                textoBotonFav = '🔒 Inicie sesión';
                atributoDeshabilitado = 'disabled style="background-color: #f0f0f0; color: #888; cursor: not-allowed;"';
            } else if (esFav) {
                textoBotonFav = '⭐ Guardada en Favoritos';
                atributoDeshabilitado = 'disabled'; 
                claseFavorito = 'btn-favorito-guardado'; 
            }

            const tarjetaHTML = `
                <article class="tarjeta" style="opacity: ${ruta.habilitada ? '1' : '0.75'}; display: flex; flex-direction: column; overflow: hidden;">
                    
                    <!-- Integración del atributo alt dinámico directo desde las propiedades del archivo JSON -->
                    <div class="tarjeta-imagen" style="width: 100%; height: 160px; overflow: hidden; background-color: #f0f0f0;">
                        <img src="${rutaImagenBus}" alt="${ruta.alt || 'Autobús de la empresa ' + ruta.empresa}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    
                    <div class="tarjeta-tope" style="padding-top: 10px;">
                        <span class="route-name">${ruta.nombre}</span>
                        <span class="tarjeta-precio">${ruta.tarifa}</span>
                    </div>
                    <div style="font-size: 14px; line-height: 1.5; flex: 1;">
                        ${avisoNoDisponible}
                        <p><strong>Empresa:</strong> ${ruta.empresa}</p>
                        <p><strong>Provincias:</strong> ${textoProvincias}</p>
                        <p><strong>Horario:</strong> ${ruta.horario}</p>
                        <div style="margin-top: 15px;">
                            ${botonGoogleMaps}
                        </div>
                    </div>
                    <div class="tarjeta-botones" style="margin-top: 15px;">
                        <button type="button" class="btn-favorite ${claseFavorito}" style="width: 100%; padding: 10px; font-size: 14px; font-weight: bold; border: 2px solid #000000; border-radius: 10px; cursor: pointer;" data-id="${ruta.id}" ${atributoDeshabilitado || (!ruta.habilitada ? 'disabled' : '')}>
                            ${textoBotonFav}
                        </button>
                    </div>
                </article>
            `;
            htmlTarjetas.push(tarjetaHTML);
        });

        contenedor.innerHTML = htmlTarjetas.join('');

        if (tieneSesion) {
            document.querySelectorAll('.btn-favorite').forEach(botón => {
                botón.addEventListener('click', (e) => {
                    const idRuta = e.target.getAttribute('data-id');
                    alternarFavorito(idRuta);
                });
            });
        }
    }

    function renderizarFavoritos() {
        contenedorFavoritos.innerHTML = '';

        if (favoritos.length === 0) {
            contenedorFavoritos.innerHTML = `<p class="fav-empty-msg">No tienes rutas guardadas.</p>`;
            return;
        }

        const htmlFavoritos = [];

        favoritos.forEach(fav => {
            const itemHTML = `
                <div class="fav-tarjeta">
                    <p style="font-size: 12px; color: #555; margin-bottom: 4px;">${fav.nombreOriginal}</p>
                    <div class="fav-fila">
                        <input type="text" value="${fav.referencia}" data-id="${fav.id}" class="input-referencia" style="flex:1; padding:4px; font-size:13px; border:1px solid #000; border-radius:5px;">
                        <button type="button" class="btn-guardar-ref" data-id="${fav.id}" style="padding:4px 8px; font-size:12px; background-color:#00348d; color:white; border:1px solid #000; border-radius:5px; cursor:pointer;">✏️</button>
                    </div>
                    <button type="button" class="btn-eliminar" data-id="${fav.id}">Eliminar</button>
                </div>
            `;
            htmlFavoritos.push(itemHTML);
        });

        contenedorFavoritos.innerHTML = htmlFavoritos.join('');

        document.querySelectorAll('.btn-guardar-ref').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const input = document.querySelector(`.input-referencia[data-id="${id}"]`);
                editarReferencia(id, input.value);
            });
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                alternarFavorito(id);
            });
        });
    }

    function alternarFavorito(idRuta) {
        if (!tieneSesion) return;
        const indice = favoritos.findIndex(fav => fav.id === idRuta);

        if (indice > -1) {
            const nombreRuta = favoritos[indice].nombreOriginal;
            const deseaEliminar = confirm(`¿Está seguro de que desea eliminar "${nombreRuta}" de sus rutas favoritas?`);
            if (!deseaEliminar) return;
            favoritos.splice(indice, 1);
        } else {
            const rutaEncontrada = todasLasRutas.find(r => r.id === idRuta);
            if (rutaEncontrada) {
                favoritos.push({
                    id: rutaEncontrada.id,
                    nombreOriginal: rutaEncontrada.nombre,
                    referencia: rutaEncontrada.nombre,
                });
            }
        }
        guardarYActualizar();
    }

    function editarReferencia(idRuta, nuevoNombre) {
        const fav = favoritos.find(f => f.id === idRuta);
        if (fav) {
            fav.referencia = nuevoNombre.trim() || fav.nombreOriginal;
            guardarYActualizar();
            alert('Nombre de referencia actualizado.');
        }
    }

    function guardarYActualizar() {
        localStorage.setItem('rutasFavoritas', JSON.stringify(favoritos));
        filtrarRutas();
        renderizarFavoritos();
    }

    function filtrarRutas() {
        const textoBusqueda = buscadorTexto.value.toLowerCase().trim();
        const provinciaSeleccionada = filtroProvincia.value;

        const resultado = todasLasRutas.filter(ruta => {
            const coincideTexto = ruta.nombre.toLowerCase().includes(textoBusqueda) || 
                                    ruta.empresa.toLowerCase().includes(textoBusqueda);
            const coincideProvincia = provinciaSeleccionada === "" || 
                                        ruta.provincias.includes(provinciaSeleccionada);
            return coincideTexto && coincideProvincia;
        });

        renderizarRutas(resultado);
    }

    if (buscadorTexto) buscadorTexto.addEventListener('input', filtrarRutas);
    if (filtroProvincia) filtroProvincia.addEventListener('change', filtrarRutas);
});
