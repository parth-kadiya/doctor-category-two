document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENT REFERENCES & STATE ---
  const startScreen    = document.getElementById("startScreen");
  const step1Screen    = document.getElementById("step1Screen");
  const step2Screen    = document.getElementById("step2Screen");
  const step3Screen    = document.getElementById("step3Screen");
const screens = [step1Screen, step2Screen, step3Screen];

  // --- VIDEO SOURCES FOR SUB-CATEGORIES ---
const subcatVideos = {
  "Type 1 Diabetes":      "Media/temp1.mp4",
  "Type 2 Diabetes":      "Media/temp2.mp4",
  "Gestational Diabetes": "Media/"
};

const videoModal    = document.getElementById("videoModal");
const subcatVideo   = document.getElementById("subcatVideo");
const closeVideoBtn = document.getElementById("closeVideoBtn");

  const startBtn       = document.getElementById("startBtn");
  const nextBtn        = document.getElementById("nextBtn");    // step1→step2
  const prevBtn        = document.getElementById("prevBtn");    // step2→step1
  const next2Btn       = document.getElementById("next2Btn");   // step2→step3
  const prev3Btn       = document.getElementById("prev3Btn");   // step3→step2
  const next3Btn       = document.getElementById("next3Btn");   // step3→step4
  const searchInput    = document.getElementById("search");

  const overlay        = document.getElementById("noCategoryOverlay");
  const modal          = document.getElementById("noCategoryModal");
  const okBtn          = document.getElementById("modalOkBtn");



  // Sub-category elements
  const subCatGrid     = document.getElementById("subCategoryGrid");
  const noSubCatMsg    = document.getElementById("noSubCatMsg");
  let selectedSubCat   = null;

  let currentStep      = 0;       // 0 = category, 1 = sub-category, 2 = details, 3 = thank you
  let selectedCard     = null;
  let templatesShown = false;


  // --- PROGRESS BAR UTILITY ---
  function goToStep(index) {
    screens.forEach(screen => {
      screen.querySelectorAll(".step").forEach(dot => {
        dot.classList.remove("active", "done");
      });
    });
    screens[index].querySelectorAll(".step").forEach((dot, i) => {
      if (i < index) dot.classList.add("done");
      else if (i === index) dot.classList.add("active");
    });
  }

  // --- START BUTTON ---
startBtn.addEventListener("click", () => {
  // 1. Hide the start screen
  startScreen.classList.add("d-none");
  // 2. Show the auth container
  document.getElementById("authContainer").classList.remove("d-none");
});

const authLoginBtn  = document.getElementById("authLoginBtn");
const authSignupBtn = document.getElementById("authSignupBtn");

function enterWizard() {
  // 1. Hide the auth container
  document.getElementById("authContainer").classList.add("d-none");
  // 2. Reveal step1
  step1Screen.classList.remove("d-none");
  searchInput.focus();
  currentStep = 0;
  goToStep(0);
}

// On successful Sign In or Sign Up:
authLoginBtn.addEventListener("click", enterWizard);
authSignupBtn.addEventListener("click", enterWizard);



  // --- STEP 1: CATEGORY SEARCH & SELECTION ---
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    document.querySelectorAll(".category-col").forEach(col => {
      const name = col.dataset.name.toLowerCase();
      col.style.display = (!query || name.startsWith(query)) ? "block" : "none";
    });
  });
  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      if (selectedCard && selectedCard !== card) {
        selectedCard.classList.remove("selected");
      }
      if (card.classList.toggle("selected")) {
        selectedCard = card;
      } else {
        selectedCard = null;
      }
    });
  });

  // --- MODAL (no category) ---
  function showNoCategoryModal() { overlay.classList.remove("d-none"); modal.classList.remove("d-none"); }
  function hideNoCategoryModal() { overlay.classList.add("d-none"); modal.classList.add("d-none"); }
  okBtn.addEventListener("click", hideNoCategoryModal);
  overlay.addEventListener("click", e => e.stopPropagation());

  // --- STEP 1 → STEP 2 ---
nextBtn.addEventListener("click", () => {
  if (!selectedCard) {
    showNoCategoryModal();
  } else {
    step1Screen.classList.add("d-none");
    step2Screen.classList.remove("d-none");
    currentStep = 1;
    goToStep(1);
    // ← यहाँ सही data-name पास करें:
    const categoryName = selectedCard.closest('.category-col').dataset.name;
    populateSubCategories(categoryName);
  }
});


  // --- STEP 2 → STEP 1 ---
