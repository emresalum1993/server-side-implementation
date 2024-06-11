// Function to push arguments to the elbLayer
function elb() { 
  (window.elbLayer = window.elbLayer || []).push(arguments); 
}

// Function to get query parameter value by name
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Get the value of 'X-Gtm-Server-Preview' from URL query parameter 'preview'
const gtmServerPreviewValue = getQueryParam('preview');


// Set tracking data in localStorage - for DEMO purposes only. For ebuero.com i see its existing already in localStorage
localStorage.setItem('trackingData', '{"visitorId":"4c7e6481932f4df89bdc9ee2ea8cb837","isCustomer":true}');

// Destination 1 : Log to console WalkerJS events.
const destinationLog = { 
  push: function(event) {
    console.log('WalkerJS ' + event.event + ' event triggered: \n', JSON.stringify(event));
  }
};

// Destination 2: API destination for sending events to SSGTM
const apiDestination = { 
  push: function (event) {
    //Endpoint of SSGTM
    var url = "https://server-side-tagging-ljwn7c2mrq-ew.a.run.app/g/collect";
    var headers = new Headers();

    //headers.append('X-Gtm-Server-Preview', 'ZW52LTN8c0hTSXZJMTFmNXEtanRuNHNNQlVBZ3wxOTAwNjA2NDcxNmNiNmQzNmMwY2Q=');
    //X-Gtm-Server-Preview is required to Debug events in SSGTM side, and it's not static value. So let's read it from query params instead of using static value (for test phase only):
    headers.append('X-Gtm-Server-Preview', gtmServerPreviewValue || '');
    headers.append('Content-Type', 'application/json');

    //Stringify event data
    var body = JSON.stringify(event);
    //Send fetch request to SSGRM
    fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    })
    .then(response => response.json())
    .then(data => {
      // Handle success response
    })
    .catch((error) => {
      // Handle error response
    });
  }
}
// Event listener for UserCentrics events
window.addEventListener("ucEvent", function (e) {
  // Customize analytics and ad service names
  const ucAnalyticsService = 'Google Analytics';
  const ucAdService = 'Google Ads';
  const consentObj = { 
    ad_storage: e.detail[ucAdService],
    ad_user_data: e.detail[ucAdService],
    ad_personalization: e.detail[ucAdService],
    analytics_storage: e.detail[ucAnalyticsService]
  }

  //If its pageLoad event run walkerJS
  if (e.detail.action === 'onInitialPageLoad') {
    console.log('UserCentrics loaded with consent: \n' + JSON.stringify(consentObj));
    elb('walker config', {
      consent: consentObj,
      elb: 'elb', // Name of the elb function to assign to the window
      elbLayer: window.elbLayer, // Public elbwalker API for async communication (only prior run)
      globals: {}, // Static attributes added to each event
      instance: 'walkerjs', // Name of the walkerjs instance to assign to the window
      pageview: true, // Trigger a page view event by default
      prefix: 'data-elb', // Attributes prefix used by the walker
      user: consentObj.analytics_storage ? getUser() : removeUser(), // Setting the user IDs
      tagging: 0, // Current version of the tracking setup
    });

    elb('walker destination', destinationLog);
    elb('walker destination', apiDestination);
    console.log('WalkerJS Destination Set');
    console.log('WalkerJS Running');
    elb('walker run');
    elb('walker on', 'consent', { analytics_storage: onConsent });
  } else {
    console.log('UserMetrics consent updated: \n', consentObj);
    elb('walker consent', consentObj);
    elb('consent update');
  }
});

// Function to handle consent changes
function onConsent(instance, consent) {
  if (consent.analytics_storage === true) {
    elb('walker user', getUser());
  } else {
    elb('walker user', removeUser());
  }
}

// Function to get tracking data from localStorage
function getTrackingData() {
  return localStorage.getItem('trackingData') ? JSON.parse(localStorage.getItem('trackingData')) : {};
}

// Function to get user data
function getUser() {
  const sessionKey = "elb_user_sessionId";
  const deviceKey = "elb_user_deviceId";
  var session = window.sessionStorage.getItem(sessionKey);
  var device = window.localStorage.getItem(deviceKey);

  if (!session) {
    session = Date.now();
    window.sessionStorage.setItem(sessionKey, session);
  }

  if (!device) {
    device = Math.round(Math.random() * 10000000000);
    window.localStorage.setItem(deviceKey, device);
  }

  return {
    session,
    device,
    trackingData: getTrackingData()
  };
}

// Function to remove user data
function removeUser() {
  const sessionKey = "elb_user_sessionId";
  const deviceKey = "elb_user_deviceId";
 
  window.sessionStorage.removeItem(sessionKey);
  window.localStorage.removeItem(deviceKey);

  return {
    session: 'null',
    device: 'null',
    trackingData: getTrackingData()
  };
}

// Function to check the scroll position for page scroll event
function listenScroll() {
  const scrollTop = window.scrollY;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercentage = (scrollTop / documentHeight) * 100;

  if (scrollPercentage > 20) {
    // Execute when scrolled more than 20%
    //Send page scroll event
    elb('page scroll');
    // Remove the event listener to ensure it triggers only once
    window.removeEventListener('scroll', listenScroll);
  }
}

// Add the scroll event listener
window.addEventListener('scroll', listenScroll);

// Function to execute after 20 seconds
function onPageTimeElapsed() {
  elb('page engage');
  clearTimeout(timer); // Clear the timeout to ensure it only triggers once
}

// Set a timeout to trigger after 20 seconds (20000 milliseconds)
const timer = setTimeout(onPageTimeElapsed, 20000);

// Form submission and input event handlers
const form = document.getElementsByName("testForm")[0];
var formSubmitting = false;

function sendForm() {
  let name = form["uName"].value;
  let mail = form.value;
  let msg = form.value;
  let id = form.dataset.id;

  elb('form submit', { name, mail, msg, id });
}

form.addEventListener("input", (e) => {
  if (!formSubmitting) {
    let id = form.dataset.id;
    elb('form start', { id });
  }
  formSubmitting = true;
});

// Connect console logs to a specific HTML element
ConsoleLogHTML.connect(document.getElementById("myULContainer"));

// Function to handle link clicks
function handleLinkClick(event) {
  event.preventDefault(); // Optional: Prevent the default link behavior
  const url = event.target.href;
  const text = event.target.text


  // Example of pushing event to elb
  elb('link click', { url: url, text:text });

  // Optional: Follow the link after processing
  window.location.href = url;
}

// Add event listener to all anchor tags
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', handleLinkClick);
});
