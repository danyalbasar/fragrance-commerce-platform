# Database Design

## Roles
- SuperAdmin
- Admin
- Vendor
- Customer

## Core Tables

### Users
Stores login and profile details.

### Roles
Stores system roles.

### UserRoles
Maps users to roles.

### Vendors
Stores vendor/business details.

### Brands
Stores product brands like Dior, Chanel, Lakme, etc.

### Categories
Stores product categories like Perfumes, Makeup, Skincare.

### Products
Stores product details and links each product to a vendor, brand, and category.

### ProductImages
Stores product image URLs.

### Carts
Stores customer cart.

### CartItems
Stores products inside cart.

### Orders
Stores order header details.

### OrderItems
Stores products inside an order.

### InventoryTransactions
Tracks stock movement: purchase, sale, return, adjustment.

### AuditLogs
Tracks important actions for security and traceability.

------------------------------------------------

## Table Relationships

Users
- One user can have many roles through UserRoles.
- One user can become one vendor.
- One customer can have one cart.
- One customer can place many orders.

Vendors
- One vendor can have many products.
- One vendor can receive many orders through order items.

Brands
- One brand can have many products.

Categories
- One category can have many products.
- A category can have a parent category.

Products
- One product belongs to one vendor.
- One product belongs to one category.
- One product belongs to one brand.
- One product can have many images.
- One product can have many inventory transactions.

Orders
- One order belongs to one customer.
- One order has many order items.

Cart
- One cart belongs to one customer.
- One cart has many cart items.