const express = require('express');
const router = express.Router();

// Add review — has try/catch (inconsistent with book routes)
router.post('/', (req, res) => {
  try {
    const book_id = req.body.book_id;
    const reviewer_name = req.body.reviewer_name;
    const rating = parseInt(req.body.rating);
    const review_text = req.body.review_text;

    if (!reviewer_name || reviewer_name.trim() === '') {
      return res.status(400).send('Name is required');
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).send('Rating must be between 1 and 5');
    }

    req.app.locals.db.prepare(
      'INSERT INTO reviews (book_id, reviewer_name, rating, review_text) VALUES (?, ?, ?, ?)'
    ).run(book_id, reviewer_name.trim(), rating, review_text?.trim() || null);

    res.redirect(`/books/${book_id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add review');
  }
});

// Delete review — no try/catch
router.post('/:id/delete', (req, res) => {
  const review = req.app.locals.db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  req.app.locals.db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.redirect(`/books/${review.book_id}`);
});

module.exports = router;
