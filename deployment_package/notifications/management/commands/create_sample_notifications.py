from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from notifications.models import Notification
from django.utils import timezone
import uuid


class Command(BaseCommand):
    help = 'Create sample notifications for testing'

    def handle(self, *args, **options):
        # Get the first user (or create one for testing)
        try:
            user = User.objects.first()
            if not user:
                self.stdout.write(
                    self.style.ERROR('No users found. Please create a user first.')
                )
                return
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error finding user: {e}')
            )
            return

        # Sample notifications data
        notifications_data = [
            {
                'title': 'Welcome to DominionTrust Bank!',
                'message': 'Your account has been successfully created. Start exploring our banking services.',
                'notification_type': 'account',
                'is_read': False,
            },
            {
                'title': 'Transaction Completed',
                'message': 'Your transfer of $500.00 to John Doe has been successfully processed.',
                'notification_type': 'transaction',
                'is_read': False,
            },
            {
                'title': 'Security Alert',
                'message': 'New login detected from Chrome browser on macOS. If this wasn\'t you, please secure your account.',
                'notification_type': 'security',
                'is_read': True,
            },
            {
                'title': 'KYC Document Required',
                'message': 'Please upload your identity document to complete your account verification.',
                'notification_type': 'kyc',
                'is_read': False,
            },
            {
                'title': 'Card Payment Processed',
                'message': 'Your debit card ending in 1234 was used for a $25.99 payment at Amazon.',
                'notification_type': 'card',
                'is_read': True,
            },
            {
                'title': 'System Maintenance',
                'message': 'Scheduled maintenance will occur on Sunday 2:00 AM - 4:00 AM. Banking services may be temporarily unavailable.',
                'notification_type': 'system',
                'is_read': False,
            },
            {
                'title': 'Two-Factor Authentication Enabled',
                'message': 'Two-factor authentication has been successfully enabled for your account.',
                'notification_type': 'two_factor',
                'is_read': True,
            },
        ]

        created_count = 0
        for notification_data in notifications_data:
            try:
                notification = Notification.objects.create(
                    user=user,
                    channel='in_app',
                    title=notification_data['title'],
                    message=notification_data['message'],
                    notification_type=notification_data['notification_type'],
                    status='sent',
                    sent_at=timezone.now(),
                    read_at=timezone.now() if notification_data['is_read'] else None,
                )
                created_count += 1
                self.stdout.write(f'Created notification: {notification.title}')
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error creating notification: {e}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} sample notifications for user: {user.username}')
        )
