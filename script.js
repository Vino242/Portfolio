
/* ============================================
   MAIN — DOMContentLoaded
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    // Lupen-Cursor — invertiertes Viereck
    var lens = document.getElementById('lens');
    if (lens && window.matchMedia('(hover: hover)').matches) {
        var lx = 0, ly = 0;
        var mx = 0, my = 0;

        document.addEventListener('mousemove', function (e) {
            mx = e.clientX;
            my = e.clientY;
            lens.style.opacity = '1';
        });

        document.addEventListener('mouseleave', function () {
            lens.style.opacity = '0';
        });

        // Smooth follow mit RAF
        function moveLens() {
            lx += (mx - lx) * 0.15;
            ly += (my - ly) * 0.15;
            lens.style.left = lx + 'px';
            lens.style.top = ly + 'px';
            requestAnimationFrame(moveLens);
        }
        requestAnimationFrame(moveLens);
    }

    // Uhr — Deutsche Zeit (Europe/Berlin)
    var clockEl = document.getElementById('clock');
    if (clockEl) {
        function updateClock() {
            var now = new Date();
            var time = now.toLocaleTimeString('de-DE', {
                timeZone: 'Europe/Berlin',
                hour: '2-digit',
                minute: '2-digit'
            });
            clockEl.textContent = time + ' DE';
        }
        updateClock();
        setInterval(updateClock, 10000);
    }

    // Image Protection — Rechtsklick, Drag, Textauswahl auf Bildern
    document.addEventListener('contextmenu', function (e) {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });
    document.addEventListener('dragstart', function (e) {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });
    document.querySelectorAll('img').forEach(function (img) {
        img.setAttribute('draggable', 'false');
    });

    // Lazy Loading
    const images = document.querySelectorAll('img.js-lazy__image');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    observer.unobserve(img);
                    function revealImg() {
                        img.classList.add('js-lazy__loaded');
                        img.classList.remove('js-lazy__image');
                    }
                    img.addEventListener('load', revealImg);
                    img.src = img.dataset.src;
                    if (img.complete) revealImg();
                }
            });
        }, { rootMargin: '200px' });
        images.forEach(function (img) { observer.observe(img); });
    } else {
        images.forEach(function (img) { img.src = img.dataset.src; });
    }

    // Ticker — Auto-Scroll + Drag/Swipe mit Momentum
    var track = document.querySelector('.c-ticker__track');
    if (track) {
        var pos = 0;
        var baseSpeed = 0.5;          // px pro Frame (Auto-Scroll)
        var velocity = 0;             // Drag-Momentum
        var isDragging = false;
        var startX = 0;
        var lastX = 0;
        var lastTime = 0;
        var halfWidth = track.scrollWidth / 2;

        function tickerLoop() {
            if (!isDragging) {
                // Momentum abbauen, dann zurück zu Auto-Scroll
                if (Math.abs(velocity) > 0.1) {
                    pos -= velocity;
                    velocity *= 0.96; // Reibung
                } else {
                    velocity = 0;
                    pos += baseSpeed;
                }
            }
            // Nahtlose Schleife
            if (pos >= halfWidth) pos -= halfWidth;
            if (pos < 0) pos += halfWidth;
            track.style.transform = 'translateX(' + (-pos) + 'px)';
            requestAnimationFrame(tickerLoop);
        }
        requestAnimationFrame(tickerLoop);

        // Drag — Mouse
        track.addEventListener('mousedown', function (e) {
            isDragging = true;
            startX = e.clientX;
            lastX = e.clientX;
            lastTime = Date.now();
            velocity = 0;
            track.classList.add('is-dragging');
            e.preventDefault();
        });
        window.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            var dx = e.clientX - lastX;
            var now = Date.now();
            var dt = now - lastTime || 1;
            velocity = dx / dt * 16; // px pro Frame
            pos -= dx;
            lastX = e.clientX;
            lastTime = now;
        });
        window.addEventListener('mouseup', function (e) {
            if (!isDragging) return;
            isDragging = false;
            track.classList.remove('is-dragging');
            // Klick erkennen (kein Drag) → Overlay öffnen
            var moved = Math.abs(e.clientX - startX);
            if (moved < 5) {
                var card = e.target.closest('.c-ticker__card[data-overlay]');
                if (card) {
                    var id = 'overlay-' + card.getAttribute('data-overlay');
                    var overlay = document.getElementById(id);
                    if (overlay) {
                        document.querySelectorAll('.c-overlay').forEach(function (o) { o.style.zIndex = '9000'; });
                        overlay.classList.add('is-visible');
                        overlay.style.zIndex = '9001';
                        document.body.style.overflow = 'hidden';
                        document.body.classList.add('has-overlay');
                    }
                }
            }
        });

        // Drag — Touch
        track.addEventListener('touchstart', function (e) {
            isDragging = true;
            startX = e.touches[0].clientX;
            lastX = e.touches[0].clientX;
            lastTime = Date.now();
            velocity = 0;
        }, { passive: true });
        track.addEventListener('touchmove', function (e) {
            if (!isDragging) return;
            var dx = e.touches[0].clientX - lastX;
            var now = Date.now();
            var dt = now - lastTime || 1;
            velocity = dx / dt * 16;
            pos -= dx;
            lastX = e.touches[0].clientX;
            lastTime = now;
        }, { passive: true });
        track.addEventListener('touchend', function () {
            isDragging = false;
        });

        // Ticker — Projektname oben mittig einblenden
        var tickerLabel = document.getElementById('ticker-label');

        track.addEventListener('mousemove', function (e) {
            var card = e.target.closest('.c-ticker__card');
            if (card && tickerLabel) {
                var label = card.querySelector('.c-ticker__label');
                var title = label ? label.textContent.replace('\u2736\uFE0E ', '') : '';
                if (title) {
                    tickerLabel.textContent = '\u2736\uFE0E ' + title;
                    tickerLabel.classList.add('is-visible');
                } else {
                    tickerLabel.classList.remove('is-visible');
                }
            }
        });

        track.addEventListener('mouseleave', function () {
            if (tickerLabel) tickerLabel.classList.remove('is-visible');
        });
    }

    // About-Bild Scroll-Parallax
    var aboutImg = document.getElementById('about-image');
    if (aboutImg) {
        window.addEventListener('scroll', function () {
            var rect = aboutImg.getBoundingClientRect();
            var vh = window.innerHeight;
            if (rect.top < vh && rect.bottom > 0) {
                var progress = (vh - rect.top) / (vh + rect.height);
                var offset = (1 - progress) * 120;
                aboutImg.style.transform = 'translateY(' + offset + 'px)';
            }
        }, { passive: true });
    }

    // Scroll-Effekt: Corner-Labels + Logo (mobile) ausblenden zwischen Hero und Footer
    var corners = document.querySelectorAll('.c-corner');
    var hero = document.querySelector('.c-hero');
    var logo = document.getElementById('main-title');
    var footer = document.querySelector('.c-footer');
    var isMobile = window.innerWidth <= 900;

    if (hero && corners.length) {
        var heroObs = new IntersectionObserver(function (entries) {
            var visible = entries[0].isIntersecting;
            corners.forEach(function (c) {
                c.style.opacity = visible ? '1' : '0';
            });
            if (isMobile && logo) {
                logo.style.opacity = visible ? '1' : '0';
                logo.style.transition = 'opacity 0.3s ease';
            }
        }, { threshold: isMobile ? 0.3 : 0.85 });
        heroObs.observe(hero);

        // Mobile: Logo-Kopie im Footer anzeigen
        if (isMobile && logo && footer) {
            var slot = document.getElementById('footer-logo-slot');
            if (slot) {
                var footerLogo = logo.querySelector('img').cloneNode(true);
                footerLogo.style.height = '36px';
                footerLogo.style.width = 'auto';
                slot.appendChild(footerLogo);
            }
        }
    }

    // Burger-Menü Toggle + iPhone theme-color
    var burger = document.getElementById('burger-toggle');
    var slideMenu = document.getElementById('slide-menu');
    var themeMeta = document.getElementById('theme-color-meta');
    function resetThemeColor() {
        if (themeMeta) themeMeta.content = '#ffffff';
    }
    if (burger && slideMenu) {
        burger.addEventListener('click', function () {
            burger.classList.toggle('is-open');
            slideMenu.classList.toggle('is-open');
            if (themeMeta) {
                themeMeta.content = slideMenu.classList.contains('is-open') ? '#ff2133' : '#ffffff';
            }
        });
    }

    // Home-Link im Menü
    var navHome = document.getElementById('nav-home');

    // Overlay helpers
    function showOverlay(name, pushHistory) {
        var id = 'overlay-' + name;
        var overlay = document.getElementById(id);
        if (!overlay) return;
        document.querySelectorAll('.c-overlay').forEach(function (o) {
            o.style.zIndex = '9000';
        });
        overlay.classList.add('is-visible');
        overlay.style.zIndex = '9001';
        document.body.style.overflow = 'hidden';
        document.body.classList.add('has-overlay');
        if (burger) burger.classList.remove('is-open');
        if (slideMenu) slideMenu.classList.remove('is-open');
        resetThemeColor();
        if (pushHistory) {
            history.pushState({ overlay: name }, '', '#' + name);
        }
    }

    function closeAllOverlays(pushHistory) {
        document.querySelectorAll('.c-overlay.is-visible').forEach(function (o) {
            o.classList.remove('is-visible');
        });
        document.body.style.overflow = '';
        document.body.classList.remove('has-overlay');
        if (burger) burger.classList.remove('is-open');
        if (slideMenu) slideMenu.classList.remove('is-open');
        resetThemeColor();
        if (pushHistory && location.hash) {
            history.pushState({}, '', location.pathname);
        }
    }

    // Overlay öffnen (auch Slide-Menü schließen)
    document.querySelectorAll('[data-overlay]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            var name = el.getAttribute('data-overlay');
            showOverlay(name, true);
        });
    });

    // Home-Klick: alle Overlays schließen
    if (navHome) {
        navHome.addEventListener('click', function (e) {
            e.preventDefault();
            closeAllOverlays(true);
        });
    }

    // Overlay schließen
    document.querySelectorAll('[data-close]').forEach(function (el) {
        el.addEventListener('click', function () {
            closeAllOverlays(true);
        });
    });

    // ESC-Taste schließt Overlay + Slide-Menü
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAllOverlays(true);
        }
    });

    // Browser-Back: Overlay schließen oder öffnen
    window.addEventListener('popstate', function (e) {
        if (e.state && e.state.overlay) {
            showOverlay(e.state.overlay, false);
        } else {
            closeAllOverlays(false);
        }
    });

    // Beim Laden: Hash prüfen und Overlay öffnen
    if (location.hash) {
        var name = location.hash.substring(1);
        showOverlay(name, false);
    }

    // Sprachsteuerung DE / EN
    var translations = {
        de: {
            'nav.home': 'Home',
            'nav.projekte': 'projekte',
            'nav.shop': 'shop',
            'nav.kontakt': 'kontakt',
            'btn.zurueck': 'Home',
            'footer.designerTitle': 'Diplom Designer',
            'footer.kontakt': 'KONTAKT',
            'footer.rechtliches': 'RECHTLICHES',
            'footer.datenschutz': 'Datenschutz',
            'overlay.projekte': 'Projekte'
        },
        en: {
            'nav.home': 'Home',
            'nav.projekte': 'projects',
            'nav.shop': 'shop',
            'nav.kontakt': 'contact',
            'btn.zurueck': 'Home',
            'footer.designerTitle': 'Diploma Designer',
            'footer.kontakt': 'CONTACT',
            'footer.rechtliches': 'LEGAL',
            'footer.datenschutz': 'Privacy Policy',
            'overlay.projekte': 'Projects'
        }
    };

    var currentLang = 'de';

    function setLang(lang) {
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key] !== undefined) {
                el.textContent = translations[lang][key];
            }
        });
        document.documentElement.lang = lang;
        currentLang = lang;
        var toggle = document.getElementById('lang-toggle');
        if (toggle) toggle.textContent = lang === 'de' ? 'EN' : 'DE';
    }

    var langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', function () {
            setLang(currentLang === 'de' ? 'en' : 'de');
        });
    }

    // Farbextraktion — prägnanteste Farbe (höchste Sättigung)
    function getVividColor(img, callback) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        var data = ctx.getImageData(0, 0, 50, 50).data;
        var pixels = [];
        for (var i = 0; i < data.length; i += 4) {
            var pr = data[i], pg = data[i + 1], pb = data[i + 2];
            var max = Math.max(pr, pg, pb), min = Math.min(pr, pg, pb);
            var sat = max === 0 ? 0 : (max - min) / max;
            pixels.push({ r: pr, g: pg, b: pb, sat: sat });
        }
        pixels.sort(function (a, b) { return b.sat - a.sat; });
        var top = pixels.slice(0, Math.max(1, Math.floor(pixels.length * 0.15)));
        var r = 0, g = 0, b = 0;
        top.forEach(function (p) { r += p.r; g += p.g; b += p.b; });
        var n = top.length;
        var fr = Math.round(r / n), fg = Math.round(g / n), fb = Math.round(b / n);
        if (fr > 220 && fg > 220 && fb > 220) { fr = 160; fg = 160; fb = 160; }
        callback(fr, fg, fb);
    }

    document.querySelectorAll('.c-proj-card').forEach(function (card) {
        var img = card.querySelector('.c-proj-card__media img');
        var overlay = card.querySelector('.c-proj-card__overlay');
        if (!img || !overlay) return;

        var manual = card.getAttribute('data-color');
        if (manual) {
            overlay.style.setProperty('--card-color', 'rgb(' + manual + ')');
            return;
        }

        function applyColor() {
            try {
                getVividColor(img, function (r, g, b) {
                    overlay.style.setProperty('--card-color', 'rgb(' + r + ',' + g + ',' + b + ')');
                });
            } catch (e) { /* CORS/security — fallback */ }
        }

        if (img.complete && img.naturalWidth > 0) {
            applyColor();
        } else {
            img.addEventListener('load', applyColor);
        }
    });

    // Hover-Diashow für Cards mit data-slideshow
    document.querySelectorAll('[data-slideshow]').forEach(function (card) {
        var slides = card.getAttribute('data-slideshow').split('|');
        var img = card.querySelector('img');
        var original = null;
        var idx = 0;
        var timer = null;

        slides.forEach(function (src) {
            var pre = new Image();
            pre.src = src;
        });

        card.addEventListener('mouseenter', function () {
            original = img.src;
            idx = 0;
            timer = setInterval(function () {
                idx = (idx + 1) % slides.length;
                img.src = slides[idx];
            }, 180);
        });

        card.addEventListener('mouseleave', function () {
            clearInterval(timer);
            img.src = original;
        });
    });

    // Showcase — Next-Cursor + Image-Cycling
    var cursorEl = document.createElement('div');
    cursorEl.className = 'c-showcase__cursor';
    cursorEl.textContent = 'Next';
    document.body.appendChild(cursorEl);

    var showcaseItems = document.querySelectorAll('.js-img-cycle');
    var cursorVisible = false;

    showcaseItems.forEach(function (item) {
        var images = item.getAttribute('data-images').split(',');
        var index = 0;
        var img = item.querySelector('img');

        item.addEventListener('click', function () {
            index = (index + 1) % images.length;
            img.style.opacity = '0';
            setTimeout(function () {
                img.src = images[index];
                img.style.opacity = '1';
            }, 150);
        });

        item.addEventListener('mouseenter', function () {
            cursorVisible = true;
            cursorEl.style.opacity = '1';
            var lens = document.getElementById('lens');
            if (lens) lens.style.opacity = '0';
        });

        item.addEventListener('mouseleave', function () {
            cursorVisible = false;
            cursorEl.style.opacity = '0';
            var lens = document.getElementById('lens');
            if (lens) lens.style.opacity = '';
        });
    });

    document.addEventListener('mousemove', function (e) {
        if (cursorVisible) {
            cursorEl.style.left = e.clientX + 'px';
            cursorEl.style.top = e.clientY + 'px';
        }
    });

});

