const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { spawn } = require('child_process');
const multer = require('multer');

const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- Static Files ---
// **MOVE express.static SETUP INSIDE .then() block:**
import('mime')
    .then(mimeModule => {
        const mime = mimeModule.default; // Access default export of mime

        // --- express.static Middleware Setup (NOW INSIDE .then() block) ---
        app.use(express.static(path.join(__dirname, 'public'), {
            setHeaders: (res, filePath, stat) => {
                const mimeType = mime.getType(filePath);
                if (mimeType) {
                    res.setHeader('Content-Type', mimeType);
                }
            }
        }));

        // --- New: Serve book photos directory at /book-photos URL ---
        app.use('/book-photos', express.static(path.join(__dirname, 'public', 'uploads', 'book-photos'), { // New express.static middleware
            setHeaders: (res, filePath, stat) => {
                const mimeType = mime.getType(filePath);
                if (mimeType) {
                    res.setHeader('Content-Type', mimeType);
                }
            }
        }));

        // --- End of express.static setup ---

        // --- HTML Routes --- (Move HTML routes INSIDE .then() block as well, if they are placed BEFORE express.static)
        app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
        app.get('/add-book', (req, res) => res.sendFile(path.join(__dirname, 'public', 'add-book.html')));
        app.get('/books', (req, res) => res.sendFile(path.join(__dirname, 'public', 'books.html')));
        app.get('/update-book', (req, res) => res.sendFile(path.join(__dirname, 'public', 'update-book.html')));
        app.get('/delete-book', (req, res) => res.sendFile(path.join(__dirname, 'public', 'delete-book.html')));
        app.get('/borrow-book', (req, res) => res.sendFile(path.join(__dirname, 'public', 'borrow.html')));
        app.get('/return-book', (req, res) => res.sendFile(path.join(__dirname, 'public', 'return.html')));
        app.get('/students', (req, res) => res.sendFile(path.join(__dirname, 'public', 'Student.html')));
        app.get('/update-student', (req, res) => res.sendFile(path.join(__dirname, 'public', 'update-student.html')));
        app.get('/delete-student', (req, res) => res.sendFile(path.join(__dirname, 'public', 'delete-student.html')));
        app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
        // --- End of HTML Routes ---


        // --- Start the server --- (Move app.listen INSIDE .then() block as well - VERY IMPORTANT)
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
        // --- End of server startup ---


    })
    .catch(err => {
        console.error("❌ Error importing 'mime' package:", err);
    });
// --- Database Connections ---
// Connect to books database (books-data.db)
const booksDb = new sqlite3.Database(path.join(__dirname, 'books-data.db'), (err) => {
    if (err) {
        console.error('❌ Error connecting to books database:', err.message);
    } else {
        console.log('📚 Connected to books database');
        booksDb.run("PRAGMA foreign_keys = ON"); // Enable foreign key constraints
    }
});

// Connect to students database (students-data.db)
const studentsDb = new sqlite3.Database(path.join(__dirname, 'students-data.db'), (err) => {
    if (err) {
        console.error('❌ Error connecting to students database:', err.message);
    } else {
        console.log('🎓 Connected to students database');
        studentsDb.run("PRAGMA foreign_keys = ON"); // Enable foreign key constraints
    }
});

// --- File Upload Configuration (Multer) ---
// Configure storage for uploaded book photos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destPath = path.join(__dirname, 'public', 'uploads', 'book-photos');
        console.log("Multer destination path:", destPath); // Log destination path
        cb(null, destPath); // Set destination directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + ext;
        console.log("Multer generated filename:", filename); // Log generated filename
        cb(null, filename); // Set filename
    }
});

const upload = multer({ storage: storage }); // Create multer instance with configured storage

// --- Book API Endpoints ---
// API endpoint for uploading book photo (separate upload)
app.post('/api/upload-book-photo', upload.single('photo'), (req, res) => {
    console.log("➡️  /api/upload-book-photo route hit");
    if (!req.file) {
        console.log("❌  No file received in upload request");
        return res.status(400).send('No photo file uploaded.');
    }
    const bookPhotoPath = `/book-photos/${req.file.filename}`; // Correct path - no /static
    console.log("✅  File upload successful, path:", bookPhotoPath);
    res.json({ bookPhotoPath: bookPhotoPath });
}, (error, req, res, next) => {
    console.error("❌  Multer error during file upload:", error);
    res.status(500).send('Error uploading photo.');
});

// API endpoint to add a new book (with photo upload handled in form submit)
app.post('/add-book', upload.single('photo'), (req, res) => {
    const { name, author, category, location, number, availability, date } = req.body;
    const bookPhotoPath = req.file ? `/book-photos/${req.file.filename}` : null; // Correct path - no /static

    const query = `INSERT INTO books (book_name, book_number, is_available, available_date, author, category, location, book_photo_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    booksDb.run(query, [name, number, availability, date, author, category, location, bookPhotoPath], function (err) {
        if (err) {
            console.error('❌ Error adding book:', err.message);
            if (err.errno === 19 && err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).send('Error: Book number already exists.');
            } else {
                return res.status(500).send('Error adding book.');
            }
        }
        res.send('✅ Book added successfully!');
    });
});

// API endpoint to list all books
app.get('/api/list-books', (req, res) => {
    const query = `SELECT * FROM books`; // Simple SELECT * query
    booksDb.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching books:', err.message);
            return res.status(500).json({ error: 'Error fetching books.' });
        }
        res.json(rows); // Send book data as JSON response
    });
});

// API endpoint to delete a book
app.delete('/api/delete-book/:bookNumber', (req, res) => {
    const bookNumber = req.params.bookNumber;

    if (!bookNumber) {
        return res.status(400).send('Book Number required.');
    }
    booksDb.get("SELECT id FROM books WHERE book_number = ?", [bookNumber], (err, book) => {
        if (err) {
            console.error('❌ DB error checking book:', err.message);
            return res.status(500).send('DB error checking book.');
        }
        if (!book) {
            return res.status(404).send(`Error: Book #"${bookNumber}" not found.`);
        }
        const query = `DELETE FROM books WHERE book_number = ?`;
        booksDb.run(query, [bookNumber], function (dbErr) {
            if (dbErr) {
                console.error('❌ Error deleting book:', dbErr.message);
                return res.status(500).send('Error deleting book.');
            }

            if (this.changes > 0) {
                console.log(`✅ Book #${bookNumber} deleted.`);
                res.send(`✅ Book #${bookNumber} deleted!`);
            } else {
                console.log(`📚 Book #${bookNumber} not found (deletion fail).`);
                res.status(404).send('Book not found.');
            }
        });
    });
});

// API endpoint to search books
app.get('/api/search-books', (req, res) => {
    const searchQuery = req.query.query;

    if (!searchQuery) {
        return listBooks(req, res);
    }

    const escapeSearchTerm = (term) => {
        return term.replace(/[%_]/g, '\\$&');
    };

    const searchTerm = `%${escapeSearchTerm(searchQuery)}%`;

    const query = `
        SELECT * FROM books
        WHERE book_name LIKE ? OR author LIKE ? OR category LIKE ? OR location LIKE ?
    `;

    booksDb.all(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
        if (err) {
            console.error('❌ API search-books Error:', err.message);
            return res.status(500).json({ error: 'Error searching books.' });
        }
        res.json(rows);
    });
});

// API endpoint to update book information
app.post('/api/update-book', (req, res) => {
    const bookNumberToUpdate = req.body.bookNumberToUpdate;
    const updatedBookData = {};

    if (req.body.name) updatedBookData.book_name = req.body.name;
    if (req.body.author) updatedBookData.author = req.body.author;
    if (req.body.category) updatedBookData.category = req.body.category;
    if (req.body.location) updatedBookData.location = req.body.location;
    if (req.body.availability) updatedBookData.is_available = req.body.availability;
    if (req.body.available_date) updatedBookData.available_date = req.body.available_date;

    let updateQuery = 'UPDATE books SET ';
    const updateValues = [];
    for (const key in updatedBookData) {
        updateQuery += `${key} = ?, `;
        updateValues.push(updatedBookData[key]);
    }

    updateQuery = updateQuery.slice(0, -2) + ' WHERE book_number = ?';
    updateValues.push(bookNumberToUpdate);

    booksDb.run(updateQuery, updateValues, function (err) {
        if (err) {
            console.error('❌ API update-book Error:', err.message);
            return res.status(500).send('Error updating book.');
        }
        if (this.changes > 0) {
            res.send('✅ Book updated!');
        } else {
            res.status(404).send('Book not found.');
        }
    });
});

