let aktivVote = false;
let countdown = 0;
let countdownInterval = null;
let tempVotes = {}; // UID -> Richtung

function zeigCount(sec) {
  let el = document.getElementById('countdown');
  if (el) el.textContent = sec > 0 ? `Countdown: ${sec}s` : '';
}

function sendErgEtReset() {
  // Votes in Datenbank schreiben
  const batch = db.batch();
  Object.entries(tempVotes).forEach(([uid, richtung]) => {
    const voteRef = db.collection('stimm').doc(uid);
    batch.set(voteRef, { r: richtung });
  });
  batch.commit().then(() => {
    // Ergebnisse zählen
    db.collection('stimm').get().then(snapshot => {
      const counts = { links: 0, mitte: 0, rechts: 0 };
      snapshot.forEach(doc => counts[doc.data().r]++);
      snapshot.forEach(doc => doc.ref.delete());
      alert(`Ergebnis gesendet!\nLinks: ${counts.links}\nMitte: ${counts.mitte}\nRechts: ${counts.rechts}`);
      tempVotes = {}; // RAM Votes zurücksetzen
    });
  });
}

function starteVote() {
  if (aktivVote) return;
  aktivVote = true;
  countdown = 10;
  tempVotes = {}; // Neue Runde
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
  if (tempVotes[uid]) {
    alert('Du hast schon abgestimmt!');
    return;
  }
  tempVotes[uid] = richtung;
  // Noch kein Firestore-Zugriff hier!
}

function resetVotes() {
  db.collection('stimm').get().then(snapshot => {
    snapshot.forEach(doc => doc.ref.delete());
  });
}

// Admin-Panel NUR nach Login anzeigen, nicht bei Seitenreload
window.showAdminPanel = function() {
  const adminDiv = document.getElementById('adminberich');
  if (adminDiv) adminDiv.style.display = 'block';
};
window.hideAdminPanel = function() {
  const adminDiv = document.getElementById('adminberich');
  if (adminDiv) adminDiv.style.display = 'none';
};

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

db.collection("stimm").onSnapshot(updateErgebnisse);

window.starteVote = starteVote;
window.vote = vote;
window.resetVotes = resetVotes;
