# Spotify Clone Using Html, Css and Javascript

![Spotify Clone Screenshot](https://via.placeholder.com/800x400?text=Spotify+Clone+Preview)  
*(Replace this with an actual screenshot of the project interface for better visualization.)*

## Overview

This is a front-end clone of Spotify, built using HTML, CSS, and JavaScript. It replicates key features of Spotify's web interface, including playlist browsing, song playback, a music player with controls (play/pause, next/previous, seek, volume), and a responsive design. The project fetches song data dynamically from a local server (assuming a backend setup for serving MP3 files and metadata) and handles audio playback using the browser's native Audio API.

The clone focuses on the user interface and basic functionality, making it a great learning project for web development concepts like DOM manipulation, event handling, asynchronous data fetching, and CSS styling for responsive layouts.

## Features

- **Playlist Browsing**: Displays music cards for different playlists (fetched from `songs/info.json`). Each card shows a cover image, title, and description.
- **Song List Rendering**: Loads songs from selected playlist folders and displays them in a list with song name, artist, and play icon.
- **Music Player Controls**:
  - Play/Pause toggle.
  - Next/Previous track navigation (with optional loop mode).
  - Seek bar for scrubbing through the track.
  - Volume control with mute/low/high icons.
  - Real-time time display (current time / total duration).
- **Dynamic Song Loading**: Fetches MP3 files and matching cover images from server directories.
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens using media queries. Includes a hamburger menu for mobile navigation.
- **UI Enhancements**: Hover effects, scrollable sections, custom scrollbars, and Spotify-like dark theme.
- **Footer and Navigation**: Includes links to legal/privacy pages, signup/login buttons, and a sticky header.

## Technologies Used

- **HTML5**: For structuring the UI (e.g., playlists, player controls, song lists).
- **CSS3**: For styling, including custom fonts (CircularSpText), flexbox layouts, media queries for responsiveness, and custom range inputs (seek/volume bars).
- **JavaScript (ES6+)**: For dynamic functionality, including:
  - Fetch API for loading songs, images, and metadata.
  - Audio API for playback.
  - Event listeners for user interactions (clicks, scrolls, time updates).
  - DOM manipulation for rendering lists and updating UI states.
- **Fonts**: Custom OpenType fonts loaded via `@font-face` (e.g., CircularSpText in various weights).
- **No External Libraries**: Pure vanilla JS and CSS – no frameworks like React or Bootstrap.

## Project Structure

```
spotify-clone/
├── index.html          # Main HTML file with the app structure
├── script.js           # JavaScript logic for music player and dynamic content
├── style.css           # Main CSS styles, including font faces and responsive design
├── utility.css         # Utility CSS classes (flex helpers, margins, etc.)
├── fonts/              # Directory for custom fonts (e.g., CircularSp-*.otf)
├── images/             # Directory for song cover images
├── playlist-covers/    # Directory for playlist cover images
├── songs/              # Directory for song folders (e.g., folder1/, folder2/) and info.json
│   ├── info.json       # JSON metadata for playlists (title, description, image)
│   ├── folder1/        # Example folder with MP3 songs
│   └── ...             # Additional folders
└── README.md           # This file
```

**Note**: Song files (MP3) and images are not included in this repo for copyright reasons. You'll need to add your own in the `songs/` and `images/` directories.

## Setup and Installation

1. **Clone the Repository**:
   ```
   git clone https://github.com/your-username/spotify-clone.git
   cd spotify-clone
   ```

2. **Prepare Assets**:
   - Place MP3 songs in subfolders under `songs/` (e.g., `songs/folder1/song1.mp3`).
   - Add corresponding cover images in `images/` (filenames should match song names for auto-matching).
   - Create `songs/info.json` with playlist metadata. Example:
     ```json
     [
       {
         "title": "Most Popular English Songs Ever ❤️🔥!!",
         "description": "By Prince Agrawal",
         "image": "playlist-covers/playlist-1.jpg"
       },
       // Add more objects for additional playlists
     ]
     ```
   - Ensure font files are in `fonts/`.

3. **Run a Local Server**:
   - The project fetches resources from `http://127.0.0.1:3000` (configurable in `script.js`).
   - Use a simple server like Node.js `http-server` or Python:
     ```
     # Using Python (cd to project root)
     python -m http.server 3000
     ```
     Or with Node.js:
     ```
     npm install -g http-server
     http-server -p 3000
     ```

4. **Open in Browser**:
   - Visit `http://127.0.0.1:3000/index.html`.
   - The app should load playlists and allow playback.

**Dependencies**: None – runs in modern browsers (Chrome, Firefox, etc.). No npm/yarn required.

## Usage

- **Browse Playlists**: Scroll through music cards in the main section. Hover/click a card to view songs.
- **Play a Playlist**: Click the play button on a card to load and autoplay the first song.
- **Song Controls**:
  - Click a song in the list to play it.
  - Use play/pause, next/prev buttons in the player bar.
  - Drag the seek bar to jump in the track.
  - Adjust volume with the slider (icons change based on level).
- **Mobile View**: Use the hamburger menu to access the library/song list.
- **Loop Mode**: Enable via code (set `this.loop = true;` in `script.js` for endless playback).

**Limitations**:
- No real backend integration (e.g., no user accounts, search, or streaming from Spotify API).
- Audio files must be local; no online streaming.
- Basic error handling – console logs for fetch failures.

## Screenshots

*(Add actual screenshots here for a real repo. Example placeholders:)*

- **Desktop View**:
  ![Desktop Screenshot](https://via.placeholder.com/800x400?text=Desktop+View)

- **Mobile View**:
  ![Mobile Screenshot](https://via.placeholder.com/400x800?text=Mobile+View)

- **Player in Action**:
  ![Player Screenshot](https://via.placeholder.com/800x200?text=Player+Bar)

## Contributing

Contributions are welcome! Feel free to fork the repo and submit pull requests for improvements like:
- Adding Spotify API integration for real songs.
- Enhancing accessibility (ARIA labels, keyboard navigation).
- Bug fixes for edge cases (e.g., no songs in folder).

Steps:
1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/new-feature`.
3. Commit changes: `git commit -m "Add new feature"`.
4. Push: `git push origin feature/new-feature`.
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

Built as a learning project. Inspired by Spotify's UI/UX. Not affiliated with Spotify. If you have questions, open an issue! 🎶
