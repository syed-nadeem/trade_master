Trade Master
===================================



Quick start
-----------

1. Set you project directory
2. Clone the code from repository

   ```git clone <link>```
3. Set current working directory as "trade-master"

   ```cd django-li-service```
4. set python virtualenv using below command

   ``` python3 -m venv env```
5. Activate python environment

       On Linux use 

       ``` source env/bin/activate```

       On Windows use  
       ```source env\Scripts\activate```
6. Install or upgrade pip

   ```pip install --upgrade pip```
7. Install python packages/dependencies

   ```pip install -r requirements.txt```

8. Make and migrate database migrations
    ```
    python manage.py makemigrations
    python manage.py migrate 
    ```
9. Run Django Development Server

   ```python manage.py runserver ```

flake8 . --extend-exclude=dist,build,static,migrations,env --ignore=E501