// New API endpoint to get book details by book number
app.get('/api/book-details/:bookNumber', (req, res) => {
    const bookNumber = req.params.bookNumber;
    const query = `SELECT * FROM books WHERE book_number = ?`;

    booksDb.get(query, [bookNumber], (err, row) => {
        if (err) {
            console.error('❌ Error fetching book details:', err.message);
            return res.status(500).json({ error: 'Error fetching book details.' });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'Book details not found.' });
        }
    });
});

// --- Student API Routes ---
// Add a new student
app.post('/add-student', (req, res) => {
    const { name, className, roll, address, books } = req.body;
    const query = `INSERT INTO students (name, class, roll_no, address, books_borrowed) VALUES (?, ?, ?, ?, ?)`;
    studentsDb.run(query, [name, className, roll, address, books], function (err) {
        if (err) {
            console.error('❌ Error adding student:', err.message);
            return res.status(500).send('Error adding student.');
        }
        res.send('✅ Student added successfully!');
    });
});

// List all students (API endpoint for fetching student data)
app.get('/api/list-students', (req, res) => {
    const query = `SELECT * FROM students`;
    studentsDb.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching students:', err.message);
            return res.status(500).json({ error: 'Error fetching students.' });
        }
        res.json(rows);
    });
});

// --- UPDATED: Delete Student API Endpoint (Now uses Roll Number) with Improved Error Handling ---
app.delete('/api/delete-student/:studentRollNo', (req, res) => {
    const studentRollNo = req.params.studentRollNo;

    if (!studentRollNo) {
        return res.status(400).send('Student Roll Number required.');
    }

    studentsDb.get("SELECT id FROM students WHERE roll_no = ?", [studentRollNo], (err, student) => {
        if (err) {
            console.error('❌ DB error checking student:', err.message);
            return res.status(500).send('DB error checking student.');
        }

        if (!student) {
            return res.status(404).send(`Error: Student with Roll Number "${studentRollNo}" not found.`);
        }

        const query = `DELETE FROM students WHERE roll_no = ?`;

        studentsDb.run(query, [studentRollNo], function (dbErr) {
            if (dbErr) {
                console.error('❌ Error deleting student:', dbErr.message);
                return res.status(500).send('Error deleting student.');
            }

            if (this.changes > 0) {
                console.log(`✅ Student with Roll No ${studentRollNo} deleted.`);
                res.send(`✅ Student with Roll No ${studentRollNo} deleted successfully!`);
            } else {
                console.log(`📚 Student with Roll No ${studentRollNo} not found (deletion failed - unexpected).`);
                res.status(404).send('Student not found.');
            }
        });
    });
});

// --- NEW: Update Student API Endpoint ---
app.post('/api/update-student', (req, res) => {
    const studentRollToUpdate = req.body.studentRollToUpdate;
    const updatedStudentData = {};

    if (!studentRollToUpdate) {
        return res.status(400).send('Student Roll Number to Update required.');
    }

    if (req.body.name) updatedStudentData.name = req.body.name;
    if (req.body.className) updatedStudentData.class = req.body.className;
    if (req.body.roll) updatedStudentData.roll_no = req.body.roll;
    if (req.body.address) updatedStudentData.address = req.body.address;
    if (req.body.books) updatedStudentData.books_borrowed = req.body.books;


    studentsDb.get("SELECT id FROM students WHERE roll_no = ?", [studentRollToUpdate], (err, student) => {
        if (err) {
            console.error('❌ DB error checking student for update:', err.message);
            return res.status(500).send('DB error checking student for update.');
        }

        if (!student) {
            return res.status(404).send(`Error: Student with Roll Number "${studentRollToUpdate}" not found for update.`);
        }

        let updateQuery = 'UPDATE students SET ';
        const updateValues = [];
        let setClauses = [];

        for (const key in updatedStudentData) {
            setClauses.push(`${key} = ?`);
            updateValues.push(updatedStudentData[key]);
        }

        updateQuery += setClauses.join(', ');
        updateQuery += ' WHERE roll_no = ?';
        updateValues.push(studentRollToUpdate);

        studentsDb.run(updateQuery, updateValues, function (dbErr) {
            if (dbErr) {
                console.error('❌ Error updating student:', dbErr.message);
                return res.status(500).send('Error updating student.');
            }

            if (this.changes > 0) {
                console.log(`✅ Student with Roll No ${studentRollToUpdate} updated successfully.`);
                res.send(`✅ Student with Roll No ${studentRollToUpdate} updated successfully!`);
            } else {
                console.log(`📚 Student with Roll No ${studentRollToUpdate} found, but no updates applied.`);
                res.status(200).send(`No updates applied for student with Roll No ${studentRollToUpdate}.`);
            }
        });
    });
});

