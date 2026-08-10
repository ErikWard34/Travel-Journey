import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const OWNER_UID = "REPLACE_WITH_YOUR_FIREBASE_UID";

const COUNTRIES = [
  ["FI", "Finland", 64.0, 26.0],
  ["SE", "Sweden", 62.0, 15.0],
  ["NO", "Norway", 65.0, 13.0],
  ["DK", "Denmark", 56.0, 10.0],
  ["DE", "Germany", 51.2, 10.5],
  ["FR", "France", 46.2, 2.2],
  ["ES", "Spain", 40.4, -3.7],
  ["IT", "Italy", 42.8, 12.8],
  ["GB", "United Kingdom", 55.4, -3.4],
  ["IS", "Iceland", 64.9, -19.0],
  ["US", "United States", 39.8, -98.6],
  ["CA", "Canada", 56.1, -106.3],
  ["CN", "China", 35.9, 104.2],
  ["JP", "Japan", 36.2, 138.3],
  ["KR", "South Korea", 35.9, 127.8],
  ["TH", "Thailand", 15.9, 100.9],
  ["VN", "Vietnam", 14.1, 108.3],
  ["AU", "Australia", -25.3, 133.8],
  ["NZ", "New Zealand", -40.9, 174.9],
  ["BR", "Brazil", -14.2, -51.9],
  ["ZA", "South Africa", -30.6, 22.9]
].map(([code, name, lat, lng]) => ({ code, name, lat, lng }));

const countryByCode = new Map(COUNTRIES.map(c => [c.code, c]));

let journeys = [];
let globe;
let currentOpenId = null;
let authUser = null;
let globeReady = false;
let renderTimer = null;

const $ = id => document.getElementById(id);

const loading = $("loading");
const scrollPanel = $("scroll-panel");
const adminPanel = $("admin-panel");
const loginView = $("login-view");
const editorView = $("editor-view");
const loginError = $("login-error");
const journeyList = $("journey-list");
const countrySelect = $("country");

populateCountries();
setupUI();
setupGlobe();
watchJourneys();
watchAuth();

function populateCountries() {
  for (const country of COUNTRIES) {
    const option = document.createElement("option");
    option.value = country.code;
    option.textContent = country.name;
    countrySelect.appendChild(option);
  }
}

function setupUI() {
  $("admin-button").addEventListener("click", () => {
    adminPanel.classList.remove("hidden");
    adminPanel.setAttribute("aria-hidden", "false");
  });

  $("close-admin").addEventListener("click", closeAdmin);
  $("close-scroll").addEventListener("click", closeJourney);

  adminPanel.addEventListener("click", event => {
    if (event.target === adminPanel) closeAdmin();
  });

  $("login-form").addEventListener("submit", async event => {
    event.preventDefault();
    loginError.textContent = "";

    try {
      await signInWithEmailAndPassword(
        auth,
        $("email").value.trim(),
        $("password").value
      );
    } catch (error) {
      loginError.textContent = error.message;
    }
  });

  $("journey-form").addEventListener("submit", saveJourney);
  $("new-journey").addEventListener("click", resetJourneyForm);
  $("sign-out").addEventListener("click", () => signOut(auth));
}

function setupGlobe() {
  globe = Globe()(document.getElementById("globe"))
    .backgroundColor("#03050a")
    .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
    .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
    .showAtmosphere(true)
    .atmosphereColor("#5d87c7")
    .atmosphereAltitude(0.18)
    .htmlElementsData([])
    .htmlLat(d => d.lat)
    .htmlLng(d => d.lng)
    .htmlAltitude(0.025)
    .htmlElement(d => d.element);

  globe.pointOfView({ lat: 25, lng: 10, altitude: 2.2 }, 0);

  // Re-cluster while zooming.
  globe.controls().addEventListener("change", scheduleRender);

  globeReady = true;
  scheduleRender();
  loading.classList.add("hidden");
}

