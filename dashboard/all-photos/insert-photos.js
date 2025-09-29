import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// 🔥 Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDWjMMe_yOtuVheeCPOwKiG8_-l35qdyKY",
  authDomain: "myfrem-friuliemergenze.firebaseapp.com",
  projectId: "myfrem-friuliemergenze",
  storageBucket: "myfrem-friuliemergenze.firebasestorage.app",
  messagingSenderId: "604175974671",
  appId: "1:604175974671:web:cb02a60611513eaf377e7a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 DOM references
const photosContainer = document.getElementById("photosContainer");
const statusMsg = document.getElementById("statusMsg");

// 🟢 Controllo autenticazione
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login/";
  } else {
    loadAllPhotos(user.uid);
  }
});

// 📂 Carica tutte le foto dell'utente
async function loadAllPhotos(userId) {
  try {
    statusMsg.textContent = "⏳ Caricamento foto...";
    photosContainer.innerHTML = "";

    const photosQuery = query(
      collection(db, "photos"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(photosQuery);

    if (snapshot.empty) {
      photosContainer.innerHTML = "<p>Nessuna foto caricata.</p>";
      statusMsg.textContent = "";
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "photo-card";

      card.innerHTML = `
        <div class="photo-info">
          <img src="https://friuliemergenze.it/assets/logo.png" alt="Logo MyFrEM" class="photo-img"
          <h4>${data.name}</h4>
          <p>Stato: <span class="status ${data.status}">${data.status}</span></p>
          <p>Caricata: ${data.createdAt?.toDate().toLocaleString() || "–"}</p>
        </div>
      `;

      photosContainer.appendChild(card);
    });

    statusMsg.textContent = "";
  } catch (err) {
    console.error("❌ Errore caricamento foto:", err);
    statusMsg.textContent = "Errore durante il caricamento delle foto.";
  }
}

// --- Logout ---
document.getElementById("logoutBtn").addEventListener("click", async () => {
  console.log("🚪 Logout in corso...");
  await auth.signOut();
  console.log("✅ Logout completato, redirect...");
  window.location.href = "/login/";
});