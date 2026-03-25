const express = require('express');
const cors = require('cors');
const { createClient } = require('@sanity/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse JSON bodies

// Configure Sanity Client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'denvgz3m',
  dataset: 'production',
  apiVersion: '2024-03-23',
  token: process.env.SANITY_TOKEN, // VERY IMPORTANT: keep this secret!
  useCdn: false // Must be false for mutations (creating data)
});

// Endpoint to add a new book
app.post('/add-book', async (req, res) => {
  try {
    const { title, author, category, price } = req.body;

    // Validate we have the required fields
    if (!title || !author || !category || !price) {
      return res.status(400).json({ error: 'Missing required fields: title, author, category, price' });
    }

    // Prepare the document to send to Sanity
    const doc = {
      _type: 'book',
      title: title,
      price: Number(price),
      // We assume category is just a string, adjust if it's a reference: "genre": { _type: "reference", _ref: category }
      category: category, 
      // Ensure we use author as a reference object!
      author: {
        _type: 'reference',
        _ref: author
      }
    };

    // Create document in Sanity
    const result = await client.create(doc);
    console.log('Book created with ID:', result._id);
    
    // Return success response to the frontend
    res.status(201).json({ success: true, message: 'Book created successfully!', document: result });

  } catch (error) {
    console.error('Error creating book in Sanity:', error);
    res.status(500).json({ success: false, error: 'Failed to create book', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
