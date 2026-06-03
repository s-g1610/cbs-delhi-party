// ── Supabase Configuration ──────────────────────────────────
// Replace with your values from Supabase → Settings → API
var SUPABASE_URL = "https://dbdkzbjeoqdydqiscpzv.supabase.co";
var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZGt6Ymplb3FkeWRxaXNjcHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzODU4NTksImV4cCI6MjA5NTk2MTg1OX0.fn_ooD2ONbQWJb7xL38Ljpo052SH_Z5nfEI0y2e1CLo";

var sbClient = null;
var isConfigured = SUPABASE_URL.indexOf("supabase.co") !== -1 && SUPABASE_KEY.length > 20;

if (isConfigured && typeof window.supabase !== "undefined" && window.supabase.createClient) {
    try {
        sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Connected to Supabase.");
    } catch (e) {
        console.error("Failed to initialize Supabase:", e);
    }
} else {
    console.warn("Sandbox Mode: Supabase credentials not set in main.js");
}

// ── DOM refs ────────────────────────────────────────────────
var rsvpForm        = document.getElementById("rsvp-form");
var plusOneCheckbox = document.getElementById("has_plus_one");
var plusOneFields   = document.getElementById("plus-one-fields");
var toggleLookup    = document.getElementById("toggle-lookup");
var lookupSection   = document.getElementById("lookup-section");
var btnFetchRsvp    = document.getElementById("btn-fetch-rsvp");
var toastEl         = document.getElementById("toast");
var panes           = document.querySelectorAll(".step-pane");
var stations        = document.querySelectorAll(".station");
var btnsNext        = document.querySelectorAll(".btn-next");
var btnsPrev        = document.querySelectorAll(".btn-prev");
var btnToSummary    = document.getElementById("btn-to-summary");

var currentStep = 1;

console.log("[CBS] Script loaded. Panes:", panes.length, "Buttons:", btnsNext.length);

if (!sbClient) {
    setTimeout(function() {
        showToast("Sandbox Mode: Add Supabase credentials in main.js to enable cloud sync.");
    }, 1400);
}

// ── Step navigation ─────────────────────────────────────────
function navigateToStep(step) {
    if (step < 1 || step > 4) return;

    panes.forEach(function(p) { p.classList.remove("active"); });
    var target = document.getElementById("pane-" + step);
    if (target) target.classList.add("active");

    stations.forEach(function(s) {
        var n = parseInt(s.dataset.step);
        s.classList.remove("active", "completed");
        if (n === step) s.classList.add("active");
        else if (n < step) s.classList.add("completed");
    });

    currentStep = step;
    var formEl = document.querySelector(".rsvp-form");
    if (formEl) formEl.scrollTop = 0;

    if (step === 1 && sliderEl && thumbEl) {
        sliderEl.classList.remove("swiped");
        currentX = 0;
        thumbEl.style.transition = "";
        thumbEl.style.left = "4px";
        thumbEl.textContent = "🚇";
        if (fillEl) fillEl.style.width = "0px";
        var hint = document.querySelector(".swipe-hint");
        if (hint) hint.style.opacity = "";
    }
}

// ── Next buttons ─────────────────────────────────────────────
btnsNext.forEach(function(btn) {
    btn.addEventListener("click", function() {
        var targetStep = parseInt(btn.dataset.next);
        if (currentStep === 2) {
            var name  = document.getElementById("name").value.trim();
            var phone = document.getElementById("phone_number").value.trim();
            if (!name)  { showToast("Please enter your full name."); return; }
            if (!phone) { showToast("Please enter your WhatsApp number."); return; }
        }
        navigateToStep(targetStep);
    });
});

// ── Prev buttons ─────────────────────────────────────────────
btnsPrev.forEach(function(btn) {
    btn.addEventListener("click", function() {
        navigateToStep(parseInt(btn.dataset.prev));
    });
});

// ── Populate Review Ticket ────────────────────────────────────
if (btnToSummary) {
    btnToSummary.addEventListener("click", function() {
        var name        = document.getElementById("name").value.trim();
        var countryCode = document.getElementById("country-code").value;
        var rawPhone    = document.getElementById("phone_number").value.trim();
        var status      = document.querySelector("input[name='status']:checked").value;
        var dietary     = document.querySelector("input[name='dietary_pref']:checked").value;
        var hasPlusOne  = plusOneCheckbox.checked;

        var sorryScreen      = document.getElementById("sorry-screen");
        var boardingSection  = document.getElementById("boarding-pass-section");

        if (status === "Pass") {
            // Show sorry screen, hide boarding pass
            sorryScreen.classList.remove("hidden");
            boardingSection.classList.add("hidden");
        } else {
            // Show boarding pass, hide sorry screen
            sorryScreen.classList.add("hidden");
            boardingSection.classList.remove("hidden");

            document.getElementById("summary-name").textContent  = name || "—";
            document.getElementById("summary-phone").textContent = countryCode + " " + rawPhone;

            var statusMap = { "Hell Yeah": "HELL YEAH! 🚀", "Yeah": "Yeah, count me in." };
            document.getElementById("summary-status").textContent = statusMap[status] || status;
            document.getElementById("summary-diet").textContent   = dietary;

            var plusOneRow = document.getElementById("summary-plus-one-row");
            if (hasPlusOne) {
                var guestName    = document.getElementById("plus_one_name").value.trim() || "Guest";
                var guestDietary = document.querySelector("input[name='plus_one_dietary']:checked").value;
                plusOneRow.classList.remove("hidden");
                document.getElementById("summary-plus-one-val").textContent = guestName + " · " + guestDietary;
            } else {
                plusOneRow.classList.add("hidden");
            }
        }
    });
}

