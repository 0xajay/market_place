'use server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Cannot reach the backend server. Is it running on port 8000?');
  }
  const data = await res.json();
  if (!res.ok) {
    const detail = data.detail;
    let message: string;
    if (Array.isArray(detail)) {
      // FastAPI Pydantic validation errors return an array of {loc, msg, type}
      message = detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
    } else if (typeof detail === 'string') {
      message = detail;
    } else {
      message = data.message || `Request failed with status ${res.status}`;
    }
    throw new Error(message);
  }
  return data;
}

// -- Auth --
export async function sendMockOTP(contact: string) {
  return fetchAPI('/auth/mock-otp', {
    method: 'POST',
    body: JSON.stringify({ contact }),
  });
}

export async function verifyMockOTP(contact: string, otp: string) {
  return fetchAPI('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ contact, otp }),
  });
}

export async function checkEmailExists(email: string) {
  const data = await fetchAPI(`/auth/check-email?email=${encodeURIComponent(email)}`);
  return data.exists;
}

export async function registerUser(email: string, password: string, displayName: string, phoneNumber: string, isSeller: boolean, selfieUrl?: string) {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      display_name: displayName,
      phone_number: phoneNumber,
      selfie_url: selfieUrl,
      is_seller: isSeller
    }),
  });
}

export async function googleAuth(
  googleId: string, 
  email: string, 
  displayName: string, 
  isSeller: boolean,
  avatarUrl?: string,
  phone?: string,
  selfieUrl?: string
) {
  return fetchAPI('/auth/google', {
    method: 'POST',
    body: JSON.stringify({
      google_id: googleId,
      email,
      display_name: displayName,
      avatar_url: avatarUrl,
      phone_number: phone,
      selfie_url: selfieUrl,
      is_seller: isSeller
    }),
  });
}

export async function googleLogin(googleId: string, email: string, displayName: string, avatarUrl?: string) {
  return fetchAPI('/auth/google-login', {
    method: 'POST',
    body: JSON.stringify({
      google_id: googleId,
      email,
      display_name: displayName,
      avatar_url: avatarUrl,
    }),
  });
}

export async function setUserRole(userId: string, isSeller: boolean) {
  return fetchAPI(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ is_seller: isSeller }),
  });
}

export async function updateSellerAddresses(userId: string, addresses: string[]) {
  return fetchAPI(`/users/${userId}/addresses`, {
    method: 'PATCH',
    body: JSON.stringify({ seller_addresses: addresses }),
  });
}

export async function loginUser(email: string, password: string) {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function becomeSeller(userId: string, selfieUrl: string) {
  return fetchAPI(`/users/${userId}/become-seller`, {
    method: 'POST',
    body: JSON.stringify({
      selfie_url: selfieUrl
    }),
  });
}

// -- Products --
export async function getProducts(category?: string) {
  const url = category ? `/products?category=${encodeURIComponent(category)}` : '/products';
  return fetchAPI(url, {
    cache: 'no-store'
  });
}

export async function getProduct(id: string) {
  return fetchAPI(`/products/${id}`, {
    cache: 'no-store'
  });
}

export async function getSellerProducts(sellerId: string) {
  return fetchAPI(`/products/seller/${sellerId}`, {
    cache: 'no-store'
  });
}

export async function addProduct(
  sellerId: string,
  title: string,
  description: string,
  price: number,
  discountPrice: number | null,
  quantity: number,
  imageUrls: string[],
  categorySlug?: string,
  subcategorySlug?: string,
  subSubcategorySlug?: string
) {
  return fetchAPI('/products', {
    method: 'POST',
    body: JSON.stringify({
      seller_id: sellerId,
      title,
      description,
      price,
      discount_price: discountPrice,
      quantity,
      image_urls: imageUrls,
      category_slug: categorySlug,
      subcategory_slug: subcategorySlug,
      sub_subcategory_slug: subSubcategorySlug
    }),
  });
}

// -- Orders --
export async function placeOrder(buyerId: string, items: any[], totalAmount: number, shippingAddress: string) {
  return fetchAPI('/orders', {
    method: 'POST',
    body: JSON.stringify({
      buyer_id: buyerId,
      items: items.map(i => ({
        product_id: i.productId,
        seller_id: i.sellerId,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        image_url: i.image_url
      })),
      total_amount: totalAmount,
      shipping_address: shippingAddress
    }),
  });
}

export async function getBuyerOrders(buyerId: string) {
  return fetchAPI(`/orders/buyer/${buyerId}`, {
    cache: 'no-store'
  });
}

export async function getSellerOrders(sellerId: string) {
  return fetchAPI(`/orders/seller/${sellerId}`, {
    cache: 'no-store'
  });
}

// -- Cart --
export async function getCart(buyerId: string) {
  return fetchAPI(`/cart/${buyerId}`, {
    cache: 'no-store'
  });
}

export async function addToCart(buyerId: string, productId: string, quantity: number = 1) {
  return fetchAPI(`/cart/${buyerId}/items`, {
    method: 'POST',
    body: JSON.stringify({
      product_id: productId,
      quantity
    }),
  });
}

export async function updateCartItem(buyerId: string, productId: string, quantity: number) {
  return fetchAPI(`/cart/${buyerId}/items/${productId}?quantity=${quantity}`, {
    method: 'PUT'
  });
}

export async function removeCartItem(buyerId: string, productId: string) {
  return fetchAPI(`/cart/${buyerId}/items/${productId}`, {
    method: 'DELETE'
  });
}

export async function clearCart(buyerId: string) {
  return fetchAPI(`/cart/${buyerId}`, {
    method: 'DELETE'
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────
export async function adminLogin(username: string, password: string) {
  return fetchAPI('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function adminGetUsers(token: string) {
  return fetchAPI(`/admin/users?token=${encodeURIComponent(token)}`, {
    cache: 'no-store',
  });
}

export async function adminDeleteUser(userId: string, token: string) {
  return fetchAPI(`/admin/users/${userId}?token=${encodeURIComponent(token)}`, {
    method: 'DELETE',
  });
}

export async function adminDeleteAllUsers(token: string) {
  return fetchAPI(`/admin/users?token=${encodeURIComponent(token)}`, {
    method: 'DELETE',
  });
}
