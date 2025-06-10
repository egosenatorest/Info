// Chart.js Konfiguration für die Statistik
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Links', 'Mitte', 'Rechts'],
    datasets: [{
      label: 'Anzahl der Stimmen',
      data: [0, 0, 0],
      backgroundColor: ['#f44336', '#2196F3', '#4CAF50'],
      borderColor: ['#d32f2f', '#1976D2', '#388E3C'],
      borderWidth: 1
    }]
  },
  options: {
    responsive: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#c9d1d9',
          stepSize: 1 // Statistik in 1er-Schritten
        },
        grid: { color: '#30363d' }
      },
      x: { ticks: { color: '#c9d1d9' }, grid: { color: '#30363d' } }
    }
  }
});

// Aktualisiere die Chart.js Statistik
function updateChartStats() {
  db.collection('livevotes').get().then(snapshot => {
    const counts = { links: 0, mitte: 0, rechts: 0 };
    snapshot.forEach(doc => counts[doc.data().r]++);
    myChart.data.datasets[0].data = [counts.links, counts.mitte, counts.rechts];
    myChart.update();
  });
}

// Alle 2 Sekunden die Statistik aktualisieren
setInterval(updateChartStats, 2000);