// (Reveal wird jetzt komplett über den scroll-gekoppelten Block unten gesteuert)

/* Logo-Scroll: Logo wandert vom Header in den Footer
   Nutzt capture-phase weil der Scroll nicht auf window passiert */
window.addEventListener('load', function () {
    if (window.innerWidth <= 900) return;
    var logo = document.getElementById('main-title');
    var slot = document.getElementById('footer-logo-slot');
    var footer = document.querySelector('.c-footer');
    if (!logo || !slot || !footer) return;

    function getScrollTop(e) {
        var t = e ? e.target : null;
        if (t && t !== document && t.scrollTop !== undefined) return t.scrollTop;
        return document.documentElement.scrollTop || document.body.scrollTop || window.scrollY || 0;
    }

    function getMaxScroll(e) {
        var t = e ? e.target : null;
        if (t && t !== document && t.scrollHeight !== undefined) {
            return t.scrollHeight - t.clientHeight;
        }
        return document.documentElement.scrollHeight - window.innerHeight;
    }

    function onScroll(e) {
        var scrollY = getScrollTop(e);
        var maxScroll = getMaxScroll(e);
        if (maxScroll <= 0) return;

        // Animation erst ab 60% der Seite starten
        var startAt = maxScroll * 0.6;
        var range = maxScroll - startAt;

        if (scrollY < startAt) {
            logo.style.transform = '';
            return;
        }

        var progress = Math.min((scrollY - startAt) / range, 1);
        // Ease-out
        progress = 1 - Math.pow(1 - progress, 3);

        // Ziel: wo der Slot im Viewport liegt wenn ganz unten gescrollt
        var slotRect = slot.getBoundingClientRect();
        // Bei progress=1 sind wir ganz unten, slotRect ist dann korrekt
        // Bei progress<1 müssen wir die finale Position vorhersagen
        // Slot absolute Position auf der Seite:
        var slotAbsTop = slotRect.top + scrollY;
        var finalViewportTop = slotAbsTop - maxScroll;
        var finalViewportLeft = slotRect.left;

        var tx = (finalViewportLeft - 12) * progress;
        var ty = (finalViewportTop - 16) * progress;

        logo.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
    }

    // Capture phase fängt Scroll auf jedem Element ab
    document.addEventListener('scroll', onScroll, true);
});

