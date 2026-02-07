import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const LocationSelection = () => {
    const navigate = useNavigate();
    const [locations, setLocations] = React.useState([]);

    React.useEffect(() => {
        const fetchAreas = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/areas`);
                setLocations(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAreas();
    }, []);

    const handleSelect = (locName) => {
        localStorage.setItem('selectedArea', locName);
        navigate('/schemes');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Select Your Location</h2>
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
        </div>
    );
};

export default LocationSelection;