app.get('/api/student-borrowed-books/:studentRollNo', (req, res) => {  // New route
    const studentRollNo = req.params.studentRollNo;

    studentsDb.get("SELECT books_borrowed FROM students WHERE roll_no = ?", [studentRollNo], (err, student) => {
        if (err) {
            console.error('❌ API student-borrowed-books Error:', err.message);
            return res.status(500).json({ error: 'DB error fetching student borrowed books.' });
        }
        if (!student) {
            return res.status(404).send('Student not found.');
        }
        res.json({ booksBorrowed: student.books_borrowed }); // Send back books_borrowed in JSON
    });
});

// --- Book Borrowing API Endpoints ---
// Scan QR code (using QR-Reader.py Python script)
app.get('/scan-qr-code', (req, res) => {
    const pythonScriptPath = path.join(__dirname, 'QR-Reader.py');
    const pythonProcess = spawn('python3', [pythonScriptPath]);
    let bookNumber = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => { bookNumber += data.toString().trim(); });
    pythonProcess.stderr.on('data', (data) => { error += data.toString(); });

    pythonProcess.on('close', (code) => {
        if (code === 0) res.json({ bookNumber: bookNumber });
        else {
            console.error('❌ QR-Reader.py failed', error);
            res.status(500).json({ error: 'QR code scan failed', details: error });
        }
    });
});

app.post('/borrow-book-process', (req, res) => {
    const { bookNumber, studentRollNo, returnDate } = req.body;

    if (!bookNumber || !studentRollNo || !returnDate) {
        return res.status(400).send('Book number, Student Roll Number, and Return Date required.');
    }

    let studentId;

    // 1. Check if the student exists and get their ID and current books_borrowed list
    studentsDb.get("SELECT id, books_borrowed FROM students WHERE roll_no = ?", [studentRollNo], (err, student) => {
        if (err) {
            console.error('❌ API borrow-book-process (student check) DB Error:', err.message);
            return res.status(500).send('Error checking student.');
        }
        if (!student) {
            return res.status(404).send('Student Roll Number not found.');
        }

        studentId = student.id;
        const currentBorrowedBooks = student.books_borrowed || '';

        // 2. Get the book name and check if book exists and is available
        booksDb.get("SELECT book_name, is_available FROM books WHERE book_number = ?", [bookNumber], (bookErr, bookInfo) => { // Fetch is_available
            if (bookErr) {
                console.error('❌ API borrow-book-process (book check) DB Error:', bookErr.message);
                return res.status(500).send('Database error fetching book info.');
            }
            if (!bookInfo) {
                return res.status(404).send('Book Number not found.');
            }
            if (bookInfo.is_available !== 'Yes') { // Check availability
                return res.status(400).send('Book is not available to borrow.'); // Indicate book is not available
            }


            const bookName = bookInfo.book_name;
            let updatedBorrowedBooks;

            if (!currentBorrowedBooks || currentBorrowedBooks.toLowerCase() === 'none' || currentBorrowedBooks.trim() === '') {
                updatedBorrowedBooks = bookName;
            } else {
                updatedBorrowedBooks = currentBorrowedBooks + ', ' + bookName;
            }

            // 3. Update both tables: books (mark as borrowed) and students (update books_borrowed list)
            const borrowBookQuery = `UPDATE books SET is_available = 'No', borrowed_by = ?, available_date = ? WHERE book_number = ?`; // Removed AND is_available = 'Yes' condition
            const updateStudentQuery = `UPDATE students SET books_borrowed = ? WHERE id = ?`;

            booksDb.run(borrowBookQuery, [studentId, returnDate, bookNumber], function (borrowErr) {
                if (borrowErr) {
                    console.error('❌ API borrow-book-process (borrowBookQuery) DB Error:', borrowErr.message); // More specific error logging
                    return res.status(500).send('Error borrowing book.');
                }

                if (this.changes > 0) {
                    // Book borrowed successfully, now update student's books_borrowed list
                    studentsDb.run(updateStudentQuery, [updatedBorrowedBooks, studentId], function (updateStudentErr) {
                        if (updateStudentErr) {
                            console.error('❌ API borrow-book-process (updateStudentQuery) DB Error:', updateStudentErr.message); // More specific error logging
                            return res.status(500).send('Error updating student info.');
                        }

                        console.log(`✅ Book number ${bookNumber} borrowed by Student Roll No ${studentRollNo}.`);
                        res.send('✅ Book borrowed successfully!');
                    });


                } else {
                    console.log(`📚 Book number ${bookNumber} not found or already borrowed.`);
                    res.status(404).send('Book not found or already borrowed.');
                }
            });
        });
    });
});

