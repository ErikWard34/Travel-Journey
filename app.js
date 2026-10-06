console.log("app.js has started");

// ------------------------------------
// Supabase
// ------------------------------------

const SUPABASE_URL = "https://xnprkiceeswrplenhizk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_BEt4YNqh9ii8AV7EfJTtVw_d4iRRFRn";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// ------------------------------------
// Globe
// ------------------------------------

const globeContainer = document.getElementById("globe");
const globe = Globe()(globeContainer);

globe
    .backgroundColor("#03050a")
    .globeImageUrl(
        "https://unpkg.com/three-globe/example/img/earth-night.jpg"
    )
    .bumpImageUrl(
        "https://unpkg.com/three-globe/example/img/earth-topology.png"
    )
    .showAtmosphere(true)
    .atmosphereColor("#5d87c7")
    .atmosphereAltitude(0.18);

globe.pointOfView(
    {
        lat: 30,
        lng: 0,
        altitude: 2.2
    },
    0
);

// ------------------------------------
// Shared state
// ------------------------------------

let journeys = [];
let openJourney = null;
let editingJourney = null;

// ------------------------------------
// Scroll elements
// ------------------------------------

const journeyScroll = document.getElementById("journey-scroll");
const scrollTitle = document.getElementById("scroll-title");
const scrollText = document.getElementById("scroll-text");
const scrollPhotos = document.getElementById("scroll-photos");
const closeScrollButton = document.getElementById("close-scroll");
const countryCount = document.getElementById("country-count");

function closeJourneyScroll() {
    openJourney = null;
    journeyScroll.classList.remove("open");
    journeyScroll.setAttribute("aria-hidden", "true");
}

function positionJourneyScroll(element) {
    const rect = element.getBoundingClientRect();
    const scrollWidth = Math.min(380, window.innerWidth - 30);
    const scrollHeight = Math.max(journeyScroll.offsetHeight || 220, 220);

    let left = rect.right + 15;
    let top = rect.top - 20;
    let opensOnLeft = false;

    if (left + scrollWidth > window.innerWidth - 10) {
        left = rect.left - scrollWidth - 15;
        opensOnLeft = true;
    }

    if (left < 10) {
        left = 10;
    }

    if (top < 20) {
        top = 20;
    }

    if (top + scrollHeight > window.innerHeight - 20) {
        top = Math.max(20, window.innerHeight - scrollHeight - 20);
    }

    journeyScroll.style.left = `${left}px`;
    journeyScroll.style.top = `${top}px`;
    journeyScroll.style.transformOrigin = opensOnLeft
        ? "right center"
        : "left center";
}

function renderScrollPhotos(photos = []) {
    scrollPhotos.innerHTML = "";

    for (const photo of photos) {
        const image = document.createElement("img");
        image.src = photo.image_url;
        image.alt = photo.caption || "Journey photo";
        image.loading = "lazy";
        scrollPhotos.appendChild(image);
    }
}

function openJourneyScroll(journey, element) {
    if (openJourney?.id === journey.id) {
        closeJourneyScroll();
        return;
    }

    openJourney = journey;
    scrollTitle.textContent = journey.title;
    scrollText.textContent = journey.description || "";
    renderScrollPhotos(journey.journey_photos || []);

    journeyScroll.classList.add("open");
    journeyScroll.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
        positionJourneyScroll(element);
    });
}

closeScrollButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    event.stopPropagation();
    closeJourneyScroll();
});

// ------------------------------------
// Traveler creation
// ------------------------------------

function createTraveler(journey) {
    const traveler = document.createElement("div");
    traveler.className = "journey-sprite";
    traveler.title = journey.country;

    const imageOne = document.createElement("img");
    imageOne.src = "assets/traveler.svg";
    imageOne.alt = `Journey in ${journey.country}`;

    const imageTwo = document.createElement("img");
    imageTwo.src = "assets/traveler-breathe.svg";
    imageTwo.alt = "";

    traveler.appendChild(imageOne);
    traveler.appendChild(imageTwo);

    traveler.addEventListener("pointerdown", event => {
        event.preventDefault();
        event.stopPropagation();
        openJourneyScroll(journey, traveler);
    });

    return traveler;
}

