(function () {
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      btn.textContent = 'Light mode';
      btn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      document.documentElement.removeAttribute('data-theme');
      btn.textContent = 'Dark mode';
      btn.setAttribute('aria-label', 'Switch to dark mode');
    }
    localStorage.setItem('theme', theme);
  }

  btn.addEventListener('click', function () {
    applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });

  applyTheme(getTheme());
})();
