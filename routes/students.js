const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all students
router.get('/', (req, res) => {
  db.query('SELECT * FROM students ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET single student by ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM students WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Student not found' });
    res.json(results[0]);
  });
});

// POST - add new student
router.post('/', (req, res) => {
  const { name, roll_no, department, semester, email } = req.body;
  if (!name || !roll_no) {
    return res.status(400).json({ message: 'Name and Roll No are required' });
  }
  db.query(
    'INSERT INTO students (name, roll_no, department, semester, email) VALUES (?, ?, ?, ?, ?)',
    [name, roll_no, department, semester, email],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Student added successfully!', id: result.insertId });
    }
  );
});

// PUT - update student
router.put('/:id', (req, res) => {
  const { name, roll_no, department, semester, email } = req.body;
  db.query(
    'UPDATE students SET name=?, roll_no=?, department=?, semester=?, email=? WHERE id=?',
    [name, roll_no, department, semester, email, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Student updated successfully!' });
    }
  );
});

// DELETE - remove student
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM students WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Student deleted successfully!' });
  });
});

module.exports = router;
