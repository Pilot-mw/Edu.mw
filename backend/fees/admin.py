from django.contrib import admin
from .models import Term, FeeStructure, Payment

@admin.register(Term)
class TermAdmin(admin.ModelAdmin):
    list_display = ['term', 'year', 'start_date', 'end_date']
    list_filter = ['term', 'year']

@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ['term', 'tuition_fee', 'other_fees', 'total_amount']
    list_filter = ['term__term', 'term__year']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['student', 'term', 'amount_paid', 'payment_date', 'receipt_number', 'is_complete']
    list_filter = ['term__term', 'term__year', 'payment_method', 'is_complete']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'receipt_number']
    raw_id_fields = ['student', 'term']
