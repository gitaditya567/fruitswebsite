const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
    area: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    price: Number,
    offer: String
});

module.exports = mongoose.model('Scheme', SchemeSchema);
