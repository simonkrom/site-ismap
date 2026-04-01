// Gestion du formulaire de préinscription
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('preinscriptionForm');
    if (!form) return;

    let currentStep = 1;
    const totalSteps = 4;

    // Fonction pour afficher l'étape actuelle
    function showStep(step) {
        // Cacher toutes les étapes
        document.querySelectorAll('.form-step').forEach(el => {
            el.classList.remove('active');
        });
        
        // Afficher l'étape actuelle
        document.getElementById(`step${step}`).classList.add('active');
        
        // Mettre à jour la progression
        document.querySelectorAll('.progress-step').forEach((el, index) => {
            if (index + 1 < step) {
                el.classList.add('completed');
                el.classList.remove('active');
            } else if (index + 1 === step) {
                el.classList.add('active');
                el.classList.remove('completed');
            } else {
                el.classList.remove('active', 'completed');
            }
        });
        
        currentStep = step;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Gestionnaires d'événements pour les boutons suivant/précédent
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    showStep(currentStep + 1);
                }
            }
        });
    });

    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                showStep(currentStep - 1);
            }
        });
    });

    // Validation des étapes
    function validateStep(step) {
        const currentStepElement = document.getElementById(`step${step}`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#dc3545';
                isValid = false;
                
                // Message d'erreur
                let errorMsg = field.parentElement.querySelector('.error-message');
                if (!errorMsg) {
                    errorMsg = document.createElement('span');
                    errorMsg.className = 'error-message';
                    errorMsg.style.color = '#dc3545';
                    errorMsg.style.fontSize = '0.875rem';
                    field.parentElement.appendChild(errorMsg);
                }
                errorMsg.textContent = 'Ce champ est requis';
            } else {
                field.style.borderColor = '#ddd';
                const errorMsg = field.parentElement.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            }
        });

        // Validation spécifique pour l'email
        const email = document.getElementById('email');
        if (email && email.value && !isValidEmail(email.value)) {
            email.style.borderColor = '#dc3545';
            isValid = false;
            let errorMsg = email.parentElement.querySelector('.error-message');
            if (!errorMsg) {
                errorMsg = document.createElement('span');
                errorMsg.className = 'error-message';
                email.parentElement.appendChild(errorMsg);
            }
            errorMsg.textContent = 'Email invalide';
        }

        if (!isValid) {
            alert('Veuillez remplir tous les champs obligatoires.');
        }

        return isValid;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Gestion des fichiers upload
    document.querySelectorAll('.file-upload input[type="file"]').forEach(input => {
        input.addEventListener('change', function() {
            const fileName = this.files[0] ? this.files[0].name : 'Aucun fichier choisi';
            this.parentElement.querySelector('.file-name').textContent = fileName;
        });
    });

    // Mise à jour du récapitulatif
    function updateRecap() {
        const recapContent = document.getElementById('recapContent');
        if (!recapContent) return;

        const formData = new FormData(form);
        let recapHtml = '<div class="recap-grid">';
        
        const fields = [
            { label: 'Nom complet', value: `${formData.get('prenom') || ''} ${formData.get('nom') || ''}` },
            { label: 'Email', value: formData.get('email') },
            { label: 'Téléphone', value: formData.get('telephone') },
            { label: 'Formation choisie', value: getFormationName(formData.get('formation_choisie')) },
            { label: 'Niveau d\'études', value: formData.get('niveau_etudes') },
            { label: 'Dernier diplôme', value: formData.get('dernier_diplome') }
        ];

        fields.forEach(field => {
            if (field.value) {
                recapHtml += `
                    <div class="recap-row">
                        <strong>${field.label}:</strong> ${field.value}
                    </div>
                `;
            }
        });

        recapHtml += '</div>';
        recapContent.innerHTML = recapHtml;
    }

    function getFormationName(value) {
        const formations = {
            'licence_management': 'Licence en Management',
            'licence_admin_publique': 'Licence en Administration Publique',
            'licence_finance': 'Licence en Finance & Comptabilité',
            'master_management': 'Master en Management Stratégique',
            'bachelor_marketing': 'Bachelor Marketing Digital'
        };
        return formations[value] || value;
    }

    // Soumission du formulaire
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (validateStep(currentStep) && currentStep === totalSteps) {
                updateRecap();
                
                // Simuler l'envoi
                const submitBtn = form.querySelector('.btn-submit');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Envoi en cours...';
                
                // Simuler un délai d'envoi
                setTimeout(() => {
                    alert('Votre préinscription a été enregistrée avec succès !\nVotre numéro de dossier est : ISMAP' + Date.now());
                    form.reset();
                    showStep(1);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Valider la préinscription';
                }, 1500);
            }
        });
    }

    // Gestion des options conditionnelles
    const handicapRadios = document.querySelectorAll('input[name="handicap"]');
    if (handicapRadios.length) {
        handicapRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                const handicapDetails = document.querySelector('.handicap-details');
                if (handicapDetails) {
                    handicapDetails.style.display = this.value === 'oui' ? 'block' : 'none';
                }
            });
        });
    }

    // Mettre à jour le récapitulatif à chaque changement d'étape
    const nextButtons = document.querySelectorAll('.btn-next');
    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep + 1 === totalSteps) {
                updateRecap();
            }
        });
    });
});

// Gestion des numéros de téléphone
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) {
        value = value.slice(0, 8);
    }
    if (value.length >= 2) {
        value = value.slice(0, 2) + ' ' + value.slice(2);
    }
    if (value.length >= 6) {
        value = value.slice(0, 6) + ' ' + value.slice(6);
    }
    input.value = value;
}

// Appliquer le formatage téléphone
const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(input => {
    input.addEventListener('input', () => formatPhoneNumber(input));
});