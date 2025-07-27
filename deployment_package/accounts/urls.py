from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Security
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('transfer-pin/', views.TransferPinView.as_view(), name='transfer-pin'),
    path('transfer-pin/check/', views.CheckTransferPinView.as_view(), name='check-transfer-pin'),
    path('transfer-pin/verify/', views.VerifyTransferPinView.as_view(), name='verify-transfer-pin'),
    path('notifications/', views.UpdateNotificationSettingsView.as_view(), name='update-notifications'),
    
    # Email Verification
    path('verify-email/<str:token>/', views.EmailVerificationView.as_view(), name='verify-email'),
    path('resend-verification/', views.ResendVerificationView.as_view(), name='resend-verification'),
    
    # Profile Management
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/complete/', views.ProfileCompletionView.as_view(), name='profile-complete'),
    path('kyc/update/', views.KYCUpdateView.as_view(), name='kyc-update'),
    
    # KYC Document Management
    path('kyc/documents/upload/', views.KYCDocumentUploadView.as_view(), name='kyc-document-upload'),
    path('kyc/documents/', views.KYCDocumentListView.as_view(), name='kyc-documents'),
    path('kyc/documents/<uuid:pk>/', views.KYCDocumentDetailView.as_view(), name='kyc-document-detail'),
    path('kyc/status/', views.kyc_status, name='kyc-status'),
    
    # Account Management
    path('accounts/', views.BankAccountListView.as_view(), name='bank-accounts'),
    path('accounts/<uuid:pk>/', views.BankAccountDetailView.as_view(), name='bank-account-detail'),
    path('accounts/<uuid:account_id>/summary/', views.account_summary, name='account-summary'),
    
    # Dashboard
    path('dashboard/', views.user_dashboard, name='dashboard'),
]