// ── +1 Toggle ─────────────────────────────────────────────────
plusOneCheckbox.addEventListener("change", function() {
    if (plusOneCheckbox.checked) {
        plusOneFields.classList.add("open");
        document.getElementById("plus_one_name").setAttribute("required", "true");
    } else {
        plusOneFields.classList.remove("open");
        document.getElementById("plus_one_name").removeAttribute("required");
    }
});

// ── Modify Ticket Toggle ──────────────────────────────────────
toggleLookup.addEventListener("click", function() {
    var isHidden = lookupSection.classList.contains("hidden");
    lookupSection.classList.toggle("hidden", !isHidden);
    toggleLookup.textContent      = isHidden ? "Back to RSVP" : "Modify Ticket";
    toggleLookup.style.background = isHidden ? "var(--subway-yellow)" : "";
    toggleLookup.style.color      = isHidden ? "var(--subway-black)" : "";
});

// ── Fetch Existing RSVP ───────────────────────────────────────
btnFetchRsvp.addEventListener("click", async function() {
    var countryCode = document.getElementById("lookup-country-code").value;
    var rawPhone    = document.getElementById("lookup-phone").value.trim();
    if (!rawPhone) { showToast("Please enter a phone number."); return; }

    var fullPhone = countryCode + rawPhone;
    var guest = null;

    if (sbClient) {
        try {
            var result = await sbClient.from("guests").select("*").eq("phone_number", fullPhone).maybeSingle();
            if (result.error) { showToast("Error: " + result.error.message); return; }
            guest = result.data;
        } catch (err) {
            showToast("Connection failed. Check your internet connection.");
            return;
        }
    } else {
        var raw = localStorage.getItem("cbs_party_rsvp");
        if (raw) guest = JSON.parse(raw)[fullPhone] || null;
    }

    if (guest) {
        document.getElementById("name").value         = guest.name;
        document.getElementById("phone_number").value = rawPhone;
        document.getElementById("country-code").value = countryCode;

        function setRadio(name, val) {
            var el = document.querySelector("input[name='" + name + "'][value='" + val + "']");
            if (el) el.checked = true;
        }
        setRadio("status", guest.status);
        setRadio("dietary_pref", guest.dietary_pref);

        if (guest.has_plus_one) {
            plusOneCheckbox.checked = true;
            plusOneFields.classList.add("open");
            document.getElementById("plus_one_name").value = guest.plus_one_name || "";
            document.getElementById("plus_one_name").setAttribute("required", "true");
            setRadio("plus_one_dietary", guest.plus_one_dietary);
        } else {
            plusOneCheckbox.checked = false;
            plusOneFields.classList.remove("open");
            document.getElementById("plus_one_name").value = "";
            document.getElementById("plus_one_name").removeAttribute("required");
        }

        showToast("Commuter profile loaded! Edit and resubmit to update.");
        lookupSection.classList.add("hidden");
        toggleLookup.textContent      = "Modify Ticket";
        toggleLookup.style.background = "";
        toggleLookup.style.color      = "";
        navigateToStep(2);
    } else {
        showToast("No boarding pass found for this number.");
    }
});

