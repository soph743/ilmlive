# ilmlive — frontend
 
The website people see: sign in / create account, **Home**, **Discover**, **Account**, and the **Live room** (blank video block + chat + private notes). Built with plain **React + JavaScript** (no Figma, no TypeScript).
 
Accounts (sign up, sign in, name, email, password) go through the Flask backend to Firebase Authentication. Teachers, circles, chat and notes are still demo data in the browser (see "Connecting the rest to the backend").
 
---
 
## 1. Run it
 
You need [Node.js](https://nodejs.org) (version 20 or newer), and the Flask backend running (see the root README; Vite forwards `/api/...` to it on port 5001). Then, in this folder:
 
```bash
npm install     # downloads the libraries (once)
npm run dev     # starts the site, usually at http://localhost:5173
npm test        # runs the automated tests
```
 
Open the address `npm run dev` prints. Learners can sign up any time. Teachers (streamers) also need an invite code the first time they create their account; the codes are set in `STREAMER_INVITE_CODES` in `backend/.env`. Signing in never needs a code. Passwords must be at least 8 characters.
 
---
 
## 2. What each folder is for
 
```
frontend/
├── index.html            The one HTML page. React fills in <div id="root">.
├── package.json          Libraries + the npm commands above.
├── vite.config.js        Build tool settings (Vite).
├── .gitignore            Tells git which files NOT to upload (node_modules, dist, secrets).
├── public/               Files served as-is (favicon).
└── src/
    ├── main.jsx          Starts React.
    ├── App.jsx           Decides which page to show for the current URL.
    ├── router.jsx        A tiny router (URLs look like /#/discover).
    ├── config.js         Topics list + password length.
    ├── styles.css        ALL the styling. Colours/fonts are variables at the top.
    │
    ├── pages/            One file per screen
    │   ├── AuthPage.jsx      sign in + create account
    │   ├── HomePage.jsx      followed teachers' videos + recommended
    │   ├── DiscoverPage.jsx  live now / starting within 30 min / within the hour
    │   ├── AccountPage.jsx   name, email, password, interests, preferences, follows
    │   └── LivePage.jsx      video block + chat + notes
    │
    ├── components/       Reusable pieces (video card, follow button, sidebar, icons…)
    ├── hooks/            useAuth (who is signed in), useNow (live clock)
    │
    ├── lib/              Pure logic, no React. This is what the tests cover.
    │   ├── schedule.js       live / soon / hour / later / past from the clock
    │   ├── recommend.js      the recommendation algorithm
    │   ├── feed.js           builds the Home and Discover lists
    │   └── *.test.js         automated tests
    │
    └── services/         Talking to data
        ├── api.js            fetch helper for the Flask API
        ├── auth.js           accounts via Flask/Firebase; profile extras + follows in localStorage
        ├── streams.js        teachers + circles (demo data)
        └── liveRoom.js       chat messages + notes
```
 
**Rule of thumb:** `pages/` and `components/` are what you see, `lib/` is thinking, `services/` is talking to data.
 
---
 
## 3. How the features work
 
| Feature | Where | How |
|---|---|---|
| Home: followed teachers | `lib/feed.js` | Streams whose teacher you follow; live first, then upcoming, then recordings. |
| Home: recommended | `lib/recommend.js` | Points for a matching **interest topic** (account page), a tag mentioned in your **learning goals**, a followed teacher, featured, live/soon. Each card shows *why* it was picked. |
| Discover | `lib/schedule.js` | A circle's state comes from the clock: live, starts within 30 min, within 30–60 min. It updates by itself every 15 s. |
| Video thumbnails | `components/StreamCard.jsx` | Blank blocks on purpose; put an `<img>` inside `.card__thumb` later. |
| Live video | `pages/LivePage.jsx` | Blank block (`.room__video`). Drop your video player in there (LiveKit, Agora, Daily, or a YouTube embed). |
| Chat | `services/liveRoom.js` | Public + "ask privately". Private messages are only shown to their sender. |
| Notes | `services/liveRoom.js` | Saved per person per circle. |
| Account edits | `pages/AccountPage.jsx` | Email and password changes ask for your current password first. |
 
The demo circles are timed relative to when you load the page, so there are always some live and some starting soon. Reloading resets that clock.
 
---
 
## 4. Connecting the rest to the backend
 
`services/auth.js` already talks to Flask (`/api/auth/...`), which stores accounts in Firebase. The rest is still in the browser's `localStorage`, which is **not** secure and not shared between people. Rewrite each function body to call the backend and keep the names and return shapes, and no page needs to change:
 
- `auth.js` → profile extras (bio, location, learning goals, interests, preferences) and follows are still in `localStorage`, keyed by Firebase uid. Move them to a database (e.g. Firestore).
- `streams.js` → `fetch('/api/streams')` (each stream needs: `id, slug, title, summary, category, categoryLabel, tags[], teacherId, hostName, startTime (ms), durationMinutes, viewerCount, featured`).
- `liveRoom.js` → Firestore or Flask for chat and notes.
 
Use `api()` from `services/api.js` for requests; it throws errors whose messages are safe to show.
 
---
 
## 5. Still to build
 
Real live video, the streamer view (the page a teacher uses to go live), the prayer-time countdown, and tests for the pages themselves. The recommender and schedule logic are already tested (`npm test`).
 