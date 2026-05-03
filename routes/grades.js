const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all grades with student and course info
router.get('/', (req, res) => {
  const sql = `
    SELECT g.*, s.name AS student_name, s.roll_no, c.course_name, c.course_code
    FROM grades g
    JOIN students s ON g.student_id = s.id
    JOIN courses c ON g.course_id = c.id
    ORDER BY g.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET single grade record
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM grades WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Grade not found' });
    res.json(results[0]);
  });
});

// POST - add grades
router.post('/', (req, res) => {
  const { student_id, course_id, mid_term, final_term, assignments } = req.body;
  if (!student_id || !course_id) return res.status(400).json({ message: 'Student and course are required' });

  const mid   = parseFloat(mid_term)   || 0;
  const final = parseFloat(final_term) || 0;
  const asgn  = parseFloat(assignments)|| 0;
  const total = (mid * 0.3) + (final * 0.5) + (asgn * 0.2);

  let grade = 'F';
  if (total >= 85) grade = 'A+';
  else if (total >= 80) grade = 'A';
  else if (total >= 75) grade = 'B+';
  else if (total >= 70) grade = 'B';
  else if (total >= 65) grade = 'C+';
  else if (total >= 60) grade = 'C';
  else if (total >= 50) grade = 'D';

  db.query(
    'INSERT INTO grades (student_id, course_id, mid_term, final_term, assignments, total, grade) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [student_id, course_id, mid, final, asgn, total.toFixed(2), grade],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Grades saved successfully!', id: result.insertId, total: total.toFixed(2), grade });
    }
  );
});

// PUT - update grades
router.put('/:id', (req, res) => {
  const { mid_term, final_term, assignments } = req.body;
  const mid   = parseFloat(mid_term)   || 0;
  const final = parseFloat(final_term) || 0;
  const asgn  = parseFloat(assignments)|| 0;
  const total = (mid * 0.3) + (final * 0.5) + (asgn * 0.2);

  let grade = 'F';
  if (total >= 85) grade = 'A+';
  else if (total >= 80) grade = 'A';
  else if (total >= 75) grade = 'B+';
  else if (total >= 70) grade = 'B';
  else if (total >= 65) grade = 'C+';
  else if (total >= 60) grade = 'C';
  else if (total >= 50) grade = 'D';

  db.query(
    'UPDATE grades SET mid_term=?, final_term=?, assignments=?, total=?, grade=? WHERE id=?',
    [mid, final, asgn, total.toFixed(2), grade, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Grades updated successfully!', total: total.toFixed(2), grade });
    }
  );
});

// DELETE grade
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM grades WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Grade deleted successfully!' });
  });
});

module.exports = router;
