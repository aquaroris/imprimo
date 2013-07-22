from celery import task
import paramiko
import traceback
import random

from .config import HOSTNAME, PORT

@task
def handleJob(job, username, password, convert=True, send_print=True):
    try:
        stdin, stdout, stderr = None, None, None
        outstr, errstr = None, None

        def exec_command(cmd):
            job.update_status("Executing command %s" % cmd)
            (stdin, stdout, stderr) = client.exec_command(cmd)
            (outstr, errstr) = stdout.read(), stderr.read()
            return outstr, errstr

        job.update_status("Initializing SSHClient...")
        client = paramiko.SSHClient()

        job.update_status("Loading host keys...")
        client.load_system_host_keys()
        client.set_missing_host_key_policy(paramiko.WarningPolicy())

        job.update_status("Connecting to %s@%s and authenticating using password..." \
                % (username, HOSTNAME))
        client.connect(HOSTNAME, PORT, username, password)

        job.update_status("Initializing SFTPClient...")

        sftpclient = client.open_sftp()

        rfilename = "imprimo.%s.%s.%s" % (str(job.id), random.randint(0,100), job.attachedfilename())
        job.update_status("Copying file over to ~/%s" % rfilename)
        sftpclient.putfo(job.attachedfile, rfilename)
        sftpclient.close()
        filetype = job.filetype()
        job.attachedfile.close()
        job.attachedfile.delete()

        if filetype == 'pdf' and convert:
            job.update_status("Converting from PDF to PostScript... this might take quite a while.")
            cmd = "/usr/sfw/bin/pdf2ps '%s' '%s.ps' && echo 'Converted!'" \
                    % (rfilename, rfilename)
            (outstr, errstr) = exec_command(cmd)
            if outstr != "Converted!\n":
                raise paramiko.SSHException("Error while converting from PDF to PostScript.\nstderr: %s\nstdout: %s" % (errstr, outstr))
            exec_command('rm -f "%s"' % (rfilename))
            rfilename += '.ps'

        if send_print:
            job.update_status("Sending print job to "+job.printer+".")
            cmd = "/usr/local/bin/lpr -P '%s' '%s' && echo 'Job Sent!'" % (job.printer, rfilename)
            (outstr, errstr) = exec_command(cmd)
            if outstr != "Job sent!":
                raise paramiko.SSHException("Error sending file to printer.\nstderr: %s\nstdout: %s" % (errstr, outstr))
            job.update_status("Done sending print job!")
        exec_command('rm -f "%s"' % (rfilename))

        job.completed = True
        client.close()

    except Exception as e:
        job.update_status('Caught exception: %s: %s' % (e.__class__, e))
        traceback.print_exc()
        try:
            exec_command('rm -f "'+rfilename+'"')
            job.attachedfile.close()
            client.close()
        except:
            pass
    finally:
        job.attachedfile.delete()
        job.completed = True
        job.save(update_fields=['completed'])


