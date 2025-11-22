firebase.initializeApp({
  apiKey: "AIzaSyBXD0zGs_kzfWYugVIj8rrZX91YlwBjOJU",
  authDomain: "friuli-emergenze.firebaseapp.com",
  projectId: "friuli-emergenze",
  storageBucket: "friuli-emergenze.firebasestorage.app",
  messagingSenderId: "362899702838",
  appId: "1:362899702838:web:da96f62189ef1fa2010497",
  measurementId: "G-THNJG888RE"
});

const auth = firebase.auth();

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