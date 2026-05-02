from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExamViewSet, MarkViewSet, StudentResultViewSet, ExamResultsView

router = DefaultRouter()
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'marks', MarkViewSet, basename='mark')
router.register(r'results', StudentResultViewSet, basename='studentresult')

urlpatterns = [
    path('', include(router.urls)),
    path('class/<int:class_id>/exam/<int:exam_id>/results/', ExamResultsView.as_view(), name='exam_results'),
]
