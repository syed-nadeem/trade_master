from django.urls import path
from apps.home import views

app_name = 'home'
urlpatterns = [

    # The home page
    path('', views.index, name='home'),
    path('git_branches', views.git_branches, name='git_branches'),
    path('add_scrapper', views.add_scrapper, name='add_scrapper'),
    path('add_sftp', views.add_sftp, name='add_sftp'),
    path('add_scrapper_details', views.add_scrapper_details, name='add_scrapper_details'),
    path('add_sftp_details', views.add_sftp_details, name='add_sftp_details'),
    path('data_migration', views.data_migration, name='data_migration'),
    path('scrapper_details', views.scrapper_details, name='scrapper_details'),
    path('sftp_details', views.sftp_details, name='sftp_details'),
    path('add_customer_data', views.migrate_data_between_collections, name='add_customer_data'),
    path('get_current_branch', views.get_current_branch, name='get_current_branch'),
    path('get_api_current_branch', views.get_api_current_branch, name='get_api_current_branch'),
    path('get_scrapper_details', views.get_scrapper_details, name='get_scrapper_details'),
    path('get_sftp_details', views.get_sftp_details, name='get_sftp_details'),
    path('get_scrapper_details_by_id', views.get_scrapper_details_by_id, name='get_scrapper_details_by_id'),
    path('get_scrapper_meters_by_name', views.get_scrapper_meters_by_name, name='get_scrapper_meters_by_name'),
    path('get_sftp_details_by_id', views.get_sftp_details_by_id, name='get_sftp_details_by_id'),
    path('delete_sftp_details_by_id', views.delete_sftp_details_by_id, name='delete_sftp_details_by_id'),
    path('save_scrapper_details_by_id', views.save_scrapper_details_by_id, name='save_scrapper_details_by_id'),
    path('save_sftp_details_by_id', views.save_sftp_details_by_id, name='save_sftp_details_by_id'),
    path('change_branch', views.change_branch, name='change_branch'),
    path('fetch_branches', views.fetch_branches, name='fetch_branches'),
    path('roles', views.roles, name='roles'),
    path('profile', views.profile, name='profile'),
    path('get_all_users', views.get_all_users, name='get_all_users'),
    path('make_user_authorize/<str:user_id>', views.make_user_authorize, name='make_user_authorize'),

    # Matches any html file
    # re_path(r'^.*\.*', views.pages, name='pages'),

]
