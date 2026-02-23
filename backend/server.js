require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Area = require('./models/Area');
const Product = require('./models/Product');
const Scheme = require('./models/Scheme');
const Order = require('./models/Order');
const Admin = require('./models/Admin');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve static files for uploaded images
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
})
    .then(() => {
        console.log("MongoDB Connected");
        seedData();
    })
    .catch(err => console.log(err));

// Seed Data
const seedData = async () => {
    try {
        const areaCount = await Area.countDocuments();
        if (areaCount === 0) {
            console.log("Seeding Data...");

            // Create Areas
            const areas = await Area.insertMany([
                { name: 'Kidwai Nagar' },
                { name: 'Saket Nagar' },
                { name: 'Hanspuram' }
            ]);

            // Create Products
            const almond = await Product.create({ name: 'Almond', image: 'http://localhost:5000/uploads/almond.png' });
            const cashew = await Product.create({ name: 'Cashew', image: 'http://localhost:5000/uploads/cashew.png' });

            const areaMap = {
                'Kidwai Nagar': areas.find(a => a.name === 'Kidwai Nagar')._id,
                'Saket Nagar': areas.find(a => a.name === 'Saket Nagar')._id,
                'Hanspuram': areas.find(a => a.name === 'Hanspuram')._id,
            };

            // Create Schemes
            // Kidwai Nagar: Almond ₹700, Cashew ₹800
            await Scheme.create([
                { area: areaMap['Kidwai Nagar'], product: almond._id, price: 700, offer: 'Best Seller' },
                { area: areaMap['Kidwai Nagar'], product: cashew._id, price: 800, offer: 'Fresh Stock' },

                // Saket Nagar: Almond ₹750, Cashew ₹820
                { area: areaMap['Saket Nagar'], product: almond._id, price: 750, offer: 'Premium Quality' },
                { area: areaMap['Saket Nagar'], product: cashew._id, price: 820, offer: 'Limited Time Deal' },

                // Hanspuram: Almond ₹720, Cashew ₹810
                { area: areaMap['Hanspuram'], product: almond._id, price: 720, offer: 'Special Discount' },
                { area: areaMap['Hanspuram'], product: cashew._id, price: 810, offer: 'Bulk Saver' },
            ]);

            // Create Admin
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password', salt);
            await Admin.create({ username: 'admin', password: hashedPassword });

            console.log("Data Seeded Successfully");
        }
    } catch (err) {
        console.error("Seeding Error:", err);
    }
};

// Middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// User Middleware
const userAuth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

// 1. Get Areas
app.get('/api/areas', async (req, res) => {
    try {
        const areas = await Area.find();
        res.json(areas);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 2. Get Schemes by Area Name or ID
app.get('/api/schemes/:area', async (req, res) => {
    try {
        let area = await Area.findOne({ name: req.params.area });
        if (!area) {
            // Try assuming it's an ID if not found by name
            if (mongoose.Types.ObjectId.isValid(req.params.area)) {
                area = await Area.findById(req.params.area);
            }
        }

        if (!area) return res.status(404).json({ msg: 'Area not found' });

        const schemes = await Scheme.find({ area: area._id }).populate('product');
        res.json(schemes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 3. Place Order
app.post('/api/orders', async (req, res) => {
    try {
        const { name, mobile, address, area, product, quantity, userId } = req.body;
        const newOrder = new Order({
            name, mobile, address, area, product, quantity,
            user: userId || null,
            status: 'Pending'
        });
        await newOrder.save();
        res.json(newOrder);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 3.1 Update Order Status (Admin)
// 3.1 Update Order Status (Admin)
app.put('/api/orders/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        console.log(`Updating order ${req.params.id} to status: ${status}`);

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status value' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        order.status = status;
        await order.save();
        res.json(order);
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).send('Server Error');
    }
});

// 3.1 Get User Orders
app.get('/api/orders/my-orders', userAuth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 15. User Authentication
// Register User
app.post('/api/auth/user/register', async (req, res) => {
    const { username, email, password, mobile, address, area } = req.body;
    console.log('Registering user:', { username, email, mobile, address, area });
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists with this email' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ username, email, password: hashedPassword, mobile, address, area });
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    mobile: user.mobile,
                    address: user.address,
                    area: user.area
                }
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Login User
app.post('/api/auth/user/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    mobile: user.mobile,
                    address: user.address,
                    area: user.area
                }
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update User Profile
app.put('/api/auth/user/profile', userAuth, async (req, res) => {
    const { username, address, password } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (username) user.username = username;
        if (address) user.address = address;
        if (area) user.area = area;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            address: user.address,
            area: user.area
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 4. Admin Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { admin: { id: admin.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 36000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { username: admin.username } });
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 4.1 Create New Admin (Protected)
app.post('/api/auth/create-admin', auth, async (req, res) => {
    const { username, password } = req.body;
    try {
        let admin = await Admin.findOne({ username });
        if (admin) return res.status(400).json({ msg: 'Admin already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        admin = new Admin({ username, password: hashedPassword });
        await admin.save();

        res.json({ msg: 'Admin created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 5. Admin - Get Orders
app.get('/api/orders', auth, async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 5.1 Admin - Get Total User Count
app.get('/api/admin/users/count', auth, async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 6. Admin - Add Product
app.post('/api/products', auth, async (req, res) => {
    try {
        const { name, image } = req.body;
        const product = new Product({ name, image });
        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 7. Admin - Get Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 10. Admin - Delete Product
app.delete('/api/products/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        // Optional: Delete image file associated with product if needed
        // const imagePath = path.join(__dirname, product.image.replace('http://localhost:5000', ''));
        // if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 8. Image Upload
app.post('/api/upload', auth, upload.single('image'), (req, res) => {
    res.json({ filePath: `/uploads/${req.file.filename}` });
});

// 9. Admin - Add Scheme
app.post('/api/schemes', auth, async (req, res) => {
    try {
        const { area, product, price, offer } = req.body;
        const scheme = new Scheme({ area, product, price, offer });
        await scheme.save();
        res.json(scheme);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 11. Admin - Get All Schemes
app.get('/api/admin/schemes', auth, async (req, res) => {
    try {
        const schemes = await Scheme.find().populate('area').populate('product');
        res.json(schemes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 12. Admin - Delete Scheme
app.delete('/api/schemes/:id', auth, async (req, res) => {
    try {
        await Scheme.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Scheme removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 13. Admin - Add Area
app.post('/api/areas', auth, async (req, res) => {
    try {
        const { name } = req.body;
        const newArea = new Area({ name });
        await newArea.save();
        res.json(newArea);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 14. Admin - Delete Area
app.delete('/api/areas/:id', auth, async (req, res) => {
    try {
        // Optional: Delete all schemes associated with this area?
        await Scheme.deleteMany({ area: req.params.id });

        await Area.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Area removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Serve static assets in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all for React routing (must be after API routes)
// Express 5 requires regex /.*/ or (.*) instead of '*'
app.get(/.*/, (req, res, next) => {
    // If it's an API request, skip to 404 handler
    if (req.originalUrl.startsWith('/api')) return next();

    const indexFile = path.join(__dirname, '../frontend/dist/index.html');
    if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
    } else {
        next(); // Fallback to 404 if frontend build missing
    }
});

// Final 404 Handler for API and missing frontend
app.use((req, res) => {
    res.status(404).json({ msg: 'Route Not Found', path: req.url });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
