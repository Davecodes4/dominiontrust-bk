from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from notifications.models import NotificationTemplate, NotificationPreference
from notifications.services import NotificationService, TwoFactorService, AccountActivationService


class Command(BaseCommand):
    help = 'Setup default notification templates and test the notification system'
    
    def add_arguments(self, parser):
        parser.add_argument('--test-user', type=str, help='Username to test notifications with')
        parser.add_argument('--setup-templates', action='store_true', help='Setup default templates')
        parser.add_argument('--test-2fa', action='store_true', help='Test 2FA system')
        parser.add_argument('--test-activation', action='store_true', help='Test account activation')
    
    def handle(self, *args, **options):
        if options['setup_templates']:
            self.setup_templates()
        
        if options['test_user']:
            username = options['test_user']
            try:
                user = User.objects.get(username=username)
                
                if options['test_2fa']:
                    self.test_2fa_system(user)
                elif options['test_activation']:
                    self.test_activation_system(user)
                else:
                    self.test_notification_system(user)
                    
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'User "{username}" not found')
                )
    
    def setup_templates(self):
        """Setup default notification templates"""
        self.stdout.write('Setting up notification templates...')
        
        templates = [
            # Account activation
            {
                'template_type': 'account_activation',
                'channel': 'email',
                'subject': 'Activate Your DominionTrust Bank Account',
                'title': 'Account Activation',
                'body_template': 'Welcome! Please activate your account by clicking the link in this email.',
                'html_template': '',  # Will use the HTML template file
                'is_default': True,
                'priority': 1
            },
            
            # 2FA Code
            {
                'template_type': 'two_factor_code',
                'channel': 'email',
                'subject': 'Your 2FA Verification Code',
                'title': '2FA Code',
                'body_template': 'Your verification code is: {{ verification_code }}',
                'html_template': '',
                'is_default': True,
                'priority': 1
            },
            
            {
                'template_type': 'two_factor_code',
                'channel': 'sms',
                'subject': '',
                'title': '2FA Code',
                'body_template': 'DominionTrust Bank: Your verification code is {{ verification_code }}. Valid for 10 minutes.',
                'html_template': '',
                'is_default': True,
                'priority': 1
            },
            
            # Security Alert
            {
                'template_type': 'security_alert',
                'channel': 'email',
                'subject': 'Security Alert - DominionTrust Bank',
                'title': 'Security Alert',
                'body_template': 'We detected suspicious activity on your account. Please review immediately.',
                'html_template': '',
                'is_default': True,
                'priority': 1
            },
            
            # Transaction notifications
            {
                'template_type': 'transaction_created',
                'channel': 'email',
                'subject': 'Transaction Notification',
                'title': 'New Transaction',
                'body_template': 'A new transaction of ${{ amount }} has been processed on your account.',
                'html_template': '',
                'is_default': True,
                'priority': 2
            },
            
            {
                'template_type': 'transaction_completed',
                'channel': 'email',
                'subject': 'Transaction Completed',
                'title': 'Transaction Completed',
                'body_template': 'Your transaction of ${{ amount }} has been completed successfully.',
                'html_template': '',
                'is_default': True,
                'priority': 2
            },
            
            # Welcome message
            {
                'template_type': 'welcome_message',
                'channel': 'email',
                'subject': 'Welcome to DominionTrust Bank',
                'title': 'Welcome',
                'body_template': 'Welcome to DominionTrust Bank! Your account has been created successfully.',
                'html_template': '',
                'is_default': True,
                'priority': 2
            },
            
            # In-app notifications
            {
                'template_type': 'transaction_created',
                'channel': 'in_app',
                'subject': '',
                'title': 'New Transaction',
                'body_template': 'Transaction of ${{ amount }} processed',
                'html_template': '',
                'is_default': True,
                'priority': 2
            },
            
            {
                'template_type': 'security_alert',
                'channel': 'in_app',
                'subject': '',
                'title': 'Security Alert',
                'body_template': 'Suspicious activity detected on your account',
                'html_template': '',
                'is_default': True,
                'priority': 1
            },
        ]
        
        created_count = 0
        for template_data in templates:
            template, created = NotificationTemplate.objects.get_or_create(
                template_type=template_data['template_type'],
                channel=template_data['channel'],
                defaults=template_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'Created template: {template}')
            else:
                self.stdout.write(f'Template already exists: {template}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Setup complete! Created {created_count} new templates.')
        )
    
    def test_notification_system(self, user):
        """Test the notification system"""
        self.stdout.write(f'Testing notification system for user: {user.username}')
        
        notification_service = NotificationService()
        
        # Test transaction notification
        notifications = notification_service.send_notification(
            user=user,
            notification_type='transaction',
            template_type='transaction_created',
            context_data={
                'user_name': user.get_full_name() or user.username,
                'transaction_id': 'TEST-001',
                'transaction_type': 'Deposit',
                'amount': '100.00',
                'currency': 'USD',
                'description': 'Test deposit',
                'date': '2024-01-01',
                'account_name': 'Checking',
                'account_number': '1234',
                'balance': '1000.00',
                'reference': 'REF-001'
            }
        )
        
        self.stdout.write(f'Sent {len(notifications)} transaction notifications')
        
        # Test security alert
        notifications = notification_service.send_notification(
            user=user,
            notification_type='security',
            template_type='security_alert',
            context_data={
                'user_name': user.get_full_name() or user.username,
                'alert_type': 'Suspicious Login',
                'alert_description': 'Login from new device',
                'event_time': '2024-01-01 10:00:00',
                'ip_address': '192.168.1.1',
                'location': 'New York, NY',
                'device_info': 'Chrome on Windows',
                'risk_level': 'medium'
            }
        )
        
        self.stdout.write(f'Sent {len(notifications)} security notifications')
        
        self.stdout.write(
            self.style.SUCCESS('Notification system test completed!')
        )
    
    def test_2fa_system(self, user):
        """Test the 2FA system"""
        self.stdout.write(f'Testing 2FA system for user: {user.username}')
        
        two_factor_service = TwoFactorService()
        
        # Setup 2FA
        result = two_factor_service.setup_2fa(user, method='email')
        
        if result['success']:
            self.stdout.write(
                self.style.SUCCESS(f'2FA setup initiated: {result["message"]}')
            )
            
            # Simulate verification (you'd need to get the code from the database)
            from notifications.models import TwoFactorCode
            latest_code = TwoFactorCode.objects.filter(
                user=user,
                purpose='setup'
            ).order_by('-created_at').first()
            
            if latest_code:
                self.stdout.write(f'Generated setup code: {latest_code.code}')
                
                # Verify setup
                verify_result = two_factor_service.verify_setup(user, latest_code.code)
                
                if verify_result['success']:
                    self.stdout.write(
                        self.style.SUCCESS(f'2FA setup completed: {verify_result["message"]}')
                    )
                    self.stdout.write(f'Backup codes: {verify_result["backup_codes"]}')
                else:
                    self.stdout.write(
                        self.style.ERROR(f'2FA setup failed: {verify_result["error"]}')
                    )
        else:
            self.stdout.write(
                self.style.ERROR(f'2FA setup failed: {result["error"]}')
            )
    
    def test_activation_system(self, user):
        """Test the account activation system"""
        self.stdout.write(f'Testing account activation for user: {user.username}')
        
        activation_service = AccountActivationService()
        
        # Send activation email
        success = activation_service.send_activation_email(user, 'test-token-123')
        
        if success:
            self.stdout.write(
                self.style.SUCCESS('Activation email sent successfully!')
            )
            
            # Simulate activation
            success = activation_service.activate_account(user)
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS('Account activated successfully!')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('Account activation failed!')
                )
        else:
            self.stdout.write(
                self.style.ERROR('Failed to send activation email!')
            ) 
 