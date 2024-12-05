# AutoExtract: Invoice Manager

## Overview

Swipe Invoice is an AI-powered invoice processing application that automates data extraction from various file formats (Excel, PDF, images) using Google Gemini AI. The application organizes extracted data into structured sections for Invoices, Products, and Customers with real-time synchronization using Zustand state management.

**Live Site:** [AutoExtract: Invoice Manager Website](https://swipe-assignment-five.vercel.app/)

**Frontend and Backend Repo:** [AutoExtract: Invoice Manager](https://github.com/RutamBhagat/swipe-assignment)

## Demo Video

[Watch the Walkthrough](https://github.com/user-attachments/assets/cffb5e74-09ec-4a70-bfe6-2c1f9507fd5e)

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

![1](https://github.com/user-attachments/assets/5b279dee-3d6c-4f91-932d-e0621b404c32)
![2](https://github.com/user-attachments/assets/ad8faf8f-dce3-4fa0-849a-ff558f51cd94)
![3](https://github.com/user-attachments/assets/8f92fff3-6ef4-4891-ae79-0e8775e47b96)
![4](https://github.com/user-attachments/assets/4c0c1e36-3012-4d1f-8b5c-031bb5c63135)
![5](https://github.com/user-attachments/assets/78d05094-afa5-415f-a245-fc65ca78d09a)
