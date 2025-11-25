import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc,
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

const photosTableBody = document.getElementById("photosTableBody");
const statusMsg = document.getElementById("statusMsg");
const logoutBtn = document.getElementById("logoutBtn");

let usersMap = {};

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/login";
});

// Helper messaggi
function setStatus(message, type = "info") {
  if (!statusMsg) return;
  statusMsg.textContent = message;
  statusMsg.className = type;
}

// Auth + check staff
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || userSnap.data().role !== "staff") {
      window.location.href = "/dashboard";
      return;
    }

    await loadUsersMap();
    loadAllPhotos();
  } catch (err) {
    console.error("Errore verifica staff:", err);
    setStatus("Errore verifica permessi", "error");
  }
});

// Mappa utenti
async function loadUsersMap() {
  const snap = await getDocs(collection(db, "users"));
  snap.forEach(docSnap => {
    usersMap[docSnap.id] = docSnap.data().username || "Sconosciuto";
  });
}

// Carica tutte le foto
async function loadAllPhotos() {
  try {
    setStatus("⏳ Caricamento tutte le foto...");

    const q = query(
      collection(db, "photos"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    photosTableBody.innerHTML = "";

    if (snapshot.empty) {
      setStatus("Nessuna foto trovata");
      return;
    }

    snapshot.forEach((docSnap) => {
      const photo = docSnap.data();
      const id = docSnap.id;

      const statusColor =
        photo.status?.includes("Approvata") ? "green" :
        photo.status?.includes("Rifiutata") ? "red" : "orange";

      let linkBox = "-";

      if (photo.status?.includes("Approvata")) {
        linkBox = `
          <input
            type="text"
            placeholder="Link mezzo..."
            id="link-${id}"
            value="${photo.vehicleLink || ""}"
            style="width:140px;padding:6px;border-radius:6px"
          />
          <button onclick="saveVehicleLink('${id}')">💾</button>
        `;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img src="${photo.url}" class="preview"/></td>
        <td>${photo.title || "-"}</td>
        <td>${usersMap[photo.userId] || "Sconosciuto"}</td>
        <td style="color:${statusColor}">${photo.status}</td>
        <td>${photo.createdAt?.toDate().toLocaleString() || "-"}</td>
        <td>${linkBox}</td>
      `;

      photosTableBody.appendChild(tr);
    });

    setStatus(`📸 Totale foto: ${snapshot.size}`);
  } catch (err) {
    console.error("Errore caricamento:", err);
    setStatus("Errore caricamento foto", "error");
  }
}

// ✅ Save link mezzo (senza log per ora)
window.saveVehicleLink = async (photoId) => {
  const input = document.getElementById(`link-${photoId}`);
  const link = input.value.trim();

  if (!link) {
    alert("Inserisci un link valido");
    return;
  }

  try {
    await updateDoc(doc(db, "photos", photoId), {
      vehicleLink: link
    });

    alert("✅ Link salvato");
  } catch (err) {
    console.error("Errore salvataggio:", err);
    alert("Errore salvataggio");
  }
};