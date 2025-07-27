from django.urls import path
from . import views

urlpatterns = [
    # Notifications API endpoints
    path('', views.notification_list, name='notification-list'),
    path('recent/', views.recent_notifications, name='recent-notifications'),
    path('<uuid:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
    path('stats/', views.notification_stats, name='notification-stats'),
]
