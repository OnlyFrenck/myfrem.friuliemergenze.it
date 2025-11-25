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

console.log("✅ Script profilo caricato");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔎 Prendo UID dall'URL
const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

console.log("🔎 UID letto da URL:", userId);

// DOM
const profilePic = document.getElementById("profilePic");
const usernameEl = document.getElementById("username");
const bioEl = document.getElementById("bio");
const photosContainer = document.getElementById("userPhotos");

// Avvio
loadProfile();

async function loadProfile() {
  try {
    console.log("🚀 Inizio caricamento profilo...");

    if (!userId) {
      console.warn("⚠️ Nessun userId nell'URL");
      document.body.innerHTML = "<h2>Profilo non trovato (ID mancante)</h2>";
      return;
    }

    // 🔹 Carica utente
    console.log("📥 Fetch user doc:", userId);
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    console.log("📦 userSnap.exists():", userSnap.exists());

    if (!userSnap.exists()) {
      document.body.innerHTML = "<h2>Utente non trovato</h2>";
      return;
    }

    const user = userSnap.data();
    console.log("👤 Dati utente:", user);

    // Render profilo
    usernameEl.textContent = user.username || "Utente";
    bioEl.textContent = user.bio || "";
    profilePic.src = user.photoURL || "/default-avatar.png";

    // 🔹 Query foto
    console.log("🖼️ Avvio query foto pubbliche...");

    const photosQuery = query(
      collection(db, "photos"),
      where("userId", "==", userId),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(9)
    );

    const photosSnap = await getDocs(photosQuery);

    console.log("📸 Numero foto trovate:", photosSnap.size);

    photosContainer.innerHTML = "";

    photosSnap.forEach(doc => {
      const photo = doc.data();
      console.log("🧾 Foto:", photo);

      const div = document.createElement("div");
      div.className = "photo-card";
      div.innerHTML = `
        <img src="${photo.url}" alt="Foto utente" />
      `;
      photosContainer.appendChild(div);
    });

    console.log("✅ Profilo caricato con successo");

  } catch (err) {
    console.error("❌ ERRORE PROFILO:", err);
    document.body.innerHTML = "<h2>Errore caricamento profilo</h2>";
  }
}