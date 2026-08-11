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
// Convert latitude/longitude to 3D
// ------------------------------------

function latLngToVector3(lat, lng, radius) {

    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
}


// ------------------------------------
// Create a traveler
// ------------------------------------

function createTraveler(journey) {

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

    const globeRadius = globe.getGlobeRadius();

    const position = latLngToVector3(
        journey.lat,
        journey.lng,
        globeRadius + 5
    );

    sprite.position.copy(position);

    sprite.scale.set(20, 26, 1);

    return sprite;
}


// ------------------------------------
// Add traveler to the Three.js scene
// ------------------------------------

const scene = globe.scene();

const travelerObjects = [];

for (const journey of journeys) {

    const traveler = createTraveler(journey);

    scene.add(traveler);

    travelerObjects.push({
        journey: journey,
        sprite: traveler
    });

}


console.log("Traveler added to Three.js scene!");
