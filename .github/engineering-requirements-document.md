# Engineering Requirements Document: Automated Invoice Processing Application for Swipe

This document outlines the engineering requirements for the automated invoice processing application for Swipe.

## 1. System Overview

This application automates invoice data extraction, processing, and management from various file formats (Excel, PDF, images) using AI-powered extraction. The extracted data is organized into Invoices, Products, and Customers sections within a **Next.js 15 App Router** application, with real-time synchronization using Zustand. Styling will be done with **Tailwind CSS**, and UI components will be sourced from the **shadcn component library**. Tables will specifically use **shadcn table components**.

### Major Components and Interactions

- **File Upload Component:** Handles user file uploads (Excel, PDF, image).
- **Data Extraction Service:** Utilizes the Google Gemini API for extracting data from uploaded files.
- **Data Processing Layer:** Manages data transformation, validation, and synchronization using Zustand. May include a backend (tRPC) for complex operations or persistent storage (this is **optional**).
- **Data Presentation Components:** React components for displaying Invoices, Products, and Customers data in tabular format (using **shadcn tables**), enabling editing and real-time updates.
- **Database (Optional):** For persistent data storage (e.g., Prisma with a PostgreSQL database).
- **File Storage:**  Gemini File API.

### Technical Constraints and Limitations

- **File Size Limits:** Dependent on the Gemini API.
- **Gemini API Rate Limits:** Need to handle API limits and implement retry mechanisms.
- **Supported File Formats:** Currently limited to Excel, PDF, and common image formats.

### Technology Stack

- **Frontend:** Next.js 15 App Router, React, Zustand, **Tailwind CSS**, **shadcn UI component library**, tRPC (optional)
- **Backend (Optional):** Node.js, tRPC, Prisma, PostgreSQL (if implementing a backend)
- **AI/Data Extraction:** Google Gemini API
- **File Storage:** Gemini File API

## 2. Functional Requirements Breakdown

### File Upload

- **Endpoint:** `/api/upload` (if using tRPC) or handled directly in the frontend.
- **Method:** `POST`
- **Request Format:** `multipart/form-data`
- **Response Format:** JSON containing file URI, status, and any error messages.
- **Input Validation:** File type, size.
- **Error Handling:** Display user-friendly error messages for invalid files or upload failures.

### Data Extraction

- **Gemini API Integration:** Use the Document and Vision APIs as appropriate.
- **Data Mapping:** Define clear mapping between extracted data and application data models.
- **Error Handling:** Handle API errors, potentially retrying requests or prompting user intervention.

## Assignment Requirements (Emphasized Required Fields)

### File Uploads, AI-Powered Data Extraction, and Organization

- Accept the following file types as input:
  - **Excel files**: Contains transaction details (serial number, net/total amount, customer info).
  - **PDF/Images**: Invoices with customer and item details, totals, tax, etc.
- Implement a generic **AI-based extraction solution** (using Google Gemini) for all file types (Excel, PDF, images) to identify and organize relevant data into the appropriate tabs (**Invoices**, **Products**, **Customers**).
- Dataset link: [assignment_test_cases](https://drive.google.com/drive/folders/1k4Cz1YX39cU47yU--TG6GpKbhhXvhZLk?usp=sharing)

### React App Structure with Tabs

#### **Invoices Tab** (**Required Fields**):

- Display a table (using **shadcn table components**) with the **following mandatory columns**:
  - **Serial Number** 
  - **Customer Name**
  - **Product Name**
  - **Quantity**
  - **Tax**
  - **Total Amount**
  - **Date**
- Additional columns are optional.

#### **Products Tab** (**Required Fields**):

- Display a table (using **shadcn table components**) with the **following mandatory columns**:
  - **Name** 
  - **Quantity**
  - **Unit Price**
  - **Tax**
  - **Price with Tax** 
- Optional column: **Discount** for additional detail.

#### **Customers Tab** (**Required Fields**):

- Display a table (using **shadcn table components**) with the **following mandatory columns**:
  - **Customer Name**
  - **Phone Number**
  - **Total Purchase Amount**
- Additional fields are allowed for more comprehensive customer data.
- **Bonus points** for including additional data fields.



## 4. Integration Requirements

- **Gemini API:** Integration with Document and Vision APIs.
- **File Storage:** Integration with Gemini File API.
- **Database (Optional):** Integration with chosen database (e.g., PostgreSQL) if using a backend.



## 6. Data Requirements

### Data Validation

- Implement robust data validation to ensure the completeness and accuracy of extracted data.
- Validation rules should include:
    - **Data Types:** Verify that extracted values match the expected data types (e.g., numbers, strings, dates).
    - **Required Fields:** Ensure that all mandatory fields (as specified for each tab) are populated.
    - **Format Checks:** Validate data formats (e.g., email addresses, phone numbers, dates).
    - **Range Checks:** Verify that numerical values fall within acceptable ranges (e.g., quantity should be positive).
- Clearly highlight missing or invalid data in the UI and provide user-friendly prompts for correction.

### Database Design (Optional)

- **Tables:** Design tables for Invoices, Products, and Customers (if implementing a backend).
- **Relationships:** Establish relationships between tables to reflect data associations (e.g., an Invoice can have multiple Products, a Customer can have multiple Invoices).
- **Indexes:** Implement appropriate indexes for efficient data retrieval.



## 9. Timeline & Milestones

- **Phase 1 (Day 1):**
    - Project setup (**Next.js 15 App Router** app, state management with Zustand, install **Tailwind CSS and shadcn**).
    - Basic UI implementation with tabs (using **shadcn components**).
    - File upload functionality.
    - Initial integration with Gemini API for basic data extraction.
- **Phase 2 (Day 2):**
    - Refine data extraction logic using Gemini Document and Vision APIs.
    - Implement data processing and transformation based on extracted data.
    - Implement data validation rules and error handling.
    - Integrate Zustand for centralized state management.
- **Phase 3 (Day 3):**
    - Develop the Invoices, Products, and Customers tabs with table displays (using **shadcn tables**).
    - Implement real-time data synchronization across tabs using Zustand.
    - Address UI/UX refinements for user-friendliness.

**(Detailed breakdown of requirements, acceptance criteria, dependencies, priority, estimated effort, and technical risks will be added as the project progresses and more specific information becomes available.)**