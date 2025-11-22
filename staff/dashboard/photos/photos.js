// ✅ Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

// ✅ Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Elementi DOM
const photosTableBody = document.getElementById("photosTableBody");
const statusMsg = document.getElementById("statusMsg");
const logoutBtn = document.getElementById("logoutBtn");

// ✅ Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/login";
});

// ✅ Helper messaggi
function setStatus(message, type = "info") {
  if (!statusMsg) return;
  statusMsg.textContent = message;
  statusMsg.className = type;
}

// 🔐 Verifica auth + ruolo staff
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  console.log("👤 Utente loggato:", user.uid);

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("❌ Profilo utente non trovato");
      window.location.href = "/dashboard";
      return;
    }

    const role = userSnap.data().role;
    console.log("🎭 Ruolo:", role);

    if (role !== "staff") {
      alert("❌ Accesso negato: non sei staff");
      window.location.href = "/dashboard";
      return;
    }

    // ✅ Solo se è staff carichiamo le foto
    loadPendingPhotos();

  } catch (err) {
    console.error("❌ Errore verifica staff:", err);
    setStatus("Errore verifica permessi", "error");
  }
});

// 📷 Carica foto in stato 'pending'
async function loadPendingPhotos() {
  try {
    setStatus("⏳ Caricamento foto in corso...");

    const q = query(
      collection(db, "photos"),
      where("status", "==", "Foto in attesa di approvazione ⌛")
    );

    const snapshot = await getDocs(q);

    photosTableBody.innerHTML = "";

    if (snapshot.empty) {
      setStatus("✅ Nessuna foto da moderare");
      return;
    }

    snapshot.forEach((docSnap) => {
      const photo = docSnap.data();

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>
          <img src="${photo.url}" alt="${photo.name}" class="preview" />
        </td>
        <td>${photo.name || "-"}</td>
        td>${photo.title || "-"}</td>
        <td>${photo.description || "-"}</td>
        <td>${photo.userId || "-"}</td>
        <td>${photo.createdAt?.toDate().toLocaleString() || "-"}</td>
        <td>
          <button class="approve" data-id="${docSnap.id}">✅ Approva</button>
          <button class="reject" data-id="${docSnap.id}">❌ Rifiuta</button>
        </td>
      `;

      photosTableBody.appendChild(tr);
    });

    // ✅ Eventi bottoni
    document.querySelectorAll(".approve").forEach((btn) => {
      btn.addEventListener("click", () => {
        updatePhotoStatus(btn.dataset.id, "Approvata ✅");
      });
    });

    document.querySelectorAll(".reject").forEach((btn) => {
      btn.addEventListener("click", () => {
        updatePhotoStatus(btn.dataset.id, "Rifiutata ❌");
      });
    });

    setStatus(`📸 Caricate ${snapshot.size} foto da moderare`);

  } catch (err) {
    console.error("❌ Errore caricamento foto:", err);
    setStatus("Errore durante il caricamento delle foto", "error");
  }
}

// 🔄 Aggiorna stato foto
async function updatePhotoStatus(photoId, status) {
  try {
    setStatus("⏳ Aggiornamento in corso...");

    const ref = doc(db, "photos", photoId);
    await updateDoc(ref, {
      status: status,
      reviewedAt: serverTimestamp()
    });

    setStatus(`✅ Foto ${status}`);
    loadPendingPhotos();

  } catch (err) {
    console.error("❌ Errore aggiornamento stato:", err);
    setStatus("Errore durante l'aggiornamento", "error");
  }
}