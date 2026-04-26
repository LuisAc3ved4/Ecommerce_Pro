const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const monitorMiddleware = (nombreServicio) => {
    return (req, res, next) => {
        res.on('finish', async () => {
            // Solo registrar cambios exitosos (POST, PUT, DELETE)
            if (req.method !== 'GET' && res.statusCode < 400) {
                
                const logData = {
                    servicio: nombreServicio,
                    accion: `${req.method} en ${req.originalUrl}`,
                    usuario: req.body.usuario || 'Sistema',
                    fecha: new Date()
                };

                // 1. Siempre escribir en el archivo (tu respaldo original)
                const lineaLog = `[${logData.fecha.toISOString()}] 🛰️ ${nombreServicio}: ${logData.usuario} -> ${logData.accion}\n`;
                const rutaArchivo = path.join(__dirname, 'registro_peticiones.log');
                fs.appendFile(rutaArchivo, lineaLog, (err) => {
                    if (err) console.error("Error archivo log:", err);
                });

                // 2. Guardar en MongoDB solo si hay conexión activa
                if (mongoose.connection.readyState === 1) {
                    try {
                        // Usamos esta forma para evitar errores de "Modelo ya definido"
                        const Log = mongoose.models.Log || mongoose.model('Log', new mongoose.Schema({
                            servicio: String, accion: String, usuario: String, fecha: Date
                        }), 'logs');

                        await Log.create(logData);
                    } catch (err) {
                        console.error("❌ Error DB Log:", err.message);
                    }
                }
            }
        });
        next();
    };
};

module.exports = monitorMiddleware;