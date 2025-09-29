// --- Config Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyDWjMMe_yOtuVheeCPOwKiG8_-l35qdyKY",
  authDomain: "myfrem-friuliemergenze.firebaseapp.com",
  projectId: "myfrem-friuliemergenze",
  storageBucket: "myfrem-friuliemergenze.firebasestorage.app",
  messagingSenderId: "604175974671",
  appId: "1:604175974671:web:cb02a60611513eaf377e7a"
};

// --- Init Firebase ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log("👉 Inizializzo Firebase...");

// --- Elementi UI ---
const userNameEl = document.getElementById("userName");
const totalPhotosEl = document.getElementById("totalPhotos");
const approvedPhotosEl = document.getElementById("approvedPhotos");
const pendingPhotosEl = document.getElementById("pendingPhotos");
const rejectedPhotosEl = document.getElementById("rejectedPhotos");
const activityListEl = document.getElementById("activityList");

// --- Controllo autenticazione ---
auth.onAuthStateChanged(async (user) => {
  console.log("👀 onAuthStateChanged triggered, user:", user);

  if (!user) {
    console.warn("⚠️ Nessun utente loggato, redirect al login...");
    window.location.href = "/login/";
    return;
  }

  try {
    // 📂 Recupera dati profilo
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log("✅ Dati utente trovati:", userData);
      userNameEl.textContent = userData.name + ` (${userData.username})` || "Utente";
    } else {
      console.warn("⚠️ Nessun documento utente trovato in Firestore!");
    }

    // 📸 Recupera ultime foto
    const photosSnap = await db.collection("photos")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    let total = 0, approved = 0, pending = 0, rejected = 0;
    activityListEl.innerHTML = "";

    photosSnap.forEach(doc => {
      const photo = doc.data();
      total++;
      if (photo.status === "Foto accettata 👍") approved++;
      if (photo.status === "Foto in attesa di approvazione ⌛") pending++;
      if (photo.status === "Foto rifiutata 🚫") rejected++;

      const li = document.createElement("li");
      li.innerHTML = `<p>📸 Foto caricata il ${photo.createdAt?.toDate().toLocaleString()} - Stato: <b>${photo.status}</b></p>`;
      activityListEl.appendChild(li);
    });

    totalPhotosEl.textContent = total;
    approvedPhotosEl.textContent = approved;
    pendingPhotosEl.textContent = pending;
    rejectedPhotosEl.textContent = rejected;

    if (total === 0) {
      activityListEl.innerHTML = "<li>Nessuna attività recente.</li>";
    }
  } catch (err) {
    console.error("❌ Errore durante il recupero dati Firestore:", err);
  }
});

// --- Logout ---
document.getElementById("logoutBtn").addEventListener("click", async () => {
  console.log("🚪 Logout in corso...");
  await auth.signOut();
  console.log("✅ Logout completato, redirect...");
  window.location.href = "/login/";
});