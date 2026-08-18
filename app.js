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


// ------------------------------------
// Open journey scroll
// ------------------------------------

function openJourneyScroll(journey, element) {

    console.log("Opening scroll:", journey.country);

    // Clicking the currently open traveler closes it
    if (openJourney === journey) {
        closeJourneyScroll();
        return;
    }

    openJourney = journey;

    scrollTitle.textContent = journey.title;
    scrollText.textContent = journey.description;


    // Get sprite's current screen position
    const rect = element.getBoundingClientRect();

    let left = rect.right + 15;
    let top = rect.top - 20;


    // Keep scroll on screen

    if (left + 340 > window.innerWidth) {
        left = rect.left - 355;
    }

    if (top < 20) {
        top = 20;
    }

    if (top + 220 > window.innerHeight) {
        top = window.innerHeight - 240;
    }


    journeyScroll.style.left = `${left}px`;
    journeyScroll.style.top = `${top}px`;

    journeyScroll.classList.add("open");
}


// ------------------------------------
// Close journey scroll
// ------------------------------------

function closeJourneyScroll() {

    console.log("Closing scroll");

    openJourney = null;

    journeyScroll.classList.remove("open");
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

globeContainer.addEventListener("click", function() {

    closeJourneyScroll();

});


console.log("Globe and traveler loaded!");
