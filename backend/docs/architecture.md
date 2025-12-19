# Backend Architecture Pattern

## Overview

This document describes the service layer and repository pattern implemented in the backend.

## Architecture Layers

### 1. Controllers (HTTP Layer)
- Handle HTTP requests and responses
- Validate input (via middleware)
- Call services for business logic
- Return formatted responses

### 2. Services (Business Logic Layer)
- Contain business logic
- Orchestrate operations
- Use repositories for data access
- Return structured results

### 3. Repositories (Data Access Layer)
- Handle database operations
- Provide query methods
- Abstract Mongoose details
- Return model instances

### 4. Models (Data Layer)
- Define Mongoose schemas
- Define data structure
- Provide validation

## Implementation

### Base Repository

All repositories extend `BaseRepository` which provides common CRUD operations:

```typescript
class BaseRepository<T extends Document> {
    findAll(filter, options)
    findById(id)
    findOne(filter)
    create(data)
    updateById(id, update)
    deleteById(id)
    count(filter)
    exists(filter)
}
```

### Example: College Module

**CollegeRepository** (`repositories/college.repository.ts`):
- Extends BaseRepository
- Adds college-specific queries: search, getTrending, getByExam, getByState

**CollegeService** (`services/college.service.ts`):
- Uses CollegeRepository
- Implements business logic: searchColleges, getCollegeById, getTrendingColleges
- Returns structured responses with success/error handling

**CollegeController** (to be refactored):
- Calls CollegeService methods
- Handles HTTP concerns only
- Returns JSON responses

## Usage Example

### Before (Direct Database Access in Controller)
```typescript
export const getColleges = async (req, res) => {
    try {
        const colleges = await College.find({ state: req.query.state });
        res.json({ success: true, data: colleges });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error' });
    }
};
```

### After (Service Layer Pattern)
```typescript
// Repository
class CollegeRepository extends BaseRepository {
    async getByState(state: string) {
        return this.model.find({ 'location.state': state });
    }
}

// Service
class CollegeService {
    async getCollegesByState(state: string) {
        const colleges = await this.repository.getByState(state);
        return { success: true, count: colleges.length, data: colleges };
    }
}

// Controller
export const getCollegesByState = async (req, res) => {
    try {
        const result = await collegeService.getCollegesByState(req.params.state);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
```

## Benefits

1. **Testability**: Each layer can be tested independently
2. **Reusability**: Business logic in services can be reused
3. **Maintainability**: Clear separation of concerns
4. **Mockability**: Easy to mock repositories for testing
5. **Scalability**: Easy to add new features

## Migration Strategy

1. **Keep existing controllers working** - No breaking changes
2. **Create repositories and services** - New infrastructure
3. **Gradually refactor controllers** - One module at a time
4. **Test thoroughly** - Ensure no regressions

## Files Created

- `repositories/base.repository.ts` - Base repository class
- `repositories/college.repository.ts` - College data access
- `repositories/user.repository.ts` - User data access
- `services/college.service.ts` - College business logic
- `services/user.service.ts` - User business logic

## Next Steps

To use this pattern in controllers:

1. Import the service
2. Call service methods instead of direct database access
3. Handle responses
4. Remove business logic from controllers

Example:
```typescript
import collegeService from '../services/college.service';

export const getColleges = async (req, res) => {
    const result = await collegeService.searchColleges(params, pagination);
    res.json(result);
};
```
