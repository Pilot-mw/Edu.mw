from django.db import models
from users.models import CustomUser


class ChatRoom(models.Model):
    visitor_name = models.CharField(max_length=200)
    visitor_email = models.EmailField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Chat with {self.visitor_name}"


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    sender_name = models.CharField(max_length=200)
    sender_type = models.CharField(max_length=10, choices=[('visitor', 'Visitor'), ('admin', 'Admin')])
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.sender_type}] {self.sender_name}: {self.message[:50]}"
