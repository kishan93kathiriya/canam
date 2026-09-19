(function () {
    "use strict";

    const HEADER_ID = "site-header";
    const FOOTER_ID = "site-footer";

    async function loadComponent(mountId, defaultSource) {
        const mount = document.getElementById(mountId);

        if (!mount) {
            return;
        }

        const source = mount.dataset.componentSrc || defaultSource;
        const response = await fetch(source, { cache: "no-cache" });

        if (!response.ok) {
            throw new Error(`Unable to load ${source}: ${response.status}`);
        }

        mount.innerHTML = await response.text();
    }

    function setCurrentPage() {
        const filename = window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

        const currentPage = filename.includes("physiotherapy-carstairs")
            ? "carstairs"
            : "home";

        document.querySelectorAll("[data-page]").forEach((link) => {
            link.removeAttribute("aria-current");

            if (link.dataset.page === currentPage) {
                link.setAttribute("aria-current", "page");
            }
        });
    }

    function setCurrentYear() {
        const year = String(new Date().getFullYear());

        document
            .querySelectorAll("[data-current-year]")
            .forEach((element) => {
                element.textContent = year;
            });
    }

    function initializeMobileMenu() {
        const button = document.getElementById("cam-menu-button");
        const menu = document.getElementById("cam-mobile-nav");

        if (!button || !menu) {
            return;
        }

        const closeMenu = (returnFocus) => {
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-label", "Open navigation menu");
            menu.hidden = true;

            if (returnFocus) {
                button.focus();
            }
        };

        const openMenu = () => {
            button.setAttribute("aria-expanded", "true");
            button.setAttribute("aria-label", "Close navigation menu");
            menu.hidden = false;
        };

        button.addEventListener("click", () => {
            const isOpen =
                button.getAttribute("aria-expanded") === "true";

            isOpen ? closeMenu(false) : openMenu();
        });

        menu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => closeMenu(false));
        });

        document.addEventListener("keydown", (event) => {
            if (
                event.key === "Escape" &&
                button.getAttribute("aria-expanded") === "true"
            ) {
                closeMenu(true);
            }
        });

        document.addEventListener("click", (event) => {
            const header =
                document.getElementById("canam-site-header");

            if (
                header &&
                !header.contains(event.target) &&
                button.getAttribute("aria-expanded") === "true"
            ) {
                closeMenu(false);
            }
        });

        window.addEventListener("resize", () => {
            if (
                window.innerWidth > 860 &&
                button.getAttribute("aria-expanded") === "true"
            ) {
                closeMenu(false);
            }
        });
    }

    function restoreHashPosition() {
        if (!window.location.hash) {
            return;
        }

        const target = document.querySelector(window.location.hash);

        if (target) {
            window.requestAnimationFrame(() => {
                target.scrollIntoView();
            });
        }
    }

    async function initializeComponents() {
        try {
            await Promise.all([
                loadComponent(
                    HEADER_ID,
                    "components/header.html"
                ),
                loadComponent(
                    FOOTER_ID,
                    "components/footer.html"
                )
            ]);

            setCurrentPage();
            setCurrentYear();
            initializeMobileMenu();
            restoreHashPosition();

            document.dispatchEvent(
                new CustomEvent("canam:components-ready")
            );
        } catch (error) {
            console.error(
                "Can-Am shared components could not be loaded.",
                error
            );
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeComponents
        );
    } else {
        initializeComponents();
    }
})();