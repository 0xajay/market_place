import sqlite3

def drop_products_table():
    conn = sqlite3.connect('backend/marketplace.db')
    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS products')
    conn.commit()
    conn.close()
    print("Products table dropped successfully.")

if __name__ == "__main__":
    drop_products_table()
