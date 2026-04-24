// ──────────────────────────────────────────────
//  VIDEOWAVES TIMER — RAZORPAY PAYMENT & LICENSING HANDLER
//  Price: ₹2222
// ──────────────────────────────────────────────

const RAZORPAY_KEY  = 'YOUR_KEY_ID';       // 👈 Replace with your Razorpay Key ID
const DOWNLOAD_URL  = 'YOUR_DOWNLOAD_URL'; // 👈 Replace with your download link
const REGULAR_PRICE = 222200;              // ₹2222 in paise
const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';

// ── UPDATE UI ELEMENTS ──
function updatePriceUI() {
    // We are using a fixed regular price now.
    // Hide early bird banner
    const banner = document.getElementById('early-bird-banner');
    if (banner) banner.style.display = 'none';

    const priceEl     = document.getElementById('price-display');
    const labelEl     = document.getElementById('price-label-tag');
    const btnTextEl   = document.getElementById('buy-btn-text');
    const strikeEl    = document.getElementById('price-strikethrough');

    if (priceEl)     priceEl.textContent     = '₹2,222';
    if (labelEl)     { labelEl.textContent   = 'Regular Price'; labelEl.classList.add('regular'); }
    if (btnTextEl)   btnTextEl.textContent   = '💳 Buy Now for ₹2,222';
    if (strikeEl)    strikeEl.style.display  = 'none';
}

// ── LIVE CLOCK ANIMATION IN MOCKUP ──
(function animateClock() {
    const el = document.getElementById('live-clock');
    if (!el) return;
    let secs = 300;
    setInterval(() => {
        secs--;
        if (secs < 0) secs = 300;
        const m = String(Math.floor(secs / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        el.textContent = `${m}:${s}`;
    }, 1000);
})();

// ── GENERATE LICENSE KEY ──
function generateLicenseKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'VW-';
    for (let i = 0; i < 4; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    key += '-';
    for (let i = 0; i < 4; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    key += '-';
    for (let i = 0; i < 4; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    return key;
}

// ── OPEN RAZORPAY PAYMENT ──
function openPayment() {
    // Get user details first (for sending email)
    const userEmail = prompt("Please enter your Email Address where we should send the License Key:");
    if (!userEmail || !userEmail.includes('@')) {
        alert("A valid email address is required to receive your software license.");
        return;
    }

    if (RAZORPAY_KEY === 'YOUR_KEY_ID') {
        // DEMO MODE
        alert(`🔧 Demo Mode\n\nPrice: ₹2,222\n\nAdd your Razorpay Key in payment.js to enable real payments.`);
        processSale(userEmail, 'demo_payment_id');
        return;
    }

    const options = {
        key: RAZORPAY_KEY,
        amount: REGULAR_PRICE,
        currency: 'INR',
        name: 'Videowaves',
        description: `Pro Broadcast Timer — ₹2,222 Lifetime License`,
        image: 'https://raw.githubusercontent.com/softvww/pro-broadcast-timer/main/icon.png',
        theme: { color: '#00b4d8' },
        prefill: { email: userEmail },
        handler: function (response) {
            console.log('Payment ID:', response.razorpay_payment_id);
            processSale(userEmail, response.razorpay_payment_id);
        },
        modal: {
            ondismiss: function () { console.log('Payment dismissed.'); }
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

async function processSale(userEmail, paymentId) {
    try {
        // 1. Generate Key
        const licenseKey = generateLicenseKey();
        console.log("Generated License Key:", licenseKey);

        // 2. Save to Firebase Firestore
        // We use the global window.db and window.setDoc exposed in index.html
        if (window.db && window.setDoc && window.doc) {
            await window.setDoc(window.doc(window.db, "licenses", licenseKey), {
                email: userEmail,
                paymentId: paymentId,
                machineId: "", // Will be set when they first activate the app
                status: "active",
                createdAt: new Date().toISOString()
            });
            console.log("Saved to Firebase!");
        } else {
            console.warn("Firebase not initialized or missing config.");
        }

        // 3. Send Email to Customer via EmailJS
        if (typeof emailjs !== 'undefined' && EMAILJS_SERVICE_ID !== 'YOUR_EMAILJS_SERVICE_ID') {
            // Customer Email
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                to_email: userEmail,
                license_key: licenseKey,
                download_url: DOWNLOAD_URL
            });
            console.log("Customer email sent!");

            // Merchant Notification Email (To You)
            // Replace 'YOUR_NOTIFICATION_TEMPLATE_ID' with a simple template
            await emailjs.send(EMAILJS_SERVICE_ID, 'YOUR_NOTIFICATION_TEMPLATE_ID', {
                to_email: 'YOUR_OWN_EMAIL@GMAIL.COM', 
                message: `New Sale Alert! 🚀\n\nCustomer: ${userEmail}\nKey: ${licenseKey}\nPayment ID: ${paymentId}\nAmount: ₹2,222`
            });
            console.log("Merchant notification sent!");
        } else {
            console.warn("EmailJS not initialized or missing config.");
        }

        // 4. Show Success UI
        showSuccess(licenseKey);

    } catch (error) {
        console.error("Error processing sale:", error);
        alert("Payment successful, but there was an error generating your key. Please contact support.");
    }
}

function showSuccess(licenseKey) {
    const modal = document.getElementById('success-modal');
    const link  = document.getElementById('download-link');
    if (link) link.href = DOWNLOAD_URL;
    
    // Inject license key into modal
    let keyDisplay = document.getElementById('generated-key-display');
    if (!keyDisplay) {
        keyDisplay = document.createElement('div');
        keyDisplay.id = 'generated-key-display';
        keyDisplay.style.cssText = "background: rgba(0,255,200,0.1); border: 1px dashed #00ffcc; color: #00ffcc; padding: 15px; border-radius: 8px; font-family: 'Roboto Mono', monospace; font-size: 1.2rem; letter-spacing: 2px; margin: 20px 0;";
        
        const note = document.querySelector('.modal-note');
        note.parentNode.insertBefore(keyDisplay, note);
    }
    keyDisplay.innerHTML = `Your License Key:<br><strong>${licenseKey}</strong>`;

    if (modal) modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) modal.classList.add('hidden');
}

// ── INIT ON PAGE LOAD ──
document.addEventListener('DOMContentLoaded', updatePriceUI);
