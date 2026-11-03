document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario-login');
    const inputUsuario = document.getElementById('usuario');
    const inputContrasena = document.getElementById('contrasena');

    const mensajeError = document.createElement('p');
    mensajeError.style.color = '#ff0000';
    mensajeError.style.fontSize = '14px';
    mensajeError.style.fontWeight = 'bold';
    mensajeError.style.marginTop = '10px';
    mensajeError.style.textAlign = 'center';
    formulario.appendChild(mensajeError);

    formulario.addEventListener('submit', (e) => {
        e.preventDefault();
        mensajeError.textContent = ''; 

        const usuarioIngresado = inputUsuario.value.trim();
        const contrasenaIngresada = inputContrasena.value;

        //validación de campos vacíos
        if (usuarioIngresado === '' || contrasenaIngresada === '') {
            mensajeError.textContent = 'no se permiten campos vacíos. Por favor, complete todos los campos.';
            return;
        }

        //verificación de formato del correo
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(usuarioIngresado)) {
            mensajeError.textContent = 'El formato del correo electrónico no es válido (ejemplo: ejemplo@dominio.com)';
            inputUsuario.focus();
            return;
        }

        //verificación de contraseña mínima de 8 caracteres
        if (contrasenaIngresada.length < 8) {
            mensajeError.textContent = 'La contraseña debe tener al menos 8 caracteres';
            inputContrasena.focus();
            return;
        }

        //validación de usuario y contraseña contra el archivo JSON
        fetch('../data/usuarios.json')
            .then(respuesta => {
                if (!respuesta.ok) {
                    throw new Error('No se pudo acceder al repositorio de usuarios.');
                }
                return respuesta.json();
            })
            .then(usuarios => {
                const cuentaValida = usuarios.find(u => 
                    u.usuario === usuarioIngresado && 
                    u.contrasena === contrasenaIngresada
                );

                if (cuentaValida) {
                    localStorage.setItem('sesionActiva', JSON.stringify({
                        nombre: cuentaValida.nombre,
                        correo: cuentaValida.usuario,
                        rol: cuentaValida.rol
                    }));

                    alert(`¡Inicio de sesión exitoso!\nBienvenido(a) de vuelta, ${cuentaValida.nombre}.`);
                    window.location.href = '../index.html';
                } else {
                    mensajeError.textContent = 'El usuario o la contraseña son incorrectos.';
                    inputContrasena.value = '';
                    inputContrasena.focus();
                }
            })
            .catch(error => {
                console.error('Error del sistema:', error);
                mensajeError.textContent = 'no  se pudo acceder al repositorio de usuarios. Por favor, inténtelo más tarde.';
            });
    });
});
