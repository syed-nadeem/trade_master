from django.shortcuts import render, redirect
from django.contrib.auth import authenticate
from .forms import LoginForm, SignUpForm
import hashlib
from django.contrib.auth import logout
import traceback


def login_view(request):
    form = LoginForm(request.POST or None)

    msg = None

    if request.method == "POST":

        if form.is_valid():
            email = form.cleaned_data.get("email")
            password = form.cleaned_data.get("password")
            password = hashlib.sha256(password.encode('utf8')).hexdigest()
            user = Users.objects.filter(email=email, password=password).first()
            if user is not None:
                if user.data_authenticated:
                    # login(request, user)
                    request.session["user_id"] = str(user._id)
                    request.session["username"] = user.name
                    request.session["roles"] = user.roles
                    # request.session.set_expiry(1000)
                    return redirect("/")
                else:
                    msg = "User is not authorized."
            else:
                msg = 'Invalid credentials'
        else:
            msg = 'Error validating the form'

    return render(request, "accounts/login.html", {"form": form, "msg": msg})


def register_user(request):
    msg = None
    success = False

    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get("username")
            raw_password = form.cleaned_data.get("password1")
            authenticate(username=username, password=raw_password)

            msg = 'Account created successfully.'
            success = True

            # return redirect("/login/")

        else:
            msg = 'Form is not valid'
    else:
        form = SignUpForm()

    return render(request, "accounts/register.html", {"form": form, "msg": msg, "success": success})


def logout_view(request):
    try:
        del request.session["user_id"]
        logout(request)

    except Exception:
        traceback.print_exc()
        return redirect("/login/")
    return redirect("/login/")
