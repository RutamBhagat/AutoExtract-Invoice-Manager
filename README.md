---
title: "AutoExtract: Invoice Manager"
publishedAt: "2024-11-06"
summary: "Developed AutoExtract: Invoice Manager, an automated invoice processing application that uses Google Gemini AI to extract and organize data from various file formats into a structured format with real-time synchronization."
images:
  - "https://github.com/user-attachments/assets/85720540-b534-4907-bfe3-da125306e684"
  - "https://github.com/user-attachments/assets/f798dff9-eae2-4818-b0f9-620ea596e034"
  - "https://github.com/user-attachments/assets/288af3ed-bc70-4191-9bf6-b00c8f44fdd2"
  - "https://github.com/user-attachments/assets/e31b8075-d5ef-4a28-a113-37fc9f8c2842"

team:
  - name: "Rutam Bhagat"
    role: "Software Engineer"
    avatar: "/images/avatar.jpg"
    linkedIn: "https://github.com/RutamBhagat"
---

# Swipe Invoice: AI-Powered Invoice Processing Application

## Overview

Swipe Invoice is an AI-powered invoice processing application that automates data extraction from various file formats (Excel, PDF, images) using Google Gemini AI. The application organizes extracted data into structured sections for Invoices, Products, and Customers with real-time synchronization using Zustand state management.

**Live Site:** [Code Wizard UI](https://code-wizard-frontend.vercel.app/)

**Frontend and Backend Repo:** [Code Wizard Frontend](https://github.com/RutamBhagat/code_wizard_frontend)

## Demo Video

[Watch the Walkthrough](https://github.com/user-attachments/assets/399aae3e-a1fc-4160-b878-4aa43cd28a38)

## Key Features

- **AI-Powered Data Extraction**: Utilizes Google Gemini AI for accurate data extraction from multiple file formats
- **Real-time Synchronization**: Uses Zustand for seamless state management across components
- **Interactive Tables**: Implements shadcn table components for data display and management
- **Responsive Design**: Built with Next.js 15 and Tailwind CSS for optimal user experience
- **File Format Support**: Handles Excel, PDF, and image file formats

## Technologies Used

- **Frontend**: Next.js 15 App Router, React, TypeScript
- **Styling**: Tailwind CSS, shadcn UI components
- **State Management**: Zustand
- **AI Integration**: Google Gemini API
- **Data Display**: shadcn Table Components

## Challenges and Learnings

The development process provided valuable insights into:

- **AI Integration**: Implementing Google Gemini API for accurate data extraction
- **State Management**: Using Zustand for efficient state synchronization
- **Component Architecture**: Building reusable components with shadcn
- **Data Validation**: Implementing robust validation for extracted data

## Optimizations

1. **Efficient Data Processing**

   - Optimized AI extraction pipeline for faster processing
   - Implemented error handling and validation checks

2. **UI/UX Improvements**

   - Responsive design for all screen sizes
   - Interactive tables with sorting and filtering

3. **State Management**
   - Centralized state management with Zustand
   - Real-time updates across components

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key

### Installation

```bash
git clone git@github.com:RutamBhagat/swipe-assignment.git

cd swipe-assignment

cp .env.example .env
# Provide Gemini API key and desired model in the .env

npm install

npm run dev
```

## Project Structure

The application is organized into three main sections:

1. **Invoices Tab**

   - Displays invoice details including serial number, customer info, and totals
   - Supports real-time updates and filtering

2. **Products Tab**

   - Shows product information with pricing and tax details
   - Enables sorting and filtering capabilities

3. **Customers Tab**
   - Manages customer information and purchase history
   - Provides comprehensive customer data view

## Features Implementation

### File Upload and Processing

- Handles multiple file formats (Excel, PDF, images)
- Implements AI-powered data extraction
- Validates and processes extracted data

### Data Management

- Real-time state updates using Zustand
- Efficient data organization across tabs
- Robust error handling and validation

## Technology Stack Details

- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [ShadCN](https://ui.shadcn.com/docs)
- [Tanstack Table](https://tanstack.com/table/latest)
- [Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction)

## Outcome

Swipe Invoice demonstrates effective implementation of AI-powered data processing combined with modern web technologies to create a robust invoice management solution.

# Screenshots

![Screenshot 1](https://github.com/user-attachments/assets/85720540-b534-4907-bfe3-da125306e684)
![Screenshot 2](https://github.com/user-attachments/assets/f798dff9-eae2-4818-b0f9-620ea596e034)
![Screenshot 3](https://github.com/user-attachments/assets/288af3ed-bc70-4191-9bf6-b00c8f44fdd2)
![Screenshot 4](https://github.com/user-attachments/assets/e31b8075-d5ef-4a28-a113-37fc9f8c2842)
