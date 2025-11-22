import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXD0zGs_kzfWYugVIj8rrZX91YlwBjOJU",
  authDomain: "friuli-emergenze.firebaseapp.com",
  projectId: "friuli-emergenze",
  storageBucket: "friuli-emergenze.firebasestorage.app",
  messagingSenderId: "362899702838",
  appId: "1:362899702838:web:da96f62189ef1fa2010497",
  measurementId: "G-THNJG888RE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById("contactForm");
const result = document.getElementById("result");

let currentUser = null;

onAuthStateChanged(auth, user => {
  currentUser = user || null;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!subject || !message) {
    result.innerText = "❌ Compila tutti i campi.";
    return;
  }

  try {
    await addDoc(collection(db, "messages"), {
      userId: currentUser?.uid || null,
      email: currentUser?.email || "Non autenticato",
      subject,
      message,
      createdAt: serverTimestamp(),
      status: "open"
    });

    result.innerText = "✅ Messaggio inviato! Ti risponderemo al più presto.";
    form.reset();

  } catch (err) {
    console.error(err);
    result.innerText = "❌ Errore durante l'invio.";
  }
});