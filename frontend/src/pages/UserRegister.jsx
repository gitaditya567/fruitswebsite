import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

const UserRegister = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        mobile: '',
        address: '',
        password: '',
        area: ''
    });
    const [areas, setAreas] = useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchAreas = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/areas`);
                setAreas(res.data);
            } catch (err) {
                console.error('Error fetching areas:', err);
            }
        };
        fetchAreas();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.area) {
            alert('Please select your location');
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/api/auth/user/register`, formData);
            localStorage.setItem('userToken', res.data.token);
            localStorage.setItem('userInfo', JSON.stringify(res.data.user));
            // Set selectedArea to the registered area so they see schemes only for their area
            // Set selectedArea to the registered area so they see schemes only for their area
            if (res.data.user.area && res.data.user.area !== 'undefined') {
                localStorage.setItem('selectedArea', res.data.user.area);
            }
            alert('Registration Successful!');
            navigate('/schemes');
        } catch (err) {
            console.error('Registration Error:', err);
            const errorMessage = err.response?.data?.msg || 'Registration Failed';
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
                <h2 className="text-3xl font-serif font-bold mb-6 text-center text-amber-900">Create Account</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        name="username"
                        placeholder="Full Name"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        name="mobile"
                        placeholder="Mobile Number"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                    />
                    <select
                        className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Your Location</option>
                        {areas.map(area => (
                            <option key={area._id} value={area.name}>{area.name}</option>
                        ))}
                    </select>
                    <textarea
                        className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        name="address"
                        placeholder="Delivery Address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="2"
                        required
                    />
                    <input
                        className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button className="w-full bg-amber-700 text-white py-3 rounded-lg font-bold hover:bg-amber-800 transition duration-300 shadow-md">
                        Sign Up
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-gray-600">Already have an account? <Link to="/user/login" className="text-amber-700 font-bold hover:underline">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};
export default UserRegister;
