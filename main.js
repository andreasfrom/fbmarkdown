// fbmarkdown by Andreas From

var Markdown, hljs;
var converter = Markdown.getSanitizingConverter();
var smileys = false;

RegExp.quote = function(str) {
     return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
 };

converter.hooks.chain("preConversion", function(text) {
    text = text.replace(/(<(br)([^>]+|)>)/ig, "\n\n"); // br to \n\n
    var tmp = document.createElement("p");
    tmp.innerHTML = text;
    text = tmp.innerText;
    text = text.replace(/(<([^>]+|)>)/ig, ""); // strip all tags
    text = text.replace(/(\n\s+\#)/g, "\n#"); // strip space before # when first character on line
    return text;
});

converter.hooks.chain("postConversion", function(text) {
    if (smileys) {
        for (var i = 0; i < smileys.length; i+=2) {
            var rep = smileys[i].innerText;
            var re = new RegExp("(^|[\\s])" + RegExp.quote(rep), "gi");
            text = text.replace(re, " " + smileys[i].outerHTML + smileys[i+1].outerHTML);
        }
    }
    smileys = false;
    text = text.replace(/(^<p>)/, "<span>");
    text = text.replace(/(<\/p>$)/, "</span>");
    return text;
});

function waitForPause(ms, callback) {
    var timer;

    return function() {
        var self = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function() {
            callback.apply(self, args);
        }, ms);
    };
}

function unfoldUpdates() {
    $(".text_exposed_link").each(function() {
        $($(this).children()[0]).click();
    });
    $(".text_exposed_hide").remove();
}

function handleElements(selector) {
    $(selector).not(".fbmarkdown").each(function() {
        var text = this.innerHTML;
        smileys = $(this).find("span.emoticon_text, span.emoticon");
        var html = converter.makeHtml(text);
        $(this).html(html);
        $(this).find("code").each(function() {
            this.innerText = this.innerText.replace(/\n\n/g, "\n");
            hljs.highlightBlock(this);
            $(this).addClass("fbmdcss");
        });
        $(this).find('*').each(function() {
            $(this).addClass("fbmdcss");
        });
        $(this).data({text: text, html: $(this).html(), currFormat: "html"});
        $(this).addClass("fbmarkdown");
    });
}

$(document).on("dblclick", ".fbmarkdown", function(e) {
    var text = $(this).data("text");

    if ($(this).data("currFormat") == "html") {
        this.innerHTML = text;
        $(this).data("currFormat", "text");
    }
    else {
        this.innerHTML = $(this).data("html");
        $(this).data("currFormat", "html");
    }
});

window.addEventListener("scroll",  waitForPause(300, function(e) {
        if ($(e.target).is(document)) {
            unfoldUpdates();
            handleElements(".userContent, .UFICommentBody");
        }
        else {
            setTimeout(function() {
                handleElements("._kso");
            }, 300);
        }
}), true);
