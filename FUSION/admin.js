/* =========================================
   FUSION ADMIN
   Supabase + Admin Dashboard
========================================= */

const supabaseClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);


/* =========================================
   ELEMENTS
========================================= */

const loginScreen = document.getElementById("login-screen");
const dashboardScreen = document.getElementById("dashboard-screen");

const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");

const logoutButton = document.getElementById("logout-button");

const addVideoButton = document.getElementById("add-video-button");

const videoFormCard = document.getElementById("video-form-card");
const videoForm = document.getElementById("video-form");

const videoFormEyebrow = document.getElementById("video-form-eyebrow");
const videoFormTitle = document.getElementById("video-form-title");

const videoId = document.getElementById("video-id");
const videoTitle = document.getElementById("video-title");
const videoCategory = document.getElementById("video-category");
const videoUrl = document.getElementById("video-url");

const cancelVideoButton = document.getElementById(
  "cancel-video-button"
);

const cancelVideoButtonBottom = document.getElementById(
  "cancel-video-button-bottom"
);

const saveVideoButton = document.getElementById(
  "save-video-button"
);

const videoMessage = document.getElementById(
  "video-message"
);

const videosList = document.getElementById(
  "videos-list"
);

const videoCount = document.getElementById(
  "video-count"
);

const metricsForm = document.getElementById(
  "metrics-form"
);

const metricsVideos = document.getElementById(
  "metrics-videos"
);

const metricsViews = document.getElementById(
  "metrics-views"
);

const metricsExperience = document.getElementById(
  "metrics-experience"
);

const metricsClients = document.getElementById(
  "metrics-clients"
);

const saveMetricsButton = document.getElementById(
  "save-metrics-button"
);

const metricsMessage = document.getElementById(
  "metrics-message"
);

const categoryForm = document.getElementById(
  "category-form"
);

const categoryName = document.getElementById(
  "category-name"
);

const addCategoryButton = document.getElementById(
  "add-category-button"
);

const categoryMessage = document.getElementById(
  "category-message"
);

const categoriesList = document.getElementById(
  "categories-list"
);

/* =========================================
   INITIALIZATION
========================================= */

init();


async function init() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) {
    showDashboard();
    await loadDashboard();
  } else {
    showLogin();
  }
}


/* =========================================
   AUTHENTICATION
========================================= */

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearMessage(loginMessage);

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
    showMessage(
      loginMessage,
      "Please enter your email and password.",
      "error"
    );

    return;
  }

  setButtonLoading(
    loginButton,
    true,
    "Logging in..."
  );

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  setButtonLoading(
    loginButton,
    false,
    "Login"
  );

  if (error) {
    showMessage(
      loginMessage,
      error.message,
      "error"
    );

    return;
  }

  loginForm.reset();

  showDashboard();

  await loadDashboard();
});


logoutButton.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return;
  }

  showLogin();
});


/* =========================================
   AUTH STATE
========================================= */

supabaseClient.auth.onAuthStateChange(
  (event, session) => {
    if (session) {
      showDashboard();
    } else {
      showLogin();
    }
  }
);


function showLogin() {
  loginScreen.classList.remove("hidden");
  dashboardScreen.classList.add("hidden");
}


function showDashboard() {
  loginScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
}


/* =========================================
   DASHBOARD LOADING
========================================= */

async function loadDashboard() {
  await loadCategories();

  await Promise.all([
    loadVideos(),
    loadMetrics()
  ]);
}


/* =========================================
   VIDEO MANAGEMENT
========================================= */

addVideoButton.addEventListener("click", () => {
  openVideoForm();
});


cancelVideoButton.addEventListener("click", () => {
  closeVideoForm();
});


cancelVideoButtonBottom.addEventListener("click", () => {
  closeVideoForm();
});


videoForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearMessage(videoMessage);

  const id = videoId.value.trim();
  const title = videoTitle.value.trim();
  const category = videoCategory.value;
  const youtubeUrl = videoUrl.value.trim();

  if (!title || !category || !youtubeUrl) {
    showMessage(
      videoMessage,
      "Please complete all fields.",
      "error"
    );

    return;
  }

  const youtubeId = extractYouTubeId(youtubeUrl);

  if (!youtubeId) {
    showMessage(
      videoMessage,
      "Please enter a valid YouTube URL.",
      "error"
    );

    return;
  }

  setButtonLoading(
    saveVideoButton,
    true,
    id ? "Updating..." : "Saving..."
  );

  let error = null;

  if (id) {
    const result = await supabaseClient
      .from("videos")
      .update({
        title,
        category,
        youtube_url: youtubeUrl
      })
      .eq("id", id);

    error = result.error;
  } else {
    const result = await supabaseClient
      .from("videos")
      .insert({
        title,
        category,
        youtube_url: youtubeUrl,
        sort_order: await getNextSortOrder()
      });

    error = result.error;
  }

  setButtonLoading(
    saveVideoButton,
    false,
    "Save video"
  );

  if (error) {
    console.error("Video save error:", error);

    showMessage(
      videoMessage,
      error.message,
      "error"
    );

    return;
  }

  showMessage(
    videoMessage,
    id
      ? "Video updated successfully."
      : "Video added successfully.",
    "success"
  );

  await loadVideos();

  setTimeout(() => {
    closeVideoForm();
  }, 600);
});


async function loadVideos() {
  videosList.innerHTML = `
    <div class="loading">
      Loading videos...
    </div>
  `;

  const {
    data,
    error
  } = await supabaseClient
    .from("videos")
    .select("*")
    .order("sort_order", {
      ascending: true
    })
    .order("created_at", {
      ascending: true
    });

  if (error) {
    console.error("Load videos error:", error);

    videosList.innerHTML = `
      <div class="empty-state">
        <strong>Could not load videos</strong>
        <span>${escapeHtml(error.message)}</span>
      </div>
    `;

    videoCount.textContent = "0";

    return;
  }

  videoCount.textContent = data.length;

  if (data.length === 0) {
    videosList.innerHTML = `
      <div class="empty-state">
        <strong>No videos yet</strong>
        <span>Add your first video above.</span>
      </div>
    `;

    return;
  }

  videosList.innerHTML = data
    .map((video) => createVideoHTML(video))
    .join("");

  attachVideoActions();
}


function createVideoHTML(video) {
  const youtubeId = extractYouTubeId(
    video.youtube_url
  );

  const thumbnail = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : "";

  return `
    <article class="video-item">

      <img
        class="video-thumbnail"
        src="${thumbnail}"
        alt=""
        loading="lazy"
      />

      <div class="video-info">

        <div class="video-title">
          ${escapeHtml(video.title)}
        </div>

        <span class="video-category">
          ${escapeHtml(video.category)}
        </span>

      </div>

      <div class="video-actions">

        <button
          type="button"
          class="video-action"
          data-action="edit"
          data-id="${video.id}"
        >
          Edit
        </button>

        <button
          type="button"
          class="video-action video-action--delete"
          data-action="delete"
          data-id="${video.id}"
        >
          Delete
        </button>

      </div>

    </article>
  `;
}


function attachVideoActions() {
  document
    .querySelectorAll(".video-action")
    .forEach((button) => {

      button.addEventListener("click", async () => {

        const action = button.dataset.action;
        const id = button.dataset.id;

        if (action === "edit") {
          await editVideo(id);
        }

        if (action === "delete") {
          await deleteVideo(id);
        }

      });

    });
}


async function editVideo(id) {
  const {
    data,
    error
  } = await supabaseClient
    .from("videos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Load video error:", error);

    alert(
      "Could not load this video."
    );

    return;
  }

  videoId.value = data.id;
  videoTitle.value = data.title;
  videoCategory.value = data.category;
  videoUrl.value = data.youtube_url;

  videoFormEyebrow.textContent =
    "EDIT PROJECT";

  videoFormTitle.textContent =
    "Edit video";

  saveVideoButton.textContent =
    "Update video";

  videoFormCard.classList.remove("hidden");

  videoFormCard.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


async function deleteVideo(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this video?"
  );

  if (!confirmed) {
    return;
  }

  const {
    error
  } = await supabaseClient
    .from("videos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete video error:", error);

    alert(
      `Could not delete video: ${error.message}`
    );

    return;
  }

  await loadVideos();
}


