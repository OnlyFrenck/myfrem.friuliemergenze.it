import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc
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

const tbody = document.getElementById("photosTbody");

let usersMap = {};

// -------------------- AUTH STAFF --------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "staff") {
    alert("Accesso negato");
    window.location.href = "/dashboard";
    return;
  }

  await loadUsersMap();
  loadAllPhotos();
});

// -------------------- LOAD USERS --------------------
async function loadUsersMap() {
  const snap = await getDocs(collection(db, "users"));
  snap.forEach(docSnap => {
    usersMap[docSnap.id] = docSnap.data().username || "Sconosciuto";
  });
}

// -------------------- LOAD PHOTOS --------------------
async function loadAllPhotos() {
  try {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      tbody.innerHTML = `<tr><td colspan="6">Nessuna foto trovata</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    snap.forEach((docSnap) => {
      const p = docSnap.data();
      const id = docSnap.id;

      const statusColor =
        p.status?.includes("Approvata") ? "green" :
        p.status?.includes("Rifiutata") ? "red" : "orange";

      let linkBox = "-";

      if (p.status?.includes("Approvata")) {
        linkBox = `
          <input
            type="text"
            placeholder="Link del mezzo..."
            id="link-${id}"
            value="${p.vehicleLink || ""}"
            style="width: 180px; padding: 6px; border-radius:6px;"
          >
          <button onclick="saveVehicleLink('${id}')">💾</button>
        `;
      }

      tbody.innerHTML += `
        <tr>
          <td><img src="${p.url}" class="preview"></td>
          <td>${p.title || "-"}</td>
          <td>${usersMap[p.userId] || "Sconosciuto"}</td>
          <td style="color:${statusColor}">${p.status}</td>
          <td>${p.createdAt?.toDate().toLocaleString() || "-"}</td>
          <td>${linkBox}</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Errore caricamento foto staff:", err);
    tbody.innerHTML = `<tr><td colspan="6">Errore caricamento</td></tr>`;
  }
}

// -------------------- SAVE LINK --------------------
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

    alert("✅ Link del mezzo salvato!");
  } catch (err) {
    console.error("Errore salvataggio link:", err);
    alert("Errore salvataggio link");
  }
};

// -------------------- LOGOUT --------------------
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/login";
});