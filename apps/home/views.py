from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required


@login_required
def index(request):
    context = {'page': 'Dashboard', 'segment': 'index'}

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
    html_template = loader.get_template('home/roles.html')
    return HttpResponse(html_template.render(context, request))


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
        response["status"] = 404
        return JsonResponse(response, status=404, safe=False)
