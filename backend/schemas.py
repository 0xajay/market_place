from pydantic import BaseModel
from typing import List, Optional
import datetime

class UserBase(BaseModel):
    email: str
    display_name: str
    is_seller: bool = False
    phone_number: Optional[str] = None
    selfie_url: Optional[str] = None
    auth_type: str = "email"
    google_id: Optional[str] = None
    avatar_url: Optional[str] = None
    seller_addresses: List[str] = []

class UserCreate(UserBase):
    password: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    google_id: str
    email: str
    display_name: str
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    selfie_url: Optional[str] = None
    is_seller: bool = False

class BecomeSellerRequest(BaseModel):
    selfie_url: str

class UserRoleUpdate(BaseModel):
    is_seller: bool

class UserUpdateAddresses(BaseModel):
    seller_addresses: List[str]

class User(UserBase):
    id: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    title: str
    description: str
    price: float
    discount_price: Optional[float] = None
    image_urls: List[str] = []
    category_slug: Optional[str] = None
    subcategory_slug: Optional[str] = None
    sub_subcategory_slug: Optional[str] = None
    quantity: int = 1

class ProductCreate(ProductBase):
    seller_id: str

class Product(ProductBase):
    id: str
    seller_id: str
    created_at: datetime.datetime
    seller: Optional[User] = None

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    product_id: str
    seller_id: str
    title: str
    price: float
    quantity: int
    image_url: Optional[str] = None

class OrderCreate(BaseModel):
    buyer_id: str
    items: List[OrderItemBase]
    total_amount: float
    shipping_address: str

class OrderItem(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True

class Order(BaseModel):
    id: int
    buyer_id: str
    total_amount: float
    shipping_address: str
    status: str
    created_at: datetime.datetime
    items: List[OrderItem]

    class Config:
        from_attributes = True

class CartItemBase(BaseModel):
    product_id: str
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItem(CartItemBase):
    id: int
    cart_id: str
    product: Product

    class Config:
        from_attributes = True

class Cart(BaseModel):
    id: str
    buyer_id: str
    items: List[CartItem] = []

    class Config:
        from_attributes = True
