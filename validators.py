from django.core.exceptions import ValidationError

def validate_printable(uploadedfile):
    try:
        magic_number = uploadedfile.read(4)
        if not (magic_number == r'%PDF' or magic_number[0:2] == r'%!'):
            raise ValidationError("%s is not a PDF or PS file"
                                  % uploadedfile.filename)
    except Exception, exc:
        raise ValidationError("Caught Exception: %s: %s" % (exc.__class__, exc))
