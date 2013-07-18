# -*- coding: utf-8 -*-

from django.db import models
from .validators import validate_printable
import os

class JobSession(models.Model):
    status = models.CharField(max_length=3000)
    all_status = models.CharField(max_length=48000)
    attachedfile = models.FileField(
            upload_to='imprimo',
            validators=[validate_printable])
    printer = models.CharField(max_length=12)

    def __unicode__(self):
        returnstring = "id: %s, status: %s" % (str(self.id), self.status)
        if self.attachedfile:
            returnstring += ", attachedfile: %s" % str(self.attachedfile.name)
        return returnstring

    def update_status(self, status):
        update = JobSession.objects.get(pk=self.pk)
        self.status = update.status+"\n"+status
        self.all_status += "\n"+status
        self.save(update_fields=['status', 'all_status'])
    def print_status(self):
        status = self.status
        self.status = ''
        self.save(update_fields=['status'])
        return status
    def print_all_status(self):
        self.status = ''
        self.save(update_fields=['status'])
        return self.all_status
    def attachedfilename(self):
        return os.path.basename(self.attachedfile.name)
    def filetype(self):
        self.attachedfile.open()
        magic_number = self.attachedfile.read(2)
        self.attachedfile.open()
        if magic_number == r'%!':
            return 'ps'
        else:
            return 'pdf'
