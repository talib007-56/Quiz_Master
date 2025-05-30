const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const Chapter = require('../models/chapter.model');

// Get all chapters
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.subject_id) {
      query.subject_id = req.query.subject_id;
    }
    const chapters = await Chapter.find(query).populate('subject_id');
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single chapter
router.get('/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate('subject_id');
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new chapter (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const chapter = new Chapter({
    subject_id: req.body.subject_id,
    name: req.body.name,
    description: req.body.description
  });

  try {
    const newChapter = await chapter.save();
    res.status(201).json(newChapter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a chapter (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    if (req.body.subject_id) chapter.subject_id = req.body.subject_id;
    if (req.body.name) chapter.name = req.body.name;
    if (req.body.description) chapter.description = req.body.description;

    const updatedChapter = await chapter.save();
    res.json(updatedChapter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a chapter (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    await chapter.deleteOne();
    res.json({ message: 'Chapter deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 