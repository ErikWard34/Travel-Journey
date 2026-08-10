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
// Our first journey
// ------------------------------------

const journeys = [
    {
        country: "Finland",
        lat: 64.0,
        lng: 26.0
    }
];


// ------------------------------------
// Create the traveler sprite
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

        console.log(
            `You clicked the journey in ${journey.country}`
        );

    });


    return traveler;
}


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


console.log("Traveler loaded!");
