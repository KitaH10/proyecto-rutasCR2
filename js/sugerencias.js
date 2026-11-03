document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario-sugerencia');
    const selectProvincia = document.getElementById('select-provincia');
    const selectCanton = document.getElementById('select-canton');
    const selectDistrito = document.getElementById('select-distrito');

    // Definición de la estructura de provincias, cantones y distritos
    const region = {
        "San José": {
            "San José": ["Carmen", "Merced", "Hospital", "Catedral"],
            "Escazú": ["Escazú", "San Antonio", "San Rafael"]
        },
        "Alajuela": {
            "Alajuela": ["Alajuela", "San José", "Carrizal", "El Arroyo"],
            "San Carlos": ["Quesada", "Florencia", "Buenavista"]
        },
        "Cartago": {
            "Cartago": ["Oriental", "Occidental", "Carmen", "San Nicolás"],
            "Paraíso": ["Paraíso", "Santiago", "Orosi"]
        },
        "Heredia": {
            "Heredia": ["Heredia", "Mercedes", "San Francisco"],
            "Barva": ["Barva", "San Pedro", "San Pablo"]
        },
        "Guanacaste": {
            "Liberia": ["Liberia", "Mayorga", "Nacascolo", "Curubandé"],
            "Nicoya": ["Nicoya", "Mansión", "San Antonio", "Quebrada Honda"]
        },
        "Puntarenas": {
            "Puntarenas": ["Puntarenas", "El Roble", "Chacarita", "Barranca"],
            "Esparza": ["Espíritu Santo", "San Juan Grande", "Macacona"]
        },
        "Limón": {
            "Limón": ["Limón", "Valle de La Estrella", "Liverpool", "Matama"],
            "Pococí": ["Guápiles", "Jiménez", "La Rita", "Roxana"]
        }
    };

    // Cargar provincias en el select al inicio
    selectProvincia.addEventListener('change', (e) => {
        const provinciaSeleccionada = e.target.value;
        
        // Limpiar selectores hijos
        selectCanton.innerHTML = '<option value="">Seleccione...</option>';
        selectDistrito.innerHTML = '<option value="">Seleccione un cantón...</option>';
        selectDistrito.disabled = true;

        if (provinciaSeleccionada && region[provinciaSeleccionada]) {
            const cantones = Object.keys(region[provinciaSeleccionada]);
            
            cantones.forEach(canton => {
                const opt = document.createElement('option');
                opt.value = canton;
                opt.textContent = canton;
                selectCanton.appendChild(opt);
            });
            
            selectCanton.disabled = false;
        } else {
            selectCanton.disabled = true;
        }
    });

    // Cargar distritos según el cantón seleccionado
    selectCanton.addEventListener('change', (e) => {
        const provinciaSeleccionada = selectProvincia.value;
        const cantonSeleccionado = e.target.value;

        selectDistrito.innerHTML = '<option value="">Seleccione...</option>';

        if (cantonSeleccionado && region[provinciaSeleccionada]?.[cantonSeleccionado]) {
            const distritos = region[provinciaSeleccionada][cantonSeleccionado];
            
            distritos.forEach(distrito => {
                const opt = document.createElement('option');
                opt.value = distrito;
                opt.textContent = distrito;
                selectDistrito.appendChild(opt);
            });
            
            selectDistrito.disabled = false;
        } else {
            selectDistrito.disabled = true;
        }
    });

    //
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        // Capturar los valores ingresados usando FormData
        const formData = new FormData(formulario);
        const datosSugerencia = {
            id: 'sugerencia-' + Date.now(), // Generar un ID único basado en la fecha y hora actual
            provincia: formData.get('provincia'),
            canton: formData.get('canton'),
            distrito: formData.get('distrito'),
            motivo: formData.get('motivo'),
            detalles: formData.get('detalles').trim(),
            fechaEnvio: new Date().toLocaleString()
        };

        // Validación de campos obligatorios
        if (!datosSugerencia.provincia || !datosSugerencia.canton || !datosSugerencia.distrito || !datosSugerencia.motivo) {
            alert('Por favor, complete todos los campos obligatorios antes de enviar el formulario.');
            return;
        }

        // Recuperar las sugerencias históricas del LocalStorage o inicializar un array vacío
        const sugerenciasHistoricas = JSON.parse(localStorage.getItem('sugerenciasGuardadas')) || [];
        
        sugerenciasHistoricas.push(datosSugerencia);
        
        // Guardar la colección actualizada de vuelta en LocalStorage
        localStorage.setItem('sugerenciasGuardadas', JSON.stringify(sugerenciasHistoricas));

        console.log('Formulario guardado con éxito:', datosSugerencia);
        
        // Mensaje de confirmación al usuario
        alert(`¡Formulario Guardado!\nSu reporte sobre "${datosSugerencia.motivo}" ha sido registrado con éxito.`);
        
        // Redirección automática a la página de inicio
        window.location.href = '../index.html';
    });
});
