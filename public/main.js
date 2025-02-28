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

// send otp
async function sendOtp() {
    console.log('send otp');
    const verifyOtpBox = document.getElementById('verify-otp-box');

    const otpEmail = document.getElementById('otp-email');
    const email = document.getElementById('email').value;



    if (!email) {
        alert('Email is required');
        return;
    }

    const button = document.getElementById('sendOtpButton');
    button.disabled = true;
    button.textContent = 'Sending...';

    const url = '/send-otp';

    try {
        // Use await to wait for the fetch request to complete
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (res.ok) {
            const data = await res.json();

            alert('OTP sent successfully');
            otpEmail.textContent = email;
            verifyOtpBox.classList.remove('d-none');
            button.textContent = 'OTP Sent';

            if (data.emailIsPresent) {
                alert('Email is already present');
                // Do nothing as the email already exists
            } else {
                alert('Email is not present');

                // Create input fields for name and phone
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.id = 'user-name';
                nameInput.classList.add('form-control', 'mt-3');
                nameInput.placeholder = 'Enter your name';
                nameInput.required = true;

                const phoneInput = document.createElement('input');
                phoneInput.type = 'tel';
                phoneInput.id = 'user-phone';
                phoneInput.classList.add('form-control', 'mt-3');
                phoneInput.placeholder = 'Enter your phone number';
                phoneInput.pattern = '[0-9]{10}';
                phoneInput.title = 'Phone number should be 10 digits';
                phoneInput.required = true;

                verifyOtpBox.appendChild(nameInput);
                verifyOtpBox.appendChild(phoneInput);
            }
        } else {
            alert('Failed to send OTP. Please try again.');
            button.disabled = false;
            button.textContent = 'Send OTP';
        }

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
        button.disabled = false;
        button.textContent = 'Send OTP';
    }
} 
async function sendOtpPopup() {
    console.log('send otp');
    const verifyOtpBox = document.getElementById('verify-otp-box');

    const otpEmail = document.getElementById('otp-email');
    const email = document.getElementById('email').value;



    if (!email) {
        alert('Email is required');
        return;
    }

    const button = document.getElementById('sendOtpButton');
    button.disabled = true;
    button.textContent = 'Sending...';

    const url = '/send-otp';

    try {
        // Use await to wait for the fetch request to complete
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (res.ok) {
            const data = await res.json();

            alert('OTP sent successfully');
            otpEmail.textContent = email;
            verifyOtpBox.classList.remove('d-none');
            button.textContent = 'OTP Sent';

            if (data.emailIsPresent) {
                alert('Email is already present');
                // Do nothing as the email already exists
            } else {
                alert('Email is not present');

                // Create input fields for name and phone
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.id = 'user-name-pop';
                nameInput.classList.add('form-control', 'mt-3');
                nameInput.placeholder = 'Enter your name';
                nameInput.required = true;

                const phoneInput = document.createElement('input');
                phoneInput.type = 'tel';
                phoneInput.id = 'user-phone-pop';
                phoneInput.classList.add('form-control', 'mt-3');
                phoneInput.placeholder = 'Enter your phone number';
                phoneInput.pattern = '[0-9]{10}';
                phoneInput.title = 'Phone number should be 10 digits';
                phoneInput.required = true;

                verifyOtpBox.appendChild(nameInput);
                verifyOtpBox.appendChild(phoneInput);
            }
        } else {
            alert('Failed to send OTP. Please try again.');
            button.disabled = false;
            button.textContent = 'Send OTP';
        }

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
        button.disabled = false;
        button.textContent = 'Send OTP';
    }
}


async function verifyOtp() {
    const otp = document.getElementById('otp').value;
    const nameInput = document.getElementById('user-name');
    const phoneInput = document.getElementById('user-phone');

    const userName = nameInput ? nameInput.value : null;
    const userPhone = phoneInput ? phoneInput.value : null;

    if (!otp) {
        alert('Please enter the OTP');
        return;
    }

    const url = '/verify-otp';
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ otp, userName, userPhone })

        })
        if (res.ok) {
            const data = await res.json();
            alert('OTP verified successfully');
            // Redirect to the appropriate page based on the response
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;


            } else {
                const errorData = await res.json();
                alert(`Failed to verify OTP: ${errorData.message}`);
            }
        }
    }

    catch (error) {
        console.error('Error:', error);
        alert('An error occurred while verifying OTP');
    }



}
async function verifyOtpPopup() {
    const otp = document.getElementById('otp-pop').value;
    const nameInput = document.getElementById('user-name-pop');
    const phoneInput = document.getElementById('user-phone-pop');

    const userName = nameInput ? nameInput.value : null;
    const userPhone = phoneInput ? phoneInput.value : null;


    if (!otp) {
        alert('Please enter the OTP');
        return;
    }

    const url = '/verify-otp-pop';
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ otp, userName, userPhone })

        })
        if (res.ok) {
            const data = await res.json();
            alert('OTP verified successfully');
            // Redirect to the appropriate page based on the response
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;


            } else {
                const errorData = await res.json();
                alert(`Failed to verify OTP: ${errorData.message}`);
            }
        }
    }

    catch (error) {
        console.error('Error:', error);
        alert('An error occurred while verifying OTP');
    }

}
async function addName() {
    const name = document.getElementById('user-name').value;
    const phone = document.getElementById('user-phone').value;
    const userType = 'customer';


    if (!name || !phone || !userType) {
        alert('All fields are required');
        return;
    }
    const url = '/enter-your-details';
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, phone, userType })
        });

        if (res.ok) {
            const data = await res.json();
            alert('Name added successfully');
            window.location.href = '/enter-business-details';
        } else {
            const errorData = await res.json();
            alert(`Failed to add name: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding name');
    }

}
async function addBusinessDetails() {
    const businessName = document.getElementById('business-name').value;
    const pincode = document.getElementById('pincode').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;

    const category = document.getElementById('business-category').value;

    const phone = document.getElementById('phone').value;
    // const email = document.getElementById('email').value;



    const latitudeInput = document.getElementById('latitude').value;
    const longitudeInput = document.getElementById('longitude').value;
    const website = document.getElementById('website').value;
    console.log('latitude================')

    if (!businessName || !pincode || !city || !state || !category || !phone || !latitudeInput || !longitudeInput) {
        alert('All fields are required except website');
        return;
    }
    const requestBody = { businessName, pincode, city, state, category, phone, latitudeInput, longitudeInput };
    if (website) {
        requestBody.website = website;
    }
    const url = '/list-business';
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (res.ok) {
            const data = await res.json();
            alert('Business details added successfully');
            window.location.href = data.redirectUrl;
        } else {
            const errorData = await res.json();
            alert(`Failed to add business: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding business details');

    }

}
//  image in click
function setModalImage(imageSrc) {
    document.getElementById('modalImage').src = imageSrc;
}