// Test script to verify heatmap and streak logic
// This simulates the priority logic for different scenarios

function simulateDayLogic(dateStr, solvedCount) {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  let count;
  
  // Priority logic:
  // 1️⃣ if solvedCount > 0 → return solvedCount
  // 2️⃣ else if weekend → return -1  
  // 3️⃣ else → return 0
  if (solvedCount > 0) {
    count = solvedCount;
  } else if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
    count = -1; // No question day (weekend)
  } else {
    count = 0; // Missed day (weekday with no solves)
  }
  
  return { date: dateStr, dayOfWeek, count, meaning: getCountMeaning(count) };
}

function getCountMeaning(count) {
  if (count > 0) return `${count} solved`;
  if (count === 0) return 'missed';
  if (count === -1) return 'no question day';
  return 'unknown';
}

// Test scenarios
const testCases = [
  // Weekday with solves
  { date: '2026-03-06', solved: 2, expected: 2 },
  // Weekday with no solves (missed)
  { date: '2026-03-07', solved: 0, expected: 0 },
  // Weekend with no solves (no question day)
  { date: '2026-03-08', solved: 0, expected: -1 }, // Sunday
  { date: '2026-03-09', solved: 0, expected: -1 }, // Monday (but let's test weekend)
  { date: '2026-03-14', solved: 0, expected: -1 }, // Saturday
  // Weekend with solves (edge case - student solved old problems)
  { date: '2026-03-15', solved: 1, expected: 1 }, // Sunday
];

console.log('Testing Heatmap and Streak Logic:');
console.log('================================');

testCases.forEach(testCase => {
  const result = simulateDayLogic(testCase.date, testCase.solved);
  const passed = result.count === testCase.expected;
  
  console.log(`${passed ? '✅' : '❌'} ${testCase.date} (${new Date(testCase.date).toLocaleDateString('en-US', { weekday: 'long' })})`);
  console.log(`   Input: ${testCase.solved} solved → Output: ${result.count} (${result.meaning})`);
  if (!passed) {
    console.log(`   Expected: ${testCase.expected}`);
  }
  console.log('');
});

// Test streak calculation ignoring -1 days
console.log('Testing Streak Logic:');
console.log('====================');

const sampleData = [
  { date: '2026-03-01', count: 2 },  // Monday: solved
  { date: '2026-03-02', count: 1 },  // Tuesday: solved  
  { date: '2026-03-03', count: -1 }, // Wednesday: no question (should be ignored)
  { date: '2026-03-04', count: 3 },  // Thursday: solved
  { date: '2026-03-05', count: 0 },  // Friday: missed (breaks streak)
  { date: '2026-03-06', count: 2 },  // Saturday: solved (edge case)
];

function calculateStreak(dailyData) {
  let currentStreak = 0;
  
  // Calculate from today backwards (simulate)
  for (let i = dailyData.length - 1; i >= 0; i--) {
    const day = dailyData[i];
    
    if (day.count === -1) {
      console.log(`   ${day.date}: count = -1 (no question day) → continue streak`);
      continue;
    }
    
    if (day.count > 0) {
      currentStreak++;
      console.log(`   ${day.date}: count = ${day.count} (solved) → streak = ${currentStreak}`);
    } else {
      console.log(`   ${day.date}: count = 0 (missed) → break streak`);
      break;
    }
  }
  
  return currentStreak;
}

console.log('Sample data:');
sampleData.forEach(day => {
  console.log(`  ${day.date}: ${day.count} (${getCountMeaning(day.count)})`);
});

console.log('\nStreak calculation (from latest to oldest):');
const streak = calculateStreak(sampleData);
console.log(`\nFinal current streak: ${streak}`);
