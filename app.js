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


// -----------------------------
// Countries we have visited
// -----------------------------

const visitedCountries = [
    {
        name: "Finland",
        lat: 64.0,
        lng: 26.0
    },

    {
        name: "Germany",
        lat: 51.2,
        lng: 10.5
    },

    {
        name: "Japan",
        lat: 36.2,
        lng: 138.3
    }
];


// -----------------------------
// Put markers on the globe
// -----------------------------

globe
    .pointsData(visitedCountries)
    .pointLat(country => country.lat)
    .pointLng(country => country.lng)
    .pointColor(() => "#ffffff")
    .pointRadius(0.5)
    .pointAltitude(0.02)
    .pointLabel(country => country.name);


console.log("Globe and countries loaded!");
