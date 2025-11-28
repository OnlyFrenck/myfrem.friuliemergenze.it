// ==========================
// 🔥 Firebase Config
// ==========================
const firebaseConfig = {
  apiKey: "AIzaSyBXD0zGs_kzfWYugVIj8rrZX91YlwBjOJU",
  authDomain: "friuli-emergenze.firebaseapp.com",
  projectId: "friuli-emergenze",
  storageBucket: "friuli-emergenze.firebasestorage.app",
  messagingSenderId: "362899702838",
  appId: "1:362899702838:web:da96f62189ef1fa2010497",
  measurementId: "G-THNJG888RE"
};

// ==========================
// ✅ Init Firebase
// ==========================
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const clg = console.log;
const crr = console.error;

clg("✅ Firebase inizializzato");


// ==========================
// 🟢 LOGIN EMAIL o USERNAME
// ==========================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identifier = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    let emailToUse = identifier;

    try {
      if (!identifier.includes("@")) {
        clg("🔍 Cerco username:", identifier);

        const snap = await db
          .collection("users")
          .where("username", "==", identifier)
          .limit(1)
          .get();

        if (snap.empty) {
          messageBox.textContent("❌ Username non trovato");
          return;
        }

        emailToUse = snap.docs[0].data().email;
        clg("✅ Username risolto in email:", emailToUse);
      }

      const cred = await auth.signInWithEmailAndPassword(emailToUse, password);
      const user = cred.user;

      clg("✅ Login riuscito:", user.uid);

      const token = await user.getIdToken();
      localStorage.setItem("userToken", token);

      const userDoc = await db.collection("users").doc(user.uid).get();

      if (!userDoc.exists) {
        messageBox.textContent("Profilo non trovato");
        return;
      }

      const userData = userDoc.data();

      if (userData.role === "staff") {
        window.location.href = "/staff";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      crr("❌ Errore login:", err);
      messageBox.textContent("Errore login: " + err.message);
    }
  });
}


// ==========================
// 🔵 LOGIN CON GOOGLE
// ==========================
const googleBtn = document.getElementById("googleLoginBtn");

if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();

      const result = await auth.signInWithPopup(provider);
      const user = result.user;

      clg("✅ Login Google:", user.uid);

      const userRef = db.collection("users").doc(user.uid);
      const snap = await userRef.get();

      if (!snap.exists) {
        await userRef.set({
          email: user.email,
          name: user.displayName || "",
          role: "user",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      const finalDoc = await userRef.get();
      const data = finalDoc.data();

      if (data.role === "staff") {
        window.location.href = "/staff";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      crr("❌ Errore Google:", err);
      messageBox.textContent("Errore Google: " + err.message);
    }
  });
}


// ==========================
// 🟣 REGISTRAZIONE
// ==========================
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
      const existing = await db
        .collection("users")
        .where("username", "==", username)
        .limit(1)
        .get();

      if (!existing.empty) {
        messageBox.textContent("❌ Username già in uso");
        return;
      }

      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const user = cred.user;

      clg("✅ Registrazione OK:", user.uid);

      await user.sendEmailVerification({
        url: "https://myfrem.friuliemergenze.it/login/"
      });

      await db.collection("users").doc(user.uid).set({
        email,
        name,
        surname,
        username,
        role: "user",
        emailVerified: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      await auth.signOut();

      window.location.href = "/login/signup/verify-email/";

    } catch (err) {
      crr("❌ Errore registrazione:", err);
      messageBox.textContent("Errore registrazione: " + err.message);
    }
  });
}


// ==========================
// 🔁 RESET PASSWORD
// ==========================
const resetForm = document.getElementById("resetForm");

if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target["resetEmail"].value;

    try {
      await auth.sendPasswordResetEmail(email);
      messageBox.textContent("📩 Email di reset inviata!");
    } catch (err) {
      crr("❌ Reset error:", err);
      messageBox.textContent("Errore reset: " + err.message);
    }
  });
}


// ==========================
// 👀 SESSIONE UTENTE
// ==========================
auth.onAuthStateChanged(async (user) => {
  if (user) {
    clg("👤 Utente loggato:", user.uid);
    const token = await user.getIdToken();
    localStorage.setItem("userToken", token);
  } else {
    clg("⚠️ Nessun utente");
  }
});


// ==========================
// 👁 TOGGLE PASSWORD
// ==========================
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