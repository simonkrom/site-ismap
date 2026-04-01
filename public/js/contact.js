document.addEventListener('DOMContentLoaded', function() {
    // Gestion du formulaire de contact
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validation des champs
            const nom = document.getElementById('nom').value;
            const email = document.getElementById('email').value;
            const sujet = document.getElementById('sujet').value;
            const message = document.getElementById('message').value;
            const rgpd = document.getElementById('rgpd').checked;
            
            if (!nom || !email || !sujet || !message) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            if (!isValidEmail(email)) {
                alert('Veuillez entrer une adresse email valide.');
                return;
            }
            
            if (!rgpd) {
                alert('Vous devez accepter le traitement de vos données.');
                return;
            }
            
            // Simuler l'envoi
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours...';
            
            // Simulation d'appel API
            setTimeout(() => {
                alert('✅ Votre message a été envoyé avec succès !\n\nNous vous répondrons dans les plus brefs délais.');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 1500);
        });
    }
    
    // Gestion des FAQ
    const faqItems = document.querySelectorAll('.faq-item-contact');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question-contact');
        
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
    
    // Validation email
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Formatage téléphone
    const phoneInput = document.getElementById('telephone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            if (value.length >= 2) {
                value = value.slice(0, 2) + ' ' + value.slice(2);
            }
            if (value.length >= 6) {
                value = value.slice(0, 6) + ' ' + value.slice(6);
            }
            this.value = value;
        });
    }
    
    // Copie des coordonnées (optionnel)
    const contactInfo = document.querySelectorAll('.info-card p');
    contactInfo.forEach(info => {
        info.addEventListener('click', function() {
            const text = this.textContent;
            if (text.includes('@') || text.includes('06') || text.includes('07')) {
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = this.textContent;
                    this.textContent = 'Copié !';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 2000);
                });
            }
        });
    });
});