import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
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

const fileInput = document.getElementById("inp-upl");
const uploadBtn = document.getElementById("btn-upl");
const statusMsg = document.getElementById("statusMsg");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const fileNameSpan = document.getElementById("file-name");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    fileNameSpan.textContent = `✅ ${fileInput.files[0].name}`;
  } else {
    fileNameSpan.textContent = "Nessun file";
  }
});

function setStatus(msg) {
  statusMsg.textContent = msg;
}

uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (!currentUser) {
    setStatus("❌ Devi essere loggato");
    return;
  }

  const file = fileInput.files[0];
  if (!file) {
    setStatus("❌ Seleziona una foto");
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);

  setStatus("⏳ Preparazione upload...");
  progressBar.style.display = "block";
  progressBar.value = 0;

  reader.onload = () => {
    const base64 = reader.result.split(",")[1];
    const path = `uploads/${currentUser.uid}/${Date.now()}-${file.name}`;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        progressBar.value = percent;
        progressText.textContent = percent + "%";
      }
    };

    xhr.onload = async () => {
      try {
        const data = JSON.parse(xhr.responseText);

        if (!data.url) throw new Error("Upload fallito");

        await addDoc(collection(db, "photos"), {
          userId: currentUser.uid,
          name: file.name,
          url: data.url,
          createdAt: serverTimestamp()
        });

        setStatus("✅ Caricamento completato!");
        progressText.textContent = "Completato ✅";
        fileInput.value = "";
      } catch (err) {
        setStatus("❌ Errore: " + err.message);
      }
    };

    xhr.onerror = () => {
      setStatus("❌ Errore di rete");
    };

    xhr.send(JSON.stringify({ path, content: base64 }));
  };
});