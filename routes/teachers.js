const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM teachers ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get('/:id', (req, res) => {
  db.query('SELECT * FROM teachers WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Teacher not found' });
    res.json(results[0]);
  });
});

router.post('/', (req, res) => {
  const { name, employee_id, department, designation, email, phone } = req.body;
  if (!name || !employee_id) return res.status(400).json({ message: 'Name and Employee ID are required' });
  db.query(
    'INSERT INTO teachers (name, employee_id, department, designation, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
    [name, employee_id, department, designation, email, phone],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Teacher added successfully!', id: result.insertId });
    }
  );
});

router.put('/:id', (req, res) => {
  const { name, employee_id, department, designation, email, phone } = req.body;
  db.query(
    'UPDATE teachers SET name=?, employee_id=?, department=?, designation=?, email=?, phone=? WHERE id=?',
    [name, employee_id, department, designation, email, phone, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Teacher updated successfully!' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM teachers WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Teacher deleted successfully!' });
  });
});

module.exports = router;
