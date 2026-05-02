from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TermViewSet, FeeStructureViewSet, PaymentViewSet, StudentBalanceView

router = DefaultRouter()
router.register(r'terms', TermViewSet, basename='term')
router.register(r'fee-structures', FeeStructureViewSet, basename='feestructure')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('student/<int:student_id>/balances/', StudentBalanceView.as_view(), name='student_balances'),
]
