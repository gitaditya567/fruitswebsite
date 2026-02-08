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
    }, []);

    const handleSelect = (locName) => {
        localStorage.setItem('selectedArea', locName);
        navigate('/schemes');
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="text-xl mb-4">Loading locations...</div>
            <div className="text-sm text-gray-500">Connecting to: {API_URL}</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-red-600 text-xl font-bold mb-2">Connection Error</div>
            <div className="text-gray-700 mb-4">{error}</div>
            <div className="bg-gray-200 p-2 rounded text-xs font-mono break-all">
                Attempted URL: {API_URL}/api/areas
            </div>
            <div className="mt-4 text-sm text-gray-600 max-w-md text-center">
                <strong>Troubleshooting:</strong><br />
                1. Open <a href={API_URL} target="_blank" className="text-blue-600 underline">this backend link</a>. You should see "API is running...".<br />
                2. If you see a "Not Found" or "Site Not Found" error, check your Render Dashboard.<br />
                3. Ensure your Backend is deployed as a <strong>Web Service</strong>, NOT a Static Site.
            </div>
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
