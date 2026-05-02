from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import NewsArticle
from .serializers import NewsArticleSerializer, NewsListSerializer, NewsCreateUpdateSerializer


class NewsViewSet(viewsets.ModelViewSet):
    queryset = NewsArticle.objects.select_related('author')

    def get_serializer_class(self):
        if self.action == 'list':
            return NewsListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return NewsCreateUpdateSerializer
        return NewsArticleSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return []
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = NewsArticle.objects.select_related('author')
        status_filter = self.request.query_params.get('status')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        else:
            queryset = queryset.filter(status='published')

        if category:
            queryset = queryset.filter(category=category)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(summary__icontains=search)
            )

        user = self.request.user
        if user.is_authenticated and user.role in ('admin', 'teacher'):
            if status_filter == 'all':
                return queryset.order_by('-published_at', '-created_at')

        return queryset.filter(status='published').order_by('-published_at', '-created_at')

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        article = self.get_object()
        if request.user.role != 'admin':
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        article.status = 'published'
        article.save()
        serializer = self.get_serializer(article)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        article = self.get_object()
        if request.user.role != 'admin':
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        article.status = 'archived'
        article.save()
        serializer = self.get_serializer(article)
        return Response(serializer.data)
