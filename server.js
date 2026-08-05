// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to Cloud Database (MongoDB)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tesloiq";
mongoose.connect(MONGO_URI)
    .then(() => console.log("Cloud Database Filing Cabinet Connected Successfully!"))
    .catch(err => console.error("Database connection error:", err));

// 2. Database Schemas (The Blueprints for our files)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 3250.00 }
});

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'withdraw', 'investment'], required: true }, // Added 'investment'
    desc: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

// 3. API Endpoints (The Postman Routes)

// Sign Up Route
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: "User already exists" });

        user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ message: "User account created globally!", userId: user._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sign In / Login Route (Returns balance on login)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });
        
        res.json({ userId: user._id, name: user.name, email: user.email, balance: user.balance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch User Profile Data (Route aligned with api.js)
app.get('/api/user/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ name: user.name, email: user.email, balance: user.balance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch All User Transactions
app.get('/api/transactions/:userId', async (req, res) => {
    try {
        const history = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a New Deposit, Withdrawal, or Investment
app.post('/api/transactions', async (req, res) => {
    try {
        const { userId, type, amount, desc } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const parsedAmount = parseFloat(amount);

        // Check funds for withdrawals and investments
        if ((type === 'withdraw' || type === 'investment') && user.balance < parsedAmount) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        if (type === 'deposit') {
            user.balance += parsedAmount;
        } else if (type === 'withdraw' || type === 'investment') {
            user.balance -= parsedAmount; // Deducts correctly from balance
        }

        await user.save();

        const tx = new Transaction({ userId, type, amount: parsedAmount, desc });
        await tx.save();

        res.json({ balance: user.balance, transaction: tx });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
