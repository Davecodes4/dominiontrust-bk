from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from .serializers import NotificationSerializer
import json


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """Get all notifications for the authenticated user"""
    try:
        user = request.user
        
        # Get query parameters
        notification_type = request.GET.get('type', None)
        is_read = request.GET.get('is_read', None)
        page = request.GET.get('page', 1)
        page_size = min(int(request.GET.get('page_size', 20)), 100)  # Max 100 items per page
        
        # Build the query
        queryset = Notification.objects.filter(user=user, channel='in_app')
        
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
            
        if is_read is not None:
            if is_read.lower() == 'true':
                queryset = queryset.filter(read_at__isnull=False)
            elif is_read.lower() == 'false':
                queryset = queryset.filter(read_at__isnull=True)
        
        # Order by creation date (newest first)
        queryset = queryset.order_by('-created_at')
        
        # Paginate
        paginator = Paginator(queryset, page_size)
        notifications_page = paginator.get_page(page)
        
        # Serialize the data
        serializer = NotificationSerializer(notifications_page.object_list, many=True)
        
        return Response({
            'notifications': serializer.data,
            'pagination': {
                'current_page': notifications_page.number,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': notifications_page.has_next(),
                'has_previous': notifications_page.has_previous(),
            }
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch notifications: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_notifications(request):
    """Get recent notifications for the authenticated user (last 5)"""
    try:
        user = request.user
        
        # Get the 5 most recent in-app notifications
        recent = Notification.objects.filter(
            user=user, 
            channel='in_app'
        ).order_by('-created_at')[:5]
        
        serializer = NotificationSerializer(recent, many=True)
        
        return Response({
            'notifications': serializer.data,
            'unread_count': Notification.objects.filter(
                user=user, 
                channel='in_app',
                read_at__isnull=True
            ).count()
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch recent notifications: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a specific notification as read"""
    try:
        user = request.user
        
        notification = Notification.objects.get(
            id=notification_id,
            user=user,
            channel='in_app'
        )
        
        if notification.read_at is None:
            notification.read_at = timezone.now()
            notification.save()
        
        serializer = NotificationSerializer(notification)
        return Response({'notification': serializer.data})
        
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to mark notification as read: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all unread notifications as read"""
    try:
        user = request.user
        
        updated_count = Notification.objects.filter(
            user=user,
            channel='in_app',
            read_at__isnull=True
        ).update(read_at=timezone.now())
        
        return Response({
            'message': f'{updated_count} notifications marked as read',
            'updated_count': updated_count
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to mark notifications as read: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_stats(request):
    """Get notification statistics for the authenticated user"""
    try:
        user = request.user
        
        total_count = Notification.objects.filter(user=user, channel='in_app').count()
        unread_count = Notification.objects.filter(
            user=user, 
            channel='in_app',
            read_at__isnull=True
        ).count()
        
        # Count by type
        type_counts = {}
        for notification_type, display_name in Notification.NOTIFICATION_TYPES:
            count = Notification.objects.filter(
                user=user,
                channel='in_app',
                notification_type=notification_type
            ).count()
            if count > 0:
                type_counts[notification_type] = count
        
        return Response({
            'total_count': total_count,
            'unread_count': unread_count,
            'read_count': total_count - unread_count,
            'type_counts': type_counts
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch notification stats: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
