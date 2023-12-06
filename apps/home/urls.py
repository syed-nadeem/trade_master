from django.urls import path
from apps.home import views

app_name = 'home'
urlpatterns = [
    path('', views.index, name='home'),
    path('profile', views.profile, name='profile'),
    # Matches any html file
    # re_path(r'^.*\.*', views.pages, name='pages'),

]