function renderJourneysOnGlobe() {
    const travelerElements = journeys.map(journey => ({
        ...journey,
        element: createTraveler(journey)
    }));

    globe
        .htmlElementsData(travelerElements)
        .htmlLat(journey => journey.latitude)
        .htmlLng(journey => journey.longitude)
        .htmlAltitude(0.03)
        .htmlElement(journey => journey.element);

    const uniqueCountries = new Set(
        journeys.map(journey => journey.country.trim().toLowerCase())
    );

    const count = uniqueCountries.size;
    countryCount.textContent = `${count} ${count === 1 ? "country" : "countries"} visited`;
}

async function loadJourneys() {
    countryCount.textContent = "Loading journeys...";

    const { data, error } = await supabaseClient
        .from("journeys")
        .select(`
            id,
            country,
            title,
            description,
            latitude,
            longitude,
            date_from,
            date_to,
            created_at,
            updated_at,
            journey_photos (
                id,
                image_url,
                caption,
                display_order,
                created_at
            )
        `)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Unable to load journeys:", error);
        countryCount.textContent = "Unable to load journeys";
        return;
    }

    journeys = (data || []).map(journey => ({
        ...journey,
        journey_photos: [...(journey.journey_photos || [])].sort(
            (a, b) => a.display_order - b.display_order
        )
    }));

    closeJourneyScroll();
    renderJourneysOnGlobe();
    renderAdminJourneyList();
}

// ------------------------------------
// Admin UI
// ------------------------------------

const adminButton = document.getElementById("admin-button");
const adminBackdrop = document.getElementById("admin-backdrop");
const adminPanel = document.getElementById("admin-panel");
const adminClose = document.getElementById("admin-close");

const adminAuthView = document.getElementById("admin-auth-view");
const adminDashboardView = document.getElementById("admin-dashboard-view");
const adminLoginForm = document.getElementById("admin-login-form");
const adminEmail = document.getElementById("admin-email");
const adminPassword = document.getElementById("admin-password");
const adminSignup = document.getElementById("admin-signup");
const adminAuthMessage = document.getElementById("admin-auth-message");
const adminUserLabel = document.getElementById("admin-user-label");
const adminSignout = document.getElementById("admin-signout");

const adminJourneyList = document.getElementById("admin-journey-list");
const newJourneyButton = document.getElementById("new-journey-button");
const journeyForm = document.getElementById("journey-form");
const journeyFormHeading = document.getElementById("journey-form-heading");
const journeyFormMessage = document.getElementById("journey-form-message");
const cancelEdit = document.getElementById("cancel-edit");
const existingPhotos = document.getElementById("existing-photos");

const journeyIdInput = document.getElementById("journey-id");
const journeyCountryInput = document.getElementById("journey-country");
const journeyTitleInput = document.getElementById("journey-title");
const journeyDescriptionInput = document.getElementById("journey-description");
const journeyLatitudeInput = document.getElementById("journey-latitude");
const journeyLongitudeInput = document.getElementById("journey-longitude");
const journeyDateFromInput = document.getElementById("journey-date-from");
const journeyDateToInput = document.getElementById("journey-date-to");
const journeyPhotosInput = document.getElementById("journey-photos");

function setMessage(element, message, type = "") {
    element.textContent = message;
    element.classList.remove("error", "success");

    if (type) {
        element.classList.add(type);
    }
}

function openAdminPanel() {
    adminBackdrop.hidden = false;
    adminPanel.hidden = false;
    adminPanel.setAttribute("aria-hidden", "false");
    closeJourneyScroll();
    refreshAdminView();
}

function closeAdminPanel() {
    adminBackdrop.hidden = true;
    adminPanel.hidden = true;
    adminPanel.setAttribute("aria-hidden", "true");
}

adminButton.addEventListener("click", openAdminPanel);
adminClose.addEventListener("click", closeAdminPanel);
adminBackdrop.addEventListener("click", closeAdminPanel);

async function getVerifiedAdminUser() {
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        return null;
    }

    const { data: adminRow, error: adminError } = await supabaseClient
        .from("journey_admins")
        .select("email")
        .eq("email", user.email)
        .maybeSingle();

    if (adminError || !adminRow) {
        return null;
    }

    return user;
}

async function refreshAdminView() {
    const user = await getVerifiedAdminUser();

    if (!user) {
        adminAuthView.hidden = false;
        adminDashboardView.hidden = true;
        return;
    }

    adminAuthView.hidden = true;
    adminDashboardView.hidden = false;
    adminUserLabel.textContent = user.email;
    renderAdminJourneyList();
}

adminLoginForm.addEventListener("submit", async event => {
    event.preventDefault();
    setMessage(adminAuthMessage, "Signing in...");

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: adminEmail.value.trim(),
        password: adminPassword.value
    });

    if (error) {
        setMessage(adminAuthMessage, error.message, "error");
        return;
    }

    const adminUser = await getVerifiedAdminUser();

    if (!adminUser) {
        await supabaseClient.auth.signOut();
        setMessage(
            adminAuthMessage,
            "This account is not registered as the My Journey administrator.",
            "error"
        );
        return;
    }

    adminPassword.value = "";
    setMessage(adminAuthMessage, "");
    await refreshAdminView();
});

adminSignup.addEventListener("click", async () => {
    const email = adminEmail.value.trim();
    const password = adminPassword.value;

    if (!email || password.length < 8) {
        setMessage(
            adminAuthMessage,
            "Enter your admin email and a password of at least 8 characters first.",
            "error"
        );
        return;
    }

    setMessage(adminAuthMessage, "Creating admin login...");

    const { error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) {
        setMessage(adminAuthMessage, error.message, "error");
        return;
    }

    setMessage(
        adminAuthMessage,
        "Account created. If Supabase email confirmation is enabled, confirm the message sent to your email, then sign in.",
        "success"
    );
});

adminSignout.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    clearJourneyForm();
    await refreshAdminView();
});

supabaseClient.auth.onAuthStateChange(() => {
    if (!adminPanel.hidden) {
        setTimeout(refreshAdminView, 0);
    }
});

// ------------------------------------
// Admin journey list / editor
// ------------------------------------

function renderAdminJourneyList() {
    if (!adminJourneyList) {
        return;
    }

    adminJourneyList.innerHTML = "";

    if (journeys.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No journeys yet.";
        adminJourneyList.appendChild(empty);
        return;
    }

    for (const journey of journeys) {
        const card = document.createElement("div");
        card.className = "admin-journey-card";

        const info = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = journey.country;

        const title = document.createElement("p");
        title.textContent = journey.title;

        info.appendChild(name);
        info.appendChild(title);

        const actions = document.createElement("div");
        actions.className = "admin-card-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editJourney(journey.id));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "danger-button";
        deleteButton.addEventListener("click", () => deleteJourney(journey.id));

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        card.appendChild(info);
        card.appendChild(actions);
        adminJourneyList.appendChild(card);
    }
}

function clearJourneyForm() {
    editingJourney = null;
    journeyForm.reset();
    journeyIdInput.value = "";
    journeyFormHeading.textContent = "Add journey";
    existingPhotos.innerHTML = "";
    setMessage(journeyFormMessage, "");
}

function editJourney(id) {
    const journey = journeys.find(item => item.id === id);

    if (!journey) {
        return;
    }

    editingJourney = journey;
    journeyIdInput.value = journey.id;
    journeyCountryInput.value = journey.country;
    journeyTitleInput.value = journey.title;
    journeyDescriptionInput.value = journey.description || "";
    journeyLatitudeInput.value = journey.latitude;
    journeyLongitudeInput.value = journey.longitude;
    journeyDateFromInput.value = journey.date_from || "";
    journeyDateToInput.value = journey.date_to || "";
    journeyFormHeading.textContent = `Edit ${journey.country}`;
    setMessage(journeyFormMessage, "");
    renderExistingPhotos(journey);
}

