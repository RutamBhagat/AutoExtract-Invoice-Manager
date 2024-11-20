# Assignment: Automated Data Extraction and Management for Invoices, Products, and Customers

## Overview

Develop a **React application** for **Swipe** that automates the extraction, processing, and management of invoice data from various file formats. The app will organize the extracted data into three main sections: **Invoices**, **Products**, and **Customers**, and synchronize changes in real-time using **zustand**.

---

## Assignment Requirements

### 1. File Uploads, AI-Powered Data Extraction, and Organization

- Accept the following file types as input:
  - **Excel files**: Contains transaction details (serial number, net/total amount, customer info).
  - **PDF/Images**: Invoices with customer and item details, totals, tax, etc.
- Implement a generic **AI-based extraction solution** for all file types (Excel, PDF, images) to identify and organize relevant data into the appropriate tabs (**Invoices**, **Products**, **Customers**).
- Dataset link: [assignment_test_cases](https://drive.google.com/drive/folders/1k4Cz1YX39cU47yU--TG6GpKbhhXvhZLk?usp=sharing)

### 2. React App Structure with Tabs

#### **Invoices Tab**

- Display a table with the following columns:
  - Serial Number
  - Customer Name
  - Product Name
  - Quantity
  - Tax
  - Total Amount
  - Date
- Additional columns are optional.

#### **Products Tab**

- Display a table with the following columns:
  - Name
  - Quantity
  - Unit Price
  - Tax
  - Price with Tax
- Optional column: **Discount** for additional detail.

#### **Customers Tab**

- Display a table with the following columns:
  - Customer Name
  - Phone Number
  - Total Purchase Amount
- Additional fields are allowed for more comprehensive customer data.
- **Bonus points** for including additional data fields.

### 3. Centralized State Management

- Use **React zustand** for centralized state management:
  - Ensure consistent data handling across the app.
  - Dynamically update values in real-time across all tabs. For example:
    - If a **Product Name** is updated in the Products tab, the change should reflect instantly in the corresponding entry within the **Invoices tab**.

### 4. Validation and Error Handling

- **Data Validation**: Ensure extracted data is complete and accurate.
- **User Feedback**: Provide clear feedback for:
  - Unsupported file formats.
  - Extraction errors.
- **Handling Missing Fields**:
  - Highlight missing fields.
  - Prompt users to complete them in a user-friendly manner.

### 5. Code Quality and Documentation

- Follow **React/zustand best practices** to maintain modular, well-documented code.
- Include documentation for the **AI data extraction feature**.
- Provide evidence of solved test cases with screenshots or videos.

---

## AI Test Cases

- Use the dataset: [assignment_test_cases](https://drive.google.com/drive/folders/1k4Cz1YX39cU47yU--TG6GpKbhhXvhZLk?usp=sharing)
- Test cases:
  1. **Invoice PDFs**
  2. **Invoice PDFs + Images**
  3. **Excel File**
  4. **Multiple Excel Files**
  5. **All File Types**

The goal is to extract **Invoice**, **Product**, and **Customer** details and update the respective tabs dynamically for each test case using a **generic AI-based solution**.

- Handle cases with missing information:
  - Highlight missing details in the app.
  - Provide clear prompts to the user.

---

## Resources

We recommend using **Google Gemini** for solving this assignment:

- [Explore document processing capabilities with the Gemini API](https://ai.google.dev/gemini-api/docs/document-processing?lang=python)
- [Explore vision capabilities with the Gemini API](https://ai.google.dev/gemini-api/docs/vision?lang=python)

You may choose to implement any solution of your choice.

---

## Submission Instructions

1. **GitHub Repository**:
   - Push your code to a public GitHub repository.
2. **Deployment**:
   - Deploy the app on a free platform (e.g., [Vercel](https://vercel.com), [Netlify](https://www.netlify.com)).
3. **Submission**:
   - Complete the submission form: [Submission Form](https://forms.gle/e8vGCsickX5nJJuUA)

---

We look forward to seeing your approach to this real-world project!
