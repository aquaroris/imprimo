imprimo
=======

a Tool to aid Modern Students of Computer Science in the Replication of
Electric Palimpsests.

Some files in the repo that ought to be linked from a CDN instead:
* static/imprimo/css/skeleton.css

Note that you will have to fix the js links at the end of main.html and link
them from a CDN (they are currently set up in the manner for cdnjs)

* static/imprimo/css/skeleton.css is copyrighted by Dave Gamache. It is not modified.
* static/imprimo/css/layout.css is copyrighted by Dave Gamache. I have heavily modified it.

TODO:
* Fix "Fell Types" font-face
* Remove symbolic links in main directory.
* Actually test printing for errors.
* Actually send the lpr command to print
* Delete jobs from database after they are done.

To set up:

Assunming that you already have django installed
and a Django project set up. Developed only on
Django 1.5 and not tested for any other versions.
    pip install paramiko # this is an SSH Library
    pip install django-celery # A queueing library
Continue configuring celery for your project as in
[first-steps-with-django][]

To add to a git-version controlled Django project,
    cd /path/to/project
    git submodule add https://github.com/aquaroris/imprimo.git
Add this to your `INSTALLED_APPS` and `urls.py` and
ensure that your media directory is writable by Django.
    python manage.py syncdb
For the app to properly function a celery worker needs to be running.

[first-steps-with-django]: http://docs.celeryproject.org/en/latest/django/first-steps-with-django.html "Celery: First Steps with Django"