function watchAuth() {
  onAuthStateChanged(auth, user => {
    authUser = user;

    const isOwner = Boolean(user && user.uid === OWNER_UID);

    if (isOwner) {
      loginView.classList.add("hidden");
      editorView.classList.remove("hidden");
      renderAdminList();
    } else {
      loginView.classList.remove("hidden");
      editorView.classList.add("hidden");

      if (user) {
        loginError.textContent = "This account is not authorized as the owner.";
      }
    }
  });
}

function watchJourneys() {
  const q = query(collection(db, "journeys"), orderBy("country"));

  onSnapshot(q, snapshot => {
    journeys = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));

    updateCount();
    renderAdminList();
    scheduleRender();
  }, error => {
    console.error("Could not load journeys:", error);
    loading.textContent = "Could not load journeys.";
  });
}

function updateCount() {
  const uniqueCountries = new Set(journeys.map(j => j.countryCode));
  $("journey-count").textContent =
    `${uniqueCountries.size} ${uniqueCountries.size === 1 ? "country" : "countries"} visited`;
}

function scheduleRender() {
  if (!globeReady) return;

  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderGlobeSprites, 80);
}

function renderGlobeSprites() {
  const clusters = clusterJourneys(journeys, getClusterThreshold());

  const elements = clusters.map(cluster => {
    const element = cluster.journeys.length === 1
      ? createJourneySprite(cluster.journeys[0])
      : createMergedSprite(cluster.journeys);

    return {
      id: cluster.journeys.map(j => j.id).join("|"),
      lat: cluster.lat,
      lng: cluster.lng,
      element
    };
  });

  globe.htmlElementsData(elements);
}

function getClusterThreshold() {
  const altitude = globe.pointOfView().altitude;

  if (altitude > 2.4) return 18;
  if (altitude > 1.8) return 10;
  if (altitude > 1.25) return 5;
  if (altitude > 0.8) return 2;
  return 0.4;
}

function clusterJourneys(items, threshold) {
  if (!items.length) return [];

  const clusters = [];

  for (const journey of items) {
    const country = countryByCode.get(journey.countryCode);
    if (!country) continue;

    let target = null;

    if (threshold > 0) {
      for (const cluster of clusters) {
        if (distanceDegrees(country.lat, country.lng, cluster.lat, cluster.lng) <= threshold) {
          target = cluster;
          break;
        }
      }
    }

    if (!target) {
      clusters.push({
        lat: country.lat,
        lng: country.lng,
        journeys: [journey]
      });
    } else {
      target.journeys.push(journey);

      // Move the cluster center toward its members.
      target.lat = average(target.journeys.map(j => countryByCode.get(j.countryCode).lat));
      target.lng = average(target.journeys.map(j => countryByCode.get(j.countryCode).lng));
    }
  }

  return clusters;
}

function distanceDegrees(lat1, lng1, lat2, lng2) {
  const x = (lng2 - lng1) * Math.cos((lat1 * Math.PI) / 180);
  const y = lat2 - lat1;
  return Math.sqrt(x * x + y * y);
}

