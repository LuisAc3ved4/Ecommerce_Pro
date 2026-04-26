const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const monitor = require('./middlewares/monitor'); 

const app = express();

// --- MIDDLEWARES ---
app.use(express.json());
app.use(cors());
app.use(monitor('USUARIOS')); 

// --- CONEXIÓN A DB ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo1:27017/ecommerce');

// --- MODELO ---
const User = mongoose.model('User', { 
    name: String, 
    email: String,
    password: { type: String, default: '1234' },
    rol: { type: String, default: 'Usuario' } // Agregamos rol para mayor control
});

// --- RUTAS ---

// 1. Obtener usuarios (Simplificado para que el frontend lea directo el array)
app.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users); 
    } catch (err) {
        res.status(500).json({ err: "Error al obtener usuarios" });
    }
});

// 2. Registro de usuario
app.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json({ msg: "User OK", user: newUser });
    } catch (err) {
        res.status(500).json({ err: "Error al registrar usuario" });
    }
});

// 3. Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email, password: password });
        if (user) {
            res.json({ msg: "Login exitoso", name: user.name });
        } else {
            res.status(401).json({ msg: "Credenciales incorrectas" });
        }
    } catch (err) {
        res.status(500).json({ err: "Error en el servidor de login" });
    }
});

// 4. NUEVA RUTA: Editar usuario (PUT)
app.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, rol } = req.body;

        // Preparamos objeto de actualización
        const updateData = { name, email, rol };
        if (password) updateData.password = password; // Solo cambia pass si se envía

        const actualizado = await User.findByIdAndUpdate(id, updateData, { new: true });
        
        if (actualizado) {
            res.json({ msg: "Usuario actualizado", user: actualizado });
        } else {
            res.status(404).json({ msg: "Usuario no encontrado" });
        }
    } catch (err) {
        res.status(500).json({ err: "Error al actualizar usuario" });
    }
});

// 5. Borrar usuario
app.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const borrado = await User.findByIdAndDelete(id);
        borrado ? res.json({ msg: "OK" }) : res.status(404).json({ msg: "No encontrado" });
    } catch (err) {
        res.status(500).json({ err: "Error de DB" });
    }
});

app.listen(3000, () => console.log('👤 Users service running on port 3000 with Edit mode'));