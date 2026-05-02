from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from .models import Term, FeeStructure, Payment
from .serializers import TermSerializer, FeeStructureSerializer, PaymentSerializer
from students.models import Student

class TermViewSet(viewsets.ModelViewSet):
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    permission_classes = [IsAuthenticated]


class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all().select_related('term')
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated]


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Payment.objects.all().select_related('student__user', 'term')
        student_id = self.request.query_params.get('student')
        term_id = self.request.query_params.get('term')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if term_id:
            queryset = queryset.filter(term_id=term_id)
        return queryset

    def perform_create(self, serializer):
        payment = serializer.save()
        student = payment.student
        term = payment.term
        total_paid = Payment.objects.filter(student=student, term=term).aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
        try:
            fee = FeeStructure.objects.get(term=term)
            balance = float(fee.total_amount) - float(total_paid)
            payment.balance = balance
            payment.is_complete = balance <= 0
            payment.save()
        except FeeStructure.DoesNotExist:
            pass


class StudentBalanceView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        payments = Payment.objects.filter(student_id=student_id).select_related('term')
        balances = []
        for payment in payments:
            try:
                fee = FeeStructure.objects.get(term=payment.term)
                total_paid = Payment.objects.filter(student=payment.student, term=payment.term).aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
                balance = float(fee.total_amount) - float(total_paid)
                balances.append({
                    'term': str(payment.term),
                    'total_fee': float(fee.total_amount),
                    'total_paid': float(total_paid),
                    'balance': balance,
                    'is_complete': balance <= 0,
                })
            except FeeStructure.DoesNotExist:
                pass
        return Response(balances)
