# Aplicación de consola 

Este proyecto fue generado manualmente, utilizando NodeJS, MongoDB y Git.

La aplicación crea un Restserver que responde a peticiones GET, POST, PUT y DELETE para manejar las entidades usuarios, médicos y hospitales de la BD.

Se utilizan las siguientes librerías:

1. **Express:** Para levantar un servidor, ponerlo a escuchar en un puerto y manejar de las peticiones HTTP.

1. **Bcrypt:** Para el cifrado de contraseñas

1. **Google Auth Library:** Para la autenticación de usuarios con cuentas de Google

1. **Jsonwebtoken:** Para el manejo de JWT en las peticiones REST.

1. **Mongoose**: Para establecer la comuncación entre NodeJS y MongoDB, definición de esquemas y métodos de lectura y escritura de la BD.


## Instalación de librerías

Ejecute `npm install` para instalar las librerías necesarias para ejecutar la aplicación.

## Levantar el servidor

Ejecute `node src/app.js` o `npm run start`