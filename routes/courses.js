const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all courses with teacher name
router.get('/', (req, res) => {
  const sql = `
    SELECT c.*, t.name AS teacher_name
    FROM courses c
    LEFT JOIN teachers t ON c.teacher_id = t.id
    ORDER BY c.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get('/:id', (req, res) => {
  db.query('SELECT * FROM courses WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Course not found' });
    res.json(results[0]);
  });
});

router.post('/', (req, res) => {
  const { course_code, course_name, credit_hours, semester, department, teacher_id } = req.body;
  if (!course_code || !course_name) return res.status(400).json({ message: 'Course code and name are required' });
  db.query(
    'INSERT INTO courses (course_code, course_name, credit_hours, semester, department, teacher_id) VALUES (?, ?, ?, ?, ?, ?)',
    [course_code, course_name, credit_hours || 3, semester, department, teacher_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Course added successfully!', id: result.insertId });
    }
  );
});

router.put('/:id', (req, res) => {
  const { course_code, course_name, credit_hours, semester, department, teacher_id } = req.body;
  db.query(
    'UPDATE courses SET course_code=?, course_name=?, credit_hours=?, semester=?, department=?, teacher_id=? WHERE id=?',
    [course_code, course_name, credit_hours, semester, department, teacher_id || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Course updated successfully!' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM courses WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Course deleted successfully!' });
  });
});

// GET enrollments for a course
router.get('/:id/enrollments', (req, res) => {
  const sql = `
    SELECT e.*, s.name AS student_name, s.roll_no
    FROM enrollments e
    JOIN students s ON e.student_id = s.id
    WHERE e.course_id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
