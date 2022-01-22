$(document).ready(function () {
    var step = $("input#step");
    step.val(0);
    $('.action-registration-back').click(function() {
        var prevStep = parseInt(step.val()) - parseInt(1);
        changeForm(prevStep, this);
    });
    $('.action-registration-next').click(function() {
        var nextStep = parseInt(step.val()) + parseInt(1);
        changeForm(nextStep, this);
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

function setupLocalStorage() {

}

function getLocalStorage() {

}
