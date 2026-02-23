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

    const [userCount, setUserCount] = useState(0);

    // Forms
    const [productForm, setProductForm] = useState({ name: '', image: null, imageUrl: '' });
    const [schemeForm, setSchemeForm] = useState({ area: '', product: '', price: '', offer: '' });
    const [adminForm, setAdminForm] = useState({ username: '', password: '' });

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

            // Fetch User Count
            const uRes = await axios.get(`${API_URL}/api/admin/users/count`, config);
            setUserCount(uRes.data.count);
        } catch (e) { console.error(e); }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.put(`${API_URL}/api/orders/${id}/status`, { status: newStatus }, config);
            // Optimistically update UI or re-fetch
            setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || 'Failed to update status';
            alert(msg);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();

        let imagePath = productForm.imageUrl;

        try {
            // 1. Upload Image (only if file is selected)
            if (productForm.image) {
                const formData = new FormData();
                formData.append('image', productForm.image);
                const uploadRes = await axios.post(`${API_URL}/api/upload`, formData, config);
                imagePath = `${API_URL}${uploadRes.data.filePath}`;
            }

            if (!imagePath) {
                alert('Please upload an image or provide an Image URL');
                return;
            }

            // 2. Add Product
            await axios.post(`${API_URL}/api/products`, { name: productForm.name, image: imagePath }, config);
            alert('Product Added');
            fetchMeta();
            setProductForm({ name: '', image: null, imageUrl: '' });
            // Reset file input manually if needed, or rely on state
            document.getElementById('fileInput').value = "";
        } catch (err) {
            console.error(err);
            alert('Error adding product');
        }
    };

    // ... (rest of the component)



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



    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/auth/create-admin`, adminForm, config);
            alert('New Admin Created Successfully');
            setAdminForm({ username: '', password: '' });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Error creating admin');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <div className="bg-white px-6 py-3 rounded-lg shadow-md border-l-4 border-amber-600 flex items-center">
                        <span className="text-gray-600 font-semibold mr-2">Total Client:</span>
                        <span className="text-2xl font-bold text-amber-700">{userCount}</span>
                    </div>
                </div>
                <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
                    <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'orders' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}>Orders</button>
                    <button onClick={() => setActiveTab('view_products')} className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'view_products' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}>All Products</button>
                    <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded ${activeTab === 'products' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}>Add Product</button>
                    <button onClick={() => setActiveTab('schemes')} className={`px-4 py-2 rounded ${activeTab === 'schemes' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}>Schemes</button>
                    <button onClick={() => setActiveTab('areas')} className={`px-4 py-2 rounded ${activeTab === 'areas' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}>Areas</button>
                    <button onClick={() => setActiveTab('admins')} className={`px-4 py-2 rounded ${activeTab === 'admins' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700'}`}>Manage Admins</button>
                    <div className="ml-auto flex items-center space-x-4">
                        <span className="text-gray-700 font-semibold">Welcome, {localStorage.getItem('adminUser') || 'Admin'}</span>
                        <button onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('adminUser');
                            navigate('/admin/login');
                        }} className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
                    </div>
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
                                    <th className="p-3 text-left">Status</th>
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
                                        <td className="p-3">
                                            <select
                                                value={o.status || 'Pending'}
                                                onChange={(e) => handleStatusChange(o._id, e.target.value)}
                                                className={`p-1 rounded text-sm font-semibold border
                                                    ${o.status === 'Delivered' ? 'bg-green-100 text-green-800 border-green-300' :
                                                        o.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-300' :
                                                            o.status === 'Shipped' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                                'bg-yellow-100 text-yellow-800 border-yellow-300'}`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
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
                            <input className="w-full p-2 border mb-4" placeholder="Product Name" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Option A: Upload Image File</label>
                                <input id="fileInput" type="file" className="w-full p-2 border" onChange={e => setProductForm({ ...productForm, image: e.target.files[0] })} />
                            </div>

                            <div className="text-center my-2 text-gray-500 font-bold">- OR -</div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Option B: Image URL (Permanent)</label>
                                <input className="w-full p-2 border" placeholder="https://example.com/image.jpg" value={productForm.imageUrl} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} />
                            </div>

                            <button className="w-full bg-amber-600 text-white py-2 rounded font-bold hover:bg-amber-700 transition">Add Product</button>
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


                {activeTab === 'admins' && (
                    <div className="bg-white p-6 rounded shadow max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Create New Admin User</h2>
                        <form onSubmit={handleAdminSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2">New Username</label>
                                <input
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter username"
                                    value={adminForm.username}
                                    onChange={e => setAdminForm({ ...adminForm, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 font-bold mb-2">New Password</label>
                                <input
                                    className="w-full p-2 border rounded"
                                    type="password"
                                    placeholder="Enter password"
                                    value={adminForm.password}
                                    onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                                    required
                                />
                            </div>
                            <button className="w-full bg-amber-600 text-white py-2 rounded font-bold hover:bg-amber-700 transition">Create Admin</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AdminDashboard;
