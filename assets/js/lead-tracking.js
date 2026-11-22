/* =========================================================
   CAN-AM LEAD TRACKING (Google Analytics 4)
   Sends one GA4 event per lead action, site-wide:
     book_click        Book / JaneApp links
     phone_click       tel: links
     email_click       mailto: links
     directions_click  Google Maps links
     generate_lead     inquiry form sent (fired by the form code
                       through window.canamTrackLead)
   Every event carries link_location: which part of the page the
   click came from (header, footer or the nearest section).
   No personal details are sent.
========================================================= */

(function () {
    "use strict";

    // "home", "mva-physiotherapy", "mva-physiotherapy-airdrie", ...
    function pageType() {
        var page = location.pathname.replace(/^\/|\.html$/g, "");
        return !page || page === "index" ? "home" : page;
    }

    function send(name, params) {
        if (typeof window.gtag === "function") {
            window.gtag("event", name, params);
        }
    }

    // Where on the page the link sits: header, footer, or the closest section
    function locationOf(el) {
        if (el.closest(".cam-mobile-nav")) return "header_mobile_menu";
        if (el.closest("header, .cam-site-header")) return "header";
        if (el.closest("footer")) return "footer";

        var section = el.closest("section[id], section[aria-labelledby], section[aria-label], [id]");
        if (!section) return "page";
        if (section.id) return section.id === "top" ? "hero" : section.id;

        var label = section.getAttribute("aria-label");
        if (label) return label.toLowerCase().replace(/[^a-z0-9]+/g, "_");

        var labelledBy = section.getAttribute("aria-labelledby");
        return labelledBy ? labelledBy.replace(/-title$/, "") : "page";
    }

    function textOf(el) {
        var label = el.getAttribute("aria-label") || el.textContent || "";
        return label.replace(/\s+/g, " ").trim().slice(0, 100);
    }

    function typeOf(href) {
        if (/^tel:/i.test(href)) return "phone_click";
        if (/^mailto:/i.test(href)) return "email_click";
        if (/janeapp\.com/i.test(href)) return "book_click";
        if (/maps\.app\.goo\.gl|google\.[a-z.]+\/maps|maps\.google\./i.test(href)) return "directions_click";
        return null;
    }

    document.addEventListener("click", function (event) {
        var link = event.target.closest && event.target.closest("a[href]");
        if (!link) return;

        var href = link.getAttribute("href");
        var name = typeOf(href);
        if (!name) return;

        var params = {
            link_location: locationOf(link),
            link_text: textOf(link),
            page_type: pageType()
        };
        if (name === "phone_click") params.phone_number = href.replace(/^tel:/i, "");

        send(name, params);
    }, true);

    // Called by the inquiry form after Web3Forms accepts the message
    window.canamTrackLead = function (details) {
        send("generate_lead", Object.assign({
            lead_source: "website_form",
            page_type: pageType()
        }, details || {}));
    };
})();
