$(function () {
    "use strict";

    // Cache elements
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
        timeoutID = null;

    // Functions related to job status indicators
    var updateJobStatus = function (text) {
        $('<li>'+$jobstatus.text()+'</li>').hide().prependTo($prevstatus).slideDown();
        $jobstatus.text(text);
    };
    var updateJobStatuses = function (jsonArr) {
        $.each(jsonArr, function(index, value) {
            updateJobStatus(value);
        });
    };

    // Functions related to AJAX

    var bgCheckStatus = function ($) {
        var checkSuccess = function (response, status, jqXHR) {
            updateJobStatuses(response);
            timeoutID = setTimeout(bgCheckStatus($), 5000);
        };
        return function () {
            $.ajax({
                type: 'GET',
                url: 'jobstatus/',
                dataType: 'json',
                success: checkSuccess,
            });
        };
    };

    var subPre = function () {
        // This function is called when user clicks on the submit job
        // button, before the data is sent through AJAX
        $input.prop('disabled', true);
        return true;
    };
    var subProg = function (event, position, total, percentComplete) {
        updateJobStatus("Uploading "+$id_attachedfile.val()+"... "+percentComplete+"% uploaded.");
    };
    var subSuccess = function (response, status, jqXHR) {
        updateJobStatus(response);
        timeoutID = setTimeout(bgCheckStatus($), 5000);
    };

    var initialCheckSuccess = function (response, status, jqXHR) {
        // This function is called after the initial AJAX query
        if (!$.isEmptyObject(response)) {
            updateJobStatus("Restoring previous session...");
            updateJobStatuses(response);
            timeoutID = setTimeout(bgCheckStatus($), 1000);
        } else {
            $input.prop("disabled", false);
        }
    };

    // Check for previous jobs.

    // Functions related to the form

    var updateBackground = function($inputObject) {
        if ($inputObject.val()) {
            $inputObject.css("background-color", "#edc");
        } else {
            $inputObject.css("background-color", "#eee");
        }
    };
    var validFile = function () {
        var fname = $id_attachedfile.val();
        if (fname.slice(-4) !== ".pdf" && fname.slice(-2) !== ".ps") {
            return false;
        }
        return true;
    };
    var updateAttachedFile = function () {
        var fname = $id_attachedfile.val();
        if (!validFile()) {
            $("#dftext").text("Choose a valid .pdf or .ps file.");
            $dummyfile.css({
                "background-color": "#eee",
                "color": "#bbb"
            });
        } else {
            $("#dftext").text($id_attachedfile.val());
            $dummyfile.css({
                "background-color": "#edc",
                "color": "#a20"
            });
        }
    };

    // Event Handlers for AJAX

    $('#submissionform').ajaxForm({
        beforeSubmit: subPre,
        uploadProgress: subProg,
        dataType: "text",
        success: subSuccess,
    });

    // Event Handlers for the form

    // Transfer Focus Events
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

    // Update Field Appearance Events
    $id_attachedfile.change(updateAttachedFile);
    $dummyfile.submit(function () { return false; });
    $formsubmit.submit(function () { return false; });
    $formsubmit.click(function () {
        $formsubmit.css({
            "background-color": "#edc",
            "color": "#a20"
        });
    });
    $id_username.change(updateBackground($id_username));
    $id_password.change(updateBackground($id_password));
    $id_captcha.change(updateBackground($id_captcha));
    $prevstatustoggle.click(function () {
        if ($prevstatustoggle.text() === "Click to show more...") {
            $prevstatustoggle.text("Click to show less...");
        } else {
            $prevstatustoggle.text("Click to show more...");
        }
        $prevstatus.slideToggle();
    });

    // Stuff to do at when page is loaded

    // check for a previous session on the server
    if ($id_attachedfile.val()) {
        updateAttachedFile();
    }
    updateBackground($id_username);
    updateBackground($id_password);
    updateBackground($id_captcha);
    $.ajax({
        // TODO: handle failure
        type: 'GET',
        url: 'prevstatus/',
        dataType: 'json',
        success: initialCheckSuccess,
    });

    updateJobStatus("Please fill in the form before clicking Print.");
});
