from django.contrib import admin
from .models import Subject, ClassSubject

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'code']
    search_fields = ['name', 'code']

@admin.register(ClassSubject)
class ClassSubjectAdmin(admin.ModelAdmin):
    list_display = ['class_room', 'subject', 'teacher']
    list_filter = ['class_room', 'subject']
    search_fields = ['class_room__form', 'class_room__stream', 'subject__name']
