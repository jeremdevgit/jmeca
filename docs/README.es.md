# JMeca

[English](../README.md) · [Français](../README.fr.md)

Rastreador de mantenimiento de vehículos de escritorio para Windows, macOS y Linux.

👉 **[Descargar instaladores para Windows, macOS y Linux](https://github.com/jeremdevgit/jmeca/releases/tag/v0.1.1-beta.2)**. Windows: `.exe`; macOS universal: `.pkg` o `.dmg`; Debian/Ubuntu: `.deb`. Las sumas SHA-256 están en `SHA256SUMS.txt`.

La interfaz sigue el idioma de su sistema en el primer inicio. Puedes cambiarlo en la aplicación.

## Características

- Administre múltiples vehículos en carpetas de clientes y busque en su flota.
- Realice un seguimiento de las piezas y los recordatorios de mantenimiento personalizados por fecha y kilometraje.
- Guarde registros de servicio, facturas, fotografías y documentos de registro en una bóveda cifrada.
- Registrar consumos y gastos de combustible. Busque estaciones de servicio francesas utilizando datos oficiales abiertos.
- Elija de un catálogo fuera de línea de 3604 versiones de vehículos y siluetas genéricas de automóviles en 3D.

## Pruebe la demostración

Instale los requisitos previos de Tauri, luego ejecute `npm ci` y `npm run desktop:dev`. La demostración utiliza datos ficticios.

Para datos personales, utilice una contraseña de al menos 12 caracteres y exporte una copia de seguridad cifrada a otra unidad.

## Seguridad y limitaciones

- El contenido del almacén se cifra en reposo con AES-256-GCM. Una computadora comprometida puede acceder a una bóveda mientras está desbloqueada.
- Verifique los intervalos de servicio y las piezas compatibles con el manual de su vehículo exacto. El catálogo no es una base de datos de mantenimiento certificada.
- La búsqueda de estaciones de servicio utiliza datos abiertos oficiales franceses, no una API de Essence&Co. Los recordatorios aparecen solo mientras la aplicación está abierta.
- Esta versión es adecuada para un garaje personal o un pequeño taller local, no para una gran flota multiusuario.

Consulte la documentación completa en inglés y las licencias de terceros. [README.md](../README.md) · [THIRD_PARTY.md](../THIRD_PARTY.md)
