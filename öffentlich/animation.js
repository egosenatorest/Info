window.addEventListener('DOMContentLoaded', () => {
  const box = document.querySelector('.container');
  if (box) {
    box.style.opacity = '0';
    box.style.animation = 'none';
    setTimeout(() => {
      box.style.animation = '';
      box.style.opacity = '';
    }, 10);
  }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});