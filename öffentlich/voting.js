let aktivVote = false;
let countdown = 0;
let countdownInterval = null;
let tempVotes = {}; // UID -> Richtung

function zeigCount(sec) {
  let el = document.getElementById('countdown');
  if (el) el.textContent = sec > 0 ? `Countdown: ${sec}s` : '';
}

function setVotingStatusFirestore(active, seconds) {
  db.collection('status').doc('voting').set({ aktivVote: active, countdown: seconds, started: Date.now() });
}

let votingStatusUnsub = null;
function listenVotingStatus() {
  if (votingStatusUnsub) votingStatusUnsub();
  votingStatusUnsub = db.collection('status').doc('voting').onSnapshot(doc => {
    const data = doc.data();
    if (!data) return;
   
    if (data.aktivVote && countdown === 0) {
      tempVotes = {}; 
      window.currentVotingStarted = data.started || Date.now();
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
  db.collection('livevotes_userstatus').doc(user.uid).get().then(docSnap => {
    if (docSnap.exists && docSnap.data().runde === getCurrentVotingRoundId()) {
      alert('Du hast schon abgestimmt!');
      return;
    }
    const voteId = `${user.uid}_${Date.now()}`;
    db.collection('livevotes').doc(voteId).set({ r: richtung });
    db.collection('livevotes_userstatus').doc(user.uid).set({ runde: getCurrentVotingRoundId() });
    if (!tempVotes[user.uid]) {
      tempVotes[user.uid] = richtung;
    }
  });
}

function getCurrentVotingRoundId() {

  return String(window.currentVotingStarted || 0);
}

function sendErgEtReset() {
  const batch = db.batch();
  Object.entries(tempVotes).forEach(([uid, richtung]) => {
    const voteRef = db.collection('stimm').doc(uid);
    batch.set(voteRef, { r: richtung });
  });
  batch.commit().then(() => {
    db.collection('stimm').get().then(snapshot => {
      const counts = { links: 0, mitte: 0, rechts: 0 };
      snapshot.forEach(doc => counts[doc.data().r]++);
      const ergebnisDiv = document.getElementById('erg');
      if (ergebnisDiv) {
        ergebnisDiv.innerHTML = `
          <b>Ergebnis:</b><br>
          Links: ${counts.links}<br>
          Mitte: ${counts.mitte}<br>
          Rechts: ${counts.rechts}
        `;
      }
     
      db.collection('robotvotes').add({
        links: counts.links,
        mitte: counts.mitte,
        rechts: counts.rechts,
        timestamp: Date.now()
      });
      tempVotes = {}; 
      setTimeout(() => {
        snapshot.forEach(doc => doc.ref.delete());
        
        db.collection('robotvotes').orderBy('timestamp', 'desc').limit(1).get().then(snap => {
          snap.forEach(doc => doc.ref.delete());
        });
      }, 3000);
    });
  });
}

function starteVote() {
  if (aktivVote) return;
  aktivVote = true;
  countdown = 10;
  tempVotes = {}; 
  setVotingStatusFirestore(true, countdown);
  db.collection('livevotes').get().then(snapshot => {
    snapshot.forEach(doc => doc.ref.delete());
  });
  db.collection('livevotes_userstatus').get().then(snapshot => {
    snapshot.forEach(doc => doc.ref.delete());
  });
}

window.showAdminPanel = function() {
  const adminDiv = document.getElementById('adminberich');
  if (adminDiv) adminDiv.style.display = 'block';
};
window.hideAdminPanel = function() {
  const adminDiv = document.getElementById('adminberich');
  if (adminDiv) adminDiv.style.display = 'none';
};

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

listenVotingStatus();

window.starteVote = starteVote;
window.vote = vote;
window.resetVotes = resetVotes;

function resetVotes() {
  db.collection('livevotes').get().then(snapshot => {
    snapshot.forEach(doc => doc.ref.delete());
  });
  db.collection('livevotes_userstatus').get().then(snapshot => {
    snapshot.forEach(doc => doc.ref.delete());
  });
  db.collection('stimm').get().then(snapshot => {
    snapshot.forEach(doc => doc.ref.delete());
  });
  db.collection('robotvotes').get().then(snapshot => {
    snapshot.forEach(doc => doc.ref.delete());
  });
  const ergebnisDiv = document.getElementById('erg');
  if (ergebnisDiv) ergebnisDiv.innerHTML = '';
  tempVotes = {};
}

// ich möchte live cam neben votes hinzufügen und unter Stand eien Statistik anzeigen mit balkendaigram

