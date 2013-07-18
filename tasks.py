from celery import task
import paramiko
import traceback

HOSTNAME = 'localhost'
PORT = 22

@task
def handleJob(job, username, password):
    try:
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


        rfilename = "imprimo." + str(job.id) + job.attachedfilename()
        job.update_status("Copying file over to ~/%s" % rfilename)
        sftpclient.putfo(job.attachedfile, rfilename)
        sftpclient.close()
        filetype = job.filetype()
        job.attachedfile.close()
        #job.attachedfile.delete()

        if filetype == 'pdf':
            job.update_status("Converting from PDF to PostScript... this might take quite a while.")
            (stdin, stdout, stderr) = client.exec_command(
                'pdf2ps "'+rfilename+'" "'+rfilename+'.ps" && echo "Converted!"')
            (outstr, errstr) = stdout.read(), stderr.read()
            if outstr != "Converted!\n":
                raise "Error while converting from PDF to PostScript."
            (stdin, stdout, stderr) = client.exec_command('rm -f "'+rfilename+'"')
            outstr, errstr = stdout.read(), stderr.read()
            rfilename += '.ps'

        job.update_status("Sending print job to "+job.printer+".")
        (stdin, stdout, stderr) = client.exec_command("lpr -P "+job.printer+" "+rfilename+" && echo 'Job Sent!'")
        (outstr, errstr) = stdout.read(), stderr.read()
        if outstr != "Job sent!\n":
            raise "Error sending file to printer."
        job.update_status("Done printing!")

        client.close()

    except Exception, e:
        job.update_status('Caught exception: %s: %s' % (e.__class__, e))
        traceback.print_exc()
        try:
            job.attachedfile.close()
            client.close()
        except:
            pass
    finally:
        pass
        #job.attachedfile.delete()


