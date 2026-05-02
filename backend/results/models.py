from django.db import models
from students.models import Student, ClassRoom
from academics.models import Subject
from teachers.models import Teacher

class Exam(models.Model):
    EXAM_TYPE_CHOICES = (
        ('Mid Term', 'Mid Term'),
        ('End Term', 'End Term'),
        ('Mock', 'Mock'),
    )

    name = models.CharField(max_length=100)
    exam_type = models.CharField(max_length=20, choices=EXAM_TYPE_CHOICES)
    term = models.CharField(max_length=20)
    year = models.CharField(max_length=10)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.name} - {self.term} {self.year}"


class Mark(models.Model):
    GRADE_CHOICES = (
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
        ('F', 'F'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='marks')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='marks')
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2)
    grade = models.CharField(max_length=5, choices=GRADE_CHOICES, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    date_recorded = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'subject', 'exam')

    def save(self, *args, **kwargs):
        self.grade = self.calculate_grade()
        super().save(*args, **kwargs)

    def calculate_grade(self):
        marks = float(self.marks_obtained)
        if marks >= 80:
            return 'A'
        elif marks >= 70:
            return 'B'
        elif marks >= 60:
            return 'C'
        elif marks >= 50:
            return 'D'
        else:
            return 'F'

    @property
    def points(self):
        grade_points = {'A': 1, 'B': 2, 'C': 3, 'D': 4, 'F': 5}
        return grade_points.get(self.grade, 5)

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name}: {self.marks_obtained}"


class StudentResult(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='student_results')
    total_marks = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    average_marks = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    total_points = models.IntegerField(default=0)
    average_points = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    division = models.CharField(max_length=10, blank=True)
    position = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'exam')

    def save(self, *args, **kwargs):
        if self.total_points and self.total_points > 0:
            self.average_points = self.total_points / 8  # 8 subjects
        else:
            self.average_points = 0
        self.division = self.calculate_division()
        super().save(*args, **kwargs)

    def calculate_division(self):
        avg = float(self.average_points)
        if avg <= 1.5:
            return 'Division I'
        elif avg <= 2.5:
            return 'Division II'
        elif avg <= 3.5:
            return 'Division III'
        elif avg <= 4.5:
            return 'Division IV'
        else:
            return 'Division 0'

    def __str__(self):
        return f"{self.student.full_name} - {self.exam.name} - {self.division}"
