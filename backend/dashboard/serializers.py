from rest_framework import serializers
from .models import SchoolSettings


class SchoolSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolSettings
        fields = '__all__'
