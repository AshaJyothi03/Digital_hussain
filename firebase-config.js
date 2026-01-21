// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyCw0jYC9U43HVkahgvZhduhEdQVXgD_Uh0",
  authDomain: "digital-marketing-ec0f7.firebaseapp.com",
  projectId: "digital-marketing-ec0f7",
  storageBucket: "digital-marketing-ec0f7.firebasestorage.app",
  messagingSenderId: "206707116913",
  appId: "1:206707116913:web:afa302ac71a03d5ffa04d0",
  measurementId: "G-MLE6GTWEN7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Generate a random promo code
function generatePromoCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PROMO-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Send email using Firebase Functions (if you set it up)
async function sendPromoEmail(email, name, promoCode) {
  try {
    const sendEmail = httpsCallable(functions, 'sendPromoEmail');
    const result = await sendEmail({
      email: email,
      name: name,
      promoCode: promoCode
    });
    return result.data.success;
  } catch (error) {
    console.error("Email function error:", error);
    return false;
  }
}

// Store form data in Firestore
export async function submitPromoForm(formData) {
  try {
    const promoCode = generatePromoCode();
    const userData = {
      ...formData,
      promoCode: promoCode,
      status: "pending",
      createdAt: serverTimestamp(),
      ipAddress: await getIPAddress()
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, "promoSubmissions"), userData);

    // Try to send email (optional)
    const emailSent = await sendPromoEmail(formData.email, formData.name, promoCode);

    return {
      success: true,
      docId: docRef.id,
      promoCode: promoCode,
      emailSent: emailSent
    };

  } catch (error) {
    console.error("Error submitting form:", error);
    return {
      success: false,
      error: error.message
    };
  }
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

// Validate email format
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone format (optional)
export function validatePhone(phone) {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/\D/g, ''));
}