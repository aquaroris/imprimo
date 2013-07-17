from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.core.exceptions import ObjectDoesNotExist

from .models import JobSession
from .forms import JobRequestForm
from .tasks import handleJob

import random
import json

def main(request):
    form = JobRequestForm
    request.session['cur_id'] = 0.5#random.random()
    return render(request, 'imprimo/main.html', {
            'form': form,
            'keys': [request.session['cur_id'], request.session.get("prev_id", "none")]
    })

# Handle AJAX submissions from the form
def submit(request):
    if request.method == 'POST':
        form = JobRequestForm(request.POST, request.FILES)
        if form.is_valid():
            # handle form
            job = JobSession(
                    status="Starting task...",
                    all_status="Starting task...",
                    attachedfile=form.cleaned_data['attachedfile'])
            job.save()
            handleJob.delay(
                    job,
                    form.cleaned_data['username'],
                    form.cleaned_data['password'])
            returnmessage = "Uploading done!"
            request.session['prev_id'] = job.pk
            return HttpResponse(returnmessage)
        else:
            return HttpResponse("Invalid Form")
    else:
        raise Http404

# return status
def jobstatus(request):
    if not request.session.get('prev_id'):
        return HttpResponse('')
    job = JobSession.objects.get(id=request.session['prev_id'])
    return HttpResponse(json.dumps(job.print_status().split('\n')))

def prevstatus(request):
    try:
        job = JobSession.objects.get(id=request.session['prev_id'])
        return HttpResponse(json.dumps(job.print_all_status().split('\n')))
    except (ObjectDoesNotExist, KeyError):
        return HttpResponse('')
