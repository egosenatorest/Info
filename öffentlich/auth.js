const firebaseConfig = {
    apiKey: "AIzaSyDltAvZDU7bgo711i6S44tUtdHndFq9gNQ",
    authDomain: "elhabibvote.firebaseapp.com",
    projectId: "elhabibvote",
    storageBucket: "elhabibvote.firebasestorage.app",
    messagingSenderId: "310950217444",
    appId: "1:310950217444:web:4f47fc51cb96a8cb680ef1",
    measurementId: "G-FP2HVCGV5N"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function regShow() {
  document.getElementById("log").style.display = "none";
  document.getElementById("reg").style.display = "block";
}

function logShow() {
  document.getElementById("log").style.display = "block";
  document.getElementById("reg").style.display = "none";
}

function reg() {
  const name = document.getElementById("rn").value.trim();
  const passwort = document.getElementById("rpw").value;
  if (!name || !passwort) return;
  auth.createUserWithEmailAndPassword(name + "@habibo.vote", passwort)
    .then(() => alert("Erfolgreich registriert"))
    .catch(e => {
      if (e.code === 'auth/email-already-in-use') {
        alert('Benutzername gibts schon anderen nehmen');
      } else {
        alert(e.message);
      }
    });
}

function log() {
  const name = document.getElementById("n").value.trim();
  const passwort = document.getElementById("pw").value;
  if (!name || !passwort) return;
  auth.signInWithEmailAndPassword(name + "@habibo.vote", passwort)
    .then(() => {
      document.getElementById("log").style.display = "none";
      document.getElementById("umf").style.display = "block";
      // Admin-Panel nur für admin anzeigen
      if (name === "admin" && passwort === "123456") {
        window.showAdminPanel();
      } else {
        window.hideAdminPanel();
      }
    })
    .catch(e => {
      if (e.code === 'auth/user-not-found') {
        alert('Benutzername nicht gefunden! Bitte registrieren.');
      } else if (e.code === 'auth/wrong-password') {
        alert('Falsches Passwort!');
      } else {
        alert(e.message);
      }
    });
}

window.regShow = regShow;
window.logShow = logShow;
window.reg = reg;
window.log = log;
