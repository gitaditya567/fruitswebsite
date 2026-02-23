const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    address: String,
    area: String,
    product: String,
    quantity: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
