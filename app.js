console.log("app.js has started");

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
// Journey scroll
// ------------------------------------

const journeyScroll = document.getElementById("journey-scroll");
const scrollTitle = document.getElementById("scroll-title");
const scrollText = document.getElementById("scroll-text");
const closeScroll = document.getElementById("close-scroll");

let openJourney = null;
function openJourneyScroll(journey, element) {

    // If clicking the currently open journey,
    // close it instead.
    if (openJourney === journey) {
        closeJourneyScroll();
        return;
    }

    openJourney = journey;

    scrollTitle.textContent = journey.title;
    scrollText.textContent = journey.description;

    // Find where the sprite currently is on screen
    const rect = element.getBoundingClientRect();

    // Position scroll beside sprite
    let left = rect.right + 15;
    let top = rect.top - 20;

    // Prevent scroll from going off the right side
    if (left + 340 > window.innerWidth) {
        left = rect.left - 355;
    }

    // Prevent scroll from going off the top
    if (top < 20) {
        top = 20;
    }

    // Prevent scroll from going off the bottom
    if (top + 220 > window.innerHeight) {
        top = window.innerHeight - 240;
    }

    journeyScroll.style.left = `${left}px`;
    journeyScroll.style.top = `${top}px`;

    journeyScroll.classList.add("open");
}
function closeJourneyScroll() {

    openJourney = null;

    journeyScroll.classList.remove("open");
}
closeScroll.addEventListener("click", closeJourneyScroll);
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
// Create traveler
// ------------------------------------

function createTraveler(journey) {

    const traveler = document.createElement("div");

    traveler.className = "journey-sprite";

    const imageOne = document.createElement("img");

    imageOne.src = "assets/traveler.svg";
    imageOne.alt = `Journey in ${journey.country}`;

    const imageTwo = document.createElement("img");

    imageTwo.src = "assets/traveler-breathe.svg";
    imageTwo.alt = "";

    traveler.appendChild(imageOne);
    traveler.appendChild(imageTwo);


    // --------------------------------
    // Clicking the traveler
    // --------------------------------

   traveler.addEventListener("click", function(event) {

    event.stopPropagation();

    openJourneyScroll(journey, traveler);

});

    return traveler;
}
globeContainer.addEventListener("click", function() {
    closeJourneyScroll();
});

// ------------------------------------
// Put travelers on the globe
// ------------------------------------

const travelerElements = journeys.map(journey => {

    return {
        ...journey,
        element: createTraveler(journey)
    };

});


globe
    .htmlElementsData(travelerElements)
    .htmlLat(journey => journey.lat)
    .htmlLng(journey => journey.lng)
    .htmlAltitude(0.03)
    .htmlElement(journey => journey.element);


console.log("Globe and traveler loaded!");
