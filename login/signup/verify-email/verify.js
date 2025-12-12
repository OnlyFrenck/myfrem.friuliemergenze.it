import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { firebaseConfig } from "../../../configFirebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const resendBtn = document.getElementById("resendBtn");
const statusMsg = document.getElementById("statusMsg");

// 🔁 Reinvia verifica
resendBtn.addEventListener("click", async () => {
  const user = auth.currentUser;

  if (!user) {
    statusMsg.textContent = "Per reinviare la mail, fai login.";
    return;
  }

  try {
    await user.sendEmailVerification();
    statusMsg.textContent = "✅ Email reinviata!";
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Errore nell'invio dell'email.";
  }
});