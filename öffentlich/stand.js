// Chart.js und Firebase für stand.html

// Firebase-Konfiguration wie in app.js
const firebaseConfig = {
  apiKey: "AIzaSyDltAvZDU7bgo711i6S44tUtdHndFq9gNQ",
  authDomain: "elhabibvote.firebaseapp.com",
  projectId: "elhabibvote",
  storageBucket: "elhabibvote.firebasestorage.app",
  messagingSenderId: "310950217444",
  appId: "1:310950217444:web:4f47fc51cb96a8cb680ef1",
  measurementId: "G-FP2HVCGV5N"
};

function StndLiveChart() {
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const ctx = document.getElementById('stand-live-chart').getContext('2d');
  const standChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Links', 'Mitte', 'Rechts'],
      datasets: [{
        label: 'Stimmen',
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(88,166,255,0.8)',
          'rgba(63,185,80,0.8)',
          'rgba(255,215,0,0.8)'
        ],
        borderRadius: 8,
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, ticks: { color: '#c9d1d9' }, grid: { color: '#30363d' } },
        x: { ticks: { color: '#c9d1d9' }, grid: { color: '#30363d' } }
      }
    }
  });
  db.collection('livevotes').onSnapshot(snapshot => {
    const counts = { links: 0, mitte: 0, rechts: 0 };
    snapshot.forEach(doc => {
      const r = doc.data().r;
      if (r && counts.hasOwnProperty(r)) counts[r]++;
    });
    standChart.data.datasets[0].data = [counts.links, counts.mitte, counts.rechts];
    standChart.update();
  });
}

if (typeof firebase === 'undefined') {
  const script1 = document.createElement('script');
  script1.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js';
  document.head.appendChild(script1);
  const script2 = document.createElement('script');
  script2.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js';
  document.head.appendChild(script2);
  script2.onload = StndLiveChart;
} else {
  StndLiveChart();
}
