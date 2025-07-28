from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    type = serializers.CharField(source='notification_type', read_only=True)
    is_read = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'type',
            'title', 
            'message',
            'is_read',
            'created_at',
            'read_at',
            'priority'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_is_read(self, obj):
        """Check if notification has been read"""
        return obj.read_at is not None
