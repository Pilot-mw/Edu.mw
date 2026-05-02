from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeacherViewSet, TeacherProfileView, TeacherReportViewSet

router = DefaultRouter()
router.register('teachers', TeacherViewSet, basename='teacher')
router.register('reports', TeacherReportViewSet, basename='teacherreport')

urlpatterns = [
    path('', include(router.urls)),
    path('my-profile/', TeacherProfileView.as_view(), name='teacher_profile'),
]
