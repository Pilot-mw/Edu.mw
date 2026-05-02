# High Profile Private Secondary School - Management System

A complete school management system for a private secondary school in Zomba, Malawi.

## Features

### Public Website
- Modern responsive UI
- Home page with hero, mission, and highlights
- About school page
- Academics page (Malawi Secondary Curriculum)
- Admissions page with application form
- News/Announcements page
- Contact page with Zomba, Malawi location

### School Management System

#### Roles
- **Admin**: Full system access
- **Teacher**: Manage classes, enter marks
- **Student**: View results and payment history

#### Modules
1. **Student Management**: Register students, assign classes, upload photos
2. **Class Structure**: Form 1A-4B (Malawian system)
3. **Subjects**: Mathematics, English, Chichewa, Biology, Physical Science, Agriculture, Social Studies, Computer Studies
4. **Fees System**: MWK currency, term-based billing, payment tracking
5. **Results System**: Auto-calculate totals, averages, grades, positions
6. **Teacher Management**: Assign subjects and classes
7. **Dashboard Analytics**: Students count, fees collected, performance summaries

## Tech Stack

- **Frontend**: Next.js (React) + Tailwind CSS + TypeScript
- **Backend**: Django REST Framework
- **Database**: SQLite (can be changed to PostgreSQL)
- **Auth**: JWT Authentication
- **Charts**: Recharts

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Activate virtual environment:
```bash
.\venv\Scripts\Activate.ps1
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Load sample data (already done):
```bash
python load_sample_data.py
```

5. Start the backend server (runs on port 8000):
```bash
python manage.py runserver 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server (runs on port 3000):
```bash
npm run dev
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@highprofile.edu.mw | admin123 |
| Teacher | james.banda@highprofile.edu.mw | teacher123 |
| Student | blessings.kaponda@student.highprofile.edu.mw | student123 |

## API Endpoints

### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/token/refresh/` - Refresh token
- `POST /api/auth/register/` - Register
- `GET /api/auth/profile/` - User profile

### Students
- `GET /api/students/students/` - List students
- `POST /api/students/students/` - Create student
- `GET /api/students/students/{id}/` - Student details
- `PUT /api/students/students/{id}/` - Update student
- `DELETE /api/students/students/{id}/` - Delete student
- `GET /api/students/classrooms/` - List classrooms

### Teachers
- `GET /api/teachers/teachers/` - List teachers
- `POST /api/teachers/teachers/` - Create teacher
- `GET /api/teachers/teachers/{id}/` - Teacher details

### Academics
- `GET /api/academics/subjects/` - List subjects
- `GET /api/academics/class-subjects/` - List class subjects
- `POST /api/academics/class-subjects/` - Assign subject to class

### Fees
- `GET /api/fees/terms/` - List terms
- `GET /api/fees/fee-structures/` - List fee structures
- `GET /api/fees/payments/` - List payments
- `POST /api/fees/payments/` - Record payment

### Results
- `GET /api/results/exams/` - List exams
- `GET /api/results/marks/` - List marks
- `POST /api/results/marks/` - Enter marks
- `GET /api/results/results/` - List results

### Dashboard
- `GET /api/dashboard/stats/` - Dashboard statistics (admin)

## Database Schema

### Users
- CustomUser (email, first_name, last_name, role, phone)

### Students
- Student (user, student_id, gender, date_of_birth, class_room, parent_name, parent_phone, address)
- ClassRoom (form, stream, class_teacher)

### Teachers
- Teacher (user, teacher_id, gender, date_of_birth, phone, address, qualification)

### Academics
- Subject (name, code, description)
- ClassSubject (class_room, subject, teacher)

### Fees
- Term (term, year, start_date, end_date)
- FeeStructure (term, tuition_fee, other_fees, total_amount)
- Payment (student, term, amount_paid, payment_date, receipt_number, balance)

### Results
- Exam (name, exam_type, term, year, start_date, end_date)
- Mark (student, subject, exam, marks_obtained, grade)
- StudentResult (student, exam, total_marks, average_marks, division, position)

## Deployment

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Use PostgreSQL addon
4. Set environment variables
5. Build command: `pip install -r requirements.txt`
6. Start command: `gunicorn high_profile_school.wsgi`

### Frontend (Vercel)
1. Push code to GitHub
2. Import project on Vercel
3. Set `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

## School Information

- **Name**: High Profile Private Secondary School
- **Location**: Zomba, Malawi
- **Curriculum**: Malawi Secondary School Curriculum (MSCE)
- **Classes**: Form 1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B
- **Currency**: Malawian Kwacha (MWK)

## License

MIT License
