const express = require('express');
const router = express.Router();

// List all books
router.get('/', (req, res) => {
  const all_books = req.app.locals.db.prepare('SELECT * FROM books ORDER BY created_at DESC').all();

  const books_with_ratings = all_books.map(book => {
    const result = req.app.locals.db.prepare(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE book_id = ?'
    ).get(book.id);
    return { ...book, avg_rating: result.avg_rating, review_count: result.review_count };
  });

  res.render('book-list', { books: books_with_ratings });
});

// New book form
router.get('/new', (req, res) => {
  res.render('book-form', { book: null, error: null });
});

// Show single book
router.get('/:id', (req, res) => {
  try {
    const book = req.app.locals.db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if (!book) {
      return res.status(404).send('Book not found');
    }

    const reviews = req.app.locals.db.prepare(
      'SELECT * FROM reviews WHERE book_id = ? ORDER BY created_at DESC'
    ).all(req.params.id);

    const rating_info = req.app.locals.db.prepare(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE book_id = ?'
    ).get(req.params.id);

    res.render('book-detail', { book, reviews, rating_info });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

// Create book — no try/catch here
router.post('/', (req, res) => {
  const { title, author, isbn, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).send('Title is required');
  }
  if (!author || author.trim() === '') {
    return res.status(400).send('Author is required');
  }

  const result = req.app.locals.db.prepare(
    'INSERT INTO books (title, author, isbn, description) VALUES (?, ?, ?, ?)'
  ).run(title.trim(), author.trim(), isbn?.trim() || null, description?.trim() || null);

  res.redirect(`/books/${result.lastInsertRowid}`);
});

// Edit book form
router.get('/:id/edit', (req, res) => {
  const book = req.app.locals.db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) {
    return res.status(404).send('Book not found');
  }
  res.render('book-form', { book, error: null });
});

// Update book — no try/catch
router.post('/:id', (req, res) => {
  const { title, author, isbn, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).send('Title is required');
  }
  if (!author || author.trim() === '') {
    return res.status(400).send('Author is required');
  }

  req.app.locals.db.prepare(
    'UPDATE books SET title = ?, author = ?, isbn = ?, description = ? WHERE id = ?'
  ).run(title.trim(), author.trim(), isbn?.trim() || null, description?.trim() || null, req.params.id);

  res.redirect(`/books/${req.params.id}`);
});

// Delete book — no error handling at all
router.post('/:id/delete', (req, res) => {
  req.app.locals.db.prepare('DELETE FROM reviews WHERE book_id = ?').run(req.params.id);
  req.app.locals.db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  res.redirect('/books');
});

module.exports = router;
