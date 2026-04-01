document.addEventListener('DOMContentLoaded', function() {
    // Gestion des méthodes de paiement
    const methodCards = document.querySelectorAll('.method-card');
    const paymentForms = document.querySelectorAll('.payment-form');
    
    methodCards.forEach(card => {
        card.addEventListener('click', function() {
            const method = this.dataset.method;
            
            // Retirer la classe active de toutes les méthodes
            methodCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Cacher tous les formulaires
            paymentForms.forEach(form => form.classList.remove('active'));
            
            // Afficher le formulaire correspondant
            const activeForm = document.getElementById(`${method}Payment`);
            if (activeForm) {
                activeForm.classList.add('active');
            }
        });
    });
    
    // Formatage numéro de carte
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\s/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            this.value = value;
        });
    }
    
    // Formatage date d'expiration
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            this.value = value;
        });
    }
    
    // Formatage CVV
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 3);
        });
    }
    
    // Gestion du paiement par carte
    const cardForm = document.getElementById('cardForm');
    if (cardForm) {
        cardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment('carte bancaire');
        });
    }
    
    // Gestion du paiement Mobile Money
    const mobileForm = document.getElementById('mobileForm');
    if (mobileForm) {
        mobileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const operator = document.querySelector('input[name="operator"]:checked');
            const phone = document.getElementById('phoneNumber');
            
            if (!operator) {
                alert('Veuillez sélectionner un opérateur');
                return;
            }
            if (!phone.value || phone.value.length < 9) {
                alert('Veuillez entrer un numéro de téléphone valide');
                return;
            }
            
            processPayment('Mobile Money', `${operator.value} - ${phone.value}`);
        });
    }
    
    // Gestion du virement bancaire
    const bankForm = document.querySelector('#bankPayment form');
    if (bankForm) {
        bankForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const ref = document.getElementById('transferRef');
            const proof = document.getElementById('proof');
            
            if (!ref.value) {
                alert('Veuillez entrer la référence de votre virement');
                return;
            }
            
            processPayment('Virement bancaire', `Réf: ${ref.value}`);
        });
    }
    
    // Gestion du paiement Wave
    const waveForm = document.querySelector('#wavePayment form');
    if (waveForm) {
        waveForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const ref = document.getElementById('waveRef');
            
            if (!ref.value) {
                alert('Veuillez entrer le numéro de transaction Wave');
                return;
            }
            
            processPayment('Wave', `Transaction: ${ref.value}`);
        });
    }
    
    // Copier numéro Wave
    const copyBtn = document.querySelector('.copy-number');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const waveNumber = this.previousElementSibling.textContent;
            navigator.clipboard.writeText(waveNumber).then(() => {
                const originalText = this.textContent;
                this.textContent = 'Copié !';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            });
        });
    }
    
    // Fonction de traitement du paiement
    function processPayment(method, details = '') {
        // Simuler le traitement du paiement
        const submitBtn = document.querySelector('.btn-pay');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Traitement en cours...';
        
        setTimeout(() => {
            // Simulation de succès
            const success = Math.random() > 0.1; // 90% de chance de succès
            
            if (success) {
                alert(`✅ Paiement effectué avec succès !\n\nMéthode: ${method}\nMontant: 575 000 FCFA\nNuméro de transaction: ISMAP${Date.now()}\n\nUn reçu vous a été envoyé par email.`);
                
                // Redirection vers la confirmation
                window.location.href = 'confirmation.html';
            } else {
                alert('❌ Le paiement a échoué. Veuillez réessayer ou contacter le service financier.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }, 2000);
    }
    
    // Validation des formulaires en temps réel
    function validateCardForm() {
        const cardNumber = document.getElementById('cardNumber')?.value;
        const expiry = document.getElementById('expiryDate')?.value;
        const cvv = document.getElementById('cvv')?.value;
        
        let isValid = true;
        
        if (cardNumber && cardNumber.replace(/\s/g, '').length !== 16) {
            isValid = false;
        }
        if (expiry && !/^\d{2}\/\d{2}$/.test(expiry)) {
            isValid = false;
        }
        if (cvv && cvv.length !== 3) {
            isValid = false;
        }
        
        const payBtn = document.querySelector('#cardForm .btn-pay');
        if (payBtn) {
            payBtn.disabled = !isValid;
        }
    }
    
    // Écouter les changements sur le formulaire carte
    const cardInputs = ['cardNumber', 'expiryDate', 'cvv'];
    cardInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', validateCardForm);
        }
    });
});