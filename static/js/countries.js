// ── Country dial codes ────────────────────────────────────────
var COUNTRIES = [
    { code: "+91",  flag: "🇮🇳", name: "India" },
    { code: "+1",   flag: "🇺🇸", name: "United States" },
    { code: "+1",   flag: "🇨🇦", name: "Canada" },
    { code: "+44",  flag: "🇬🇧", name: "United Kingdom" },
    { code: "+61",  flag: "🇦🇺", name: "Australia" },
    { code: "+64",  flag: "🇳🇿", name: "New Zealand" },
    { code: "+65",  flag: "🇸🇬", name: "Singapore" },
    { code: "+60",  flag: "🇲🇾", name: "Malaysia" },
    { code: "+63",  flag: "🇵🇭", name: "Philippines" },
    { code: "+66",  flag: "🇹🇭", name: "Thailand" },
    { code: "+62",  flag: "🇮🇩", name: "Indonesia" },
    { code: "+84",  flag: "🇻🇳", name: "Vietnam" },
    { code: "+82",  flag: "🇰🇷", name: "South Korea" },
    { code: "+81",  flag: "🇯🇵", name: "Japan" },
    { code: "+86",  flag: "🇨🇳", name: "China" },
    { code: "+852", flag: "🇭🇰", name: "Hong Kong" },
    { code: "+886", flag: "🇹🇼", name: "Taiwan" },
    { code: "+971", flag: "🇦🇪", name: "UAE" },
    { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
    { code: "+974", flag: "🇶🇦", name: "Qatar" },
    { code: "+973", flag: "🇧🇭", name: "Bahrain" },
    { code: "+968", flag: "🇴🇲", name: "Oman" },
    { code: "+965", flag: "🇰🇼", name: "Kuwait" },
    { code: "+20",  flag: "🇪🇬", name: "Egypt" },
    { code: "+27",  flag: "🇿🇦", name: "South Africa" },
    { code: "+234", flag: "🇳🇬", name: "Nigeria" },
    { code: "+254", flag: "🇰🇪", name: "Kenya" },
    { code: "+233", flag: "🇬🇭", name: "Ghana" },
    { code: "+255", flag: "🇹🇿", name: "Tanzania" },
    { code: "+256", flag: "🇺🇬", name: "Uganda" },
    { code: "+49",  flag: "🇩🇪", name: "Germany" },
    { code: "+33",  flag: "🇫🇷", name: "France" },
    { code: "+39",  flag: "🇮🇹", name: "Italy" },
    { code: "+34",  flag: "🇪🇸", name: "Spain" },
    { code: "+31",  flag: "🇳🇱", name: "Netherlands" },
    { code: "+41",  flag: "🇨🇭", name: "Switzerland" },
    { code: "+46",  flag: "🇸🇪", name: "Sweden" },
    { code: "+47",  flag: "🇳🇴", name: "Norway" },
    { code: "+45",  flag: "🇩🇰", name: "Denmark" },
    { code: "+358", flag: "🇫🇮", name: "Finland" },
    { code: "+48",  flag: "🇵🇱", name: "Poland" },
    { code: "+43",  flag: "🇦🇹", name: "Austria" },
    { code: "+32",  flag: "🇧🇪", name: "Belgium" },
    { code: "+351", flag: "🇵🇹", name: "Portugal" },
    { code: "+30",  flag: "🇬🇷", name: "Greece" },
    { code: "+420", flag: "🇨🇿", name: "Czech Republic" },
    { code: "+36",  flag: "🇭🇺", name: "Hungary" },
    { code: "+40",  flag: "🇷🇴", name: "Romania" },
    { code: "+7",   flag: "🇷🇺", name: "Russia" },
    { code: "+380", flag: "🇺🇦", name: "Ukraine" },
    { code: "+55",  flag: "🇧🇷", name: "Brazil" },
    { code: "+52",  flag: "🇲🇽", name: "Mexico" },
    { code: "+54",  flag: "🇦🇷", name: "Argentina" },
    { code: "+56",  flag: "🇨🇱", name: "Chile" },
    { code: "+57",  flag: "🇨🇴", name: "Colombia" },
    { code: "+51",  flag: "🇵🇪", name: "Peru" },
    { code: "+58",  flag: "🇻🇪", name: "Venezuela" },
    { code: "+92",  flag: "🇵🇰", name: "Pakistan" },
    { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
    { code: "+94",  flag: "🇱🇰", name: "Sri Lanka" },
    { code: "+977", flag: "🇳🇵", name: "Nepal" },
    { code: "+93",  flag: "🇦🇫", name: "Afghanistan" },
    { code: "+98",  flag: "🇮🇷", name: "Iran" },
    { code: "+90",  flag: "🇹🇷", name: "Turkey" },
    { code: "+972", flag: "🇮🇱", name: "Israel" },
    { code: "+962", flag: "🇯🇴", name: "Jordan" },
    { code: "+961", flag: "🇱🇧", name: "Lebanon" },
];

function buildCountryOptions(selectEl, defaultCode) {
    defaultCode = defaultCode || "+91";
    selectEl.innerHTML = "";
    COUNTRIES.forEach(function(c) {
        var opt = document.createElement("option");
        opt.value = c.code;
        opt.textContent = c.flag + " " + c.name + " (" + c.code + ")";
        if (c.code === defaultCode && !selectEl.querySelector("option[selected]")) {
            opt.selected = true;
        }
        selectEl.appendChild(opt);
    });
}

// Populate all country-code selects on the page
document.querySelectorAll("select.country-code").forEach(function(sel) {
    buildCountryOptions(sel, "+91");
});
