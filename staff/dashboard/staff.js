// ✅ Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// 🔥 Config Firebase
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

// ✅ Riferimenti DOM
const totalUsersEl = document.getElementById("totalUsers");
const pendingPhotosEl = document.getElementById("pendingPhotos");
const approvedPhotosEl = document.getElementById("approvedPhotos");
const rejectedPhotosEl = document.getElementById("rejectedPhotos");
const totalEventsEl = document.getElementById("totalEvents");
const pendingEventsEl = document.getElementById("pendingEvents");
const approvedEventsEl = document.getElementById("approvedEvents");
const rejectedEventsEl = document.getElementById("rejectedEvents");
const organizedEventsEl = document.getElementById("organizedEvents");
const logoutBtn = document.getElementById("logoutBtn");

// 🚪 Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/login";
});

// 🔑 Controllo autenticazione + ruolo staff
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  // Verifica che sia staff
  const userDoc = await getDocs(
    query(collection(db, "users"), where("__name__", "==", user.uid))
  );

  if (userDoc.empty || userDoc.docs[0].data().role !== "staff") {
    alert("❌ Accesso negato: non sei staff!");
    window.location.href = "/dashboard";
    return;
  }

  // ✅ Se staff, carica le statistiche
  loadStats();
});

// 📊 Funzione per caricare statistiche
async function loadStats() {
  try {
    // 🔹 Utenti
    const usersSnap = await getDocs(collection(db, "users"));
    totalUsersEl.textContent = usersSnap.size;

    // 🔹 Foto pending
    const pendingSnap = await getDocs(
      query(collection(db, "photos"), where("status", "==", "Foto in attesa di approvazione ⌛"))
    );
    pendingPhotosEl.textContent = pendingSnap.size;

    // 🔹 Foto approvate
    const approvedSnap = await getDocs(
      query(collection(db, "photos"), where("status", "==", "Approvata ✅"))
    );
    approvedPhotosEl.textContent = approvedSnap.size;

    // 🔹 Foto rifiutate
    const rejectedSnap = await getDocs(
      query(collection(db, "photos"), where("status", "==", "Rifiutata ❌"))
    );
    rejectedPhotosEl.textContent = rejectedSnap.size;

    // 🔹 Eventi 
    const eventsSnap = await getDocs(collection(db, "events"));
    totalEventsEl.textContent = eventsSnap.size;

    // 🔹 Eventi pending
    const eventsPendingSnap = await getDocs(
      query(collection(db, "events"), where("status", "==", "In revisione..."))
    );
    pendingEventsEl.textContent = eventsPendingSnap.size;

    // 🔹 Eventi approvati
    const eventsApprovedSnap = await getDocs(
      query(collection(db, "events"), where("status", "==", "Approvato"))
    );
    approvedEventsEl.textContent = eventsApprovedSnap.size;

    // 🔹 Eventi rifiutati
    const eventsRejectedSnap = await getDocs(
      query(collection(db, "events"), where("status", "==", "Rifiutato"))
    );
    rejectedEventsEl.textContent = eventsRejectedSnap.size;

    // 🔹 Eventi organizzati
    const eventsOrganizedSnap = await getDocs(
      query(collection(db, "events"), where("status", "==", "Organizzato"))
    );

    organizedEventsEl.textContent = eventsOrganizedSnap.size;

  } catch (err) {
    console.error("❌ Errore caricamento statistiche:", err);
  }
}