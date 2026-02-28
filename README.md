# DSA Tracker Backend

A comprehensive backend system for tracking DSA (Data Structures and Algorithms) progress across multiple batches and cities.

## 🚀 Features

- **Multi-role Authentication**: Superadmin, Teacher, Intern, and Student roles
- **City & Batch Management**: Organize students by location and batches
- **Progress Tracking**: Monitor student progress on DSA questions
- **Question Management**: Support for LeetCode, GFG, and other platforms
- **Class Management**: Organize topics and assign questions to classes
- **Bookmark System**: Students can save important questions

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Development**: Nodemon, tsx

## 📋 Database Schema

### Core Models

#### **City**
- `id`, `city_name`, `created_at`
- Relations: batches, students

#### **Batch**
- `id`, `batch_name`, `year`, `city_id`, `created_at`
- Relations: students, classes, questionVisibility
- Unique constraint: [city_id, year, batch_name]

#### **Student**
- `id`, `name`, `email`, `username`, `password_hash`
- Optional: `google_id`, `enrollment_id`, `leetcode_id`, `gfg_id`
- Relations: city, batch, progress, bookmarks
- Profile completion tracking

#### **Admin**
- `id`, `name`, `email`, `username`, `password_hash`
- `role`: SUPERADMIN, TEACHER, INTERN (default: INTERN)
- No city restriction - can access all cities

#### **Topic**
- `id`, `topic_name`, `created_at`
- Relations: questions, classes

#### **Question**
- `id`, `question_name`, `question_link`
- `platform`: LEETCODE, GFG, OTHER (default: LEETCODE)
- `level`: EASY, MEDIUM, HARD (default: MEDIUM)
- `type`: HOMEWORK, CLASSWORK (default: HOMEWORK)
- Relations: topic, visibility, progress, bookmarks

#### **Class**
- `id`, `topic_id`, `batch_id`, `class_number`
- Optional: `pdf_url`, `description`, `duration_minutes`, `class_date`
- Relations: topic, batch, questionVisibility

#### **QuestionVisibility**
- Links questions to classes and batches
- `class_id`, `question_id`, `batch_id`, `assigned_at`
- Unique constraint: [class_id, question_id]

#### **StudentProgress**
- Tracks solved questions per student
- `student_id`, `question_id`, `solved_at`
- Unique constraint: [student_id, question_id]

#### **Bookmark**
- Student saved questions
- `student_id`, `question_id`, `created_at`
- Unique constraint: [student_id, question_id]

## 🔐 Authentication & Roles

### **Role Hierarchy**
1. **SUPERADMIN**: Full system access
2. **TEACHER**: Can manage classes, questions, topics
3. **INTERN**: Limited admin access
4. **STUDENT**: Can view progress, bookmark questions

### **Authentication Flow**
1. **Registration**: Email/username + password
2. **Login**: JWT token generation with role info
3. **Token Verification**: Bearer token in Authorization header
4. **Role-based Access**: Middleware checks user permissions

### **JWT Token Structure**
```json
{
  "id": "user_id",
  "email": "user_email",
  "role": "USER_ROLE",
  "userType": "student|admin"
}
```

## 🛣 API Routes

### **Authentication Routes** (`/api/auth`)

#### **Student Authentication**
- `POST /api/auth/student/register`
  - Body: `name`, `email`, `username`, `password`
  - Response: User data + JWT token

- `POST /api/auth/student/login`
  - Body: `email`, `password`
  - Response: User data + JWT token

#### **Admin Authentication**
- `POST /api/auth/admin/register`
  - Body: `name`, `email`, `username`, `password`, `role`
  - Response: User data + JWT token

- `POST /api/auth/admin/login`
  - Body: `email`, `password`
  - Response: User data + JWT token

### **Student Routes** (`/api/students`)

