import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: '',
        email: '',
        mobile: '',
        address: '',
        area: '',
        password: '' // Only if they want to change it
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            setUser({ ...JSON.parse(storedUser), password: '' });
        } else {
            navigate('/user/login');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('userToken');
            const config = {
                headers: {
                    'x-auth-token': token
                }
            };

            const payload = {
                username: user.username,
                address: user.address,
                password: user.password ? user.password : undefined
            };

            const res = await axios.put(`${API_URL}/api/auth/user/profile`, payload, config);

            // Update local storage
            const updatedUser = { ...user, ...res.data };
            delete updatedUser.password; // Don't store password in local storage
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));

            setMsg('Profile Updated Successfully!');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setMsg('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('selectedArea');
        localStorage.removeItem('cartItems');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-amber-800">My Profile</h2>
                    <button
                        onClick={() => navigate('/schemes')}
                        className="text-amber-600 hover:text-amber-800 font-semibold"
                    >
                        &larr; Back to Shop
                    </button>
                </div>

                {msg && (
                    <div className={`p-4 rounded-lg text-center font-bold ${msg.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {msg}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-600 mb-1">Email (Cannot change)</label>
                        <input className="w-full p-3 bg-gray-100 border rounded cursor-not-allowed" value={user.email} readOnly />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-1">Mobile (Cannot change)</label>
                        <input className="w-full p-3 bg-gray-100 border rounded cursor-not-allowed" value={user.mobile} readOnly />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-1">Area (Cannot change)</label>
                        <input className="w-full p-3 bg-gray-100 border rounded cursor-not-allowed" value={user.area} readOnly />
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t">
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">Full Name</label>
                            <input
                                className="w-full p-3 border border-amber-200 rounded focus:ring-2 focus:ring-amber-500 outline-none"
                                name="username"
                                value={user.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">Address</label>
                            <textarea
                                className="w-full p-3 border border-amber-200 rounded focus:ring-2 focus:ring-amber-500 outline-none"
                                name="address"
                                value={user.address}
                                onChange={handleChange}
                                rows="3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">New Password (leave blank to keep current)</label>
                            <input
                                className="w-full p-3 border border-amber-200 rounded focus:ring-2 focus:ring-amber-500 outline-none"
                                type="password"
                                name="password"
                                placeholder="Enter new password"
                                value={user.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition shadow-md disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </form>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition mt-4"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
