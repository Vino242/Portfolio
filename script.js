/* ============================================
   PRELOADER — Bilder-Sequenz + Expansion
   ============================================ */

(function () {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        preloader.remove();
        return;
    }

    var imgs = preloader.querySelectorAll('.c-preloader__img');
    var finalImg = preloader.querySelector('.c-preloader__img--final');
    var imageStack = preloader.querySelector('.c-preloader__images');
    var mainTitle = document.getElementById('main-title');
    var burgerBtn = document.getElementById('burger-toggle');

    document.body.style.overflow = 'hidden';
    if (burgerBtn) burgerBtn.style.opacity = '0';

    // --- Bilder vorladen, dann Animation starten ---
    var visibleImgs = [];
    imgs.forEach(function (img, i) {
        if (img.offsetParent === null && getComputedStyle(img).display === 'none') return;
        visibleImgs.push({ el: img, originalIdx: i });
    });

    // Alle sichtbaren Bilder vorladen (dekodieren) bevor Animation startet
    var preloadPromises = visibleImgs.map(function (item) {
        var bg = getComputedStyle(item.el).backgroundImage;
        var url = bg.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
        var img = new Image();
        img.src = url;
        return new Promise(function (resolve) {
            if (img.complete) { resolve(); return; }
            img.onload = resolve;
            img.onerror = resolve;
        });
    });

    Promise.all(preloadPromises).then(startAnimation);

    function startAnimation() {

    // --- Phase 1: Bilder übereinander aufdecken ---
    var startDelay = 300;
    var stagger = 280;

    var visibleIdx = visibleImgs.length;
    visibleImgs.forEach(function (item, idx) {
        setTimeout(function () {
            item.el.classList.add('is-revealed');
            // Letztes sichtbares Bild: Schrift sofort auf Weiß
            if (item.originalIdx === imgs.length - 1 && mainTitle) {
                mainTitle.classList.add('is-final');
            }
        }, startDelay + (idx * stagger));
    });

    // Titel einblenden (sofort sichtbar, bleibt durchgehend)
    setTimeout(function () {
        if (mainTitle) mainTitle.classList.add('is-visible');
    }, startDelay + 200);

    // --- Phase 2: Expansion (Desktop) oder Fade (Mobile) ---
    var afterSequence = startDelay + ((visibleIdx - 1) * stagger) + 500 + 300;
    var isMobile = window.innerWidth <= 500;

    setTimeout(function () {

        // Nicht-finale Bilder ausblenden
        imgs.forEach(function (img) {
            if (!img.classList.contains('c-preloader__img--final')) {
                img.style.visibility = 'hidden';
            }
        });

        if (isMobile) {
            // Mobile: einfacher Fade-Out (nur opacity, GPU-beschleunigt)
            setTimeout(function () {
                if (burgerBtn) {
                    burgerBtn.style.transition = 'opacity 0.6s ease';
                    burgerBtn.style.opacity = '1';
                }
                preloader.classList.add('is-done');
                document.body.style.overflow = '';
                window.scrollTo(0, 0);
                setTimeout(function () { preloader.remove(); }, 1200);
            }, 400);

        } else {
            // Desktop: clip-path Expansion
            var rect = imageStack.getBoundingClientRect();
            var vw = window.innerWidth;
            var vh = window.innerHeight;

            var clipTop = (rect.top / vh * 100).toFixed(2);
            var clipRight = ((vw - rect.right) / vw * 100).toFixed(2);
            var clipBottom = ((vh - rect.bottom) / vh * 100).toFixed(2);
            var clipLeft = (rect.left / vw * 100).toFixed(2);

            imageStack.style.contain = 'none';
            imageStack.style.clipPath = 'inset(' + clipTop + '% ' + clipRight + '% ' + clipBottom + '% ' + clipLeft + '% round 4px)';
            imageStack.classList.add('is-expanding');
            void imageStack.offsetHeight;

            imageStack.animate([
                { clipPath: 'inset(' + clipTop + '% ' + clipRight + '% ' + clipBottom + '% ' + clipLeft + '% round 4px)' },
                { clipPath: 'inset(0% 0% 0% 0% round 0px)' }
            ], {
                duration: 2200,
                easing: 'cubic-bezier(0.6, 0.01, 0.05, 1)',
                fill: 'forwards'
            });

            setTimeout(function () {
                if (burgerBtn) {
                    burgerBtn.style.transition = 'opacity 1.2s cubic-bezier(0.65, 0, 0.35, 1)';
                    burgerBtn.style.opacity = '1';
                }
            }, 1600);

            setTimeout(function () {
                preloader.classList.add('is-done');
                document.body.style.overflow = '';
                window.scrollTo(0, 0);
                setTimeout(function () { preloader.remove(); }, 1400);
            }, 2400);
        }
    }, afterSequence);

    } // end startAnimation
})();


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

    // Scroll-Effekt: Titel ausblenden wenn Hero nicht sichtbar
    var mainTitle = document.getElementById('main-title');
    var hero = document.querySelector('.c-hero');
    if (mainTitle && hero) {
        var titleObs = new IntersectionObserver(function (entries) {
            if (!mainTitle.classList.contains('is-visible')) return;
            if (entries[0].isIntersecting) {
                mainTitle.style.opacity = '1';
            } else {
                mainTitle.style.opacity = '0';
            }
        }, { threshold: 0.55 });
        titleObs.observe(hero);
    }

    // Burger-Menü Toggle
    var burger = document.getElementById('burger-toggle');
    var slideMenu = document.getElementById('slide-menu');
    if (burger && slideMenu) {
        burger.addEventListener('click', function () {
            burger.classList.toggle('is-open');
            slideMenu.classList.toggle('is-open');
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
