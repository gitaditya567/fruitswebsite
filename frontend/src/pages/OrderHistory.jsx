import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        const fetchOrders = async (showLoading = true) => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                if (isMounted) {
                    alert('Please login to view order history');
                    navigate('/user/login');
                }
                return;
            }

            try {
                const res = await axios.get(`${API_URL}/api/orders/my-orders`, {
                    headers: { 'x-auth-token': token }
                });
                if (isMounted) {
                    setOrders(res.data);
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401 && isMounted) {
                    alert('Session expired, please login again');
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userInfo');
                    navigate('/user/login');
                }
                if (isMounted) setLoading(false);
            }
        };

        // Initial fetch
        fetchOrders(true);

        // Auto-refresh every 5 seconds
        const intervalId = setInterval(() => {
            fetchOrders(false); // Silent update
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold text-amber-900 font-serif">My Order History</h1>
                        <span className="text-amber-700 italic text-sm mt-1">Hello, {JSON.parse(localStorage.getItem('userInfo') || '{}').username || 'Guest'}</span>
                    </div>
                    <button onClick={() => navigate('/schemes')} className="bg-amber-600 text-white px-4 py-2 rounded shadow hover:bg-amber-700">Back to Shop</button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center">
                        <p className="text-gray-600 text-lg mb-4">You haven't placed any orders yet.</p>
                        <button onClick={() => navigate('/location')} className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold hover:bg-amber-700">Start Shopping</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 border-l-4 border-amber-500">
                                <div className="flex flex-col md:flex-row justify-between md:items-center">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Order ID: <span className="font-mono text-gray-700">{order._id}</span></p>
                                        <h3 className="text-xl font-bold text-gray-800">{order.product}</h3>
                                        <p className="text-gray-600">Quantity: <span className="font-semibold">{order.quantity}</span></p>
                                        <p className="text-gray-600">Area: {order.area}</p>
                                    </div>
                                    <div className="mt-4 md:mt-0 text-right">
                                        <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString()}</p>
                                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold 
                                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-gray-700"><span className="font-semibold">Delivering to:</span> {order.name} ({order.mobile})</p>
                                    <p className="text-gray-600 text-sm">{order.address}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
