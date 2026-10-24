/* Finance Society — renders js/content.js into the pages. No content lives here. */
(function () {
  "use strict";
  var S = window.SITE;
  var root = document.body.getAttribute("data-root") || "./";
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function asset(p) { return /^https?:/.test(p) ? p : root + p; }
  function parse(d) { if (!d) return null; var p = d.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }

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

  function joinUrl() {
    if (S.join.formUrl) return S.join.formUrl;
    return draftUrl(S.join.emailSubject, draftBody());
  }
  function eventBody(e) {
    return draftBody([
      "Dear Finance Society team,",
      "",
      "I would like to register for " + e.title + ". My details are below.",
      "",
      "Name: ",
      "Enrolment No.: ",
      "Course: ",
      "Semester: ",
      "Department: ",
      "Phone (optional): ",
      "",
      "Regards,"
    ]);
  }

  // Every element with data-join becomes the primary join action.
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
  document.querySelectorAll("[data-mailto-join]").forEach(function (a) {
    a.href = mailtoUrl(S.join.emailSubject, draftBody());
  });
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
  document.querySelectorAll("[data-email]").forEach(function (a) {
    a.href = "mailto:" + S.email;
    a.textContent = S.email;
  });
  document.querySelectorAll("[data-mentor]").forEach(function (el) {
    el.textContent = S.facultyMentor.name;
  });
  document.querySelectorAll("[data-socials]").forEach(function (el) {
    var items = [];
    if (S.socials.instagram) items.push('<li><a href="' + esc(S.socials.instagram) + '" rel="noopener" target="_blank">Instagram</a></li>');
    if (S.socials.linkedin) items.push('<li><a href="' + esc(S.socials.linkedin) + '" rel="noopener" target="_blank">LinkedIn</a></li>');
    if (items.length) el.innerHTML = items.join("");
    else el.closest("[data-socials-block]") && (el.closest("[data-socials-block]").hidden = true);
  });

  /* ---------- Events ---------- */
  var events = (S.events || []).filter(function (e) { return e.publish !== false; });
  var t = today();
  function isUpcoming(e) { var end = parse(e.endDate) || parse(e.date); return end && end >= t; }
  var upcoming = events.filter(isUpcoming).sort(function (a, b) { return parse(a.date) - parse(b.date); });
  var past = events.filter(function (e) { return !isUpcoming(e); })
    .sort(function (a, b) { return (parse(b.date) || 0) - (parse(a.date) || 0); });

  function eventCard(e, isNext) {
    var a = parse(e.date);
    var dateCol = a
      ? '<span class="event-day">' + a.getDate() + (e.endDate && e.endDate !== e.date ? "–" + parse(e.endDate).getDate() : "") + "</span>" +
        '<span class="event-month">' + MONTHS[a.getMonth()].slice(0, 3) + " " + a.getFullYear() + "</span>"
      : '<span class="event-month">Past event</span>';
    var meta = [];
    if (a) meta.push("<li>" + esc(rangeText(e)) + "</li>");
    if (e.venue) meta.push("<li>" + esc(e.venue) + "</li>");
    var h = "h3";
    var html = '<article class="event reveal" id="' + esc(e.id) + '">' +
      '<div class="event-date">' + dateCol + "</div><div>" +
      '<span class="tag' + (isUpcoming(e) ? " tag-open" : "") + '">' + esc(e.kind) + (isUpcoming(e) ? " · Upcoming" : "") + "</span>" +
      "<" + h + ' class="event-title">' + esc(e.title) + "</" + h + ">" +
      (e.tagline ? '<p class="event-tagline">' + esc(e.tagline) + "</p>" : "") +
      (meta.length ? '<ul class="event-meta">' + meta.join("") + "</ul>" : "") +
      "<p>" + esc(e.summary) + "</p>";
    if (!isNext && e.details && e.details.length) {
      html += '<ul class="details">' + e.details.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul>";
    }
    if (e.eligibility) html += '<p class="muted"><strong>Who can enter:</strong> ' + esc(e.eligibility) + "</p>";
    if (!isNext && e.recap) html += "<p>" + esc(e.recap) + "</p>";
    if (!isNext && e.photos && e.photos.length) {
      html += '<div class="event-photos">' + e.photos.map(function (p) {
        return '<img src="' + esc(asset(p.src)) + '" alt="' + esc(p.alt) + '" loading="lazy" width="400" height="300">';
      }).join("") + "</div>";
    }
    var actions = [];
    if (isUpcoming(e) && e.register) {
      var reg = e.register.url ? e.register.url : draftUrl(e.register.subject || "Registration: " + e.title, eventBody(e));
      var ext = /^https?:/.test(reg) ? ' target="_blank" rel="noopener"' : "";
      actions.push('<a class="btn" href="' + esc(reg) + '"' + ext + ">Register by email</a>");
    }
    if (isNext) actions.push('<a class="btn btn-secondary" href="' + root + "events/#" + esc(e.id) + '">Event details</a>');
    else (e.attachments || []).forEach(function (f) {
      actions.push('<a class="btn btn-secondary" href="' + esc(asset(f.href)) + '">' + esc(f.label) + "</a>");
    });
    if (actions.length) html += '<div class="btn-row">' + actions.join("") + "</div>";
    return html + "</div></article>";
  }

  function render(sel, fn) { document.querySelectorAll(sel).forEach(function (el) { el.innerHTML = fn(el); }); }
  function empty(text) { return '<div class="empty"><p>' + esc(text) + "</p></div>"; }

  render('[data-render="next-event"]', function () {
    return upcoming.length ? eventCard(upcoming[0], true) : empty("The next event will be announced here.");
  });
  render('[data-render="events-upcoming"]', function () {
    return upcoming.length ? upcoming.map(function (e) { return eventCard(e); }).join("") : empty("No upcoming events right now. Check back soon.");
  });
  render('[data-render="events-past"]', function (el) {
    if (!past.length) { var s = el.closest("section"); if (s) s.hidden = true; return ""; }
    return past.map(function (e) { return eventCard(e); }).join("");
  });

  /* ---------- Team ---------- */
  render('[data-render="team"]', function () {
    if (!S.team.length) return empty("The founding committee will be announced here shortly.");
    return '<div class="cards">' + S.team.map(function (p) {
      var initials = p.name.split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join("");
      var pic = p.photo
        ? '<img class="person-photo" src="' + esc(asset(p.photo)) + '" alt="Portrait of ' + esc(p.name) + '" loading="lazy" width="400" height="400">'
        : '<div class="person-initials" aria-hidden="true">' + esc(initials) + "</div>";
      return '<article class="card person reveal">' + pic + "<h3>" + esc(p.name) + '</h3><p class="role">' + esc(p.role) + "</p>" +
        (p.linkedin ? '<p><a href="' + esc(p.linkedin) + '" target="_blank" rel="noopener">LinkedIn<span class="visually-hidden"> profile of ' + esc(p.name) + "</span></a></p>" : "") +
        "</article>";
    }).join("") + "</div>";
  });

  /* ---------- Research ---------- */
  render('[data-render="research"]', function () {
    if (!S.research.length) return empty("First member research coming this semester.");
    var notes = S.research.slice().sort(function (a, b) { return parse(b.date) - parse(a.date); });
    return '<div class="cards">' + notes.map(function (n) {
      var ext = (n.file.split(".").pop() || "").toUpperCase();
      return '<article class="card reveal"><span class="tag">' + esc(n.type || "Note") + "</span>" +
        "<h3>" + esc(n.title) + "</h3>" +
        '<p class="note-meta">' + esc(n.authors.join(", ")) + " · " + esc(rangeText({ date: n.date })) + "</p>" +
        '<p class="note-takeaway">' + esc(n.takeaway) + "</p>" +
        '<p><a href="' + esc(asset(n.file)) + '">Download ' + esc(ext) + '<span class="visually-hidden">: ' + esc(n.title) + "</span></a></p></article>";
    }).join("") + "</div>";
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

  /* ---------- Light reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
