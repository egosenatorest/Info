let aktivVote = false;
let countdown = 0;
let countdownInterval = null;
let tempVotes = {}; // UID -> Richtung

function zeigCount(sec) {
  let el = document.getElementById('countdown');
  if (el) el.textContent = sec > 0 ? `Countdown: ${sec}s` : '';
}

// Voting-Status für alle synchronisieren
function setVotingStatusFirestore(active, seconds) {
  db.collection('status').doc('voting').set({ aktivVote: active, countdown: seconds, started: Date.now() });
}

// Listener für Voting-Status (Countdown) für alle Nutzer
let votingStatusUnsub = null;
function listenVotingStatus() {
  if (votingStatusUnsub) votingStatusUnsub();
  votingStatusUnsub = db.collection('status').doc('voting').onSnapshot(doc => {
    const data = doc.data();
    if (!data) return;
    // Wenn Voting-Status auf aktiv gesetzt wird, tempVotes für alle zurücksetzen
    if (data.aktivVote && countdown === 0) {
      tempVotes = {}; // Jeder Client setzt sein tempVotes zurück
      window.currentVotingStarted = data.started || Date.now();
      // Leere Userstatus für neue Runde
      db.collection('livevotes_userstatus').get().then(snapshot => {
        snapshot.forEach(doc => doc.ref.delete());
      });
    }
    aktivVote = data.aktivVote;
    countdown = data.countdown;
    zeigCount(countdown);
    if (aktivVote && countdown > 0 && !countdownInterval) {
      document.getElementById('umf').style.pointerEvents = '';
      startLocalCountdown();
    }
    if (!aktivVote || countdown <= 0) {
      document.getElementById('umf').style.pointerEvents = 'none';
      clearInterval(countdownInterval);
      countdownInterval = null;
      zeigCount(0);
    }
  });
}

function startLocalCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    countdown--;
    zeigCount(countdown);
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      aktivVote = false;
      zeigCount(0);
      document.getElementById('umf').style.pointerEvents = 'none';
      // Nur Admin triggert das Ergebnis!
      const user = auth.currentUser;
      if (user && user.email === 'admin@habibo.vote') {
        sendErgEtReset();
        setVotingStatusFirestore(false, 0);
      }
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
  // Prüfe, ob der User in dieser Runde schon gevotet hat (global, nicht nur lokal)
  db.collection('livevotes_userstatus').doc(user.uid).get().then(docSnap => {
    if (docSnap.exists && docSnap.data().runde === getCurrentVotingRoundId()) {
      alert('Du hast schon abgestimmt!');
      return;
    }
    // Jede Stimme als neues Dokument speichern (Gesamtanzahl aller Votes)
    const voteId = `${user.uid}_${Date.now()}`;
    db.collection('livevotes').doc(voteId).set({ r: richtung });
    // Markiere, dass dieser User in dieser Runde gevotet hat
    db.collection('livevotes_userstatus').doc(user.uid).set({ runde: getCurrentVotingRoundId() });
    // Nur die erste Stimme pro User für das finale Ergebnis merken
    if (!tempVotes[user.uid]) {
      tempVotes[user.uid] = richtung;
    }
  });
}

// Hilfsfunktion: Eindeutige ID für jede Voting-Phase (z.B. Startzeitstempel)
function getCurrentVotingRoundId() {
  // Hole Voting-Status-Dokument
  // (Das Feld 'started' wird beim Start gesetzt)
  return String(window.currentVotingStarted || 0);
}

function sendErgEtReset() {
  // Votes in Datenbank schreiben (nur am Ende, nur die erste Stimme pro User)
  const batch = db.batch();
  Object.entries(tempVotes).forEach(([uid, richtung]) => {
    const voteRef = db.collection('stimm').doc(uid);
    batch.set(voteRef, { r: richtung });
  });
  batch.commit().then(() => {
    db.collection('stimm').get().then(snapshot => {
      const counts = { links: 0, mitte: 0, rechts: 0 };
      snapshot.forEach(doc => counts[doc.data().r]++);
      // Ergebnisse im UI anzeigen
      const ergebnisDiv = document.getElementById('erg');
      if (ergebnisDiv) {
        ergebnisDiv.innerHTML = `
          <b>Ergebnis:</b><br>
          Links: ${counts.links}<br>
          Mitte: ${counts.mitte}<br>
          Rechts: ${counts.rechts}
        `;
      }
      tempVotes = {}; // RAM Votes zurücksetzen
      setTimeout(() => {
        snapshot.forEach(doc => doc.ref.delete());
      }, 4000); // 4 Sekunden warten, dann stimm zurücksetzen
    });
  });
}

function starteVote() {
  if (aktivVote) return;
  aktivVote = true;
  countdown = 10;
  tempVotes = {}; // Neue Runde
  setVotingStatusFirestore(true, countdown);
  // Leere livevotes für neue Runde
  db.collection('livevotes').get().then(snapshot => {
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

// Firestore Realtime Listener für Live-Statistik
function updateLiveStats(snapshot) {
  const counts = { links: 0, mitte: 0, rechts: 0 };
  snapshot.forEach(doc => {
    const r = doc.data().r;
    if (r && counts.hasOwnProperty(r)) counts[r]++;
  });
  const ergebnisDiv = document.getElementById('erg');
  if (ergebnisDiv) {
    ergebnisDiv.innerHTML = `
      <b>Live-Statistik:</b><br>
      Links: ${counts.links}<br>
      Mitte: ${counts.mitte}<br>
      Rechts: ${counts.rechts}
    `;
  }
}

db.collection("livevotes").onSnapshot(updateLiveStats);

// Starte Voting-Status-Listener beim Laden
listenVotingStatus();

window.starteVote = starteVote;
window.vote = vote;
window.resetVotes = resetVotes;
// ich möchte live cam neben votes hinzufügen und unter Stand eien Statistik anzeigen mit balkendaigram