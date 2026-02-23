import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { username, password });
            localStorage.setItem('token', res.data.token);
            if (res.data.user && res.data.user.username) {
                localStorage.setItem('adminUser', res.data.user.username);
            }
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Login Error:', err);
            const errorMessage = err.response?.data?.msg || 'Login Failed. Check console/backend.';
            alert(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <form onSubmit={handleLogin} className="bg-white p-10 rounded-xl shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
                <input className="w-full p-3 border rounded mb-4" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                <input className="w-full p-3 border rounded mb-6" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <button className="w-full bg-gray-800 text-white py-3 rounded font-bold hover:bg-gray-900">Login</button>
            </form>
        </div>
    );
};
export default AdminLogin;
