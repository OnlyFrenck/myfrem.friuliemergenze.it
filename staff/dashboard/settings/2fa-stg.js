import { getAuth, RecaptchaVerifier, PhoneAuthProvider, multiFactor, PhoneMultiFactorGenerator } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const auth = getAuth();
const sendCodeBtn = document.getElementById("sendCodeBtn");
const verifyCodeBtn = document.getElementById("verifyCodeBtn");
const phoneInput = document.getElementById("phoneNumber");
const codeInput = document.getElementById("verificationCode");
const verificationSection = document.getElementById("verificationSection");
const twoFaStatusMsg = document.getElementById("twoFaStatusMsg");

// Setup reCAPTCHA invisibile
window.recaptchaVerifier = new RecaptchaVerifier('sendCodeBtn', {
  size: 'invisible'
}, auth);

// Invia SMS
sendCodeBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Effettua il login!");

  const phoneNumber = phoneInput.value;
  if (!phoneNumber) return alert("Inserisci il numero di telefono!");

  const session = await multiFactor(user).getSession();
  const phoneAuthProvider = new PhoneAuthProvider(auth);
  const verificationId = await phoneAuthProvider.verifyPhoneNumber({
    phoneNumber,
    session
  }, window.recaptchaVerifier);

  // Mostra input per codice
  verificationSection.style.display = "block";
  window.verificationId = verificationId;
  twoFaStatusMsg.textContent = "📩 Codice inviato!";
});

// Verifica codice SMS
verifyCodeBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  const code = codeInput.value;
  if (!code) return alert("Inserisci il codice!");

  const cred = PhoneAuthProvider.credential(window.verificationId, code);
  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

  try {
    await multiFactor(user).enroll(multiFactorAssertion, "Telefono 2FA");
    twoFaStatusMsg.textContent = "✅ 2FA abilitata con successo!";
  } catch (err) {
    console.error(err);
    twoFaStatusMsg.textContent = "❌ Errore: " + err.message;
  }
});