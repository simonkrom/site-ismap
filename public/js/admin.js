// Admin JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // ==================== GÉNÉRAL ====================
    
    // Menu toggle pour mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    // Déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
                localStorage.removeItem('adminLoggedIn');
                window.location.href = 'login.html';
            }
        });
    }
    
    // Vérification de l'authentification
    function checkAuth() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        if (!isLoggedIn && !window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
    checkAuth();
    
    // ==================== LOGIN ====================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simulation d'authentification
            if (email === 'admin@ismap2.com' && password === 'admin123') {
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'index.html';
            } else {
                alert('Email ou mot de passe incorrect');
            }
        });
    }
    
    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }
    
    // ==================== TABLEAU DE BORD ====================
    
    // Graphique des inscriptions
    const inscriptionsCtx = document.getElementById('inscriptionsChart');
    if (inscriptionsCtx) {
        new Chart(inscriptionsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                datasets: [{
                    label: 'Inscriptions',
                    data: [12, 19, 25, 35, 42, 48],
                    borderColor: '#ff6b35',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }
    
    // Graphique des formations
    const formationsCtx = document.getElementById('formationsChart');
    if (formationsCtx) {
        new Chart(formationsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Management', 'Administration', 'Finance', 'Marketing'],
                datasets: [{
                    data: [45, 30, 15, 10],
                    backgroundColor: ['#1e3c72', '#2a5298', '#ff6b35', '#28a745']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }
    
    // ==================== GESTION DES CANDIDATS ====================
    
    const candidatesList = document.getElementById('candidatesList');
    if (candidatesList) {
        // Données simulées
        const candidates = [
            { id: 'ISMAP2026001', nom: 'Dupont Jean', formation: 'Licence Management', date: '15/03/2026', status: 'pending' },
            { id: 'ISMAP2026002', nom: 'Mbega Paul', formation: 'Master Finance', date: '14/03/2026', status: 'reviewed' },
            { id: 'ISMAP2026003', nom: 'Claire Marie', formation: 'Bachelor Marketing', date: '12/03/2026', status: 'interview' },
            { id: 'ISMAP2026004', nom: 'Obiang Luc', formation: 'Licence Administration', date: '10/03/2026', status: 'accepted' },
            { id: 'ISMAP2026005', nom: 'Mba Alice', formation: 'Master Management', date: '08/03/2026', status: 'rejected' }
        ];
        
        function getStatusBadge(status) {
            const statusMap = {
                'pending': '<span class="status warning">En attente</span>',
                'reviewed': '<span class="status info">Dossier étudié</span>',
                'interview': '<span class="status info">Entretien programmé</span>',
                'accepted': '<span class="status success">Accepté</span>',
                'rejected': '<span class="status danger">Rejeté</span>'
            };
            return statusMap[status] || statusMap.pending;
        }
        
        function renderCandidates(filteredCandidates) {
            candidatesList.innerHTML = filteredCandidates.map(c => `
                <tr>
                    <td><input type="checkbox" class="candidate-checkbox" data-id="${c.id}"></td>
                    <td>${c.id}</td>
                    <td><strong>${c.nom}</strong></td>
                    <td>${c.formation}</td>
                    <td>${c.date}</td>
                    <td>${getStatusBadge(c.status)}</td>
                    <td>
                        <button class="btn-edit" onclick="viewCandidate('${c.id}')"><i class="fas fa-eye"></i></button>
                        <button class="btn-delete" onclick="deleteCandidate('${c.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
        
        renderCandidates(candidates);
        
        // Sélectionner tous les candidats
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.candidate-checkbox');
                checkboxes.forEach(cb => cb.checked = this.checked);
            });
        }
    }
    
    // ==================== GESTION DES PAIEMENTS ====================
    
    const paymentsList = document.getElementById('paymentsList');
    if (paymentsList) {
        const payments = [
            { id: 'TRX001', etudiant: 'Jean Dupont', formation: 'Licence Management', montant: '550 000', methode: 'Carte bancaire', date: '15/03/2026', status: 'success' },
            { id: 'TRX002', etudiant: 'Marie Claire', formation: 'Master Finance', montant: '725 000', methode: 'Mobile Money', date: '14/03/2026', status: 'success' },
            { id: 'TRX003', etudiant: 'Paul Mbega', formation: 'Bachelor Marketing', montant: '440 000', methode: 'Wave', date: '12/03/2026', status: 'pending' }
        ];
        
        function getPaymentStatus(status) {
            return status === 'success' 
                ? '<span class="status success">Payé</span>' 
                : '<span class="status warning">En attente</span>';
        }
        
        paymentsList.innerHTML = payments.map(p => `
            <tr>
                <td><input type="checkbox"></td>
                <td>${p.id}</td>
                <td><strong>${p.etudiant}</strong></td>
                <td>${p.formation}</td>
                <td>${p.montant} FCFA</td>
                <td>${p.methode}</td>
                <td>${p.date}</td>
                <td>${getPaymentStatus(p.status)}</td>
                <td>
                    <button class="btn-edit" onclick="viewPayment('${p.id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn-print" onclick="printReceipt('${p.id}')"><i class="fas fa-print"></i></button>
                </td>
            </tr>
        `).join('');
    }
    
    // ==================== GESTION DES FORMATIONS ====================
    
    const formationsList = document.getElementById('formationsList');
    if (formationsList) {
        const formations = {
            licences: [
                { id: 1, titre: 'Licence en Management', duree: '3 ans', frais: '550 000', status: 'active' },
                { id: 2, titre: 'Licence en Administration Publique', duree: '3 ans', frais: '550 000', status: 'active' },
                { id: 3, titre: 'Licence en Finance & Comptabilité', duree: '3 ans', frais: '550 000', status: 'active' }
            ],
            masters: [
                { id: 4, titre: 'Master en Management Stratégique', duree: '2 ans', frais: '725 000', status: 'active' },
                { id: 5, titre: 'Master en Finance', duree: '2 ans', frais: '725 000', status: 'active' }
            ],
            professionnelles: [
                { id: 6, titre: 'Bachelor Marketing Digital', duree: '1 an', frais: '440 000', status: 'active' },
                { id: 7, titre: 'Certification RH', duree: '6 mois', frais: '250 000', status: 'inactive' }
            ]
        };
        
        function renderFormations(type) {
            const data = formations[type];
            if (!data) return;
            
            formationsList.innerHTML = data.map(f => `
                <div class="formation-item">
                    <div class="formation-info">
                        <h3>${f.titre}</h3>
                        <p>Durée: ${f.duree} | Frais: ${f.frais} FCFA</p>
                        <span class="status ${f.status === 'active' ? 'success' : 'danger'}">${f.status === 'active' ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div class="formation-actions">
                        <button class="btn-edit" onclick="editFormation(${f.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn-delete" onclick="deleteFormation(${f.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `).join('');
        }
        
        // Onglets formations
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.getAttribute('data-tab');
                renderFormations(tab);
            });
        });
        
        renderFormations('licences');
    }
    
    // ==================== GESTION DU CONTENU ====================
    
    // Onglets contenu
    const contentTabs = document.querySelectorAll('.tabs .tab-btn');
    const contentTabsContent = document.querySelectorAll('.tab-content');
    
    if (contentTabs.length) {
        contentTabs.forEach(btn => {
            btn.addEventListener('click', () => {
                contentTabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                contentTabsContent.forEach(content => content.classList.remove('active'));
                const tabId = btn.getAttribute('data-tab');
                document.getElementById(`${tabId}Tab`).classList.add('active');
            });
        });
    }
    
    // Éditeur de contenu
    const editorModal = document.getElementById('editorModal');
    const editorContent = document.getElementById('editorContent');
    let currentPage = '';
    
    const editButtons = document.querySelectorAll('.btn-edit[data-page]');
    editButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = btn.getAttribute('data-page');
            document.getElementById('editorTitle').textContent = `Éditer - Page ${currentPage}`;
            // Simuler le chargement du contenu
            editorContent.value = `<h1>Contenu de la page ${currentPage}</h1>\n<p>Lorem ipsum dolor sit amet...</p>`;
            editorModal.style.display = 'flex';
        });
    });
    
    // Fermer les modals
    const closeButtons = document.querySelectorAll('.close, .btn-cancel');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Sauvegarder le contenu
    const saveContentBtn = document.getElementById('saveContentBtn');
    if (saveContentBtn) {
        saveContentBtn.addEventListener('click', () => {
            alert(`Contenu de la page ${currentPage} sauvegardé !`);
            editorModal.style.display = 'none';
        });
    }
    
    // ==================== FONCTIONS GLOBALES ====================
    
    window.viewCandidate = function(id) {
        alert(`Affichage du candidat ${id}`);
        // Ouvrir modal avec les détails
    };
    
    window.deleteCandidate = function(id) {
        if (confirm(`Supprimer le candidat ${id} ?`)) {
            alert(`Candidat ${id} supprimé`);
        }
    };
    
    window.viewPayment = function(id) {
        alert(`Détails du paiement ${id}`);
    };
    
    window.printReceipt = function(id) {
        window.print();
    };
    
    window.editFormation = function(id) {
        alert(`Modification de la formation ${id}`);
    };
    
    window.deleteFormation = function(id) {
        if (confirm(`Supprimer cette formation ?`)) {
            alert(`Formation ${id} supprimée`);
        }
    };
    
    // Articles, slides et enseignants
    const addArticleBtn = document.getElementById('addArticleBtn');
    if (addArticleBtn) {
        addArticleBtn.addEventListener('click', () => {
            alert('Formulaire d\'ajout d\'article');
        });
    }
    
    const addSlideBtn = document.getElementById('addSlideBtn');
    if (addSlideBtn) {
        addSlideBtn.addEventListener('click', () => {
            alert('Ajouter une image au carousel');
        });
    }
    
    const addTeacherBtn = document.getElementById('addTeacherBtn');
    if (addTeacherBtn) {
        addTeacherBtn.addEventListener('click', () => {
            alert('Ajouter un membre de l\'équipe pédagogique');
        });
    }

    // ==================== GESTION DES ÉTUDIANTS ====================

