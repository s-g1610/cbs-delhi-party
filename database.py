import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'party.db')

def init_db():
    """Initializes the database and creates the guests table if it does not exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS guests (
            phone_number TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT NOT NULL,
            has_plus_one INTEGER NOT NULL,
            plus_one_name TEXT,
            dietary_pref TEXT NOT NULL,
            plus_one_dietary TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def get_guest(phone_number):
    """Retrieves a guest record by phone number. Returns a dict or None."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM guests WHERE phone_number = ?', (phone_number,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

def save_guest(data):
    """Saves or updates a guest record."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO guests (phone_number, name, status, has_plus_one, plus_one_name, dietary_pref, plus_one_dietary, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(phone_number) DO UPDATE SET
            name=excluded.name,
            status=excluded.status,
            has_plus_one=excluded.has_plus_one,
            plus_one_name=excluded.plus_one_name,
            dietary_pref=excluded.dietary_pref,
            plus_one_dietary=excluded.plus_one_dietary,
            updated_at=CURRENT_TIMESTAMP
    ''', (
        data['phone_number'],
        data['name'],
        data['status'],
        1 if data.get('has_plus_one') else 0,
        data.get('plus_one_name'),
        data['dietary_pref'],
        data.get('plus_one_dietary')
    ))
    conn.commit()
    conn.close()
