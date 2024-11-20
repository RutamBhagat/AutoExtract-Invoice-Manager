# PRD: Automated Data Extraction and Management for Invoices, Products, and Customers

## TL;DR

Develop a **React-based application** for **Swipe** that automates the extraction and management of invoice data from diverse file types (Excel, PDF, images). The app will organize extracted information into **Invoices**, **Products**, and **Customers** tabs, with real-time updates using **zustand** for centralized state management. It will also include validation, user feedback, and error handling to ensure a smooth experience.

---

## Goals

### Business Goals

1. **Streamline Data Management**: Automate the tedious process of manually organizing invoice data to improve productivity and reduce errors.
2. **Enhance User Experience**: Provide users with a dynamic and user-friendly interface for managing invoice, product, and customer data.
3. **Enable Real-time Data Sync**: Ensure updates made in one part of the app are reflected across all relevant sections immediately.
4. **Leverage Cutting-edge AI**: Use AI solutions for seamless data extraction and processing.

### User Goals

1. **Simplify Data Entry**: Allow users to upload multiple file types and extract relevant data accurately.
2. **Centralize Data Access**: Enable users to view and edit invoice, product, and customer data in one place.
3. **Ensure Data Accuracy**: Provide robust validation and error handling mechanisms for incomplete or invalid data.

### Non-Goals

1. Building a custom AI solution for data extraction (will leverage external APIs like Google Gemini).
2. Supporting file formats outside of Excel, PDF, or image types.
3. Providing offline support for data extraction.

---

## User Stories

### Core User Stories

1. **File Upload and Extraction**:

   - As a user, I want to upload Excel, PDF, or image files, so that I can extract invoice, product, and customer data.
   - As a user, I want the app to organize extracted data into relevant tabs, so that I can easily manage it.

2. **Invoices Tab**:

   - As a user, I want to see all invoice details (serial number, customer name, product, quantity, tax, total, date), so that I can quickly review transactions.
   - As a user, I want to edit invoice details directly, so that I can fix extraction errors or update data.

3. **Products Tab**:

   - As a user, I want to view all product details (name, quantity, price, tax, etc.) in a table, so that I can understand inventory and pricing details.
   - As a user, I want updates made here to reflect immediately in the invoices tab.

4. **Customers Tab**:

   - As a user, I want to view customer details (name, phone, total purchases), so that I can analyze customer behavior.
   - As a user, I want to add missing fields, so that I can maintain accurate customer records.

5. **Error Handling and Validation**:

   - As a user, I want the app to highlight incomplete data and provide prompts for corrections, so that I can ensure data integrity.

6. **Real-time Updates**:
   - As a user, I want changes made in one section (e.g., Products) to reflect dynamically across related sections (e.g., Invoices), so that the data remains consistent.

---

## Pages and Features

### 1. **Home Page**

- **Purpose**: Provide a starting point for file uploads and quick navigation to tabs.
- **Key Features**:
  - File upload drag-and-drop zone.
  - Progress bar for file uploads and extraction.
  - Error messages for unsupported file formats.
  - Links to "Invoices", "Products", and "Customers" tabs.
- **Libraries**:
  - [`react-dropzone`](https://www.npmjs.com/package/react-dropzone) for drag-and-drop file uploads.
  - [`react-toastify`](https://www.npmjs.com/package/react-toastify) for notifications (e.g., errors, upload success).

### 2. **Invoices Tab**

- **Purpose**: Display extracted invoice data in a table.
- **Key Features**:
  - Editable table with fields for:
    - Serial Number
    - Customer Name
    - Product Name
    - Quantity
    - Tax
    - Total Amount
    - Date
  - Inline editing for individual fields.
  - Pagination and sorting options.
- **Libraries**:
  - [`ag-grid-react`](https://www.ag-grid.com/react-grid/) for advanced table functionality (sorting, filtering, inline edits).
  - [`date-fns`](https://date-fns.org/) for date parsing and formatting.

### 3. **Products Tab**

- **Purpose**: Manage product details extracted from invoices.
- **Key Features**:
  - Editable table with fields for:
    - Name
    - Quantity
    - Unit Price
    - Tax
    - Price with Tax
    - Discount (optional)
  - Inline editing with validations for numeric fields.
  - Real-time data sync with the Invoices tab.
- **Libraries**:
  - [`react-table`](https://react-table.tanstack.com/) for lightweight table rendering.
  - [`yup`](https://www.npmjs.com/package/yup) for schema validation.

### 4. **Customers Tab**

- **Purpose**: Display and manage customer details.
- **Key Features**:
  - Editable table with fields for:
    - Customer Name
    - Phone Number
    - Total Purchase Amount
  - Add additional fields (e.g., Email, Address).
  - Highlight missing or invalid fields.
- **Libraries**:
  - [`material-ui`](https://mui.com/) for rich UI components like tables and dialogs.

### 5. **Settings/Documentation Page**

- **Purpose**: Provide guidance on file formats, AI extraction, and other app functionalities.
- **Key Features**:
  - API usage documentation for AI integration.
  - Sample data links.
- **Libraries**:
  - Markdown rendering with [`react-markdown`](https://www.npmjs.com/package/react-markdown).

---

## Narrative

Swipe’s customers are overwhelmed with manually managing invoice data from varied sources, leading to inefficiencies and errors. By leveraging an AI-driven extraction solution, this app transforms manual work into an automated, reliable process. The intuitive React interface ensures users can effortlessly manage invoices, products, and customers, with real-time updates ensuring consistency.

Imagine uploading a mix of PDFs and Excel files, then seeing all data neatly organized into interactive tables in seconds. As a user updates product prices, the changes instantly reflect in invoices—no additional work required. This app empowers users with a seamless, accurate, and dynamic data management experience, freeing them to focus on growing their business.

---

## Success Metrics

1. **Functional Metrics**:
   - 95% accuracy in AI-based data extraction.
   - Real-time synchronization with a latency of <200ms for state updates.
2. **User Metrics**:
   - 80% of users rate the app as "easy to use" in post-deployment surveys.
   - 20% reduction in time spent on invoice management tasks.
3. **Operational Metrics**:
   - Error rate for data extraction reduced to <5%.
   - <1% crash rate for the deployed app.

---

## Technical Considerations

1. **AI Integration**:
   - Use Google Gemini API for document and vision processing.
   - Ensure API responses are cached locally for faster subsequent processing.
2. **File Upload Handling**:
   - Restrict uploads to supported formats and validate them before processing.
3. **State Management**:
   - Use zustand Toolkit for cleaner state management code.
   - Consider middleware like zustand-Saga for asynchronous tasks.

---

## Estimated Milestones and Sequencing

1. **Day 1–2**: Initial setup, including React, zustand, and UI components.
2. **Day 3–4**: AI integration for data extraction and file upload handling.
3. **Day 5**: Implement Invoices, Products, and Customers tabs with tables and validations.
4. **Day 6**: Real-time updates and zustand integration.
5. **Day 7**: Final testing, error handling, and deployment.

---
