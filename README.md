# Meitei Calendar (ꯃꯩꯇꯩ ꯊꯥꯄꯥꯟꯂꯣꯟ) - PWA

A premium Progressive Web Application (PWA) displaying the traditional Meitei Lunar Calendar integrated alongside the Gregorian Calendar. Fully optimized for mobile platforms, specifically optimized for standalone iOS Safari and Android Chrome installations with complete offline support.

---

## 🌟 Features

- **Dual Calendar Systems**: Easily toggle and view Gregorian dates alongside traditional Meitei lunar months, days (Yumshak), and phases.
- **Offline Capable**: Once visited, the entire calendar database (caching years, months, and event configs) works completely offline.
- **Standalone PWA Mode**: Installs directly onto iOS and Android home screens with high-resolution iconography and theme integrations.
- **Interactive Events & Observances**: Interactive view for holidays, lunar festivals, and Meitei calendar-specific dates.
- **Interactive Search**: Search calendar days, festivals, and observances instantly.

---

## 🛠️ Local Development

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in Development mode**:
   ```bash
   npm run dev
   ```
   *The local server will spin up, usually at `http://localhost:3000`.*

3. **Build the production bundle**:
   ```bash
   npm run build
   ```
   *Outputs optimized production-ready PWA assets to the `dist/` directory.*

4. **Preview production build locally**:
   ```bash
   npm run preview
   ```

---

## 🚀 Deployment to GitHub Pages

Since the PWA has been updated with relative path resolutions, it can be hosted seamlessly as a repository subdirectory on GitHub Pages (e.g. `https://<username>.github.io/<repository-name>/`).

### Step-by-Step Guide:

#### 1. Initialize Git & Commit Code
In your project directory, run the following commands:
```bash
# Initialize git repository
git init

# Add all files to staging (excludes node_modules and builds automatically via .gitignore)
git add .

# Create the initial commit
git commit -m "feat: configure PWA path portability and iOS PNG touch icons"
```

#### 2. Create the GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Set your repository name (e.g. `manipuri-calendar-pwa`).
3. Leave it public, and **do not** check "Add a README" or ".gitignore" since you already have them locally.
4. Click **Create repository**.
5. Copy the remote URL commands provided under **"...or push an existing repository from the command line"**:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

#### 3. Automatic Deployment with the `gh-pages` Package
To make publishing to GitHub Pages automated, we recommend using the `gh-pages` NPM package:

1. **Install `gh-pages` as a development dependency**:
   ```bash
   npm install gh-pages --save-dev
   ```

2. **Add scripts to your `package.json`**:
   Open [package.json](package.json) and add the following two scripts under the `"scripts"` object:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. **Deploy the app**:
   Run the deployment command:
   ```bash
   npm run deploy
   ```
   *This automatically builds the production version and pushes the `dist` contents to a clean `gh-pages` branch in your GitHub repository.*

4. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** -> **Pages** (on the left menu).
   - Under **Build and deployment** -> **Branch**, select `gh-pages` and `/ (root)`.
   - Click **Save**. Your site will be live at `https://<username>.github.io/<repository-name>/` in a few minutes!

---

## 📲 Installing the Calendar App

### On iOS (Safari)
Apple does not support web-install buttons directly inside Safari. To install:
1. Open **Safari** on your iOS device and navigate to your deployed URL.
2. Tap the **Share** button (up-arrow box icon) at the bottom toolbar.
3. Scroll down and select **Add to Home Screen**.
4. Tap **Add** in the top right.

### On Android (Chrome)
1. Open **Chrome** on Android and navigate to your deployed URL.
2. Tap the **three-dot menu** in the top right.
3. Select **Install app** (or **Add to Home Screen**).
