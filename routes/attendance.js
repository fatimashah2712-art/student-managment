const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all attendance with student and course names
router.get('/', (req, res) => {
  const sql = `
    SELECT a.*, s.name AS student_name, s.roll_no, c.course_name, c.course_code
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN courses c ON a.course_id = c.id
    ORDER BY a.date DESC, a.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST - mark attendance
router.post('/', (req, res) => {
  const { student_id, course_id, date, status } = req.body;
  if (!student_id || !course_id || !date) return res.status(400).json({ message: 'Student, course and date are required' });
  db.query(
    'INSERT INTO attendance (student_id, course_id, date, status) VALUES (?, ?, ?, ?)',
    [student_id, course_id, date, status || 'Present'],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Attendance marked successfully!', id: result.insertId });
    }
  );
});

// PUT - update attendance
router.put('/:id', (req, res) => {
  const { status } = req.body;
  db.query('UPDATE attendance SET status=? WHERE id=?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Attendance updated successfully!' });
  });
});

// DELETE attendance
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM attendance WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Attendance deleted successfully!' });
  });
});

// GET summary for a student
router.get('/student/:id', (req, res) => {
  const sql = `
    SELECT a.status, COUNT(*) as count, c.course_name
    FROM attendance a
    JOIN courses c ON a.course_id = c.id
    WHERE a.student_id = ?
    GROUP BY a.course_id, a.status
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
