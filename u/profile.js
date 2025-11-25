import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBXD0zGs_kzfWYugVIj8rrZX91YlwBjOJU",
  authDomain: "friuli-emergenze.firebaseapp.com",
  projectId: "friuli-emergenze",
  storageBucket: "friuli-emergenze.firebasestorage.app",
  messagingSenderId: "362899702838",
  appId: "1:362899702838:web:da96f62189ef1fa2010497"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Prende username da URL /u/mariorossi
const pathParts = window.location.pathname.split("/");
const username = pathParts[pathParts.length - 1];

if (!username || username === "u") {
  document.body.innerHTML = "<h2>Profilo non trovato</h2>";
  throw new Error("Username mancante");
}

// DOM
const profilePic = document.getElementById("profilePic");
const usernameEl = document.getElementById("username");
const bioEl = document.getElementById("bio");
const photosContainer = document.getElementById("userPhotos");

loadProfile();

async function loadProfile() {
  try {
    // 🔎 Cerca utente per username
    const userQuery = query(
      collection(db, "users"),
      where("username", "==", username),
      limit(1)
    );

    const userSnap = await getDocs(userQuery);

    if (userSnap.empty) {
      document.body.innerHTML = "<h2>Utente non trovato</h2>";
      return;
    }

    const userDoc = userSnap.docs[0];
    const user = userDoc.data();
    const userId = userDoc.id;

    // ✅ Riempie dati profilo
    usernameEl.textContent = user.username || "Utente";
    bioEl.textContent = user.bio || "";
    profilePic.src = user.photoURL || "/default-avatar.png";

    // ✅ Carica SOLO foto approvate
    const photosQuery = query(
      collection(db, "photos"),
      where("userId", "==", userId),
      where("status", "==", "Approvata ✅"),
      orderBy("createdAt", "desc"),
      limit(9)
    );

    const photosSnap = await getDocs(photosQuery);
    photosContainer.innerHTML = "";

    photosSnap.forEach((doc) => {
      const photo = doc.data();
      const div = document.createElement("div");
      div.className = "photo-card";
      div.innerHTML = `<img src="${photo.url}" alt="Foto utente" />`;
      photosContainer.appendChild(div);
    });

  } catch (err) {
    console.error("Errore profilo:", err);
    document.body.innerHTML = "<h2>Errore caricamento profilo</h2>";
  }
}