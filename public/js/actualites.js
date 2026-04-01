document.addEventListener('DOMContentLoaded', function() {
    // Gestion des filtres
    const filterBtns = document.querySelectorAll('.filter-btn');
    const newsCards = document.querySelectorAll('.news-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            newsCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Gestion de la pagination (simulation)
    const pageBtns = document.querySelectorAll('.page-btn');
    let currentPage = 1;
    const itemsPerPage = 6;
    const allCards = Array.from(newsCards);
    
    function showPage(page) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        
        allCards.forEach((card, index) => {
            if (index >= start && index < end) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    pageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('next')) {
                if (currentPage < Math.ceil(allCards.length / itemsPerPage)) {
                    currentPage++;
                }
            } else if (!isNaN(parseInt(btn.textContent))) {
                currentPage = parseInt(btn.textContent);
            }
            
            // Mettre à jour l'apparence des boutons
            pageBtns.forEach(b => b.classList.remove('active'));
            if (btn.classList.contains('next')) {
                const activeBtn = document.querySelector(`.page-btn:not(.next):nth-child(${currentPage})`);
                if (activeBtn) activeBtn.classList.add('active');
            } else {
                btn.classList.add('active');
            }
            
            showPage(currentPage);
        });
    });
    
    // Afficher la première page
    showPage(1);
    
    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form-large');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input').value;
            
            if (email && isValidEmail(email)) {
                alert(`Merci de vous être abonné à notre newsletter ! Un email de confirmation a été envoyé à ${email}`);
                newsletterForm.reset();
            } else {
                alert('Veuillez entrer une adresse email valide.');
            }
        });
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // Chargement des actualités via API (simulation)
    async function loadMoreNews() {
        // Simulation d'appel API pour charger plus d'actualités
        console.log('Chargement de plus d\'actualités...');
        // À implémenter avec une vraie API plus tard
    }
    
    // Détection de fin de page pour charger plus
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            loadMoreNews();
        }
    });
});