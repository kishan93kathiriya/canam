/* =========================================================
   CAN-AM MASTER HEADER
   Mobile menu toggle and desktop services dropdown behaviour.
   Markup lives in each page; styles in assets/css/header.css.
========================================================= */

(function () {
    "use strict";

    function init() {
        const button = document.getElementById("mobile-menu-button");
        const menu = document.getElementById("mobile-menu");
        const dropdowns = document.querySelectorAll(".cam-dropdown");

        const isMenuOpen = () =>
            Boolean(menu) && !menu.classList.contains("hidden");

        function setMenu(open) {
            if (!button || !menu) {
                return;
            }

            menu.classList.toggle("hidden", !open);
            button.setAttribute("aria-expanded", String(open));
            button.setAttribute(
                "aria-label",
                open ? "Close navigation menu" : "Open navigation menu"
            );
        }

        function closeDropdowns() {
            dropdowns.forEach((dropdown) => {
                dropdown.removeAttribute("open");
            });
        }

        if (button && menu) {
            button.addEventListener("click", () => {
                setMenu(!isMenuOpen());
            });

            menu.querySelectorAll("a").forEach((link) => {
                link.addEventListener("click", () => setMenu(false));
            });
        }

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") {
                return;
            }

            const focusInDropdown = Array.from(dropdowns).some(
                (dropdown) =>
                    dropdown.open && dropdown.contains(document.activeElement)
            );

            closeDropdowns();

            if (isMenuOpen()) {
                setMenu(false);
                button.focus();
            } else if (focusInDropdown) {
                const summary = document.querySelector(
                    ".cam-dropdown > summary"
                );

                if (summary) {
                    summary.focus();
                }
            }
        });

        document.addEventListener("click", (event) => {
            dropdowns.forEach((dropdown) => {
                if (dropdown.open && !dropdown.contains(event.target)) {
                    dropdown.removeAttribute("open");
                }
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