const studentsList = document.getElementById('studentsList');
if (studentsList) {
    const students = [
        { matricule: 'ISMAP2026001', nom: 'Dupont Jean', prenom: 'Jean', formation: 'Licence Management', annee: '1', telephone: '060123456', statut: 'actif' },
        { matricule: 'ISMAP2026002', nom: 'Mbega Paul', prenom: 'Paul', formation: 'Master Finance', annee: '2', telephone: '065432198', statut: 'actif' },
        { matricule: 'ISMAP2026003', nom: 'Claire Marie', prenom: 'Marie', formation: 'Bachelor Marketing', annee: '1', telephone: '077889900', statut: 'actif' },
        { matricule: 'ISMAP2025001', nom: 'Obiang Luc', prenom: 'Luc', formation: 'Licence Management', annee: '3', telephone: '066554433', statut: 'diplome' }
    ];
    
    function getStudentStatusBadge(statut) {
        const statusMap = {
            'actif': '<span class="status success">Actif</span>',
            'suspendu': '<span class="status warning">Suspendu</span>',
            'diplome': '<span class="status info">Diplômé</span>'
        };
        return statusMap[statut] || statusMap.actif;
    }
    
    function renderStudents(filteredStudents) {
        studentsList.innerHTML = filteredStudents.map(s => `
            <tr>
                <td><input type="checkbox" class="student-checkbox" data-matricule="${s.matricule}"></td>
                <td><strong>${s.matricule}</strong></td>
                <td>${s.prenom} ${s.nom}</td>
                <td>${s.formation}</td>
                <td>${s.annee}</td>
                <td>${s.telephone}</td>
                <td>${getStudentStatusBadge(s.statut)}</td>
                <td>
                    <button class="btn-edit" onclick="viewStudent('${s.matricule}')"><i class="fas fa-eye"></i></button>
                    <button class="btn-delete" onclick="deleteStudent('${s.matricule}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }
    
    renderStudents(students);
    
    // Sélectionner tous les étudiants
    const selectAllStudents = document.getElementById('selectAllStudents');
    if (selectAllStudents) {
        selectAllStudents.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.student-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });
    }
    
    // Ajouter un étudiant
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentModal = document.getElementById('studentModal');
    
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
            document.getElementById('studentModalTitle').textContent = 'Ajouter un étudiant';
            document.getElementById('studentForm').reset();
            studentModal.style.display = 'flex';
        });
    }
    
    // Sauvegarder étudiant
    const saveStudentBtn = document.getElementById('saveStudentBtn');
    if (saveStudentBtn) {
        saveStudentBtn.addEventListener('click', () => {
            const matricule = document.getElementById('matricule').value;
            if (matricule) {
                alert(`Étudiant ${matricule} enregistré avec succès !`);
                studentModal.style.display = 'none';
            } else {
                alert('Veuillez remplir tous les champs obligatoires.');
            }
        });
    }
}

// ==================== GESTION DES UTILISATEURS ====================

const usersList = document.getElementById('usersList');
if (usersList) {
    const users = [
        { id: 1, nom: 'Admin', prenom: 'Système', email: 'admin@ismap2.com', role: 'administrateur', lastLogin: '15/03/2026 09:23', statut: 'actif' },
        { id: 2, nom: 'Mboumba', prenom: 'Pierre', email: 'p.mboumba@ismap2.com', role: 'enseignant', lastLogin: '14/03/2026 14:15', statut: 'actif' },
        { id: 3, nom: 'Ndong', prenom: 'Marie', email: 'm.ndong@ismap2.com', role: 'comptable', lastLogin: '13/03/2026 11:45', statut: 'actif' }
    ];
    
    function getRoleBadge(role) {
        const roleMap = {
            'administrateur': '<span class="status info">Administrateur</span>',
            'enseignant': '<span class="status success">Enseignant</span>',
            'comptable': '<span class="status warning">Comptable</span>',
            'secretaire': '<span class="status info">Secrétariat</span>'
        };
        return roleMap[role] || roleMap.administrateur;
    }
    
    function getUserStatusBadge(statut) {
        return statut === 'actif' ? '<span class="status success">Actif</span>' : '<span class="status danger">Inactif</span>';
    }
    
    function renderUsers(filteredUsers) {
        usersList.innerHTML = filteredUsers.map(u => `
            <tr>
                <td><input type="checkbox" class="user-checkbox" data-id="${u.id}"></td>
                <td><img src="../assets/images/default-avatar.png" class="user-avatar-small"></td>
                <td>${u.prenom} ${u.nom}</td>
                <td>${u.email}</td>
                <td>${getRoleBadge(u.role)}</td>
                <td>${u.lastLogin}</td>
                <td>${getUserStatusBadge(u.statut)}</td>
                <td>
                    <button class="btn-edit" onclick="editUser(${u.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>
                    <button class="btn-info" onclick="viewUserActivity(${u.id})"><i class="fas fa-history"></i></button>
                </td>
            </tr>
        `).join('');
    }
    
    renderUsers(users);
    
    // Ajouter un utilisateur
    const addUserBtn = document.getElementById('addUserBtn');
    const userModal = document.getElementById('userModal');
    
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            document.getElementById('userModalTitle').textContent = 'Ajouter un utilisateur';
            document.getElementById('userForm').reset();
            userModal.style.display = 'flex';
        });
    }
}

// ==================== PARAMÈTRES ====================

// Onglets paramètres
const settingsTabs = document.querySelectorAll('.settings-tab');
const settingsContents = document.querySelectorAll('.settings-content');

if (settingsTabs.length) {
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            settingsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            settingsContents.forEach(content => content.classList.remove('active'));
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}Settings`).classList.add('active');
        });
    });
}

