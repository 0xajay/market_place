from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=True)  # nullable for SSO users
    display_name = Column(String)
    is_seller = Column(Boolean, default=False)
    phone_number = Column(String, nullable=True)
    selfie_url = Column(String, nullable=True)
    auth_type = Column(String, default="email")  # "email" or "google"
    google_id = Column(String, nullable=True, unique=True)
    avatar_url = Column(String, nullable=True)
    seller_addresses = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    products = relationship("Product", back_populates="seller")

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    seller_id = Column(String, ForeignKey("users.id"))
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    discount_price = Column(Float, nullable=True)
    image_urls = Column(JSON, default=list)
    category_slug = Column(String, nullable=True)
    subcategory_slug = Column(String, nullable=True)
    sub_subcategory_slug = Column(String, nullable=True)
    quantity = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    seller = relationship("User", back_populates="products")

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True)
    buyer_id = Column(String, ForeignKey("users.id"))
    total_amount = Column(Float)
    shipping_address = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String, ForeignKey("orders.id"))
    product_id = Column(String)
    seller_id = Column(String)
    title = Column(String)
    price = Column(Float)
    quantity = Column(Integer)
    image_url = Column(String, nullable=True)

    order = relationship("Order", back_populates="items")

class Cart(Base):
    __tablename__ = "carts"

    id = Column(String, primary_key=True, index=True)
    buyer_id = Column(String, ForeignKey("users.id"), unique=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cart_id = Column(String, ForeignKey("carts.id"))
    product_id = Column(String, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")
