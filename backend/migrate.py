from database import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE order_items ADD COLUMN image_url VARCHAR;"))
    print("Successfully added image_url column to order_items table")
except Exception as e:
    print(f"Migration failed or already applied: {e}")
