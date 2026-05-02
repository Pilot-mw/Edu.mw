from django.contrib import admin
from .models import Teacher

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['teacher_id', 'full_name', 'gender', 'qualification', 'is_active']
    list_filter = ['gender', 'is_active']
    search_fields = ['teacher_id', 'user__first_name', 'user__last_name', 'qualification']
    raw_id_fields = ['user']

    def full_name(self, obj):
        return obj.user.full_name
    full_name.short_description = 'Full Name'
