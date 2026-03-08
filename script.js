
/* ============================================
   MAIN — DOMContentLoaded
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

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
        window.addEventListener('mouseup', function () {
            if (!isDragging) return;
            isDragging = false;
            track.classList.remove('is-dragging');
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
            velocity = -dx / dt * 16;
            pos -= dx;
            lastX = e.touches[0].clientX;
            lastTime = now;
        }, { passive: true });
        track.addEventListener('touchend', function () {
            isDragging = false;
        });
    }

    // Scroll-Effekt: Corner-Labels ausblenden wenn Hero nicht sichtbar, Logo bleibt
    var corners = document.querySelectorAll('.c-corner');
    var hero = document.querySelector('.c-hero');
    if (hero && corners.length) {
        var heroObs = new IntersectionObserver(function (entries) {
            var visible = entries[0].isIntersecting;
            corners.forEach(function (c) {
                c.style.opacity = visible ? '1' : '0';
            });
        }, { threshold: 0.85 });
        heroObs.observe(hero);
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

    // Overlay öffnen (auch Slide-Menü schließen)
    document.querySelectorAll('[data-overlay]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            var id = 'overlay-' + el.getAttribute('data-overlay');
            document.querySelectorAll('.c-overlay').forEach(function (o) {
                o.style.zIndex = '9000';
            });
            var overlay = document.getElementById(id);
            overlay.classList.add('is-visible');
            overlay.style.zIndex = '9001';
            document.body.style.overflow = 'hidden';
            document.body.classList.add('has-overlay');
            if (burger) burger.classList.remove('is-open');
            if (slideMenu) slideMenu.classList.remove('is-open');
            resetThemeColor();
        });
    });

    // Home-Klick: alle Overlays schließen
    if (navHome) {
        navHome.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.c-overlay.is-visible').forEach(function (o) {
                o.classList.remove('is-visible');
            });
            document.body.style.overflow = '';
            document.body.classList.remove('has-overlay');
            if (burger) burger.classList.remove('is-open');
            if (slideMenu) slideMenu.classList.remove('is-open');
            resetThemeColor();
        });
    }

    // Overlay schließen
    document.querySelectorAll('[data-close]').forEach(function (el) {
        el.addEventListener('click', function () {
            var id = el.getAttribute('data-close');
            document.getElementById(id).classList.remove('is-visible');
            document.body.style.overflow = '';
            document.body.classList.remove('has-overlay');
        });
    });

    // ESC-Taste schließt Overlay + Slide-Menü
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.c-overlay.is-visible').forEach(function (o) {
                o.classList.remove('is-visible');
            });
            document.body.style.overflow = '';
            document.body.classList.remove('has-overlay');
            if (burger) burger.classList.remove('is-open');
            if (slideMenu) slideMenu.classList.remove('is-open');
            resetThemeColor();
        }
    });

    // Sprachsteuerung DE / EN
    var translations = {
        de: {
            'nav.home': 'Home',
            'nav.projekte': 'projekte',
            'nav.shop': 'shop',
            'nav.kontakt': 'kontakt',
            'btn.zurueck': '← zurück',
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
            'btn.zurueck': '← back',
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
});