// Calcul automatique des totaux des frais
function calculateTotal(inscriptionId, scolariteId, totalId) {
    const inscription = parseInt(document.getElementById(inscriptionId).value) || 0;
    const scolarite = parseInt(document.getElementById(scolariteId).value) || 0;
    const total = inscription + scolarite;
    document.getElementById(totalId).textContent = total.toLocaleString('fr-FR');
}

// Écouter les changements sur les frais
['licence', 'master', 'pro'].forEach(type => {
    const inscriptionInput = document.getElementById(`${type}_inscription`);
    const scolariteInput = document.getElementById(`${type}_scolarite`);
    if (inscriptionInput && scolariteInput) {
        inscriptionInput.addEventListener('input', () => calculateTotal(`${type}_inscription`, `${type}_scolarite`, `${type}_total`));
        scolariteInput.addEventListener('input', () => calculateTotal(`${type}_inscription`, `${type}_scolarite`, `${type}_total`));
    }
});

// Changer mot de passe
const changePasswordBtn = document.getElementById('changePasswordBtn');
const changePasswordModal = document.getElementById('changePasswordModal');

if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
        changePasswordModal.style.display = 'flex';
    });
}

// Sauvegarder mot de passe
const savePasswordBtn = document.getElementById('savePasswordBtn');
if (savePasswordBtn) {
    savePasswordBtn.addEventListener('click', () => {
        const newPassword = document.getElementById('new_password').value;
        const confirmPassword = document.getElementById('confirm_new_password').value;
        
        if (newPassword !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }
        
        if (newPassword.length < 8) {
            alert('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        
        alert('Mot de passe modifié avec succès !');
        changePasswordModal.style.display = 'none';
        document.getElementById('changePasswordForm').reset();
    });
}

// Test email
const testEmailBtn = document.getElementById('testEmailBtn');
if (testEmailBtn) {
    testEmailBtn.addEventListener('click', () => {
        alert('Email de test envoyé avec succès !');
    });
}

// Sauvegarder tous les paramètres
const saveAllSettingsBtn = document.getElementById('saveAllSettingsBtn');
if (saveAllSettingsBtn) {
    saveAllSettingsBtn.addEventListener('click', () => {
        alert('Tous les paramètres ont été sauvegardés avec succès !');
    });
}

// Sauvegarder un tarif spécifique
const saveTarifBtns = document.querySelectorAll('.btn-save-tarif');
saveTarifBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        alert(`Tarif ${btn.getAttribute('data-type')} sauvegardé !`);
    });
});

