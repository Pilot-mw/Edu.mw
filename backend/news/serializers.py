from rest_framework import serializers
from .models import NewsArticle


class NewsArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.full_name')
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NewsArticle
        fields = [
            'id', 'title', 'slug', 'summary', 'content', 'category',
            'image', 'image_url', 'status', 'author', 'author_name',
            'published_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['author', 'published_at', 'created_at', 'updated_at', 'slug']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data)


class NewsListSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.full_name')
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NewsArticle
        fields = [
            'id', 'title', 'slug', 'summary', 'category',
            'image_url', 'status', 'author_name',
            'published_at', 'created_at',
        ]

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None


class NewsCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsArticle
        fields = [
            'title', 'summary', 'content', 'category',
            'image', 'status',
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data)
