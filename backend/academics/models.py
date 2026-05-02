from django.db import models
from students.models import ClassRoom
from teachers.models import Teacher

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class ClassSubject(models.Model):
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='subjects')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_subjects')

    class Meta:
        unique_together = ('class_room', 'subject')

    def __str__(self):
        return f"{self.class_room.name} - {self.subject.name}"
