
document.addEventListener('DOMContentLoaded', function() {
    
    const links = document.getElementById('linksVote');
    if (links) links.onclick = () => vote('links');

    const mitte = document.getElementById('mitteVote');
    if (mitte) mitte.onclick = () => vote('mitte');

    const rechts = document.getElementById('rechtsVote');
    if (rechts) rechts.onclick = () => vote('rechts');

const reset = document.getElementById('zurückVote');
if (reset) reset.onclick = resetVotes;

    const start = document.getElementById('voteStarten');
    if (start) start.onclick = starteVote;
});
