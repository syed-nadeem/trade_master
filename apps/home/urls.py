from django.urls import path
from apps.home import views

app_name = 'home'
urlpatterns = [
    path('', views.index, name='home'),
    path('profile', views.profile, name='profile'),
    path('users', views.users, name='users'),
    path('get_all_users', views.get_all_users, name='get_all_users'),
    path('delete_user/<str:user_id>', views.delete_user, name='delete_user'),
    path('add_user', views.add_user, name='add_user'),
    path('add_sftp_form', views.add_sftp_form, name='add_sftp_form'),
    # Matches any html file
    # re_path(r'^.*\.*', views.pages, name='pages'),

]
