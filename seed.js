const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'bookbuddy.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    reviewer_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    review_text TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id)
  )
`);

// Clear existing data
db.exec('DELETE FROM reviews');
db.exec('DELETE FROM books');

const insertBook = db.prepare(
  'INSERT INTO books (title, author, isbn, description) VALUES (?, ?, ?, ?)'
);

const insertReview = db.prepare(
  'INSERT INTO reviews (book_id, reviewer_name, rating, review_text) VALUES (?, ?, ?, ?)'
);

const seed = db.transaction(() => {
  const books = [
    {
      title: 'The Pragmatic Programmer',
      author: 'David Thomas & Andrew Hunt',
      isbn: '978-0135957059',
      description: 'A classic guide to software craftsmanship covering everything from personal responsibility to architectural techniques.',
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '978-0441013593',
      description: 'A sweeping science fiction epic set on the desert planet Arrakis, following the journey of Paul Atreides.',
    },
    {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      isbn: '978-0062316097',
      description: 'A brief history of humankind, exploring how Homo sapiens came to dominate the world.',
    },
    {
      title: 'Project Hail Mary',
      author: 'Andy Weir',
      isbn: '978-0593135204',
      description: 'A lone astronaut must save humanity from an extinction-level threat. A story of science, friendship, and survival.',
    },
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      isbn: '978-1449373320',
      description: 'The big ideas behind reliable, scalable, and maintainable data systems.',
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      description: 'A portrait of the Jazz Age and the American Dream, told through the eyes of Nick Carraway.',
    },
  ];

  const bookIds = books.map(b => insertBook.run(b.title, b.author, b.isbn, b.description).lastInsertRowid);

  const reviews = [
    { bookIdx: 0, name: 'Alice', rating: 5, text: 'Changed how I think about writing code. Every developer should read this.' },
    { bookIdx: 0, name: 'Bob', rating: 4, text: 'Great advice, though some examples feel dated. The principles are timeless.' },
    { bookIdx: 0, name: 'Carol', rating: 5, text: 'Re-read it every few years and always find something new.' },
    { bookIdx: 1, name: 'Dave', rating: 5, text: 'The worldbuilding is unmatched. A masterpiece of science fiction.' },
    { bookIdx: 1, name: 'Eve', rating: 4, text: 'Dense but rewarding. The political intrigue is fascinating.' },
    { bookIdx: 2, name: 'Frank', rating: 4, text: 'Fascinating overview. Made me think about history in a new way.' },
    { bookIdx: 2, name: 'Grace', rating: 3, text: 'Interesting but some claims feel oversimplified.' },
    { bookIdx: 3, name: 'Heidi', rating: 5, text: 'Could not put it down. The science is real and the story is gripping.' },
    { bookIdx: 3, name: 'Ivan', rating: 5, text: 'Best sci-fi I have read in years. Funny, smart, and touching.' },
    { bookIdx: 3, name: 'Judy', rating: 4, text: 'Rocky is one of the best characters in recent fiction.' },
    { bookIdx: 4, name: 'Karl', rating: 5, text: 'The definitive guide to distributed systems. Dense but essential.' },
    { bookIdx: 4, name: 'Laura', rating: 4, text: 'Wish I had this book when I started my career.' },
    { bookIdx: 5, name: 'Mike', rating: 3, text: 'Beautiful prose but the characters are hard to like.' },
  ];

  reviews.forEach(r => insertReview.run(bookIds[r.bookIdx], r.name, r.rating, r.text));

  console.log(`Seeded ${books.length} books and ${reviews.length} reviews.`);
});

seed();
db.close();
