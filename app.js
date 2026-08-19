console.log("app.js has started");


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
// Journey data
// ------------------------------------

const journeys = [
    {
        country: "Finland",
        lat: 64.0,
        lng: 26.0,

        title: "My Journey Through Finland",

        description:
            "Finland was one of the places I visited during my travels. " +
            "I explored the countryside, experienced the local culture, " +
            "and spent time taking in the incredible landscapes."
    }
];


// ------------------------------------
// Scroll elements
// ------------------------------------

const journeyScroll = document.getElementById("journey-scroll");
const scrollTitle = document.getElementById("scroll-title");
const scrollText = document.getElementById("scroll-text");
const closeScroll = document.getElementById("close-scroll");

let openJourney = null;
let openJourneyElement = null;

// ------------------------------------
// Open journey scroll
// ------------------------------------

function openJourneyScroll(journey, element) {

    console.log("Opening scroll:", journey.country);


    // Clicking the currently open traveler
    // closes the scroll
    if (openJourney === journey) {

        closeJourneyScroll();

        return;
    }


    // Remember what is open

    openJourney = journey;
    openJourneyElement = element;


    // Fill the scroll

    scrollTitle.textContent =
        journey.title;

    scrollText.textContent =
        journey.description;


    // Position it

    updateJourneyScrollPosition();


    // Open it

    journeyScroll.classList.add("open");
}

// ------------------------------------
// Close journey scroll
// ------------------------------------

function closeJourneyScroll() {

    console.log("Closing scroll");

    openJourney = null;
    openJourneyElement = null;

    journeyScroll.classList.remove("open");
}
function updateJourneyScrollPosition() {

    if (!openJourney || !openJourneyElement) {
        return;
    }

    const rect =
        openJourneyElement.getBoundingClientRect();

    let left = rect.right + 15;
    let top = rect.top - 20;


    // --------------------------------
    // Keep scroll on screen horizontally
    // --------------------------------

    if (left + 350 > window.innerWidth) {

        left = rect.left - 365;

    }


    // --------------------------------
    // Keep scroll on screen vertically
    // --------------------------------

    if (top < 25) {

        top = 25;

    }

    if (top + 230 > window.innerHeight) {

        top = window.innerHeight - 255;

    }


    journeyScroll.style.left = `${left}px`;
    journeyScroll.style.top = `${top}px`;
}

// ------------------------------------
// Close button
// ------------------------------------

closeScroll.addEventListener("click", function(event) {

    event.stopPropagation();

    closeJourneyScroll();

});


// ------------------------------------
// Create traveler
// ------------------------------------

function createTraveler(journey) {

    const traveler = document.createElement("div");

    traveler.className = "journey-sprite";


    // First animation frame

    const imageOne = document.createElement("img");

    imageOne.src = "assets/traveler.svg";

    imageOne.alt = `Journey in ${journey.country}`;


    // Second animation frame

    const imageTwo = document.createElement("img");

    imageTwo.src = "assets/traveler-breathe.svg";

    imageTwo.alt = "";


    traveler.appendChild(imageOne);
    traveler.appendChild(imageTwo);


    // --------------------------------
    // Traveler click
    // --------------------------------

    traveler.addEventListener("click", function(event) {

        event.preventDefault();
        event.stopPropagation();

        console.log(
            "TRAVELER CLICKED:",
            journey.country
        );

        openJourneyScroll(journey, traveler);

    });


    return traveler;
}


// ------------------------------------
// Create travelers
// ------------------------------------

const travelerElements = journeys.map(journey => {

    return {
        ...journey,
        element: createTraveler(journey)
    };

});


// ------------------------------------
// Put travelers on globe
// ------------------------------------

globe
    .htmlElementsData(travelerElements)
    .htmlLat(journey => journey.lat)
    .htmlLng(journey => journey.lng)
    .htmlAltitude(0.03)
    .htmlElement(journey => journey.element);


// ------------------------------------
// Clicking the globe closes the scroll
// ------------------------------------

traveler.addEventListener("pointerdown", function(event) {

    event.preventDefault();
    event.stopPropagation();

    console.log("TRAVELER POINTER DOWN:", journey.country);

    openJourneyScroll(journey, traveler);

});
function followJourneyScroll() {

    if (openJourney && openJourneyElement) {

        updateJourneyScrollPosition();

    }

    requestAnimationFrame(followJourneyScroll);
}

followJourneyScroll();

console.log("Globe and traveler loaded!");
