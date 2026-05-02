from django.db import models
from users.models import CustomUser

class ClassRoom(models.Model):
    FORM_CHOICES = (
        ('Form 1', 'Form 1'),
        ('Form 2', 'Form 2'),
        ('Form 3', 'Form 3'),
        ('Form 4', 'Form 4'),
    )
    STREAM_CHOICES = (
        ('A', 'A'),
        ('B', 'B'),
    )

    form = models.CharField(max_length=20, choices=FORM_CHOICES)
    stream = models.CharField(max_length=5, choices=STREAM_CHOICES)
    class_teacher = models.ForeignKey('teachers.Teacher', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ('form', 'stream')

    def __str__(self):
        return f"{self.form} {self.stream}"

    @property
    def name(self):
        return f"{self.form}{self.stream}"


class Student(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=20, unique=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    class_room = models.ForeignKey(ClassRoom, on_delete=models.SET_NULL, null=True, related_name='students')
    parent_name = models.CharField(max_length=200)
    parent_phone = models.CharField(max_length=20)
    address = models.TextField()
    admission_date = models.DateField(auto_now_add=True)
    photo = models.ImageField(upload_to='student_photos/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.student_id} - {self.user.full_name}"

    @property
    def full_name(self):
        return self.user.full_name

    @property
    def class_name(self):
        if self.class_room:
            return self.class_room.name
        return "Not Assigned"
