// public/upload.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
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

  const fileInput = document.getElementById("inp-upl");
  const uploadBtn = document.getElementById("btn-upl");
  const statusMsg = document.getElementById("statusMsg");

  function setStatus(message, type = "info") {
    if (!statusMsg) return;
    statusMsg.textContent = message;
    statusMsg.className = type;
  }

  uploadBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setStatus("⚠️ Devi fare login prima di caricare!", "error");
      return;
    }

    const file = fileInput?.files?.[0];
    if (!file) {
      setStatus("⚠️ Seleziona una foto prima di salvare!", "error");
      return;
    }

    setStatus("⏳ Caricamento in corso...");

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(",")[1];
        const path = `uploads/${user.uid}/${Date.now()}-${file.name}`;

        const res = await fetch("/netlify/functions/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, content: base64 })
        });

        if (!res.ok) throw new Error("Errore Netlify Function");
        const data = await res.json();

        if (!data.url) throw new Error("Nessun URL restituito");

        await addDoc(collection(db, "photos"), {
          status: "pending",
          userId: user.uid,
          name: file.name,
          url: data.url,
          createdAt: serverTimestamp()
        });

        setStatus("✅ Foto caricata con successo!", "success");
        fileInput.value = "";
      } catch (err) {
        console.error("❌ Errore:", err);
        setStatus(`❌ Errore: ${err.message}`, "error");
      }
    };
    reader.readAsDataURL(file);
  });
});