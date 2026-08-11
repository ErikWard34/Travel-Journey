import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

console.log("app.js has started");

const globeContainer = document.getElementById("globe");

window.myGlobe = Globe()(globeContainer);

const globe = window.myGlobe;

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

function createTraveler() {

    const textureLoader = new THREE.TextureLoader();

function createTraveler() {

    const geometry = new THREE.BoxGeometry(8, 8, 8);

    const material = new THREE.MeshBasicMaterial({
        color: 0xff0000
    });

    const cube = new THREE.Mesh(
        geometry,
        material
    );

    return cube;
}


// ------------------------------------
// Add travelers
// ------------------------------------

globe
    .objectsData(journeys)

    .objectLat(journey => journey.lat)

    .objectLng(journey => journey.lng)

    .objectAltitude(0.03)

    .objectThreeObject(() => {
        return createTraveler();
    });


console.log("Traveler added!");
