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


@custom_login_required
def index(request):
    res = []
    scrapper_list = []
    agg_res = []
    Agg_resuls =[]
    for sc in Agg_resuls:
        data = None
        data = AggregationLogs.objects.filter(aggregation_name=sc).order_by('-_id')[0]
        if data:
            agg_res.append(data)
    queryResult = ScrapperLogs.objects.order_by('-_id').distinct("scrapper_name")
    for sc in queryResult:
        data = None
        data = ScrapperLogs.objects.filter(scrapper_name=sc).order_by('-_id')[0]
        if data:
            details = ScrapperDetails.objects.filter(name=data['scrapper_name'])
            if len(details) > 1:
                if 'period' and 'cron_time' in details[0]:
                    data['period'] = details[0]['period']
                    data['cron_time'] = details[0]['cron_time']
                    pass
            res.append(data)
    scrapper_lst = ScrapperDetails.objects.distinct("country")
    scrapper_lst = sorted(scrapper_lst, key=lambda x: x.lower())
    for sl in scrapper_lst:
        temp_list = []
        for data in ScrapperDetails.objects.filter(country=sl):
            is_available = [x for x in temp_list if x["name"] == data.name]
            if is_available:
                continue
            temp = {
                "name": data.name,
                "primary_responsible": data.primary_responsible if data.primary_responsible else "NA",
                "secondary_responsible": data.secondary_responsible if data.secondary_responsible else "NA",
                # "collection_name": data.collection_name,
                # "type": data.type,
            }
            temp_list.append(temp)
            temp = None
        temp_list.sort(key=lambda x: x['name'], reverse=False)

        scrapper_list.append({sl: temp_list})

    today = datetime.datetime.today()
    # st_date = str(today.year) + '-' + f'{today.month:02d}'
    total_scrapper = ScrapperDetails.objects.count()
    success = ScrapperLogs.objects(created_at__gte=datetime.datetime(today.year, today.month, today.day),
                                   status="Successful").count()
    failed = ScrapperLogs.objects(created_at__gte=datetime.datetime(today.year, today.month, today.day),
                                  status="Failed").count()
    total_today = ScrapperLogs.objects(created_at__gte=datetime.datetime(today.year, today.month, today.day)).count()
    context = {'segment': 'index', 'scrapper_info': res, 'aggreration_info': agg_res, 'scrapper_list': scrapper_list,
               'total_success': success,
               'total_failed': failed, 'total': total_scrapper, "total_today": total_today}

    html_template = loader.get_template('home/index.html')
    return HttpResponse(html_template.render(context, request))


@custom_login_required
def roles(request):
    if "super_admin" not in request.session['roles']:
        return redirect("/")
    context = {'page': 'User Roles', 'segment': 'roles', }
    # context["users"] = Users.objects.all()
    html_template = loader.get_template('home/roles.html')
    return HttpResponse(html_template.render(context, request))


@custom_login_required
def scrapper_details(request):
    context = {'page': 'Scrapper Details', 'segment': 'scrapper_details'}
    html_template = loader.get_template('home/scrapper_details.html')
    return HttpResponse(html_template.render(context, request))


@custom_login_required
def sftp_details(request):
    context = {'page': 'SFTP Details', 'segment': 'sftp_details'}
    html_template = loader.get_template('home/sftp_details.html')
    return HttpResponse(html_template.render(context, request))


@custom_login_required
def profile(request):
    context = {'page': 'Profile', 'segment': 'profile'}
    context["user"] = Users.objects.get(_id=request.session['user_id'])
    html_template = loader.get_template('home/profile.html')
    return HttpResponse(html_template.render(context, request))


@custom_login_required
def add_scrapper(request):
    context = {'page': 'Scraper Details / ADD ', 'segment': 'scrapper_details'}
    html_template = loader.get_template('home/add_scrapper.html')
    return HttpResponse(html_template.render(context, request))


@custom_login_required
def add_sftp(request):
    context = {'page': 'SFTP Details / ADD ', 'segment': 'sftp_details'}
    html_template = loader.get_template('home/add_sftp.html')
    return HttpResponse(html_template.render(context, request))


