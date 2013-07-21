$(function () {
    "use strict";

    var $filefield = $('#filefield'),
        $dummyfile = $('#dummyfile'),
        $id_attachedfile = $('#id_attachedfile'),
        $userfield = $('#userfield'),
        $id_username = $('#id_username'),
        $passfield = $('#passfield'),
        $id_password = $('#id_password'),
        $captchafield = $('#captchafield'),
        $id_captcha = $('#id_captcha'),
        $formsubmit = $('#formsubmit'),
        $jobstatus = $('#jobstatus'),
        $prevstatus = $('#prevstatus'),
        $prevstatustoggle = $('#prevstatustoggle'),
        $input = $('input'),
        timeoutID = null,
        status,
        bgCheck,
        firstCheck,
        submit,
        form;



    status = {
        init: function () {
            $prevstatustoggle.click(function () {
                if ($prevstatustoggle.text() === "Click to show more...") {
                    $prevstatustoggle.text("Click to show less...");
                } else {
                    $prevstatustoggle.text("Click to show more...");
                }
                $prevstatus.slideToggle();
            });
        },
        update: function (jsonArr) {
            $.each(jsonArr, function(index, value) {
                $('<li>'+$jobstatus.text()+'</li>').hide().prependTo($prevstatus).slideDown();
                $jobstatus.text(value);
            });
        }
    };

    // Functions related to AJAX

    bgCheck = {
        success: function (response, status, jqXHR) {
            status.update(response);
            timeoutID = setTimeout(this.init(), 5000);
        },
        init: function () {
            return function () {
                $.ajax({
                    type: 'GET',
                    url: 'jobstatus/',
                    dataType: 'json',
                    success: this.success,
                });
            };
        },
    };
    firstCheck = {
        init: function() {
            $.ajax({
                // TODO: handle failure
                type: 'GET',
                url: 'prevstatus/',
                dataType: 'json',
                success: this.success,
            });
        },
        success: function (response, status, jqXHR) {
            // This function is called after the initial AJAX query
            if (!$.isEmptyObject(response)) {
                status.update(["Restoring previous session..."]);
                status.update(response);
                timeoutID = setTimeout(bgCheck.init(), 1000);
            } else {
                form.enable();
                status.update(["Fill in the form, then click Print."]);
            }
        },
    };

    submit = {
        init: function () {
            $('#submissionform').ajaxForm({
                beforeSubmit: this.pre,
                uploadProgress: this.prog,
                dataType: "text",
                success: this.success,
            });
        },
        pre: function () {
            form.disable();
            return true;
        },
        prog: function (event, position, total, percentComplete) {
            status.update("Uploading "+$id_attachedfile.val()+"... "+percentComplete+"% uploaded.");
        },
        success: function (response, status, jqXHR) {
            status.update(response);
            timeoutID = setTimeout(bgCheck.init(), 2000);
        },
    };

    // Functions related to the form

    form = {
        init: function() {
            this.focusInit();
            this.textInit();
            this.fileInit();
            this.submitInit();
        },
        focusInit: function () {
            $userfield.click(function () {
                $id_username.focus();
            });
            $passfield.click(function () {
                $id_password.focus();
            });
            $captchafield.click(function () {
                $id_captcha.focus();
            });
            $dummyfile.click(function () {
                $id_attachedfile.get(0).click();
            });
        },
        textInit: function () {
            $id_username.change(this.updateText($id_username));
            $id_password.change(this.updateText($id_password));
            $id_captcha.change(this.updateText($id_captcha));
        },
        fileInit: function () {
            $id_attachedfile.change(this.updateAttachedFile);
            $dummyfile.submit(function () { return false; });
        },
        submitInit: function () {
            $formsubmit.submit(function () { return false; });
            $formsubmit.focus(function () {
                $formsubmit.css({
                    "background-color": "#edc",
                    "color": "#a20"
                });
            });
        },
        highlight: function(selector) {
            selector.css({
                "background-color": "#eee",
                "color": "#bbb"
            });
        },
        unhighlight: function(selector) {
            $dummyfile.css({
                "background-color": "#edc",
                "color": "#a20"
            });
        },
        disable: function() {
            $input.prop("disabled", true);
        },
        enable: function () {
            $input.prop("disabled", false);
        },
        updateText: function($input) {
            if ($input.val()) {
                this.highlight($input);
            } else {
                this.unhighlight($input);
            }
        },
        updateAttachedFile: function () {
            var fname = $id_attachedfile.val();
            if (fname === '') {
                $("#dftext").text("Choose a .pdf or .ps file.");
                this.highlight($dummyfile);
            } else {
                $("#dftext").text($id_attachedfile.val());
                this.unhighlight($dummyfile);
            }
        },
    };

    submit.init();
    form.init();
    status.init();

    firstCheck.init();
});

