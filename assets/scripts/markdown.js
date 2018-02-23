/*
MARKDOWN RENDERER

Renders markdown text into html

Uses showdown (https://github.com/showdownjs/showdown) on the client.
 */

const converter = new showdown.Converter();
converter.setOption("simpleLineBreaks", true);
converter.setOption("simplifiedAutoLink", true);

var rawFields = $(".markdown").find(".raw");

var videoRegex = /%video:(.*\..*)%/gm;

rawFields.each(function (index) {
    var t = $(this);
    var rendered = converter.makeHtml(t.text());

    // Process rendered stuff

    // FIND CUSTOM VIDEO TAGS
    var matches = videoRegex.exec(rendered);

    if (matches !== null) {
        for (var i = 0; i < matches.length; i++) {
            var m = matches[i];

            var type = m.split(".");
            type = type[type.length - 1];

            // HARDCODED BECAUSE THERE IS ONLY ONE VIDEO
            // pls don't judge, why are you lurking around the code anyway
            var renderedVideoTag = "<video loop preload autoplay width='460' height='335'><source src='" + m + "' type='video/" + type + "'></video>";

            rendered = rendered.replace("%video:" + m + "%", renderedVideoTag)
        }
    }

    t.parent().append("<span class='rendered'>" + rendered +"</span>");
    t.remove();
});

function fixImageMargins() {
// Center images insides paragraphs with javascript because flex breaks text
    var rawImages = $(".markdown p img, .markdown p video");
    rawImages.each(function (index) {
        var t = $(this);

        var parentWidth = t.parent().width();
        var neededMargin = (parentWidth - t.width()) / 2;

        t.css({
            "margin-left": neededMargin,
            "margin-right": neededMargin
        });
    });
}

function removeLoadingBar() {
    var load = $(".loading");

    load.addClass("animate");
    setTimeout(function () {
        load.remove();
    }, 315);
}

// Allow the browser to actually display the rendered content so the widths are correct
// (it doesn't matter if it looks bad because there is a loading bar
setTimeout(function () {
    removeLoadingBar();
}, 35);

window.onload = function() {
    console.log("Loaded, fixing image margins...");
    fixImageMargins();
};

// TODO remove loading bar