function renderExistingPhotos(journey) {
    existingPhotos.innerHTML = "";

    for (const photo of journey.journey_photos || []) {
        const wrapper = document.createElement("div");
        wrapper.className = "existing-photo";

        const image = document.createElement("img");
        image.src = photo.image_url;
        image.alt = photo.caption || "Journey photo";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "×";
        removeButton.title = "Remove photo";
        removeButton.addEventListener("click", () => removePhoto(photo.id));

        wrapper.appendChild(image);
        wrapper.appendChild(removeButton);
        existingPhotos.appendChild(wrapper);
    }
}

newJourneyButton.addEventListener("click", clearJourneyForm);
cancelEdit.addEventListener("click", clearJourneyForm);

journeyForm.addEventListener("submit", async event => {
    event.preventDefault();

    const adminUser = await getVerifiedAdminUser();

    if (!adminUser) {
        setMessage(journeyFormMessage, "Your admin session is no longer valid.", "error");
        return;
    }

    const payload = {
        country: journeyCountryInput.value.trim(),
        title: journeyTitleInput.value.trim(),
        description: journeyDescriptionInput.value.trim(),
        latitude: Number(journeyLatitudeInput.value),
        longitude: Number(journeyLongitudeInput.value),
        date_from: journeyDateFromInput.value || null,
        date_to: journeyDateToInput.value || null
    };

    setMessage(journeyFormMessage, "Saving journey...");

    let journeyId = journeyIdInput.value;

    if (journeyId) {
        const { error } = await supabaseClient
            .from("journeys")
            .update(payload)
            .eq("id", journeyId);

        if (error) {
            setMessage(journeyFormMessage, error.message, "error");
            return;
        }
    } else {
        const { data, error } = await supabaseClient
            .from("journeys")
            .insert(payload)
            .select("id")
            .single();

        if (error) {
            setMessage(journeyFormMessage, error.message, "error");
            return;
        }

        journeyId = data.id;
    }

    try {
        await uploadSelectedPhotos(journeyId);
    } catch (error) {
        console.error(error);
        setMessage(
            journeyFormMessage,
            `Journey saved, but a photo upload failed: ${error.message}`,
            "error"
        );
        await loadJourneys();
        return;
    }

    setMessage(journeyFormMessage, "Journey saved.", "success");
    await loadJourneys();

    const refreshed = journeys.find(item => item.id === journeyId);
    if (refreshed) {
        editJourney(refreshed.id);
    }
});

async function uploadSelectedPhotos(journeyId) {
    const files = Array.from(journeyPhotosInput.files || []);

    for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const filePath = `${journeyId}/${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabaseClient.storage
            .from("journey-photos")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabaseClient.storage
            .from("journey-photos")
            .getPublicUrl(filePath);

        const { error: photoRowError } = await supabaseClient
            .from("journey_photos")
            .insert({
                journey_id: journeyId,
                image_url: publicUrlData.publicUrl,
                caption: "",
                display_order: index
            });

        if (photoRowError) {
            throw photoRowError;
        }
    }

    journeyPhotosInput.value = "";
}

async function deleteJourney(id) {
    const journey = journeys.find(item => item.id === id);

    if (!journey) {
        return;
    }

    const confirmed = window.confirm(
        `Delete the journey in ${journey.country}? This cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    const { error } = await supabaseClient
        .from("journeys")
        .delete()
        .eq("id", id);

    if (error) {
        window.alert(error.message);
        return;
    }

    if (editingJourney?.id === id) {
        clearJourneyForm();
    }

    await loadJourneys();
}

async function removePhoto(photoId) {
    const { error } = await supabaseClient
        .from("journey_photos")
        .delete()
        .eq("id", photoId);

    if (error) {
        setMessage(journeyFormMessage, error.message, "error");
        return;
    }

    await loadJourneys();

    if (editingJourney?.id) {
        const refreshed = journeys.find(item => item.id === editingJourney.id);
        if (refreshed) {
            editJourney(refreshed.id);
        }
    }
}

// ------------------------------------
// Start
// ------------------------------------

loadJourneys();

console.log("Globe and Supabase journey system loaded!");
