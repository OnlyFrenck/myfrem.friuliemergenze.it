import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// 🔥 Firebase config
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

const logsTableBody = document.getElementById("logsTableBody");
const statusMsg = document.getElementById("statusMsg");
const logoutBtn = document.getElementById("logoutBtn");

// ✅ Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/login";
});

// ✅ Helper status
function setStatus(msg) {
  if (!statusMsg) return;
  statusMsg.textContent = msg;
}

let usersMap = {};

// ✅ Auth + ruolo staff
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "staff") {
    window.location.href = "/dashboard";
    return;
  }

  await loadUsersMap();
  loadLogs();
});

// ✅ Mappa UID → username
async function loadUsersMap() {
  const snap = await getDocs(collection(db, "users"));
  snap.forEach((d) => {
    usersMap[d.id] = d.data().username || "Sconosciuto";
  });
}

// ✅ Carica i logs
async function loadLogs() {
  try {
    setStatus("⏳ Caricamento log...");

    const q = query(
      collection(db, "staff_logs"),
      orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(q);
    logsTableBody.innerHTML = "";

    if (snapshot.empty) {
      setStatus("✅ Nessun log disponibile");
      return;
    }

    snapshot.forEach((docSnap) => {
      const log = docSnap.data();

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${log.action || "-"}</td>
        <td>${log.photoId || "-"}</td>
        <td>${usersMap[log.staffId] || "Staff"}</td>
        <td>${log.staffEmail || "-"}</td>
        <td>${log.timestamp?.toDate().toLocaleString() || "-"}</td>
      `;
      logsTableBody.appendChild(tr);
    });

    setStatus(`✅ ${snapshot.size} log caricati`);

  } catch (err) {
    console.error("Errore caricamento log:", err);
    setStatus("❌ Errore caricamento log");
  }
}