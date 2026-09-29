from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import uuid
import os
import shutil
from typing import List, Optional

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Auth ────────────────────────────────────────────────────────────────────



@app.post("/api/auth/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        id="u_" + str(uuid.uuid4()),
        email=user.email,
        password=user.password,
        display_name=user.display_name,
        phone_number=user.phone_number,
        selfie_url=user.selfie_url,
        auth_type="email",
        is_seller=user.is_seller
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/api/auth/google", response_model=schemas.User)
def google_auth(payload: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Called after the frontend verifies the Google ID token.
    If the user already exists (by google_id or email), return them.
    Otherwise create a new user with auth_type='google'.
    """
    # Check by google_id first
    db_user = db.query(models.User).filter(models.User.google_id == payload.google_id).first()
    if db_user:
        return db_user

    # Check by email (user may have registered with email previously)
    db_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if db_user:
        # Link the google_id to the existing account
        db_user.google_id = payload.google_id
        if not db_user.avatar_url:
            db_user.avatar_url = payload.avatar_url
        if payload.phone_number and not db_user.phone_number:
            db_user.phone_number = payload.phone_number
        if payload.selfie_url and not db_user.selfie_url:
            db_user.selfie_url = payload.selfie_url
        
        # If payload specifies they are a seller, upgrade their role
        if payload.is_seller and not db_user.is_seller:
            db_user.is_seller = True

        db.commit()
        db.refresh(db_user)
        return db_user

    # Create new SSO user
    new_user = models.User(
        id="u_" + str(uuid.uuid4()),
        email=payload.email,
        password=None,
        display_name=payload.display_name,
        google_id=payload.google_id,
        avatar_url=payload.avatar_url,
        phone_number=payload.phone_number,
        selfie_url=payload.selfie_url,
        auth_type="google",
        is_seller=payload.is_seller
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/api/auth/google-login", response_model=schemas.User)
def google_login(payload: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Called from the login screen. Only returns the user if they already exist.
    """
    db_user = db.query(models.User).filter(models.User.google_id == payload.google_id).first()
    if db_user:
        return db_user

    db_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if db_user:
        db_user.google_id = payload.google_id
        if not db_user.avatar_url:
            db_user.avatar_url = payload.avatar_url
        db.commit()
        db.refresh(db_user)
        return db_user
        
    raise HTTPException(status_code=401, detail="Account not found. Please register first.")


@app.get("/api/auth/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    return {"exists": user is not None}


@app.post("/api/auth/login", response_model=schemas.User)
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.email == user.email,
        models.User.password == user.password
    ).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    return db_user


@app.post("/api/auth/mock-otp")
def send_otp(contact: dict):
    return {"success": True, "message": "OTP 123456 sent"}


@app.post("/api/auth/verify-otp")
def verify_otp(data: dict):
    if data.get("otp") != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP")
    return {"success": True}


# ─── Users ───────────────────────────────────────────────────────────────────

@app.patch("/api/users/{user_id}/role", response_model=schemas.User)
def set_user_role(user_id: str, payload: schemas.UserRoleUpdate, db: Session = Depends(get_db)):
    """Set whether the user is a seller or buyer after SSO registration."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_seller = payload.is_seller
    db.commit()
    db.refresh(user)
    return user


@app.patch("/api/users/{user_id}/addresses", response_model=schemas.User)
def set_user_addresses(user_id: str, payload: schemas.UserUpdateAddresses, db: Session = Depends(get_db)):
    """Set the seller's saved from addresses."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.seller_addresses = payload.seller_addresses
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/users/{user_id}/become-seller")
def become_seller(user_id: str, payload: schemas.BecomeSellerRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_seller = True
    user.selfie_url = payload.selfie_url
    db.commit()
    return {"success": True}


# ─── Products ────────────────────────────────────────────────────────────────

from sqlalchemy import or_

@app.get("/api/products", response_model=List[schemas.Product])
def get_products(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if category:
        query = query.filter(
            or_(
                models.Product.category_slug == category,
                models.Product.subcategory_slug == category,
                models.Product.sub_subcategory_slug == category
            )
        )
    return query.all()


@app.get("/api/products/seller/{seller_id}", response_model=List[schemas.Product])
def get_seller_products(seller_id: str, db: Session = Depends(get_db)):
    return db.query(models.Product).filter(models.Product.seller_id == seller_id).all()


@app.get("/api/products/{product_id}", response_model=schemas.Product)
def get_product(product_id: str, db: Session = Depends(get_db)):
    prod = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod


from io import BytesIO
try:
    from PIL import Image
except ImportError:
    Image = None

from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def compress_image(image_bytes: bytes, max_size=(1024, 1024), quality=85) -> bytes:
    if not Image:
        return image_bytes
    try:
        img = Image.open(BytesIO(image_bytes))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        output = BytesIO()
        img.save(output, format="JPEG", quality=quality, optimize=True)
        return output.getvalue()
    except Exception as e:
        print(f"Image compression failed: {e}")
        return image_bytes

from fastapi import Request

@app.post("/api/upload")
async def upload_files(request: Request, files: List[UploadFile] = File(...)):
    urls = []
    for file in files:
        file_bytes = await file.read()
        compressed_bytes = compress_image(file_bytes)
        
        # We save as JPEG since we convert RGBA to RGB and save as JPEG
        filename = f"{uuid.uuid4()}.jpg"
        
        if supabase:
            try:
                supabase.storage.from_("product-images").upload(
                    path=filename, 
                    file=compressed_bytes, 
                    file_options={"content-type": "image/jpeg"}
                )
                url = supabase.storage.from_("product-images").get_public_url(filename)
                urls.append(url)
                continue
            except Exception as e:
                print(f"Supabase upload failed: {e}")
                # Fallback to local
                pass

        # Fallback local storage
        file_path = os.path.join("uploads", filename)
        with open(file_path, "wb") as buffer:
            buffer.write(compressed_bytes)
        
        # Use request.base_url to form an absolute URL
        base_url = str(request.base_url)
        if base_url.endswith("/"):
            base_url = base_url[:-1]
            
        urls.append(f"{base_url}/uploads/{filename}")
    return {"urls": urls}


@app.post("/api/products", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    new_product = models.Product(
        id="p_" + str(uuid.uuid4()),
        **product.dict()
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


# ─── Cart ────────────────────────────────────────────────────────────────────

def get_or_create_cart(buyer_id: str, db: Session):
    cart = db.query(models.Cart).filter(models.Cart.buyer_id == buyer_id).first()
    if not cart:
        cart = models.Cart(id="c_" + str(uuid.uuid4()), buyer_id=buyer_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

@app.get("/api/cart/{buyer_id}", response_model=schemas.Cart)
def get_cart(buyer_id: str, db: Session = Depends(get_db)):
    cart = get_or_create_cart(buyer_id, db)
    return cart

@app.post("/api/cart/{buyer_id}/items", response_model=schemas.Cart)
def add_to_cart(buyer_id: str, item: schemas.CartItemCreate, db: Session = Depends(get_db)):
    cart = get_or_create_cart(buyer_id, db)
    
    # Check if item already exists in cart
    existing_item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == item.product_id
    ).first()
    
    if existing_item:
        existing_item.quantity += item.quantity
    else:
        new_item = models.CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(new_item)
        
    db.commit()
    db.refresh(cart)
    return cart

@app.put("/api/cart/{buyer_id}/items/{product_id}", response_model=schemas.Cart)
def update_cart_item(buyer_id: str, product_id: str, quantity: int, db: Session = Depends(get_db)):
    cart = db.query(models.Cart).filter(models.Cart.buyer_id == buyer_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == product_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
        
    if quantity <= 0:
        db.delete(item)
    else:
        item.quantity = quantity
        
    db.commit()
    db.refresh(cart)
    return cart

@app.delete("/api/cart/{buyer_id}/items/{product_id}", response_model=schemas.Cart)
def remove_cart_item(buyer_id: str, product_id: str, db: Session = Depends(get_db)):
    cart = db.query(models.Cart).filter(models.Cart.buyer_id == buyer_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == product_id
    ).first()
    
    if item:
        db.delete(item)
        db.commit()
        db.refresh(cart)
        
    return cart

@app.delete("/api/cart/{buyer_id}", response_model=schemas.Cart)
def clear_cart(buyer_id: str, db: Session = Depends(get_db)):
    cart = db.query(models.Cart).filter(models.Cart.buyer_id == buyer_id).first()
    if cart:
        db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).delete()
        db.commit()
        db.refresh(cart)
    return cart


# ─── Orders ──────────────────────────────────────────────────────────────────

@app.post("/api/orders", response_model=schemas.Order)
def place_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    new_order = models.Order(
        buyer_id=order.buyer_id,
        total_amount=order.total_amount,
        shipping_address=order.shipping_address
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in order.items:
        db_item = models.OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            seller_id=item.seller_id,
            title=item.title,
            price=item.price,
            quantity=item.quantity,
            image_url=item.image_url
        )
        db.add(db_item)

    db.commit()
    db.refresh(new_order)
    return new_order


@app.get("/api/orders/buyer/{buyer_id}", response_model=List[schemas.Order])
def get_buyer_orders(buyer_id: str, db: Session = Depends(get_db)):
    return db.query(models.Order).filter(models.Order.buyer_id == buyer_id).all()


@app.get("/api/orders/seller/{seller_id}", response_model=List[schemas.Order])
def get_seller_orders(seller_id: str, db: Session = Depends(get_db)):
    orders = (
        db.query(models.Order)
        .join(models.OrderItem)
        .filter(models.OrderItem.seller_id == seller_id)
        .all()
    )
    return orders


# ─── Admin ───────────────────────────────────────────────────────────────────

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "12345678"


@app.post("/api/admin/login")
def admin_login(credentials: dict):
    if (
        credentials.get("username") != ADMIN_USERNAME
        or credentials.get("password") != ADMIN_PASSWORD
    ):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return {"success": True, "token": "admin_session_token"}


@app.get("/api/admin/users", response_model=List[schemas.User])
def admin_get_users(token: str, db: Session = Depends(get_db)):
    if token != "admin_session_token":
        raise HTTPException(status_code=403, detail="Forbidden")
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: str, token: str, db: Session = Depends(get_db)):
    if token != "admin_session_token":
        raise HTTPException(status_code=403, detail="Forbidden")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Cascade: delete orders where buyer is this user
    orders = db.query(models.Order).filter(models.Order.buyer_id == user_id).all()
    for order in orders:
        db.query(models.OrderItem).filter(models.OrderItem.order_id == order.id).delete()
        db.delete(order)
    # Delete products listed by this user
    db.query(models.Product).filter(models.Product.seller_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"success": True, "deleted_user_id": user_id}


@app.delete("/api/admin/users")
def admin_delete_all_users(token: str, db: Session = Depends(get_db)):
    if token != "admin_session_token":
        raise HTTPException(status_code=403, detail="Forbidden")
    db.query(models.OrderItem).delete()
    db.query(models.Order).delete()
    db.query(models.Product).delete()
    db.query(models.User).delete()
    db.commit()
    return {"success": True, "message": "All users and related data deleted"}

