// Theme toggle functionality
(function () {
    function toggleTheme() {
        const themeToggleButton = document.getElementById('themeToggle');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const savedTheme = localStorage.getItem('theme');

        const applyTheme = (theme) => {
            document.body.setAttribute('data-theme', theme);
            themeToggleButton.textContent = theme === 'dark' ? '☀️' : '🌙';
            localStorage.setItem('theme', theme);
            document.getElementById('logo').src = theme === 'dark' ? 'assets/images/logo-white.png' : 'assets/images/logo-black.png';
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
        const isHashLink = (event) => event.target.matches('a[href^="#"]');

        document.addEventListener('click', (event) => {
            if (isHashLink(event)) {
                event.preventDefault();
                const target = document.querySelector(event.target.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    function contactForm() {
        document.querySelector('.submit-button').disabled = true;
        // const form = document.getElementById("contactForm")
        // const statusMessage = document.getElementById("statusMessage")

        // form.addEventListener("submit", async (e) => {
        //     e.preventDefault()
        //     const submitButton = form.querySelector("button")
        //     submitButton.disabled = true
        //     submitButton.textContent = "Sending..."

        //     try {
        //         // Replace with your Google Form URL
        //         const formUrl =
        //         "https://docs.google.com/forms/d/e/1FAIpQLSeUcmFZsuOkSksGI3PrTk6ddpYW-5uXy9IjvecVn9q2JcwAfg/formResponse"
        //         const formData = new FormData(form)

        //         // Using fetch with no-cors mode since Google Forms doesn't support CORS
        //         await fetch(formUrl, {
        //             method: "POST",
        //             mode: "no-cors",
        //             body: formData,
        //         })

        //         // Clear form and show success message
        //         form.reset()
        //         showStatus("Message sent successfully!", "success")
        //     } catch (error) {
        //         showStatus("Error sending message. Please try again.", "error")
        //     } finally {
        //         submitButton.disabled = false
        //         submitButton.textContent = "Send Message"
        //     }
        // })
    }
    

      function showStatus(message, type) {
        statusMessage.textContent = message
        statusMessage.className = `status-message ${type}`
        statusMessage.style.display = "block"

        // Hide status message after 5 seconds
        setTimeout(() => {
          statusMessage.style.display = "none"
        }, 5000)
      }

    // Wait for DOM to be fully loaded before running any JavaScript
    document.addEventListener('DOMContentLoaded', function() {
        // theme toggle
        toggleTheme();

        // smooth scrolling
        smoothScrolling();

        // contact form 
        contactForm();
    });
})();