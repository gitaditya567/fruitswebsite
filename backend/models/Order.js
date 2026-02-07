const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    address: String,
    area: String,
    product: String,
    quantity: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
