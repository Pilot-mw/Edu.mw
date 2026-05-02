from rest_framework import serializers
from .models import Teacher, TeacherReport

class TeacherSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    email = serializers.EmailField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=False)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    photo_url = serializers.SerializerMethodField()
    assigned_classes = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = ['id', 'user', 'teacher_id', 'gender', 'date_of_birth', 'phone',
                  'address', 'qualification', 'date_employed', 'photo', 'photo_url', 'is_active',
                  'email', 'password', 'first_name', 'last_name', 'assigned_classes']
        read_only_fields = ['date_employed']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'full_name': obj.user.full_name,
        }

    def get_photo_url(self, obj):
        if obj.photo:
            return obj.photo.url
        return None

    def get_assigned_classes(self, obj):
        return []

    def create(self, validated_data):
        # Extract user fields
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        phone = validated_data.pop('phone', '')

        if email and password and first_name and last_name:
            from users.models import CustomUser
            user = CustomUser.objects.create_user(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role='teacher',
                phone=phone,
            )
            validated_data['user'] = user

        return super().create(validated_data)

    def update(self, instance, validated_data):
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        phone = validated_data.pop('phone', None)

        if email:
            instance.user.email = email
        if first_name:
            instance.user.first_name = first_name
        if last_name:
            instance.user.last_name = last_name
        if phone:
            instance.phone = phone
            instance.user.phone = phone
        if password:
            instance.user.set_password(password)
        instance.user.save()

        return super().update(instance, validated_data)

class TeacherReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherReport
        fields = ['id', 'teacher', 'title', 'content', 'report_type', 'attached_file',
                  'status', 'admin_response', 'created_at', 'updated_at']
        read_only_fields = ['teacher', 'status', 'admin_response', 'created_at', 'updated_at']
