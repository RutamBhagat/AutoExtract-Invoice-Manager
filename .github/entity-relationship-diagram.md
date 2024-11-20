## Entity Relationship Diagram (ERD) and Supporting Documentation for Swipe's Invoice Management Application

Based on the provided PRD and technical documentation, the following ERD and supporting documentation outline the database design for Swipe's invoice management application.

**1. ERD Diagram:**

```
    Invoice                      Product                     Customer
    ------------------          ------------------        ------------------
    invoice_id (PK)           product_id (PK)          customer_id (PK)
    serial_number             name                      name
    date                      quantity                  phone_number
    total_amount              unit_price                total_purchase_amount
    tax                       tax                       email (optional)
    created_at                price_with_tax            address (optional)
    updated_at                discount (optional)       created_at
                                created_at                updated_at
                                updated_at

    Invoice_Product
    ------------------
    invoice_id (FK)
    product_id (FK)
    quantity

    Invoice_Customer
    ------------------
    invoice_id (FK)
    customer_id (FK)

    Relationships:
    - Invoice *--1 Customer (One-to-many: An invoice belongs to one customer)
    - Invoice 1--* Product (One-to-many through Invoice_Product: An invoice can have multiple products)

```

**2. Supporting Documentation:**

**2.1 Entity Descriptions:**

- **Invoice:** Represents a single transaction. Contains overall information like the serial number, date, total amount, and applicable tax. Links to the customer and the products involved in the transaction.
- **Product:** Represents a product sold by Swipe. Contains details about the product's name, available quantity, unit price, tax rate, calculated price with tax, and any applicable discount.
- **Customer:** Represents a customer of Swipe. Stores information such as the customer's name, phone number, total purchase amount, and optionally email and address.
- **Invoice_Product:** A junction table to represent the many-to-many relationship between invoices and products. It also stores the quantity of each product in a specific invoice.
- **Invoice_Customer:** A junction table to represent the relationship between invoices and customers. This was introduced to simplify queries and ensure data integrity, even though it's a one-to-many relationship.

**2.2 Attribute Details:**

| Entity           | Attribute             | Data Type     | Constraints                                |
| ---------------- | --------------------- | ------------- | ------------------------------------------ |
| Invoice          | invoice_id            | INT           | Primary Key, Auto-increment                |
|                  | serial_number         | VARCHAR(255)  | Unique, Not Null                           |
|                  | date                  | DATE          | Not Null                                   |
|                  | total_amount          | DECIMAL(10,2) | Not Null                                   |
|                  | tax                   | DECIMAL(5,2)  |                                            |
|                  | created_at            | TIMESTAMP     | Default: CURRENT_TIMESTAMP                 |
|                  | updated_at            | TIMESTAMP     | On Update: CURRENT_TIMESTAMP               |
| Product          | product_id            | INT           | Primary Key, Auto-increment                |
|                  | name                  | VARCHAR(255)  | Not Null                                   |
|                  | quantity              | INT           |                                            |
|                  | unit_price            | DECIMAL(10,2) |                                            |
|                  | tax                   | DECIMAL(5,2)  |                                            |
|                  | price_with_tax        | DECIMAL(10,2) |                                            |
|                  | discount              | DECIMAL(5,2)  |                                            |
|                  | created_at            | TIMESTAMP     | Default: CURRENT_TIMESTAMP                 |
|                  | updated_at            | TIMESTAMP     | On Update: CURRENT_TIMESTAMP               |
| Customer         | customer_id           | INT           | Primary Key, Auto-increment                |
|                  | name                  | VARCHAR(255)  | Not Null                                   |
|                  | phone_number          | VARCHAR(20)   |                                            |
|                  | total_purchase_amount | DECIMAL(15,2) |                                            |
|                  | email                 | VARCHAR(255)  |                                            |
|                  | address               | TEXT          |                                            |
|                  | created_at            | TIMESTAMP     | Default: CURRENT_TIMESTAMP                 |
|                  | updated_at            | TIMESTAMP     | On Update: CURRENT_TIMESTAMP               |
| Invoice_Product  | invoice_id            | INT           | Foreign Key referencing Invoice, Not Null  |
|                  | product_id            | INT           | Foreign Key referencing Product, Not Null  |
|                  | quantity              | INT           | Not Null                                   |
| Invoice_Customer | invoice_id            | INT           | Foreign Key referencing Invoice, Not Null  |
|                  | customer_id           | INT           | Foreign Key referencing Customer, Not Null |

**2.3 Indices:**

- **Invoice:** Index on `serial_number`, `date`, `customer_id` (For efficient lookups)
- **Product:** Index on `name`
- **Customer:** Index on `name`, `phone_number`

**2.4 Business Rules and Constraints:**

- An invoice must be associated with a customer.
- An invoice can have multiple products.
- Product quantities in the Invoice_Product table must be greater than zero.
- Total amount on an invoice should be the sum of the price_with_tax \* quantity for all products associated with that invoice.

**3. Assumptions Made:**

- The AI-powered data extraction process handles data type conversions and cleaning.
- The application requires real-time updates, which are handled by Zustand and potentially websockets for immediate UI updates.
- Soft deletes are not explicitly required but are generally a good practice and could be implemented with a "deleted_at" timestamp field on each table.

**4. Areas Requiring Further Clarification:**

- Details about specific data validation rules beyond basic not null constraints.
- Specific performance requirements, which could influence indexing and database choice.
- Requirements for handling partial data extraction failures. Should incomplete invoices be stored, or should the user be prompted to fix the input files?
- Archiving strategy for old invoices.

**5. Potential Future Considerations:**

- Implementing a robust search functionality across all entities.
- Adding more detailed product information like descriptions, categories, and SKUs.
- Implementing customer segmentation or tagging for marketing purposes.
- Integrating with other systems like accounting software.
- Adding support for multiple currencies and tax jurisdictions.

This detailed ERD and documentation provide a comprehensive foundation for developing Swipe's invoice management application. Addressing the areas requiring clarification will further refine the design and ensure it meets all business and technical requirements. The future considerations offer pathways to expand the application's functionality and value over time.
