from rest_framework import serializers
from .models import Student, ClassRoom
from users.models import CustomUser
from users.serializers import UserSerializer

class ClassRoomSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField()
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = ClassRoom
        fields = ['id', 'form', 'stream', 'name', 'class_teacher', 'students_count']

    def get_students_count(self, obj):
        return obj.students.filter(is_active=True).count()


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class_room_name = serializers.ReadOnlyField(source='class_room.name')
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'user', 'student_id', 'gender', 'date_of_birth', 'class_room', 'class_room_name',
                  'parent_name', 'parent_phone', 'address', 'admission_date', 'photo', 'photo_url', 'is_active']

    def get_photo_url(self, obj):
        if obj.photo:
            return obj.photo.url
        return None

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = 'student'
        user = CustomUser.objects.create_user(**user_data)
        student = Student.objects.create(user=user, **validated_data)
        return student

    def update(self, instance, validated_data):
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        return super().update(instance, validated_data)


class StudentCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = Student
        fields = ['email', 'first_name', 'last_name', 'password', 'student_id', 'gender',
                  'date_of_birth', 'class_room', 'parent_name', 'parent_phone', 'address']

    def create(self, validated_data):
        user_data = {
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'password': validated_data.pop('password'),
            'role': 'student',
        }
        user = CustomUser.objects.create_user(**user_data)
        student = Student.objects.create(user=user, **validated_data)
        return student