async function getNextSortOrder() {
  const {
    data,
    error
  } = await supabaseClient
    .from("videos")
    .select("sort_order")
    .order("sort_order", {
      ascending: false
    })
    .limit(1);

  if (error || !data || data.length === 0) {
    return 1;
  }

  return Number(data[0].sort_order) + 1;
}


/* =========================================
   VIDEO FORM
========================================= */

function openVideoForm() {
  videoForm.reset();

  videoId.value = "";

  videoFormEyebrow.textContent =
    "NEW PROJECT";

  videoFormTitle.textContent =
    "Add video";

  saveVideoButton.textContent =
    "Save video";

  clearMessage(videoMessage);

  videoFormCard.classList.remove("hidden");

  videoTitle.focus();
}


function closeVideoForm() {
  videoForm.reset();

  videoId.value = "";

  videoFormEyebrow.textContent =
    "NEW PROJECT";

  videoFormTitle.textContent =
    "Add video";

  saveVideoButton.textContent =
    "Save video";

  clearMessage(videoMessage);

  videoFormCard.classList.add("hidden");
}

/* =========================================
   CATEGORY MANAGEMENT
========================================= */

async function loadCategories() {
  categoriesList.innerHTML = `
    <div class="loading">
      Loading categories...
    </div>
  `;

  const {
    data,
    error
  } = await supabaseClient
    .from("categories")
    .select("*")
    .order("name", {
      ascending: true
    });

  if (error) {
    console.error(
      "Load categories error:",
      error
    );

    categoriesList.innerHTML = `
      <div class="empty-state">
        <strong>Could not load categories</strong>
        <span>${escapeHtml(error.message)}</span>
      </div>
    `;

    return;
  }

  renderCategoryOptions(data);
  renderCategories(data);
}


function renderCategoryOptions(categories) {
  videoCategory.innerHTML = `
    <option value="">
      Select category
    </option>
  `;

  categories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category.slug;
    option.textContent = category.name;

    videoCategory.appendChild(option);
  });
}


function renderCategories(categories) {
  if (!categories || categories.length === 0) {
    categoriesList.innerHTML = `
      <div class="empty-state">
        <strong>No categories yet</strong>
        <span>Add your first category above.</span>
      </div>
    `;

    return;
  }

  categoriesList.innerHTML = categories
    .map((category) => {
      return `
        <div class="category-item">

          <span class="category-name">
            ${escapeHtml(category.name)}
          </span>

          <button
            type="button"
            class="category-delete"
            data-category-id="${category.id}"
            aria-label="Delete ${escapeHtml(category.name)}"
          >
            ×
          </button>

        </div>
      `;
    })
    .join("");

  attachCategoryActions();
}


function attachCategoryActions() {
  document
    .querySelectorAll(".category-delete")
    .forEach((button) => {

      button.addEventListener(
        "click",
        async () => {

          const id =
            button.dataset.categoryId;

          await deleteCategory(id);

        }
      );

    });
}


categoryForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    clearMessage(categoryMessage);

    const name =
      categoryName.value.trim();

    if (!name) {
      showMessage(
        categoryMessage,
        "Please enter a category name.",
        "error"
      );

      return;
    }

    /*
      Convert:

      "Long Form"

      into:

      "long-form"
    */
    const slug = createCategorySlug(name);

    setButtonLoading(
      addCategoryButton,
      true,
      "Adding..."
    );

    const {
      error
    } = await supabaseClient
      .from("categories")
      .insert({
        name,
        slug
      });

    setButtonLoading(
      addCategoryButton,
      false,
      "+ Add category"
    );

    if (error) {
      console.error(
        "Add category error:",
        error
      );

      if (error.code === "23505") {
        showMessage(
          categoryMessage,
          "This category already exists.",
          "error"
        );
      } else {
        showMessage(
          categoryMessage,
          error.message,
          "error"
        );
      }

      return;
    }

    categoryForm.reset();

    showMessage(
      categoryMessage,
      "Category added successfully.",
      "success"
    );

    await loadCategories();
  }
);


