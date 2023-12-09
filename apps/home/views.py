from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt


@login_required
def index(request):
    context = {'page': 'Dashboard', 'segment': 'index'}
    context["current_user"] = request.user
    html_template = loader.get_template('home/index.html')
    return HttpResponse(html_template.render(context, request))


@login_required
def profile(request):
    context = {'page': 'Profile', 'segment': 'profile'}
    context["current_user"] = request.user
    html_template = loader.get_template('home/profile.html')
    return HttpResponse(html_template.render(context, request))


@login_required
def users(request):
    context = {'page': 'Users', 'segment': 'users'}
    context["current_user"] = request.user
    html_template = loader.get_template('home/users.html')
    return HttpResponse(html_template.render(context, request))


@login_required
def add_user(request):
    context = {'page': 'Add User', 'segment': 'users'}
    context["current_user"] = request.user
    html_template = loader.get_template('home/add_user.html')
    return HttpResponse(html_template.render(context, request))


@login_required
def get_all_users(request):
    context = {}
    try:
        users = User.objects.all()
        user_data = []
        for user in users:
            data = {}
            data['id'] = user.id
            data['first_name'] = user.first_name if user.first_name else "NA"
            data['last_name'] = user.last_name if user.last_name else "NA"
            data['email'] = user.email if user.email else "NA"
            data['status'] = "Active" if user.is_active else "Disabled"
            data['is_superuser'] = request.user.is_superuser
            user_data.append(data)
        context['data'] = user_data
        return JsonResponse(context, status=200, safe=False)
    except Exception:
        return JsonResponse(context, status=404, safe=False)


def delete_user(request, user_id):
    response = {}
    try:
        user = User.objects.get(id=user_id)
        if not user.is_superuser:
            user.delete()
        else:
            raise ValueError("Cannot delete super user")

        response["message"] = "User deleted successfully!"
        response["message_type"] = "success"
        response["status"] = 200
        return JsonResponse(response, status=200, safe=False)
    except Exception as e:
        response["message"] = str(e)
        response["message_type"] = "error"
        response["status"] = 400
        return JsonResponse(response, status=400, safe=False)


def add_sftp_form(request):
    try:
        context = {}
        email = request.POST.get("email", None)
        first_name = request.POST.get("first_name", None)
        last_name = request.POST.get("last_name", None)
        password = request.POST.get("password", None)

        user = User.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            username=email,
            email=email,
            password=password)
        context['message'] = "scrapper added successfully"
        context['status'] = 200
        context['message_type'] = "success"

        return JsonResponse(context, status=200, safe=False)
    except Exception as e:
        context['message'] = "User with email already exists"
        context['message_type'] = "error"
        context['status'] = 400
        return JsonResponse(context, status=400, safe=False)
