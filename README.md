# CPS Learning Management System (LMS) Backend

This is the robust backend for the CPS Learning Management System, built on **Strapi v5** (Headless CMS) using **TypeScript** and **PostgreSQL**. The backend is architected to be highly secure, dynamic, and perfectly aligned with the project's customized Entity-Relationship Diagram (ERD).

## Tech Stack
- **Framework**: [Strapi v5](https://strapi.io/)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens) via Strapi Users & Permissions plugin
- **Documentation**: Swagger / OpenAPI

## Key Features & Customizations

### 1. Advanced Role-Based Access Control (RBAC)
The system supports distinct user roles with specific lifecycle validations and permissions:
- **Admin**: Full access to the system.
- **Content Manager**: Can manage (create/update/delete) courses, lessons, quizzes, and blog posts.
- **Instructor**: Can create and manage their own courses, lessons, and quizzes, and view enrolled students' progress.
- **Student**: Can browse courses, enroll, consume lessons, take quizzes, and track personal progress.

### 2. Automated Relational Data Handling (Smart Controllers)
To ensure data security and simplify frontend integration, custom core controllers automatically assign logged-in users to relational fields. The frontend does not need to send sensitive IDs (like `student_id` or `author_id`) during creation; the backend intelligently handles it based on the user's role token:
- **`Course`**: Automatically assigns the `instructor` or `content_manager` based on who is creating the course.
- **`Enrollment`, `Lesson Progress`, `Quiz Result`**: Automatically assigns the `student` field exclusively for logged-in students.
- **`Blog Post`**: Automatically assigns the `author`.
- **`Quiz`**: Automatically assigns the `created_by` field.

### 3. Customized Swagger API Documentation
Strapi's default OpenAPI schemas have been overridden globally via `src/index.ts` to provide clean, frontend-friendly API documentation. 
- Unnecessary auto-assigned fields (like `student_id` or `status` defaults) are hidden from the request body examples.
- Relational fields strictly follow the ERD naming convention (`course_id`, `quiz_id`, `lesson_id`) to ensure frontend clarity.

## Core Data Models

- **Course**: The core entity. Contains price, title, description, and thumbnail. Auto-populates instructor details on fetch.
- **Lesson**: Associated with a Course. Contains video URLs, rich-text content, and sequence order.
- **Quiz / Question / Option**: Assessment engine linked to Courses.
- **Enrollment**: Tracks active/completed/dropped status of a student in a course.
- **Lesson Progress**: Tracks completion of individual lessons by students.
- **Quiz Result / Quiz Answer**: Tracks scores, attempts, and submitted answers for assessments.
- **Blog Post**: For LMS announcements or articles, with draft/published workflows.

## How It Works (System Workflow)

The LMS follows a structured workflow for content delivery and assessment:
1. **Course Creation**: An `Instructor` or `Content Manager` creates a course. Their user ID is automatically linked to the course.
2. **Content Population**: The creator adds `Lessons` and `Quizzes` to the course.
3. **Enrollment**: A `Student` registers on the platform and enrolls in a course. The backend automatically records this relation (`student_id` <-> `course_id`).
4. **Learning & Progress**: As the student watches lessons, the system tracks it via `Lesson Progress`, linking the student, lesson, and course.
5. **Assessment**: The student takes quizzes. The backend automatically grades the attempt and saves the score in `Quiz Result`, establishing relations between the student, quiz, and attempt data.

## Detailed Role Relationships

The database relies heavily on automated relations based on user roles to maintain data integrity. Here is how the roles map to the data models:

### Student
- **Enrollment**: `student` (1:M) -> Tracks which courses the student is taking.
- **Lesson Progress**: `student` (1:M) -> Tracks completion status of individual lessons.
- **Quiz Result**: `student` (1:M) -> Stores assessment scores and attempt history.

### Instructor
- **Course**: `instructor` (1:1 / 1:M) -> When an instructor creates a course, they are automatically set as the instructor.
- **Quiz**: `created_by` (1:M) -> Any quiz created by the instructor is linked to their profile.

### Content Manager
- **Course**: `content_manager` (1:M) -> Can be assigned to or create courses.
- **Blog Post**: `author` (1:M) -> Automatically linked when publishing articles.
- **Quiz**: `created_by` (1:M) -> Automatically linked when building assessments.

### Admin
- Bypasses specific role restrictions and has full CRUD capabilities across all relational tables.

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running

### Installation
1. Clone the repository and navigate to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file with your database credentials:
   ```env
   HOST=0.0.0.0
   PORT=1337
   APP_KEYS=your_app_keys
   API_TOKEN_SALT=your_api_salt
   ADMIN_JWT_SECRET=your_admin_jwt
   TRANSFER_TOKEN_SALT=your_transfer_salt
   DATABASE_CLIENT=postgres
   DATABASE_HOST=127.0.0.1
   DATABASE_PORT=5432
   DATABASE_NAME=cps_lms
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your_db_password
   JWT_SECRET=your_jwt_secret
   ```
4. Start the development server:
   ```bash
   npm run develop
   ```

### API Documentation
Once the server is running, you can view the fully customized Swagger documentation at:
[http://localhost:1337/documentation/v1.0.0](http://localhost:1337/documentation/v1.0.0)
