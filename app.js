console.log("app.js has started");


// ====================================
// Supabase
// ====================================

const SUPABASE_URL =
    "https://xnprkiceeswrplenhizk.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_BEt4YNqh9ii8AV7EfJTtVw_d4iRRFRn";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ====================================
// Globe
// ====================================

const globeContainer =
    document.getElementById("globe");

const globe =
    Globe()(globeContainer);

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


// ====================================
// Page elements
// ====================================

const countryCount =
    document.getElementById("country-count");

const journeyScroll =
    document.getElementById("journey-scroll");

const scrollTitle =
    document.getElementById("scroll-title");

const scrollText =
    document.getElementById("scroll-text");

const closeScroll =
    document.getElementById("close-scroll");


// ====================================
// Open journey state
// ====================================

let openJourney = null;

let openJourneyElement = null;


// ====================================
// Load journeys from Supabase
// ====================================

async function loadJourneys() {

    console.log("Loading journeys from Supabase...");


    const { data, error } =
        await supabaseClient
            .from("journeys")
            .select(`
                id,
                country,
                title,
                description,
                latitude,
                longitude,
                date_from,
                date_to
            `)
            .order("created_at", {
                ascending: true
            });


    // --------------------------------
    // Error
    // --------------------------------

    if (error) {

        console.error(
            "Could not load journeys:",
            error
        );

        countryCount.textContent =
            "Could not load journeys";

        return [];
    }


    console.log(
        "Journeys loaded:",
        data
    );


    // --------------------------------
    // Convert database coordinates
    //
    // Database:
    // latitude
    // longitude
    //
    // Globe:
    // lat
    // lng
    // --------------------------------

    const journeys = data.map(journey => {

        return {
            ...journey,

            lat: journey.latitude,
            lng: journey.longitude
        };

    });


    updateCountryCount(journeys);

    return journeys;
}


// ====================================
// Country counter
// ====================================

function updateCountryCount(journeys) {

    const countries = [];


    for (const journey of journeys) {

        if (
            !countries.includes(
                journey.country
            )
        ) {

            countries.push(
                journey.country
            );
        }
    }


    const amount =
        countries.length;


    if (amount === 1) {

        countryCount.textContent =
            "1 country visited";

    } else {

        countryCount.textContent =
            `${amount} countries visited`;

    }
}


// ====================================
// Open journey scroll
// ====================================

function openJourneyScroll(
    journey,
    element
) {

    console.log(
        "Opening scroll:",
        journey.country
    );


    // Clicking the currently open
    // traveler closes the scroll.

    if (openJourney === journey) {

        closeJourneyScroll();

        return;
    }


    // Remember currently open journey.

    openJourney =
        journey;

    openJourneyElement =
        element;


    // Fill scroll.

    scrollTitle.textContent =
        journey.title;

    scrollText.textContent =
        journey.description;


    // Position scroll.

    updateJourneyScrollPosition();


    // Open.

    journeyScroll.classList.add(
        "open"
    );
}


// ====================================
// Close journey scroll
// ====================================

function closeJourneyScroll() {

    console.log("Closing scroll");

    openJourney =
        null;

    openJourneyElement =
        null;

    journeyScroll.classList.remove(
        "open"
    );
}


// ====================================
// Position journey scroll
// ====================================

function updateJourneyScrollPosition() {

    if (
        !openJourney ||
        !openJourneyElement
    ) {

        return;
    }


    const rect =
        openJourneyElement
            .getBoundingClientRect();


    // --------------------------------
    // Traveler outside screen
    // --------------------------------

    if (
        rect.bottom < 0 ||
        rect.top > window.innerHeight ||
        rect.right < 0 ||
        rect.left > window.innerWidth
    ) {

        journeyScroll.style.opacity =
            "0";

        return;
    }


    // Traveler visible again.

    journeyScroll.style.opacity =
        "";


    let left =
        rect.right + 15;

    let top =
        rect.top - 20;


    // --------------------------------
    // Right edge
    // --------------------------------

    if (
        left + 350 >
        window.innerWidth
    ) {

        left =
            rect.left - 365;
    }


    // --------------------------------
    // Left edge
    // --------------------------------

    if (left < 15) {

        left = 15;
    }


    // --------------------------------
    // Top edge
    // --------------------------------

    if (top < 25) {

        top = 25;
    }


    // --------------------------------
    // Bottom edge
    // --------------------------------

    if (
        top + 230 >
        window.innerHeight
    ) {

        top =
            window.innerHeight - 255;
    }


    journeyScroll.style.left =
        `${left}px`;

    journeyScroll.style.top =
        `${top}px`;
}


// ====================================
// Close button
// ====================================

closeScroll.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        closeJourneyScroll();
    }
);


// ====================================
// Create traveler
// ====================================

function createTraveler(journey) {

    const traveler =
        document.createElement("div");

    traveler.className =
        "journey-sprite";


    // --------------------------------
    // Animation frame 1
    // --------------------------------

    const imageOne =
        document.createElement("img");

    imageOne.src =
        "assets/traveler.svg";

    imageOne.alt =
        `Journey in ${journey.country}`;


    // --------------------------------
    // Animation frame 2
    // --------------------------------

    const imageTwo =
        document.createElement("img");

    imageTwo.src =
        "assets/traveler-breathe.svg";

    imageTwo.alt = "";


    traveler.appendChild(
        imageOne
    );

    traveler.appendChild(
        imageTwo
    );


    // --------------------------------
    // Traveler click
    // --------------------------------

    traveler.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();


            console.log(
                "TRAVELER CLICKED:",
                journey.country
            );


            openJourneyScroll(
                journey,
                traveler
            );
        }
    );


    // Prevent globe drag from
    // swallowing traveler clicks.

    traveler.addEventListener(
        "pointerdown",
        function(event) {

            event.stopPropagation();
        }
    );


    return traveler;
}


// ====================================
// Put journeys on globe
// ====================================

function displayJourneys(journeys) {

    const travelerElements =
        journeys.map(journey => {

            return {
                ...journey,

                element:
                    createTraveler(
                        journey
                    )
            };
        });


    globe
        .htmlElementsData(
            travelerElements
        )

        .htmlLat(
            journey =>
                journey.lat
        )

        .htmlLng(
            journey =>
                journey.lng
        )

        .htmlAltitude(
            0.03
        )

        .htmlElement(
            journey =>
                journey.element
        );


    console.log(
        "Travelers displayed:",
        travelerElements.length
    );
}


// ====================================
// Keep scroll attached to traveler
// ====================================

function updateOpenScroll() {

    if (
        !openJourney ||
        !openJourneyElement
    ) {

        return;
    }


    updateJourneyScrollPosition();
}


// Update while zooming.

globe.onZoom(
    updateOpenScroll
);


// Update while rotating.

globe
    .controls()
    .addEventListener(
        "change",
        updateOpenScroll
    );


// Update when browser changes size.

window.addEventListener(
    "resize",
    updateOpenScroll
);


// ====================================
// Start application
// ====================================

async function startJourneyApp() {

    const journeys =
        await loadJourneys();


    displayJourneys(
        journeys
    );


    console.log(
        "Globe and travelers loaded!"
    );
}


startJourneyApp();
