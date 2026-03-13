import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  // Number of classes to create for each topic (can be min-max range)
  CLASSES_PER_TOPIC: { min: 3, max: 7 },
  
  // Number of questions to assign to each class (can be min-max range)
  QUESTIONS_PER_CLASS: { min: 8, max: 20 },
  
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
    EASY: 0.4,
    MEDIUM: 0.4,
    HARD: 0.2
  }
};

// Utility functions
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getRandomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(startDate: Date, endDate: Date): Date {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

function generateClassNumber(topicId: number, batchId: number, classIndex: number): string {
  return `Topic-${topicId}-Batch-${batchId}-Class-${classIndex + 1}`;
}

function generateClassSlug(topicName: string, batchName: string, classIndex: number): string {
  return slugify(`${topicName}-${batchName}-class-${classIndex + 1}`, { lower: true, strict: true });
}

function generateDescription(topicName: string, batchName: string, classNumber: string): string {
  const templates = [
    `Comprehensive coverage of ${topicName} concepts for ${batchName}`,
    `Deep dive into ${topicName} problem-solving techniques`,
    `${topicName} fundamentals and advanced topics`,
    `Practice session for ${topicName} with ${batchName}`,
    `${topicName} workshop and problem analysis`
  ];
  return getRandomChoice(templates);
}

// Main data generation function
async function generateTestData() {
  console.log('🚀 Starting test data generation...');
  
  try {
    // Fetch existing data
    console.log('📊 Fetching existing data...');
    const [cities, batches, topics, questions] = await Promise.all([
      prisma.city.findMany(),
      prisma.batch.findMany({
        where: {
          id: {
            gte: CONFIG.BATCH_RANGE.min,
            lte: CONFIG.BATCH_RANGE.max
          }
        }
      }),
      prisma.topic.findMany({
        where: {
          id: {
            gte: CONFIG.TOPIC_RANGE.min,
            lte: CONFIG.TOPIC_RANGE.max
          }
        }
      }),
      prisma.question.findMany()
    ]);

    console.log(`✅ Found: ${cities.length} cities, ${batches.length} batches, ${topics.length} topics, ${questions.length} questions`);

    if (cities.length === 0 || batches.length === 0 || topics.length === 0 || questions.length === 0) {
      throw new Error('Insufficient data in database. Please ensure you have cities, batches, topics, and questions.');
    }

    // Group questions by topic and difficulty
    const questionsByTopicAndDifficulty = new Map<number, { EASY: any[], MEDIUM: any[], HARD: any[] }>();
    
    topics.forEach(topic => {
      questionsByTopicAndDifficulty.set(topic.id, { EASY: [], MEDIUM: [], HARD: [] });
    });

    questions.forEach(question => {
      const topicQuestions = questionsByTopicAndDifficulty.get(question.topic_id);
      if (topicQuestions) {
        topicQuestions[question.level as keyof typeof topicQuestions].push(question);
      }
    });

    // Generate classes and question assignments
    let totalClassesCreated = 0;
    let totalQuestionAssignments = 0;

    console.log('🏗️  Generating classes and question assignments...');

    for (const batch of batches) {
      console.log(`\n📚 Processing batch: ${batch.batch_name} (Year: ${batch.year}, City: ${batch.city_id})`);
      
      for (const topic of topics) {
        const numClasses = getRandomInt(CONFIG.CLASSES_PER_TOPIC.min, CONFIG.CLASSES_PER_TOPIC.max);
        const topicQuestions = questionsByTopicAndDifficulty.get(topic.id);
        
        if (!topicQuestions || (topicQuestions.EASY.length + topicQuestions.MEDIUM.length + topicQuestions.HARD.length) === 0) {
          console.warn(`⚠️  No questions found for topic ${topic.id} (${topic.topic_name})`);
          continue;
        }

        console.log(`  📖 Topic ${topic.id}: Creating ${numClasses} classes`);

        // Generate base date for this topic's classes
        const baseDate = getRandomDate(
          new Date(batch.year - 1, 0, 1),
          new Date(batch.year, 11, 31)
        );

        for (let classIndex = 0; classIndex < numClasses; classIndex++) {
          // Create class
          const classDate = new Date(baseDate);
          classDate.setDate(classDate.getDate() + (classIndex * getRandomInt(CONFIG.DAYS_BETWEEN_CLASSES.min, CONFIG.DAYS_BETWEEN_CLASSES.max)));
          
          const classData = {
            topic_id: topic.id,
            batch_id: batch.id,
            class_name: generateClassNumber(topic.id, batch.id, classIndex),
            slug: generateClassSlug(topic.topic_name, batch.batch_name, classIndex),
            description: generateDescription(topic.topic_name, batch.batch_name, generateClassNumber(topic.id, batch.id, classIndex)),
            duration_minutes: getRandomInt(CONFIG.CLASS_DURATION.min, CONFIG.CLASS_DURATION.max),
            class_date: classDate,
            pdf_url: null
          };

          const createdClass = await prisma.class.create({ data: classData });
          totalClassesCreated++;

          // Assign questions to this class
          const numQuestions = getRandomInt(CONFIG.QUESTIONS_PER_CLASS.min, CONFIG.QUESTIONS_PER_CLASS.max);
          const assignedQuestions = new Set<number>();

          // Calculate question distribution by difficulty
          const easyCount = Math.floor(numQuestions * CONFIG.DIFFICULTY_WEIGHTS.EASY);
          const mediumCount = Math.floor(numQuestions * CONFIG.DIFFICULTY_WEIGHTS.MEDIUM);
          const hardCount = numQuestions - easyCount - mediumCount;

          // Select questions by difficulty
          const selectedQuestions: any[] = [];

          // Add easy questions
          for (let i = 0; i < easyCount && topicQuestions.EASY.length > 0; i++) {
            const availableQuestions = topicQuestions.EASY.filter(q => !assignedQuestions.has(q.id));
            if (availableQuestions.length > 0) {
              const question = getRandomChoice(availableQuestions);
              selectedQuestions.push(question);
              assignedQuestions.add(question.id);
            }
          }

          // Add medium questions
          for (let i = 0; i < mediumCount && topicQuestions.MEDIUM.length > 0; i++) {
            const availableQuestions = topicQuestions.MEDIUM.filter(q => !assignedQuestions.has(q.id));
            if (availableQuestions.length > 0) {
              const question = getRandomChoice(availableQuestions);
              selectedQuestions.push(question);
              assignedQuestions.add(question.id);
            }
          }

          // Add hard questions
          for (let i = 0; i < hardCount && topicQuestions.HARD.length > 0; i++) {
            const availableQuestions = topicQuestions.HARD.filter(q => !assignedQuestions.has(q.id));
            if (availableQuestions.length > 0) {
              const question = getRandomChoice(availableQuestions);
              selectedQuestions.push(question);
              assignedQuestions.add(question.id);
            }
          }

          // Fill remaining slots with any available questions
          while (selectedQuestions.length < numQuestions) {
            const allAvailableQuestions = questions.filter(q => q.topic_id === topic.id && !assignedQuestions.has(q.id));
            if (allAvailableQuestions.length === 0) break;
            
            const question = getRandomChoice(allAvailableQuestions);
            selectedQuestions.push(question);
            assignedQuestions.add(question.id);
          }

          // Create question visibility records
          if (selectedQuestions.length > 0) {
            const visibilityData = selectedQuestions.map(question => ({
              class_id: createdClass.id,
              question_id: question.id,
              batch_id: batch.id,
              assigned_at: new Date()
            }));

            await prisma.questionVisibility.createMany({ data: visibilityData });
            totalQuestionAssignments += selectedQuestions.length;

            // Update batch question counts
            const easyAssigned = selectedQuestions.filter(q => q.level === 'EASY').length;
            const mediumAssigned = selectedQuestions.filter(q => q.level === 'MEDIUM').length;
            const hardAssigned = selectedQuestions.filter(q => q.level === 'HARD').length;

            await prisma.batch.update({
              where: { id: batch.id },
              data: {
                easy_assigned: { increment: easyAssigned },
                medium_assigned: { increment: mediumAssigned },
                hard_assigned: { increment: hardAssigned }
              }
            });
          }

          if (classIndex % 10 === 0) {
            console.log(`    ✅ Created ${classIndex + 1}/${numClasses} classes for topic ${topic.id}`);
          }
        }
      }

      console.log(`✅ Completed batch ${batch.batch_name}`);
    }

    // Generate summary report
    console.log('\n📈 DATA GENERATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`🏢 Cities processed: ${cities.length}`);
    console.log(`📚 Batches processed: ${batches.length}`);
    console.log(`📖 Topics processed: ${topics.length}`);
    console.log(`🎯 Total questions available: ${questions.length}`);
    console.log(`📝 Classes created: ${totalClassesCreated}`);
    console.log(`❓ Question assignments created: ${totalQuestionAssignments}`);
    console.log(`📊 Average questions per class: ${(totalQuestionAssignments / totalClassesCreated).toFixed(2)}`);
    
    // Calculate batch statistics
    const batchStats = await prisma.batch.findMany({
      where: { id: { gte: CONFIG.BATCH_RANGE.min, lte: CONFIG.BATCH_RANGE.max } },
      select: {
        id: true,
        batch_name: true,
        year: true,
        easy_assigned: true,
        medium_assigned: true,
        hard_assigned: true,
        classes: {
          select: { id: true }
        }
      }
    });

    console.log('\n📊 BATCH STATISTICS');
    console.log('='.repeat(50));
    batchStats.forEach(batch => {
      const totalQuestions = batch.easy_assigned + batch.medium_assigned + batch.hard_assigned;
      console.log(`${batch.batch_name} (${batch.year}): ${batch.classes.length} classes, ${totalQuestions} questions (E:${batch.easy_assigned}, M:${batch.medium_assigned}, H:${batch.hard_assigned})`);
    });

    console.log('\n🎉 Test data generation completed successfully!');

  } catch (error) {
    console.error('❌ Error generating test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script can be run with: tsx scripts/generate-test-data.ts
generateTestData()
  .then(() => {
    console.log('\n✨ Script completed successfully');
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
  });

export { generateTestData, CONFIG };
