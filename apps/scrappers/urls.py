from django.urls import path
from apps.scrappers import views

app_name = 'scrappers'
urlpatterns = [

    path('datahub_customers', views.datahub_customers, name='datahub_customers'),


]
