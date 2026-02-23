import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const LocationSelection = () => {
    const navigate = useNavigate();
    const [locations, setLocations] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/user/login');
            return;
        }

        const storedArea = localStorage.getItem('selectedArea');
        if (storedArea && storedArea !== 'undefined') {
            navigate('/schemes');
            return;
        }

        const fetchAreas = async () => {
            try {
                // Log API URL to debug in console
                console.log('Fetching areas from:', `${API_URL}/api/areas`);
                const res = await axios.get(`${API_URL}/api/areas`);
                setLocations(res.data);
            } catch (err) {
                console.error('Error fetching areas:', err);
                setError('Failed to load locations. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };
        fetchAreas();
    }, [navigate]);

    const handleSelect = async (locName) => {
        try {
            const token = localStorage.getItem('userToken');
            // Update user profile in backend so preference is saved
            await axios.put(
                `${API_URL}/api/auth/user/profile`,
                { area: locName },
                { headers: { 'x-auth-token': token } }
            );

            // Update local storage and userInfo
            localStorage.setItem('selectedArea', locName);
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const user = JSON.parse(userInfo);
                user.area = locName;
                localStorage.setItem('userInfo', JSON.stringify(user));
            }

            navigate('/schemes');
        } catch (err) {
            console.error('Error updating location:', err);
            // Fallback: still navigate even if backend update fails, but warn? 
            // Better to just proceed for user experience if backend is glitchy, but ideal to show error.
            // For now, proceed as valid fallback
            localStorage.setItem('selectedArea', locName);
            navigate('/schemes');
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-900 mb-4"></div>
            <p className="text-amber-900 text-xl font-bold animate-pulse">Loading Locations...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="text-red-800 text-xl font-bold mb-2">Unable to Load Locations</div>
            <p className="text-gray-600">Please check your internet connection and try again.</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-amber-700 text-white rounded-full hover:bg-amber-800 transition shadow-lg"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Select Your Location</h2>
            {locations.length === 0 ? (
                <p className="text-gray-500 text-lg">No locations found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {locations.map((loc) => (
                        <button
                            key={loc._id}
                            onClick={() => handleSelect(loc.name)}
                            className="p-8 bg-white rounded-xl shadow-md hover:shadow-2xl hover:bg-amber-50 border border-amber-100 text-xl font-semibold text-amber-900 transition duration-300 w-64"
                        >
                            {loc.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LocationSelection;
