
### Major Components and Interactions

- **File Upload Component:** Handles user file uploads (Excel, PDF, image).
- **Data Extraction Service:** Utilizes the Google Gemini API for extracting data from uploaded files.
- **Data Processing Layer:** Manages data transformation, validation, and synchronization using Zustand. May include a backend (tRPC) for complex operations or persistent storage (this is **optional**).
- **Data Presentation Components:** React components for displaying Invoices, Products, and Customers data in tabular format, enabling editing and real-time updates.
- **Database (Optional):** For persistent data storage (e.g., Prisma with a PostgreSQL database).
- **File Storage:** Temporary storage for uploaded files before and after processing (potentially using the Gemini File API's temporary storage).

### Technical Constraints and Limitations

- **File Size Limits:** Dependent on the Gemini API and chosen file storage solution.
- **Gemini API Rate Limits:** Need to handle API limits and implement retry mechanisms.
- **Supported File Formats:** Currently limited to Excel, PDF, and common image formats.

### Technology Stack

- **Frontend:** React, Zustand, Tailwind CSS, tRPC (optional)
- **Backend (Optional):** Node.js, tRPC, Prisma, PostgreSQL (if implementing a backend)
- **AI/Data Extraction:** Google Gemini API
- **File Storage:** Gemini File API or cloud storage (e.g., AWS S3, Google Cloud Storage)

## 2. Functional Requirements Breakdown

### File Upload (This step might vary, prefer Gemini File API over this approach)

- **Endpoint:** `/api/upload` (if using tRPC) or handled directly in the frontend.
- **Method:** `POST`
- **Request Format:** `multipart/form-data`
- **Response Format:** JSON containing file URI, status, and any error messages.
- **Input Validation:** File type, size.
- **Error Handling:** Display user-friendly error messages for invalid files or upload failures using sonner toast.

### Data Extraction

- **Gemini API Integration:** Use the Document and Vision APIs as appropriate.
- **Data Mapping:** Define clear mapping between extracted data and application data models.
- **Error Handling:** Handle API errors, potentially retrying requests or prompting user intervention.

## Assignment Requirements (Emphasized Required Fields)

### File Uploads, AI-Powered Data Extraction, and Organization

- Accept the following file types as input:
  - **Excel files**: Contains transaction details (serial number, net/total amount, customer info).
  - **PDF/Images**: Invoices with customer and item details, totals, tax, etc.
- Implement a generic **AI-based extraction solution** (preferably using Google Gemini, see the provided docs for Gemini document processing and vision API) for all file types (Excel, PDF, images) to identify and organize relevant data into the appropriate tabs (**Invoices**, **Products**, **Customers**).
- Dataset link: [assignment_test_cases](https://drive.google.com/drive/folders/1k4Cz1YX39cU47yU--TG6GpKbhhXvhZLk?usp=sharing)

### React App Structure with Tabs

#### **Invoices Tab** (**Required Fields**):

- Display a table with the **following mandatory columns**:
  - **Serial Number** 
  - **Customer Name**
  - **Product Name**
  - **Quantity**
  - **Tax**
  - **Total Amount**
  - **Date**
- Additional columns are optional.

#### **Products Tab** (**Required Fields**):

- Display a table with the **following mandatory columns**:
  - **Name** 
  - **Quantity**
  - **Unit Price**
  - **Tax**
  - **Price with Tax** 
- Optional column: **Discount** for additional detail.

#### **Customers Tab** (**Required Fields**):

- Display a table with the **following mandatory columns**:
  - **Customer Name**
  - **Phone Number**
  - **Total Purchase Amount**
- Additional fields are allowed for more comprehensive customer data.
- **Bonus points** for including additional data fields.

## 3. Non-Functional Requirements

### Performance

- **Response Time:** File upload and data extraction < 5 seconds for average files. Data display and updates < 200ms.
- **Throughput:** Handle concurrent uploads and processing for multiple users.
- **Concurrent Users:** Support at least 50 concurrent users.

### Scalability

- **Growth Projections:** Assume 10x growth in users and data volume within the next year.
- **Scaling Strategy:** Primarily horizontal scaling for the backend (if applicable) and database.

### Security

- **Authentication:** Implement user authentication (e.g., using NextAuth.js) to protect sensitive data.
- **Authorization:** Control access to data based on user roles.
- **Data Encryption:** Encrypt sensitive data at rest and in transit.
- **Compliance:** Adhere to relevant data privacy regulations (e.g., GDPR).

### Reliability

- **Availability:** Target 99.9% uptime.
- **Backup and Recovery:** Implement regular backups of data and files.
- **Failover:** Design for redundancy in critical components.

## 4. Integration Requirements

- **Gemini API:** Integration with Document and Vision APIs.
- **File Storage:** Integration with chosen storage solution (e.g., Gemini File API, AWS S3).
- **Database (Optional):** Integration with chosen database (e.g., PostgreSQL) if using a backend.

## 5. Development & Testing

### Development Environment

- Node.js, npm/yarn, React development tools.
- Local development server.
- Access to Google Cloud Project and Gemini API credentials.

### Build and Deployment

- Automated build process using a CI/CD pipeline (e.g., GitHub Actions, Vercel).
- Deployment to a serverless platform like Vercel or Netlify.

### Testing Strategy

- **Unit Tests:** Cover individual components and functions.
- **Integration Tests:** Test interactions between components and external APIs (especially Gemini API).
- **End-to-End Tests:** Simulate user workflows and ensure all components work together correctly.
- **AI Extraction Accuracy Testing:**  Crucial to verify the correctness of data extracted by the AI. Define metrics for accuracy, use a benchmark dataset with expected outputs, and perform manual verification.
- **Performance Tests:** Measure response times, throughput, and resource utilization under load.
- **Security Tests:** Penetration testing and vulnerability scanning.

### Code Quality

- Linting and code formatting using ESLint and Prettier.
- Code reviews before merging changes.

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

### Data Migration (If Applicable)

- Plan for migrating existing data to the new system if transitioning from a legacy system.

### Data Retention

- Define policies for data retention and archival based on business requirements and legal obligations.

## 7. Deployment & Operations

### Deployment Architecture

- Serverless deployment on Vercel or a similar platform is recommended for ease of scalability and management.

### Infrastructure

- Cloud-based infrastructure provided by the chosen deployment platform.

### Monitoring and Logging

- Implement logging to track application events, errors, and user activities.
- Use a monitoring service (e.g., Datadog, Sentry) to monitor application performance, identify issues, and receive alerts.
- Log important events like file uploads, extraction results, and data updates.

## 8. Technical Constraints & Assumptions

- **Reliance on External APIs:** The application's functionality depends on the availability and performance of the Gemini API.
- **Gemini API Rate Limits:** Consider potential rate limits imposed by the Gemini API and implement mechanisms to handle them (e.g., retry logic, exponential backoff).

## 9. Timeline & Milestones

- **Phase 1 (Day 1):**
    - Project setup (React app, state management with Zustand).
    - Basic UI implementation with tabs.
    - File upload functionality using React Dropzone.
    - Initial integration with Gemini API for basic data extraction.
- **Phase 2 (Day 2):**
    - Refine data extraction logic using Gemini Document and Vision APIs.
    - Implement data processing and transformation based on extracted data.
    - Implement data validation rules and error handling.
    - Integrate Zustand for centralized state management.
- **Phase 3 (Day 3):**
    - Develop the Invoices, Products, and Customers tabs with table displays.
    - Implement real-time data synchronization across tabs using Zustand.
    - Address UI/UX refinements for user-friendliness.
- **Phase 4 (Day 4):**
    - Thorough testing (unit, integration, end-to-end, AI extraction accuracy, performance, security).
    - Bug fixes and refinements based on testing results.
    - Final code review and deployment to the chosen platform (e.g., Vercel).

**(Detailed breakdown of requirements, acceptance criteria, dependencies, priority, estimated effort, and technical risks will be added as the project progresses and more specific information becomes available.)**

This document serves as a comprehensive guide for the development team to ensure a successful implementation of the automated invoice processing application. Regular communication, updates, and adjustments will be made as needed during the project lifecycle.