from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubjectViewSet, ClassSubjectViewSet, SubjectsByClassView

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'class-subjects', ClassSubjectViewSet, basename='classsubject')

urlpatterns = [
    path('', include(router.urls)),
    path('class/<int:class_id>/subjects/', SubjectsByClassView.as_view(), name='class_subjects'),
]
