from django.db import models
from students.models import Student

class Term(models.Model):
    TERM_CHOICES = (
        ('Term 1', 'Term 1'),
        ('Term 2', 'Term 2'),
        ('Term 3', 'Term 3'),
    )
    YEAR_CHOICES = [(str(y), str(y)) for y in range(2024, 2031)]

    term = models.CharField(max_length=20, choices=TERM_CHOICES)
    year = models.CharField(max_length=10, choices=YEAR_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        unique_together = ('term', 'year')

    def __str__(self):
        return f"{self.term} {self.year}"


class FeeStructure(models.Model):
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='fee_structures')
    tuition_fee = models.DecimalField(max_digits=10, decimal_places=2)
    other_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.total_amount = self.tuition_fee + self.other_fees
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.term} - MWK {self.total_amount}"


class Payment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='payments')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, default='Cash')
    receipt_number = models.CharField(max_length=50, unique=True, blank=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_complete = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            import random
            self.receipt_number = f"HPSS-{random.randint(10000, 99999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.full_name} - {self.term} - MWK {self.amount_paid}"
