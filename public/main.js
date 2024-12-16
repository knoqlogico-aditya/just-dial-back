$(document).ready(function () {
    $(".testimonial-slider").slick({
        infinite: true,
        centerMode: true,
        autoplay: true,
        slidesToShow: 5,
        slidesToScroll: 3,
        autoplaySpeed: 1500,
        prevArrow: '<button type="button" class="slick-prev">←</button>',
        nextArrow: '<button type="button" class="slick-next">→</button>',
        responsive: [
            {
                breakpoint: 1440,
                settings: {
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 2,
                    centerMode: false
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    });
});

// search placement to the top 
window.onload = () => {
    const heroSearchBar = document.querySelector(".welcome-hero-search-box");
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar.offsetHeight;
    let hasTriggered = false;
    const navSearchBar = document.querySelector('.input-search-container');

    window.addEventListener("scroll", () => {

        console.log(`the navbar height is ${navbarHeight}`);
        const heroSearchBarPosition = heroSearchBar.getBoundingClientRect().top;
        const navbarPosition = navbar.getBoundingClientRect().bottom;


        if (heroSearchBarPosition <= navbarPosition && !hasTriggered) {
            console.log("Search bar has hit the navigation bar!");
            hasTriggered = true;
            heroSearchBar.style.visibility = "hidden"
            navSearchBar.style.display = 'flex';
        }
        if (heroSearchBarPosition > navbarPosition && hasTriggered) {
            console.log('appreared again')
            hasTriggered = false;
            heroSearchBar.style.visibility = "visible"
            navSearchBar.style.display = 'none';
        }
    });


};


// Animate Number Function
function animateNumber(element, start, end, duration) {
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const progress = currentTime - startTime;
        const rate = Math.min(progress / duration, 1);
        const value = Math.floor(rate * (end - start) + start);
        element.textContent = value.toLocaleString();

        if (progress < duration) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

// Apply Animation on Scroll
document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".counter");
    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const targetValue = parseInt(counter.getAttribute("data-target"));
                    animateNumber(counter, 0, targetValue, 2000); // 2000ms duration
                    observer.unobserve(counter); // Stop observing after animating
                }
            });
        },
        { threshold: 0.5 } // Trigger when 50% visible
    );

    counters.forEach((counter) => observer.observe(counter));
});

// ***************
// list business js
const pincodeInput = document.getElementById('pincode');
const additionalFields = document.getElementById('additionalFields');
const cityInput = document.getElementById('city');
const stateInput = document.getElementById('state');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');

const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';

async function fetchLocationDetails(pincode) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${GOOGLE_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK') {
            const result = data.results[0];
            const addressComponents = result.address_components;
            const location = result.geometry.location;

            const city = addressComponents.find(component => component.types.includes('locality'))?.long_name || '';
            const state = addressComponents.find(component => component.types.includes('administrative_area_level_1'))?.long_name || '';
            const latitude = location.lat;
            const longitude = location.lng;

            return { city, state, latitude, longitude };
        } else {
            console.error('Error:', data.status);
            return { city: 'Unknown', state: 'Unknown', latitude: '', longitude: '' };
        }
    } catch (error) {
        console.error('Error fetching location:', error);
        return { city: 'Unknown', state: 'Unknown', latitude: '', longitude: '' };
    }
}

pincodeInput.addEventListener('input', async () => {
    console.log('keuy is pressed')
    const pincode = pincodeInput.value.trim();
    if (pincode) {
        const { city, state, latitude, longitude } = await fetchLocationDetails(pincode);
        cityInput.value = city;
        stateInput.value = state;
        latitudeInput.value = latitude;
        longitudeInput.value = longitude;
        additionalFields.classList.remove('d-none');
    } else {
        additionalFields.classList.add('d-none');
    }
});