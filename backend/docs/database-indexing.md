# Database Indexing Strategy

## Overview
This document outlines the indexing strategy for MongoDB collections to optimize query performance.

## Indexing Principles
1. **Index frequently queried fields** - Fields used in `find()`, `findOne()`, `where()` queries
2. **Index fields used in sorting** - Fields used in `sort()` operations
3. **Compound indexes for multi-field queries** - When queries filter on multiple fields
4. **Unique indexes for unique constraints** - Email, username, etc.
5. **Text indexes for search** - Full-text search on name, description fields

## User Collection

### Indexes
- **email** (unique) - Login queries, user lookup
- **role** - Admin/student filtering
- **onboardingCompleted** - Filtering incomplete onboarding users

### Rationale
- Email is queried on every login and user lookup
- Role filtering for admin dashboards
- Onboarding status for conditional routing

## College Collection

### Indexes
- **name** (text) - Search functionality
- **location.state** - State-based filtering
- **location.city** - City-based filtering
- **fees** - Budget range queries
- **restart_score** - Sorting by score
- **exams_required** - Exam-based filtering
- **type** - College type filtering
- **isTrending** - Trending colleges queries

### Compound Indexes
- **{location.state: 1, fees: 1}** - State + budget queries
- **{exams_required: 1, restart_score: -1}** - Exam filter + score sort

### Rationale
- Search is a primary feature
- Location and budget are most common filters
- Score-based sorting is frequent
- Exam filtering is common for recommendations

## InternationalCollege Collection

### Indexes
- **name** (text) - Search functionality
- **country** - Country-based filtering
- **global_ranking** - Ranking-based sorting
- **tuition_fee_annual** - Budget filtering
- **isTrending** - Trending colleges queries

### Compound Indexes
- **{country: 1, global_ranking: 1}** - Country + ranking queries

## NewGenCollege Collection

### Indexes
- **name** (text) - Search functionality
- **category** - Category filtering
- **isTrending** - Trending colleges queries

## Exam Collection

### Indexes
- **name** - Exam lookup by name
- **exam_date** - Upcoming exams queries

## PrepPlan Collection

### Indexes
- **user** - User's prep plans lookup
- **exam** - Exam-based queries

### Compound Indexes
- **{user: 1, exam: 1}** - User's specific exam plan (unique)

## Performance Considerations

### Index Size
- Indexes consume memory and disk space
- Monitor index size vs collection size
- Remove unused indexes

### Write Performance
- Each index slows down writes (insert, update, delete)
- Balance read performance vs write performance
- Use selective indexes

### Index Maintenance
- Regularly analyze slow queries with `explain()`
- Monitor index usage with `db.collection.stats()`
- Remove unused indexes

## Implementation Notes

All indexes are defined in the Mongoose schemas using:
- `unique: true` for unique indexes
- `index: true` for regular indexes
- `Schema.index()` for compound and text indexes

Indexes are automatically created when the application starts and connects to MongoDB.
