const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
mongoose.connect(process.env.MONGO_URI);
const Item = mongoose.model('Item', { name: String, stock: Number });
app.get('/', async (req, res) => res.json({ service: "Inventario", data: await Item.find() }));
app.post('/', async (req, res) => { await new Item(req.body).save(); res.json({ msg: "Item OK" }); });
app.listen(3000, () => console.log('Inventory service running'));
