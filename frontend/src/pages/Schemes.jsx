import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL, getImageUrl } from '../config';

const Schemes = () => {
    const [schemes, setSchemes] = useState([]);
    const navigate = useNavigate();
    const area = localStorage.getItem('selectedArea');

    useEffect(() => {
        // Handle case where area might be string "undefined" from previous bug
        if (!area || area === 'undefined' || area === 'null') {
            // If we are logged in, try to get area from user info
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    const user = JSON.parse(userInfo);
                    if (user.area && user.area !== 'undefined') {
                        localStorage.setItem('selectedArea', user.area);
                        window.location.reload();
                        return;
                    }
                } catch (e) {
                    console.error("Error parsing userInfo", e);
                    localStorage.removeItem('userInfo');
                }
            }
            // If not logged in at all, go to login
            const token = localStorage.getItem('userToken');
            if (!token) {
                navigate('/user/login');
                return;
            }

            // If logged in but no valid area found in localStorage or userInfo, redirect to location selection
            navigate('/location');
            return;
        }

        axios.get(`${API_URL}/api/schemes/${area}`)
            .then(res => setSchemes(res.data))
            .catch(err => console.error(err));
    }, [area, navigate]);

    // Prevent rendering if area is invalid
    if (!area || area === 'undefined' || area === 'null') {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900"></div></div>;
    }

    const [notification, setNotification] = useState('');

    useEffect(() => {
        // ... existing useEffect ...
    }, [area, navigate]);

    const handleBuy = (scheme) => {
        // Direct buy
        navigate('/order', { state: { scheme } });
    };

    const handleAddToCart = (scheme) => {
        let cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const existingItem = cart.find(item => item._id === scheme._id);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({ ...scheme, quantity: 1 });
        }

        localStorage.setItem('cartItems', JSON.stringify(cart));
        setNotification(`${scheme.product.name} added to cart!`);
        setTimeout(() => setNotification(''), 2000);
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('selectedArea');
        localStorage.removeItem('cartItems');
        navigate('/user/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 pt-20 relative">
            {/* Sticky Navigation Header */}
            <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-8 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-amber-900">Dry Fruits Store</h1>
                <div className="flex gap-6 font-semibold text-gray-700 items-center">
                    <span className="text-amber-800 italic text-sm hidden md:block">
                        Welcome, {JSON.parse(localStorage.getItem('userInfo') || '{}').username || 'Guest'}
                    </span>
                    <button onClick={() => navigate('/schemes')} className="text-amber-600">Shop</button>
                    <button onClick={() => navigate('/cart')} className="hover:text-amber-600">Cart</button>
                    <button onClick={() => navigate('/user/profile')} className="hover:text-amber-600">Profile</button>
                    <button onClick={handleLogout} className="text-red-600 hover:text-red-800">Logout</button>
                </div>
            </div>

            {notification && (
                <div className="fixed bottom-10 right-10 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
                    {notification}
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Schemes for <span className="text-amber-600">{area}</span></h2>
                {/* Removed Change Location link as it is restricted now */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {schemes.map(scheme => (
                    <div key={scheme._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col">
                        <div className="relative h-48 w-full bg-gray-200">
                            {/* ... image code ... */}
                            {!scheme.product ? (
                                <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold p-4 text-center">
                                    Product Data Missing
                                </div>
                            ) : (
                                <img
                                    src={getImageUrl(scheme.product.image)}
                                    alt={scheme.product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                        console.error('Image failed to load:', getImageUrl(scheme.product.image));
                                    }}
                                />
                            )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{scheme.product?.name || 'Unknown Product'}</h3>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xl font-semibold text-green-600">₹{scheme.price}</span>
                                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">{scheme.offer}</span>
                            </div>
                            <div className="mt-auto flex gap-3">
                                <button
                                    onClick={() => handleAddToCart(scheme)}
                                    className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition duration-300 font-bold border border-gray-300"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => handleBuy(scheme)}
                                    className="flex-1 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition duration-300 font-bold"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {schemes.length === 0 && <p className="text-center text-gray-500 mt-10">No schemes available currently.</p>}
        </div>
    );
};

export default Schemes;
