const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <--- 1. AGREGAR ESTO

const app = express();

// --- MIDDLEWARES ---
app.use(express.json());
app.use(cors()); // <--- 2. AGREGAR ESTO para permitir que el frontend se conecte

// Variable para llevar la cuenta
let contadorPeticiones = 0;

// Middleware del Contador
app.use((req, res, next) => {
    contadorPeticiones++; 

    if (contadorPeticiones % 3 === 0) {
        const fecha = new Date().toISOString();
        const metodo = req.method;
        const url = req.originalUrl;
        console.log(`[${fecha}] 🛰️  Petición #${contadorPeticiones} detectada: ${metodo} ${url}`);
    }
    
    next();
});

// --- CONEXIÓN A DB ---
mongoose.connect(process.env.MONGO_URI);

// --- MODELOS Y RUTAS ---
const User = mongoose.model('User', { name: String, email: String });

app.get('/', async (req, res) => {
    const users = await User.find();
    res.json({ service: "Usuarios", data: users });
});

app.post('/', async (req, res) => {
    await new User(req.body).save();
    res.json({ msg: "User OK" });
});

// Actualiza tu ruta DELETE con esto:
// En ms-users/index.js
app.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log("Intentando borrar ID:", id);
        const borrado = await User.findByIdAndDelete(id);
        
        if (borrado) {
            res.json({ msg: "OK" });
        } else {
            res.status(404).json({ msg: "No encontrado" });
        }
    } catch (err) {
        res.status(500).json({ err: "Error de DB" });
    }
});

// --- ENCENDIDO ---
app.listen(3000, () => console.log('Users service running on port 3000'));