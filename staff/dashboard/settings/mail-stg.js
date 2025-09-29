import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

const preferencesForm = document.getElementById("preferencesForm");
const emailNotificationsCheckbox = document.getElementById("emailNotifications");
const preferencesStatusMsg = document.getElementById("preferencesStatusMsg");

// Carica preferenze utente
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      emailNotificationsCheckbox.checked = !!data.emailNotifications;
    }
  }
});

// Salva preferenze su Firestore
preferencesForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) {
    preferencesStatusMsg.textContent = "⚠️ Devi fare login!";
    return;
  }

  try {
    await setDoc(doc(db, "users", user.uid), {
      emailNotifications: emailNotificationsCheckbox.checked
    }, { merge: true });

    preferencesStatusMsg.textContent = "✅ Preferenze salvate!";
    preferencesStatusMsg.className = "success";
  } catch (err) {
    console.error(err);
    preferencesStatusMsg.textContent = "❌ Errore nel salvare preferenze";
    preferencesStatusMsg.className = "error";
  }
});