# Test Data Generation Script

This script generates comprehensive test data for your DSA-Tracker application, creating classes and assigning questions across all topics and batches.

## What it does

- **Creates classes** for all 48 topics across batches 3-10
- **Assigns questions** to each class with balanced difficulty distribution
- **Supports multiple cities and years** from your existing data
- **Generates realistic class schedules** with proper timing
- **Updates batch question counts** automatically

## Configuration

The script is highly configurable through the `CONFIG` object:

```typescript
const CONFIG = {
  // Number of classes to create for each topic (can be min-max range)
  CLASSES_PER_TOPIC: { min: 3, max: 5 },
  
  // Number of questions to assign to each class (can be min-max range)
  QUESTIONS_PER_CLASS: { min: 8, max: 15 },
  
  // Topic range (1-48 as specified)
  TOPIC_RANGE: { min: 1, max: 48 },
  
  // Batch range (3-10 as specified)
  BATCH_RANGE: { min: 3, max: 10 },
  
  // Class duration in minutes
  CLASS_DURATION: { min: 60, max: 120 },
  
  // Days between classes for the same topic/batch
  DAYS_BETWEEN_CLASSES: { min: 7, max: 21 },
  
  // Question difficulty distribution weights
  DIFFICULTY_WEIGHTS: {
    EASY: 0.4,    // 40% easy questions
    MEDIUM: 0.4,  // 40% medium questions
    HARD: 0.2     // 20% hard questions
  }
};
```

## Prerequisites

Before running the script, ensure you have:

1. **Cities** in your database (at least 1)
2. **Batches** with IDs 3-10 (with proper city_id and year)
3. **Topics** with IDs 1-48
4. **Questions** (761 as mentioned) distributed across topics
5. **Environment variables** configured (DATABASE_URL)

## Usage

### Method 1: Using npm script (Recommended)

```bash
npm run generate-test-data
```

### Method 2: Direct execution

```bash
tsx scripts/generate-test-data.ts
```

## Expected Output

The script will generate approximately:

- **Classes**: 3-5 classes × 48 topics × 8 batches = ~1,152-1,920 classes
- **Question assignments**: 8-15 questions × ~1,500 classes = ~12,000-22,500 assignments
- **Batch statistics**: Updated question counts for each batch

### Sample Output

```
🚀 Starting test data generation...
📊 Fetching existing data...
✅ Found: 3 cities, 8 batches, 48 topics, 761 questions

🏗️  Generating classes and question assignments...

📚 Processing batch: Batch-3 (Year: 2023, City: 1)
  📖 Topic 1: Creating 4 classes
  📖 Topic 2: Creating 3 classes
  ...
✅ Completed batch Batch-3

📈 DATA GENERATION SUMMARY
==================================================
🏢 Cities processed: 3
📚 Batches processed: 8
📖 Topics processed: 48
🎯 Total questions available: 761
📝 Classes created: 1,456
❓ Question assignments created: 18,240
📊 Average questions per class: 12.53

📊 BATCH STATISTICS
==================================================
Batch-3 (2023): 182 classes, 2,184 questions (E:873, M:873, H:438)
Batch-4 (2023): 178 classes, 2,136 questions (E:854, M:854, H:428)
...

🎉 Test data generation completed successfully!
```

## Data Generation Logic

### Class Creation

1. **Class Naming**: `Topic-{topicId}-Batch-{batchId}-Class-{classIndex}`
2. **Class Slugs**: URL-friendly slugs using topic and batch names
3. **Scheduling**: Classes are scheduled throughout the batch year with realistic gaps
4. **Duration**: 60-120 minutes per class

### Question Assignment

1. **Difficulty Distribution**: 
   - 40% Easy questions
   - 40% Medium questions  
   - 20% Hard questions
2. **Topic Filtering**: Only questions from the class's topic are assigned
3. **No Duplication**: Each question is only assigned once per class
4. **Fallback**: If insufficient questions of a specific difficulty, uses available questions

### Batch Updates

The script automatically updates each batch's question counts:
- `easy_assigned`: Total easy questions assigned
- `medium_assigned`: Total medium questions assigned  
- `hard_assigned`: Total hard questions assigned

## Safety Features

- **Data Validation**: Checks for existing data before generation
- **Error Handling**: Comprehensive error handling with detailed messages
- **Progress Tracking**: Real-time progress updates during generation
- **Database Cleanup**: Properly closes database connections

## Customization

To customize the data generation:

1. **Modify CONFIG object**: Adjust ranges and weights in the script
2. **Add more templates**: Update the description templates for variety
3. **Change scheduling logic**: Modify the date generation algorithm
4. **Adjust difficulty distribution**: Update DIFFICULTY_WEIGHTS

## Troubleshooting

### Common Issues

1. **"Insufficient data in database"**: Ensure you have cities, batches, topics, and questions
2. **"No questions found for topic X"**: Some topics may not have questions assigned
3. **Database connection errors**: Check your DATABASE_URL environment variable

### Solutions

1. **Verify data exists**:
   ```sql
   SELECT COUNT(*) FROM cities;
   SELECT COUNT(*) FROM batches WHERE id BETWEEN 3 AND 10;
   SELECT COUNT(*) FROM topics WHERE id BETWEEN 1 AND 48;
   SELECT COUNT(*) FROM questions;
   ```

2. **Check question distribution**:
   ```sql
   SELECT topic_id, level, COUNT(*) 
   FROM questions 
   WHERE topic_id BETWEEN 1 AND 48
   GROUP BY topic_id, level;
   ```

## Performance Notes

- The script processes data in batches to avoid memory issues
- Large datasets may take several minutes to complete
- Progress is logged every 10 classes per topic
- Database transactions are used for data integrity

## After Generation

After running the script:

1. **Verify data** in your database using Prisma Studio or SQL queries
2. **Test your application** with the new test data
3. **Monitor performance** with the larger dataset
4. **Consider cleanup** if you need to regenerate data

## Related Scripts

- `backfill_batch_question_counts.ts` - Updates existing batch question counts
- `increase-streak-script.ts` - Modifies student streak data
