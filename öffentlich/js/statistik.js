
const zeichenflaeche = document.getElementById('statistikDiagramm').getContext('2d');
const statistikDiagramm = new Chart(zeichenflaeche, {
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
          stepSize: 1 
        },
        grid: { color: '#30363d' }
      },
      x: { ticks: { color: '#c9d1d9' }, grid: { color: '#30363d' } }
    }
  }
});

function aktualisiereStatistik() {
  datenbank.collection('livevotes').get().then(schnappschuss => {
    const stimmenZaehler = { links: 0, mitte: 0, rechts: 0 };
    schnappschuss.forEach(dokument => stimmenZaehler[dokument.data().r]++);
    statistikDiagramm.data.datasets[0].data = [stimmenZaehler.links, stimmenZaehler.mitte, stimmenZaehler.rechts];
    statistikDiagramm.update();
  });
}

setInterval(aktualisiereStatistik, 2000);
