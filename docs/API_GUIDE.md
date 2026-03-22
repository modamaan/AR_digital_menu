# Coowik API Documentation

## Base URL

```
Development: http://localhost:3000
Production: https://your-production-domain.com
```

---

## 📍 API Endpoints Reference

### 🔐 Authentication

| Method | Endpoint            | Auth | Description                        |
| ------ | ------------------- | ---- | ---------------------------------- |
| `POST` | `/api/auth/session` | ❌   | Create session with Firebase token |

**Request:**

```json
POST /api/auth/session
{
  "idToken": "firebase_id_token_here"
}
```

**Response:**

```json
{
  "success": true,
  "uid": "firebase_user_id"
}
```

---

### 🏪 Store Management

| Method | Endpoint      | Auth | Description                           |
| ------ | ------------- | ---- | ------------------------------------- |
| `GET`  | `/api/stores` | ✅   | Get all stores for authenticated user |
| `POST` | `/api/stores` | ✅   | Create a new store                    |

**Get Stores:**

```json
GET /api/stores
Headers: Cookie: session=YOUR_SESSION

Response:
{
  "success": true,
  "stores": [
    {
      "id": "uuid",
      "name": "My Store",
      "slug": "my-store"
    }
  ]
}
```

**Create Store:**

```json
POST /api/stores
Headers: Cookie: session=YOUR_SESSION
{
  "storeName": "My Store",
  "templateId": "template_1",
  "currency": "USD",
  "notifications": {
    "whatsapp": true,
    "email": true
  },
  "whatsappPhone": "+1234567890",
  "bio": "Welcome to my store"
}

Response:
{
  "success": true,
  "store": {
    "id": "uuid",
    "slug": "my-store",
    "name": "My Store"
  }
}
```

---

### 📦 Product Management

| Method   | Endpoint                           | Auth | Description                  |
| -------- | ---------------------------------- | ---- | ---------------------------- |
| `GET`    | `/api/products?storeId={id}`       | ✅   | Get all products for a store |
| `POST`   | `/api/products`                    | ✅   | Create a new product         |
| `GET`    | `/api/products/{productId}`        | ✅   | Get single product           |
| `PATCH`  | `/api/products/{productId}/status` | ✅   | Update product status        |
| `DELETE` | `/api/products/{productId}`        | ✅   | Delete product               |

**Get Products:**

```json
GET /api/products?storeId=store-uuid
Headers: Cookie: session=YOUR_SESSION

Response:
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "name": "Product Name",
      "price": "99.99",
      "inventory": 50,
      "status": "active",
      "images": [...]
    }
  ]
}
```

**Create Product:**

```json
POST /api/products
Headers: Cookie: session=YOUR_SESSION
{
  "storeId": "store-uuid",
  "name": "T-Shirt",
  "price": "29.99",
  "inventory": "100",
  "description": "Cotton t-shirt",
  "discount": "10.00",
  "images": ["https://imagekit.io/image1.jpg"]
}

Response:
{
  "success": true,
  "product": { ... },
  "message": "Product created successfully"
}
```

**Update Product Status:**

```json
PATCH /api/products/{productId}/status
Headers: Cookie: session=YOUR_SESSION
{
  "status": "disabled"  // or "active"
}

Response:
{
  "success": true,
  "product": { ... },
  "message": "Product disabled successfully"
}
```

**Delete Product:**

```json
DELETE /api/products/{productId}
Headers: Cookie: session=YOUR_SESSION

Response:
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 📋 Order Management

| Method  | Endpoint                                   | Auth | Description                         |
| ------- | ------------------------------------------ | ---- | ----------------------------------- |
| `GET`   | `/api/orders?storeId={id}&status={status}` | ✅   | Get orders (optional status filter) |
| `GET`   | `/api/orders/{orderId}`                    | ✅   | Get order details                   |
| `PATCH` | `/api/orders/{orderId}/status`             | ✅   | Update order status                 |

**Order Status Values:**

- `pending`
- `new_order`
- `order_confirmed`
- `payment_confirmed`
- `packed`
- `shipped`
- `delivered`
- `cancelled`

**Get Orders:**

```json
GET /api/orders?storeId=store-uuid&status=new_order
Headers: Cookie: session=YOUR_SESSION

Response:
{
  "success": true,
  "orders": [
    {
      "id": "uuid",
      "customerName": "John Doe",
      "totalAmount": "199.98",
      "status": "new_order",
      "product": {
        "name": "Product Name",
        "image": "https://..."
      }
    }
  ]
}
```

**Get Order Details:**

```json
GET /api/orders/{orderId}
Headers: Cookie: session=YOUR_SESSION

Response:
{
  "success": true,
  "order": {
    "id": "uuid",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "quantity": 2,
    "totalAmount": "209.98",
    "status": "new_order",
    "product": { ... }
  }
}
```

**Update Order Status:**

```json
PATCH /api/orders/{orderId}/status
Headers: Cookie: session=YOUR_SESSION
{
  "status": "shipped"
}

