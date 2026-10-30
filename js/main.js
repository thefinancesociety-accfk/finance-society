/* Finance Society — renders js/content.js into the pages and runs the motion layer.
   No content lives here: edit js/content.js instead. */
(function () {
  "use strict";
  var S = window.SITE;
  var root = document.body.getAttribute("data-root") || "./";
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVGNS = "http://www.w3.org/2000/svg";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function asset(p) { return /^https?:/.test(p) ? p : root + p; }
  function parse(d) { if (!d) return null; var p = d.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function two(n) { return (n < 10 ? "0" : "") + n; }

  function rangeText(e) {
    var a = parse(e.date), b = parse(e.endDate);
    if (!a) return "";
    if (!b || +a === +b) return a.getDate() + " " + MONTHS[a.getMonth()] + " " + a.getFullYear();
    if (a.getMonth() === b.getMonth()) return a.getDate() + "–" + b.getDate() + " " + MONTHS[a.getMonth()] + " " + a.getFullYear();
    return a.getDate() + " " + MONTHS[a.getMonth()] + " – " + b.getDate() + " " + MONTHS[b.getMonth()] + " " + b.getFullYear();
  }

  /* ---------- Email drafts: Gmail compose on desktop, the mail app on phones ---------- */
  var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  function draftBody(lines) { return (lines || S.join.emailBody).join("\n"); }
  function gmailUrl(subject, body) {
    return "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(S.email) +
      "&su=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }
  function mailtoUrl(subject, body) {
    return "mailto:" + S.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }
  function draftUrl(subject, body) { return isMobile ? mailtoUrl(subject, body) : gmailUrl(subject, body); }
  function joinUrl() { return S.join.formUrl || draftUrl(S.join.emailSubject, draftBody()); }
  function eventBody(e) {
    return draftBody([
      "Dear Finance Society team,", "",
      "I would like to register for " + e.title + ". My details are below.", "",
      "Name: ", "Enrolment No.: ", "Course: ", "Semester: ", "Department: ", "Phone (optional): ", "",
      "Regards,"
    ]);
  }

  document.querySelectorAll("[data-join]").forEach(function (a) {
    if (!S.join.open) {
      a.removeAttribute("href");
      a.setAttribute("aria-disabled", "true");
      a.textContent = "Applications open soon";
      a.classList.add("btn-secondary");
      return;
    }
    a.href = joinUrl();
    if (/^https?:/.test(a.href)) { a.target = "_blank"; a.rel = "noopener"; }
  });
  document.querySelectorAll("[data-mailto-join]").forEach(function (a) { a.href = mailtoUrl(S.join.emailSubject, draftBody()); });
  document.querySelectorAll("[data-join-template]").forEach(function (el) {
    el.textContent = "To: " + S.email + "\nSubject: " + S.join.emailSubject + "\n\n" + draftBody();
  });
  document.querySelectorAll("[data-join-closed]").forEach(function (el) { el.hidden = S.join.open; });
  document.querySelectorAll("[data-join-open]").forEach(function (el) { el.hidden = !S.join.open; });
  document.querySelectorAll("[data-copy-template]").forEach(function (b) {
    if (!navigator.clipboard) { b.hidden = true; return; }
    b.addEventListener("click", function () {
      navigator.clipboard.writeText(draftBody()).then(function () {
        b.textContent = "Copied";
        setTimeout(function () { b.textContent = "Copy the template"; }, 2000);
      });
    });
  });

  /* ---------- Simple text bindings ---------- */
  document.querySelectorAll("[data-email]").forEach(function (a) { a.href = "mailto:" + S.email; a.textContent = S.email; });
  document.querySelectorAll("[data-mentor]").forEach(function (el) { el.textContent = S.facultyMentor.name; });
  document.querySelectorAll("[data-socials]").forEach(function (el) {
    var items = [];
    if (S.socials.instagram) items.push('<li><a href="' + esc(S.socials.instagram) + '" rel="noopener" target="_blank">Instagram</a></li>');
    if (S.socials.linkedin) items.push('<li><a href="' + esc(S.socials.linkedin) + '" rel="noopener" target="_blank">LinkedIn</a></li>');
    var block = el.closest("[data-socials-block]");
    if (items.length) el.innerHTML = items.join("");
    else if (block) block.hidden = true;
  });

  /* ---------- Events ---------- */
  var events = (S.events || []).filter(function (e) { return e.publish !== false; });
  var t = today();
  // An event with no date yet but upcoming: true is listed as upcoming, after the dated ones.
  function isUpcoming(e) { if (!e.date && e.upcoming) return true; var end = parse(e.endDate) || parse(e.date); return end && end >= t; }
  var upcoming = events.filter(isUpcoming).sort(function (a, b) { return (parse(a.date) || Infinity) - (parse(b.date) || Infinity); });
  var past = events.filter(function (e) { return !isUpcoming(e); })
    .sort(function (a, b) { return (parse(b.date) || 0) - (parse(a.date) || 0); });

  function dayText(e) {
    var a = parse(e.date), b = parse(e.endDate);
    return two(a.getDate()) + (b && +b !== +a ? "–" + two(b.getDate()) : "");
  }

  function ticket(e, isCompact) {
    var a = parse(e.date);
    var meta = [];
    meta.push("<li>" + esc(a ? rangeText(e) : "Date to be announced") + "</li>");
    if (e.venue) meta.push("<li>" + esc(e.venue) + "</li>");
    var html = '<article class="ticket reveal" id="' + esc(e.id) + '"><div class="ticket-main">' +
      '<div class="ticket-date"><span class="ticket-day">' + (a ? dayText(e) : "TBA") + '</span><span class="ticket-month">' +
      (a ? MONTHS[a.getMonth()].slice(0, 3) + " " + a.getFullYear() : "Date to be announced") + "</span></div><div>" +
      '<span class="tag tag-open">' + esc(e.kind) + " · Upcoming</span>" +
      "<h3>" + esc(e.title) + "</h3>" +
      (e.tagline ? '<p class="tagline">' + esc(e.tagline) + "</p>" : "") +
      (meta.length ? '<ul class="meta">' + meta.join("") + "</ul>" : "") +
      "<p>" + esc(e.summary) + "</p>";
    if (!isCompact && e.details && e.details.length) {
      html += '<ul class="details">' + e.details.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul>";
    }
    if (e.eligibility) html += '<p class="muted"><strong>Who can enter:</strong> ' + esc(e.eligibility) + "</p>";
    var actions = [];
    if (e.register) {
      var reg = e.register.url ? e.register.url : draftUrl(e.register.subject || "Registration: " + e.title, eventBody(e));
      var ext = /^https?:/.test(reg) ? ' target="_blank" rel="noopener"' : "";
      actions.push('<a class="btn" href="' + esc(reg) + '"' + ext + '>Register by email <span class="arrow" aria-hidden="true">→</span></a>');
    }
    if (isCompact) actions.push('<a class="btn btn-secondary" href="' + root + "events/#" + esc(e.id) + '">Event details</a>');
    else (e.attachments || []).forEach(function (f) {
      actions.push('<a class="btn btn-secondary" href="' + esc(asset(f.href)) + '">' + esc(f.label) + "</a>");
    });
    if (actions.length) html += '<div class="btn-row">' + actions.join("") + "</div>";
    var initials = e.title.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
    return html + '</div></div><div class="ticket-stub" aria-hidden="true">Admit<strong>' + esc(e.title) + '</strong><span class="seal">' + esc(initials) + "</span></div></article>";
  }

  function archiveRow(e) {
    var a = parse(e.date);
    var body = "<p>" + esc(e.summary) + "</p>" + (e.recap ? "<p>" + esc(e.recap) + "</p>" : "") +
      (e.venue ? '<p class="mono">' + esc(e.venue) + "</p>" : "");
    if (e.photos && e.photos.length) {
      body += '<div class="event-photos">' + e.photos.map(function (p) {
        return '<img src="' + esc(asset(p.src)) + '" alt="' + esc(p.alt) + '" loading="lazy" decoding="async" width="1200" height="900">';
      }).join("") + "</div>";
    }
    // Rows with photos start open so the gallery is seen without a click.
    return '<li class="reveal" id="' + esc(e.id) + '"><details' + (e.photos && e.photos.length ? " open" : "") + "><summary>" +
      '<span class="date">' + (a ? two(a.getDate()) + " " + MONTHS[a.getMonth()].slice(0, 3) + " " + a.getFullYear() : "") + "</span>" +
      '<span class="title">' + esc(e.title) + "</span>" +
      '<span class="kind">' + esc(e.kind) + "</span>" +
      '<span class="plus" aria-hidden="true">+</span></summary>' +
      '<div class="body"><div>' + body + "</div></div></details></li>";
  }

  function render(sel, fn) { document.querySelectorAll(sel).forEach(function (el) { el.innerHTML = fn(el); }); }
  function empty(label, text) { return '<div class="empty reveal"><span class="mono">' + esc(label) + "</span><p>" + esc(text) + "</p></div>"; }

  render('[data-render="next-event"]', function () {
    return upcoming.length ? ticket(upcoming[0], true) : empty("Calendar", "The next event will be announced here.");
  });
  render('[data-render="events-upcoming"]', function () {
    return upcoming.length ? upcoming.map(function (e) { return ticket(e); }).join("") : empty("Calendar", "No upcoming events right now. Check back soon.");
  });
  render('[data-render="events-past"]', function (el) {
    if (!past.length) { var s = el.closest("section"); if (s) s.hidden = true; return ""; }
    return '<ul class="archive">' + past.map(archiveRow).join("") + "</ul>";
  });

  // Deep links to a past event open its row.
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    var det = target && target.querySelector("details");
    if (det) det.open = true;
  }

  /* ---------- Team ---------- */
  render('[data-render="team"]', function () {
    if (!S.team.length) return empty("Core committee", "The founding committee will be announced here shortly.");
    return '<div class="people">' + S.team.map(function (p) {
      var initials = p.name.split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join("");
      var pic = p.photo
        ? '<img class="person-photo" src="' + esc(asset(p.photo)) + '" alt="Portrait of ' + esc(p.name) + '" loading="lazy" width="400" height="500">'
        : '<div class="person-initials" aria-hidden="true">' + esc(initials) + "</div>";
      return '<article class="person reveal">' + pic + "<h3>" + esc(p.name) + '</h3><p class="role">' + esc(p.role) + "</p>" +
        (p.linkedin ? '<p><a href="' + esc(p.linkedin) + '" target="_blank" rel="noopener">LinkedIn<span class="visually-hidden"> profile of ' + esc(p.name) + "</span></a></p>" : "") +
        "</article>";
    }).join("") + "</div>";
  });

  /* ---------- Research ---------- */
  render('[data-render="research"]', function () {
    if (!S.research.length) return empty("Research desk", "First member research coming this semester.");
    var notes = S.research.slice().sort(function (a, b) { return parse(b.date) - parse(a.date); });
    return '<div class="people">' + notes.map(function (n) {
      var ext = (n.file.split(".").pop() || "").toUpperCase();
      return '<article class="card reveal"><span class="note-meta">' + esc(n.type || "Note") + " · " + esc(rangeText({ date: n.date })) + "</span>" +
        "<h3>" + esc(n.title) + "</h3>" +
        '<p class="note-meta">' + esc(n.authors.join(", ")) + "</p>" +
        '<p class="note-takeaway">' + esc(n.takeaway) + "</p>" +
        '<p><a href="' + esc(asset(n.file)) + '">Download ' + esc(ext) + '<span class="visually-hidden">: ' + esc(n.title) + "</span></a></p></article>";
    }).join("") + "</div>";
  });

  /* ---------- Ticker: brand phrases and the real next event, never prices ---------- */
  document.querySelectorAll("[data-ticker]").forEach(function (bar) {
    var items = [
      ["dot", "●", "Finance Society"],
      ["up", "▲", "Research"],
      ["up", "▲", "Markets"],
      ["up", "▲", "Careers"],
      ["dot", "●", "Amity University Kolkata"]
    ];
    if (upcoming[0]) items.splice(1, 0, ["up", "▲", upcoming[0].title + " · " + (rangeText(upcoming[0]) || "Date to be announced")]);
    items.push(["down", "▼", "Student research. Not investment advice."]);
    var group = items.map(function (i) { return '<span><b class="' + i[0] + '">' + i[1] + "</b>" + esc(i[2]) + "</span>"; }).join("");
    bar.querySelector(".ticker-track").innerHTML =
      '<div class="ticker-group">' + group + '</div><div class="ticker-group" aria-hidden="true">' + group + "</div>";
    var pause = bar.querySelector(".ticker-pause");
    if (pause) pause.addEventListener("click", function () {
      var paused = bar.classList.toggle("is-paused");
      pause.setAttribute("aria-pressed", String(paused));
      pause.textContent = paused ? "Play" : "Pause";
    });
  });

  /* ---------- Split headings into masked words (screen readers read the label) ---------- */
  function splitWords(el, counter) {
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(" ")); return; }
          var outer = document.createElement("span");
          outer.className = "word";
          var inner = document.createElement("span");
          inner.style.setProperty("--i", counter.n++);
          inner.textContent = w;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== "BR") {
        splitWords(node, counter);
      }
    });
  }
  document.querySelectorAll("[data-split]").forEach(function (h) {
    h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
    var c = { n: 0 };
    Array.prototype.slice.call(h.childNodes).forEach(function (n) { if (n.nodeType === 1) n.setAttribute("aria-hidden", "true"); });
    splitWords(h, c);
    h.querySelectorAll(".word").forEach(function (w) { w.setAttribute("aria-hidden", "true"); });
  });
  document.querySelectorAll(".lit").forEach(function (p) {
    p.innerHTML = p.innerHTML.replace(/(^|>)([^<]+)/g, function (m, a, text) {
      return a + text.replace(/(\S+)/g, '<span class="w">$1</span>');
    });
  });

  /* ---------- Guilloche rosettes: overlapping hypotrochoids, drawn as hairlines ---------- */
  function rosettePath(R, r, d, turns, cx, cy, scale) {
    var pts = [], steps = 1400;
    for (var i = 0; i <= steps; i++) {
      var th = (i / steps) * Math.PI * 2 * turns;
      var x = (R - r) * Math.cos(th) + d * Math.cos(((R - r) / r) * th);
      var y = (R - r) * Math.sin(th) - d * Math.sin(((R - r) / r) * th);
      pts.push((cx + x * scale).toFixed(1) + " " + (cy + y * scale).toFixed(1));
    }
    return "M" + pts.join("L");
  }
  function drawRosette(svg, sets) {
    svg.setAttribute("viewBox", "0 0 400 400");
    sets.forEach(function (s, i) {
      var p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", rosettePath(s[0], s[1], s[2], s[3], 200, 200, s[4]));
      p.setAttribute("pathLength", "1");
      p.style.setProperty("--i", i);
      svg.appendChild(p);
    });
  }
  document.querySelectorAll("svg.rosette").forEach(function (svg) {
    drawRosette(svg, [[120, 45, 70, 9, 1.05], [120, 47, 60, 47, 1.0], [96, 36, 52, 3, 1.25], [160, 21, 30, 21, 1.05], [140, 35, 40, 1, 0.6]]);
  });
  document.querySelectorAll("[data-medallion]").forEach(function (svg) {
    drawRosette(svg, [[120, 45, 70, 9, 1.4], [160, 21, 30, 21, 1.18]]);
  });

  /* ---------- Market line: a decorative drifting line, not data ---------- */
  document.querySelectorAll("svg.market-line").forEach(function (svg) {
    var w = 1200, h = 200, seed = 7, y = 150, pts = [];
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var x = 0; x <= w; x += 12) {
      y += (rnd() - 0.56) * 22;
      y = Math.max(20, Math.min(185, y));
      pts.push(x + " " + y.toFixed(1));
    }
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.innerHTML = '<defs><linearGradient id="mlGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A96E" stop-opacity=".18"/><stop offset="1" stop-color="#C9A96E" stop-opacity="0"/></linearGradient></defs>' +
      '<path class="area" d="M' + pts.join("L") + "L" + w + " " + h + "L0 " + h + 'Z"/>' +
      '<path pathLength="1" d="M' + pts.join("L") + '"/>';
  });

  /* ---------- Navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
      nav.classList.toggle("is-open", open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { toggle.click(); toggle.focus(); }
    });
  }
  var header = document.querySelector(".site-header");
  if (header) {
    var solid = function () { header.classList.toggle("is-solid", window.scrollY > 24); };
    solid();
    addEventListener("scroll", solid, { passive: true });
  }

  /* ---------- Reveals: native scroll timelines where supported, IntersectionObserver otherwise ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("io");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal, [data-split]").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal, [data-split]").forEach(function (el) { el.classList.add("in"); });
  }

  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
