// Menu Mobile
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Fermer le menu mobile lors du clic sur un lien
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Header transparent au scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255,255,255,0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#fff';
        header.style.backdropFilter = 'none';
    }
});

// Animation au scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Filtres pour les formations (si présent sur la page)
const filterButtons = document.querySelectorAll('.filter-btn');
if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            const formations = document.querySelectorAll('.formation-item');
            
            formations.forEach(formation => {
                if (filterValue === 'all' || formation.getAttribute('data-category') === filterValue) {
                    formation.style.display = 'block';
                } else {
                    formation.style.display = 'none';
                }
            });
        });
    });
}

// Formulaire de newsletter
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input').value;
        if (email) {
            alert(`Merci pour votre inscription ! Un email de confirmation a été envoyé à ${email}`);
            newsletterForm.reset();
        } else {
            alert('Veuillez entrer une adresse email valide.');
        }
    });
}

// Smooth scroll pour les ancres
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Chargement des actualités (simulation)
async function loadActualites() {
    // Simulation d'appel API
    const actualites = [
        {
            titre: "Journée portes ouvertes",
            date: "15 Mars 2026",
            contenu: "Venez découvrir nos formations..."
        },
        {
            titre: "Nouvelle filière",
            date: "01 Mars 2026",
            contenu: "Digital Marketing..."
        }
    ];
    
    // À implémenter avec l'API réelle plus tard
    console.log('Actualités chargées:', actualites);
}