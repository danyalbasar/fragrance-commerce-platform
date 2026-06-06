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