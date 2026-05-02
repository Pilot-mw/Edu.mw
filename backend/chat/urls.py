from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitorChatRoomView, VisitorMessagesView, AdminChatRoomViewSet, AdminAvailabilityView

router = DefaultRouter()
router.register(r'admin-rooms', AdminChatRoomViewSet, basename='admin-rooms')

urlpatterns = [
    path('', include(router.urls)),
    path('room/', VisitorChatRoomView.as_view(), name='create-room'),
    path('room/<int:room_id>/messages/', VisitorMessagesView.as_view(), name='room-messages'),
    path('admin-availability/', AdminAvailabilityView.as_view(), name='admin-availability'),
]
