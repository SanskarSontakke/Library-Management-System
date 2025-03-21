-- SQLite code to recreate the 'books' and 'students' tables

-- Drop the 'books' table if it exists
DROP TABLE IF EXISTS books;

-- Recreate the 'books' table with the schema including 'book_photo_path' and 'borrowed_by'
CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_name TEXT NOT NULL,
    author TEXT,
    category TEXT,
    location TEXT,
    book_number TEXT NOT NULL UNIQUE,
    is_available TEXT NOT NULL,
    borrowed_by INTEGER,  -- Foreign key to students table (optional, if you have students table)
    available_date TEXT,
    book_photo_path TEXT, -- Column to store the path to the book photo
    FOREIGN KEY (borrowed_by) REFERENCES students(id) -- Foreign key constraint (optional)
);

-- Drop the 'students' table if it exists
DROP TABLE IF EXISTS students;

-- Recreate the 'students' table with its schema
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    class TEXT,
    roll_no TEXT UNIQUE NOT NULL,
    address TEXT,
    books_borrowed TEXT -- Stores comma-separated book names borrowed by the student
);

-- Optional: You can add some initial data here for testing purposes
-- Example:
-- INSERT INTO books (book_name, book_number, is_available, author, category, location, book_photo_path) VALUES
-- ('The Great Gatsby', 'GATSBY123', 'Yes', 'F. Scott Fitzgerald', 'Classic Literature', 'Shelf A1', '/static/uploads/book-photos/gatsby.jpg'),
-- ('To Kill a Mockingbird', 'MOCKING456', 'Yes', 'Harper Lee', 'Classic Literature', 'Shelf A2', NULL),
-- ('1984', 'NINETEEN84', 'No', 'George Orwell', 'Dystopian Fiction', 'Shelf B1', '/static/uploads/book-photos/1984.jpg');

-- INSERT INTO students (name, class, roll_no, address, books_borrowed) VALUES
-- ('Alice Smith', '10th', 'RS1001', '123 Main Street', 'The Great Gatsby, 1984'),
-- ('Bob Johnson', '9th', 'RS9002', '456 Oak Avenue', 'None');

-- END OF SQL CODE TO RECREATE TABLES
