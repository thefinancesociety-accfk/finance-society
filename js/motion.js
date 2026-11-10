/* Finance Society — GSAP motion layer, shared by every page.
   Runs after main.js has rendered the content and split the headings, and
   replaces the CSS keyframes, scroll timelines and IntersectionObserver
   reveals with one choreography that behaves the same in every browser.
   Pinned and horizontal-scroll moments only run at 900px and wider.
   Under prefers-reduced-motion nothing moves and everything is shown. */
(function () {
  "use strict";
  var html = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) { html.classList.remove("gsap"); return; }
  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0); // real time even when frames drop, so content is never held back

  var EASE = "power3.out"; // closest GSAP curve to --ease: cubic-bezier(0.2, 0.7, 0.2, 1)
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return gsap.utils.toArray((ctx || document).querySelectorAll(sel)); };
  var mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: reduce)", function () {
    gsap.set(".wordmark", { backgroundPosition: "0% 0" });
  });

  mm.add({ motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 900px)" }, function (ctx) {
    if (!ctx.conditions.motion) return;
    var wide = ctx.conditions.wide;

    /* ---------- Home hero: one timeline, then layered parallax on the way out ---------- */
    if ($(".hero")) {
      var hero = gsap.timeline({ defaults: { ease: EASE } });
      hero
        .fromTo(".hero .mask > .line", { y: 0, yPercent: 105 }, { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.1)
        .fromTo(".hero .fade-up", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.45)
        .to(".hero-meta", { opacity: 1, duration: 0.8 }, 0.8)
        .to(".rosette path", { strokeDashoffset: 0, duration: 2.6, ease: "power2.out", stagger: 0.12 }, 0.15);

      // The rosette's paths turn around the drawing's centre, so the <svg>'s
      // own CSS positioning (translate: 0 -50%) is left alone.
      var petals = ".hero .rosette path";
      gsap.set(petals, { svgOrigin: "200 200" });
      gsap.to(petals, { rotation: 360, duration: 220, ease: "none", repeat: -1 });

      var out = { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 };
      gsap.to(petals, { scale: 1.3, ease: "none", scrollTrigger: out });
      gsap.to(".hero .rosette", { opacity: 0.15, ease: "none", scrollTrigger: out });
      // Title travels slower than the page, so the copy below slides over it.
      gsap.to(".hero h1", { yPercent: 35, opacity: 0.25, ease: "none", scrollTrigger: out });
    }

    /* ---------- Subpage header: copy settles in, title drifts as it leaves ---------- */
    if ($(".page-head")) {
      gsap.fromTo(".page-head .eyebrow, .page-head > .container > p", { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.12, delay: 0.25 });
      gsap.to(".page-head h1", {
        yPercent: 30, opacity: 0.3, ease: "none",
        scrollTrigger: { trigger: ".page-head", start: "top top", end: "bottom top", scrub: 1 }
      });
    }

    /* ---------- Split headings: words rise out of their masks ---------- */
    $$("[data-split]").forEach(function (h) {
      var inHeader = h.closest(".page-head");
      gsap.fromTo($$(".word > span", h), { y: 0, yPercent: 105 }, {
        yPercent: 0, duration: 1, ease: EASE, stagger: 0.05,
        // Headers are on screen at load; everything else waits for the scroll.
        scrollTrigger: inHeader ? null : { trigger: h, start: "top 88%", once: true },
        delay: inHeader ? 0.1 : 0
      });
    });

    /* ---------- Index rows (pillars, charter): the numeral slides in, then the words ---------- */
    $$(".index > li").forEach(function (li) {
      var tl = gsap.timeline({ defaults: { ease: EASE }, scrollTrigger: { trigger: li, start: "top 88%", once: true } });
      tl.fromTo(li, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
        .fromTo($$(".num", li), { opacity: 0, xPercent: -60 }, { opacity: 1, xPercent: 0, duration: 0.9 }, 0)
        .fromTo($$("h3", li), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, 0.1)
        .fromTo($$("p", li), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.2)
        .fromTo($$(".go", li), { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.6, clearProps: "transform" }, 0.35);
    });

    /* ---------- Everything else rises in batches ---------- */
    var batched = $$(".reveal, .steps > li, .rail > .card").filter(function (el) {
      return !el.classList.contains("ticket") && !el.closest(".index");
    });
    gsap.set(batched, { opacity: 0, y: 32 });
    ScrollTrigger.batch(batched, {
      start: "top 92%", once: true,
      onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.08, overwrite: true }); }
    });

    /* ---------- Event tickets: the card lands, the stub settles, the seal stamps ---------- */
    $$(".ticket").forEach(function (t) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: t, start: "top 85%", once: true } });
      tl.fromTo(t, { opacity: 0, y: 60, rotation: -1.5, transformOrigin: "0% 100%" }, { opacity: 1, y: 0, rotation: 0, duration: 1, ease: EASE })
        .fromTo($(".ticket-stub", t), { xPercent: 14, rotation: 5, transformOrigin: "0% 100%" },
          { xPercent: 0, rotation: 0, duration: 0.8, ease: "back.out(1.6)" }, 0.3)
        .fromTo($(".seal", t), { scale: 2, rotation: -20, opacity: 0 },
          { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: "back.out(2.2)" }, 0.7);
    });

    /* ---------- Manifesto: words light as you read. On wide screens the
       section holds still while it happens. ---------- */
    $$(".lit").forEach(function (p) {
      var words = $$(".w", p);
      if (wide) {
        var section = p.closest("section");
        gsap.timeline({ scrollTrigger: { trigger: section, start: "top top", end: "+=90%", pin: true, scrub: 0.6 } })
          .fromTo(words, { opacity: 0.12 }, { opacity: 1, ease: "none", stagger: 0.1 });
      } else {
        gsap.fromTo(words, { opacity: 0.15 }, {
          opacity: 1, ease: "none", stagger: 0.1,
          scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: true }
        });
      }
    });

    /* ---------- About: the semester rail scrolls sideways while the section is pinned ---------- */
    if (wide) {
      $$(".rail").forEach(function (rail) {
        var travel = function () { return rail.scrollWidth - rail.clientWidth; };
        if (travel() < 40) return;
        gsap.set(rail, { scrollSnapType: "none" }); // snapping would fight the scrub
        gsap.to(rail, {
          scrollLeft: travel, ease: "none",
          scrollTrigger: { trigger: rail.closest("section"), start: "top top", end: function () { return "+=" + travel(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true }
        });
      });
    }

    /* ---------- Photo parallax: page headers, the calendar and the CTA ---------- */
    $$(".feature-bg img, .cta-bg img, .page-head-media img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -10, scale: 1.2 }, {
        yPercent: 10, scale: 1.2, ease: "none",
        scrollTrigger: { trigger: img.closest("section, header") || img, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    /* ---------- CTA headline grows into place ---------- */
    if ($(".cta h2")) {
      gsap.fromTo(".cta h2", { scale: 0.86 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: ".cta", start: "top bottom", end: "center center", scrub: 1 }
      });
    }

    /* ---------- Marquee band: drifts on its own, surges with scroll speed and follows its direction ---------- */
    $$(".band").forEach(function (band) {
      var dir = band.classList.contains("reverse") ? -1 : 1;
      var track = $(".band-track", band);
      var loop = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
      loop.totalTime(loop.duration() * 100); // headroom so it can run backwards
      loop.timeScale(dir);
      var skew = gsap.quickTo(track, "skewX", { duration: 0.4, ease: "power3" });
      ScrollTrigger.create({
        trigger: band, start: "top bottom", end: "bottom top",
        onUpdate: function (self) {
          var v = self.getVelocity();
          var surge = 1 + Math.min(Math.abs(v) / 300, 7);
          skew(gsap.utils.clamp(-8, 8, v / -250));
          gsap.timeline({ overwrite: true })
            .to(loop, { timeScale: surge * self.direction * dir, duration: 0.25 })
            .to(loop, { timeScale: self.direction * dir, duration: 1.2, ease: "power1.inOut" })
            .add(function () { skew(0); }, 0.3);
        }
      });
      band.addEventListener("mouseenter", function () { loop.pause(); });
      band.addEventListener("mouseleave", function () { loop.resume(); });
    });

    /* ---------- Footer wordmark fills with gold as the page closes ---------- */
    // A one-shot fill rather than a scrub: the page ends before a scrub could finish.
    gsap.to(".wordmark", {
      backgroundPosition: "0% 0", duration: 1.8, ease: "power2.inOut",
      scrollTrigger: { trigger: ".wordmark", start: "top 92%", once: true }
    });
  });

  // Web fonts and late images change the layout; re-measure once they're in.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
