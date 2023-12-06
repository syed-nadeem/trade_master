from django.shortcuts import redirect


def custom_login_required(function):
    def wrap(request, *args, **kwargs):
        if 'user_id' in request.session:
            return function(request, *args, **kwargs)
        else:
            return redirect('/login/')

    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap
