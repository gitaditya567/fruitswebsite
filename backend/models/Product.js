const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: String
    }
});

module.exports = mongoose.model('Product', ProductSchema);
