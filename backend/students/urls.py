from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, StudentProfileView, ClassRoomViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'classrooms', ClassRoomViewSet, basename='classroom')

urlpatterns = [
    path('', include(router.urls)),
    path('my-profile/', StudentProfileView.as_view(), name='student_profile'),
]
