const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
mongoose.connect(process.env.MONGO_URI);
const User = mongoose.model('User', { name: String, email: String });
app.get('/', async (req, res) => res.json({ service: "Usuarios", data: await User.find() }));
app.post('/', async (req, res) => { await new User(req.body).save(); res.json({ msg: "User OK" }); });
app.listen(3000, () => console.log('Users service running'));
