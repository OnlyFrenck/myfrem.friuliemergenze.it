import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // 🔥 Config Firebase
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

  // 🟢 DOM
  const fileInput = document.getElementById("inp-upl");
  const uploadBtn = document.getElementById("btn-upl");
  const statusMsg = document.getElementById("statusMsg");

  // 🔑 GitHub info
  const GITHUB_USER = "OnlyFrenck";
  const GITHUB_REPO = "Storage-MyFrEM";
  const GITHUB_BRANCH = "main";
  const GITHUB_TOKEN = "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";

  // 📌 Utility per aggiornare lo status
  function setStatus(message, type = "info") {
    if (!statusMsg) return;
    statusMsg.textContent = message;
    statusMsg.className = type; // CSS: .info .success .error
  }

  // 🚀 Upload
  uploadBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setStatus("⚠️ Devi fare login prima di caricare!", "error");
      return;
    }

    const file = fileInput?.files?.[0];
    if (!file) {
      setStatus("⚠️ Devi selezionare una foto prima di salvare!", "error");
      return;
    }

    try {
      setStatus("⏳ Caricamento in corso...");

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(",")[1];
          const path = `uploads/${user.uid}/${Date.now()}-${file.name}`;

          // 📤 Upload GitHub
          const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}`, {
            method: "PUT",
            headers: {
              "Authorization": `token ${GITHUB_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              message: `Upload ${file.name}`,
              content: base64,
              branch: GITHUB_BRANCH
            })
          });

          const data = await res.json();

          if (!res.ok || !data.content) {
            throw new Error(data.message || "Errore upload GitHub");
          }

          const fileUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;

          // 🗄️ Salvataggio Firestore
          await addDoc(collection(db, "photos"), {
            status: "pending",
            userId: user.uid,
            name: file.name,
            url: fileUrl,
            createdAt: serverTimestamp()
          });

          setStatus("✅ Foto caricata con successo!", "success");
          fileInput.value = ""; // reset input
        } catch (innerErr) {
          console.error("❌ Errore interno:", innerErr);
          setStatus("❌ Errore durante l'upload", "error");
        }
      };

      reader.readAsDataURL(file);

    } catch (err) {
      console.error("❌ Errore principale:", err);
      setStatus("❌ Errore durante il caricamento", "error");
    }
  });

});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  console.log("🚪 Logout in corso...");
  await auth.signOut();
  console.log("✅ Logout completato, redirect...");
  window.location.href = "/login/";
});