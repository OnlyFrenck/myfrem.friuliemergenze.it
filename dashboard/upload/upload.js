import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyDWjMMe_yOtuVheeCPOwKiG8_-l35qdyKY",
    authDomain: "myfrem-friuliemergenze.firebaseapp.com",
    projectId: "myfrem-friuliemergenze",
    storageBucket: "myfrem-friuliemergenze.appspot.com",
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

        // 🔹 Chiamata alla Netlify Function (niente token sul client!)
        const res = await fetch("/netlify/functions/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, content: base64 })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Errore Netlify Function");
        }

        // Salvo su Firestore con lo status "pending"
        await addDoc(collection(db, "photos"), {
          status: "pending",
          userId: user.uid,
          name: file.name,
          url: data.url, // ricevuto dal server
          createdAt: serverTimestamp()
        });

        setStatus("✅ Foto inviata al workflow!", "success");
        fileInput.value = "";
      } catch (err) {
        console.error("❌ Errore:", err);
        setStatus("❌ Errore upload: " + err.message, "error");
      }
    };

    reader.readAsDataURL(file);
  });
});