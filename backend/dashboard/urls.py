from django.urls import path
from .views import DashboardStatsView, AdminDashboardView, SchoolSettingsView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('admin/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('settings/', SchoolSettingsView.as_view(), name='school_settings'),
]
