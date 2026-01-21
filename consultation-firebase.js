// consultation-firebase.js
// This file contains the Firebase functions for consultation form

// Firebase Configuration
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
let firebaseInitialized = false;
let database = null;

export function initializeFirebase() {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    database = firebase.database();
    firebaseInitialized = true;
    console.log("Firebase initialized successfully");
    return true;
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return false;
  }
}

// Generate unique consultation ID
export function generateConsultationId() {
  const date = new Date();
  const timestamp = date.getTime();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `CONSULT-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}-${random}`;
}

// Get user's IP address
export async function getIPAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return "unknown";
  }
}

// Validate email format
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone format
export function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
}

// Create WhatsApp message
export function createWhatsAppMessage(formData) {
  const message = `*New Consultation Request - AyanIQ Digital*%0A%0A` +
                  `*Name:* ${formData.name}%0A` +
                  `*Business:* ${formData.business}%0A` +
                  `*Email:* ${formData.email}%0A` +
                  `*Phone:* ${formData.phone}%0A` +
                  `*Preferred Time:* ${formData.preferredTime}%0A` +
                  `*Consultation ID:* ${formData.consultationId}%0A` +
                  `*Submitted:* ${new Date().toLocaleString()}%0A%0A` +
                  `Please follow up with the client.`;
  return message;
}

// Submit consultation to Firebase
export async function submitConsultation(formData) {
  try {
    // Ensure Firebase is initialized
    if (!firebaseInitialized) {
      initializeFirebase();
    }

    if (!database) {
      throw new Error("Unable to connect to database");
    }

    // Generate consultation ID
    const consultationId = generateConsultationId();

    // Get IP address
    const ipAddress = await getIPAddress();

    // Prepare data for Firebase
    const consultationData = {
      ...formData,
      consultationId: consultationId,
      timestamp: Date.now(),
      date: new Date().toLocaleString(),
      ipAddress: ipAddress,
      status: 'pending'
    };

    // Save to Firebase Realtime Database
    const newConsultationRef = database.ref('consultations').push();
    await newConsultationRef.set(consultationData);

    return {
      success: true,
      consultationId: consultationId,
      firebaseKey: newConsultationRef.key,
      data: consultationData
    };

  } catch (error) {
    console.error("Error submitting consultation:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get WhatsApp link
export function getWhatsAppLink(formData, phoneNumber = "919000000000") {
  const message = createWhatsAppMessage(formData);
  return `https://wa.me/${phoneNumber}?text=${message}`;
}