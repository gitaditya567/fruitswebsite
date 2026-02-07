const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to update images...");

        // Update Almond
        await Product.updateOne(
            { name: 'Almond' },
            { $set: { image: 'http://localhost:5000/uploads/almond.png' } }
        );

        // Update Cashew
        await Product.updateOne(
            { name: 'Cashew' },
            { $set: { image: 'http://localhost:5000/uploads/cashew.png' } }
        );

        console.log("Images updated in DB.");
        mongoose.disconnect();
    })
    .catch(err => console.log(err));
