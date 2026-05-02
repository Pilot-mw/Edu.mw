import random
import string
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from .models import Application
from .serializers import ApplicationSerializer, ApplicationAdminSerializer


def generate_password(length=10):
    chars = string.ascii_letters + string.digits + '!@#$%'
    password = ''.join(random.choice(chars) for _ in range(length))
    if not any(c.isupper() for c in password):
        password = 'A' + password[1:]
    return password


def generate_username(name, count=0):
    base = name.lower().replace(' ', '_').replace("'", '')
    base = ''.join(c for c in base if c.isalpha() or c == '_')
    base = base[:20].rstrip('_')
    suffix = str(count + 1) if count > 0 else ''
    return f"{base}{suffix}"


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve', 'accept', 'reject']:
            return ApplicationAdminSerializer
        return ApplicationSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        app = self.get_object()

        if app.status == 'accepted':
            return Response({'detail': 'Already accepted'}, status=status.HTTP_400_BAD_REQUEST)

        from users.models import CustomUser
        from students.models import Student, ClassRoom

        username = None
        for i in range(50):
            candidate = generate_username(app.student_name, i)
            if not CustomUser.objects.filter(username=candidate).exists():
                username = candidate
                break

        if not username:
            return Response({'detail': 'Could not generate unique username'}, status=status.HTTP_400_BAD_REQUEST)

        password = generate_password()

        user = CustomUser.objects.create_user(
            username=username,
            password=password,
            first_name=app.student_name.split()[0] if app.student_name.split() else app.student_name,
            last_name=' '.join(app.student_name.split()[1:]) if len(app.student_name.split()) > 1 else '',
            role='student',
            phone=app.parent_phone,
            is_active=True,
        )

        try:
            classroom = ClassRoom.objects.get(form=app.class_applying, stream='A')
        except ClassRoom.DoesNotExist:
            classroom = ClassRoom.objects.filter(form=app.class_applying).first()

        student_count = Student.objects.count()
        student_id = f"HP{1001 + student_count}"

        student = Student.objects.create(
            user=user,
            student_id=student_id,
            gender=app.gender,
            date_of_birth=app.date_of_birth,
            class_room=classroom,
            parent_name=app.parent_name,
            parent_phone=app.parent_phone,
            address='Zomba, Malawi',
        )

        app.status = 'accepted'
        app.admin_notes = request.data.get('admin_notes', app.admin_notes)
        app.save()

        serializer = self.get_serializer(app)
        return Response({
            **serializer.data,
            'credentials': {
                'username': username,
                'password': password,
                'student_id': student_id,
            }
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        app = self.get_object()
        app.status = 'rejected'
        app.admin_notes = request.data.get('admin_notes', app.admin_notes)
        app.save()
        serializer = self.get_serializer(app)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = self.queryset.count()
        pending = self.queryset.filter(status='pending').count()
        accepted = self.queryset.filter(status='accepted').count()
        rejected = self.queryset.filter(status='rejected').count()
        return Response({
            'total': total,
            'pending': pending,
            'accepted': accepted,
            'rejected': rejected,
        })
