from rest_framework import viewsets, generics, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from .models import Exam, Mark, StudentResult
from .serializers import ExamSerializer, MarkSerializer, StudentResultSerializer
from students.models import Student, ClassRoom
from teachers.models import Teacher
from django.utils import timezone


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]


class MarkViewSet(viewsets.ModelViewSet):
    serializer_class = MarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Mark.objects.all().select_related('student__user', 'subject', 'exam', 'teacher__user')
        student_id = self.request.query_params.get('student')
        exam_id = self.request.query_params.get('exam')
        class_id = self.request.query_params.get('class_room')
        subject_id = self.request.query_params.get('subject')

        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)
        if class_id:
            queryset = queryset.filter(student__class_room_id=class_id)
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        return queryset

    def create(self, request, *args, **kwargs):
        import traceback
        print(f"\n=== CREATE MARK REQUEST ===")
        print(f"Data: {request.data}")
        print(f"User: {request.user}")

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            print(f"Serializer is valid")
            try:
                student_id = request.data.get('student')
                subject_id = request.data.get('subject')
                exam_id = request.data.get('exam')

                existing_mark = Mark.objects.filter(
                    student_id=student_id,
                    subject_id=subject_id,
                    exam_id=exam_id
                ).first()

                if existing_mark:
                    print(f"Updating existing mark {existing_mark.id}")
                    existing_mark.marks_obtained = request.data.get('marks_obtained')
                    existing_mark.save()
                    serializer = MarkSerializer(existing_mark)
                    self.update_student_result(existing_mark.student, existing_mark.exam)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    print(f"Creating new mark")
                    self.perform_create(serializer)
                    print(f"Mark created successfully")
                    return Response(serializer.data, status=status.HTTP_201_CREATED)

            except Exception as e:
                print(f"ERROR in create: {e}")
                traceback.print_exc()
                return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        print(f"VALIDATION ERRORS: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        try:
            teacher = Teacher.objects.get(user=self.request.user)
        except Teacher.DoesNotExist:
            raise serializers.ValidationError({"detail": "Teacher profile not found for this user. Please contact admin."})

        try:
            mark = serializer.save(teacher=teacher)
            self.update_student_result(mark.student, mark.exam)
        except Exception as e:
            print(f"Error saving mark: {e}")
            print(f"Request data: {self.request.data}")
            print(f"Serializer errors: {serializer.errors}")
            raise

    def perform_update(self, serializer):
        mark = serializer.save()
        self.update_student_result(mark.student, mark.exam)

    def update_student_result(self, student, exam):
        try:
            marks = Mark.objects.filter(student=student, exam=exam)
            marks_count = marks.count()
            print(f"Updating student result for {student} - {marks_count} marks found")

            total_marks = marks.aggregate(Sum('marks_obtained'))['marks_obtained__sum'] or 0
            total_points = sum(m.points for m in marks)
            avg_marks = total_marks / marks_count if marks_count > 0 else 0

            print(f"Total marks: {total_marks}, Total points: {total_points}, Avg: {avg_marks}")

            result, created = StudentResult.objects.update_or_create(
                student=student,
                exam=exam,
                defaults={
                    'total_marks': total_marks,
                    'average_marks': avg_marks,
                    'total_points': total_points,
                }
            )
            print(f"Student result {'created' if created else 'updated'}: {result}")

            self.update_positions(exam, student.class_room)
        except Exception as e:
            print(f"ERROR in update_student_result: {e}")
            import traceback
            traceback.print_exc()
            raise

    def update_positions(self, exam, class_room):
        results = StudentResult.objects.filter(exam=exam, student__class_room=class_room).order_by('-average_marks')
        for idx, result in enumerate(results, 1):
            result.position = idx
            result.save()


class StudentResultViewSet(viewsets.ModelViewSet):
    serializer_class = StudentResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = StudentResult.objects.all().select_related('student__user', 'exam', 'student__class_room')
        user = self.request.user

        # If student, only show their own results
        if user.role == 'student':
            try:
                student = Student.objects.get(user=user)
                return queryset.filter(student=student).order_by('-exam__id')
            except Student.DoesNotExist:
                return StudentResult.objects.none()

        # For admin/teacher, allow filtering
        student_id = self.request.query_params.get('student')
        exam_id = self.request.query_params.get('exam')
        class_id = self.request.query_params.get('class_room')

        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)
        if class_id:
            queryset = queryset.filter(student__class_room_id=class_id)

        return queryset.order_by('-id')

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            import traceback
            print(f"ERROR in StudentResultViewSet.list: {e}")
            traceback.print_exc()
            raise


class ExamResultsView(generics.ListAPIView):
    serializer_class = StudentResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        class_id = self.kwargs.get('class_id')
        exam_id = self.kwargs.get('exam_id')
        return StudentResult.objects.filter(
            student__class_room_id=class_id,
            exam_id=exam_id
        ).select_related('student__user', 'exam').order_by('position')
