# Design Document

## Overview

The Chit Fund Management mobile application will be built using React Native with Expo, providing a cross-platform solution for iOS and Android. The app will feature a tab-based navigation system with five main sections: Dashboard, Users, Chits, Loans, and Analytics. The application will consume REST APIs and provide a modern, intuitive interface for chit fund management operations.

## Architecture

### Application Structure
```
src/
├── components/           # Reusable UI components
├── screens/             # Screen components organized by feature
├── services/            # API service layer
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and helpers
├── config/              # Configuration files
└── navigation/          # Navigation configuration
```

### Technology Stack
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation (Tab Navigator + Stack Navigator)
- **HTTP Client**: Fetch API with custom service layer
- **State Management**: React Hooks (useState, useEffect, useContext)
- **UI Components**: React Native built-in components with custom styling
- **Icons**: Expo Vector Icons

## Components and Interfaces

### Core Components

#### 1. Navigation Structure
- **Bottom Tab Navigator**: Main navigation with 5 tabs
  - Dashboard (Home icon)
  - Users (People icon)
  - Chits (Money icon)
  - Loans (Bank icon)
  - Analytics (Chart icon)

#### 2. Screen Components

**Dashboard Screen**
- Quick stats cards (Total Users, Active Chits, Pending Loans)
- Recent activities list
- Quick action buttons for common tasks

**Users Screen**
- User list with search functionality
- Add new user floating action button
- User detail modal/screen with payment history

**Chits Screen**
- Active chits overview
- Weekly chits update button
- Chit payment form
- Chit deactivation functionality

**Loans Screen**
- Active loans list
- New loan application form
- Loan payment processing
- Loan deactivation functionality

**Analytics Screen**
- Key performance indicators cards
- Financial summary charts
- System health indicators

#### 3. Reusable Components

**ApiService**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

class ApiService {
  private baseUrl: string;
  
  async get<T>(endpoint: string): Promise<ApiResponse<T>>;
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>>;
}
```

**LoadingSpinner**
- Centralized loading component with consistent styling

**ErrorMessage**
- Standardized error display component

**FormInput**
- Reusable form input with validation display

**StatsCard**
- Dashboard statistics display component

**UserCard**
- User information display component

**TransactionList**
- Transaction history display component

## Data Models

### TypeScript Interfaces

```typescript
interface User {
  user_id: string;
  name: string;
  mobile: number;
  total_chits: number;
  created_at?: string;
}

interface ChitPayment {
  id: number;
  user_id: string;
  chit_id: string;
  due_amount: number;
  amount_paid: number;
  balance: number;
  weekly_installment: number;
  is_paid: boolean;
  payment_mode?: string;
  paid_on?: string;
  transaction_history: Transaction[];
}

interface Loan {
  id: number;
  loan_id: string;
  user_id: string;
  interest_rate: string;
  interest_type: string;
  borrowed_amount: number;
  balance: number;
  amount_paid: number;
  is_active: boolean;
  is_paid: boolean;
  transaction_history: Transaction[];
}

interface Transaction {
  timestamp: string;
  amount: number;
  mode: string;
}

interface Analytics {
  total_persons_applied_for_chits: number;
  total_persons_applied_for_loans: number;
  total_number_of_active_chits: number;
  total_pending_loans: number;
  total_pending_chits: number;
  amount_in_chits: number;
  amount_pending_to_be_paid_chits: number;
  amount_provided_for_loans: number;
  amount_paid_for_loans: number;
  count_of_unpaid_chits: number;
  count_of_unpaid_loans: number;
}
```

### API Configuration

```typescript
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

const config: ApiConfig = {
  baseUrl: 'http://localhost:3000',
  timeout: 10000,
  retryAttempts: 3
};
```

## Error Handling

### Error Types and Handling Strategy

1. **Network Errors**: Display "Connection failed" message with retry option
2. **Validation Errors (400)**: Show field-specific error messages
3. **Not Found Errors (404)**: Display "Resource not found" message
4. **Conflict Errors (409)**: Show specific conflict message (e.g., "Mobile number already exists")
5. **Server Errors (500)**: Display generic "Server error" message with support contact

### Error Display Components
- **Toast Messages**: For temporary notifications
- **Inline Errors**: For form validation errors
- **Error Screens**: For critical failures with retry options

## Testing Strategy

### Unit Testing
- Component rendering tests
- API service function tests
- Utility function tests
- Form validation tests

### Integration Testing
- API integration tests
- Navigation flow tests
- Form submission tests
- Error handling tests

### User Acceptance Testing
- Complete user workflows
- Cross-platform compatibility
- Performance testing on different devices
- Accessibility testing

## UI/UX Design Patterns

### Design System
- **Color Scheme**: 
  - Primary: #2196F3 (Blue)
  - Secondary: #4CAF50 (Green)
  - Error: #F44336 (Red)
  - Warning: #FF9800 (Orange)
  - Background: #F5F5F5 (Light Gray)

- **Typography**:
  - Headers: Bold, 18-24px
  - Body: Regular, 14-16px
  - Captions: Regular, 12px

- **Spacing**: 8px base unit (8, 16, 24, 32px)

### Screen Layouts
- **List Screens**: Search bar + scrollable list + floating action button
- **Detail Screens**: Header + content sections + action buttons
- **Form Screens**: Input fields + validation messages + submit button
- **Dashboard**: Grid of cards + quick actions

### Interaction Patterns
- **Pull to Refresh**: On list screens
- **Swipe Actions**: For quick operations on list items
- **Modal Dialogs**: For confirmations and quick forms
- **Loading States**: Skeleton screens and spinners
- **Empty States**: Helpful messages with action suggestions

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Load screens and components on demand
2. **Image Optimization**: Use appropriate image formats and sizes
3. **List Virtualization**: For large datasets
4. **API Caching**: Cache frequently accessed data
5. **Bundle Splitting**: Separate vendor and app code

### Memory Management
- Proper cleanup of event listeners
- Efficient state management
- Image memory optimization
- Background task management

## Security Considerations

### Data Protection
- Input sanitization for all form fields
- Secure storage of sensitive configuration
- HTTPS enforcement for API calls
- Proper error message handling (no sensitive data exposure)

### API Security
- Request timeout implementation
- Rate limiting awareness
- Proper error handling without exposing system details
- Input validation on client side (with server-side validation as primary)

## Accessibility

### Accessibility Features
- Screen reader support with proper labels
- High contrast mode support
- Touch target size compliance (minimum 44px)
- Keyboard navigation support
- Text scaling support

### Implementation
- Use semantic HTML elements
- Provide alt text for images
- Implement proper focus management
- Use accessible color combinations
- Test with screen readers