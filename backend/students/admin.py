from django.contrib import admin
from .models import Student, ClassRoom

@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = ['form', 'stream', 'class_teacher']
    list_filter = ['form', 'stream']

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'full_name', 'gender', 'class_room', 'parent_name', 'is_active']
    list_filter = ['gender', 'class_room', 'is_active']
    search_fields = ['student_id', 'user__first_name', 'user__last_name', 'parent_name']
    raw_id_fields = ['user', 'class_room']

    def full_name(self, obj):
        return obj.user.full_name
    full_name.short_description = 'Full Name'
