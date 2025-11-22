const clg = console.log;
const crr = console.error;

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

clg("✅ Firebase inizializzato");

// --- LOGIN (EMAIL o USERNAME) ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identifier = document.getElementById("loginEmail").value; // ora può essere email o username
    const password = document.getElementById("loginPassword").value;

    let emailToUse = identifier;

    try {
      // 🔁 Se NON è una email, cerchiamo lo username
      if (!identifier.includes("@")) {
        clg("🔍 Cerco username:", identifier);

        const userSnap = await db
          .collection("users")
          .where("username", "==", identifier)
          .limit(1)
          .get();

        if (userSnap.empty) {
          alert("❌ Username non trovato");
          return;
        }

        const userData = userSnap.docs[0].data();
        emailToUse = userData.email;
        clg("✅ Username trovato, email:", emailToUse);
      }

      // ✅ Login con email vera
      const userCred = await auth.signInWithEmailAndPassword(emailToUse, password);
      const user = userCred.user;

      clg("✅ Login riuscito:", user.uid);

      const token = await user.getIdToken();
      localStorage.setItem("userToken", token);

      // Recupera ruolo
      const userDoc = await db.collection("users").doc(user.uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();

        if (userData.role === "staff") {
          window.location.href = "/staff";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        alert("Profilo utente non trovato.");
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
      // 🔍 Controllo username unico
      const existing = await db
        .collection("users")
        .where("username", "==", username)
        .limit(1)
        .get();

      if (!existing.empty) {
        alert("❌ Username già in uso");
        return;
      }

      // ✅ Crea utente
      const userCred = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCred.user;

      console.log("✅ Registrazione riuscita:", user.uid);

      // ✅ Invia email di verifica
      await user.sendEmailVerification({
        url: "https://myfrem.friuliemergenze.it/login/" // redirect dopo verifica
      });

      // ✅ Crea profilo su Firestore
      await db.collection("users").doc(user.uid).set({
        email,
        name,
        surname,
        username,
        role: "user",
        emailVerified: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // 🔒 Logout forzato finché non verifica mail
      await auth.signOut();

      // ✅ Vai alla pagina "controlla la tua email"
      window.location.href = "/login/signup/verify-email/";

    } catch (err) {
      console.error("❌ Errore registrazione:", err);
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


// --- SESSIONE ---
auth.onAuthStateChanged(async (user) => {
  if (user) {
    clg("👀 Utente loggato:", user.uid);
    const token = await user.getIdToken();
    localStorage.setItem("userToken", token);
  } else {
    clg("⚠️ Nessun utente loggato");
  }
});


// --- TOGGLE PASSWORD ---
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
