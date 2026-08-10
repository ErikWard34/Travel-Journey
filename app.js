console.log("app.js has started");

const globeContainer = document.getElementById("globe");

console.log("Globe container:", globeContainer);
console.log("Globe library:", typeof Globe);

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

console.log("Globe created successfully!");
