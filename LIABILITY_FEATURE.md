# Liability Management Feature

## Overview
The liability management feature allows users to track upcoming payments, bills, and financial obligations with due dates and descriptions.

## Features

### 1. Add Liabilities
- Navigate to `/add-liability` or click "Add New Liability" button
- Fields available:
  - **Description** (Required): Name/description of the liability (e.g., "Chase Credit Card - January")
  - **Category** (Required): Type of liability
    - Credit Card Payment
    - Loan Payment
    - Mortgage Payment
    - Utility Bill
    - Insurance Premium
    - Subscription
    - Tax Payment
    - Rent
    - Other
  - **Amount** (Required): Payment amount
  - **Currency**: LKR, USD, EUR, or GBP (default: LKR)
  - **Due Date** (Required): When the payment is due
  - **Notes** (Optional): Additional details about the payment

### 2. View All Liabilities
- Navigate to `/liabilities` to see all liabilities
- Features:
  - **Summary Cards**:
    - Total Pending Payments (amount)
    - Total number of liabilities
    - Number of overdue payments
  - **Filter Options**:
    - All: Show all liabilities
    - Pending: Show only unpaid liabilities
    - Overdue: Show only overdue payments
    - Paid: Show only completed payments
  - **Status Indicators**:
    - 🟢 **Paid**: Payment has been completed
    - 🟡 **Pending**: Payment is due but not overdue yet
    - 🔴 **Overdue**: Payment is past due date
  - **Actions**:
    - Mark as Paid/Unpaid
    - Delete liability

### 3. Dashboard Integration
- The dashboard shows a "Upcoming Liabilities" section when you have liabilities
- Features:
  - Shows next 3 upcoming unpaid liabilities
  - Color-coded by urgency:
    - Red: Overdue payments
    - Yellow: Due within 7 days
    - Green: Due later
  - Displays total pending payment amount
  - Quick link to view all liabilities
  - Quick link to add new liability

## Data Structure

Each liability document in Firestore contains:
```javascript
{
  description: string,      // "Chase Credit Card - January"
  category: string,         // "Credit Card Payment"
  amount: number,           // 5000
  currency: string,         // "LKR"
  dueDate: string,          // "2025-01-15" (ISO date format)
  note: string,             // Optional additional details
  isPaid: boolean,          // false
  uid: string,              // User ID (auto-added)
  createdAt: timestamp      // Auto-generated timestamp
}
```

## Components

### LiabilityForm.jsx
Form component for adding new liabilities with validation and currency support.

### LiabilityList.jsx
Full list view with filtering, sorting, and management capabilities:
- Real-time calculation of days until due
- Color-coded status indicators
- Summary statistics
- Filter by payment status

### Dashboard.jsx (Updated)
Shows upcoming liabilities section with:
- Next 3 unpaid liabilities
- Total pending amount
- Overdue warnings
- Quick actions

## Services

### firestoreService.js
New functions added:
- `saveLiability(liability)`: Add a new liability
- `listLiabilities()`: Get all user's liabilities sorted by due date
- `updateLiability(id, updates)`: Update liability (e.g., mark as paid)
- `deleteLiability(id)`: Remove a liability

## Navigation

New routes added in `routes.jsx`:
- `/liabilities` - View all liabilities (LiabilityList component)
- `/add-liability` - Add new liability (LiabilityForm component)

Navbar updated with "Liabilities" link for easy access.

## Usage Examples

### Example 1: Credit Card Payment
```
Description: Chase Credit Card - January 2025
Category: Credit Card Payment
Amount: 5000
Currency: LKR
Due Date: 2025-01-25
Note: Minimum payment required
```

### Example 2: Utility Bill
```
Description: Electricity Bill - December
Category: Utility Bill
Amount: 3500
Currency: LKR
Due Date: 2025-01-10
Note: Account #123456
```

### Example 3: Insurance Premium
```
Description: Car Insurance Renewal
Category: Insurance Premium
Amount: 12000
Currency: LKR
Due Date: 2025-02-01
Note: Policy #ABC789
```

## Benefits

1. **Never Miss Payments**: Visual reminders of upcoming due dates
2. **Financial Planning**: See total pending obligations at a glance
3. **Payment Tracking**: Mark payments as paid to keep records
4. **Organized**: Categorize different types of liabilities
5. **Multi-Currency**: Support for different currencies
6. **Historical Record**: Keep track of past payments

## Future Enhancements (Potential)

- Recurring liabilities (automatic creation each month)
- Email/push notifications for upcoming due dates
- Payment confirmation with receipts
- Payment history analysis
- Integration with calendar apps
- Budget impact calculation
