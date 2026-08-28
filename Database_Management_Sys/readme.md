# 🎓 Student Database Management System (DBMS)

A sleek, modern, single-page web application for managing student records. Built with a **Flask API backend** and a **responsive glassmorphic frontend interface** featuring a live video background. The application interfaces with a **MySQL database** to perform full CRUD (Create, Read, Update, Delete) operations with custom roll-number auto-generation and real-time toast notifications.

---

## ✨ Features

- **Full CRUD Support**: Create, Read, Update, and Delete student records directly from a unified interface.
- **Glassmorphic UI**: Transparent, frosted-glass panels layered over a live ambient background video (`back_vid.mp4`).
- **Dynamic Dialogs**: Utilizes native HTML5 `<dialog>` elements for overlay forms with context-aware field validation.
- **Auto-Generating Roll Numbers**: Smart alphanumeric increments (e.g., `26001` onwards) computed on the server side if left blank.
- **Custom Toast Notification System**: Animated, non-obtrusive banners at the bottom of the screen displaying real-time feedback (success, info, errors).
- **Responsive Table Layout**: Data is formatted and displayed in real-time, matching database table entries automatically.

---

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic tags (`<main>`, `<section>`, `<dialog>`, `<table>`) for layout structure.
- **CSS3 (Vanilla)**: Features custom CSS variables, flexbox/grid layout systems, hover micro-animations, glassmorphism filters (`backdrop-filter`), and background video styling.
- **JavaScript (ES6+)**: Custom asynchronous AJAX requests (`fetch`), dynamic DOM updates, dialog controller logic, and custom notification systems.

### Backend
- **Python 3**: Core application logic.
- **Flask**: Micro web framework routing incoming requests and serving static assets and RESTful API endpoints.
- **mysql-connector-python**: Official driver to connect Python with the MySQL database.

### Database
- **MySQL**: Relational database storage holding student records.

---

## 📋 Prerequisites

Before running the application, make sure you have the following installed:
1. **Python 3.x**
2. **MySQL Server** (Local or Remote instance)
3. **Pip** (Python package installer)
4. A modern web browser (Chrome, Firefox, Edge, Safari, etc.)

---

## 🚀 Setup & Installation

Follow these steps to get the project running locally:

### Step 1: Clone or Download the Project
Make sure all of the following files are in the same project directory:
- [app.py](file:///d:/Coding/HTML%20Projets/DBMSmgmt%20sys/app.py) (Flask backend server)
- [index.html](file:///d:/Coding/HTML%20Projets/DBMSmgmt%20sys/index.html) (Main user interface)
- [script.js](file:///d:/Coding/HTML%20Projets/DBMSmgmt%20sys/script.js) (Frontend interactive logic)
- [styles.css](file:///d:/Coding/HTML%20Projets/DBMSmgmt%20sys/styles.css) (CSS stylesheet)
- `back_vid.mp4` (Ambient background video asset)

### Step 2: Configure the Database
1. Open your MySQL client (CLI or GUI client like MySQL Workbench, phpMyAdmin, DBeaver, etc.).
2. Run the SQL commands below to create the database and table:

```sql
-- 1. Create a database (e.g., student_db)
CREATE DATABASE IF NOT EXISTS student_db;

-- 2. Switch to your database
USE student_db;

-- 3. Create the student_record table
-- Note: srno is auto_incremented to handle automatic ID indexing
CREATE TABLE IF NOT EXISTS student_record (
    srno INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    course VARCHAR(50) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    rollno VARCHAR(50)
);
```

### Step 3: Install Python Dependencies
Open your terminal/command prompt in the project folder and run:
```bash
pip install flask mysql-connector-python
```

### Step 4: Configure Backend Connection
Open [app.py](file:///d:/Coding/HTML%20Projets/DBMSmgmt%20sys/app.py) and update the `db_config` dictionary (lines 7-12) with your local MySQL credentials:

```python
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'YOUR_DB_PASSWORD',  -- Replace with your actual MySQL password
    'database': 'student_db',        -- Replace with your database name
}
```

### Step 5: Start the Server
Launch the Flask backend server from the command line:
```bash
python app.py
```
*The server will start running at `http://127.0.0.1:5000` with hot-reload debugging enabled.*

---

## 🖥️ How to Use

Open your browser and navigate to `http://127.0.0.1:5000`. You will see the main dashboard with the dynamic student records table.

1. **Insert Record (Create)**:
   - Click the **Insert record** button.
   - A modal dialog will appear. Fill in **Name**, **Course**, and **Branch**.
   - (Optional) Enter a **Rollno**. If left blank, the system automatically increments the numeric part of the last entry (e.g. starting at `26001`).
   - Click **Save record**.

2. **Update Record (Update)**:
   - Click the **Update record** button.
   - Enter the **Sr no.** of the student you want to edit.
   - Provide the updated values for **Name**, **Course**, **Branch**, and **Rollno**.
   - Click **Update record**.

3. **Retrieve Record (Read)**:
   - Click the **Retrieve data** button.
   - Enter the **Sr no.** you wish to find.
   - Click **Find record**. A blue toast notification containing the student details will pop up.

4. **Delete Record (Delete)**:
   - Click the **Delete record** button.
   - Enter the **Sr no.** of the record you want to delete.
   - Click **Delete record** to remove the entry permanently.

---

## 🔌 API Documentation

All data communication between the frontend and backend occurs via REST API endpoints:

| Method | Endpoint | Description | Request Body (JSON) | Response (JSON) |
|---|---|---|---|---|
| **GET** | `/api/student_record` | Fetches all student records | None | Array of all student records |
| **GET** | `/api/student_record/<srno>` | Fetches a single record | None | Object with student details |
| **POST** | `/api/student_record` | Adds a new student record | `{ name, course, branch, rollno (opt), srno (opt) }` | `{ status: "success", rollno: "<generated/given>" }` |
| **PUT** | `/api/student_record/<srno>` | Updates an existing student record | `{ name, course, branch, rollno }` | `{ status: "success" }` |
| **DELETE** | `/api/student_record/<srno>` | Deletes a student record | None | `{ status: "success" }` |

---

## 📂 Project Directory Structure

```text
DBMSmgmt sys/
│
├── app.py           # Flask App and REST API
├── index.html       # Web Dashboard HTML structure
├── script.js        # DOM interaction, Toast alerts, and API fetching
├── styles.css       # Layout styles & Glassmorphic visual configuration
└── back_vid.mp4     # Loop video played in the background of the app
```
