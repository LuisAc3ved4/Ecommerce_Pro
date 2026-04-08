const express = require('express');
const mongoose = require('mongoose');

const app = express();

// --- MIDDLEWARES ---
app.use(express.json());

// Variable para llevar la cuenta (Debe estar arriba para que persista)
let contadorPeticiones = 0;

// Middleware del Contador (Cada 3 peticiones)
app.use((req, res, next) => {
    contadorPeticiones++; 

    if (contadorPeticiones % 3 === 0) {
        const fecha = new Date().toISOString();
        const metodo = req.method;
        const url = req.originalUrl;
        console.log(`[${fecha}] 🛰️  Petición #${contadorPeticiones} detectada: ${metodo} ${url}`);
    }
    
    next(); // Permite que la petición siga hacia las rutas
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

// --- ENCENDIDO ---
app.listen(3000, () => console.log('Users service running on port 3000'));