const clg = console.log;
const crr = console.error;

clg("👉 Inizializzo Firebase...");

// ✅ Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBXD0zGs_kzfWYugVIj8rrZX91YlwBjOJU",
  authDomain: "friuli-emergenze.firebaseapp.com",
  projectId: "friuli-emergenze",
  storageBucket: "friuli-emergenze.firebasestorage.app",
  messagingSenderId: "362899702838",
  appId: "1:362899702838:web:da96f62189ef1fa2010497",
  measurementId: "G-THNJG888RE"
};

// ✅ Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

clg("✅ Firebase inizializzato con successo.");

// ─────────────────────────────────────────────────────────────
// Helper: controlla se è un'email
function isEmail(value) {
  return value.includes("@");
}

// ─── LOGIN (EMAIL O USERNAME) ────────────────────────────────
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const input = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      let email = input;

      // 🔍 Se NON è email → cerca lo username in Firestore
      if (!isEmail(input)) {
        const snap = await db
          .collection("users")
          .where("username", "==", input)
          .limit(1)
          .get();

        if (snap.empty) {
          alert("❌ Username non trovato");
          return;
        }

        const userData = snap.docs[0].data();
        email = userData.email;
      }

      // 🔐 Login Firebase
      const userCred = await auth.signInWithEmailAndPassword(email, password);
      const user = userCred.user;
      clg("✅ Login riuscito:", user.uid);

      // token per sessione
      const token = await user.getIdToken();
      localStorage.setItem("userToken", token);

      // carica profilo
      const userDoc = await db.collection("users").doc(user.uid).get();

      if (!userDoc.exists) {
        crr("❌ Nessun documento trovato per l’utente!");
        alert("Errore: il tuo account non ha un profilo associato.");
        return;
      }

      const userData = userDoc.data();
      clg("ℹ️ Dati utente:", userData);

      // redirect per ruolo
      if (userData.role === "staff") {
        window.location.href = "/staff";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      crr("❌ Errore login:", err);
      alert("Errore login: " + err.message);
    }
  });
}

// ─── REGISTRAZIONE ────────────────────────────────────────────
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
      // 🚫 Controlla username duplicato
      const userCheck = await db
        .collection("users")
        .where("username", "==", username)
        .limit(1)
        .get();

      if (!userCheck.empty) {
        alert("❌ Username già in uso");
        return;
      }

      const userCred = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCred.user;

      clg("✅ Registrazione riuscita:", user.uid);

      await db.collection("users").doc(user.uid).set({
        email,
        name,
        surname,
        username,
        role: "user",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      const token = await user.getIdToken();
      localStorage.setItem("userToken", token);

      window.location.href = "/login/";

    } catch (err) {
      crr("❌ Errore registrazione:", err);
      alert("Errore registrazione: " + err.message);
    }
  });
}

// ─── RESET PASSWORD ───────────────────────────────────────────
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

// ─── SESSIONE ─────────────────────────────────────────────────
auth.onAuthStateChanged(async (user) => {
  if (user) {
    clg("👀 Utente loggato:", user.uid);
    const token = await user.getIdToken();
    localStorage.setItem("userToken", token);
  } else {
    clg("⚠️ Nessun utente loggato");
  }
});

// ─── TOGGLE PASSWORD ─────────────────────────────────────────
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);

  if (input.type === "password") {
    input.type = "text";
    button.textContent = "🚫";
  } else {
    input.type = "password";
    button.textContent = "👁";
  }
}