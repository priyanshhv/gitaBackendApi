// index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(`mongodb+srv://nopenoppp:${process.env.DB_PASSWORD}@cluster0.ip2z7hj.mongodb.net/gitaDB`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Updated schema
const gitaSchema = new mongoose.Schema({
  word: String,    // Updated schema with 'word' instead of 'page'
  content: String,
});

const Gita = mongoose.model('Gita', gitaSchema);

// Updated routes
app.get('/api/words/:word', cors(), async (req, res) => {
  const { word } = req.params;

  try {
    const gitaWord = await Gita.findOne({ word });
    if (!gitaWord) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.json(gitaWord);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/words', cors(), async (req, res) => {
  const wordsArray = req.body;
  // console.log(wordsArray);

  try {
    // Use bulkWrite for optimized insertion or update
    const bulkOps = wordsArray.map(({ word, content }) => ({
      updateOne: {
        filter: { word },
        update: { $set: { word, content } },
        upsert: true,  // If not present, insert a new document
      },
    }));

    await Gita.bulkWrite(bulkOps);

    res.status(201).json({ message: 'Words updated/added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/search', cors(), async (req, res) => {
  const { searchString } = req.query;

  try {
    const wordsContainingString = await Gita.find(
      { word: { $regex: searchString, $options: 'i' } },
      { _id: 0, word: 1 }
    ).limit(20); // Limit results to 10

    if (!wordsContainingString || wordsContainingString.length === 0) {
      return res.status(404).json({ message: 'String not found in any word' });
    }
  
    const result = wordsContainingString.map(({ word }) => ({ word }));
    res.json({ message: 'Words found with the string', words: result });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
