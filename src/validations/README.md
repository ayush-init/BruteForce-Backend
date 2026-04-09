# Validation System Documentation

## Overview

This directory contains a comprehensive Zod-based validation system for the DSA Tracker backend. All API endpoints are now protected with strict input validation to ensure data integrity and security.

## Architecture

### Files Structure

- `common.validation.ts` - Reusable validation schemas (pagination, IDs, enums, etc.)
- `auth.validation.ts` - Authentication-related validation schemas
- `student.validation.ts` - Student management validation schemas
- `question.validation.ts` - Question management validation schemas
- `leaderboard.validation.ts` - Leaderboard validation schemas
- `topic.validation.ts` - Topic management validation schemas
- `index.ts` - Central exports for easy importing

### Middleware

- `../middlewares/validation.middleware.ts` - Reusable validation middleware functions

## Key Features

### 1. Strict Input Validation
- All request bodies, query parameters, and URL parameters are validated
- Invalid data never reaches controllers/services
- Automatic type coercion (strings to numbers, etc.)

### 2. Common Validation Rules
- `page` and `limit`: Pagination with defaults (page=1, limit=10, max=50)
- `email`: Valid email format validation
- `password`: Minimum 6 characters
- `URLs`: Valid URL format
- `enums`: Strict allowed values (EASY, MEDIUM, HARD, etc.)
- `IDs`: Positive integers only

### 3. Error Handling
- Consistent error response format:
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_string"
    }
  ]
}
```

## Usage Examples

### Basic Route Validation
```typescript
import { validateBody } from '../middlewares/validation.middleware';
import { studentLoginSchema } from '../validations/auth.validation';

router.post('/login', validateBody(studentLoginSchema), loginController);
```

### Complex Query Validation
```typescript
import { validateQuery } from '../middlewares/validation.middleware';
import { addedQuestionsQuerySchema } from '../validations/question.validation';

router.get('/questions', validateQuery(addedQuestionsQuerySchema), getQuestionsController);
```

### Parameter and Body Validation
```typescript
import { validateBodyAndParams } from '../middlewares/validation.middleware';
import { updateQuestionSchema, questionIdParamsSchema } from '../validations/question.validation';

router.patch('/questions/:id', validateBodyAndParams(updateQuestionSchema, questionIdParamsSchema), updateQuestionController);
```

## Validation Schemas by Domain

### Authentication
- Student registration/login
- Admin authentication
- Password reset flows
- Google OAuth
- Token refresh

### Student Management
- Profile updates
- Username changes
- Progress tracking
- Student queries with filters

### Question Management
- CRUD operations
- Bulk uploads
- Complex filtering (difficulty, topic, batch, solved status)
- Assignment to classes

### Leaderboard
- Student leaderboards with filters
- Admin leaderboards with comprehensive search
- Statistics queries

### Topic Management
- CRUD operations
- Bulk operations
- Progress tracking
- Public profile views

## Benefits

1. **Security**: No invalid data reaches the business logic
2. **Performance**: Invalid requests are rejected early
3. **Consistency**: Standardized validation across all APIs
4. **Type Safety**: Full TypeScript integration
5. **Maintainability**: Centralized validation logic
6. **Developer Experience**: Clear error messages and auto-completion

## Query Optimization

The validation system automatically:
- Converts string query parameters to numbers
- Sets default values for pagination
- Prevents invalid filters from reaching the database
- Validates enum values before database queries

## Type Safety

All schemas export TypeScript types:
```typescript
import type { StudentLoginBody, QuestionQuery } from '../validations';
```

This ensures full type safety in controllers and services.
