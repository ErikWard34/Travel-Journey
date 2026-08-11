import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

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

function createTraveler() {

    const textureLoader = new THREE.TextureLoader();

    const texture = textureLoader.load(
        "assets/traveler.svg"
    );

    texture.colorSpace = THREE.SRGBColorSpace;

    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);

    sprite.scale.set(20, 26, 1);

    return sprite;
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
