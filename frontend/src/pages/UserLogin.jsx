import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

const UserLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/auth/user/login`, { email, password });
            localStorage.setItem('userToken', res.data.token);
            localStorage.setItem('userInfo', JSON.stringify(res.data.user)); // Store user info (id, name, mobile)

            // Set selectedArea to the registered area so they see schemes only for their area
            // Set selectedArea to the registered area so they see schemes only for their area
            if (res.data.user.area && res.data.user.area !== 'undefined') {
                localStorage.setItem('selectedArea', res.data.user.area);
                navigate('/schemes');
            } else {
                navigate('/location'); // Fallback if old user without area
            }
        } catch (err) {
            console.error('Login Error:', err);
            const errorMessage = err.response?.data?.msg || 'Login Failed';
            alert(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-amber-50 relative">
            <div
                className="absolute inset-0 bg-cover bg-center z-0 opacity-20"
                style={{ backgroundImage: "url('/bg-dryfruits.png')" }}
            ></div>
            <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md z-10 border border-amber-100">
                <h2 className="text-3xl font-serif font-bold mb-6 text-center text-amber-900">User Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button className="w-full bg-amber-700 text-white py-3 rounded-lg font-bold hover:bg-amber-800 transition duration-300 shadow-md">
                        Login
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-gray-600">Don't have an account? <Link to="/user/register" className="text-amber-700 font-bold hover:underline">Register here</Link></p>
                </div>
            </div>
        </div>
    );
};
export default UserLogin;
