// ✅ Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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
const photosTableBody = document.getElementById("photosTableBody");
const statusMsg = document.getElementById("statusMsg");
const logoutBtn = document.getElementById("logoutBtn");

// 🚪 Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/login";
});

// 📌 Messaggi di stato
function setStatus(message, type = "info") {
  statusMsg.textContent = message;
  statusMsg.className = type;
}

// 🔑 Controllo autenticazione + ruolo staff
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  const userSnap = await getDocs(query(collection(db, "users"), where("__name__", "==", user.uid)));
  if (userSnap.empty || userSnap.docs[0].data().role !== "staff") {
    alert("❌ Accesso negato: non sei staff!");
    window.location.href = "/dashboard";
    return;
  }

  // ✅ Carica foto in attesa
  loadPendingPhotos();
});

// 📷 Carica tutte le foto pending
async function loadPendingPhotos() {
  try {
    const q = query(collection(db, "photos"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);

    photosTableBody.innerHTML = ""; // pulizia

    snapshot.forEach(docSnap => {
      const photo = docSnap.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><img src="${photo.url}" alt="${photo.name}" class="preview"></td>
        <td>${photo.name}</td>
        <td>${photo.userId}</td>
        <td>${photo.createdAt?.toDate().toLocaleString() || "-"}</td>
        <td>
          <button class="approve" data-id="${docSnap.id}">✅ Approva</button>
          <button class="reject" data-id="${docSnap.id}">❌ Rifiuta</button>
        </td>
      `;

      photosTableBody.appendChild(tr);
    });

    // Aggiungi event listener ai pulsanti
    document.querySelectorAll(".approve").forEach(btn => {
      btn.addEventListener("click", () => updatePhotoStatus(btn.dataset.id, "approved"));
    });
    document.querySelectorAll(".reject").forEach(btn => {
      btn.addEventListener("click", () => updatePhotoStatus(btn.dataset.id, "rejected"));
    });

  } catch (err) {
    console.error("❌ Errore caricamento foto:", err);
    setStatus("Errore durante il caricamento delle foto", "error");
  }
}

// 🔄 Funzione per aggiornare stato foto
async function updatePhotoStatus(photoId, status) {
  try {
    await updateDoc(doc(db, "photos", photoId), {
      status: status,
      reviewedAt: serverTimestamp()
    });
    setStatus(`✅ Foto ${status}`, "success");
    loadPendingPhotos(); // ricarica lista
  } catch (err) {
    console.error("❌ Errore aggiornamento stato:", err);
    setStatus("Errore durante l'aggiornamento", "error");
  }
}