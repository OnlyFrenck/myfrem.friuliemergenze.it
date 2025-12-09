// IMPORT FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// CONFIG
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

// FORM
const form = document.getElementById("eventForm");
const statusMsg = document.getElementById("statusMsg");

let currentUser = null;

// CONTROLLA LOGIN
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// INVIO PROPOSTA
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userDoc = await getDoc(doc(db, "users", currentUser.uid));

  if (!userDoc.exists()) {
    statusMsg.textContent = "❌ Errore: utente non trovato.";
    statusMsg.style.color = "#ff4a4a";
    return;
  }

  const title = document.getElementById("eventTitle").value;
  const description = document.getElementById("description").value;
  const location = document.getElementById("location").value;
  const contact = document.getElementById("contact").value;

  statusMsg.textContent = "⏳ Invio in corso...";
  statusMsg.style.color = "#ccc";

  try {
    await addDoc(collection(db, "events"), {
      title,
      description,
      location,
      contact,
      userId: userDoc.data().name + " " + userDoc.data().surname,
      status: "In revisione...",
      createdAt: serverTimestamp()
    });

    statusMsg.textContent = "✅ Proposta inviata! Lo staff ti contatterà.";
    statusMsg.style.color = "#4aff4a";
    form.reset();
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Errore durante l'invio.";
    statusMsg.style.color = "#ff4a4a";
  }
});
