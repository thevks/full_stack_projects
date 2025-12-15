// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Required to allow frontend communication

dotenv.config(); // Load environment variables from .env

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors()); // Enable CORS for the frontend
app.use(express.json()); // Body parser for JSON requests

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// --- Schema and Model (Step 2) ---
const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

const Todo = mongoose.model('Todo', todoSchema);

// --- CRUD Routes (Step 3) ---

// 1. Create a new ToDo (POST /api/todos)
app.post('/api/todos', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text field is required' });
        }
        const todo = new Todo({ text }); // completed defaults to false
        await todo.save();
        res.status(201).json(todo);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create ToDo' });
    }
});

// 2. Read all ToDos (GET /api/todos)
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve ToDos' });
    }
});

// 3. Update a ToDo (PUT /api/todos/:id)
app.put('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { text, completed } = req.body;
        
        // Construct update object only with provided fields
        const updateFields = {};
        if (text !== undefined) updateFields.text = text;
        if (completed !== undefined) updateFields.completed = completed;

        const todo = await Todo.findByIdAndUpdate(id, updateFields, { new: true });

        if (!todo) {
            return res.status(404).json({ error: 'ToDo not found' });
        }
        res.json(todo);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update ToDo' });
    }
});

// 4. Delete a ToDo (DELETE /api/todos/:id)
app.delete('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await Todo.findByIdAndDelete(id);
        if (!todo) {
            return res.status(404).send({ error: 'ToDo not found' });
        }
        res.status(204).send(); // No content for successful deletion
    } catch (err) {
        res.status(400).json({ error: 'Failed to delete ToDo' });
    }
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