// ── Form Submit ───────────────────────────────────────────────
rsvpForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    var countryCode  = document.getElementById("country-code").value;
    var rawPhone     = document.getElementById("phone_number").value.trim();
    var name         = document.getElementById("name").value.trim();
    var status       = document.querySelector("input[name='status']:checked").value;
    var dietaryPref  = document.querySelector("input[name='dietary_pref']:checked").value;
    var hasPlusOne   = plusOneCheckbox.checked;

    var plusOneName = "", plusOneDietary = "";
    if (hasPlusOne) {
        plusOneName    = document.getElementById("plus_one_name").value.trim();
        plusOneDietary = document.querySelector("input[name='plus_one_dietary']:checked").value;
        if (!plusOneName) {
            showToast("Please enter your guest's name.");
            navigateToStep(3);
            return;
        }
    }

    var fullPhone = countryCode + rawPhone;

    // ── Capacity check (max 15 attending riders) ──────────────
    if (sbClient && status !== "Pass") {
        try {
            var capResult = await sbClient
                .from("guests")
                .select("phone_number, has_plus_one")
                .neq("status", "Pass");

            if (!capResult.error) {
                var rows = capResult.data || [];
                // Exclude current user's own existing booking from count
                var others = rows.filter(function(r) { return r.phone_number !== fullPhone; });
                var riderCount = others.reduce(function(sum, r) { return sum + 1 + (r.has_plus_one ? 1 : 0); }, 0);
                // Add current submission's riders
                riderCount += 1 + (hasPlusOne ? 1 : 0);
                if (riderCount > 15) {
                    showToast("🚫 Booking limit exceeded — we're full! Reach out to Sparsh directly.", 6000);
                    return;
                }
            }
        } catch (err) {
            console.warn("Capacity check failed:", err.message);
        }
    }

    var payload = {
        phone_number:     fullPhone,
        name:             name,
        status:           status,
        dietary_pref:     dietaryPref,
        has_plus_one:     hasPlusOne,
        plus_one_name:    plusOneName    || null,
        plus_one_dietary: plusOneDietary || null,
        updated_at:       new Date().toISOString()
    };

    if (sbClient) {
        try {
            var result = await sbClient.from("guests").upsert(payload, { onConflict: "phone_number" });
            if (result.error) {
                console.error("Supabase upsert error:", result.error);
                showToast("Error: " + result.error.message, 6000);
                return;
            }
            showToast("🎟 Boarding Pass printed! See you on June 13.");
            setTimeout(resetForm, 3500);
        } catch (err) {
            console.error("Network error:", err);
            showToast("Network error: " + err.message);
        }
    } else {
        var db = JSON.parse(localStorage.getItem("cbs_party_rsvp") || "{}");
        db[fullPhone] = payload;
        localStorage.setItem("cbs_party_rsvp", JSON.stringify(db));
        showToast("🎟 Boarding Pass saved! (Sandbox Mode — add Supabase keys to sync to cloud)");
        setTimeout(resetForm, 3000);
    }
});

function resetForm() {
    rsvpForm.reset();
    plusOneFields.classList.remove("open");
    navigateToStep(1);
}

// ── Swipe Slider ──────────────────────────────────────────────
var sliderEl = document.getElementById('swipe-slider');
var thumbEl  = document.getElementById('swipe-thumb');

if (sliderEl && thumbEl) {
    // inject fill div
    var fillEl = document.createElement('div');
    fillEl.className = 'swipe-fill';
    sliderEl.insertBefore(fillEl, thumbEl);

    var dragging = false;
    var startX   = 0;
    var currentX = 0;
    var maxX     = 0;

    function getMaxX() {
        return sliderEl.offsetWidth - thumbEl.offsetWidth - 8;
    }

    function onStart(clientX) {
        if (sliderEl.classList.contains('swiped')) return;
        dragging = true;
        startX   = clientX - currentX;
        maxX     = getMaxX();
        thumbEl.style.transition = 'none';
    }

    function onMove(clientX) {
        if (!dragging) return;
        var x = Math.min(Math.max(clientX - startX, 0), maxX);
        currentX = x;
        thumbEl.style.left = (4 + x) + 'px';
        fillEl.style.width = (4 + x + thumbEl.offsetWidth / 2) + 'px';
        var progress = x / maxX;
        document.querySelector('.swipe-hint').style.opacity = Math.max(0, 1 - progress * 2);
    }

    function onEnd() {
        if (!dragging) return;
        dragging = false;
        thumbEl.style.transition = '';
        if (currentX >= maxX * 0.85) {
            // success — snap to end and navigate
            thumbEl.style.left = (4 + maxX) + 'px';
            fillEl.style.width = (4 + maxX + thumbEl.offsetWidth / 2) + 'px';
            sliderEl.classList.add('swiped');
            thumbEl.textContent = '✓';
            setTimeout(function() { navigateToStep(2); }, 400);
        } else {
            // snap back
            currentX = 0;
            thumbEl.style.left = '4px';
            fillEl.style.width = '0px';
            document.querySelector('.swipe-hint').style.opacity = '';
        }
    }

    // Mouse events
    thumbEl.addEventListener('mousedown',  function(e) { e.preventDefault(); onStart(e.clientX); });
    document.addEventListener('mousemove', function(e) { if (dragging) onMove(e.clientX); });
    document.addEventListener('mouseup',   function()  { onEnd(); });

    // Touch events
    thumbEl.addEventListener('touchstart', function(e) { e.preventDefault(); onStart(e.touches[0].clientX); }, { passive: false });
    document.addEventListener('touchmove', function(e) { if (dragging) { e.preventDefault(); onMove(e.touches[0].clientX); } }, { passive: false });
    document.addEventListener('touchend',  function()  { onEnd(); });
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, duration) {
    duration = duration || 4000;
    toastEl.textContent = message;
    toastEl.classList.remove("hidden");
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    setTimeout(function() {
        toastEl.classList.remove("show");
        setTimeout(function() { toastEl.classList.add("hidden"); }, 320);
    }, duration);
}
