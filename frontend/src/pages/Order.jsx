import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Order = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const scheme = state?.scheme;
    const area = localStorage.getItem('selectedArea');

    const [formData, setFormData] = useState({
        name: '', mobile: '', address: '', quantity: 1,
        product: scheme?.product?.name || '',
        area: area || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/orders', formData);
            alert('Order Placed Successfully!');
            navigate('/');
        } catch (err) {
            alert('Error placing order');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-amber-800">Place Order</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="input-field w-full p-3 border rounded" placeholder="Your Name" required
                        onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <input className="input-field w-full p-3 border rounded" placeholder="Mobile Number" required
                        onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                    <textarea className="input-field w-full p-3 border rounded" placeholder="Address" required
                        onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <input className="input-field w-full p-3 border rounded bg-gray-100" value={formData.product} readOnly />
                        <input type="number" min="1" className="input-field w-full p-3 border rounded" value={formData.quantity}
                            onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                    </div>
                    <button type="submit" className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition">Confirm Order</button>
                </form>
            </div>
        </div>
    );
};
export default Order;
