import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../config';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    const updateQuantity = (id, delta) => {
        const updatedCart = cartItems.map(item => {
            if (item._id === id) {
                const newQty = Math.max(1, (item.quantity || 1) + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCartItems(updatedCart);
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    };

    const removeItem = (id) => {
        const updatedCart = cartItems.filter(item => item._id !== id);
        setCartItems(updatedCart);
        localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty');
            return;
        }
        navigate('/order', { state: { cartItems } });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">

            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-amber-900">Your Cart</h2>
                    <button onClick={() => navigate('/schemes')} className="text-amber-600 font-semibold hover:underline">
                        &larr; Continue Shopping
                    </button>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-md">
                        <p className="text-gray-500 text-xl">Your cart is empty.</p>
                        <button
                            onClick={() => navigate('/schemes')}
                            className="mt-6 px-6 py-3 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition"
                        >
                            Browse Schemes
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {cartItems.map(item => (
                            <div key={item._id} className="flex flex-col md:flex-row items-center border-b border-gray-100 p-6 gap-6">
                                <img
                                    src={getImageUrl(item.product.image)}
                                    alt={item.product.name}
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                />
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-gray-800">{item.product.name}</h3>
                                    <p className="text-green-600 font-semibold">₹{item.price}</p>
                                    <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">{item.offer}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => updateQuantity(item._id, -1)}
                                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-300"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold text-lg w-8 text-center">{item.quantity || 1}</span>
                                    <button
                                        onClick={() => updateQuantity(item._id, 1)}
                                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-300"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="text-right min-w-[100px]">
                                    <p className="text-lg font-bold text-gray-900">₹{(item.price * (item.quantity || 1))}</p>
                                </div>
                                <button
                                    onClick={() => removeItem(item._id)}
                                    className="text-red-500 hover:text-red-700 p-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <div className="p-8 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-2xl font-bold text-gray-800">
                                Total: <span className="text-green-700">₹{calculateTotal()}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="w-full md:w-auto px-8 py-4 bg-amber-700 text-white rounded-xl font-bold text-lg hover:bg-amber-800 shadow-lg transition transform hover:-translate-y-1"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
