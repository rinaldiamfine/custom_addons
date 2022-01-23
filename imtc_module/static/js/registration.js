$(document).ready(function () {
    // SELECT PROGRAM
    $('.card').click(function() {
        allCards = $(".card");
        for (var i=0; i<allCards.length; i++) {
            if (allCards[i].id != this.id) {
                $(allCards[i]).removeClass('is-active');
            }
        }
        $(this).addClass('is-active');
    });

    
});