// Sauvegarde maintenant
const backupNowBtn = document.getElementById('backupNowBtn');
if (backupNowBtn) {
    backupNowBtn.addEventListener('click', () => {
        alert('Sauvegarde de la base de données en cours...\nFichier créé : ismap2_backup_' + new Date().toISOString().slice(0,10) + '.sql');
    });
}

// Réinitialiser paramètres
const resetSettingsBtn = document.getElementById('resetSettingsBtn');
if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ? Cette action est irréversible.')) {
            alert('Tous les paramètres ont été réinitialisés.');
        }
    });
}

// Fonctions globales pour utilisateurs
window.editUser = function(id) {
    alert(`Modification de l'utilisateur ${id}`);
    // Ouvrir modal avec les données
};

window.deleteUser = function(id) {
    if (confirm(`Supprimer l'utilisateur ${id} ?`)) {
        alert(`Utilisateur ${id} supprimé`);
    }
};

window.viewUserActivity = function(id) {
    const activityModal = document.getElementById('activityModal');
    if (activityModal) {
        activityModal.style.display = 'flex';
    }
};

window.viewStudent = function(matricule) {
    alert(`Affichage de la fiche de l'étudiant ${matricule}`);
    // Ouvrir modal avec les détails
};

window.deleteStudent = function(matricule) {
    if (confirm(`Supprimer l'étudiant ${matricule} ?`)) {
        alert(`Étudiant ${matricule} supprimé`);
    }
};
});