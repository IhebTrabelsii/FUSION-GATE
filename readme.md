# FUSION Portfolio

FUSION is a responsive portfolio website for a video editor and graphic designer. It presents selected video work, editing services, skills, client testimonials, professional results, and contact links in a dark, motion-focused visual style.

The project also includes a private admin dashboard for managing the content shown in the public Work and Results sections.

## Features

### Public portfolio

- Responsive single-page layout for desktop and mobile screens
- Fixed navigation with smooth anchor scrolling
- Mobile navigation menu
- Hero section for the FUSION brand and creative roles
- Dynamic Work section loaded from Supabase
- Video categories and client-side category filtering
- YouTube thumbnail generation from supported video URLs
- Links that open each project directly on YouTube
- Scroll-triggered reveal animations using `IntersectionObserver`
- Active navigation state based on the visible section
- About, skills, software, services, process, editing styles, and differentiators sections
- Client testimonial cards with local images
- Editable performance metrics such as videos edited, views, experience, and clients
- Contact links for email, X/Twitter, YouTube, YTJobs, and Discord
- Keyboard focus styles and accessible labels for interactive controls

### Admin dashboard

The admin dashboard is available at `FUSION/admin.html` and includes:

- Supabase email/password authentication
- Session-aware login and logout
- Add, edit, and delete portfolio videos
- Add and delete video categories
- Edit the public metrics displayed on the portfolio
- Automatic YouTube ID extraction for standard YouTube, Shorts, embed, and `youtu.be` URLs
- Video ordering through the `sort_order` field
- Input escaping before database content is inserted into admin markup

## Technologies Used

- HTML5 for the page structure
- CSS3 for layout, responsive design, custom properties, transitions, clipping shapes, and animations
- Vanilla JavaScript for all browser interactions and dynamic rendering
- Supabase JavaScript client v2 for authentication and database access
- Supabase Postgres tables for videos, categories, and metrics
- YouTube thumbnail images from `img.youtube.com`
- Google Fonts:
	- DM Sans for body text
	- Space Grotesk for headings and interface elements
	- JetBrains Mono for monospace UI text
- Local font assets:
	- `MotionControl-Bold.otf`
	- `Cybergame-Regular Italic.ttf`

No npm package installation or build step is required. The site is made to run as a static frontend.

## Project Structure

```text
FUSION-Portfolio/
|-- index.html              Public portfolio page
|-- style.css               Public portfolio styles
|-- script.js               Public interactions and Supabase rendering
|-- config.js               Supabase URL and publishable key
|-- readme.md               Project documentation
|-- assets/
|   |-- Logo.png             Brand logo asset
|   |-- MotionControl-Bold.otf
|   |-- Cybergame-Regular Italic.ttf
|   `-- testimonials/        Client testimonial images
`-- FUSION/
		|-- admin.html           Admin login and dashboard markup
		|-- admin.css            Admin dashboard styles
		|-- admin.js             Authentication and content management logic
		|-- config.js            Supabase URL and publishable key
		`-- schema.sql           Reserved for database schema setup
```

## Supabase Data Model

The frontend expects these tables and columns to exist in Supabase.

### `videos`

| Column | Purpose |
| --- | --- |
| `id` | Unique video identifier |
| `title` | Project title shown in the Work section |
| `category` | Category slug used by the filter |
| `youtube_url` | Original YouTube project URL |
| `sort_order` | Display order in the portfolio |
| `created_at` | Creation timestamp used as a secondary sort field |

### `categories`

| Column | Purpose |
| --- | --- |
| `id` | Unique category identifier |
| `name` | Category label shown to visitors and admins |
| `slug` | URL-safe value stored on videos and used for filtering |

### `metrics`

The public page reads the row where `id = 1`.

| Column | Purpose |
| --- | --- |
| `id` | Metrics row identifier, expected to be `1` |
| `videos_edited` | Videos edited label, for example `1K+` |
| `combined_views` | Combined views label, for example `75M` |
| `years_experience` | Experience label, for example `4+` |
| `recurring_clients` | Client count label, for example `20+` |
| `updated_at` | Last update timestamp |

The current `FUSION/schema.sql` file is empty, so the database tables, policies, and initial data must be created in Supabase before the dynamic sections can load successfully.

## Configuration

Both `config.js` files expose these browser globals:

```js
window.SUPABASE_URL = "your-project-url";
window.SUPABASE_ANON_KEY = "your-publishable-key";
```

The public/publishable Supabase key is intended for browser use, but database access must still be protected with Supabase Row Level Security policies. Never place a Supabase service-role key or other private secret in either config file.

For a cleaner deployment, use environment-specific configuration or a hosting platform's public environment variables rather than committing project credentials directly to the repository.

## Running Locally

Because the project uses browser scripts and remote Supabase resources, serve it through a local HTTP server instead of opening `index.html` directly.

For example, with Python installed:

```bash
python -m http.server 8000
```

Then open:

- Public portfolio: `http://localhost:8000/`
- Admin dashboard: `http://localhost:8000/FUSION/admin.html`

You can also use VS Code Live Server or any other static hosting server.

## Adding Portfolio Content

1. Open `FUSION/admin.html` in the browser.
2. Sign in with a Supabase email/password account.
3. Create categories such as Gaming, Shorts, Documentary, or YouTube.
4. Add a project title, category, and YouTube URL.
5. Edit the metrics when your portfolio statistics change.

The public page automatically loads the updated records from Supabase on refresh.

## Deployment Notes

- Deploy the whole folder as a static site so the relative asset paths remain valid.
- Confirm that Supabase URL and publishable-key configuration is available in production.
- Configure Supabase authentication and Row Level Security before making the admin dashboard public.
- Test YouTube thumbnail availability for every project URL.
- The current asset listing contains `assets/Logo.png`, while the HTML references `assets/logo.png`. This works on case-insensitive local filesystems but should be corrected before deployment to a case-sensitive host by renaming the file or updating the HTML references.
- `schema.sql` should be populated with the production schema and policies if database setup needs to be reproducible.

## Contact

- Email: fusion.nem@gmail.com
- X/Twitter: [@Nem_Fusion](https://x.com/Nem_Fusion)
- YouTube: [Fusion_nem](https://www.youtube.com/@Fusion_nem)
- YTJobs: [FUSION profile](https://ytjobs.co/talent/profile/247488?r=490&t=tnp&utm_campaign=share-new-profile&utm_ref=talent)
- Discord: `og_walker`
