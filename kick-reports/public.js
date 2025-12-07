import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Config Firebase (stesso tuo)
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
const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const reportId = urlParams.get('id');
const reportBox = document.getElementById("publicReportBox");

async function loadPublicReport() {
  if (!reportId) {
    reportBox.innerHTML = "<p>❌ Report non trovato.</p>";
    return;
  }

  const docRef = doc(db, "expulsionReports", reportId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    reportBox.innerHTML = "<p>❌ Report inesistente.</p>";
    return;
  }

  const data = docSnap.data();
  reportBox.innerHTML = `
    <h2>📄 Report di Espulsione</h2>
    <h3>Utente Espulso:</h3>
    <p>${data.userName || "—"}</p>

    <h3>Numero di contatto utente:</h3>
    <p>${data.userNumber || "—"}</p>

    <h3>Staff che ha segnalato:</h3>
    <p>${data.reportedBy}</p>

    <h3>Motivo:</h3>
    <p>${data.reason || "—"}</p>

    <h3>Note aggiuntive:</h3>
    <p>${data.notes || "Nessuna"}</p>

    <h3>Data espulsione:</h3>
    <p>${data.expulsionDate || "—"}</p>

    <h3>Data creazione report:</h3>
    <p>${data.createdAt?.toDate().toLocaleString() || "—"}</p>
  `;
}

loadPublicReport();