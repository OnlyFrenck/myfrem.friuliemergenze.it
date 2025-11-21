import { getAuth, updatePassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

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

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut().then(() => window.location.href = "/login/");
});

// Cambio password
const changePasswordForm = document.getElementById("changePasswordForm");
const passwordStatusMsg = document.getElementById("passwordStatusMsg");

changePasswordForm.addEventListener("submit", async e => {
  e.preventDefault();
  const current = document.getElementById("currentPassword").value;
  const newP = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (newP !== confirm) {
    passwordStatusMsg.textContent = "❌ Le nuove password non coincidono!";
    passwordStatusMsg.className = "error";
    return;
  }

  try {
    const user = auth.currentUser;
    await updatePassword(user, newP);
    passwordStatusMsg.textContent = "✅ Password cambiata con successo!";
    passwordStatusMsg.className = "success";
    changePasswordForm.reset();
  } catch (err) {
    console.error(err);
    passwordStatusMsg.textContent = "❌ Errore nel cambiare password: " + err.message;
    passwordStatusMsg.className = "error";
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  console.log("🚪 Logout in corso...");
  await auth.signOut();
  console.log("✅ Logout completato, redirect...");
  window.location.href = "/login/";
});