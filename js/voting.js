let voteAktiv = false;
let zeit = 0;
let zeitTimer = null;
let tempStimmen = {};

function zeigeZeit(sek) {
  let el = document.getElementById('countdown');
  if (el) el.textContent = sek > 0 ? `Zeit: ${sek}s` : '';
}

function setzeVoteStatus(aktiv, sek) {
  db.collection('status').doc('voting').set({ 
    voteAktiv: aktiv, 
    zeit: sek, 
    start: Date.now() 
  });
}

let statusListener = null;
function watchVoteStatus() {
  if (statusListener) statusListener();
  statusListener = db.collection('status').doc('voting').onSnapshot(doc => {
    const data = doc.data();
    if (!data) return;
   
    if (data.voteAktiv && zeit === 0) {
      tempStimmen = {}; 
      window.voteStart = data.start || Date.now();
      db.collection('livevotes_userstatus').get().then(snap => {
        snap.forEach(doc => doc.ref.delete());
      });
    }
    voteAktiv = data.voteAktiv;
    zeit = data.zeit;
    zeigeZeit(zeit);
    if (voteAktiv && zeit > 0 && !zeitTimer) {
      document.getElementById('umf').style.pointerEvents = '';
      startTimer();
    }
    if (!voteAktiv || zeit <= 0) {
      document.getElementById('umf').style.pointerEvents = 'none';
      clearInterval(zeitTimer);
      zeitTimer = null;
      zeigeZeit(0);
    }
  });
}

function startTimer() {
  clearInterval(zeitTimer);
  zeitTimer = setInterval(() => {
    zeit--;
    zeigeZeit(zeit);
    if (zeit <= 0) {
      clearInterval(zeitTimer);
      zeitTimer = null;
      voteAktiv = false;
      zeigeZeit(0);
      document.getElementById('umf').style.pointerEvents = 'none';
      const user = auth.currentUser;
      if (user && user.email === 'admin@habibo.vote') {
        sendeUndReset();
        setzeVoteStatus(false, 0);
      }
    }
  }, 1000);
}

function vote(richtung) {
  const user = auth.currentUser;
  if (!user) return;
  if (!voteAktiv) {
    alert('Warte auf nachste Vote-Phase!');
    return;
  }
  
  db.collection('livevotes_userstatus').doc(user.uid).get().then(doc => {
    if (doc.exists) {
      alert('Du hast bereits abgestimmt!');
      return;
    }
    
    tempStimmen[user.uid] = richtung;
    db.collection('livevotes').add({
      u: user.uid,
      r: richtung,
      t: Date.now(),
      round: getCurrentVotingRoundId()
    });
    
    db.collection('livevotes_userstatus').doc(user.uid).set({
      r: richtung,
      t: Date.now()
    });
  });
}

function getCurrentVotingRoundId() {

  return String(window.voteStart || 0);
}

function sendeUndReset() {
  const batch = db.batch();
  Object.entries(tempStimmen).forEach(([uid, richtung]) => {
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
      tempStimmen = {}; 
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
  if (voteAktiv) return;
  voteAktiv = true;
          zeit = 10;
     tempStimmen = {}; 
        setzeVoteStatus(true, zeit);
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

watchVoteStatus();

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
  tempStimmen = {};
}


