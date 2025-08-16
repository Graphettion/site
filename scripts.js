// Smooth scrolling for navigation links
var links = document.querySelectorAll('a[href^="#"]');
for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = this.getAttribute('href').substring(1);
        var targetElement = document.getElementById(targetId);

        if (targetElement) {
            var targetPosition = targetElement.offsetTop - 80;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
}

// Navigation active state and background
window.addEventListener('scroll', function () {
    var nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(10, 10, 10, 0.95)';
    } else {
        nav.style.background = 'rgba(10, 10, 10, 0.9)';
    }

    // Update active navigation link
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-links a');
    var scrollPos = window.scrollY + 200;

    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var sectionTop = section.offsetTop;
        var sectionHeight = section.offsetHeight;
        var sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            for (var j = 0; j < navLinks.length; j++) {
                navLinks[j].classList.remove('active');
            }
            var activeLink = document.querySelector('.nav-links a[href="#' + sectionId + '"]');
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }
});

// Intersection Observer for animations
var observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    }
}, observerOptions);

// Observe fade-up elements
var fadeElements = document.querySelectorAll('.fade-up');
for (var i = 0; i < fadeElements.length; i++) {
    observer.observe(fadeElements[i]);
}

// Initial hero animation
window.addEventListener('load', function () {
    setTimeout(function () {
        var heroContent = document.querySelector('.hero .fade-up');
        if (heroContent) {
            heroContent.classList.add('visible');
        }
    }, 300);
});