import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// CONFIG FIREBASE
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
const auth = getAuth(app);

// DOM
const profilePicPreview = document.getElementById("profilePicPreview");
const profilePicInput = document.getElementById("profilePicInput");
const savePicBtn = document.getElementById("savePicBtn");

const usernameInput = document.getElementById("usernameInput");
const userText = document.getElementById("userText");
const saveUsernameBtn = document.getElementById("saveUsernameBtn");

const bioInput = document.getElementById("bioInput");
const saveBioBtn = document.getElementById("saveBioBtn");

const logoutBtn = document.getElementById("logoutBtn");

let currentUserId = null;
let currentUser = null;

// 🔥 LOGIN CHECK
onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "/login/";
    return;
  }

  currentUserId = user.uid;
  currentUser = user;

  await loadUserData(user.uid);
});

// 🔎 LOAD USER DATA
async function loadUserData(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  profilePicPreview.src = data.photoURL || "/assets/profile/default-avatar.jpg";
  userText.innerHTML = `<b>${data.username}</b>` || "";
  bioInput.value = data.bio || "";
}

// 📸 PREVIEW IMMAGINE
profilePicInput.addEventListener("change", () => {
  const file = profilePicInput.files[0];
  if (file) {
    profilePicPreview.src = URL.createObjectURL(file);
  }
});

// 📤 UPLOAD IMMAGINE AL SERVER NODE.JS
savePicBtn.addEventListener("click", async () => {
  const file = profilePicInput.files[0];
  if (!file) return alert("Seleziona un'immagine!");

  const token = await currentUser.getIdToken();

  const formData = new FormData();
  formData.append("image", file);
  formData.append("uid", currentUserId);
  formData.append("token", token);

  const upload = await fetch("https://myfrem.friuliemergenze.it/server/upload-profile", {
    method: "POST",
    body: formData
  });

  const result = await upload.json();

  if (!result.success) {
    alert("Errore upload immagine: " + (result.error || ""));
    return;
  }

  // URL immagine
  const imageURL = result.url;

  // Salvo nel Firestore
  await updateDoc(doc(db, "users", currentUserId), {
    photoURL: imageURL
  });

  alert("Immagine aggiornata!");
});

// 📝 SALVA USERNAME
saveUsernameBtn.addEventListener("click", async () => {
  const newUsername = usernameInput.value.trim();
  if (newUsername.length < 3) return alert("Minimo 3 caratteri!");

  await updateDoc(doc(db, "users", currentUserId), {
    username: newUsername
  });

  alert("Username aggiornato!");
});

// 📝 SALVA BIO
saveBioBtn.addEventListener("click", async () => {
  const newBio = bioInput.value.trim();

  await updateDoc(doc(db, "users", currentUserId), {
    bio: newBio
  });

  alert("Biografia aggiornata!");
});

// 🚪 LOGOUT
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "/login/";
  });
});