async function deleteCategory(id) {
  const confirmed =
    window.confirm(
      "Are you sure you want to delete this category?"
    );

  if (!confirmed) {
    return;
  }

  const {
    error
  } = await supabaseClient
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Delete category error:",
      error
    );

    /*
      This normally happens if videos
      are still using this category.
    */
    alert(
      `Could not delete category: ${error.message}`
    );

    return;
  }

  await loadCategories();
}


function createCategorySlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* =========================================
   METRICS
========================================= */

metricsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearMessage(metricsMessage);

  const videosEdited =
    metricsVideos.value.trim();

  const combinedViews =
    metricsViews.value.trim();

  const yearsExperience =
    metricsExperience.value.trim();

  const recurringClients =
    metricsClients.value.trim();

  if (
    !videosEdited ||
    !combinedViews ||
    !yearsExperience ||
    !recurringClients
  ) {
    showMessage(
      metricsMessage,
      "Please complete all metric fields.",
      "error"
    );

    return;
  }

  setButtonLoading(
    saveMetricsButton,
    true,
    "Saving..."
  );

  const {
    error
  } = await supabaseClient
    .from("metrics")
    .upsert(
      {
        id: 1,
        videos_edited: videosEdited,
        combined_views: combinedViews,
        years_experience: yearsExperience,
        recurring_clients: recurringClients,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: "id"
      }
    );

  setButtonLoading(
    saveMetricsButton,
    false,
    "Save metrics"
  );

  if (error) {
    console.error(
      "Save metrics error:",
      error
    );

    showMessage(
      metricsMessage,
      error.message,
      "error"
    );

    return;
  }

  showMessage(
    metricsMessage,
    "Metrics saved successfully.",
    "success"
  );
});


async function loadMetrics() {
  const {
    data,
    error
  } = await supabaseClient
    .from("metrics")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error(
      "Load metrics error:",
      error
    );

    showMessage(
      metricsMessage,
      error.message,
      "error"
    );

    return;
  }

  if (!data) {
    return;
  }

  metricsVideos.value =
    data.videos_edited || "";

  metricsViews.value =
    data.combined_views || "";

  metricsExperience.value =
    data.years_experience || "";

  metricsClients.value =
    data.recurring_clients || "";
}


/* =========================================
   YOUTUBE URL HELPERS
========================================= */

function extractYouTubeId(url) {
  try {
    const parsedUrl = new URL(url);

    const hostname =
      parsedUrl.hostname.toLowerCase();

    /*
      youtube.com/watch?v=VIDEO_ID
    */
    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      const videoIdFromQuery =
        parsedUrl.searchParams.get("v");

      if (videoIdFromQuery) {
        return videoIdFromQuery;
      }

      /*
        youtube.com/shorts/VIDEO_ID
      */
      const shortsMatch =
        parsedUrl.pathname.match(
          /\/shorts\/([^/?]+)/
        );

      if (shortsMatch) {
        return shortsMatch[1];
      }

      /*
        youtube.com/embed/VIDEO_ID
      */
      const embedMatch =
        parsedUrl.pathname.match(
          /\/embed\/([^/?]+)/
        );

      if (embedMatch) {
        return embedMatch[1];
      }
    }

    /*
      youtu.be/VIDEO_ID
    */
    if (hostname === "youtu.be") {
      const id =
        parsedUrl.pathname
          .split("/")
          .filter(Boolean)[0];

      if (id) {
        return id;
      }
    }

  } catch (error) {
    return null;
  }

  return null;
}


/* =========================================
   UI HELPERS
========================================= */

function showMessage(
  element,
  message,
  type = ""
) {
  element.textContent = message;

  element.classList.remove(
    "success",
    "error"
  );

  if (type) {
    element.classList.add(type);
  }
}


function clearMessage(element) {
  element.textContent = "";

  element.classList.remove(
    "success",
    "error"
  );
}


function setButtonLoading(
  button,
  loading,
  text
) {
  if (loading) {
    button.dataset.originalText =
      button.textContent;

    button.disabled = true;

    button.textContent = text;
  } else {
    button.disabled = false;

    button.textContent =
      button.dataset.originalText || text;
  }
}


/* =========================================
   SECURITY
========================================= */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}