@custom_login_required
def git_branches(request):
    all_branches = get_all_branches()
    all_api_branches = get_all_api_branches()
    context = {'page': 'Branches', 'segment': 'git_branches'}
    branches_list = []
    api_branches_list = []
    for branch in all_branches:
        b = branch.split('origin/')
        if b:
            branches_list.append(b[1])
    for branch in all_api_branches:
        b = branch.split('origin/')
        if b:
            api_branches_list.append(b[1])
    domain_list = settings.APP_DOMAINS
    # api_domain_list = settings.API_DOMAINS
    context['branches_list'] = branches_list
    context['api_branches_list'] = api_branches_list
    context['domain_list'] = domain_list
    # context['api_domain_list'] = api_domain_list
    html_template = loader.get_template('home/branches.html')
    return HttpResponse(html_template.render(context, request))


def data_migration(request):
    context = {'page': 'Data Migration', 'segment': 'data_migration'}
    cluster = pymongo.MongoClient(
        host=Path(os.environ.get('MONGO_DB_PATH')).read_text().strip()).get_database()
    client = cluster.client
    db = client[cluster.name]
    collection = db["gg_customers"]
    customers_list = []
    for record in collection.aggregate([{'$group': {'_id': {'name': '$name'}}}]):
        customers_list.append(record['_id']['name'])
    context['customer_list'] = customers_list
    context['meter_type_list'] = ["Electricity", "Gas", "Water", "Heating"]

    html_template = loader.get_template('home/data_migration.html')
    return HttpResponse(html_template.render(context, request))


def get_scrapper_details(request):
    try:
        context = {}
        user = Users.objects.get(_id=request.session['user_id'])
        data_array = []
        scrper_details = ScrapperDetails.objects.filter()
        for row in scrper_details:
            data = {}
            data['id'] = str(row['_id'])
            data['name'] = row['name'] if "name" in row else "NA"
            data['username'] = row['username'] if "username" in row else "NA"
            data['password'] = row['password'] if "password" in row else "NA"
            data['status'] = row['status'] if "status" in row else "NA"
            data['country'] = row['country'] if "country" in row else "NA"
            data['customer'] = row['customer'] if "customer" in row else "NA"
            data['type'] = row['type'] if "type" in row else "NA"
            data['web_id'] = row['web_id'] if "web_id" in row else "NA"
            data['url'] = row['url'] if "url" in row else "NA"
            data['displayed_on_app'] = row['Displayed_on_app'] if "Displayed_on_app" in row else False
            data['cronjob'] = row['cronjob'] if "cronjob" in row else False
            data['is_super_user'] = True if "super_admin" in user.roles else False
            data['collection_name'] = row['collection_name'] if "collection_name" in row else "NA"
            data['aggregation_time'] = row['aggregation_time'] if "aggregation_time" in row else "NA"
            data['cron_time'] = row['cron_time'] if "cron_time" in row else "NA"
            data['period'] = row['period'] if "period" in row else "NA"
            data['description'] = row['description'] if "description" in row else "NA"
            data_array.append(data)
        context['data'] = data_array
        context['is_super_user'] = True if "super_admin" in user.roles else False
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        return JsonResponse(context, status=404, safe=False)


def get_sftp_details(request):
    try:
        context = {}
        user = Users.objects.get(_id=request.session['user_id'])
        data_array = []
        sftp_details = SftpDetails.objects.filter(is_deleted=False)
        for row in sftp_details:
            data = {}
            data['id'] = str(row['_id'])
            data['customer_name'] = row['customer_name'] if "customer_name" in row else "NA"
            data['host'] = row['host'] if "host" in row else "host"
            data['username'] = row['username'] if "username" in row else "NA"
            data['password'] = row['password'] if "password" in row else "NA"
            data['port'] = row['port'] if "port" in row else None
            data['server_directory'] = row['server_directory'] if "server_directory" in row else "NA"
            data['user_directory'] = row['user_directory'] if "user_directory" in row else "NA"
            data['created_at'] = row['created_at'] if "created_at" in row else None
            data['is_super_user'] = True if "super_admin" in user.roles else False
            data_array.append(data)
        context['data'] = data_array
        context['is_super_user'] = True if "super_admin" in user.roles else False
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        return JsonResponse(context, status=404, safe=False)


