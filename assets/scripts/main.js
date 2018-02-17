// Used as least jquery as possible
const root = $('html, body');

// Browser support for beacon transport / GA
var beaconSupported = true;

if (!navigator.sendBeacon) {
    console.log("Beacon is NOT supported, disabling...");
    beaconSupported = false;
}

var gaEnabled = typeof ga !== "undefined";
if (gaEnabled) {
    console.log("Google analytics is disabled.");
}

// forEach that is compatible with all browsers
var forEach = function (array, callback, scope) {
    for (var i = 0; i < array.length; i++) {
        callback.call(scope, i, array[i]); // passes back stuff we need
    }
};

// ANIMATIONS
// These animations are not mine
// LICENSE: https://github.com/gdsmith/jquery.easing/blob/master/LICENSE
$.easing['jswing'] = $.easing['swing'];
$.extend($.easing, {
    easeOutQuart: function (x, t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
});

// Thanks SO
function throttle(fn, interval) {
    var lastCall, timeoutId;
    return function () {
        var now = new Date().getTime();
        if (lastCall && now < (lastCall + interval)) {
            // if we are inside the interval we wait
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                lastCall = now;
                fn.call();
            }, interval - (now - lastCall));
        } else {
            // otherwise, we directly call the function
            lastCall = now;
            fn.call();
        }
    };
}

function isOnPage(page) {
    return window.location.href.includes(page)
}

function isOnMainPage() {
    return typeof main_page !== "undefined";
}


function getScrollFromTop() {
    return (typeof window.pageYOffset !== "undefined") ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
}

if (isOnMainPage()) {
    const mainSections = $("section.track");

    // Animate scroll
    var animationLinks = $("a[href^='#']");

    forEach(animationLinks, function (index, item) {
        item.onclick = function (e) {
            e.preventDefault();

            var hash = this.hash;
            var target = $(hash);

            root.stop().animate({
                'scrollTop': target.offset().top
            }, 1250, "easeOutQuart", function () {
                window.location.hash = hash;
            });
        }
    });

    // Side buttons tracking
    // Layout: {id: circle_from_id}
    var trackedCircles = {};
    forEach(mainSections, function (index, item) {
        var id = $(item).attr("id");
        var actual = $("#side_nav a[track=" + id + "]");

        // Check if it exists
        if (actual !== null) {
            trackedCircles[id] = actual;
        }
    });

    // Light up the first one
    var firstCircle = $("#side_nav a");
    firstCircle.addClass("active");

    function makeOthersInactive(keep_thisone) {
        for (var a in trackedCircles) {
            if (trackedCircles[a] !== keep_thisone) {
                trackedCircles[a].removeClass("active");
            }
        }
    }

    function sectionTracker() {
        var windowFromTop = getScrollFromTop();

        forEach(mainSections, function (index, el) {
            var th = $(el);

            var elFromTop = th.offset().top;
            var id = th.attr("id");

            var tracked = trackedCircles[id];

            // Light up a different circle if user scrolled
            if (windowFromTop >= elFromTop) {
                makeOthersInactive(tracked);
                tracked.addClass("active");
            }
        })
    }

    window.onscroll = throttle(sectionTracker, 200);

}

// All pages have navigation for mobile
const hamburger =  $("ham"),
      mobileNavigation = $("links");

hamburger.onclick = function () {
    mobileNavigation.toggleClass("open");
};

// Dropdown
const dropdown = $(".other--inner");
function toggleOtherDropdown() {
    dropdown.toggleClass("expanded");
}

// Makes hover effect for the special dropdown indicator
const dropdownIndicator = $(".dropdown-effect");
const dropdownHeader = $(".header--link.special");
dropdownHeader.hover(function () {
    dropdownIndicator.toggleClass("darkened")
});


if (isOnPage("commands.html")) {
    var commandSlides = $(".body__commands__container .cmd__category"),
        commandCategories = $(".cmd__switcher li");

    var trackedSlides = {};
    forEach(commandSlides, function (index, el) {
        let e = $(el);

        var id = e.attr("id");

        if (id !== null) {
            trackedSlides[id] = e;
        }
    });

    // Command slide tracker
    var group_to_button = {};
    forEach(commandCategories, function (index, el) {
        let e = $(el);

        var slideName = e.attr("slide");

        if (slideName !== null) {
            group_to_button[slideName] = e;
        }
    });

    function hideOtherSlides(keep_this) {
        for (var a in trackedSlides) {
            if (trackedSlides[a] !== keep_this) {
                trackedSlides[a].removeClass("show");
            }
        }
    }

    function unActiveAllCategories(but_this) {
        for (var a in group_to_button) {
            if (group_to_button[a] !== but_this) {
                group_to_button[a].removeClass("active");
            }
        }
    }

    // Change slides when a group is clicked
    forEach(commandCategories, function (index, el) {
        el.onclick = function (e) {
            e.preventDefault();

            let th = $(this);

            var name = th.attr("slide");
            var slide = trackedSlides[name];

            location.hash = name;

            hideOtherSlides(slide);
            slide.addClass("show");
            unActiveAllCategories(this);
            th.addClass("active")
        }
    });

    // Check hash in url and redirect to that category
    if (window.location.hash) {
        var hash = window.location.hash.replace("#", "");

        var slide = group_to_button[hash];
        if (typeof slide !== "undefined") {
            // There is an element with such id, switch to it
            var one = trackedSlides[hash];
            hideOtherSlides(one);
            //slide.classList.add("show");
            unActiveAllCategories(slide);
            //this.classList.add("active")
            slide.addClass("active");
            one.addClass("show")

        }
    }

}