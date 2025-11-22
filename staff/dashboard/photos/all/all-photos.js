import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  // Verifica ruolo staff
  const userDocRef = collection(db, "users");
  const userSnap = await getDocs(query(userDocRef));

  const me = userSnap.docs.find(d => d.id === user.uid);

  if (!me || me.data().role !== "staff") {
    alert("Accesso negato");
    window.location.href = "/dashboard";
    return;
  }

  loadAllPhotos();
});

async function loadAllPhotos() {
  try {
    const q = query(
      collection(db, "photos"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      tbody.innerHTML = `<tr><td colspan="5">Nessuna foto trovata</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    snap.forEach(doc => {
      const p = doc.data();
      const statusColor =
        p.status?.includes("Approvata") ? "green" :
        p.status?.includes("Rifiutata") ? "red" : "orange";

      tbody.innerHTML += `
        <tr>
          <td><img src="${p.thumbUrl || p.imageUrl}" class="preview"></td>
          <td>${p.title || "-"}</td>
          <td>${p.userName || p.userId}</td>
          <td style="color:${statusColor}">${p.status}</td>
          <td>${p.createdAt?.toDate().toLocaleString() || "-"}</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Errore caricamento foto staff:", err);
    tbody.innerHTML = `<tr><td colspan="5">Errore caricamento</td></tr>`;
  }
}

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/login";
});