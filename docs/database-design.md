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

---

## Detailed Table Design

### Users
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| FirstName | VARCHAR(100) | Required |
| LastName | VARCHAR(100) | Required |
| Email | VARCHAR(255) | Required, unique |
| PasswordHash | TEXT | Required |
| PhoneNumber | VARCHAR(20) | Optional |
| IsActive | BOOLEAN | Default true |
| CreatedAt | TIMESTAMP | Default current timestamp |
| UpdatedAt | TIMESTAMP | Optional |

### Roles
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| Name | VARCHAR(50) | Required, unique |

### UserRoles
| Column | Type | Notes |
|---|---|---|
| UserId | UUID | Foreign key to Users |
| RoleId | UUID | Foreign key to Roles |

Primary key: `(UserId, RoleId)`

### Vendors
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| UserId | UUID | Foreign key to Users |
| BusinessName | VARCHAR(200) | Required |
| GSTNumber | VARCHAR(50) | Optional |
| Address | TEXT | Optional |
| IsApproved | BOOLEAN | Default false |
| CreatedAt | TIMESTAMP | Default current timestamp |

### Brands
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| Name | VARCHAR(150) | Required, unique |
| Description | TEXT | Optional |
| LogoUrl | TEXT | Optional |

### Categories
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| Name | VARCHAR(150) | Required |
| Description | TEXT | Optional |
| ParentCategoryId | UUID | Optional self-reference |

### Products
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| VendorId | UUID | Foreign key to Vendors |
| BrandId | UUID | Foreign key to Brands |
| CategoryId | UUID | Foreign key to Categories |
| Name | VARCHAR(200) | Required |
| Description | TEXT | Optional |
| SKU | VARCHAR(100) | Required, unique |
| Price | DECIMAL(18,2) | Required |
| StockQuantity | INT | Default 0 |
| IsActive | BOOLEAN | Default true |
| CreatedAt | TIMESTAMP | Default current timestamp |
| UpdatedAt | TIMESTAMP | Optional |

### ProductImages
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| ProductId | UUID | Foreign key to Products |
| ImageUrl | TEXT | Required |
| DisplayOrder | INT | Default 0 |
| IsPrimary | BOOLEAN | Default false |

### Carts
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| UserId | UUID | Foreign key to Users |
| CreatedAt | TIMESTAMP | Default current timestamp |
| UpdatedAt | TIMESTAMP | Optional |

### CartItems
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| CartId | UUID | Foreign key to Carts |
| ProductId | UUID | Foreign key to Products |
| Quantity | INT | Required |

### Orders
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| UserId | UUID | Foreign key to Users |
| OrderNumber | VARCHAR(50) | Required, unique |
| TotalAmount | DECIMAL(18,2) | Required |
| Status | VARCHAR(50) | Pending, Paid, Shipped, Delivered, Cancelled |
| CreatedAt | TIMESTAMP | Default current timestamp |

### OrderItems
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| OrderId | UUID | Foreign key to Orders |
| ProductId | UUID | Foreign key to Products |
| VendorId | UUID | Foreign key to Vendors |
| Quantity | INT | Required |
| UnitPrice | DECIMAL(18,2) | Required |
| TotalPrice | DECIMAL(18,2) | Required |

### InventoryTransactions
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| ProductId | UUID | Foreign key to Products |
| Type | VARCHAR(50) | Purchase, Sale, Return, Adjustment |
| Quantity | INT | Required |
| PreviousStock | INT | Required |
| NewStock | INT | Required |
| Remarks | TEXT | Optional |
| CreatedAt | TIMESTAMP | Default current timestamp |

### AuditLogs
| Column | Type | Notes |
|---|---|---|
| Id | UUID | Primary key |
| UserId | UUID | Foreign key to Users |
| Action | VARCHAR(100) | Example: ProductCreated |
| EntityName | VARCHAR(100) | Example: Product |
| EntityId | UUID | Affected record ID |
| Details | TEXT | Optional |
| CreatedAt | TIMESTAMP | Default current timestamp |