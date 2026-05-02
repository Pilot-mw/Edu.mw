from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from django.utils import timezone


class VisitorChatRoomView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ChatRoomSerializer

    def create(self, request, *args, **kwargs):
        room = ChatRoom.objects.create(
            visitor_name=request.data.get('visitor_name', 'Visitor'),
            visitor_email=request.data.get('visitor_email', '')
        )
        Message.objects.create(
            room=room,
            sender_name='System',
            sender_type='admin',
            message='Welcome! How can we help you today?',
            is_read=True
        )
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VisitorMessagesView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MessageSerializer

    def get_queryset(self):
        room_id = self.kwargs.get('room_id')
        return Message.objects.filter(room_id=room_id).order_by('created_at')

    def post(self, request, *args, **kwargs):
        room_id = self.kwargs.get('room_id')
        try:
            room = ChatRoom.objects.get(id=room_id, is_active=True)
        except ChatRoom.DoesNotExist:
            return Response({'detail': 'Chat room not found'}, status=status.HTTP_404_NOT_FOUND)

        message = Message.objects.create(
            room=room,
            sender_name=request.data.get('sender_name', 'Visitor'),
            sender_type='visitor',
            message=request.data.get('message', '')
        )
        room.updated_at = timezone.now()
        room.save()
        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatRoom.objects.all().prefetch_related('messages')

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        room = self.get_object()
        messages = room.messages.all().order_by('created_at')
        room.messages.filter(sender_type='visitor').update(is_read=True)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        room = self.get_object()
        message = Message.objects.create(
            room=room,
            sender=request.user,
            sender_name=request.user.full_name,
            sender_type='admin',
            message=request.data.get('message', '')
        )
        room.updated_at = timezone.now()
        room.save()
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminAvailabilityView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.core.cache import cache
        is_available = cache.get('admin_chat_available', True)
        return Response({'is_available': is_available})

    def post(self, request):
        self.permission_classes = [IsAuthenticated]
        self.check_permissions(request)
        from django.core.cache import cache
        is_available = request.data.get('is_available', True)
        cache.set('admin_chat_available', is_available, timeout=None)
        return Response({'is_available': is_available})
