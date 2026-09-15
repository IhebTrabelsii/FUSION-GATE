/* =========================================================
   FUSION
   Motion system: CUT → REVEAL → SETTLE → SCRUB
========================================================= */

const body = document.body;

const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const navLinks = document.querySelectorAll(".nav__link");
const revealElements = document.querySelectorAll(".reveal, .reveal-media");
const sections = document.querySelectorAll("section[id]");
const filters = document.querySelectorAll(".filter");
const projects = document.querySelectorAll(".project");

/* MOBILE MENU */
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

/* NAVBAR DENSITY ON SCROLL */
window.addEventListener(
  "scroll",
  () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 30);
  },
  { passive: true },
);

/* REVEALS */
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

/* ACTIVE NAVIGATION */
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = entry.target.id;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    });
  },
  {
    threshold: 0.35,
  },
);

sections.forEach((section) => {
  sectionObserver.observe(section);
});

/* WORK FILTER */
filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const category = filter.dataset.filter;

    filters.forEach((button) => {
      button.classList.remove("active");
    });

    filter.classList.add("active");

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

/* WORK SCRUB — cursor position drives the timeline marker */
projects.forEach((project) => {
  const media = project.querySelector(".project__media");
  const scrub = project.querySelector(".project__scrub span");

  if (!media || !scrub) return;

  let target = 8;
  let current = 8;
  let animationFrame = null;

  function animateScrub() {
    current += (target - current) * 0.12;

    scrub.style.width = `${current}%`;

    if (Math.abs(target - current) > 0.1) {
      animationFrame = requestAnimationFrame(animateScrub);
    } else {
      animationFrame = null;
    }
  }

  media.addEventListener("mousemove", (event) => {
    const rect = media.getBoundingClientRect();

    const progress = ((event.clientX - rect.left) / rect.width) * 100;

    target = Math.max(8, Math.min(progress, 100));

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(animateScrub);
    }
  });

  media.addEventListener("mouseleave", () => {
    target = 8;

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(animateScrub);
    }
  });
});

/* SHOWREEL SCRUB */
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

/* PLAY BUTTON FEEDBACK + VIDEO LINKS */
document.querySelectorAll(".play-button, .project__play").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const videoUrl = button.dataset.video;

    button.classList.add("played");

    setTimeout(() => {
      button.classList.remove("played");
    }, 500);

    if (videoUrl) {
      window.open(videoUrl, "_blank", "noopener,noreferrer");
    }
  });
});
/* SMOOTH ANCHOR SCROLL */
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

/* PAUSE HERO PLAYHEAD WHEN TAB IS HIDDEN */
document.addEventListener("visibilitychange", () => {
  body.classList.toggle("page-hidden", document.hidden);
});