def get_current_branch(request):
    try:
        lines = ""
        domain = request.GET.get("domain", None).strip()
        userhome = os.path.expanduser('~')

        file_path = userhome + "/.qa/app-" + domain + ".Trade Master.io-current.txt"
        with open(file_path) as f:
            lines = f.readlines()
        if lines:
            lines = lines[0]
            lines = lines.replace("\n", "")
        context = {
            'branch': lines,
        }
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        return JsonResponse({"message": "No branch found."}, status=404, safe=False)


def get_api_current_branch(request):
    try:
        lines = ""
        domain = request.GET.get("domain", None).strip()
        userhome = os.path.expanduser('~')

        file_path = userhome + "/.qa/api-" + domain + ".Trade Master.io-current.txt"
        with open(file_path) as f:
            lines = f.readlines()
        if lines:
            lines = lines[0]
            lines = lines.replace("\n", "")
        context = {
            'branch': lines,
        }
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        return JsonResponse({"branch": ""}, status=404, safe=False)


@custom_login_required
def pages(request):
    context = {}
    try:

        load_template = request.path.split('/')[-1]
        if load_template == "profile.html":
            context["user"] = Users.objects.get(id=request.session['user'])

        if load_template == 'admin':
            return HttpResponseRedirect(reverse('admin:index'))
        context['segment'] = load_template
        context['page'] = load_template.replace(".html", "")

        html_template = loader.get_template('home/' + load_template)
        return HttpResponse(html_template.render(context, request))

    except template.TemplateDoesNotExist:
        traceback.print_exc()

        html_template = loader.get_template('home/page-404.html')
        return HttpResponse(html_template.render(context, request))

    except Exception:
        traceback.print_exc()
        html_template = loader.get_template('home/page-500.html')
        return HttpResponse(html_template.render(context, request))