// CV Sections — scroll-gekoppelt von unten reinschieben (wie Logo, andere Richtung)
// Nutzt capture-phase + getBoundingClientRect wie der Logo-Scroll
window.addEventListener('load', function () {
    var all = document.querySelectorAll('.c-cv-section');
    if (all.length < 2) return;

    // Items sammeln (alles außer About)
    var items = [];
    for (var i = 0; i < all.length; i++) {
        if (all[i].id === 'content') continue;
        var dist = all[i].classList.contains('c-cv-section--portrait') ? 300 : 200;
        items.push({ el: all[i], dist: dist });
    }

    function onScroll() {
        var windowH = window.innerHeight;

        for (var i = 0; i < items.length; i++) {
            var rect = items[i].el.getBoundingClientRect();

            // progress: 0 = Element ist unterhalb des Viewports, 1 = voll eingefahren
            var progress = (windowH - rect.top) / (windowH * 0.85);
            if (progress < 0) progress = 0;
            if (progress > 1) progress = 1;

            // Ease-out wie beim Logo
            var eased = 1 - Math.pow(1 - progress, 3);

            var yOffset = items[i].dist * (1 - eased);
            items[i].el.style.transform = 'translateY(' + yOffset + 'px)';
            items[i].el.style.opacity = eased;
        }
    }

    // Erster Durchlauf
    onScroll();

    // Capture phase wie beim Logo
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll, { passive: true });
});

