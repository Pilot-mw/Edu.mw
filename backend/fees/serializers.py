from rest_framework import serializers
from .models import Term, FeeStructure, Payment
from students.serializers import StudentSerializer

class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = ['id', 'term', 'year', 'start_date', 'end_date']


class FeeStructureSerializer(serializers.ModelSerializer):
    term_name = serializers.ReadOnlyField(source='term.__str__')

    class Meta:
        model = FeeStructure
        fields = ['id', 'term', 'term_name', 'tuition_fee', 'other_fees', 'total_amount']


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.user.full_name')
    student_id = serializers.ReadOnlyField(source='student.student_id')
    term_name = serializers.ReadOnlyField(source='term.__str__')
    balance_after = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = ['id', 'student', 'student_name', 'student_id', 'term', 'term_name',
                  'amount_paid', 'payment_date', 'payment_method', 'receipt_number',
                  'balance', 'is_complete', 'balance_after']

    def get_balance_after(self, obj):
        try:
            fee = FeeStructure.objects.get(term=obj.term)
            total_paid = Payment.objects.filter(student=obj.student, term=obj.term).exclude(id=obj.id).values_list('amount_paid', flat=True)
            total_paid = sum(total_paid) + obj.amount_paid
            return float(fee.total_amount) - total_paid
        except FeeStructure.DoesNotExist:
            return None
