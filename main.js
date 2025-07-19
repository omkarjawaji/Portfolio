// --- Game State ---
            let currentXP = 0;
            const collectedItems = new Set();
            const totalPossibleXP = Array.from(document.querySelectorAll('.interactive-item')).reduce((sum, item) => sum + parseInt(item.dataset.xp || 0), 0);

            // --- UI Elements ---
            const xpBarFiller = document.getElementById('xp-bar-filler');
            const animationContainer = document.getElementById('animation-container');
            const xpBarContainer = document.getElementById('xp-bar-container');
            
            // --- Modal Elements ---
            const detailsModal = document.getElementById('details-modal');
            const detailsModalTitle = document.getElementById('details-modal-title');
            const detailsModalContent = document.getElementById('details-modal-content');
            const detailsModalClose = document.getElementById('details-modal-close');
            
            const diagramModal = document.getElementById('diagram-modal');
            const diagramModalTitle = document.getElementById('diagram-modal-title');
            const diagramModalClose = document.getElementById('diagram-modal-close');

            // --- Core Game Logic ---
            function updateXPBar() {
                const percentage = Math.min((currentXP / totalPossibleXP) * 100, 100);
                xpBarFiller.style.height = `${percentage}%`;
            }
            
            function showFloatingXP(amount, event) {
                const xpAnim = document.createElement('div');
                xpAnim.textContent = `+${amount} XP`;
                xpAnim.className = 'xp-float-animation';
                xpAnim.style.left = `${event.clientX}px`;
                xpAnim.style.top = `${event.clientY}px`;
                animationContainer.appendChild(xpAnim);

                xpAnim.addEventListener('animationend', () => {
                    xpAnim.remove();
                });
            }

            function showMilestoneAnimation(text) {
                const milestoneAnim = document.createElement('div');
                milestoneAnim.textContent = text;
                milestoneAnim.className = 'milestone-animation';
                
                // Position relative to the bar
                const barRect = xpBarContainer.getBoundingClientRect();
                milestoneAnim.style.left = `${barRect.left - 10}px`; // position to the left of the bar
                milestoneAnim.style.bottom = `${window.innerHeight - barRect.bottom}px`; // align with bottom of bar
                milestoneAnim.style.transform = 'translateX(-100%)'; // ensure it's to the left

                document.body.appendChild(milestoneAnim);
                milestoneAnim.addEventListener('animationend', () => {
                    milestoneAnim.remove();
                });
            }

            function checkMilestones(oldXP, newXP) {
                const milestones = [
                    { xp: 25, text: "+25 XP!" },
                    { xp: 50, text: "+50 XP!" },
                    { xp: 75, text: "+75 XP!" },
                    { xp: totalPossibleXP, text: "YAY 100%!" }
                ];

                for (const ms of milestones) {
                    if (oldXP < ms.xp && newXP >= ms.xp) {
                        showMilestoneAnimation(ms.text);
                        break; // Show only one milestone at a time
                    }
                }
            }
            
            function openDetailsModal(title, content) {
                detailsModalTitle.textContent = title;
                detailsModalContent.textContent = content;
                detailsModal.classList.add('active');
            }
            
            function openDiagramModal(title) {
                diagramModalTitle.textContent = title;
                diagramModal.classList.add('active');
            }

            function closeModal() {
                detailsModal.classList.remove('active');
                diagramModal.classList.remove('active');
            }

            // Event listener for all interactive items
            document.body.addEventListener('click', (e) => {
                const diagramBtn = e.target.closest('.view-diagram-btn');
                const item = e.target.closest('.interactive-item');

                if (diagramBtn) {
                    e.stopPropagation();
                    const parentItem = diagramBtn.closest('.interactive-item');
                    openDiagramModal(parentItem.dataset.title);
                    return;
                }

                if (!item) return;

                const id = item.dataset.id;

                // --- Checkbox logic for work experience ---
                if (item.classList.contains('work-item')) {
                    const checkbox = item.querySelector('.work-checkbox');
                    if (!collectedItems.has(id)) {
                        checkbox.checked = true;
                    }
                }

                if (collectedItems.has(id)) {
                    if (!item.classList.contains('skill-tag')) {
                        openDetailsModal(item.dataset.title, item.dataset.content);
                    }
                    return;
                }

                collectedItems.add(id);
                const xpValue = parseInt(item.dataset.xp, 10);
                const oldXP = currentXP;
                currentXP += xpValue;

                showFloatingXP(xpValue, e);
                updateXPBar();
                checkMilestones(oldXP, currentXP);

                if (item.classList.contains('skill-tag')) {
                    item.classList.add('collected');
                } else {
                    item.classList.add('unlocked');
                    // Mark checkbox as checked for work experience
                    if (item.classList.contains('work-item')) {
                        const checkbox = item.querySelector('.work-checkbox');
                        checkbox.checked = true;
                    }
                    openDetailsModal(item.dataset.title, item.dataset.content);
                }
            });

            // On page load, ensure checkboxes reflect unlocked state (if any)
            document.querySelectorAll('.work-item.unlocked .work-checkbox').forEach(cb => {
                cb.checked = true;
            });

            // Listeners for closing the modals
            detailsModalClose.addEventListener('click', closeModal);
            diagramModalClose.addEventListener('click', closeModal);
            document.addEventListener('click', (e) => {
                if (e.target === detailsModal || e.target === diagramModal) {
                    closeModal();
                }
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeModal();
            });


            // --- Eye Tracking ---
            const faceBox = document.getElementById('face-box');
            const pupils = document.querySelectorAll('.pupil');
            if (faceBox) {
                faceBox.addEventListener('mousemove', (e) => {
                    const rect = faceBox.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    const angle = Math.atan2(y, x);
                    const distance = Math.min(Math.sqrt(x * x + y * y) * 0.1, 15);
                    const pupilX = Math.cos(angle) * distance;
                    const pupilY = Math.sin(angle) * distance;
                    pupils.forEach(pupil => {
                        pupil.style.transform = `translate(-50%, -50%) translate(${pupilX}px, ${pupilY}px)`;
                    });
                });
                faceBox.addEventListener('mouseleave', () => {
                    pupils.forEach(pupil => {
                        pupil.style.transform = 'translate(-50%, -50%) translate(0, 0)';
                    });
                });
            }

            // --- Cursor Glow Effect ---
            const cursorGlow = document.getElementById('cursor-glow');
            document.addEventListener('mousemove', (e) => {
                const size = 300;
                cursorGlow.style.width = `${size}px`;
                cursorGlow.style.height = `${size}px`;
                cursorGlow.style.left = `${e.clientX - size / 2}px`;
                cursorGlow.style.top = `${e.clientY - size / 2}px`;
            });

            // --- Section Scroll Animation ---
            const sections = document.querySelectorAll('.section-box');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, { threshold: 0.1 });
            sections.forEach(section => {
                observer.observe(section);
            });
            
            // Initialize XP bar
            updateXPBar();
