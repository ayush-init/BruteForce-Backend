# PRODUCT REQUIREMENT DOCUMENT (PRD)

# Product Name: DSA Tracker

---

# 1. Product Overview

## 1.1 Vision

To build a centralized, multi-city DSA tracking platform where:

- Super Admin manages cities, centers, batches, and teachers
- Teachers assign and manage DSA questions topic-wise and class-wise
- Students track their coding progress in a structured way
- Performance is visible class-wise, city-wise, and globally
- Leaderboards create healthy competition

## 1.2 Objectives

- Standardize DSA learning across multiple cities
- Enable structured Topic → Class → Question progression
- Provide performance analytics at Student, Batch, City, and Global level
- Create competitive learning environment using leaderboards
- Make management scalable for future city expansion

---

# 2. User Roles & Access Control

## 2.1 Super Admin

### Responsibilities

#### Manage Cities
- Add new city
- Edit city
- Deactivate city

#### Manage Centers / Batches
- Add batch under a city
- Edit batch details
- Assign teacher to batch

#### Manage Teachers
- Add teacher
- Remove teacher
- Assign teacher to city & batch
- View teacher performance

#### System Level Control
- View overall analytics
- View city-wise performance
- Access all student data
- Control global leaderboard visibility

---

## 2.2 Teacher

### Responsibilities
- Add and manage questions
- Add topic-wise classes
- Upload PDFs for each class
- Track student progress
- Add remarks and duration
- View batch-level analytics

---

## 2.3 Student

### Responsibilities
- View assigned class-wise questions
- Filter questions by:
  - Topic
  - Difficulty
  - Type
- Track personal progress
- View leaderboard:
  - Global leaderboard
  - City-wise leaderboard

---

# 3. Detailed Functional Requirements

---

# 4. Super Admin Module

## 4.1 City Management

Super Admin can:
- Add new city (for future expansion)
- Edit existing city
- Activate / Deactivate city

### Fields:
- City Name
- Status
- Created Date

---

## 4.2 Batch Management

Each city can have multiple batches.

Super Admin can:
- Add batch under selected city
- Assign teacher to batch
- Edit batch details

### Fields:
- Batch Name
- City (Dropdown)
- Assigned Teacher
- Start Date
- Status

---

## 4.3 Teacher Management

Super Admin can:
- Add Teacher
- Assign teacher to city
- Assign teacher to batch
- Remove teacher
- View teacher performance

### Fields:
- Name
- Email
- Phone
- Assigned City
- Assigned Batch
- Status

---

# 5. Teacher Module

## 5.1 Teacher Dashboard

Two major routes:
1. Question & Class Management
2. Student Progress Management

---

## 5.2 Question & Class Management Flow

### Step 1: Select City
Dropdown → Select City

Example:
If teacher selects "Bangalore",
all batches under Bangalore will appear.

### Step 2: Select Batch
After selecting city:
- All batches of that city will be shown
- Teacher selects one batch

### Step 3: Select Topic

Example Topics:
- Arrays
- Linked List
- Stack
- Queue
- Tree
- Graph

If topic = Tree  
And already 5 classes exist:
- Class 1
- Class 2
- Class 3
- Class 4
- Class 5

All 5 classes will be visible.

### Step 4: Add New Class Under Topic

Teacher can:
- Add Class 6 (example)
- Upload PDF for that class
- Add questions under that class

### Fields:
- Class Number
- Topic Name
- PDF Upload
- Question List

---

## 5.3 Question Structure

Each Question will have:
- Question Title
- Platform (LeetCode / GFG / CodeStudio)
- Link
- Difficulty (Easy / Medium / Hard)
- Type (Homework / Classwork)
- Marks (Optional)
- Order Number

---

## 5.4 Student Progress Route

Teacher can view:
- All students of selected batch
- Total questions assigned
- Questions completed
- Completion percentage

Clicking on a student opens full profile:

### Student Profile Shows:
- Name
- Batch
- City
- Total Questions Attempted
- Easy / Medium / Hard breakdown
- Completion %
- Last Active Date
- Time Spent
- Remarks section (Editable by teacher)
- Duration tracking

Teacher can:
- Add remark
- Add performance note
- Add custom duration if needed

---

# 6. Student Module

## 6.1 Student Dashboard

Dashboard shows:
- All topics
- Class-wise questions
- Completion percentage per class
- Overall progress bar

---

## 6.2 Question Filtering

Students can filter by:
- Topic
- Difficulty (Easy / Medium / Hard)
- Type (Homework / Classwork)
- Status (Completed / Pending)

---

## 6.3 Question View

Each question will show:
- Title
- Link
- Difficulty badge
- Mark as completed button
- Notes section (Optional)

---

# 7. Leaderboard System

## 7.1 Global Leaderboard

Shows:
- Rank
- Student Name
- City
- Batch
- Total Questions Solved
- Points

Sorted by:
- Total solved
- Weighted difficulty score

---

## 7.2 City-wise Leaderboard

Filter by city.  
Shows ranking only among that city’s students.

---

## 7.3 Scoring Logic (Suggested)

- Easy = 1 point
- Medium = 2 points
- Hard = 3 points

**Total Score = Sum of all points**

---

# 8. Analytics & Reporting

## 8.1 Teacher Analytics
- Batch completion rate
- Topic-wise completion
- Student performance ranking

## 8.2 Super Admin Analytics
- City-wise performance
- Teacher performance
- Total active students
- Growth metrics

---

# 9. Non-Functional Requirements

- Secure authentication (Role-based access control)
- Scalable architecture for multi-city expansion
- Cloud storage for PDFs
- Real-time leaderboard updates
- Responsive UI (Web first)
- Data backup system

---

# 10. Future Enhancements

- Contest Mode
- Daily DSA Streak System
- Certificates generation
- Performance graph visualization
- AI-based weak topic detection

---

# 11. Tech Suggestions (Optional)

## Frontend:
- React / Next.js

## Backend:
- Node.js + Express
- Prisma ORM

## Database:
- PostgreSQL / MySQL

## Authentication:
- JWT-based role authentication

## Storage:
- AWS S3 / Cloudinary (for PDFs)

---

# 12. Success Metrics

- Student daily active rate
- Weekly completion %
- City performance comparison
- Leaderboard participation
- Teacher engagement