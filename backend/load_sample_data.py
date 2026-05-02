import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'high_profile_school.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from students.models import Student, ClassRoom
from teachers.models import Teacher
from academics.models import Subject, ClassSubject
from fees.models import Term, FeeStructure
from results.models import Exam
from users.models import CustomUser

User = get_user_model()

def create_admin():
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            password='admin123',
            first_name='Admin',
            last_name='High Profile',
            role='admin',
            phone='+265999123456',
            is_active=True,
        )
        print(f"Created admin: {admin.username}")
    else:
        print("Admin already exists")

def create_classrooms():
    rooms = []
    for form in ['Form 1', 'Form 2', 'Form 3', 'Form 4']:
        for stream in ['A', 'B']:
            room, created = ClassRoom.objects.get_or_create(
                form=form,
                stream=stream,
            )
            rooms.append(room)
            if created:
                print(f"Created classroom: {room.name}")
    return rooms

def create_subjects():
    subjects_data = [
        ('Mathematics', 'MATH'),
        ('English', 'ENG'),
        ('Chichewa', 'CHI'),
        ('Biology', 'BIO'),
        ('Physical Science', 'PHY'),
        ('Agriculture', 'AGR'),
        ('Social Studies', 'SOC'),
        ('Computer Studies', 'COM'),
    ]
    subjects = []
    for name, code in subjects_data:
        subject, created = Subject.objects.get_or_create(
            code=code,
            defaults={'name': name}
        )
        subjects.append(subject)
        if created:
            print(f"Created subject: {name}")
    return subjects

def create_teachers():
    teachers_data = [
        ('james_banda', 'James', 'Banda', 'T001', 'Male', 'Mathematics', '+265888111222'),
        ('mary_phiri', 'Mary', 'Phiri', 'T002', 'Female', 'English', '+265888333444'),
        ('john_mwale', 'John', 'Mwale', 'T003', 'Male', 'Chichewa', '+265888555666'),
        ('grace_nyirenda', 'Grace', 'Nyirenda', 'T004', 'Female', 'Biology', '+265888777888'),
        ('peter_kamanga', 'Peter', 'Kamanga', 'T005', 'Male', 'Physical Science', '+265888999000'),
        ('jane_mbewe', 'Jane', 'Mbewe', 'T006', 'Female', 'Agriculture', '+265887111222'),
        ('robert_chirwa', 'Robert', 'Chirwa', 'T007', 'Male', 'Social Studies', '+265887333444'),
        ('lucy_zgambo', 'Lucy', 'Zgambo', 'T008', 'Female', 'Computer Studies', '+265887555666'),
    ]

    teachers = []
    for uname, first, last, tid, gender, qual, phone in teachers_data:
        if not User.objects.filter(username=uname).exists():
            user = User.objects.create_user(
                username=uname,
                password='teacher123',
                first_name=first,
                last_name=last,
                role='teacher',
                phone=phone
            )
            teacher = Teacher.objects.create(
                user=user,
                teacher_id=tid,
                gender=gender,
                date_of_birth='1980-01-01',
                phone=phone,
                address='Zomba, Malawi',
                qualification=qual
            )
            teachers.append(teacher)
            print(f"Created teacher: {teacher.full_name} (username: {uname})")
        else:
            teacher = Teacher.objects.get(teacher_id=tid)
            teachers.append(teacher)
    return teachers

def assign_teachers_to_subjects(teachers, subjects, classrooms):
    for i, subject in enumerate(subjects):
        if i < len(teachers):
            for room in classrooms:
                ClassSubject.objects.update_or_create(
                    class_room=room,
                    subject=subject,
                    defaults={'teacher': teachers[i]}
                )
            print(f"Assigned {teachers[i].full_name} to {subject.name}")

