
$(document).ready(function () {
    var path = window.location.pathname
    if (path == '/') {
        var navLi = $("li#home");
        if (navLi) {
            navLi.addClass("active");
        }
    } else if (path == '/about') {
        var navLi = $("li#about");
        if (navLi) {
            navLi.addClass("active");
        }
    } else if (path == '/registration') {
        var navLi = $("li#registration");
        if (navLi) {
            navLi.addClass("active");
        }
    }
});