from rest_framework import serializers
from .models import Exam, Mark, StudentResult
from students.serializers import StudentSerializer
from academics.serializers import SubjectSerializer

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ['id', 'name', 'exam_type', 'term', 'year', 'start_date', 'end_date']


class MarkSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    exam_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Mark
        fields = ['id', 'student', 'student_name', 'student_id', 'subject', 'subject_name',
                  'exam', 'exam_name', 'marks_obtained', 'grade', 'points', 'teacher', 'teacher_name', 'date_recorded']
        read_only_fields = ['grade', 'points', 'date_recorded', 'teacher', 'teacher_name']
        validators = []

    def get_student_name(self, obj):
        if obj.student and hasattr(obj.student, 'user'):
            return obj.student.user.full_name
        return None

    def get_student_id(self, obj):
        if obj.student:
            return obj.student.student_id
        return None

    def get_subject_name(self, obj):
        if obj.subject:
            return obj.subject.name
        return None

    def get_exam_name(self, obj):
        if obj.exam:
            return obj.exam.name
        return None

    def get_teacher_name(self, obj):
        if obj.teacher and hasattr(obj.teacher, 'user'):
            return obj.teacher.user.full_name
        return None


class StudentResultSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    exam_name = serializers.ReadOnlyField(source='exam.name')
    class_name = serializers.SerializerMethodField()
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    exam = serializers.PrimaryKeyRelatedField(read_only=True)
    total_marks = serializers.SerializerMethodField()
    average_marks = serializers.SerializerMethodField()
    total_points = serializers.SerializerMethodField()
    average_points = serializers.SerializerMethodField()

    class Meta:
        model = StudentResult
        fields = ['id', 'student', 'student_name', 'student_id', 'exam', 'exam_name',
                  'total_marks', 'average_marks', 'total_points', 'average_points',
                  'division', 'position', 'class_name']

    def get_total_marks(self, obj):
        return float(obj.total_marks)

    def get_average_marks(self, obj):
        return float(obj.average_marks)

    def get_total_points(self, obj):
        return obj.total_points

    def get_average_points(self, obj):
        return float(obj.average_points)

    def get_student_name(self, obj):
        if obj.student and hasattr(obj.student, 'user'):
            return obj.student.user.full_name
        return None

    def get_student_id(self, obj):
        if obj.student:
            return obj.student.student_id
        return None

    def get_class_name(self, obj):
        if obj.student and obj.student.class_room:
            return obj.student.class_room.name
        return None
