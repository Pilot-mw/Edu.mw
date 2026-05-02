from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/students/', include('students.urls')),
    path('api/teachers/', include('teachers.urls')),
    path('api/news/', include('news.urls')),
    path('api/academics/', include('academics.urls')),
    path('api/fees/', include('fees.urls')),
    path('api/results/', include('results.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/admissions/', include('admissions.urls')),
    path('api/memos/', include('memos.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
