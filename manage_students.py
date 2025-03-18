#!/usr/bin/env python3
import sqlite3
import sys

db_path = '/Library-Management-Project/students-data.db'

def add_student(name, student_class, roll_no, address, books_borrowed):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO students (name, class, roll_no, address, books_borrowed)
        VALUES (?, ?, ?, ?, ?)
    ''', (name, student_class, roll_no, address, books_borrowed))
    conn.commit()
    conn.close()
    print("✅ Student added successfully!")

def update_student(student_id, name, student_class, roll_no, address, books_borrowed):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE students
        SET name = ?, class = ?, roll_no = ?, address = ?, books_borrowed = ?
        WHERE id = ?
    ''', (name, student_class, roll_no, address, books_borrowed, student_id))
    conn.commit()
    conn.close()
    print("✅ Student updated successfully!")

def list_students():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM students')
    students = cursor.fetchall()
    if students:
        print("\n📋 Students List:")
        for student in students:
            print(f"ID: {student[0]}, Name: {student[1]}, Class: {student[2]}, Roll No: {student[3]}, Address: {student[4]}, Books Borrowed: {student[5]}")
    else:
        print("📂 No students found.")
    conn.close()

def delete_student(student_id):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM students WHERE id = ?', (student_id,))
    conn.commit()
    conn.close()
    print(f"🗑️ Student with ID {student_id} deleted successfully!")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("❌ Error: No action provided. Use 'add', 'update', 'list', or 'delete'")
        sys.exit(1)

    action = sys.argv[1]

    if action == 'add' and len(sys.argv) == 7:
        _, _, name, student_class, roll_no, address, books_borrowed = sys.argv
        add_student(name, student_class, roll_no, address, books_borrowed)

    elif action == 'update' and len(sys.argv) == 8:
        _, _, student_id, name, student_class, roll_no, address, books_borrowed = sys.argv
        update_student(student_id, name, student_class, roll_no, address, books_borrowed)

    elif action == 'list':
        list_students()

    elif action == 'delete' and len(sys.argv) == 3:
        _, _, student_id = sys.argv
        delete_student(student_id)

    else:
        print("❌ Error: Invalid action or incorrect number of arguments.")
        print("Usage examples:")
        print("  ➕ Add:    python3 manage_students.py add 'John Doe' '10-A' 45 'City Street' 'Science Book'")
        print("  ✏️ Update: python3 manage_students.py update 1 'John Doe' '10-A' 45 'New Address' 'None'")
        print("  📋 List:   python3 manage_students.py list")
        print("  🗑️ Delete: python3 manage_students.py delete 1")
