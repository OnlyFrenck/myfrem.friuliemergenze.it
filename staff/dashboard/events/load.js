import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, getDocs, updateDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// 🔥 Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBXD0zGs_kzfWYugVIj8rrZX91YlwBjOJU",
  authDomain: "friuli-emergenze.firebaseapp.com",
  projectId: "friuli-emergenze",
  storageBucket: "friuli-emergenze.firebasestorage.app",
  messagingSenderId: "362899702838",
  appId: "1:362899702838:web:da96f62189ef1fa2010497"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Logout
document.getElementById("logoutBtn").onclick = () => signOut(auth);

// DOM
const eventsList = document.getElementById("eventsList");
const statusMsg = document.getElementById("statusMsg");

// Carica eventi
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  try {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      eventsList.innerHTML = "<p class='info'>Non ci sono richieste di eventi al momento.</p>";
      return;
    }

    eventsList.innerHTML = "";

    snap.forEach(docSnap => {
      const e = docSnap.data();
      const div = document.createElement("div");
      div.className = "event-card";

      div.innerHTML = `
        <h3>${e.title}</h3>
        <p><strong>📍 Luogo:</strong> ${e.location}</p>
        <p>${e.description.length > 150 ? e.description.slice(0,150)+"..." : e.description}</p>
        <span class="status ${e.status === "In revisione..." ? "revision" :
                             e.status === "Approvato" ? "approved" :
                             e.status === "Organizzato" ? "organized" : "rejected"}">
          ${e.status}
        </span>
        <div class="actions">
          <button class="btn-action btn-organized">Contrassegna come Organizzato</button>
          <button class="btn-action btn-approve">Approva</button>
          <button class="btn-action btn-reject">Rifiuta</button>
          <button class="btn-action btn-view" onclick="window.open('/events/detail/?id=${docSnap.id}', '_blank')">Visualizza Evento</button>
        </div>
      `;

      if (e.status === "Organizzato") {
        div.querySelector(".btn-organized").disabled = true;
        div.querySelector(".btn-approve").disabled = true;
        div.querySelector(".btn-reject").disabled = true;
      }

      if (e.status === "Approvato") {
        div.querySelector(".btn-approve").disabled = true;
        div.querySelector(".btn-reject").disabled = true;
      }

      if (e.status === "Rifiutato") {
        div.querySelector(".btn-approve").disabled = true;
        div.querySelector(".btn-reject").disabled = true;
        div.querySelector(".btn-organized").disabled = true;
      }

      // Eventi pulsanti
        div.querySelector(".btn-organized").onclick = async () => {
          await updateDoc(doc(db, "events", docSnap.id), { status: "Organizzato" })
          div.querySelector(".status").textContent = "Organizzato";
          div.querySelector(".status").className = "status organized";
        };

      div.querySelector(".btn-approve").onclick = async () => {
        await updateDoc(doc(db, "events", docSnap.id), { status: "Approvato" });
        div.querySelector(".status").textContent = "Approvato";
        div.querySelector(".status").className = "status approved";
      };

      div.querySelector(".btn-reject").onclick = async () => {
        await updateDoc(doc(db, "events", docSnap.id), { status: "Rifiutato" });
        div.querySelector(".status").textContent = "Rifiutato";
        div.querySelector(".status").className = "status rejected";
      };

      eventsList.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Errore nel caricamento degli eventi.";
  }
});