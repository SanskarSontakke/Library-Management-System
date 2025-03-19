#!/usr/bin/env python3

import sqlite3
import sys
import os

DB_PATH = '/Library-Management-Project/books-data.db'

def create_connection():
    return sqlite3.connect(DB_PATH)

def create_table():
    # Check if database file exists and delete it to recreate from scratch
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"🗑️ Old database file '{DB_PATH}' deleted.")

    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_name TEXT NOT NULL,
            author TEXT,
            category TEXT,
            location TEXT,
            book_number TEXT NOT NULL UNIQUE,
            is_available TEXT NOT NULL,
            borrowed_by INTEGER,  -- Added borrowed_by column, INTEGER type for student ID
            available_date TEXT,
            FOREIGN KEY (borrowed_by) REFERENCES students(id) -- Foreign key constraint (optional, if you have students table already)
        );
    ''')
    conn.commit()
    conn.close()
    print("✅ Books table recreated successfully (with borrowed_by column)!")

def add_book(book_name, author, category, location, book_number, is_available, available_date):
    conn = create_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO books (book_name, author, category, location, book_number, is_available, available_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (book_name, author, category, location, book_number, is_available, available_date))
        conn.commit()
        print("✅ Book added successfully!")
    except sqlite3.IntegrityError:
        print("❌ Book with this number already exists!")
    conn.close()

def update_book(book_number, book_name, author, category, location, is_available, available_date):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE books SET book_name=?, author=?, category=?, location=?, is_available=?, available_date=? WHERE book_number=?
    ''', (book_name, author, category, location, is_available, available_date, book_number))
    if cursor.rowcount == 0:
        print("❌ Book not found.")
    else:
        conn.commit()
        print("✅ Book updated successfully!")
    conn.close()

def delete_book(book_number):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM books WHERE book_number=?', (book_number,))
    if cursor.rowcount == 0:
        print("❌ Book not found.")
    else:
        conn.commit()
        print("✅ Book deleted successfully!")
    conn.close()

def list_books():
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM books')
    rows = cursor.fetchall()
    if not rows:
        print("📭 No books found.")
    else:
        print("\n📚 Book List:")
        for row in rows:
            print(f"ID: {row[0]} | Name: {row[1]} | Author: {row[2]} | Category: {row[3]} | Location: {row[4]} | Number: {row[5]} | Available: {row[6]} | Borrowed By: {row[7]} | Available Date: {row[8]}") # Added Borrowed By to list output
    conn.close()

if __name__ == '__main__':
    create_table() # This will now recreate the table with borrowed_by column

    if len(sys.argv) < 2:
        print("❌ Usage: add/update/delete/list")
        sys.exit(1)

    action = sys.argv[1].lower()

    if action == 'add':
        if len(sys.argv) != 9:
            print("❌ Usage: manage_books.py add <book_name> <author> <category> <location> <book_number> <is_available> <available_date>")
            sys.exit(1)
        _, _, book_name, author, category, location, book_number, is_available, available_date = sys.argv
        add_book(book_name, author, category, location, book_number, is_available, available_date)

    elif action == 'update':
        if len(sys.argv) != 9:
            print("❌ Usage: manage_books.py update <book_number> <book_name> <author> <category> <location> <is_available> <available_date>")
            sys.exit(1)
        _, _, book_number, book_name, author, category, location, is_available, available_date = sys.argv
        update_book(book_number, book_name, author, category, location, is_available, available_date)

    elif action == 'delete':
        if len(sys.argv) != 3:
            print("❌ Usage: manage_books.py delete <book_number>")
            sys.exit(1)
        _, _, book_number = sys.argv
        delete_book(book_number)

    elif action == 'list':
        list_books()

    else:
        print("❌ Error: Invalid action. Use 'add', 'update', 'delete', or 'list'")