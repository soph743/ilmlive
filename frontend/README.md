# ilmlive — frontend
 
The website people see: sign in / create account, **Home**, **Discover**, **Account**, and the **Live room** (blank video block + chat + private notes). Built with plain **React + JavaScript** (no Figma, no TypeScript).
 
Right now it runs entirely in the browser with demo data, so you can click through everything immediately. When your backend is ready you only replace the files in `src/services/` (see "Connecting a real backend").
 
---
 
## 1. Run it
 
You need [Node.js](https://nodejs.org) (version 20 or newer). Then, in this folder:
 
```bash
npm install     # downloads the libraries (once)
npm run dev     # starts the site, usually at http://localhost:5173
npm test        # runs the automated tests
```
 
Open the address `npm run dev` prints. Sign up with a referral code: **`1STTEACHERS`** or **`CREATOR`**.
 
> Open it from `http://localhost…`, not by double-clicking `index.html`. Password hashing only works on localhost or https.
 
---
 
## 2. What each folder is for
 
```
frontend/
├── index.html            The one HTML page. React fills in <div id="root">.
├── package.json          Libraries + the npm commands above.
├── vite.config.js        Build tool settings (Vite).
├── .gitignore            Tells git which files NOT to upload (see section 4).
├── public/               Files served as-is (favicon).
└── src/
    ├── main.jsx          Starts React.
    ├── App.jsx           Decides which page to show for the current URL.
    ├── router.jsx        A tiny router (URLs look like /#/discover).
    ├── config.js         Topics list + referral codes.
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
    └── services/         ← THE ONLY PART TO REPLACE WHEN YOU HAVE A BACKEND
        ├── auth.js           accounts, sign in/out, profile, follows
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
 
## 4. Putting it on GitHub
 
Your repo (`soph743/ilmlive`) already has a `backend/` folder. Put this folder next to it, named `frontend/`:
 
```
ilmlive/
├── backend/     (your friend's Flask app)
└── frontend/    (this project)
```
 
Then, from the repo root:
 
```bash
git checkout -b frontend-ui          # work on a branch, not main
git add frontend
git commit -m "Add React frontend"
git push -u origin frontend-ui       # then open a Pull Request on GitHub
```
 
### What `.gitignore` does
`frontend/.gitignore` lists files git must **not** upload:
 
- `node_modules/` — thousands of library files; `npm install` recreates them.
- `dist/` — build output; `npm run build` recreates it.
- `.env`, `serviceAccount*.json`, `*-firebase-adminsdk-*.json` — **secrets** (Firebase admin keys etc.). Never commit these.
Check what git will upload with `git status` before committing. If a file is listed that shouldn't be, add its name to `.gitignore`.
 
If your repo root has no `.gitignore` yet, add one there for the Python side too:
 
```
__pycache__/
*.pyc
venv/
.venv/
.env
```
 
---
 
## 5. Connecting a real backend (Firebase or Flask)
 
The demo stores everything in the browser's `localStorage`. That is **not secure** and not shared between people, it's just so the site works today. The three files in `src/services/` list the functions the pages call. Rewrite each function body to call your backend and keep the names and return shapes, and no page needs to change:
 
- `auth.js` → Firebase Authentication (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, …) or your Flask `/api/login`.
- `streams.js` → `fetch('/api/streams')` (each stream needs: `id, slug, title, summary, category, categoryLabel, tags[], teacherId, hostName, startTime (ms), durationMinutes, viewerCount, featured`).
- `liveRoom.js` → Firestore or Flask for chat and notes.
To forward `/api/...` calls to Flask, uncomment the `proxy` line in `vite.config.js`.
 
**Referral codes** (`src/config.js`) are checked in the browser, so anyone can read them in the page source. For real invitation-only signups, check the code on the server.
 
---
 
## 6. Still to build
 
Real live video, the streamer view (the page a teacher uses to go live), the prayer-time countdown, and tests for the pages themselves. The recommender and schedule logic are already tested (`npm test`).
 