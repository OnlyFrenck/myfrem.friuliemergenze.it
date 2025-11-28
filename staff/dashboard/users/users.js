import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

const usersTableBody = document.querySelector("#usersTable tbody");
const logoutBtn = document.getElementById("logoutBtn");

// Logout
logoutBtn.addEventListener("click", async () => {
  console.log("🚪 Logout in corso...");
  await auth.signOut();
  console.log("✅ Logout completato, redirect...");
  window.location.href = "/login/";
});

// Verifica login e ruolo staff
onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "/login/";
    return;
  }

  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef); // <-- usa getDoc
  const userData = userDocSnap.data();

  if (!userData || userData.role !== "staff") {
    messageBox.textContent("Accesso negato: solo staff");
    window.location.href = "/login/";
    return;
  }

  loadUsers();
});

async function loadUsers() {
  usersTableBody.innerHTML = "";
  const usersSnap = await getDocs(collection(db, "users"));

  usersSnap.forEach(docSnap => {
    const u = docSnap.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${u.name || ""}</td>
      <td>${u.email || ""}</td>
      <td>${u.username || ""}</td>
      <td>${u.role || "user"}</td>
      <td>${u.status || "attivo"}</td>
      <td>
        <button class="promote">Promuovi</button>
        <button class="suspend">Sospendi</button>
        <button class="delete">Elimina</button>
      </td>
    `;

    // Eventi pulsanti
    tr.querySelector(".promote").addEventListener("click", () => updateRole(docSnap.id, u.role));
    tr.querySelector(".suspend").addEventListener("click", () => updateStatus(docSnap.id, u.status));
    tr.querySelector(".delete").addEventListener("click", () => deleteUser(docSnap.id));

    usersTableBody.appendChild(tr);
  });
}

async function updateRole(userId, currentRole) {
  const newRole = currentRole === "staff" ? "user" : "staff";
  await updateDoc(doc(db, "users", userId), { role: newRole });
  loadUsers();
}

async function updateStatus(userId, currentStatus) {
  const newStatus = currentStatus === "attivo" ? "sospeso" : "attivo";
  await updateDoc(doc(db, "users", userId), { status: newStatus });
  loadUsers();
}

async function deleteUser(userId) {
  if (confirm("Sei sicuro di voler eliminare questo utente?")) {
    await deleteDoc(doc(db, "users", userId));
    loadUsers();
  }
}