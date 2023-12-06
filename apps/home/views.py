from django import template
from apps.authentication.decorators import custom_login_required
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.template import loader
from django.urls import reverse
from django.conf import settings
import os
from pathlib import Path
from django.views.decorators.csrf import csrf_exempt
import datetime
from django.shortcuts import redirect
import traceback
from django.contrib.auth.decorators import login_required


@login_required
def index(request):
    context = {'segment': 'index', 'scrapper_info': "res"}

    html_template = loader.get_template('home/index.html')
    return HttpResponse(html_template.render(context, request))


@login_required
def profile(request):
    context = {'page': 'Profile', 'segment': 'profile'}
    context["user"] = "Users.objects.get(_id=request.session['user_id'])"
    html_template = loader.get_template('home/profile.html')
    return HttpResponse(html_template.render(context, request))
