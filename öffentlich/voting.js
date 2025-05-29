let aktivVote = false;
let countdown = 0;
let countdownInterval = null;

function zeigCount(sec) {
  let el = document.getElementById('countdown');
  if (el) el.textContent = sec > 0 ? `Countdown: ${sec}s` : '';
}
function sendErgEtReset() {
  db.collection('votes').get().then(snapshot => {
    const counts = { links: 0, mitte: 0, rechts: 0 };
    snapshot.forEach(doc => counts[doc.data().r]++);
 
    snapshot.forEach(doc => doc.ref.delete());
    alert(`Ergebnis gesendet!\nLinks: ${counts.links}\nMitte: ${counts.mitte}\nRechts: ${counts.rechts}`);
  });
}
function starteVote() {
  if (aktivVote) return;
  aktivVote = true;
  countdown = 10;
  zeigCount(countdown);
  document.getElementById('umf').style.pointerEvents = '';
  countdownInterval = setInterval(() => {
    countdown--;
    zeigCount(countdown);
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      aktivVote = false;
      sendErgEtReset();
      zeigCount(0);
      document.getElementById('umf').style.pointerEvents = 'none';
    }
  }, 1000);
}



function vote(richtung) {
  const user = auth.currentUser;
  if (!user) return;
  if (!aktivVote) {
    alert('Warten auf nächste Voting-Phase!');
    return;
  }
  const uid = user.uid;
  const voteRef = db.collection('votes').doc(uid);
  voteRef.get().then(doc => {
    if (doc.exists) {
      alert('Du hast schon abgestimmt!');
    } else {
      voteRef.set({ r: richtung }).then(() => {
        // Abstimmung erfolgreich
      });
    }
  });
}

// Admin-Panel nach Login für Admin anzeigen
firebase.auth().onAuthStateChanged(user => {
  if (user && user.email === 'admin@habibo.vote') {
    const adminDiv = document.getElementById('adminberich');
    if (adminDiv) adminDiv.style.display = 'block';
  } else {
    const adminDiv = document.getElementById('adminberich');
    if (adminDiv) adminDiv.style.display = 'none';
  }
});

// Firestore Realtime Listener für Votes
function updateErgebnisse(snapshot) {
  const counts = { links: 0, mitte: 0, rechts: 0 };
  snapshot.forEach(doc => {
    const r = doc.data().r;
    if (r && counts.hasOwnProperty(r)) counts[r]++;
  });
  document.getElementById("erg").innerHTML = `
    Links: ${counts.links}<br>
    Mitte: ${counts.mitte}<br>
    Rechts: ${counts.rechts}
  `;
}

db.collection("votes").onSnapshot(updateErgebnisse);

// In sendErgEtReset() und resetVotes() KEIN ladStimm() mehr aufrufen!

// Entferne setVoteButtonsEnabled und onAuthStateChanged, damit alle voten können

window.starteVote = starteVote;
window.vote = vote;
window.resetVotes = resetVotes;
