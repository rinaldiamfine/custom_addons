$(document).ready(function () {
    var step = $("input#step");
    step.val(0);
    $('.action-registration-back').click(function() {
        var prevStep = parseInt(step.val()) - parseInt(1);
        var setup = setupLocalStorage(step.val());
        if (setup['status']) {
            changeForm(prevStep, this);
        } else {
            alert(setup['msg'])
        }
    });
    $('.action-registration-next').click(function() {
        var nextStep = parseInt(step.val()) + parseInt(1);
        var setup = setupLocalStorage(step.val());
        if (setup['status'] === true) {
            changeForm(nextStep, this);
        } else if (setup['status'] == false) {
            alert(setup['msg'])
        }
    });
});

let AVAILABLE_FORM = [
    'program-form', 'info-form', 'file-form'
]
let AVAILABLE_NAVIGATION = [
    {
        'title': 'Pilih Program', 
        'subtitle': 'Silahkan pilih program yang ingin anda ikuti.'
    },
    {
        'title': 'Informasi Diri', 
        'subtitle': 'Masukkan informasi data diri anda sesuai dengan KTP.'
    },
    {
        'title': 'Dokumen', 
        'subtitle': 'Lampirkan dokumen yang dibutuhkan untuk keperluan dalam mencetak sertifikat anda.'
    }
]

function changeNavigation(index) {
    var navs = $("div.column-progress");
    var pageTitle = $('p#page-title');
    var pageSubtitle = $('p#page-subtitle');
    for (var i=0; i<navs.length; i++) {
        if (index == i) {
            $(navs[i]).addClass('active');
            pageTitle.html(AVAILABLE_NAVIGATION[i].title);
            pageSubtitle.html(AVAILABLE_NAVIGATION[i].subtitle);
        } else {
            $(navs[i]).removeClass('active');
        }
    }
}

function changeForm(steps, btn) {
    var actualStep = steps;
    var btnNextName = $("span#btn-title-next");
    var btnPrev = $('.action-registration-back');
    var forms = $("div.action-step");
    for (var i=0; i<forms.length; i++) {
        if (actualStep == i) {
            $(forms[i]).addClass('active');
            changeNavigation(i);
            if ($(forms[i]).hasClass('end')) {
                btnNextName.html('Selesai');
            } else if ($(forms[i]).hasClass('start')) {
                btnPrev.attr("disabled", 'disabled');
            } else {
                btnPrev.removeAttr("disabled");
                btnNextName.html('Selanjutnya');
            }
            var step = $("input#step");
            step.val(steps);
        } else {
            $(forms[i]).removeClass('active');
        }
    }
}

function setupLocalStorage(index) {
    console.log("GET FORM", index);
    var path = '';
    var urlStorage = window.location.pathname;
    var noError = true;
    if (index == 0) {
        // SELECT PROGRAM
        var selectedProgram = $('.card.is-active');
        if (selectedProgram.length == 0) {
            noError = false;
        } 
        if (noError) {
            path = urlStorage + '-' + 'program';
            localStorage.setItem(path, selectedProgram[0].id);
        }
        return {
            'status': noError,
            'msg': 'Silahkan pilih program yang tersedia!'
        };
    }
    else if (index == 1) {
        // PERSONAL INFORMATION
        var formData = {};
        var infoForm = $('form#info-form');
        if (infoForm.length > 0) {
            infoForm.each(function() {
                var inputData = $(this).find(':input');
                console.log(inputData, "GET INPUT DATA");
                for (var i=0; i<inputData.length; i++) {
                    console.log(inputData[i].value, "PALUE");
                    if (inputData[i].value == ''){
                        noError = false;
                        break;
                    }
                    formData[String(inputData[i].name)] = inputData[i].value;
                }
            });
        }
        if (noError) {
            path = urlStorage + '-' + 'info';
            localStorage.setItem(path, JSON.stringify(formData));
        }
        return {
            'status': noError,
            'msg': 'Lengkapi data diri anda!'
        };
    } else {
        // IMAGE FILES
    }
}

function getLocalStorage() {

}
