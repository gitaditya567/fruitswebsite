import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL, getImageUrl } from '../config';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [areas, setAreas] = useState([]);
    const [areaForm, setAreaForm] = useState('');

    // Forms
    const [productForm, setProductForm] = useState({ name: '', image: null });
    const [schemeForm, setSchemeForm] = useState({ area: '', product: '', price: '', offer: '' });

    const token = localStorage.getItem('token');
    const config = { headers: { 'x-auth-token': token } };

    useEffect(() => {
        if (!token) navigate('/admin/login');
        fetchData();
        fetchMeta();
    }, [token, navigate]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/orders`, config);
            setOrders(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchMeta = async () => {
        try {
            const pRes = await axios.get(`${API_URL}/api/products`);
            setProducts(pRes.data);
            const aRes = await axios.get(`${API_URL}/api/areas`);
            setAreas(aRes.data);
            const sRes = await axios.get(`${API_URL}/api/admin/schemes`, config);
            setSchemes(sRes.data);
        } catch (e) { console.error(e); }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', productForm.image);

        try {
            // 1. Upload Image
            const uploadRes = await axios.post(`${API_URL}/api/upload`, formData, config);
            const imagePath = `${API_URL}${uploadRes.data.filePath}`;

            // 2. Add Product
            await axios.post(`${API_URL}/api/products`, { name: productForm.name, image: imagePath }, config);
            alert('Product Added');
            fetchMeta();
            setProductForm({ name: '', image: null });
        } catch (err) { alert('Error adding product'); }
    };

    const handleSchemeSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/schemes`, schemeForm, config);
            alert('Scheme Added');
            fetchMeta();
            setSchemeForm({ area: '', product: '', price: '', offer: '' });
        } catch (err) { alert('Error adding scheme'); }
    };

    const handleDeleteScheme = async (id) => {
        if (window.confirm('Delete this scheme (Remove product from area)?')) {
            try {
                await axios.delete(`${API_URL}/api/schemes/${id}`, config);
                fetchMeta();
            } catch (err) { alert('Error deleting scheme'); }
        }
    };

    const handleAreaSubmit = async (e) => {
        e.preventDefault();
        if (!areaForm) return;
        try {
            await axios.post(`${API_URL}/api/areas`, { name: areaForm }, config);
            setAreaForm('');
            fetchMeta();
            alert('Area Added');
        } catch (err) { alert('Error adding area'); }
    };

    const handleDeleteArea = async (id) => {
        if (window.confirm('Delete this Area? This will verify remove all schemes in this area.')) {
            try {
                await axios.delete(`${API_URL}/api/areas/${id}`, config);
                fetchMeta();
            } catch (err) { alert('Error deleting area'); }
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/api/products/${id}`, config);
                fetchMeta(); // Refresh list
                alert('Product Deleted');
            } catch (err) {
                console.error(err);
                alert('Error deleting product');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
                <div className="flex space-x-4 mb-8">
                    <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}>Orders</button>
                    <button onClick={() => setActiveTab('view_products')} className={`px-4 py-2 rounded ${activeTab === 'view_products' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}>All Products</button>
                    <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded ${activeTab === 'products' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}>Add Product</button>
                    <button onClick={() => setActiveTab('schemes')} className={`px-4 py-2 rounded ${activeTab === 'schemes' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}>Schemes</button>
                    <button onClick={() => setActiveTab('areas')} className={`px-4 py-2 rounded ${activeTab === 'areas' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}>Areas</button>
                    <button onClick={() => { localStorage.removeItem('token'); navigate('/admin/login'); }} className="px-4 py-2 bg-red-500 text-white rounded ml-auto">Logout</button>
                </div>

                {activeTab === 'orders' && (
                    <div className="bg-white p-6 rounded shadow overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="p-3 text-left">Date</th>
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Address</th>
                                    <th className="p-3 text-left">Product</th>
                                    <th className="p-3 text-left">Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o._id} className="border-b">
                                        <td className="p-3">{new Date(o.date).toLocaleDateString()}</td>
                                        <td className="p-3">{o.name} <br /><span className="text-xs text-gray-500">{o.mobile}</span></td>
                                        <td className="p-3">{o.address} <br /><span className="text-xs text-gray-500">{o.area}</span></td>
                                        <td className="p-3">{o.product}</td>
                                        <td className="p-3">{o.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'view_products' && (
                    <div className="bg-white p-6 rounded shadow overflow-x-auto">
                        <h2 className="text-xl font-bold mb-4">All Products</h2>
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="p-3 text-left">Image</th>
                                    <th className="p-3 text-left">Product Name</th>
                                    <th className="p-3 text-left">ID</th>
                                    <th className="p-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p._id} className="border-b">
                                        <td className="p-3">
                                            <img src={getImageUrl(p.image)} alt={p.name} className="w-16 h-16 object-cover rounded shadow-sm" />
                                        </td>
                                        <td className="p-3 font-medium">{p.name}</td>
                                        <td className="p-3 text-gray-500 text-sm">{p._id}</td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleDeleteProduct(p._id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-4 text-center text-gray-500">No products found. Add one!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="bg-white p-6 rounded shadow max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Add New Product</h2>
                        <form onSubmit={handleProductSubmit}>
                            <input className="w-full p-2 border mb-4" placeholder="Product Name" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                            <input type="file" className="w-full p-2 border mb-4" onChange={e => setProductForm({ ...productForm, image: e.target.files[0] })} />
                            <button className="bg-amber-600 text-white px-4 py-2 rounded">Upload & Add</button>
                        </form>
                    </div>
                )}

                {activeTab === 'schemes' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded shadow overflow-x-auto">
                            <h2 className="text-xl font-bold mb-4">Active Schemes (Products in Areas)</h2>
                            <p className="text-sm text-gray-500 mb-4">Deleting a scheme removes the product availability from that specific area, without deleting the active product globally.</p>
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="p-3 text-left">Area</th>
                                        <th className="p-3 text-left">Product</th>
                                        <th className="p-3 text-left">Price</th>
                                        <th className="p-3 text-left">Offer</th>
                                        <th className="p-3 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schemes.map(s => (
                                        <tr key={s._id} className="border-b">
                                            <td className="p-3 font-medium">{s.area?.name || 'Unknown Area'}</td>
                                            <td className="p-3">{s.product?.name || 'Unknown Product'}</td>
                                            <td className="p-3">₹{s.price}</td>
                                            <td className="p-3 text-sm text-green-600">{s.offer}</td>
                                            <td className="p-3">
                                                <button onClick={() => handleDeleteScheme(s._id)} className="text-red-500 hover:text-red-700 font-bold">X</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {schemes.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No active schemes found.</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-white p-6 rounded shadow max-w-lg">
                            <h2 className="text-xl font-bold mb-4">Add Scheme</h2>
                            <form onSubmit={handleSchemeSubmit}>
                                <select className="w-full p-2 border mb-4" value={schemeForm.area} onChange={e => setSchemeForm({ ...schemeForm, area: e.target.value })}>
                                    <option>Select Area</option>
                                    <option disabled>---</option>
                                    {areas.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                                </select>
                                <select className="w-full p-2 border mb-4" value={schemeForm.product} onChange={e => setSchemeForm({ ...schemeForm, product: e.target.value })}>
                                    <option>Select Product</option>
                                    <option disabled>---</option>
                                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                                <input className="w-full p-2 border mb-4" placeholder="Price" type="number" value={schemeForm.price} onChange={e => setSchemeForm({ ...schemeForm, price: e.target.value })} />
                                <input className="w-full p-2 border mb-4" placeholder="Offer Text" value={schemeForm.offer} onChange={e => setSchemeForm({ ...schemeForm, offer: e.target.value })} />
                                <button className="bg-amber-600 text-white px-4 py-2 rounded">Add Scheme</button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'areas' && (
                    <div className="bg-white p-6 rounded shadow max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Manage Areas</h2>

                        <div className="mb-8">
                            <h3 className="font-semibold mb-2">Existing Areas</h3>
                            <ul className="border rounded divide-y">
                                {areas.map(a => (
                                    <li key={a._id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                        <span>{a.name}</span>
                                        <button onClick={() => handleDeleteArea(a._id)} className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200">Delete</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <h3 className="font-semibold mb-2">Add New Area</h3>
                        <form onSubmit={handleAreaSubmit}>
                            <input className="w-full p-2 border mb-4" placeholder="Area Name (e.g., Kidwai Nagar)" value={areaForm} onChange={e => setAreaForm(e.target.value)} />
                            <button className="bg-amber-600 text-white px-4 py-2 rounded">Add Area</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AdminDashboard;
