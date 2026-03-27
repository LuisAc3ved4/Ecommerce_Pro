const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
mongoose.connect(process.env.MONGO_URI);
const Log = mongoose.model('Log', { action: String, date: { type: Date, default: Date.now } });
app.get('/', async (req, res) => res.json({ service: "Reportes", data: await Log.find() }));
app.post('/', async (req, res) => { await new Log(req.body).save(); res.json({ msg: "Log OK" }); });
app.listen(3000, () => console.log('Reports service running'));
