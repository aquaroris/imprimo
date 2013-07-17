# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url

urlpatterns = patterns('imprimo.views',
        url(r'^submit/$', 'submit', name='submit'),
        url(r'^jobstatus/$', 'jobstatus', name='jobstatus'),
        url(r'^prevstatus/$', 'prevstatus', name='prevstatus'),
        url(r'^$', 'main', name='main'),
)
