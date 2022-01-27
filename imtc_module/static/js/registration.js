$(document).ready(function () {
    // SELECT PROGRAM
    var allCards = $(".card");
    var location = window.location.pathname;
    var regPath = location + '-' + 'program';
    var regLocalStorage = localStorage.getItem(regPath);
    if (regLocalStorage) {
        for (var i=0; i<allCards.length; i++) {
            if (allCards[i].id == regLocalStorage) {
                $(allCards[i]).addClass('is-active');
            } else {
                $(allCards[i]).removeClass('is-active');
            }
        }
    }

    $('.card').click(function() {
        for (var i=0; i<allCards.length; i++) {
            if (allCards[i].id != this.id) {
                $(allCards[i]).removeClass('is-active');
            }
        }
        $(this).addClass('is-active');
    });


});