// STEP 2 → STEP 1 (Modify prevBtn handler)
prevBtn.addEventListener("click", () => {
  if (templatesShown) {
    // Templates → Sub‑category
    templatesShown = false;
    // header revert करें
    document.querySelector("#step2Screen .step-description").textContent = "Choose a Sub‑category";

    // सब‑categories फिर से दिखाएँ, लेकिन existing selection कायम रखें
    const categoryName = selectedCard.closest('.category-col').dataset.name;

    // populateSubCategories() हमेशा selectedSubCat = null कर देता है,
    // इसलिए पहले selectedSubCat को स्टोर कर लें:
    const prevSelection = selectedSubCat;
    populateSubCategories(categoryName);

    // अगर कोई पहले से चुनी थी तो दोबारा select करें:
    if (prevSelection) {
      const card = subCatGrid.querySelector(`.category-card[data-name="${prevSelection}"]`);
      if (card) {
        card.classList.add("selected");
        selectedSubCat = prevSelection;
      }
    }
  } else {
    // पहले जैसा behavior
    step2Screen.classList.add("d-none");
    step1Screen.classList.remove("d-none");
    currentStep = 0;
    goToStep(0);
  }
});



  // --- STEP 2: SUB‑CATEGORY SELECTION → STEP 3 ---
// --- STEP 2 → STEP 3 (Templates now in Step 3) ---
next2Btn.addEventListener("click", event => {
  event.preventDefault();

  const hasSubs = subCatGrid.children.length > 0;

  // अगर कोई सब-केटेगरी नहीं और अभी templatesShown भी नहीं → सीधे Step 3
  if (!hasSubs && !templatesShown) {
    step2Screen.classList.add("d-none");
    step3Screen.classList.remove("d-none");
    currentStep = 2;
    goToStep(2);
  }
  else {
    // अगर सब-केटेगरीज़ हैं लेकिन कोई चुनी नहीं
    if (hasSubs && !selectedSubCat) {
      showNoSubCatModal();
      return;
    }
    // अब Step 2 से Step 3 पर जाएँ
    step2Screen.classList.add("d-none");
    step3Screen.classList.remove("d-none");
    currentStep = 2;
    goToStep(2);
  }

  // —————————————————————————
  // यहाँ से Templates inject करें
  // —————————————————————————
  const templateGrid = document.getElementById("templateGrid");
  templateGrid.innerHTML = "";      // पुराने हटा दो

  const templates = [
    { name: "Template 1", icon: "fas fa-file-alt", key: "template1" },
    { name: "Template 2", icon: "fas fa-file-alt",  key: "template2" }
  ];

  templates.forEach(t => {
    const col = document.createElement("div");
    col.className = "col category-col";
    col.innerHTML = `
      <div class="category-card" data-name="${t.name}" data-video="${t.key}">
        <i class="${t.icon}"></i>
        <span>${t.name}</span>
      </div>`;
    templateGrid.append(col);

    const card = col.querySelector(".category-card");
    card.addEventListener("click", () => {
      // पहले सबकी selected क्लास हटाएं
      document.querySelectorAll("#templateGrid .category-card.selected")
              .forEach(c => c.classList.remove("selected"));
      // इस पर जोड़ें
      card.classList.add("selected");
      // वीडियो खोलो
      openVideoModal(card.dataset.video);
    });
  });

  templatesShown = true;
});




  // --- STEP 3 → STEP 2 ---
  prev3Btn.addEventListener("click", (event) => {
    event.preventDefault(); // prevent page refresh
    step3Screen.classList.add("d-none");
    step2Screen.classList.remove("d-none");
    currentStep = 1;
    goToStep(1);
  });

// --- STEP 3 → STEP 4 (अब Template चयन validate) ---
// --- STEP 3 → THANK YOU ---
next3Btn.addEventListener("click", event => {
  event.preventDefault();
  // सुनिश्चित करें कोई template चुना गया
  const chosen = document.querySelector("#templateGrid .category-card.selected");
  if (!chosen) {
    alert("Please select a template before proceeding.");
    return;
  }
  // Step3 छुपाएं, ThankYou दिखाएँ
  step3Screen.classList.add("d-none");
  document.getElementById("thankYouScreen").classList.remove("d-none");
  goToStep(3); // प्रोग्रेस बार में तीसरे डॉट को active करने के लिए
});





  // --- STEP 4 NAVIGATION & PHOTO HANDLING ---


  // file/photo modal refs
  const fileInput      = document.getElementById("file-input");
  const noPhotoOverlay = document.getElementById("noPhotoOverlay");
  const noPhotoModal   = document.getElementById("noPhotoModal");
  const photoOkBtn     = document.getElementById("modalPhotoOkBtn");

  function showNoPhotoModal() {
    noPhotoOverlay.classList.remove("d-none");
    noPhotoModal.classList.remove("d-none");
  }
  function hideNoPhotoModal() {
    noPhotoOverlay.classList.add("d-none");
    noPhotoModal.classList.add("d-none");
  }
  photoOkBtn.addEventListener("click", hideNoPhotoModal);
  noPhotoOverlay.addEventListener("click", e => e.stopPropagation());



  // --- STEP 2 “no sub‑category” MODAL HANDLING ---