def create_students(classrooms):
    students_data = []
    names = [
        ('blessings_kaponda', 'Blessings', 'Kaponda', 'Male', 'Mr. Kaponda', '+265999111222'),
        ('mercy_nkhoma', 'Mercy', 'Nkhoma', 'Female', 'Mrs. Nkhoma', '+265999333444'),
        ('gift_mwale', 'Gift', 'Mwale', 'Male', 'Mr. Mwale', '+265999555666'),
        ('faith_chimwaza', 'Faith', 'Chimwaza', 'Female', 'Mrs. Chimwaza', '+265999777888'),
        ('promise_banda', 'Promise', 'Banda', 'Male', 'Mr. Banda', '+265999999000'),
        ('patience_phiri', 'Patience', 'Phiri', 'Female', 'Mrs. Phiri', '+265998111222'),
        ('victory_mbewe', 'Victory', 'Mbewe', 'Male', 'Mr. Mbewe', '+265998333444'),
        ('grace_zgambo', 'Grace', 'Zgambo', 'Female', 'Mrs. Zgambo', '+265998555666'),
        ('david_ndanga', 'David', 'Ndanga', 'Male', 'Mr. Ndanga', '+265998777888'),
        ('sarah_kachali', 'Sarah', 'Kachali', 'Female', 'Mrs. Kachali', '+265998999000'),
        ('emmanuel_mwale', 'Emmanuel', 'Mwale', 'Male', 'Mr. Mwale', '+265997111222'),
        ('ruth_banda', 'Ruth', 'Banda', 'Female', 'Mrs. Banda', '+265997333444'),
        ('samuel_phiri', 'Samuel', 'Phiri', 'Male', 'Mr. Phiri', '+265997555666'),
        ('hannah_mbewe', 'Hannah', 'Mbewe', 'Female', 'Mrs. Mbewe', '+265997777888'),
        ('daniel_chirwa', 'Daniel', 'Chirwa', 'Male', 'Mr. Chirwa', '+265997999000'),
        ('esther_nyirenda', 'Esther', 'Nyirenda', 'Female', 'Mrs. Nyirenda', '+265996111222'),
    ]

    student_id = 1001
    for i, (uname, first, last, gender, parent, parent_phone) in enumerate(names):
        room = classrooms[i % len(classrooms)]
        if not User.objects.filter(username=uname).exists():
            user = User.objects.create_user(
                username=uname,
                password='student123',
                first_name=first,
                last_name=last,
                role='student',
                phone=parent_phone
            )
            student = Student.objects.create(
                user=user,
                student_id=f"HP{student_id}",
                gender=gender,
                date_of_birth='2008-01-01',
                class_room=room,
                parent_name=parent,
                parent_phone=parent_phone,
                address='Zomba, Malawi'
            )
            students_data.append(student)
            print(f"Created student: {student.full_name} - {room.name} (username: {uname})")
            student_id += 1

def create_terms_and_fees():
    terms_data = [
        ('Term 1', '2026', '2026-01-15', '2026-04-15'),
        ('Term 2', '2026', '2026-05-01', '2026-08-15'),
        ('Term 3', '2026', '2026-09-01', '2026-12-15'),
    ]

    for term_name, year, start, end in terms_data:
        term, created = Term.objects.get_or_create(
            term=term_name,
            year=year,
            defaults={
                'start_date': start,
                'end_date': end
            }
        )
        if created:
            print(f"Created term: {term}")
            fee = FeeStructure.objects.create(
                term=term,
                tuition_fee=150000,
                other_fees=50000
            )
            print(f"Created fee structure: MWK {fee.total_amount}")

def create_exams():
    terms = Term.objects.all()
    for term in terms:
        exam, created = Exam.objects.get_or_create(
            name=f"{term.term} {term.year} Exams",
            term=term.term,
            year=term.year,
            defaults={
                'exam_type': 'End Term',
                'start_date': term.end_date,
                'end_date': term.end_date,
            }
        )
        if created:
            print(f"Created exam: {exam}")

if __name__ == '__main__':
    print("Loading sample data...")
    create_admin()
    classrooms = create_classrooms()
    subjects = create_subjects()
    teachers = create_teachers()
    assign_teachers_to_subjects(teachers, subjects, classrooms)
    create_students(classrooms)
    create_terms_and_fees()
    create_exams()
    print("\nSample data loaded successfully!")
    print("\nLogin Credentials:")
    print("Admin: admin / admin123")
    print("Teacher: james_banda / teacher123")
    print("Student: blessings_kaponda / student123")
