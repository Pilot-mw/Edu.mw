from django.db import models
from users.models import CustomUser

class Teacher(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='teacher_profile')
    teacher_id = models.CharField(max_length=20, unique=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    qualification = models.CharField(max_length=200)
    date_employed = models.DateField(auto_now_add=True)
    photo = models.ImageField(upload_to='teacher_photos/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.teacher_id} - {self.user.full_name}"

    @property
    def full_name(self):
        return self.user.full_name


class TeacherReport(models.Model):
    REPORT_TYPE_CHOICES = (
        ('general', 'General Report'),
        ('academic', 'Academic Report'),
        ('disciplinary', 'Disciplinary Report'),
        ('attendance', 'Attendance Report'),
        ('other', 'Other'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=200)
    content = models.TextField()
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES, default='general')
    attached_file = models.FileField(upload_to='teacher_reports/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.teacher.full_name} - {self.title}"

    class Meta:
        ordering = ['-created_at']