Response:
{
  "success": true
}
```

---

### 📊 Analytics

| Method | Endpoint                                                           | Auth | Description         |
| ------ | ------------------------------------------------------------------ | ---- | ------------------- |
| `GET`  | `/api/analytics?storeId={id}&range={range}`                        | ✅   | Get store analytics |
| `GET`  | `/api/analytics/top-products?storeId={id}&limit={n}&range={range}` | ✅   | Get top products    |

**Date Range Values:** `today`, `week`, `month`, `all`

**Get Analytics:**

```json
GET /api/analytics?storeId=store-uuid&range=week
Headers: Cookie: session=YOUR_SESSION

Response:
{
  "success": true,
  "data": {
    "dailyVisitors": 1250,
    "totalOrders": 45,
    "totalSales": 4599.50
  }
}
```

**Get Top Products:**

```json
GET /api/analytics/top-products?storeId=store-uuid&limit=5&range=month
Headers: Cookie: session=YOUR_SESSION

Response:
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "name": "Product Name",
      "totalOrders": 25,
      "totalSales": 2499.75,
      "todaySales": 199.98
    }
  ]
}
```

---

### 🛒 Storefront (Public - No Authentication)

| Method | Endpoint                                           | Auth | Description             |
| ------ | -------------------------------------------------- | ---- | ----------------------- |
| `GET`  | `/api/storefront/{storeSlug}`                      | ❌   | Get store information   |
| `GET`  | `/api/storefront/{storeSlug}/products`             | ❌   | Get all active products |
| `GET`  | `/api/storefront/{storeSlug}/products/{productId}` | ❌   | Get product details     |
| `GET`  | `/api/storefront/{storeSlug}/search?q={query}`     | ❌   | Search products         |
| `POST` | `/api/checkout`                                    | ❌   | Create order (checkout) |

**Get Store Info:**

```json
GET /api/storefront/my-store

Response:
{
  "success": true,
  "store": {
    "id": "uuid",
    "name": "My Store",
    "slug": "my-store",
    "currency": "USD",
    "bio": "Welcome to my store"
  }
}
```

**Get Store Products:**

```json
GET /api/storefront/my-store/products

Response:
{
  "success": true,
  "products": [...]
}
```

**Get Product Details:**

```json
GET /api/storefront/my-store/products/{productId}

Response:
{
  "success": true,
  "product": {
    "id": "uuid",
    "name": "Product Name",
    "price": "99.99",
    "inventory": 50,
    "images": [...]
  }
}
```

**Search Products:**

```json
GET /api/storefront/my-store/search?q=shirt

Response:
{
  "success": true,
  "products": [...]
}
```

**Checkout:**

```json
POST /api/checkout
{
  "storeSlug": "my-store",
  "productId": "product-uuid",
  "quantity": 2,
  "unitPrice": "29.99",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "1234567890",
  "countryCode": "+1",
  "shippingMethod": "delivery",  // or "pickup"
  "paymentMethod": "cod",  // or "razorpay", "upi"
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}

Response:
{
  "success": true,
  "orderId": "order-uuid",
  "orderNumber": "ABC12345"
}
```

---

## 🔑 Authentication Flow

1. **Sign in with Firebase** (Google, Email, Phone, etc.)
2. **Get Firebase ID token:**
   ```javascript
   const idToken = await user.getIdToken();
   ```
3. **Create session:**
   ```
   POST /api/auth/session
   Body: { "idToken": "..." }
   ```
4. **Extract session cookie** from response headers
5. **Include cookie** in all authenticated requests:
   ```
   Headers: Cookie: session=YOUR_SESSION_COOKIE
   ```

---

## 📝 Response Format

All endpoints follow a consistent response format:

**Success:**

```json
{
  "success": true,
  "data": { ... }  // or "products", "orders", "store", etc.
}
```

**Error:**

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 🎯 Quick Reference

### Admin Features (Require Authentication)

```
Stores      → /api/stores
Products    → /api/products/*
Orders      → /api/orders/*
Analytics   → /api/analytics/*
```

### Customer Features (Public)

```
Browse      → /api/storefront/{slug}
Products    → /api/storefront/{slug}/products
Search      → /api/storefront/{slug}/search
Checkout    → /api/checkout
```

---

## 🔧 Testing with cURL

**Test Public Endpoint:**

```bash
curl http://localhost:3000/api/storefront/my-store
```

**Test Authenticated Endpoint:**

```bash
curl http://localhost:3000/api/products?storeId=store-uuid \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```

**Create Product:**

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "storeId": "store-uuid",
    "name": "Test Product",
    "price": "99.99",
    "inventory": "10",
    "images": []
  }'
```

---

## 📱 Flutter Implementation

See the complete Flutter implementation guide in the artifacts folder:

- Full API service class
- Authentication setup
- Usage examples
- Error handling

---

## 🚀 Next Steps

1. **Update Base URL** for production
2. **Test all endpoints** with your frontend
3. **Implement error handling** in your app
4. **Add loading states** for better UX

---

**Last Updated:** January 22, 2026
