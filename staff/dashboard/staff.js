// ✅ Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

// ✅ Riferimenti DOM
const totalUsersEl = document.getElementById("totalUsers");
const pendingPhotosEl = document.getElementById("pendingPhotos");
const approvedPhotosEl = document.getElementById("approvedPhotos");
const rejectedPhotosEl = document.getElementById("rejectedPhotos");
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
      query(collection(db, "photos"), where("status", "==", "pending"))
    );
    pendingPhotosEl.textContent = pendingSnap.size;

    // 🔹 Foto approvate
    const approvedSnap = await getDocs(
      query(collection(db, "photos"), where("status", "==", "approved"))
    );
    approvedPhotosEl.textContent = approvedSnap.size;

    // 🔹 Foto rifiutate
    const rejectedSnap = await getDocs(
      query(collection(db, "photos"), where("status", "==", "rejected"))
    );
    rejectedPhotosEl.textContent = rejectedSnap.size;

  } catch (err) {
    console.error("❌ Errore caricamento statistiche:", err);
  }
}