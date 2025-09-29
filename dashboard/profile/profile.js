// Config Firebase (stesso che hai già in app.js)
const firebaseConfig = {
  apiKey: "AIzaSyDWjMMe_yOtuVheeCPOwKiG8_-l35qdyKY",
  authDomain: "myfrem-friuliemergenze.firebaseapp.com",
  projectId: "myfrem-friuliemergenze",
  storageBucket: "myfrem-friuliemergenze.appspot.com",
  messagingSenderId: "604175974671",
  appId: "1:604175974671:web:cb02a60611513eaf377e7a"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const form = document.getElementById("profileForm");
const statusMsg = document.getElementById("statusMsg");
const logoutBtn = document.getElementById("logoutBtn");

// --- Carica dati utente ---
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "/login/";
    return;
  }

  const docRef = db.collection("users").doc(user.uid);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    const data = docSnap.data();
    document.getElementById("name").value = data.name || "";
    document.getElementById("surname").value = data.surname || "";
    document.getElementById("username").value = data.username || "";
    document.getElementById("email").value = data.email || "";
  } else {
    statusMsg.textContent = "⚠️ Nessun profilo trovato!";
  }
});

// --- Salva modifiche ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  try {
    await db.collection("users").doc(user.uid).update({
      name: document.getElementById("name").value,
      surname: document.getElementById("surname").value,
      username: document.getElementById("username").value
    });

    statusMsg.textContent = "✅ Profilo aggiornato!";
  } catch (err) {
    console.error("❌ Errore aggiornamento profilo:", err);
    statusMsg.textContent = "❌ Errore: " + err.message;
  }
});

// --- Logout ---
document.getElementById("logoutBtn").addEventListener("click", async () => {
  console.log("🚪 Logout in corso...");
  await auth.signOut();
  console.log("✅ Logout completato, redirect...");
  window.location.href = "/login/";
});