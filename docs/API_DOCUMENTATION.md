# KitchenSync API Documentation

## Overview

KitchenSync is a comprehensive restaurant management system built with Node.js/Express backend and React frontend. This documentation covers all public APIs, functions, and components.

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Authentication](#authentication)
3. [Core Modules](#core-modules)
4. [Frontend Components](#frontend-components)
5. [Services & Utilities](#services--utilities)
6. [Data Models](#data-models)
7. [Examples](#examples)

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.kitchensync.restaurant`

## Authentication

### Staff Authentication

KitchenSync uses JWT-based authentication for staff users. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Customer Authentication

Customer authentication is separate from staff authentication and uses its own JWT tokens:

```
Authorization: Bearer <customer_jwt_token>
```

## API Endpoints

### Authentication APIs

#### Staff Authentication

**Base URL**: `/api/users`

##### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "staff@restaurant.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "staff@restaurant.com",
    "name": "Staff Member",
    "role": "USER"
  }
}
```

##### Register
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "staff@restaurant.com",
  "password": "password123",
  "name": "Staff Member"
}
```

#### Customer Authentication

**Base URL**: `/api/auth/customer`

##### Customer Registration
```http
POST /api/auth/customer/register
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "restaurantSubdomain": "restaurant-name"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please verify your email.",
  "customer": {
    "id": 1,
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

##### Customer Login
```http
POST /api/auth/customer/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123",
  "restaurantSubdomain": "restaurant-name"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "customer": {
    "id": 1,
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

##### Email Verification
```http
POST /api/auth/customer/verify-email
Content-Type: application/json

{
  "token": "verification_token"
}
```

##### Password Reset Request
```http
POST /api/auth/customer/request-password-reset
Content-Type: application/json

{
  "email": "customer@example.com",
  "restaurantSubdomain": "restaurant-name"
}
```

##### Password Reset
```http
POST /api/auth/customer/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

##### Refresh Token
```http
POST /api/auth/customer/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

##### Get Customer Profile
```http
GET /api/auth/customer/profile
Authorization: Bearer <customer_jwt_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "isEmailVerified": true,
  "restaurants": [
    {
      "id": 1,
      "name": "Restaurant Name",
      "subdomain": "restaurant-name"
    }
  ]
}
```

##### Update Customer Profile
```http
PUT /api/auth/customer/profile
Authorization: Bearer <customer_jwt_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

### Recipe Management APIs

**Base URL**: `/api/recipes`
**Authentication**: Required (Staff JWT)

#### Get All Recipes
```http
GET /api/recipes
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of recipes per page
- `category` (optional): Filter by category ID
- `search` (optional): Search term for recipe names

**Response:**
```json
{
  "recipes": [
    {
      "id": 1,
      "name": "Marinara Sauce",
      "description": "Classic Italian tomato sauce",
      "instructions": "1. Heat oil...",
      "yieldQuantity": 32,
      "yieldUnit": {
        "id": 1,
        "name": "fluid ounces",
        "abbreviation": "fl oz"
      },
      "prepTimeMinutes": 15,
      "cookTimeMinutes": 30,
      "tags": ["sauce", "italian"],
      "category": {
        "id": 1,
        "name": "Sauces"
      },
      "ingredients": [
        {
          "ingredient": {
            "id": 1,
            "name": "Crushed Tomatoes"
          },
          "quantity": 28,
          "unit": {
            "id": 2,
            "name": "ounces",
            "abbreviation": "oz"
          }
        }
      ],
      "photoUrl": "https://cloudinary.com/image.jpg"
    }
  ],
  "totalCount": 25,
  "currentPage": 1,
  "totalPages": 3
}
```

#### Get Recipe by ID
```http
GET /api/recipes/:id
Authorization: Bearer <jwt_token>
```

#### Create Recipe
```http
POST /api/recipes
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "New Recipe",
  "description": "Recipe description",
  "instructions": "1. Step one...",
  "yieldQuantity": 4,
  "yieldUnitId": 1,
  "prepTimeMinutes": 20,
  "cookTimeMinutes": 25,
  "categoryId": 1,
  "tags": ["tag1", "tag2"],
  "ingredients": [
    {
      "ingredientId": 1,
      "quantity": 2,
      "unitId": 1,
      "order": 0
    }
  ]
}
```

#### Update Recipe
```http
PUT /api/recipes/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Recipe Name",
  "instructions": "Updated instructions..."
}
```

#### Delete Recipe
```http
DELETE /api/recipes/:id
Authorization: Bearer <jwt_token>
```

#### Scale Recipe
```http
POST /api/recipes/:id/scale
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "scaleFactor": 2.5
}
```

**Response:**
```json
{
  "scaledRecipe": {
    "id": 1,
    "name": "Marinara Sauce (Scaled)",
    "yieldQuantity": 80,
    "ingredients": [
      {
        "ingredient": {
          "name": "Crushed Tomatoes"
        },
        "quantity": 70,
        "unit": {
          "name": "ounces"
        }
      }
    ]
  }
}
```

### Menu Management APIs

**Base URL**: `/api/menus`
**Authentication**: Required (Staff JWT)

#### Get All Menus
```http
GET /api/menus
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "menus": [
    {
      "id": 1,
      "name": "Dinner Menu",
      "title": "Our Evening Selection",
      "subtitle": "Fresh, Local Ingredients",
      "font": "Playfair Display",
      "layout": "single",
      "backgroundColor": "#ffffff",
      "textColor": "#000000",
      "accentColor": "#333333",
      "isArchived": false,
      "sections": [
        {
          "id": 1,
          "name": "Appetizers",
          "position": 0,
          "items": [
            {
              "id": 1,
              "name": "Bruschetta",
              "description": "Toasted bread with tomatoes",
              "price": "8.99",
              "position": 0,
              "recipe": {
                "id": 1,
                "name": "Bruschetta Recipe"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

#### Create Menu
```http
POST /api/menus
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "New Menu",
  "title": "Menu Title",
  "subtitle": "Menu Subtitle",
  "font": "Playfair Display",
  "layout": "single",
  "backgroundColor": "#ffffff",
  "textColor": "#000000"
}
```

#### Update Menu
```http
PUT /api/menus/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Menu Name",
  "title": "Updated Title"
}
```

#### Upload Menu Logo
```http
POST /api/menus/:id/logo
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- logo: [image file]
```

### Reservation Management APIs

#### Staff Reservations

**Base URL**: `/api/reservations`
**Authentication**: Required (Staff JWT)

##### Get All Reservations
```http
GET /api/reservations
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `date` (optional): Filter by date (YYYY-MM-DD)
- `status` (optional): Filter by status (CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)
- `page` (optional): Page number
- `limit` (optional): Results per page

**Response:**
```json
{
  "reservations": [
    {
      "id": 1,
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "+1234567890",
      "partySize": 4,
      "reservationDate": "2024-03-15T00:00:00Z",
      "reservationTime": "19:00",
      "status": "CONFIRMED",
      "notes": "Birthday celebration",
      "specialRequests": "Window table if possible",
      "createdAt": "2024-03-10T10:30:00Z"
    }
  ],
  "totalCount": 15,
  "currentPage": 1
}
```

##### Create Reservation
```http
POST /api/reservations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "+1234567890",
  "partySize": 2,
  "reservationDate": "2024-03-20",
  "reservationTime": "18:30",
  "notes": "Anniversary dinner",
  "specialRequests": "Quiet table"
}
```

##### Update Reservation
```http
PUT /api/reservations/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "CONFIRMED",
  "notes": "Updated notes"
}
```

#### Customer Reservations

**Base URL**: `/api/customer/reservations`
**Authentication**: Required (Customer JWT)

##### Get Customer Reservations
```http
GET /api/customer/reservations
Authorization: Bearer <customer_jwt_token>
```

**Response:**
```json
{
  "reservations": [
    {
      "id": 1,
      "restaurantName": "Restaurant Name",
      "partySize": 2,
      "reservationDate": "2024-03-20T00:00:00Z",
      "reservationTime": "18:30",
      "status": "CONFIRMED",
      "specialRequests": "Window table"
    }
  ]
}
```

##### Create Customer Reservation
```http
POST /api/customer/reservations
Authorization: Bearer <customer_jwt_token>
Content-Type: application/json

{
  "restaurantId": 1,
  "partySize": 2,
  "reservationDate": "2024-03-25",
  "reservationTime": "19:00",
  "specialRequests": "Outdoor seating"
}
```

##### Cancel Customer Reservation
```http
DELETE /api/customer/reservations/:id
Authorization: Bearer <customer_jwt_token>
```

### Ingredient Management APIs

**Base URL**: `/api/ingredients`
**Authentication**: Required (Staff JWT)

#### Get All Ingredients
```http
GET /api/ingredients
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `category` (optional): Filter by ingredient category ID
- `search` (optional): Search term

**Response:**
```json
{
  "ingredients": [
    {
      "id": 1,
      "name": "Tomatoes",
      "description": "Fresh Roma tomatoes",
      "ingredientCategory": {
        "id": 1,
        "name": "Vegetables"
      }
    }
  ]
}
```

#### Create Ingredient
```http
POST /api/ingredients
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "New Ingredient",
  "description": "Ingredient description",
  "ingredientCategoryId": 1
}
```

### Category Management APIs

**Base URL**: `/api/categories`
**Authentication**: Required (Staff JWT)

#### Get All Categories
```http
GET /api/categories
Authorization: Bearer <jwt_token>
```

#### Create Category
```http
POST /api/categories
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "New Category",
  "description": "Category description"
}
```

### Units of Measure APIs

**Base URL**: `/api/units`
**Authentication**: Required (Staff JWT)

#### Get All Units
```http
GET /api/units
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "units": [
    {
      "id": 1,
      "name": "cup",
      "abbreviation": "c",
      "type": "VOLUME"
    },
    {
      "id": 2,
      "name": "ounce",
      "abbreviation": "oz",
      "type": "WEIGHT"
    }
  ]
}
```

#### Create Unit
```http
POST /api/units
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "tablespoon",
  "abbreviation": "tbsp",
  "type": "VOLUME"
}
```

### Prep Management APIs

**Base URL**: `/api/prep-tasks` and `/api/prep-columns`
**Authentication**: Required (Staff JWT)

#### Get Prep Columns
```http
GET /api/prep-columns
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "columns": [
    {
      "id": "uuid-here",
      "name": "To Do",
      "order": 0,
      "color": "#1976d2",
      "tasks": [
        {
          "id": "task-uuid",
          "title": "Prep vegetables",
          "description": "Dice onions and peppers",
          "recipeId": 1,
          "order": 0
        }
      ]
    }
  ]
}
```

#### Create Prep Task
```http
POST /api/prep-tasks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "New Prep Task",
  "description": "Task description",
  "columnId": "column-uuid",
  "recipeId": 1,
  "order": 0
}
```

### Restaurant Settings APIs

**Base URL**: `/api/restaurant`
**Authentication**: Required (Staff JWT)

#### Get Restaurant Settings
```http
GET /api/restaurant/settings
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "restaurant": {
    "id": 1,
    "name": "Restaurant Name",
    "subdomain": "restaurant-name",
    "timezone": "America/New_York",
    "phone": "+1234567890",
    "email": "info@restaurant.com",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "settings": {
      "reservationSettings": {
        "maxPartySize": 8,
        "advanceBookingDays": 30,
        "defaultDurationMinutes": 90
      }
    }
  }
}
```

#### Update Restaurant Settings
```http
PUT /api/restaurant/settings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Restaurant Name",
  "phone": "+1234567890",
  "settings": {
    "reservationSettings": {
      "maxPartySize": 10
    }
  }
}
```

### Website Builder APIs

**Base URL**: `/api/website-builder`
**Authentication**: Required (Staff JWT)

#### Get Website Configuration
```http
GET /api/website-builder/config
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "config": {
    "theme": {
      "primaryColor": "#1976d2",
      "secondaryColor": "#dc004e",
      "backgroundColor": "#ffffff",
      "textColor": "#000000"
    },
    "layout": {
      "headerStyle": "modern",
      "footerStyle": "simple"
    }
  }
}
```

#### Update Website Configuration
```http
PUT /api/website-builder/config
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "theme": {
    "primaryColor": "#2196f3",
    "secondaryColor": "#f44336"
  }
}
```

### Content Blocks APIs

**Base URL**: `/api/content-blocks`
**Authentication**: Required (Staff JWT)

#### Get Content Blocks
```http
GET /api/content-blocks
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "contentBlocks": [
    {
      "id": 1,
      "type": "hero",
      "title": "Welcome to Our Restaurant",
      "content": "Experience fine dining...",
      "imageUrl": "https://cloudinary.com/hero-image.jpg",
      "isActive": true,
      "order": 0
    }
  ]
}
```

#### Create Content Block
```http
POST /api/content-blocks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "type": "text",
  "title": "About Us",
  "content": "Our story begins...",
  "isActive": true,
  "order": 1
}
```

### Platform Admin APIs

**Base URL**: `/api/platform`
**Authentication**: Required (Platform Admin JWT)

#### Platform Authentication

##### Platform Login
```http
POST /api/platform/auth/login
Content-Type: application/json

{
  "email": "admin@kitchensync.app",
  "password": "admin_password"
}
```

**Response:**
```json
{
  "token": "platform_jwt_token",
  "admin": {
    "id": 1,
    "email": "admin@kitchensync.app",
    "role": "SUPER_ADMIN"
  }
}
```

#### Restaurant Management

##### Get All Restaurants
```http
GET /api/platform/restaurants
Authorization: Bearer <platform_jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (ACTIVE, SUSPENDED, PENDING)
- `plan` (optional): Filter by subscription plan
- `page` (optional): Page number
- `limit` (optional): Results per page

**Response:**
```json
{
  "restaurants": [
    {
      "id": 1,
      "name": "Restaurant Name",
      "subdomain": "restaurant-name",
      "email": "owner@restaurant.com",
      "status": "ACTIVE",
      "subscription": {
        "plan": "PROFESSIONAL",
        "status": "ACTIVE",
        "nextBillingDate": "2024-04-01T00:00:00Z"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "totalCount": 25,
  "analytics": {
    "totalRestaurants": 25,
    "activeRestaurants": 23,
    "suspendedRestaurants": 2
  }
}
```

##### Get Restaurant Details
```http
GET /api/platform/restaurants/:id
Authorization: Bearer <platform_jwt_token>
```

##### Update Restaurant
```http
PUT /api/platform/restaurants/:id
Authorization: Bearer <platform_jwt_token>
Content-Type: application/json

{
  "status": "ACTIVE",
  "notes": "Restaurant verified"
}
```

##### Suspend Restaurant
```http
POST /api/platform/restaurants/:id/suspend
Authorization: Bearer <platform_jwt_token>
Content-Type: application/json

{
  "reason": "Payment issues",
  "notes": "Suspended due to failed payment"
}
```

#### Subscription Management

##### Get All Subscriptions
```http
GET /api/platform/subscriptions
Authorization: Bearer <platform_jwt_token>
```

**Response:**
```json
{
  "subscriptions": [
    {
      "id": 1,
      "restaurantId": 1,
      "plan": "PROFESSIONAL",
      "status": "ACTIVE",
      "billingInterval": "MONTHLY",
      "amount": 49.99,
      "nextBillingDate": "2024-04-01T00:00:00Z",
      "restaurant": {
        "name": "Restaurant Name",
        "subdomain": "restaurant-name"
      }
    }
  ]
}
```

##### Create Trial Subscription
```http
POST /api/platform/subscriptions/trial
Authorization: Bearer <platform_jwt_token>
Content-Type: application/json

{
  "restaurantId": 1,
  "trialDays": 14
}
```

### Order Management APIs

**Base URL**: `/api/orders`
**Authentication**: Required (Staff JWT)

#### Get All Orders
```http
GET /api/orders
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by order status
- `type` (optional): Filter by order type (DINE_IN, TAKEOUT, DELIVERY)
- `date` (optional): Filter by date

**Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "orderNumber": "ORD-001",
      "customerName": "John Doe",
      "status": "NEW",
      "orderType": "DINE_IN",
      "totalAmount": 45.50,
      "items": [
        {
          "id": 1,
          "menuItem": {
            "name": "Pasta Carbonara",
            "price": "18.99"
          },
          "quantity": 2,
          "specialInstructions": "Extra cheese"
        }
      ],
      "createdAt": "2024-03-15T18:30:00Z"
    }
  ]
}
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "customerName": "Jane Smith",
  "orderType": "DINE_IN",
  "reservationId": 1,
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "specialInstructions": "No onions"
    }
  ],
  "notes": "Table 5"
}
```

#### Update Order Status
```http
PUT /api/orders/:id/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

## Error Responses

All APIs return consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited:
- **General APIs**: 100 requests per minute per IP
- **Authentication APIs**: 10 requests per minute per IP
- **Platform Admin APIs**: 500 requests per minute per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1647891600
```

## Pagination

APIs that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Webhooks

### Stripe Webhook

**Endpoint**: `/api/platform/webhooks/stripe`
**Method**: `POST`
**Authentication**: Stripe signature verification

Handles subscription events from Stripe:
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## File Uploads

File uploads use multipart/form-data and are handled via Cloudinary:

### Supported File Types
- **Images**: JPG, PNG, WebP (max 10MB)
- **Documents**: PDF (max 5MB)

### Image Upload Response
```json
{
  "url": "https://res.cloudinary.com/account/image/upload/v123/filename.jpg",
  "publicId": "filename",
  "width": 1200,
  "height": 800,
  "format": "jpg",
  "bytes": 245760
}
```

## Real-time Features

KitchenSync uses WebSocket connections for real-time updates:

### Connection
```javascript
const socket = io('wss://api.kitchensync.restaurant', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

### Events
- `order:created` - New order received
- `order:updated` - Order status changed
- `reservation:created` - New reservation
- `reservation:updated` - Reservation modified
- `prep:task_updated` - Prep task status changed

## SDKs and Libraries

### JavaScript/TypeScript Client

```bash
npm install @kitchensync/api-client
```

```javascript
import { KitchenSyncClient } from '@kitchensync/api-client';

const client = new KitchenSyncClient({
  baseURL: 'https://api.kitchensync.restaurant',
  token: 'your_jwt_token'
});

// Get recipes
const recipes = await client.recipes.getAll();

// Create reservation
const reservation = await client.reservations.create({
  customerName: 'John Doe',
  partySize: 4,
  reservationDate: '2024-03-20',
  reservationTime: '19:00'
});
```

## Support and Resources

- **Documentation**: [https://docs.kitchensync.restaurant](https://docs.kitchensync.restaurant)
- **Support**: [support@kitchensync.restaurant](mailto:support@kitchensync.restaurant)
- **Status Page**: [https://status.kitchensync.restaurant](https://status.kitchensync.restaurant)
- **GitHub**: [https://github.com/kitchensync/api](https://github.com/kitchensync/api)

## Changelog

### v3.4.0 (Current)
- Added customer authentication system
- Enhanced website builder with advanced theming
- Improved multi-tenant support
- Added platform admin analytics

### v3.3.0
- Added order management system
- Enhanced prep board functionality
- Improved real-time features
- Added Stripe webhook support

### v3.2.0
- Added website builder module
- Enhanced menu customization
- Added content block management
- Improved mobile responsiveness

For complete changelog, see [CHANGELOG.md](../CHANGELOG.md)