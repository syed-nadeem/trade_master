from django.http import HttpResponse, JsonResponse
from django.template import loader
from datetime import datetime
from dateutil.relativedelta import relativedelta
from apps.authentication.decorators import custom_login_required
from pathlib import Path
import json
import os
import traceback


@custom_login_required
def datahub_customers(request):
    context = {"segment": "datahub_customers", "page": "Data Hub / Processed Data / Customers"}
    html_template = loader.get_template('scrappers/datahub_customers.html')
    return HttpResponse(html_template.render(context, request))


