// app.js – gestione login/registrazione/reset password con Firebase
const doc = firebase.firestore.doc;
const getDoc = firebase.firestore.getDoc;

const clg = console.log;
const crr = console.error;

clg("👉 Inizializzo Firebase...");

// ✅ Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDWjMMe_yOtuVheeCPOwKiG8_-l35qdyKY",
  authDomain: "myfrem-friuliemergenze.firebaseapp.com",
  projectId: "myfrem-friuliemergenze",
  storageBucket: "myfrem-friuliemergenze.appspot.com",
  messagingSenderId: "604175974671",
  appId: "1:604175974671:web:cb02a60611513eaf377e7a"
};

// ✅ Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

clg("✅ Firebase inizializzato con successo.");

// --- LOGIN ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const userCred = await auth.signInWithEmailAndPassword(email, password);
      const user = userCred.user;
      clg("✅ Login riuscito:", user.uid);

      // token per sessione
      const token = await user.getIdToken();
      localStorage.setItem("userToken", token);

      // 📌 In v8 si usa db.collection().doc().get()
      const userDoc = await db.collection("users").doc(user.uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        clg("ℹ️ Dati utente:", userData);

        if (userData.role === "staff") {
          window.location.href = "/staff";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        crr("❌ Nessun documento trovato per l’utente!");
        alert("Errore: il tuo account non ha un profilo associato.");
      }
    } catch (err) {
      crr("❌ Errore login:", err);
      alert("Errore login: " + err.message);
    }
  });
}

// --- REGISTRAZIONE ---
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("registerName").value;
    const surname = document.getElementById("registerSurname").value;
    const email = document.getElementById("registerEmail").value;
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    try {
      const userCred = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCred.user;
      clg("✅ Registrazione riuscita:", user.uid);

      // 🔹 Crea doc utente
      await db.collection("users").doc(user.uid).set({
        email,
        name,
        surname,
        username,
        role: "user", // default
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      const token = await user.getIdToken();
      localStorage.setItem("userToken", token);

      // redirect
      window.location.href = "/login/";
    } catch (err) {
      crr("❌ Errore registrazione:", err);
      alert("Errore registrazione: " + err.message);
    }
  });
}

// --- RESET PASSWORD ---
const resetForm = document.getElementById("resetForm");
if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target["resetEmail"].value;

    try {
      await auth.sendPasswordResetEmail(email);
      alert("📩 Email di reset inviata!");
    } catch (err) {
      crr("❌ Errore reset password:", err);
      alert("Errore reset: " + err.message);
    }
  });
}

// --- SESSIONE (rimani loggato) ---
auth.onAuthStateChanged(async (user) => {
  if (user) {
    clg("👀 Utente loggato:", user.uid);
    const token = await user.getIdToken();
    localStorage.setItem("userToken", token);
  } else {
    clg("⚠️ Nessun utente loggato");
  }
});

// --- TOGGLE PASSWORD VISIBILITY ---
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  
  if (input.type === "password") {
    input.type = "text";
    button.textContent = "🚫"; // password visibile
  } else {
    input.type = "password";
    button.textContent = "👁"; // password nascosta
  }
}