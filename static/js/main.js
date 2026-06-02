document.addEventListener('DOMContentLoaded', () => {
    const rsvpForm = document.getElementById('rsvp-form');
    const plusOneCheckbox = document.getElementById('has_plus_one');
    const plusOneFields = document.getElementById('plus-one-fields');
    const toggleLookup = document.getElementById('toggle-lookup');
    const lookupSection = document.getElementById('lookup-section');
    const btnFetchRsvp = document.getElementById('btn-fetch-rsvp');
    const toast = document.getElementById('toast');

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
            toggleLookup.style.backgroundColor = '#F9C613'; // Q-R Yellow highlight
        } else {
            lookupSection.classList.add('hidden');
            toggleLookup.textContent = 'Modify RSVP';
            toggleLookup.style.backgroundColor = '';
        }
    });

    // Helper: Show custom toast message
    function showToast(message, duration = 3000) {
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
        
        try {
            const response = await fetch(`/api/rsvp/${encodeURIComponent(fullPhone)}`);
            const data = await response.json();

            if (response.ok && data.success) {
                const guest = data.guest;
                
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

                showToast('Ticket details fetched! Modify details and re-submit.');
                
                // Close lookup panel and reset button text
                lookupSection.classList.add('hidden');
                toggleLookup.textContent = 'Modify RSVP';
                toggleLookup.style.backgroundColor = '';
            } else {
                showToast(data.message || 'Ticket not found.');
            }
        } catch (error) {
            console.error('Error fetching RSVP:', error);
            showToast('Failed to fetch ticket. Please try again.');
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
            plus_one_name: plusOneName,
            plus_one_dietary: plusOneDietary
        };

        try {
            const response = await fetch('/api/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showToast(data.message || 'Boarding Pass Generated!');
                
                // If the user marked themselves as Pass, clear form inputs
                if (status === 'Pass') {
                    rsvpForm.reset();
                    plusOneFields.classList.remove('open');
                }
            } else {
                showToast(data.message || 'Error printing boarding pass.');
            }
        } catch (error) {
            console.error('Error submitting RSVP:', error);
            showToast('Connection error. Please try again.');
        }
    });
});
