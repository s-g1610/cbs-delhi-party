// Supabase Configuration - REPLACE placeholders with your details from Settings -> API
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_KEY = "your-anon-public-key";

// Initialize Supabase Client if configured
let supabase = null;
const isConfigured = SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes("your-project-id");

if (isConfigured && typeof window.supabase !== 'undefined') {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Connected directly to Supabase Cloud Database.");
    } catch (e) {
        console.error("Failed to initialize Supabase client:", e);
    }
} else {
    console.warn("Supabase credentials unset. Running in LocalStorage Sandbox Mode.");
}

document.addEventListener('DOMContentLoaded', () => {
    // Form and Step selectors
    const rsvpForm = document.getElementById('rsvp-form');
    const plusOneCheckbox = document.getElementById('has_plus_one');
    const plusOneFields = document.getElementById('plus-one-fields');
    const toggleLookup = document.getElementById('toggle-lookup');
    const lookupSection = document.getElementById('lookup-section');
    const btnFetchRsvp = document.getElementById('btn-fetch-rsvp');
    const toast = document.getElementById('toast');

    // Multi-pane navigation elements
    const panes = document.querySelectorAll('.step-pane');
    const stations = document.querySelectorAll('.station');
    const btnNext = document.querySelectorAll('.btn-next');
    const btnPrev = document.querySelectorAll('.btn-prev');
    const btnToSummary = document.getElementById('btn-to-summary');

    let currentStep = 1;

    // Show warning if operating in Sandbox Mode
    if (!supabase) {
        setTimeout(() => {
            showToast("Sandbox Mode: Add Supabase credentials in main.js to sync with Cloud!");
        }, 1200);
    }

    // Step navigation controller
    function navigateToStep(step) {
        if (step < 1 || step > 4) return;
        
        // Hide all panes
        panes.forEach(pane => pane.classList.remove('active'));
        
        // Show active pane
        const targetPane = document.getElementById(`pane-${step}`);
        if (targetPane) targetPane.classList.add('active');

        // Update metro tracker bullets
        stations.forEach(station => {
            const stationStep = parseInt(station.dataset.step);
            station.classList.remove('active', 'completed');
            
            if (stationStep === step) {
                station.classList.add('active');
            } else if (stationStep < step) {
                station.classList.add('completed');
            }
        });

        currentStep = step;
    }

    // Next step triggers with form validation
    btnNext.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetStep = parseInt(btn.dataset.next);

            // Validation for Step 2 (Name & Phone)
            if (currentStep === 2) {
                const name = document.getElementById('name').value.trim();
                const phone = document.getElementById('phone_number').value.trim();
                if (!name || !phone) {
                    showToast("Please enter your name and phone number.");
                    return;
                }
            }

            navigateToStep(targetStep);
        });
    });

    // Previous step triggers
    btnPrev.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetStep = parseInt(btn.dataset.prev);
            navigateToStep(targetStep);
        });
    });

    // Review Ticket (Compile Summary on Step 4)
    btnToSummary.addEventListener('click', () => {
        const name = document.getElementById('name').value.trim();
        const countryCode = document.getElementById('country-code').value;
        const rawPhone = document.getElementById('phone_number').value.trim();
        const status = document.querySelector('input[name="status"]:checked').value;
        const dietary = document.querySelector('input[name="dietary_pref"]:checked').value;
        const hasPlusOne = plusOneCheckbox.checked;

        // Map values to Boarding Ticket review card
        document.getElementById('summary-name').textContent = name;
        document.getElementById('summary-phone').textContent = `${countryCode} ${rawPhone}`;
        
        let statusText = "Yeah, count me in.";
        if (status === "Hell Yeah") statusText = "HELL YEAH! 🚀";
        if (status === "Pass") statusText = "I'll pass this time.";
        document.getElementById('summary-status').textContent = statusText;
        document.getElementById('summary-diet').textContent = dietary;

        // Render guest column if plus one is toggled
        const summaryPlusOneRow = document.getElementById('summary-plus-one-row');
        if (hasPlusOne) {
            const plusOneName = document.getElementById('plus_one_name').value.trim() || "Guest";
            const plusOneDietary = document.querySelector('input[name="plus_one_dietary"]:checked').value;
            
            summaryPlusOneRow.classList.remove('hidden');
            document.getElementById('summary-plus-one-val').textContent = `${plusOneName} (${plusOneDietary})`;
        } else {
            summaryPlusOneRow.classList.add('hidden');
        }
    });

    // Show or hide plus one fields smoothly
    plusOneCheckbox.addEventListener('change', () => {
        if (plusOneCheckbox.checked) {
            plusOneFields.classList.add('open');
            document.getElementById('plus_one_name').setAttribute('required', 'true');
        } else {
            plusOneFields.classList.remove('open');
            document.getElementById('plus_one_name').removeAttribute('required');
        }
    });

    // Toggle Lookup Section visibility
    toggleLookup.addEventListener('click', () => {
        if (lookupSection.classList.contains('hidden')) {
            lookupSection.classList.remove('hidden');
            toggleLookup.textContent = 'Back to RSVP';
            toggleLookup.style.backgroundColor = '#F9C613';
        } else {
            lookupSection.classList.add('hidden');
            toggleLookup.textContent = 'Modify Ticket';
            toggleLookup.style.backgroundColor = '';
        }
    });

    // Helper: Show custom toast message
    function showToast(message, duration = 4000) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        // Force reflow
        void toast.offsetWidth;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, duration);
    }

    // Retrieve / Fetch existing RSVP
    btnFetchRsvp.addEventListener('click', async () => {
        const countryCode = document.getElementById('lookup-country-code').value;
        const rawPhone = document.getElementById('lookup-phone').value.trim();

        if (!rawPhone) {
            showToast('Please enter a phone number.');
            return;
        }

        const fullPhone = `${countryCode}${rawPhone}`;
        let guest = null;

        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('guests')
                    .select('*')
                    .eq('phone_number', fullPhone)
                    .maybeSingle();

                if (error) {
                    console.error('Supabase query error:', error);
                    showToast(`Error: ${error.message}`);
                    return;
                }
                guest = data;
            } catch (err) {
                console.error('Database client error:', err);
                showToast('Failed to check database. Verify your internet connection.');
                return;
            }
        } else {
            // LocalStorage Sandbox Fallback
            const sandboxData = localStorage.getItem('cbs_party_rsvp');
            if (sandboxData) {
                const db = JSON.parse(sandboxData);
                guest = db[fullPhone] || null;
            }
        }

        if (guest) {
            // Pre-fill primary details
            document.getElementById('name').value = guest.name;
            document.getElementById('phone_number').value = rawPhone;
            document.getElementById('country-code').value = countryCode;

            // Select correct status radio button
            const statusRadio = document.querySelector(`input[name="status"][value="${guest.status}"]`);
            if (statusRadio) statusRadio.checked = true;

            // Select correct dietary preference
            const dietaryRadio = document.querySelector(`input[name="dietary_pref"][value="${guest.dietary_pref}"]`);
            if (dietaryRadio) dietaryRadio.checked = true;

            // Handle plus one
            if (guest.has_plus_one) {
                plusOneCheckbox.checked = true;
                plusOneFields.classList.add('open');
                document.getElementById('plus_one_name').value = guest.plus_one_name || '';
                document.getElementById('plus_one_name').setAttribute('required', 'true');
                
                const plusOneDietaryRadio = document.querySelector(`input[name="plus_one_dietary"][value="${guest.plus_one_dietary}"]`);
                if (plusOneDietaryRadio) plusOneDietaryRadio.checked = true;
            } else {
                plusOneCheckbox.checked = false;
                plusOneFields.classList.remove('open');
                document.getElementById('plus_one_name').value = '';
                document.getElementById('plus_one_name').removeAttribute('required');
            }

            showToast('Commuter profile found! Edit choices and proceed.');
            
            // Close lookup panel and go directly to Stop 2
            lookupSection.classList.add('hidden');
            toggleLookup.textContent = 'Modify Ticket';
            toggleLookup.style.backgroundColor = '';
            
            navigateToStep(2);
        } else {
            showToast('No boarding pass found for this number.');
        }
    });

    // Form Submission
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const countryCode = document.getElementById('country-code').value;
        const rawPhone = document.getElementById('phone_number').value.trim();
        const name = document.getElementById('name').value.trim();
        const status = document.querySelector('input[name="status"]:checked').value;
        const dietaryPref = document.querySelector('input[name="dietary_pref"]:checked').value;
        const hasPlusOne = plusOneCheckbox.checked;

        let plusOneName = '';
        let plusOneDietary = '';

        if (hasPlusOne) {
            plusOneName = document.getElementById('plus_one_name').value.trim();
            plusOneDietary = document.querySelector('input[name="plus_one_dietary"]:checked').value;
            if (!plusOneName) {
                showToast('Please enter your guest\'s name.');
                navigateToStep(3);
                return;
            }
        }

        const fullPhone = `${countryCode}${rawPhone}`;

        const payload = {
            phone_number: fullPhone,
            name: name,
            status: status,
            dietary_pref: dietaryPref,
            has_plus_one: hasPlusOne,
            plus_one_name: plusOneName || null,
            plus_one_dietary: plusOneDietary || null,
            updated_at: new Date().toISOString()
        };

        if (supabase) {
            try {
                const { error } = await supabase
                    .from('guests')
                    .upsert(payload);

                if (error) {
                    console.error('Supabase write error details:', error);
                    showToast(`Supabase Error: ${error.message} (Check table name/RLS policy)`);
                    return;
                }
                
                showToast('Boarding Pass successfully printed to Supabase Cloud!');
                
                // Reset step back to welcome screen on successful submit
                setTimeout(() => {
                    rsvpForm.reset();
                    plusOneFields.classList.remove('open');
                    navigateToStep(1);
                }, 3000);

            } catch (err) {
                console.error('Network/Client Error:', err);
                showToast(`Failed to upload ticket: ${err.message}`);
            }
        } else {
            // LocalStorage Sandbox Save
            const sandboxData = localStorage.getItem('cbs_party_rsvp') || '{}';
            const db = JSON.parse(sandboxData);
            db[fullPhone] = payload;
            localStorage.setItem('cbs_party_rsvp', JSON.stringify(db));

            showToast('Boarding Pass Printed! Saved locally (Sandbox Mode).');

            setTimeout(() => {
                rsvpForm.reset();
                plusOneFields.classList.remove('open');
                navigateToStep(1);
            }, 3000);
        }
    });
});
