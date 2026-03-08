import prisma from '../src/config/prisma';

async function increaseStudentStreak(studentId: number, days: number = 5) {
  try {
    // Get available questions that student hasn't solved yet
    const unsolvedQuestions = await prisma.$queryRawUnsafe(`
      SELECT q.id 
      FROM "Question" q
      WHERE q.id NOT IN (
        SELECT sp.question_id 
        FROM "StudentProgress" sp 
        WHERE sp.student_id = ${studentId}
      )
      LIMIT ${days}
    `);

    const questions = unsolvedQuestions as any[];
    
    if (questions.length < days) {
      console.log(`Not enough unsolved questions. Found: ${questions.length}, Needed: ${days}`);
      return;
    }

    // Create consecutive entries
    const entries = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i); // Go back i days
      
      entries.push({
        student_id: studentId,
        question_id: questions[i]?.id,
        sync_at: date
      });
    }

    // Insert all entries
    await prisma.studentProgress.createMany({
      data: entries
    });

    console.log(`Added ${days} consecutive entries for student ${studentId}`);
    console.log('Streak should now be:', days);
    
  } catch (error) {
    console.error('Error increasing streak:', error);
  }
}

// Usage example:
// increaseStudentStreak(1, 7); // Increase streak to 7 days for student ID 1

export { increaseStudentStreak };
