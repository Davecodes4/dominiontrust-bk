from django.urls import path
from . import views
from . import transfer_views

urlpatterns = [
    # Transaction Management
    path('transactions/', views.TransactionListView.as_view(), name='transactions'),
    path('transactions/<uuid:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    path('transactions/<uuid:transaction_id>/status/', views.transaction_status, name='transaction-status'),
    path('transactions/pending/', views.pending_transactions, name='pending-transactions'),
    
    # Admin-only transaction management
    path('admin/transactions/pending/', views.admin_pending_transactions, name='admin-pending-transactions'),
    path('admin/transactions/<uuid:transaction_id>/confirm/', views.admin_confirm_transaction, name='admin-confirm-transaction'),
    path('admin/transactions/<uuid:transaction_id>/fail/', views.admin_fail_transaction, name='admin-fail-transaction'),
    
    # Transfer Requests (New Enhanced API)
    path('transfer-requests/', transfer_views.TransferRequestListCreateView.as_view(), name='transfer-requests'),
    path('transfer-requests/<uuid:pk>/', transfer_views.TransferRequestDetailView.as_view(), name='transfer-request-detail'),
    path('transfer-fees/', transfer_views.get_transfer_fees, name='transfer-fees'),
    path('validate-account/', transfer_views.validate_account_number, name='validate-account'),
    path('validate-routing/', transfer_views.validate_routing_number, name='validate-routing'),
    
    # Legacy Banking Operations (Keep for backward compatibility)
    path('transfer/', views.transfer_funds, name='transfer-funds'),
    path('transfer-with-pin/', views.transfer_with_pin, name='transfer-with-pin'),
    path('external-transfer/', views.external_transfer, name='external-transfer'),
    path('deposit/', views.deposit_funds, name='deposit-funds'),
    path('withdraw/', views.withdraw_funds, name='withdraw-funds'),
    
    # Card Management
    path('cards/', views.CardListView.as_view(), name='cards'),
    path('cards/<uuid:pk>/', views.CardDetailView.as_view(), name='card-detail'),
    path('card-fees/', views.get_card_fees, name='card-fees'),
] 