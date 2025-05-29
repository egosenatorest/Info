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
    snapshot.forEach(doc => counts[doc.data().richtung]++);
    // Hier ggf. an Backend/Robot senden (z.B. via Cloud Function, Python, etc.)
    // ...
    // Danach Votes zurücksetzen:
    snapshot.forEach(doc => doc.ref.delete());
    ladStimm();
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
      voteRef.set({ richtung }).then(() => {
        ladStimm();
      });
    }
  });
}

function ladStimm() {
  db.collection("votes").get().then(snapshot => {
    const counts = { links: 0, mitte: 0, rechts: 0 };
    snapshot.forEach(doc => counts[doc.data().richtung]++);
    document.getElementById("erg").innerHTML = `
      Links: ${counts.links}<br>
      Mitte: ${counts.mitte}<br>
      Rechts: ${counts.rechts}
    `;
  });
}

function resetVotes() {
  db.collection('votes').get().then(snapshot => {
    snapshot.forEach(doc => doc.ref.delete());
    ladStimm();
  });
}

window.starteVote = starteVote;
window.vote = vote;
window.resetVotes = resetVotes;
window.ladStimm = ladStimm;
