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

// Create a schema
const gitaSchema = new mongoose.Schema({
  page: Number,
  content: String,
});

const Gita = mongoose.model('Gita', gitaSchema);


// Routes
app.get('/api/pages/:page',cors(),async (req, res) => {
  const { page } = req.params;

  try {
    const gitaPage = await Gita.findOne({ page: parseInt(page) });
    if (!gitaPage) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(gitaPage);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/pages',cors(),async (req, res) => {
  //console.log("post request came");

  const { page, content } = req.body;

  try {
    let gitaPage = await Gita.findOne({ page });
    if (gitaPage) {
      return res.status(400).json({ message: 'Page already exists' });
    }

    gitaPage = new Gita({ page, content });
    await gitaPage.save();
    res.status(201).json({ message: 'Page created successfully', gitaPage });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ... (your existing code)

app.get('/api/search', cors(), async (req, res) => {
  const { searchString } =req.query;
  //console.log(searchString);
  try {
    const pagesContainingString = await Gita.find({ content: { $regex: searchString, $options: 'i' } }, { _id: 0, page: 1 });
    if (!pagesContainingString || pagesContainingString.length === 0) {
      return res.status(404).json({ message: 'String not found in any page' });
    }
    const pageNumbers = pagesContainingString.map((page) => page.page);
    res.json({ message: 'Pages found with the string', pages: pageNumbers });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

const PORT =  5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
