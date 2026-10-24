/*
  Finance Society — site content.
  This is the ONLY file you need to edit to update the website.
  See README.md for step-by-step instructions and copy-paste templates.

  Rules
  - Dates are written as "YYYY-MM-DD" (e.g. "2026-11-03").
  - File paths are relative to the site root, e.g. "assets/research/note.pdf".
  - Every image needs an "alt" text describing what is in the photo.
  - Leave a field as "" (empty) if you do not have it yet; the site hides it.
*/
window.SITE = {
  name: "Finance Society",
  fullName: "Finance Society, Amity University Kolkata",
  institution: "Amity College of Commerce and Finance, Kolkata",
  email: "thefinancesocietyaccfk@gmail.com",

  // Leave "" until the page exists; empty links are hidden everywhere.
  socials: {
    instagram: "",
    linkedin: ""
  },

  facultyMentor: {
    name: "Dr Sreya Bar",
    role: "Faculty Mentor",
    institution: "Amity College of Commerce and Finance, Kolkata"
  },

  /* ---------------------------------------------------------------
     JOIN — the Join button opens a pre-filled email to the society.
     Set "formUrl" to a Google/Microsoft Form link to use a form instead.
     Set "open" to false to show "Applications open soon".
  --------------------------------------------------------------- */
  join: {
    open: true,
    formUrl: "",
    emailSubject: "Membership application: Finance Society",
    emailBody: [
      "Dear Finance Society team,",
      "",
      "I am interested in joining the Finance Society. My details are below.",
      "",
      "Name: ",
      "Enrolment No.: ",
      "Course: ",
      "Semester: ",
      "Department: ",
      "",
      "Why I would like to join (two or three lines): ",
      "",
      "Regards,"
    ]
  },

  /* ---------------------------------------------------------------
     TEAM — add one block per person, in the order they should appear.
     Template (copy, paste above the closing bracket, fill in):
     {
       name: "Full Name",
       role: "President",
       photo: "assets/img/team/full-name.webp",   // square, at least 400x400; "" for initials
       linkedin: ""                                // optional
     },
  --------------------------------------------------------------- */
  team: [],

  /* ---------------------------------------------------------------
     EVENTS — upcoming and past are sorted automatically by date.
     Template:
     {
       id: "short-id",                 // lowercase, no spaces; must be unique
       title: "Event name",
       kind: "Quiz",                   // Quiz, Debate, Seminar, Workshop, Talk...
       date: "2026-11-03",             // start date
       endDate: "",                    // optional, for multi-day events
       venue: "",
       summary: "One or two sentences on what the event is.",
       details: [],                    // optional short bullet points
       eligibility: "",
       register: { email: true, subject: "Registration: Event name" },  // or { url: "https://..." } or null
       attachments: [],                // e.g. [{ label: "Poster (PDF)", href: "assets/events/x.pdf" }]
       recap: "",                      // past events: a short recap paragraph
       photos: [],                     // past events: [{ src: "assets/img/events/x.webp", alt: "..." }]
       publish: true                   // false keeps it in this file but off the site
     },
  --------------------------------------------------------------- */
  events: [
    {
      id: "cash-iq-2026",
      title: "CA$H IQ",
      kind: "Quiz",
      tagline: "What’s your IQ worth?",
      date: "2026-11-03",
      endDate: "2026-11-04",
      venue: "E Block, Amity University Kolkata",
      summary: "The Finance Society’s flagship financial literacy quiz. Teams of two are tested on the ideas that run households, markets and economies, from interest and inflation to instruments, institutions and the headlines that move them.",
      details: [
        "Screening: a 5–7 minute interview with the faculty in-charge",
        "Day one, 3 November — Round I, The Opening Bell, and Round II, The Margin Call (E Block)",
        "Day two, 4 November — The Final, The Closing Bell, before a live audience (Seminar Hall, 6th Floor, E Block)",
        "Teams of two are formed by the faculty in-charge; up to ten participants",
        "Topic areas are circulated to participants at least five days before the event"
      ],
      eligibility: "B.Com and BBA students of ACCFK, ASBK and ABSK, all years.",
      register: { email: true, subject: "Registration: CA$H IQ 2026" },
      attachments: [{ label: "Event poster (PDF)", href: "assets/events/cash-iq-2026-poster.pdf" }],
      recap: "",
      photos: [],
      publish: true
    },

    {
      id: "risa-2026",
      title: "Regional Investor Seminar for Awareness",
      kind: "Seminar",
      date: "2026-09-10",
      endDate: "",
      venue: "Seminar Hall, E Block, 6th Floor, Amity University Kolkata",
      summary: "A two-session investor-awareness seminar held with the BSE Investors’ Protection Fund and the SEBI Eastern Regional Office: the securities market from the regulator’s vantage point, then from the investor’s.",
      details: [],
      eligibility: "",
      register: null,
      attachments: [],
      recap: "Session I covered the regulatory perimeter, the disclosure-based regime, current fraud typologies and grievance redress through SCORES and Online Dispute Resolution. Session II covered market structure, the main categories of investment risk, mutual funds and the mechanics of opening a Demat account. Participants left with a checklist for verifying any intermediary before transacting.",
      photos: [],
      publish: true
    },
    {
      id: "budget-debate-2026",
      title: "Union Budget 2026 Debate",
      kind: "Debate",
      date: "2026-02-09",
      endDate: "",
      venue: "E301, 3rd Floor, E Block, Amity University Kolkata",
      summary: "A parliamentary-style debate on the Union Budget 2026 announcements, open to B.Com students across all three years.",
      details: [],
      eligibility: "",
      register: null,
      attachments: [],
      recap: "Teams argued for and against motions on whether the Budget’s changes were sufficient, whether they benefit India as a whole, and whether its sectoral allocations were well divided, with structured openings, rebuttals, cross-questioning and closing arguments.",
      photos: [],
      publish: true
    },
    {
      id: "market-verdict",
      title: "Market Verdict",
      kind: "Debate",
      date: "",
      endDate: "",
      venue: "E301, 3rd Floor, E Block, Amity University Kolkata",
      summary: "A parliamentary-style debate on contemporary financial issues for B.Com and M.Com students.",
      details: [],
      eligibility: "",
      register: null,
      attachments: [],
      recap: "Six teams debated motions including a digital-only currency for India, the stock market as a wealth-creation tool for the middle class, and the future of ESG investing in Indian capital markets.",
      photos: [],
      publish: true
    },
    {
      id: "finquiz",
      title: "FinQuiz",
      kind: "Quiz",
      date: "",
      endDate: "",
      venue: "",
      summary: "A team quiz across four rounds: finance and the economy; accounting, taxation and corporate law; markets, banking and investments; and a rapid-fire buzzer round.",
      details: [],
      eligibility: "",
      register: null,
      attachments: [],
      recap: "Seven teams from all three years of B.Com competed, with the buzzer rounds and audience pop-questions drawing the strongest engagement.",
      photos: [],
      publish: true
    }
  ],

  /* ---------------------------------------------------------------
     RESEARCH — member notes and models. Put files in assets/research/.
     Template:
     {
       title: "Title of the note",
       authors: ["Full Name", "Full Name"],
       date: "2026-11-20",
       takeaway: "One line: the single most important conclusion.",
       file: "assets/research/title-of-note.pdf",   // .pdf or .xlsx
       type: "Note"                                  // Note, Model, Sector report...
     },
  --------------------------------------------------------------- */
  research: []
};
