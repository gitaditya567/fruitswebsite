import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL, getImageUrl } from '../config';

const Schemes = () => {
    const [schemes, setSchemes] = useState([]);
    const navigate = useNavigate();
    const area = localStorage.getItem('selectedArea');

    useEffect(() => {
        if (!area) navigate('/location');
        axios.get(`${API_URL}/api/schemes/${area}`)
            .then(res => setSchemes(res.data))
            .catch(err => console.error(err));
    }, [area, navigate]);

    const handleBuy = (scheme) => {
        navigate('/order', { state: { scheme } });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Schemes for <span className="text-amber-600">{area}</span></h2>
                <button onClick={() => navigate('/location')} className="text-amber-600 underline">Change Location</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {schemes.map(scheme => (
                    <div key={scheme._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300">
                        <img src={getImageUrl(scheme.product.image)} alt={scheme.product.name} className="w-full h-48 object-cover" />
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{scheme.product.name}</h3>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xl font-semibold text-green-600">₹{scheme.price}</span>
                                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">{scheme.offer}</span>
                            </div>
                            <button
                                onClick={() => handleBuy(scheme)}
                                className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition duration-300 font-bold"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {schemes.length === 0 && <p className="text-center text-gray-500 mt-10">No schemes available currently.</p>}
        </div>
    );
};

export default Schemes;
