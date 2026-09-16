/* =========================================================
   FUSION
   Motion system: CUT → REVEAL → SETTLE → SCRUB
========================================================= */

const body = document.body;

console.log("Supabase URL:", window.SUPABASE_URL);
console.log("Supabase key loaded:", !!window.SUPABASE_ANON_KEY);
console.log("Supabase library loaded:", !!window.supabase);

const supabaseClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY,
);

/* =========================================================
   METRICS
========================================================= */

async function loadMetrics() {
  const { data, error } = await supabaseClient
    .from("metrics")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Metrics error:", error);
    return;
  }

  console.log("Metrics loaded:", data);

  document.querySelector("#metric-videos").textContent = data.videos_edited;
  document.querySelector("#metric-views").textContent = data.combined_views;
  document.querySelector("#metric-experience").textContent =
    data.years_experience;
  document.querySelector("#metric-clients").textContent =
    data.recurring_clients;
}

loadMetrics();

/* =========================================================
   CATEGORIES
========================================================= */

async function renderCategories() {
  const { data, error } = await supabaseClient
    .from("categories")
    .select("name, slug")
    .order("id", { ascending: true });

  if (error) {
    console.error("Categories render error:", error);
    return;
  }

  const filterContainer = document.querySelector("#work-filter");

  if (!filterContainer) return;

  filterContainer.innerHTML = `
    <button class="filter active" data-filter="all">All</button>
  `;

  data.forEach((category) => {
    const button = document.createElement("button");

    button.className = "filter";
    button.dataset.filter = category.slug;
    button.textContent = category.name;

    filterContainer.appendChild(button);
  });

  const filters = filterContainer.querySelectorAll(".filter");

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.filter;

      filters.forEach((button) => {
        button.classList.remove("active");
      });

      filter.classList.add("active");

      const projects = document.querySelectorAll(".project");

      projects.forEach((project) => {
        const shouldShow =
          category === "all" || project.dataset.category === category;

        if (shouldShow) {
          project.classList.remove("hidden");

          requestAnimationFrame(() => {
            project.style.opacity = "1";
            project.style.transform = "translateY(0) scale(1)";
          });
        } else {
          project.style.opacity = "0";
          project.style.transform = "translateY(10px) scale(.99)";

          setTimeout(() => {
            project.classList.add("hidden");
          }, 250);
        }
      });
    });
  });

  console.log("Categories rendered:", data);
}

renderCategories();

/* =========================================================
   YOUTUBE
========================================================= */

function getYouTubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }

    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/shorts/")[1];
    }

    return parsed.searchParams.get("v");
  } catch {
    return "";
  }
}

/* =========================================================
   VIDEOS
========================================================= */

async function renderVideos() {
  const { data, error } = await supabaseClient
    .from("videos")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Videos render error:", error);
    return;
  }

  const workGrid = document.querySelector("#work-grid");

  if (!workGrid) return;

  workGrid.innerHTML = "";

  data.forEach((video) => {
    const videoId = getYouTubeId(video.youtube_url);

    const project = document.createElement("article");

    project.className = "project reveal-media";
    project.dataset.category = video.category;

    const media = document.createElement("div");
    media.className = "project__media";

    const img = document.createElement("img");
    img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    img.alt = `${video.title} project thumbnail`;
    img.className = "project__thumbnail";
    img.loading = "lazy";

    const playButton = document.createElement("button");
    playButton.className = "project__play";
    playButton.setAttribute("aria-label", `Play ${video.title} project`);
    playButton.dataset.video = video.youtube_url;
    playButton.textContent = "▶";

    media.appendChild(img);
    media.appendChild(playButton);

    const title = document.createElement("h3");
    title.className = "project__title";
    title.textContent = video.title;

    project.appendChild(media);
    project.appendChild(title);
    workGrid.appendChild(project);
  });

  console.log("Videos rendered:", data);
}

/* =========================================================
   DOM ELEMENTS
========================================================= */

const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const navLinks = document.querySelectorAll(".nav__link");
const revealElements = document.querySelectorAll(".reveal, .reveal-media");
const sections = document.querySelectorAll("section[id]");

/* =========================================================
   MOBILE MENU
========================================================= */

function closeMenu() {
  menuToggle?.classList.remove("active");
  mobileNav?.classList.remove("active");
  menuToggle?.setAttribute("aria-expanded", "false");
  body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.classList.toggle("active");

  mobileNav?.classList.toggle("active", isOpen);
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  body.classList.toggle("menu-open", isOpen);
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

/* =========================================================
   NAVBAR DENSITY ON SCROLL
========================================================= */

window.addEventListener(
  "scroll",
  () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 30);
  },
  { passive: true },
);

/* =========================================================
   REVEALS
========================================================= */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const element = entry.target;

      const siblings = element.parentElement
        ? [...element.parentElement.children]
        : [];

      const index = siblings.indexOf(element);
      const delay = Math.min(index * 45, 180);

      element.style.transitionDelay = `${delay}ms`;
      element.classList.add("is-visible");

      revealObserver.unobserve(element);
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px",
  },
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function updateActiveNav() {
  const scrollPosition = window.scrollY + 120;

  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionBottom
    ) {
      currentSection = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${currentSection}`,
    );
  });
}

window.addEventListener("scroll", updateActiveNav, {
  passive: true,
});

window.addEventListener("load", updateActiveNav);
/* =========================================================
   SHOWREEL SCRUB
========================================================= */

const showreel = document.querySelector(".showreel__frame");
const showreelProgress = document.querySelector(".showreel .scrub__progress");

if (showreel && showreelProgress) {
  showreel.addEventListener("mousemove", (event) => {
    const rect = showreel.getBoundingClientRect();

    const progress = ((event.clientX - rect.left) / rect.width) * 100;

    const value = Math.max(0, Math.min(progress, 100));

    showreelProgress.style.width = `${Math.max(8, value)}%`;
  });
}

/* =========================================================
   PLAY BUTTON FEEDBACK + VIDEO LINKS
========================================================= */

document.addEventListener("click", (event) => {
  const button = event.target.closest(".project__play, .play-button");

  if (!button) return;

  event.preventDefault();

  const videoUrl = button.dataset.video;

  if (!videoUrl) return;

  button.classList.add("played");

  setTimeout(() => {
    button.classList.remove("played");
  }, 500);

  window.open(videoUrl, "_blank", "noopener,noreferrer");
});

/* =========================================================
   SMOOTH ANCHOR SCROLL
========================================================= */

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
});

/* =========================================================
   PAUSE HERO PLAYHEAD WHEN TAB IS HIDDEN
========================================================= */

document.addEventListener("visibilitychange", () => {
  body.classList.toggle("page-hidden", document.hidden);
});

/* =========================================================
   INITIALIZE DYNAMIC WORK CONTENT
========================================================= */

(async () => {
  await renderVideos();

  document.querySelectorAll(".project.reveal-media").forEach((project) => {
    revealObserver.observe(project);
  });
})();
