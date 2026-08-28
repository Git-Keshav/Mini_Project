from flask import Flask, jsonify, render_template, request
import mysql.connector
import re

app = Flask(__name__, static_folder='.', template_folder='.', static_url_path='')

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'YOUR_DB_PASSWORD',
    'database': 'YOUR_DATABASE_NAME',
}

# RUN THIS IN YOUR MYSQL CLI BEFORE RUNNING THIS FILE
# use YOUR_DATABASE_NAME; 
# CREATE TABLE student_record(srno int primary key, name varchar(100), course varchar(50), branch varchar(100), rollno varchar(50));


def get_db():
    return mysql.connector.connect(**db_config)

def generate_next_rollno(cursor):
    cursor.execute("SELECT rollno FROM student_record WHERE rollno IS NOT NULL AND rollno != '' ORDER BY srno DESC LIMIT 1")
    row = cursor.fetchone()
    if not row or not row['rollno']:
        return "26001"
    
    last_rollno = str(row['rollno']).strip()
    match = re.search(r'^(.*?)(0*[\d]+)(\D*)$', last_rollno)
    if match:
        prefix, num_str, suffix = match.groups()
        length = len(num_str)
        next_num = int(num_str) + 1
        return f"{prefix}{str(next_num).zfill(length)}{suffix}"
    return "26001"

# Serve main HTML page
@app.route('/')
def index():
    return render_template('index.html')

# READ ALL: Fetch all student records
@app.route('/api/student_record', methods=['GET'])
def get_students():
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM student_record ORDER BY srno ASC')
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# READ SINGLE: Fetch single student record by srno
@app.route('/api/student_record/<int:srno>', methods=['GET'])
def get_student(srno):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM student_record WHERE srno = %s', (srno,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if row:
            return jsonify(row)
        return jsonify({'error': 'Record not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# CREATE: Insert a new student record
@app.route('/api/student_record', methods=['POST'])
def add_student():
    try:
        data = request.json or {}
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        name = (data.get('name') or '').strip()
        course = (data.get('course') or '').strip()
        branch = (data.get('branch') or '').strip()
        rollno = (data.get('rollno') or '').strip()
        srno = data.get('srno')

        if not name or not course or not branch:
            return jsonify({'error': 'Name, Course, and Branch are required fields.'}), 400

        if not rollno:
            rollno = generate_next_rollno(cursor)

        cursor_write = conn.cursor()
        if srno:
            cursor_write.execute(
                'INSERT INTO student_record (srno, name, course, branch, rollno) VALUES (%s, %s, %s, %s, %s)',
                (srno, name, course, branch, rollno)
            )
        else:
            cursor_write.execute(
                'INSERT INTO student_record (name, course, branch, rollno) VALUES (%s, %s, %s, %s)',
                (name, course, branch, rollno)
            )
        conn.commit()
        cursor_write.close()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success', 'rollno': rollno})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# UPDATE: Modify an existing student record
@app.route('/api/student_record/<int:srno>', methods=['PUT'])
def update_student(srno):
    try:
        data = request.json or {}
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        name = (data.get('name') or '').strip()
        course = (data.get('course') or '').strip()
        branch = (data.get('branch') or '').strip()
        rollno = (data.get('rollno') or '').strip()

        if not name or not course or not branch:
            return jsonify({'error': 'Name, Course, and Branch are required fields.'}), 400

        if not rollno:
            cursor.execute('SELECT rollno FROM student_record WHERE srno = %s', (srno,))
            row = cursor.fetchone()
            if row and row['rollno']:
                rollno = row['rollno']
            else:
                rollno = generate_next_rollno(cursor)

        cursor_write = conn.cursor()
        cursor_write.execute(
            'UPDATE student_record SET name = %s, course = %s, branch = %s, rollno = %s WHERE srno = %s',
            (name, course, branch, rollno, srno)
        )
        conn.commit()
        cursor_write.close()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# DELETE: Remove a student record
@app.route('/api/student_record/<int:srno>', methods=['DELETE'])
def delete_student(srno):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM student_record WHERE srno = %s', (srno,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)

