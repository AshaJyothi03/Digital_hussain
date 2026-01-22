// firebase-promotion.js - SIMPLIFIED VERSION
const firebaseConfig = {
  apiKey: "AIzaSyCw0jYC9U43HVkahgvZhduhEdQVXgD_Uh0",
  authDomain: "digital-marketing-ec0f7.firebaseapp.com",
  databaseURL: "https://digital-marketing-ec0f7-default-rtdb.firebaseio.com",
  projectId: "digital-marketing-ec0f7",
  storageBucket: "digital-marketing-ec0f7.firebasestorage.app",
  messagingSenderId: "206707116913",
  appId: "1:206707116913:web:afa302ac71a03d5ffa04d0",
  measurementId: "G-MLE6GTWEN7"
};

// Initialize Firebase
let database = null;

function initializeFirebase() {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    database = firebase.database();
    return true;
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return false;
  }
}

// Generate unique submission ID
function generateSubmissionId() {
  const date = new Date();
  const timestamp = date.getTime();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `AYAN-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}-${random}`;
}

// Get user's IP address
async function getIPAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return "unknown";
  }
}

// Submit promotion form
async function submitPromotionForm(form) {
  try {
    if (!database && !initializeFirebase()) {
      throw new Error("Unable to connect to database");
    }

    // Collect form data
    const formData = {
      businessName: form.querySelector('input[placeholder="Enter your business name"]').value.trim(),
      industry: form.querySelector('select').value,
      contactPerson: form.querySelector('input[placeholder="Full name"]').value.trim(),
      contactEmail: form.querySelector('input[type="email"]').value.trim(),
      phone: form.querySelector('input[type="tel"]').value.trim(),
      website: form.querySelector('input[type="url"]')?.value.trim() || '',
      city: form.querySelector('input[placeholder="Enter city"]').value.trim(),
      state: form.querySelector('input[placeholder="Enter state"]').value.trim(),
      address: form.querySelector('textarea[placeholder="Enter complete address"]')?.value.trim() || '',
      description: form.querySelector('textarea[placeholder*="Describe your business"]').value.trim(),
      keywords: form.querySelector('input[placeholder*="e.g., consulting"]')?.value.trim() || '',
      duration: form.querySelector('select[placeholder="Select duration"]').value,
      budget: form.querySelector('select[placeholder="Select budget"]').value,
      requirements: form.querySelector('textarea[placeholder*="Any special requirements"]')?.value.trim() || '',
      submissionId: generateSubmissionId(),
      timestamp: Date.now(),
      date: new Date().toLocaleString(),
      ipAddress: await getIPAddress(),
      status: 'pending'
    };

    // Submit to Firebase
    const newPromotionRef = database.ref('promotions').push();
    await newPromotionRef.set(formData);

    return {
      success: true,
      submissionId: formData.submissionId,
      businessName: formData.businessName
    };

  } catch (error) {
    console.error("Error submitting form:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Validation functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
}

function validateForm(form) {
  const errors = [];

  // Get values
  const businessName = form.querySelector('input[placeholder="Enter your business name"]').value.trim();
  const industry = form.querySelector('select').value;
  const contactPerson = form.querySelector('input[placeholder="Full name"]').value.trim();
  const contactEmail = form.querySelector('input[type="email"]').value.trim();
  const phone = form.querySelector('input[type="tel"]').value.trim();
  const city = form.querySelector('input[placeholder="Enter city"]').value.trim();
  const state = form.querySelector('input[placeholder="Enter state"]').value.trim();
  const description = form.querySelector('textarea[placeholder*="Describe your business"]').value.trim();
  const duration = form.querySelector('select[placeholder="Select duration"]').value;
  const budget = form.querySelector('select[placeholder="Select budget"]').value;

  // Validate
  if (!businessName) errors.push("Business name is required");
  if (!industry) errors.push("Please select an industry");
  if (!contactPerson) errors.push("Contact person name is required");
  if (!contactEmail) errors.push("Email address is required");
  else if (!validateEmail(contactEmail)) errors.push("Please enter a valid email address");
  if (!phone) errors.push("Phone number is required");
  else if (!validatePhone(phone)) errors.push("Please enter a valid phone number (at least 10 digits)");
  if (!city) errors.push("City is required");
  if (!state) errors.push("State is required");
  if (!description) errors.push("Business description is required");
  if (!duration) errors.push("Please select promotion duration");
  if (!budget) errors.push("Please select budget range");

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Make functions globally available
window.firebasePromotion = {
  submitPromotionForm,
  validateForm
};
