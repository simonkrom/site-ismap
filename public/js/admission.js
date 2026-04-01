document.addEventListener('DOMContentLoaded', function() {
    // Gestion des FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Fermer les autres FAQ
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle l'item courant
            item.classList.toggle('active');
        });
    });
    
    // Animation au scroll pour la timeline
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(item);
    });
    
    // Calcul dynamique des frais (optionnel)
    const formationSelect = document.getElementById('formation_choisie');
    if (formationSelect) {
        const fraisInfo = document.createElement('div');
        fraisInfo.className = 'frais-info';
        
        formationSelect.addEventListener('change', function() {
            const formation = this.value;
            let frais = '';
            
            if (formation.includes('licence')) {
                frais = 'Frais de scolarité : 550 000 FCFA/an';
            } else if (formation.includes('master')) {
                frais = 'Frais de scolarité : 725 000 FCFA/an';
            } else if (formation.includes('bachelor')) {
                frais = 'Frais de scolarité : 440 000 FCFA/an';
            }
            
            if (frais) {
                fraisInfo.textContent = frais;
                fraisInfo.style.marginTop = '0.5rem';
                fraisInfo.style.color = '#28a745';
                fraisInfo.style.fontWeight = 'bold';
                
                if (!this.parentElement.querySelector('.frais-info')) {
                    this.parentElement.appendChild(fraisInfo);
                }
            }
        });
    }
});