const express = require('express');
const mongoose = require('mongoose');
const monitor = require('./middlewares/monitor'); 
const app = express();

app.use(express.json());
app.use(monitor('REPORTES'));

// 1. ESQUEMAS (Inventario y Logs)
const ProductoSchema = new mongoose.Schema({
    nombre: String,
    stock: Number,
    precio: Number
});
const Producto = mongoose.model('Producto', ProductoSchema);

// Este esquema debe coincidir con lo que guarda tu middleware monitor
const LogSchema = new mongoose.Schema({
    servicio: String,
    accion: String,
    usuario: String,
    detalles: String,
    fecha: { type: Date, default: Date.now }
});
const Log = mongoose.model('Log', LogSchema, 'logs'); // 'logs' es el nombre de la colección

// 2. CONEXIÓN A MONGODB
mongoose.connect('mongodb://mongo1:27017/ecommerce', {
    serverSelectionTimeoutMS: 2000,
    directConnection: true 
})
.then(() => console.log('📊 Reportes conectado a MongoDB - Auditoría Activa'))
.catch(err => console.error('❌ Error conexión Reportes:', err));

// 3. RUTAS

// Endpoint para Estadísticas y Gráficas
app.get('/stats', async (req, res) => {
    try {
        const productos = await Producto.find();
        const totalProductos = productos.length;
        const valorInventario = productos.reduce((acc, p) => acc + (p.precio * p.stock), 0);
        const bajoStock = productos.filter(p => p.stock < 5);

        res.json({
            totalProductos,
            valorInventario,
            bajoStock,
            productos 
        });
    } catch (error) {
        res.status(500).json({ error: "Error al generar estadísticas" });
    }
});

// NUEVO: Endpoint para el Historial de Movimientos (Auditoría)
app.get('/logs', async (req, res) => {
    try {
        // Traemos los últimos 15 movimientos, del más reciente al más antiguo
        const historial = await Log.find().sort({ fecha: -1 }).limit(15);
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener historial de auditoría" });
    }
});

app.get('/', (req, res) => res.json({ service: "Reportes y Auditoría OK" }));

const PORT = 3000;
app.listen(PORT, () => console.log(`📊 Reportes running on ${PORT}`));