const noSubCatOverlay = document.getElementById("noSubCatOverlay");
const noSubCatModal   = document.getElementById("noSubCatModal");
const subCatOkBtn     = document.getElementById("modalSubCatOkBtn");

function showNoSubCatModal() {
  noSubCatOverlay.classList.remove("d-none");
  noSubCatModal.classList.remove("d-none");
}
function hideNoSubCatModal() {
  noSubCatOverlay.classList.add("d-none");
  noSubCatModal.classList.add("d-none");
}
subCatOkBtn.addEventListener("click", hideNoSubCatModal);
noSubCatOverlay.addEventListener("click", e => e.stopPropagation());

// modal के element references
const noTemplateOverlay = document.getElementById("noTemplateOverlay");
const noTemplateModal   = document.getElementById("noTemplateModal");
const templateOkBtn     = document.getElementById("modalTemplateOkBtn");

function showNoTemplateModal() {
  noTemplateOverlay.classList.remove("d-none");
  noTemplateModal.classList.remove("d-none");
}
function hideNoTemplateModal() {
  noTemplateOverlay.classList.add("d-none");
  noTemplateModal.classList.add("d-none");
}
templateOkBtn.addEventListener("click", hideNoTemplateModal);
noTemplateOverlay.addEventListener("click", e => e.stopPropagation());



  // --- HELPERS: SUB‑CATEGORY POPULATION ---
  function populateSubCategories(categoryName) {
    selectedSubCat = null;
    subCatGrid.innerHTML = "";
    noSubCatMsg.classList.add("d-none");

   if (categoryName === "Diabetes") {
    // ← यहीं पर Diabetes के लिए 3 बॉक्स बनेंगे
const subs = [
  { name: "Type 1 Diabetes",      icon: "fas fa-stethoscope" },      // हृदय उपचार से संबंधित उपकरण
  { name: "Type 2 Diabetes",   icon: "fas fa-heartbeat"    },      // हृदय की रिदम/धड़कन से जुड़ा
  { name: "Gestational Diabetes",          icon: "fas fa-heart"        }       // हृदय प्रत्यारोपण के लिए उपयुक्त
];

      subs.forEach(sub => {
       const col = document.createElement("div");
  col.className = "col category-col d-flex flex-column align-items-center";

  // अब innerHTML में कार्ड और बटन दोनों डालें
  col.innerHTML = `
    <div class="category-card" data-name="${sub.name}">
      <i class="${sub.icon}"></i>
      <span>${sub.name}</span>
    </div>
    <a href="${subcatVideos[sub.name]}"
       class="download-btn neumorphic-button mt-3"
       download
    >
      <i class="fas fa-download"></i>
      Download Video
    </a>
  `;
  subCatGrid.append(col);

        const card = col.querySelector(".category-card");
        card.addEventListener("click", () => {
          document.querySelectorAll("#subCategoryGrid .category-card.selected")
                  .forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
          selectedSubCat = card.dataset.name;
          openVideoModal(selectedSubCat);
        });
      });
    } else {
      noSubCatMsg.classList.remove("d-none");
    }
  }

  function openVideoModal(subName) {
  const src = subcatVideos[subName];
  if (!src) return;
  subcatVideo.querySelector("source").src = src;
  subcatVideo.load();
  videoModal.classList.remove("d-none");
}

function closeVideoModal() {
  subcatVideo.pause();
  videoModal.classList.add("d-none");
}
closeVideoBtn.addEventListener("click", closeVideoModal);

const templateVideos = {
  template1: "Media/",
  template2: "Media/"
};

function openVideoModal(key) {
  // पहले कोशिश subcatVideos में देखें, फिर templateVideos में
  let src = subcatVideos[key] || templateVideos[key];
  if (!src) return;
  subcatVideo.querySelector("source").src = src;
  subcatVideo.load();
  videoModal.classList.remove("d-none");
}

});


