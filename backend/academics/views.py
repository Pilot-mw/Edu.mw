from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from .models import Subject, ClassSubject
from .serializers import SubjectSerializer, ClassSubjectSerializer
from students.models import ClassRoom

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]


class ClassSubjectViewSet(viewsets.ModelViewSet):
    queryset = ClassSubject.objects.all().select_related('class_room', 'subject', 'teacher')
    serializer_class = ClassSubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        class_id = self.request.query_params.get('class_room')
        if class_id:
            queryset = queryset.filter(class_room_id=class_id)
        return queryset


class SubjectsByClassView(generics.ListAPIView):
    serializer_class = ClassSubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        class_id = self.kwargs.get('class_id')
        return ClassSubject.objects.filter(class_room_id=class_id).select_related('subject', 'teacher')
