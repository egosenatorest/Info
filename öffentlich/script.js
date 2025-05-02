let votes = { links: 0, geradeaus: 0, rechts: 0 };
const allowedUsers = ["Mohammad", "Ali", "Marco"];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-btn").addEventListener("click", () => {
    let benutzername = document.getElementById("name").value.trim();
    if (allowedUsers.includes(benutzername)) {
      document.getElementById("login-teil").style.display = "none";
      document.getElementById("umfrage-div").style.display = "block";
      document.getElementById("error").textContent = "";
    } else {
      document.getElementById("error").textContent = "Benutzername nicht erlaubt!";
    }
  });
});

function vote(direction) {
  votes[direction]++;
  document.getElementById("ergbnis").innerHTML = `
    Links: ${votes.links}<br>
    Geradeaus: ${votes.geradeaus}<br>
    Rechts: ${votes.rechts}
  `;
}
