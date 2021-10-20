from . import views

from django.urls import path, re_path, include
from django.views.generic.base import RedirectView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('children', views.ChildViewSet, basename='Child')
router.register('guardians', views.GuardianViewSet, basename='Guardian')
router.register('checks', views.CheckViewSet, basename='Check')
router.register('users', views.UserViewSet, basename='User')

app_view = RedirectView.as_view(url='/static/index.html', permanent=True)
favicon_view = RedirectView.as_view(url='/static/favicon.ico', permanent=True)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/login/', views.LoginView.as_view(), name='Login'),
    path('api/scan/', views.ScanView.as_view(), name='Scan'),
    re_path(r'^favicon\.ico$', favicon_view),
    re_path('', app_view),
    re_path(r'^(?:.*)/?$', app_view),
]
