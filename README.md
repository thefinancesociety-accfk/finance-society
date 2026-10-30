# Finance Society website

The website of the Finance Society, Amity University Kolkata (Amity College of Commerce and Finance, Kolkata).
It is plain HTML, CSS and JavaScript. There is no framework and no build step.

## Updating the site: edit one file

All the content that changes (team, events, research, links, the join email) lives in **`js/content.js`**.
You should not need to touch any other file.

1. Open `js/content.js` in any text editor (VS Code, or GitHub's web editor: open the file and press the pencil icon).
2. Find the section you want: `team`, `events`, `research`, `socials` or `join`.
3. Each section has a **template in a comment** just above it. Copy the template, paste it inside the square brackets `[ ]`, and fill it in.
4. Keep the punctuation: every entry is wrapped in `{ }` and followed by a comma, and every text value is in "double quotes".
5. Save, then preview (see below) and check the page looks right.
6. Run the check: `node scripts/check-site.mjs`. Fix anything it reports as an error.
7. Commit and push. Cloudflare Pages republishes the site within a minute or two.

### Add a team member
Put a square photo (at least 400×400, `.webp` or `.jpg`) in `assets/img/team/`, then add:
```js
{ name: "Full Name", role: "President", photo: "assets/img/team/full-name.webp", linkedin: "" },
```
No photo yet? Use `photo: ""` and the card shows the person's initials.

### Add an event
```js
{
  id: "budget-debate-2027", title: "Union Budget Debate", kind: "Debate",
  date: "2027-02-10", endDate: "", venue: "E301, E Block",
  summary: "One or two sentences.", details: [], eligibility: "",
  register: { email: true, subject: "Registration: Union Budget Debate" },
  attachments: [], recap: "", photos: [], publish: true
},
```
- Events move from **Upcoming** to **Past** by themselves once their date has passed.
- Date not fixed yet? Use `date: ""` and add `upcoming: true`; the site shows "Date to be announced".
- The soonest upcoming event appears on the home page automatically.
- After the event, add a `recap` paragraph and `photos`:
  `photos: [{ src: "assets/img/events/budget-debate-1.webp", alt: "Teams debating in E301" }]`.
  Only publish photos where everyone shown has agreed to it.
- `publish: false` keeps an entry in the file without showing it on the site.

### Add research
Put the file in `assets/research/` (PDF or XLSX), then add:
```js
{ title: "Title", authors: ["Name One", "Name Two"], date: "2026-11-20",
  takeaway: "One line: the main conclusion.", file: "assets/research/title.pdf", type: "Note" },
```
The research page always shows: *Student research for educational purposes. Not investment advice.*

### Instagram / LinkedIn
Paste the full page address into `socials.instagram` or `socials.linkedin`. Empty links are hidden.

### Joining
`join.open: true` makes the Join buttons open a pre-filled email to the society (Gmail on computers,
the mail app on phones). To use a Google Form instead, paste its link into `join.formUrl`.
To show "Applications open soon", set `join.open: false`.

## Preview locally
From this folder:
```bash
python3 -m http.server 8080
```
Then open http://localhost:8080.

## Checks
```bash
node scripts/check-site.mjs
```
This checks that every internal link and every file named in `content.js` exists, that every image has alt
text, and that no page contains the society's former name. It warns (but does not fail) on `[TO ADD` placeholders.

## Things not to change
- `assets/brand/` holds the approved logo files. Do not edit or replace them without the committee's approval.
  If the master logo ever changes, regenerate the web versions with `python3 scripts/brand-assets.py <master.png>`.
- The site's name is **Finance Society**; in full, **Finance Society, Amity University Kolkata**.
- Do not state or imply affiliation with any bank, broker or company without written confirmation from the committee.
- Never commit passwords, API keys or tokens.

## Where things are
| Path | What it is |
| --- | --- |
| `js/content.js` | All editable content |
| `js/main.js` | Turns `content.js` into page sections (no content here) |
| `css/tokens.css` | Colours, fonts and spacing |
| `css/main.css` | Layout and components |
| `*/index.html` | One folder per page; header and footer are repeated in each |
| `assets/` | Logo, event files, research files, photos |
| `assets/img/` | Banner images (bull, guilloche, bell, ledger), each as `-960`/`-1920` WebP plus a `-960.jpg` fallback |

## Design and motion
- The look is black and champagne with cream "paper" sections, taken from the logo and the CA$H IQ collateral. All colours live in `css/tokens.css`.
- Motion: the market ticker, the headline reveals, the guilloche rosettes, the market line, the page transitions and the cursor glow all switch off for
  visitors who ask for reduced motion, and the ticker has a Pause button.
- The ticker shows brand phrases and the next real event from `content.js`. Never put prices or made-up figures in it.
- To swap a banner image, export it at 1920px wide, then save `name-1920.webp`, `name-960.webp` and `name-960.jpg` in `assets/img/`.

## Social banners
`scripts/social/linkedin-banner.html` is the source of the LinkedIn banner (1584×396). Edit the text there, then run
`node scripts/social/render.mjs`; the PNG is written to `social/linkedin-banner-1584x396.png`.

`scripts/social/cash-iq-logo.html` is the CA$H IQ circular logo (1024×1024, for group profile photos). The same command renders it to
`social/cash-iq-logo-1024.png` (transparent corners) and `social/cash-iq-logo-1024-square.png` (solid background).
