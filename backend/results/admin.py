from django.contrib import admin
from .models import Exam, Mark, StudentResult

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['name', 'exam_type', 'term', 'year', 'start_date', 'end_date']
    list_filter = ['exam_type', 'term', 'year']

@admin.register(Mark)
class MarkAdmin(admin.ModelAdmin):
    list_display = ['student', 'subject', 'exam', 'marks_obtained', 'grade', 'teacher']
    list_filter = ['exam', 'subject', 'grade']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'subject__name']
    raw_id_fields = ['student', 'subject', 'exam', 'teacher']

@admin.register(StudentResult)
class StudentResultAdmin(admin.ModelAdmin):
    list_display = ['student', 'exam', 'total_marks', 'average_marks', 'division', 'position']
    list_filter = ['exam', 'division']
    search_fields = ['student__user__first_name', 'student__user__last_name']
    raw_id_fields = ['student', 'exam']
