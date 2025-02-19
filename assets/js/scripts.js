// Theme toggle functionality
function toggleTheme() {
    const themeToggleButton = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');

    const applyTheme = (theme) => {
        document.body.setAttribute('data-theme', theme);
        themeToggleButton.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
    };

    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    themeToggleButton.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

// Smooth scrolling functionality
function smoothScrolling() {
    console.log('Smooth scrolling function called');
    const isHashLink = (event) => event.target.matches('a[href^="#"]');

    document.addEventListener('click', (event) => {
        console.log('Click event detected');
        if (isHashLink(event)) {
            event.preventDefault();
            const target = document.querySelector(event.target.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Wait for DOM to be fully loaded before running any JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    toggleTheme();

    // Smooth scrolling functionality
    smoothScrolling();
});