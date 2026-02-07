import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen">
            {/* Background Image with Low Opacity */}
            <div
                className="absolute inset-0 bg-cover bg-center z-[-1]"
                style={{ backgroundImage: "url('/bg-dryfruits.png')", opacity: 0.3 }}
            ></div>

            {/* Content */}
            <div className="text-center p-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl max-w-lg w-full transform hover:scale-105 transition duration-500">
                <h1 className="text-5xl font-extrabold text-amber-900 mb-6 font-serif">Royal Dry Fruits</h1>
                <p className="text-gray-800 mb-8 text-lg font-semibold">Premium Quality Delights from Nature's Lap</p>
                <button
                    onClick={() => navigate('/location')}
                    className="bg-amber-700 text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-amber-800 shadow-lg hover:shadow-xl transition duration-300 animate-bounce"
                >
                    Start Shopping
                </button>
            </div>
        </div>
    );
};

export default Welcome;
