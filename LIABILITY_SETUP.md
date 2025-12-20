# Liability Feature - Quick Setup Guide

## What Was Added

A complete liability management system that allows users to track payments, bills, and financial obligations with due dates.

## Files Created

1. **src/components/LiabilityForm.jsx**
   - Form to add new liabilities
   - Fields: description, category, amount, currency, due date, notes
   - 9 predefined categories (Credit Card, Loan, Mortgage, etc.)

2. **src/components/LiabilityList.jsx**
   - View all liabilities with filtering
   - Summary cards (total pending, total count, overdue count)
   - Filter by: All, Pending, Overdue, Paid
   - Mark as paid/unpaid
   - Delete functionality
   - Color-coded status indicators

## Files Modified

1. **src/routes.jsx**
   - Added routes: `/liabilities` and `/add-liability`

2. **src/services/firestoreService.js**
   - Added 4 new functions:
     - `saveLiability(liability)`
     - `listLiabilities()`
     - `updateLiability(id, updates)`
     - `deleteLiability(id)`

3. **src/components/Dashboard.jsx**
   - Added "Upcoming Liabilities" section
   - Shows next 3 unpaid liabilities
   - Total pending amount display
   - Color-coded by urgency (red=overdue, yellow=due soon, green=normal)

4. **src/components/Navbar.jsx**
   - Added "Liabilities" navigation link

5. **src/components/index.js**
   - Exported LiabilityForm and LiabilityList components

6. **firestore.rules**
   - Added security rules for `liabilities` collection
   - Added rules for `userSettings` collection

## How to Use

### Adding a Liability
1. Click "Liabilities" in the navigation bar
2. Click "+ Add Liability" button or navigate to `/add-liability`
3. Fill in the form:
   - Description (e.g., "Chase Credit Card - January")
   - Category (select from dropdown)
   - Amount and Currency
   - Due Date
   - Optional notes
4. Click "Add Liability"

### Managing Liabilities
1. Go to `/liabilities`
2. Use filters to view different liability types
3. Click "Mark Paid" to mark a payment as completed
4. Click "Delete" to remove a liability
5. View summary cards at the top for overview

### Dashboard View
- Upcoming liabilities automatically appear on the dashboard
- Shows most urgent 3 unpaid liabilities
- Color-coded warnings for overdue and due-soon payments

## Categories Available
1. Credit Card Payment
2. Loan Payment
3. Mortgage Payment
4. Utility Bill
5. Insurance Premium
6. Subscription
7. Tax Payment
8. Rent
9. Other

## Status Indicators
- 🟢 **PAID**: Payment completed
- 🟡 **PENDING**: Not overdue yet
- 🔴 **OVERDUE**: Past due date

## Data Stored in Firestore
Collection: `liabilities`

Document structure:
```javascript
{
  description: "Credit Card Payment",
  category: "Credit Card Payment",
  amount: 5000,
  currency: "LKR",
  dueDate: "2025-01-25",
  note: "Minimum payment",
  isPaid: false,
  uid: "user-id",
  createdAt: timestamp
}
```

## Next Steps

1. **Deploy Firestore Rules**: Run `firebase deploy --only firestore:rules`
2. **Test the Feature**: 
   - Add a test liability
   - Mark it as paid
   - Check dashboard display
3. **Optional Enhancements**:
   - Add recurring payments
   - Set up email notifications
   - Add payment reminders

## Security

- Users can only see their own liabilities
- Security rules ensure proper access control
- All operations require authentication
- Data is isolated per user

## Support

For issues or questions, refer to:
- [LIABILITY_FEATURE.md](LIABILITY_FEATURE.md) - Detailed documentation
- Firebase Console - Check Firestore data
- Browser console - Check for errors
