from django import forms
from .validators import validate_printable

PRINTERS = ((choice, choice) for choice in ("psts", "pstsb", "pstsc", "psc008", "psc011"))

class JobRequestForm(forms.Form):
    username = forms.CharField(max_length=240,
            widget=forms.TextInput(attrs={ "disabled": True }))
    password = forms.CharField(max_length=240,
            widget=forms.PasswordInput(attrs={ "disabled": True }))
    attachedfile = forms.FileField(validators=[validate_printable],
            widget=forms.FileInput(attrs={ "hidden": True }))
    printer = forms.ChoiceField(
            widget=forms.RadioSelect(attrs={ "disabled": True }),
            choices=PRINTERS)
    captcha = forms.CharField(max_length=240,
            widget=forms.TextInput(attrs={ "disabled": True }))
