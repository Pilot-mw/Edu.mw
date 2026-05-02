from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Sum, Q
from students.models import Student, ClassRoom
from teachers.models import Teacher
from fees.models import Payment, FeeStructure, Term
from results.models import StudentResult, Mark
from django.utils import timezone
from .models import SchoolSettings
from .serializers import SchoolSettingsSerializer


class SchoolSettingsView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = SchoolSettingsSerializer

    def get_object(self):
        return SchoolSettings.get_settings()


class DashboardStatsView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        current_year = str(timezone.now().year)
        current_term = Term.objects.filter(year=current_year).first()

        total_students = Student.objects.filter(is_active=True).count()
        total_teachers = Teacher.objects.filter(is_active=True).count()

        students_by_class = ClassRoom.objects.annotate(
            student_count=Count('students', filter=Q(students__is_active=True))
        ).values('form', 'stream', 'student_count')

        fees_collected = 0
        outstanding_balance = 0
        if current_term:
            fees_collected = Payment.objects.filter(term=current_term).aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
            for student in Student.objects.filter(is_active=True):
                try:
                    fee = FeeStructure.objects.get(term=current_term)
                    total_paid = Payment.objects.filter(student=student, term=current_term).aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
                    balance = float(fee.total_amount) - float(total_paid)
                    if balance > 0:
                        outstanding_balance += balance
                except FeeStructure.DoesNotExist:
                    pass

        performance_summary = []
        if current_term:
            results = StudentResult.objects.filter(
                exam__term=current_term.term,
                exam__year=current_term.year
            ).values('division').annotate(count=Count('division'))
            performance_summary = list(results)

        recent_payments = Payment.objects.select_related('student__user', 'term').order_by('-payment_date')[:10]
        recent_payments_data = [
            {
                'student': p.student.user.full_name,
                'amount': float(p.amount_paid),
                'term': str(p.term),
                'date': p.payment_date,
                'receipt': p.receipt_number,
            }
            for p in recent_payments
        ]

        return Response({
            'total_students': total_students,
            'total_teachers': total_teachers,
            'students_by_class': list(students_by_class),
            'fees_collected': float(fees_collected),
            'outstanding_balance': outstanding_balance,
            'performance_summary': performance_summary,
            'recent_payments': recent_payments_data,
        })


class AdminDashboardView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=403)

        stats = DashboardStatsView()
        return stats.get(request)
