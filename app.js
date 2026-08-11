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
// Journey data
// ------------------------------------

const journeys = [
    {
        country: "Finland",
        lat: 64.0,
        lng: 26.0
    }
];


// ------------------------------------
// Create traveler
// ------------------------------------

function createTraveler(journey) {

    const image = document.createElement("img");

    image.src = "assets/traveler.svg";

    image.alt = "";

    image.style.width = "52px";
    image.style.height = "68px";

    image.style.imageRendering = "pixelated";

    return image;
}


// ------------------------------------
// Put travelers on the globe
// ------------------------------------

globe
    .objectsData(journeys)

    .objectLat(journey => journey.lat)

    .objectLng(journey => journey.lng)

    .objectAltitude(0.03)

    .objectThreeObject(journey => {

        const image = createTraveler(journey);

        /*
         * Globe.gl's object layer expects a
         * Three.js Object3D here.
         *
         * We will replace this with the
         * proper Three.js sprite in the
         * next step.
         */

        return image;

    });


console.log("Globe loaded!");
