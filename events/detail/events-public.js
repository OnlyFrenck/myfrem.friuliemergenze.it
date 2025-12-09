import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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
const db = getFirestore(app);

// DOM
const eventsList = document.getElementById("eventsList");
const statusMsg = document.getElementById("statusMsg");
const titleEvent = document.getElementById("titleEvent");

// Carica tutti gli eventi pubblici
async function loadPublicEvents() {
  try {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      eventsList.innerHTML = "<p class='info'>Questo ID evento non esiste nel database. Controlla di aver selezionato l'evento giusto.</p>";
      return;
    }

    eventsList.innerHTML = "";

    snap.forEach(doc => {
      const e = doc.data();
      eventId.textContent = `📅 Evento: ${e.title}`;
      titleEvent.textContent = `Evento ${doc.id} | MyFrEM - La migliore in Friuli-Venezia Giulia nel caricamento foto inerenti l'emergenza`;
      const div = document.createElement("div");
      div.className = "event-card";
      const statusP = document.getElementById("status");

      div.innerHTML = `
        <h3>${e.title}</h3>
        <h4><b>🆔 ID Evento:</b></h4>
        <p>${doc.id}</p>
        <h4><b>📍 Luogo:</b></h4>
        <p>${e.location || "Non specificato."}</p>

        <h4><b>📝 Descrizione:</b></h4>
        <p>${e.description || "Non specificata."}</p>

        <h4><b>📲 Stato di revisione staff:</b></h4>
        <p class="status null">${e.status || "Non trovato."}</p>

        <h4><b>📅 Data creazione richiesta:</b></h4>
        <p>${e.createdAt?.toDate().toLocaleString() || "Non trovata."}</p>

        <h4><b>😁 Promulgato da:</b></h4>
        <p>${e.userId || "Friuli Emergenze"}</p>
      `;

      eventsList.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Errore nel caricamento degli eventi.";
  }
}

// Avvio caricamento
loadPublicEvents();