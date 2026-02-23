import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const Order = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const scheme = state?.scheme;
    const cartItems = state?.cartItems; // Get cart items if passed
    const area = localStorage.getItem('selectedArea');

    const [formData, setFormData] = useState({
        name: '', mobile: '', address: '', quantity: 1,
        product: scheme?.product?.name || '',
        area: area || ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('userToken');
            if (!token) return;

            try {
                const storedUser = localStorage.getItem('userInfo');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    console.log("Auto-filling with:", user);
                    setFormData(prev => ({
                        ...prev,
                        name: user.username || '',
                        mobile: user.mobile || '',
                        address: user.address || ''
                    }));
                }
            } catch (err) {
                console.error("Error autofilling data", err);
            }
        };
        fetchUserData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const storedUser = localStorage.getItem('userInfo');
            let userId = null;
            if (storedUser) {
                userId = JSON.parse(storedUser).id;
            }

            if (cartItems && cartItems.length > 0) {
                // Handle Bulk Order from Cart
                const promises = cartItems.map(item => {
                    const payload = {
                        name: formData.name,
                        mobile: formData.mobile,
                        address: formData.address,
                        area: area,
                        product: item.product.name,
                        quantity: item.quantity || 1,
                        userId
                    };
                    return axios.post(`${API_URL}/api/orders`, payload);
                });
                await Promise.all(promises);
                localStorage.removeItem('cartItems'); // Clear cart
            } else {
                // Handle Single Order
                const payload = { ...formData, userId };
                await axios.post(`${API_URL}/api/orders`, payload);
            }

            alert('Order Placed Successfully!');
            if (userId) {
                navigate('/my-orders');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            alert('Error placing order');
        }
    };

    const calculateTotal = () => {
        if (!cartItems) return 0;
        return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-amber-800">
                    {cartItems ? 'Checkout' : 'Place Order'}
                </h2>

                {cartItems && (
                    <div className="mb-6 bg-amber-50 p-4 rounded-lg">
                        <h3 className="font-bold text-gray-800 mb-2">Order Summary</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            {cartItems.map((item, idx) => (
                                <li key={idx} className="flex justify-between">
                                    <span>{item.product.name} (x{item.quantity || 1})</span>
                                    <span>₹{item.price * (item.quantity || 1)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-amber-200 mt-2 pt-2 flex justify-between font-bold text-amber-900">
                            <span>Total</span>
                            <span>₹{calculateTotal()}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="input-field w-full p-3 border rounded" placeholder="Your Name" required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <input className="input-field w-full p-3 border rounded" placeholder="Mobile Number" required
                        value={formData.mobile}
                        onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                    <textarea className="input-field w-full p-3 border rounded" placeholder="Address" required
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })} />

                    {!cartItems && (
                        <div className="grid grid-cols-2 gap-4">
                            <input className="input-field w-full p-3 border rounded bg-gray-100" value={formData.product} readOnly />
                            <input type="number" min="1" className="input-field w-full p-3 border rounded" value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                        </div>
                    )}

                    <button type="submit" className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition">
                        {cartItems ? `Confirm Order (₹${calculateTotal()})` : 'Confirm Order'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default Order;