// --- Book Returning API Endpoints --

// Process book return
app.post('/return-book-process', (req, res) => {
    const bookNumber = req.body.bookNumber;

    if (!bookNumber) {
        return res.status(400).send('Book number is required to return a book.');
    }

    let studentId;
    let bookName;
    let currentBorrowedBooks;

    // 1. Get book and student info before return
    booksDb.get("SELECT borrowed_by, book_name FROM books WHERE book_number = ?", [bookNumber], (bookInfoErr, bookInfo) => {
        if (bookInfoErr) {
            console.error('❌ Database error fetching book info:', bookInfoErr.message);
            return res.status(500).send('Database error fetching book information.');
        }
        if (!bookInfo) {
            return res.status(404).send('Book not found as borrowed.');
        }

        studentId = bookInfo.borrowed_by;
        bookName = bookInfo.book_name;

        // 2. Get current borrowed books list from students table
        studentsDb.get("SELECT books_borrowed FROM students WHERE id = ?", [studentId], (studentErr, studentRecord) => {
            if (studentErr) {
                console.error('❌ Database error fetching student record:', studentErr.message);
                return res.status(500).send('Database error fetching student record.');
            }

            if (!studentRecord) {
                return res.status(404).send('Student record not found for borrowed book.');
            }

            currentBorrowedBooks = studentRecord.books_borrowed || '';
            let updatedBorrowedBooks = '';

            if (currentBorrowedBooks && currentBorrowedBooks.toLowerCase() !== 'none' && currentBorrowedBooks.trim() !== '') {
                let borrowedBookList = currentBorrowedBooks.split(',').map(item => item.trim());
                borrowedBookList = borrowedBookList.filter(name => name.trim() !== bookName.trim());
                updatedBorrowedBooks = borrowedBookList.join(', ');
                if (updatedBorrowedBooks.trim() === '') {
                    updatedBorrowedBooks = 'None';
                }
            } else {
                updatedBorrowedBooks = 'None';
            }

            // 3. Update both tables: books (mark as available) and students (update books_borrowed list)
            const returnBookQuery = `UPDATE books SET is_available = 'Yes', borrowed_by = NULL, available_date = 'N/A' WHERE book_number = ? AND is_available = 'No'`;
            const updateStudentQuery = `UPDATE students SET books_borrowed = ? WHERE id = ?`;

            booksDb.run(returnBookQuery, [bookNumber], function (returnErr) {
                if (returnErr) {
                    console.error('❌ Error returning book:', returnErr.message);
                    return res.status(500).send('Error returning book.');
                }

                if (this.changes > 0) {
                    // Book returned successfully in books table, now update student's record
                    studentsDb.run(updateStudentQuery, [updatedBorrowedBooks, studentId], function (updateStudentErr) {
                        if (updateStudentErr) {
                            console.error('❌ Error updating student borrowed books on return:', updateStudentErr.message);
                            return res.status(500).send('Error updating student information on book return.');
                        }

                        console.log(`✅ Book number ${bookNumber} returned successfully. Available Date set to N/A. Student's book list updated.`);
                        res.send('✅ Book returned successfully!');
                    });


                } else {
                    console.log(`📚 Book with number ${bookNumber} not found as borrowed or already returned.`);
                    res.status(404).send('Book not found as borrowed or already returned.');
                }
            });
        });
    });
});