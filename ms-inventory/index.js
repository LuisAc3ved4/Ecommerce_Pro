const express = require('express');
const mongoose = require('mongoose');
const monitor = require('./middlewares/monitor'); 
const app = express();

app.use(express.json());
app.use(monitor('INVENTARIO'));

// 1. ESQUEMA Y MODELO
const ProductoSchema = new mongoose.Schema({
    nombre: String,
    stock: Number,
    precio: Number
});
const Producto = mongoose.model('Producto', ProductoSchema);

// 2. CONEXIÓN DIRECTA Y ESTABLE
mongoose.connect('mongodb://mongo1:27017/ecommerce', {
    serverSelectionTimeoutMS: 2000,
    directConnection: true 
})
.then(() => {
    console.log('----------------------------------------------------');
    console.log('📦 DB: Conectado a MongoDB (Modo Directo - Estable)');
    console.log('----------------------------------------------------');
})
.catch(err => console.error('❌ Error crítico en DB:', err));

// 3. RUTAS DEL MICROSERVICIO

// Obtener todos los productos
app.get('/', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el inventario" });
    }
});

// Agregar un nuevo producto
app.post('/add', async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.json({ mensaje: "Producto registrado exitosamente", nuevoProducto });
    } catch (error) {
        res.status(500).json({ error: "Error al guardar producto" });
    }
});

// ELIMINAR un producto por ID (Nueva ruta)
app.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Producto.findByIdAndDelete(id);
        
        if (!eliminado) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
});

// EDITAR un producto por ID
app.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await Producto.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!actualizado) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.json({ mensaje: "Producto actualizado correctamente", actualizado });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
});

// 4. INICIO DEL SERVIDOR
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Microservicio Inventario activo en puerto ${PORT}`);
});