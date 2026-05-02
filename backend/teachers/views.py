from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db.models import Q
from .models import Teacher, TeacherReport
from .serializers import TeacherSerializer, TeacherReportSerializer
from users.models import CustomUser


class TeacherViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Teacher.objects.filter(is_active=True).select_related('user')
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(teacher_id__icontains=search)
            )
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherSerializer
        return TeacherSerializer

    def perform_create(self, serializer):
        serializer.save()


class TeacherProfileView(generics.RetrieveAPIView):
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.teacher_profile


class TeacherReportViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            try:
                teacher = Teacher.objects.get(user=user)
                return TeacherReport.objects.filter(teacher=teacher).order_by('-created_at')
            except Teacher.DoesNotExist:
                return TeacherReport.objects.none()
        elif user.role == 'admin':
            return TeacherReport.objects.all().order_by('-created_at')
        return TeacherReport.objects.none()

    def perform_create(self, serializer):
        teacher = Teacher.objects.get(user=self.request.user)
        serializer.save(teacher=teacher)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        try:
            report = self.get_object()

            # Only admin can review
            if request.user.role != 'admin':
                return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

            new_status = request.data.get('status')
            admin_response = request.data.get('admin_response', '')

            if new_status not in ['approved', 'rejected']:
                return Response({'detail': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

            report.status = new_status
            report.admin_response = admin_response
            report.save()

            serializer = TeacherReportSerializer(report)
            return Response(serializer.data)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