- `PATCH /api/students/profile`
  - Auth: Student token required
  - Body: Profile completion data
  - Updates: city_id, batch_id, leetcode_id, gfg_id, enrollment_id

### **Admin Routes** (`/api/admin`)

#### **City Management**
- `POST /api/admin/cities`
  - Auth: Superadmin only
  - Body: `city_name`
  - Creates new city

- `GET /api/admin/cities`
  - Auth: Any authenticated user
  - Response: List of all cities

#### **Batch Management**
- `POST /api/admin/batches`
  - Auth: Superadmin only
  - Body: `batch_name`, `year`, `city_id`
  - Creates new batch for a city

- `GET /api/admin/batches/:city_id`
  - Auth: Any authenticated user
  - Response: Batches for specific city

## 🔒 Role-Based Access Control

### **Middleware Functions**
- `verifyToken`: Validates JWT token
- `isAdmin`: Requires admin userType
- `isSuperAdmin`: Requires SUPERADMIN role
- `isTeacherOrAbove`: Requires TEACHER or SUPERADMIN role
- `isStudent`: Requires student userType

### **Access Matrix**

| Feature | SUPERADMIN | TEACHER | INTERN | STUDENT |
|---------|------------|---------|---------|---------|
| Create Cities | ✅ | ❌ | ❌ | ❌ |
| Create Batches | ✅ | ❌ | ❌ | ❌ |
| Create Teachers | ✅ | ❌ | ❌ | ❌ |
| Create Topics | ❌ | ❌ | ❌ | ❌ |
| Create Questions | ❌ | ❌ | ❌ | ❌ |
| Create Classes | ❌ | ❌ | ❌ | ❌ |
| View Cities | ✅ | ✅ | ✅ | ✅ |
| View Batches | ✅ | ✅ | ✅ | ✅ |
| Update Profile | ❌ | ❌ | ❌ | ✅ |

## ⚠️ Current Implementation Status

### **✅ Implemented**
- Authentication system (login/register)
- City and Batch creation (Superadmin only)
- Student profile management
- Database schema with all relations
- Role-based middleware
- JWT token system

### **❌ Missing Features**
- Teacher creation endpoints
- Topic management
- Question management
- Class management
- Question assignment to classes
- Progress tracking endpoints
- Bookmark management
- Analytics dashboard
- Google OAuth integration

### **🔧 Known Issues**
- No initial superadmin seed script
- Some controller files are empty (analytics, class, question, topic)
- Teacher role has no specific endpoints yet

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16+)
- PostgreSQL database
- Environment variables

### **Installation**
```bash
npm install
```

### **Environment Variables**
Create `.env` file:
```
DATABASE_URL="postgresql://username:password@localhost:5432/dsa_tracker"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
```

### **Database Setup**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### **Development**
```bash
npm run dev
```

### **Production**
```bash
npm run build
npm start
```

## 📝 Initial Setup

### **Creating First Superadmin**
Since there's no seed script, create the first superadmin via:

1. **API Registration**:
```bash
curl -X POST http://localhost:5000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "admin@dsa.com",
    "username": "superadmin",
    "password": "admin123",
    "role": "SUPERADMIN"
  }'
```

2. **Manual Database**:
```sql
INSERT INTO "Admin" (name, email, username, password_hash, role)
VALUES (
  'Super Admin',
  'admin@dsa.com',
  'superadmin',
  '$2b$10$hashed_password_here',
  'SUPERADMIN'
);
```

## 🔄 Workflow Example

### **Superadmin Setup Flow**
1. Login as superadmin
2. Create cities: `POST /api/admin/cities`
3. Create batches: `POST /api/admin/batches`
4. Create teachers: `POST /api/auth/admin/register` (role: "TEACHER")
5. Teachers can then manage topics, questions, and classes

### **Student Onboarding Flow**
1. Register: `POST /api/auth/student/register`
2. Complete profile: `PATCH /api/students/profile`
3. View assigned questions and track progress

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License
