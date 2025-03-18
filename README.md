# Library Management System

A simple and responsive web-based Library Management System designed to help manage books and students efficiently. This project provides functionalities for adding, updating, deleting, listing books and students, along with features for borrowing and returning books using manual input and QR code scanning.

## Features

*   **Book Management:**
    *   Add new books with details like name, author, category, location, book number, availability, and available date.
    *   View a list of all books with search functionality.
    *   Update book information.
    *   Delete books from the system.
*   **Student Management:**
    *   Add new student records including name, class, roll number, address, and borrowed books.
    *   View a list of all students with search functionality.
    *   Update student information.
    *   Delete student records.
*   **Borrow and Return Books:**
    *   Borrow books by entering student roll number, book number, and return date, or by scanning QR codes for book numbers.
    *   Return borrowed books by entering or scanning the book number.
    *   Displays currently borrowed books for a student.
*   **QR Code Scanning:**
    *   Integrated QR code scanning functionality (using a USB camera and Python script) to quickly input book numbers for borrowing and returning.
*   **Contact Page:**
    *   A simple contact page with library details and a contact form.
*   **Responsive Design:**
    *   Built with Bootstrap for a responsive layout that works well on various screen sizes.

## Tech Stack

*   **Frontend:**
    *   HTML5
    *   CSS3 (Custom styles and Bootstrap)
    *   Bootstrap 5 (for responsive design and components)
    *   JavaScript (Vanilla JS and jQuery)
    *   jQuery (for AJAX and DOM manipulation)
*   **Backend:**
    *   Node.js with Express.js
*   **Database:**
    *   SQLite3 (for book and student data)
*   **QR Code Scanning:**
    *   Python 3
    *   OpenCV (`opencv-python`)
    *   pyzbar
    *   (Optional) RPi.GPIO (for buzzer feedback on Raspberry Pi)

## Getting Started

Follow these steps to set up and run the Library Management System on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js** (version 16 or higher recommended) and **npm** (Node Package Manager) - [Download Node.js](https://nodejs.org/)
*   **Python 3** and **pip** (Python package installer) - [Download Python](https://www.python.org/downloads/)
*   **SQLite3** (Usually comes pre-installed on Linux and macOS. For Windows, you might need to install it or use a SQLite browser like [DB Browser for SQLite](https://sqlitebrowser.org/))
*   **USB Camera** (for QR code scanning functionality) - Optional, but needed for QR scanning feature.
*   **Raspberry Pi** (Optional) - If you want to use the buzzer for QR scan feedback and fan control, a Raspberry Pi is needed

### Installation

1.  **Clone the repository:**

    ```bash
    git clone [repository URL]
    cd [repository-folder-name]
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd Library-Management-Project
    ```

3.  **Install Node.js dependencies:**

    ```bash
    npm install
    ```

4.  **Install Python dependencies (for QR code scanning):**

    ```bash
    pip install opencv-python pyzbar
    # If using Raspberry Pi and buzzer, install RPi.GPIO (ensure Raspberry Pi OS)
    # sudo apt-get install python3-rpi.gpio  (for Debian-based systems)
    ```

5.  **Initialize SQLite databases:**
    *   The project uses two SQLite databases: `books-data.db` and `students-data.db`.
    *   You can use the provided Python scripts to create and manage the tables:
        ```bash
        python3 scripts/manage_books.py create_table
        python3 scripts/manage_students.py create_table # You might need to create students table manually as script is for data management
        ```
    *   Alternatively, you can use a SQLite browser to create the databases and tables manually. The table schemas are defined in `manage_books.py` and `manage_students.py` for reference.

### Running the Application

1.  **Start the Node.js server:**

    ```bash
    node server.js
    # Or using nodemon for development (if you have nodemon installed globally or locally as dev dependency)
    # nodemon server.js
    ```

2.  **Access the Library Management System in your web browser:**

    Open your browser and go to `http://localhost:3000` OR 'http://<Your-Raspberry-Pi-IP>:3000'

## Usage

*   **Navigation:** Use the navigation bar at the top to access different sections: Students, Books, Borrow Books, Return Books, and Contact.
*   **Book and Student Management:** Use the forms on the Books and Students pages to add, update, and delete records. The lists of books and students are dynamically loaded on their respective pages.
*   **Borrowing Books:**
    *   Go to the "Borrow Books" page.
    *   Enter the student's roll number to see currently borrowed books (if any).
    *   Enter the book number manually or click "Scan QR/Barcode" to use the QR code scanner.
    *   Select the return date using the date picker.
    *   Click "Confirm Borrow" to borrow the book.
*   **Returning Books:**
    *   Go to the "Return Books" page.
    *   Enter the book number manually or click "Scan QR Code" to use the QR code scanner.
    *   Click "Return Book" to process the return.
*   **QR Code Scanning:**
    *   On the "Borrow Books" and "Return Books" pages, click the "Scan QR Code" or "Scan QR/Barcode" button.
    *   A Python script will run in the background, using your default camera to scan for QR codes.
    *   Point your camera at a QR code that contains the book number.
    *   Once a QR code is successfully scanned, the book number field will be automatically filled.

## Hardware Setup (Optional - for QR Buzzer Feedback and Fan Control on Raspberry Pi)

If you are using a Raspberry Pi and want to enable the buzzer feedback for QR code scans and the automated fan control, follow these steps:

### Buzzer for QR Scan Feedback (Optional)

1.  **Connect Buzzer:** Connect a buzzer to your Raspberry Pi.  For example, connect the positive pin of the buzzer to GPIO 3 (BCM mode, Pin 5 on the header) through a resistor (e.g., 220Ω) and the negative pin to GND (Ground).
2.  **RPi.GPIO Library:** Ensure `RPi.GPIO` is installed (`sudo apt-get install python3-rpi.gpio`).
3.  **Buzzer Code:** The `QR-Reader.py` script includes code to activate the buzzer when a QR code scan starts and when a code is successfully decoded. Ensure `HAS_GPIO = True` in the script.

### Automated Fan Control (Optional)

1.  **Connect Relay and Fan:** Connect a 5V cooling fan to your Raspberry Pi via a relay module. Connect the relay's control pin to GPIO 2 (BCM mode, Pin 3 on the header).  Ensure your fan and relay are compatible with 5V and the Raspberry Pi's GPIO.
2.  **Fan Control Script:** The `Fan-Control.py` script monitors the CPU temperature and turns the fan on/off based on the defined temperature threshold ( `TEMP_THRESHOLD = 45` °C by default).
3.  **Run Fan Script:**  Run the `Fan-Control.py` script in the background:
    ```bash
    python3 Fan-Control.py
    ```
    You might want to run this script at system startup for continuous fan control.

**Disclaimer:** Hardware setup involves electronics and GPIO connections. Ensure you have basic electronics knowledge and follow safety precautions. Incorrect wiring can damage your Raspberry Pi and components.

## Customization

*   **Frontend Styling:** Modify `public/static/styles.css` to change the visual appearance of the application. Bootstrap classes are used extensively, so you can leverage Bootstrap's theming and customization options.
*   **Functionality:**  You can extend the features by modifying the JavaScript in the HTML files (within `<script>` tags or in separate `.js` files in `public/static/js/`) and the backend logic in `server.js`.
*   **Database:** The SQLite database structure can be modified in `manage_books.py` and `manage_students.py` if you need to add more fields or relationships. Remember to update the backend and frontend code accordingly.

## Contributing

Contributions are welcome! If you have suggestions for improvements or bug fixes, please feel free to fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

[Sanskar Sontakke] - [sanskarsontakke@gmail.com] - [+91 8208435506]