def make_user_authorize(request, user_id):
    response = {}

    try:
        user = Users.objects.get(_id=user_id)
        if not user.data_authenticated:
            user.data_authenticated = True
            user.save()
            response["message"] = "User made authorized successfully!"
            response["message_type"] = "success"
            response["status"] = 200
            return JsonResponse(response, status=200, safe=False)
        else:
            user.data_authenticated = False
            user.save()
            response["message"] = "User made un authorized successfully!"
            response["message_type"] = "success"
            response["status"] = 200
            return JsonResponse(response, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        return JsonResponse(response, status=404, safe=False)


def get_all_users(request):
    context = []
    response = {}
    # length = int(request.GET.get('length'))
    # start = int(request.GET.get('start'))
    # draw = int(request.GET.get('draw'))

    users = Users.objects.all()
    # [start:start + length]
    for row in users:
        data = {}
        data['id'] = str(row['_id'])
        data['name'] = row['name'] if "name" in row else "NA"
        data['email'] = row['email'] if "email" in row else "NA"
        data['country_code'] = row['country_code'] if "country_code" in row and len(row['country_code']) < 10 else "NA"
        data['status'] = row['status'] if "status" in row else "NA"
        data['roles'] = row['roles'] if "roles" in row else ['NA']
        data['data_auth'] = row['data_authenticated'] if "data_authenticated" in row else False
        context.append(data)
    response['data'] = context
    # count = Users.objects.count()
    # response['recordsTotal'] = count
    # response['recordsFiltered'] = count
    # response['draw'] = draw

    return JsonResponse(response, safe=False)


def change_branch(request):
    response = {}

    try:
        domain = request.GET.get("domain", None)
        branch = request.GET.get("branch", None).strip()
        api_branch = request.GET.get("api_branch", None)
        write_branch_in_file(domain, branch, "app")
        write_branch_in_file(domain, api_branch, "api")
        response["message"] = "Branch changed successfully!"
        response["message_type"] = "success"
        response["status"] = 200
        return JsonResponse(response, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        return JsonResponse(response, status=404, safe=False)


def fetch_branches(request):
    response = {}

    try:
        repo_path = settings.APP_REPO_PATH
        repo = git.Repo(repo_path)
        for remote in repo.remotes:
            remote.fetch()

        api_repo_path = settings.API_REPO_PATH
        api_repo = git.Repo(api_repo_path)
        for api_remote in api_repo.remotes:
            api_remote.fetch()
        response["message"] = "Branch changed successfully!"
        response["message_type"] = "success"
        response["status"] = 200
        return JsonResponse(response, status=200, safe=False)
    except Exception as e:
        traceback.print_exc()
        response["message"] = str(e)
        response["message_type"] = "error"
        response["status"] = 404

        return JsonResponse(response, status=404, safe=False)


def migrate_data_between_collections(request):
    response = {}
    try:
        meter_type_dict = {
            "electricity": "dk_meteringdata",
            "water": "dk_water",
            "heating": "dk_heating",
            "gas": "dk_gas",
        }
        type_array = []
        customer = request.GET.get("customer", None)
        meter_type = request.GET.get("meter_type", 'electricity').lower()
        meter_type = meter_type_dict[meter_type] if meter_type in meter_type_dict else "dk_meteringdata"
        cluster = pymongo.MongoClient(
            host=Path(os.environ.get('MONGO_DB_PATH')).read_text().strip()).get_database()
        client = cluster.client
        db = client[cluster.name]
        collection = db[meter_type]
        cus_add_collection = db["customer_addresses"]
        collection_new = db[meter_type + "_verified"]
        # dk_datahub_authorizations = db["dk_datahub_authorizations"]
        # dk_datahub_meteringpoints = db["dk_datahub_meteringpoints"]
        # get_cus = dk_datahub_authorizations.find({"customerName": {'$regex': customer}})
        # ids = [x['id'] for x in get_cus]
        # all_met = dk_datahub_meteringpoints.find({"authorization": {"$in": ids}})
        # meter_ids = [x['meteringPointId'] for x in all_met]

        get_cus_doc = cus_add_collection.find({"customer_name": {'$regex': customer}})
        for row in get_cus_doc:
            type_array.extend(row.get(request.GET.get("meter_type", None).lower(), []))
        type_array = list(set(type_array))

        try:
            collection_new.delete_many({"meteringPointId": {"$in": type_array}})
        except Exception:
            traceback.print_exc()
            pass
        collection_new.update_many({}, {"$set": {"deleted": True}})

        customers = collection.find({"meteringPointId": {"$in": type_array}})  # .limit(5)
        new_list = []
        for doc in customers:
            doc.pop("_id")
            doc['deleted'] = False
            new_list.append(doc)
        if new_list:
            collection_new.insert_many(new_list)
            response["message"] = "Data migrated successfully"
            response["message_type"] = "success"
            response["status"] = 200
            return JsonResponse(response, status=200, safe=False)
        else:
            response["message"] = "No data to migrate for customer " + customer
            response["message_type"] = "error"
            response["status"] = 400
            return JsonResponse(response, status=200, safe=False)

    except Exception:
        traceback.print_exc()
        response["message"] = "Something went wrong!"
        response["message_type"] = "error"
        response["status"] = 200
        return JsonResponse(response, status=404, safe=False)


def get_scrapper_details_by_id(request):
    try:
        context = {}
        id = request.GET.get("id", None)
        scrper_details = None
        aes_cipher = AESCipher(settings.SECRET_KEY)
        try:
            scrper_details = ScrapperDetails.objects.get(_id=ObjectId(id))
        except Exception:
            traceback.print_exc()
            pass
        if scrper_details:
            data = {}
            data['id'] = str(scrper_details['_id'])
            data['name'] = scrper_details['name'] if "name" in scrper_details else "NA"
            data['username'] = scrper_details['username'] if "username" in scrper_details else "NA"
            data['password'] = aes_cipher.decrypt(scrper_details['password']) if "password" in scrper_details else "NA"
            data['customer'] = scrper_details['customer'] if "customer" in scrper_details else "NA"
            data['cronjob'] = scrper_details['cronjob'] if "cronjob" in scrper_details else False
            data['period'] = scrper_details['period'] if "period" in scrper_details else "NA"
            data['collection_name'] = scrper_details['collection_name'] if "collection_name" in scrper_details else "NA"
            data['cron_time'] = scrper_details['cron_time'] if "cron_time" in scrper_details else "NA"
            data['aggregation_time'] = scrper_details[
                'aggregation_time'] if "aggregation_time" in scrper_details else "NA"
            data['displayed_on_app'] = scrper_details[
                'Displayed_on_app'] if "Displayed_on_app" in scrper_details else False
            data['url'] = scrper_details['url'] if "url" in scrper_details else "NA"
            data['status'] = scrper_details['status'] if "status" in scrper_details else "todo"
        context['data'] = data
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        return JsonResponse(context, status=404, safe=False)


def get_scrapper_meters_by_name(request):
    try:
        context = {}
        scraper_name = request.GET.get("scraper_name", None)
        type = request.GET.get("type", "")
        type = type.split(",")
        type_dict = {
            "electricity": "dk_meteringdata",
            "water": "dk_water",
            "gas": "dk_gas",
            "heating": "dk_heating",
        }
        data = []
        cluster = pymongo.MongoClient(
            host=Path(os.environ.get('MONGO_DB_PATH')).read_text().strip()).get_database()
        client = cluster.client
        db = client[cluster.name]
        for typ in type:
            conn_name = type_dict.get(typ.strip().lower(), None)
            if conn_name and scraper_name:
                collection = db[conn_name]
                records = collection.aggregate([
                    {"$match": {"scrapper_name": scraper_name}},
                    {"$group": {"_id": "$meteringPointId", "address": {"$first": "$address"}}},
                    {"$project": {"meteringPointId": "$_id", "address": 1, "_id": 0}}
                ])
                new_list = [{"meteringPointId": x.get("meteringPointId", "NA"), "address": x.get("address", "NA"),
                             "type": typ.strip().title()} for x in records]
                data.extend(new_list)
        context['data'] = data
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        return JsonResponse(context, status=404, safe=False)


def get_sftp_details_by_id(request):
    try:
        context = {}
        id = request.GET.get("id", None)
        sftp_details = None
        aes_cipher = AESCipher(settings.SECRET_KEY)
        try:
            sftp_details = SftpDetails.objects.get(_id=ObjectId(id), is_deleted=False)
        except Exception:
            traceback.print_exc()
            pass
        if sftp_details:
            data = {}
            data['id'] = str(sftp_details['_id'])
            data['customer_name'] = sftp_details['customer_name'] if "customer_name" in sftp_details else "NA"
            data['host'] = sftp_details['host'] if "host" in sftp_details else "host"
            data['username'] = sftp_details['username'] if "username" in sftp_details else "NA"
            data['password'] = aes_cipher.decrypt(sftp_details['password']) if "password" in sftp_details else "NA"
            data['port'] = sftp_details['port'] if "port" in sftp_details else None
            data['server_directory'] = sftp_details['server_directory'] if "server_directory" in sftp_details else "NA"
            data['user_directory'] = sftp_details['user_directory'] if "user_directory" in sftp_details else "NA"
            data['created_at'] = sftp_details['created_at'] if "created_at" in sftp_details else "NA"
        context['data'] = data
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        return JsonResponse(context, status=404, safe=False)


def delete_sftp_details_by_id(request):
    try:
        context = {}
        id = request.GET.get("id", None)
        sftp_details = None
        try:
            sftp_details = SftpDetails.objects.get(_id=ObjectId(id))
        except Exception:
            traceback.print_exc()
            pass
        if sftp_details:
            sftp_details.is_deleted = True
            sftp_details.save()

        context['message'] = "sftp delete successfully"
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        return JsonResponse(context, status=404, safe=False)


@csrf_exempt
def save_scrapper_details_by_id(request):
    try:
        aes_cipher = AESCipher(settings.SECRET_KEY)
        context = {}
        username = request.POST.get("username", None)
        password = request.POST.get("password", None)
        customer = request.POST.get("customer", None)
        url = request.POST.get("url", None)
        cronjob = request.POST.get("cronjob", False)
        displayed_on_app = request.POST.get("displayed_on_app", False)
        id = request.POST.get("scrper_id", None)
        status = request.POST.get("status", "todo")
        period = request.POST.get("period", "period")
        collection_name = request.POST.get("collection_name", "NA")
        aggregation_time = request.POST.get("aggregation_time", "NA")
        cron_time = request.POST.get("cron_time", "NA")
        password = aes_cipher.encrypt(password)

        scrper_details = None
        try:
            scrper_details = ScrapperDetails.objects.get(_id=ObjectId(id))
        except Exception:
            traceback.print_exc()
            pass
        if cronjob == "on":
            cronjob = True
        if displayed_on_app == "on":
            displayed_on_app = True
        if scrper_details:
            scrper_details.username = username
            scrper_details.password = password
            scrper_details.customer = customer
            scrper_details.url = url
            scrper_details.status = status
            scrper_details.cronjob = cronjob
            scrper_details.Displayed_on_app = displayed_on_app
            scrper_details.period = period
            scrper_details.collection_name = collection_name
            scrper_details.aggregation_time = aggregation_time
            scrper_details.cron_time = cron_time
            scrper_details.save()
        context['message'] = "scrapper updated successfully"
        context['status'] = "success"
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        return JsonResponse(context, status=404, safe=False)


@csrf_exempt
def save_sftp_details_by_id(request):
    try:
        aes_cipher = AESCipher(settings.SECRET_KEY)
        context = {}
        username = request.POST.get("username", None)
        password = request.POST.get("password", None)
        customer_name = request.POST.get("customer_name", None)
        host = request.POST.get("host", None)
        id = request.POST.get("sftp_id", None)
        user_direc = request.POST.get("user_direc", '')
        server_direc = request.POST.get("server_direc", '')
        port = int(request.POST.get("port", 0))
        password = aes_cipher.encrypt(password)

        sftp_details = None
        try:
            sftp_details = SftpDetails.objects.get(_id=ObjectId(id))
        except Exception:
            traceback.print_exc()
            pass
        if sftp_details:
            sftp_details.username = username
            sftp_details.password = password
            sftp_details.customer_name = customer_name
            sftp_details.host = host
            sftp_details.port = port
            sftp_details.user_directory = user_direc
            sftp_details.server_directory = server_direc
            sftp_details.save()
        context['message'] = "scrapper updated successfully"
        context['status'] = "success"
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        return JsonResponse(context, status=404, safe=False)


@csrf_exempt
def add_scrapper_details(request):
    try:
        aes_cipher = AESCipher(settings.SECRET_KEY)
        context = {}
        username = request.POST.get("username", None)
        name = request.POST.get("name", None)
        country = request.POST.get("country", None)
        password = request.POST.get("password", None)
        customer = request.POST.get("customer", None)
        url = request.POST.get("url", None)
        cronjob = request.POST.get("cronjob", False)
        displayed_on_app = request.POST.get("displayed_on_app", False)
        status = request.POST.get("status", "todo")
        energy_type = request.POST.get("type", "water")
        period = request.POST.get("period", "period")
        collection_name = request.POST.get("collection_name", "NA")
        aggregation_time = request.POST.get("aggregation_time", "NA")
        cron_time = request.POST.get("cron_time", "NA")
        description = request.POST.get("description", "NA")
        password = aes_cipher.encrypt(password)

        if cronjob == "on":
            cronjob = True
        if displayed_on_app == "on":
            displayed_on_app = True
        ScrapperDetails.objects.create(name=name,
                                       username=username,
                                       password=password,
                                       customer=customer,
                                       url=url,
                                       status=status,
                                       country=country,
                                       cronjob=cronjob,
                                       Displayed_on_app=displayed_on_app,
                                       type=energy_type,
                                       description=description,
                                       period=period,
                                       collection_name=collection_name,
                                       aggregation_time=aggregation_time,
                                       cron_time=cron_time,
                                       )
        context['message'] = "scrapper updated successfully"
        context['status'] = "success"
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        context['message'] = "Something went wrong!"
        context['status'] = "failure"
        return JsonResponse(context, status=404, safe=False)


@csrf_exempt
def add_sftp_details(request):
    try:
        aes_cipher = AESCipher(settings.SECRET_KEY)
        context = {}
        username = request.POST.get("username", None)
        customer_name = request.POST.get("customer_name", None)
        host = request.POST.get("host", None)
        password = request.POST.get("password", None)
        user_direc = request.POST.get("user_direc", '')
        server_direc = request.POST.get("server_direc", '')
        port = int(request.POST.get("port", 0))

        password = aes_cipher.encrypt(password)

        SftpDetails.objects.create(customer_name=customer_name,
                                   username=username,
                                   password=password,
                                   host=host,
                                   port=port,
                                   server_directory=server_direc,
                                   user_directory=user_direc,
                                   created_at=datetime.datetime.now(),
                                   is_deleted=False
                                   )
        context['message'] = "scrapper updated successfully"
        context['status'] = "success"
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        traceback.print_exc()
        context['message'] = "Something went wrong!"
        context['status'] = "failure"
        return JsonResponse(context, status=404, safe=False)
