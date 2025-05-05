// Firebase-Konfiguration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
  
  function showRegister() {
    document.getElementById("login-teil").style.display = "none";
    document.getElementById("register-teil").style.display = "block";
  }
  
  function showLogin() {
    document.getElementById("login-teil").style.display = "block";
    document.getElementById("register-teil").style.display = "none";
  }
  
  function register() {
    const name = document.getElementById("register-name").value;
    const password = document.getElementById("register-password").value;
    auth.createUserWithEmailAndPassword(name + "@habibo.vote", password)
      .then(alert("registriewrt ghe zurüch nach login"))  //fix javscript nummer 10 idk why gnau fehler habe infach en fehlercode entfernt
      
  }
  
  function login() {
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;
    auth.signInWithEmailAndPassword(name + "@habibo.vote", password)
      .then(() => {
        document.getElementById("login-teil").style.display = "none";
        document.getElementById("umfrage-div").style.display = "block";
        loadVotes();
      })
      .catch(error => alert(error.message));
  }
  
  function vote(richtung) {
    const user = auth.currentUser;
    if (!user) return;
  
    const uid = user.uid;
    const voteRef = db.collection("votes").doc(uid);
  
    voteRef.get().then(doc => {
      if (doc.exists) {
        alert("Du hast bereits abgestimmt!");
      } else {
        voteRef.set({ richtung }).then(loadVotes);
      }
    });
  }
  
  function loadVotes() {
    db.collection("votes").get().then(snapshot => {
      const counts = { links: 0, geradeaus: 0, rechts: 0 };
      snapshot.forEach(doc => counts[doc.data().richtung]++);
      document.getElementById("ergebnisse").innerHTML = `
        Links: ${counts.links}<br>
        Geradeaus: ${counts.geradeaus}<br>
        Rechts: ${counts.rechts}
      `;
    });
  }
  