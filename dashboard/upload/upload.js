// upload.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

// DOM
const fileInput = document.getElementById("inp-upl");
const uploadBtn = document.getElementById("btn-upl");
const statusMsg = document.getElementById("statusMsg");

// GitHub info
const GITHUB_USER = "OnlyFrenck";
const GITHUB_REPO = "Storage-MyFrEM";
const GITHUB_BRANCH = "main";

function setStatus(message, type="info") {
  statusMsg.textContent = message;
  statusMsg.className = type;
}

uploadBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return setStatus("⚠️ Devi fare login!", "error");

  const file = fileInput?.files?.[0];
  if (!file) return setStatus("⚠️ Seleziona una foto!", "error");

  setStatus("⏳ Caricamento in corso...");

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const base64 = reader.result.split(",")[1];
      const path = `uploads/${user.uid}/${Date.now()}-${file.name}`;

      // POST repository_dispatch senza token nel client
      const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/dispatches`, {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          event_type: "upload-file",
          client_payload: { name: file.name, path, content: base64 }
        })
      });

      if (!res.ok) throw new Error("Errore GitHub workflow");

      // Salva su Firestore
      const fileUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
      await addDoc(collection(db, "photos"), {
        status: "pending",
        userId: user.uid,
        name: file.name,
        url: fileUrl,
        createdAt: serverTimestamp()
      });

      setStatus("✅ Foto caricata e salvata!", "success");
      fileInput.value = "";
    } catch(err) {
      console.error(err);
      setStatus("❌ Errore durante l'upload", "error");
    }
  };

  reader.readAsDataURL(file);

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await auth.signOut();
    window.location.href = "/login/";
  });
});