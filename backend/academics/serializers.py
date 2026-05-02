from rest_framework import serializers
from .models import Subject, ClassSubject
from students.serializers import ClassRoomSerializer

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'description']


class ClassSubjectSerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')
    subject_code = serializers.ReadOnlyField(source='subject.code')
    class_name = serializers.ReadOnlyField(source='class_room.name')
    teacher_name = serializers.ReadOnlyField(source='teacher.user.full_name')

    class Meta:
        model = ClassSubject
        fields = ['id', 'class_room', 'class_name', 'subject', 'subject_name', 'subject_code', 'teacher', 'teacher_name']

    def create(self, validated_data):
        class_room = validated_data.get('class_room')
        subject = validated_data.get('subject')
        teacher = validated_data.get('teacher')

        class_subject, created = ClassSubject.objects.update_or_create(
            class_room=class_room,
            subject=subject,
            defaults={'teacher': teacher}
        )
        return class_subject