function average(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function createTravelerElement() {
  const wrapper = document.createElement("div");
  wrapper.className = "traveler";

  const one = document.createElement("img");
  one.className = "traveler-frame frame-one";
  one.src = "assets/traveler-1.svg";
  one.alt = "";

  const two = document.createElement("img");
  two.className = "traveler-frame frame-two";
  two.src = "assets/traveler-2.svg";
  two.alt = "";

  wrapper.append(one, two);
  return wrapper;
}

function createJourneySprite(journey) {
  const sprite = document.createElement("div");
  sprite.className = "journey-sprite";
  sprite.title = journey.title;
  sprite.appendChild(createTravelerElement());

  sprite.addEventListener("click", event => {
    event.stopPropagation();
    openJourney(journey);
  });

  return sprite;
}

function createMergedSprite(clusterJourneysList) {
  const sprite = document.createElement("div");
  sprite.className = "merged-sprite";
  sprite.title = `${clusterJourneysList.length} journeys`;

  sprite.appendChild(createTravelerElement());

  const count = document.createElement("span");
  count.className = "cluster-count";
  count.textContent = clusterJourneysList.length;
  sprite.appendChild(count);

  sprite.addEventListener("click", event => {
    event.stopPropagation();
    openCluster(clusterJourneysList);
  });

  return sprite;
}

function openJourney(journey) {
  if (currentOpenId === journey.id) {
    closeJourney();
    return;
  }

  currentOpenId = journey.id;

  $("scroll-eyebrow").textContent = journey.country || countryByCode.get(journey.countryCode)?.name || "";
  $("scroll-title").textContent = journey.title;
  $("scroll-text").textContent = journey.description;
  $("scroll-countries").replaceChildren();

  scrollPanel.classList.add("open");
  scrollPanel.setAttribute("aria-hidden", "false");
}

function openCluster(cluster) {
  currentOpenId = `cluster:${cluster.map(j => j.id).join("|")}`;

  $("scroll-eyebrow").textContent = "Merged journeys";
  $("scroll-title").textContent = `${cluster.length} countries`;
  $("scroll-text").textContent = "Zoom in or choose a country below.";

  const list = $("scroll-countries");
  list.replaceChildren();

  for (const journey of cluster) {
    const country = countryByCode.get(journey.countryCode);
    const button = document.createElement("button");
    button.className = "scroll-country";
    button.textContent = country?.name || journey.countryCode;

    button.addEventListener("click", () => {
      closeJourney();
      const location = countryByCode.get(journey.countryCode);
      if (location) {
        globe.pointOfView(
          { lat: location.lat, lng: location.lng, altitude: 0.65 },
          900
        );
      }
    });

    list.appendChild(button);
  }

  scrollPanel.classList.add("open");
  scrollPanel.setAttribute("aria-hidden", "false");
}

function closeJourney() {
  currentOpenId = null;
  scrollPanel.classList.remove("open");
  scrollPanel.setAttribute("aria-hidden", "true");
}

function closeAdmin() {
  adminPanel.classList.add("hidden");
  adminPanel.setAttribute("aria-hidden", "true");
}

async function saveJourney(event) {
  event.preventDefault();

  if (!authUser || authUser.uid !== OWNER_UID) {
    alert("You are not authorized to edit journeys.");
    return;
  }

  const countryCode = $("country").value;
  const country = countryByCode.get(countryCode);

  const data = {
    countryCode,
    country: country.name,
    title: $("title").value.trim(),
    description: $("description").value.trim(),
    updatedAt: Date.now()
  };

  const id = $("journey-id").value;

  try {
    if (id) {
      await updateDoc(doc(db, "journeys", id), data);
    } else {
      await addDoc(collection(db, "journeys"), {
        ...data,
        createdAt: Date.now()
      });
    }

    resetJourneyForm();
  } catch (error) {
    console.error(error);
    alert("Could not save journey: " + error.message);
  }
}

function resetJourneyForm() {
  $("journey-form").reset();
  $("journey-id").value = "";
  countrySelect.value = COUNTRIES[0].code;
}

function renderAdminList() {
  if (!authUser || authUser.uid !== OWNER_UID) {
    journeyList.replaceChildren();
    return;
  }

  journeyList.replaceChildren();

  for (const journey of journeys) {
    const row = document.createElement("div");
    row.className = "journey-row";

    const name = document.createElement("span");
    name.textContent = `${journey.country}: ${journey.title}`;

    const actions = document.createElement("span");

    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.addEventListener("click", () => populateEditor(journey));

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.className = "danger";
    remove.addEventListener("click", () => removeJourney(journey));

    actions.append(edit, remove);
    row.append(name, actions);
    journeyList.appendChild(row);
  }
}

function populateEditor(journey) {
  $("journey-id").value = journey.id;
  $("country").value = journey.countryCode;
  $("title").value = journey.title;
  $("description").value = journey.description;
}

async function removeJourney(journey) {
  if (!authUser || authUser.uid !== OWNER_UID) return;

  if (!confirm(`Delete "${journey.title}"?`)) return;

  try {
    await deleteDoc(doc(db, "journeys", journey.id));
  } catch (error) {
    alert("Could not delete journey: " + error.message);
  }
}