// Overlay-Bilder — Slide von unten beim Scrollen im Overlay
(function () {
    function initOverlayReveal() {
        var figs = document.querySelectorAll('.c-clean__fig, .c-overlay .js-reveal');
        if (!figs.length) return;

        function onScroll() {
            for (var i = 0; i < figs.length; i++) {
                var fig = figs[i];
                // Nur animieren wenn parent overlay sichtbar ist
                var overlay = fig.closest('.c-overlay');
                if (!overlay || !overlay.classList.contains('is-visible')) continue;

                var rect = fig.getBoundingClientRect();
                var windowH = window.innerHeight;
                var progress = (windowH - rect.top) / (windowH * 0.7);
                if (progress < 0) progress = 0;
                if (progress > 1) progress = 1;

                // Ease-out
                var eased = 1 - Math.pow(1 - progress, 3);

                fig.style.transform = 'translateY(' + (120 * (1 - eased)) + 'px)';
                fig.style.opacity = eased;
            }
        }

        document.addEventListener('scroll', onScroll, true);
        // Auch beim Öffnen des Overlays triggern
        var observer = new MutationObserver(function () {
            requestAnimationFrame(onScroll);
        });
        document.querySelectorAll('.c-overlay').forEach(function (ol) {
            observer.observe(ol, { attributes: true, attributeFilter: ['class'] });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOverlayReveal);
    } else {
        initOverlayReveal();
    }
})();

// Gallery Swipe — Fullscreen-Bildbetrachter mit Drag/Swipe + Pfeiltasten
(function () {
    document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
        var track = gallery.querySelector('.c-gallery__track');
        var slides = gallery.querySelectorAll('.c-gallery__slide');
        var counter = gallery.querySelector('.c-gallery__counter');
        if (!track || slides.length === 0) return;

        var current = 0;
        var total = slides.length;
        var isDragging = false;
        var startX = 0;
        var dragX = 0;
        var startTime = 0;
        function loadSlide(i) {
            if (i < 0 || i >= total) return;
            var img = slides[i].querySelector('img[data-src]');
            if (img) {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            }
        }

        function goTo(index) {
            if (index < 0) index = 0;
            if (index >= total) index = total - 1;
            current = index;
            track.style.transform = 'translateX(' + (-current * 100) + 'vw)';
            if (counter) counter.textContent = (current + 1) + ' / ' + total;
            // Aktuelles + nächstes + vorheriges Bild laden
            loadSlide(current);
            loadSlide(current + 1);
            loadSlide(current - 1);
        }

        var introReady = false;

        // Reset + Intro beim Öffnen des Overlays
        var overlay = gallery.closest('.c-overlay');
        if (overlay) {
            new MutationObserver(function () {
                if (overlay.classList.contains('is-visible')) {
                    // Reset
                    gallery.classList.remove('is-active');
                    gallery.classList.remove('is-intro');
                    gallery.classList.remove('is-loaded');
                    introReady = false;
                    goTo(0);
                    // Phase 1: Labels einblenden (mittig, 0.5s stehen lassen)
                    setTimeout(function () {
                        gallery.classList.add('is-intro');
                    }, 100);
                    // Phase 2: Labels schieben sich neben das Bild
                    setTimeout(function () {
                        gallery.classList.add('is-active');
                    }, 600);
                    // Phase 3: Bild kommt
                    setTimeout(function () {
                        gallery.classList.add('is-loaded');
                        introReady = true;
                    }, 1200);
                } else {
                    gallery.classList.remove('is-active');
                    gallery.classList.remove('is-intro');
                    gallery.classList.remove('is-loaded');
                    introReady = false;
                }
            }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
        }

        // Counter initial
        goTo(0);

        // Klick auf linke/rechte Hälfte
        gallery.addEventListener('click', function (e) {
            if (isDragging || !introReady) return;
            var rect = gallery.getBoundingClientRect();
            var x = e.clientX - rect.left;
            if (x < rect.width / 2) {
                goTo(current - 1);
            } else {
                goTo(current + 1);
            }
        });

        // Drag — Mouse
        track.addEventListener('mousedown', function (e) {
            isDragging = true;
            startX = e.clientX;
            dragX = 0;
            startTime = Date.now();
            track.classList.add('is-dragging');
            e.preventDefault();
        });
        window.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            dragX = e.clientX - startX;
            track.style.transform = 'translateX(calc(' + (-current * 100) + 'vw + ' + dragX + 'px))';
        });
        window.addEventListener('mouseup', function () {
            if (!isDragging) return;
            isDragging = false;
            track.classList.remove('is-dragging');
            finishDrag();
        });

        // Drag — Touch
        track.addEventListener('touchstart', function (e) {
            isDragging = true;
            startX = e.touches[0].clientX;
            dragX = 0;
            startTime = Date.now();
            track.classList.add('is-dragging');
        }, { passive: true });
        track.addEventListener('touchmove', function (e) {
            if (!isDragging) return;
            dragX = e.touches[0].clientX - startX;
            track.style.transform = 'translateX(calc(' + (-current * 100) + 'vw + ' + dragX + 'px))';
        }, { passive: true });
        track.addEventListener('touchend', function () {
            if (!isDragging) return;
            isDragging = false;
            track.classList.remove('is-dragging');
            finishDrag();
        });

        function finishDrag() {
            var dt = Date.now() - startTime || 1;
            var velocity = dragX / dt; // px/ms
            // Schneller Swipe oder mehr als 25% gezogen
            if (Math.abs(velocity) > 0.3 || Math.abs(dragX) > window.innerWidth * 0.25) {
                if (dragX > 0) {
                    goTo(current - 1);
                } else {
                    goTo(current + 1);
                }
            } else {
                goTo(current); // Zurückschnappen
            }
        }

        // Pfeiltasten
        document.addEventListener('keydown', function (e) {
            if (!overlay || !overlay.classList.contains('is-visible')) return;
            if (e.key === 'ArrowLeft') goTo(current - 1);
            if (e.key === 'ArrowRight') goTo(current + 1);
        });
    });
})();

