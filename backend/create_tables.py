from database import engine
from models import Base
import models # ensure models are loaded

try:
    Base.metadata.create_all(bind=engine)
    print("Successfully created missing tables.")
except Exception as e:
    print(f"Error creating tables: {e}")
