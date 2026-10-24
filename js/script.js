import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

lucide.createIcons();

const apiKey = "";

function createHamsterAvatarDataUrl(bgHex, accentHex, visorHex) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <rect width="120" height="120" rx="24" fill="${bgHex}"/>
        <circle cx="30" cy="34" r="15" fill="#0b140b" stroke="${accentHex}" stroke-width="4.5"/>
        <circle cx="90" cy="34" r="15" fill="#0b140b" stroke="${accentHex}" stroke-width="4.5"/>
        <path d="M22 64 C12 78, 22 100, 60 100 C98 100, 108 78, 98 64 C95 44, 80 30, 60 30 C40 30, 25 44, 22 64 Z" fill="#101d10" stroke="${accentHex}" stroke-width="4.5"/>
        <rect x="26" y="47" width="68" height="22" rx="8" fill="${visorHex}" fill-opacity="0.28" stroke="${visorHex}" stroke-width="3.5"/>
        <circle cx="43" cy="58" r="6" fill="${accentHex}"/>
        <circle cx="77" cy="58" r="6" fill="${accentHex}"/>
        <polygon points="55,69 65,69 60,76" fill="${visorHex}"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const AVATAR_PRESETS = [
    createHamsterAvatarDataUrl('#061206', '#39FF14', '#00FF66'),
    createHamsterAvatarDataUrl('#05141c', '#00FFCC', '#39FF14'),
    createHamsterAvatarDataUrl('#140d1e', '#a855f7', '#39FF14'),
    createHamsterAvatarDataUrl('#191205', '#facc15', '#39FF14')
];

const SAMPLE_PROMPTS = [
    "A cybernetic arctic hamster (Dicrostonyx) wearing glowing neon-green tactical visor goggles, volumetric emerald fog, 8k octane render",
    "Futuristic ronin samurai standing under a holographic neon bonsai tree at midnight, obsidian armor",
    "Bioluminescent subterranean crystal cavern filled with glowing emerald flora and floating data Spores"
];

const state = {
    qualityLevel: 4,
    qualityMap: {
        1: { label: "STANDARD (512×512)", width: 512, height: 512 },
        2: { label: "HD (1280×720)", width: 1280, height: 720 },
        3: { label: "FULL HD (1920×1080)", width: 1920, height: 1080 },
        4: { label: "MAX 2K (2048×2048)", width: 2048, height: 2048 }
    },
    watermarkEnabled: true,
    exportWidth: 2048,
    exportHeight: 2048,
    baseImageCanvas: document.createElement('canvas'),
    currentPrompt: SAMPLE_PROMPTS[0],
    currentSeed: 849204,
    editor: { brightness: 100, contrast: 100, saturate: 100, hue: 0, tint: 0, rotation: 0, flipH: false, overlayText: "" },
    gallery: [],
    authMode: 'login',
    selectedAvatar: AVATAR_PRESETS[0],
    currentUser: null
};

state.baseImageCanvas.width = 1024;
state.baseImageCanvas.height = 1024;

// Account & Navigation Functions
window.renderAvatarPresetGrids = function() {
    ['avatar-preset-grid', 'modal-avatar-preset-grid'].forEach(gridId => {
        const container = document.getElementById(gridId);
        if (!container) return;
        container.innerHTML = '';
        AVATAR_PRESETS.forEach((url, idx) => {
            const isSelected = state.selectedAvatar === url;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `p-1 rounded-xl border-2 transition cursor-pointer ${isSelected ? 'border-neon bg-neon/20 shadow-[0_0_12px_rgba(57,255,20,0.4)]' : 'border-neon/20 bg-obsidian-950 hover:border-neon/60'}`;
            btn.onclick = () => {
                state.selectedAvatar = url;
                window.renderAvatarPresetGrids();
                if (state.currentUser && gridId === 'modal-avatar-preset-grid') {
                    window.updateLoggedInUserAvatar(url);
                }
            };
            btn.innerHTML = `<img src="${url}" alt="Avatar ${idx + 1}" class="w-full aspect-square rounded-lg object-cover"/>`;
            container.appendChild(btn);
        });
    });
};

window.handleCustomAvatarUpload = function(event, applyImmediately = false) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = 160; c.height = 160;
            c.getContext('2d').drawImage(img, 0, 0, 160, 160);
            state.selectedAvatar = c.toDataURL('image/jpeg', 0.88);
            window.renderAvatarPresetGrids();
            showToast("Avatar Ready", "Custom profile picture selected");
            if (applyImmediately && state.currentUser) window.updateLoggedInUserAvatar(state.selectedAvatar);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.openAuthPage = function(initialTab = 'login') {
    document.getElementById('main-studio-view').classList.add('hidden');
    document.getElementById('auth-page-view').classList.remove('hidden');
    window.switchAuthTab(initialTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.closeAuthPage = function() {
    document.getElementById('auth-page-view').classList.add('hidden');
    document.getElementById('main-studio-view').classList.remove('hidden');
};

window.switchAuthTab = function(tab) {
    state.authMode = tab;
    const loginBtn = document.getElementById('auth-tab-login');
    const signupBtn = document.getElementById('auth-tab-signup');
    const extraFields = document.getElementById('signup-extra-fields');
    const submitText = document.getElementById('auth-submit-btn-text');
    document.getElementById('auth-feedback-box').classList.add('hidden');

    if (tab === 'signup') {
        signupBtn.className = "py-2 rounded-lg font-display font-bold text-xs sm:text-sm bg-neon text-black shadow-[0_0_10px_rgba(57,255,20,0.35)] transition";
        loginBtn.className = "py-2 rounded-lg font-display font-bold text-xs sm:text-sm text-gray-400 hover:text-neon transition";
        extraFields.classList.remove('hidden');
        submitText.textContent = "Create Dicrostonyx Account";
    } else {
        loginBtn.className = "py-2 rounded-lg font-display font-bold text-xs sm:text-sm bg-neon text-black shadow-[0_0_10px_rgba(57,255,20,0.35)] transition";
        signupBtn.className = "py-2 rounded-lg font-display font-bold text-xs sm:text-sm text-gray-400 hover:text-neon transition";
        extraFields.classList.add('hidden');
        submitText.textContent = "Log In to Dicrostonyx";
    }
};

window.applyAuthenticatedUserToUI = function(profile, isAutoLogin = false) {
    state.currentUser = profile;
    state.selectedAvatar = profile.avatar || AVATAR_PRESETS[0];

    document.getElementById('top-left-profile-container').classList.remove('hidden');
    document.getElementById('top-left-avatar-img').src = state.selectedAvatar;
    document.getElementById('dropdown-avatar-img').src = state.selectedAvatar;
    document.getElementById('dropdown-user-name').textContent = profile.displayName || profile.email.split('@')[0];
    document.getElementById('dropdown-user-email').textContent = profile.email;

    document.getElementById('join-dicrostonyx-btn').classList.add('hidden');
    const rightPill = document.getElementById('logged-in-status-pill');
    rightPill.classList.remove('hidden');
    rightPill.classList.add('flex');
    document.getElementById('header-right-username').textContent = profile.displayName || profile.email.split('@')[0];

    window.closeAuthPage();
    showToast(isAutoLogin ? "Welcome Back!" : "Logged In", `Signed in as ${profile.displayName || profile.email}`);
};

window.applyLoggedOutUI = function() {
    state.currentUser = null;
    document.getElementById('top-left-profile-container').classList.add('hidden');
    document.getElementById('account-dropdown-menu').classList.add('hidden');
    document.getElementById('join-dicrostonyx-btn').classList.remove('hidden');
    const rightPill = document.getElementById('logged-in-status-pill');
    rightPill.classList.add('hidden');
    rightPill.classList.remove('flex');
};

window.toggleAccountMenu = function() {
    document.getElementById('account-dropdown-menu').classList.toggle('hidden');
};

window.openProfileAvatarModal = function() {
    document.getElementById('account-dropdown-menu').classList.add('hidden');
    window.renderAvatarPresetGrids();
    document.getElementById('avatar-modal').classList.remove('hidden');
};

window.closeProfileAvatarModal = function() {
    document.getElementById('avatar-modal').classList.add('hidden');
};

function showToast(title, msg) {
    const box = document.getElementById('toast-box');
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-msg').textContent = msg;
    box.classList.remove('hidden');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => box.classList.add('hidden'), 3400);
}

window.openTextToImage = function() {
    document.getElementById('launcher-section').classList.add('hidden');
    document.getElementById('studio-workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => document.getElementById('prompt-input').focus(), 250);
};

window.switchMode = function(mode) {
    if (mode === 'launcher') {
        document.getElementById('launcher-section').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.openTextToImage();
    }
};

window.scrollToGallery = function() {
    document.getElementById('gallery-section').scrollIntoView({ behavior: 'smooth' });
};

window.setSamplePrompt = function(index) {
    document.getElementById('prompt-input').value = SAMPLE_PROMPTS[index] || SAMPLE_PROMPTS[0];
};

window.clearPrompt = function() {
    document.getElementById('prompt-input').value = '';
};

window.loadSampleAndGenerate = function() {
    window.openTextToImage();
    document.getElementById('prompt-input').value = SAMPLE_PROMPTS[0];
    window.generateImage();
};

window.setQuality = function(val) {
    document.getElementById('quality-slider').value = val;
    window.updateQualityDisplay(val);
};

window.updateQualityDisplay = function(val) {
    const level = parseInt(val, 10);
    state.qualityLevel = level;
    const info = state.qualityMap[level];
    document.getElementById('quality-badge').textContent = info.label;
    document.getElementById('meta-quality-tag').textContent = info.label;
    window.selectExportResolution(info.width, info.height, info.label);
};

window.toggleWatermark = function(isChecked) {
    state.watermarkEnabled = isChecked;
    document.getElementById('watermark-status-pill').textContent = isChecked ? "ON" : "OFF";
    document.getElementById('meta-watermark-tag').textContent = isChecked ? "WATERMARK: ON" : "WATERMARK: OFF";
    window.renderMasterPreview();
};

window.toggleMoreDetails = function() {
    const drawer = document.getElementById('more-details-drawer');
    const chevron = document.getElementById('more-details-chevron');
    drawer.classList.toggle('hidden');
    chevron.style.transform = drawer.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
};

window.randomizeSeed = function() {
    const s = Math.floor(100000 + Math.random() * 900000);
    document.getElementById('detail-seed').value = s;
    state.currentSeed = s;
};

window.updateAspectRatioPreview = function() {
    const aspect = document.getElementById('detail-aspect').value;
    if (aspect === "16:9") window.selectExportResolution(1920, 1080, "1920×1080 16:9");
    else if (aspect === "9:16") window.selectExportResolution(1080, 1920, "1080×1920 9:16");
    else window.selectExportResolution(2048, 2048, "2048×2048 2K MAX");
};

window.switchRightTab = function(tab) {
    const btnDl = document.getElementById('tab-btn-download');
    const btnEd = document.getElementById('tab-btn-edit');
    const panelDl = document.getElementById('panel-download');
    const panelEd = document.getElementById('panel-edit');

    if (tab === 'download') {
        panelDl.classList.remove('hidden');
        panelEd.classList.add('hidden');
        btnDl.className = "py-2.5 px-3 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-neon text-black shadow-[0_0_12px_rgba(57,255,20,0.4)] transition";
        btnEd.className = "py-2.5 px-3 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-gray-300 hover:text-neon transition";
    } else {
        panelEd.classList.remove('hidden');
        panelDl.classList.add('hidden');
        btnEd.className = "py-2.5 px-3 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-neon text-black shadow-[0_0_12px_rgba(57,255,20,0.4)] transition";
        btnDl.className = "py-2.5 px-3 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-gray-300 hover:text-neon transition";
    }
};

function drawDicrostonyxWatermarkOnCanvas(ctx, canvasWidth, canvasHeight) {
    ctx.save();
    const scale = Math.max(0.55, Math.min(canvasWidth, canvasHeight) / 1024);
    const padX = Math.round(24 * scale);
    const padY = Math.round(24 * scale);
    const badgeW = Math.round(255 * scale);
    const badgeH = Math.round(58 * scale);
    const x = padX;
    const y = canvasHeight - badgeH - padY;

    ctx.fillStyle = "rgba(5, 8, 5, 0.84)";
    ctx.strokeStyle = "#39FF14";
    ctx.lineWidth = Math.max(1.5, 2.2 * scale);
    const r = Math.round(14 * scale);

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + badgeW - r, y);
    ctx.quadraticCurveTo(x + badgeW, y, x + badgeW, y + r);
    ctx.lineTo(x + badgeW, y + badgeH - r);
    ctx.quadraticCurveTo(x + badgeW, y + badgeH, x + badgeW - r, y + badgeH);
    ctx.lineTo(x + r, y + badgeH);
    ctx.quadraticCurveTo(x, y + badgeH, x, y + badgeH - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${Math.round(16 * scale)}px "Space Grotesk", sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillText("DICROSTONYX AI", x + Math.round(58 * scale), y + Math.round(badgeH * 0.40));

    ctx.fillStyle = "#39FF14";
    ctx.font = `500 ${Math.round(10.5 * scale)}px "JetBrains Mono", monospace`;
    ctx.fillText("2K NEURAL SYNTHESIS", x + Math.round(58 * scale), y + Math.round(badgeH * 0.73));
    ctx.restore();
}

function synthesizeProceduralArtwork(promptText, seed, width = 1024, height = 1024) {
    const canvas = state.baseImageCanvas;
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    let s = seed || 849204;
    const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

    const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.38, width * 0.05, width * 0.5, height * 0.5, width * 0.85);
    bgGrad.addColorStop(0, '#103314');
    bgGrad.addColorStop(0.5, '#071409');
    bgGrad.addColorStop(1, '#030503');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.strokeStyle = "rgba(57, 255, 20, 0.22)";
    ctx.lineWidth = 1.5;
    for (let i = -20; i <= 20; i++) {
        ctx.beginPath();
        ctx.moveTo(width * 0.5 + i * (width * 0.015), height * 0.62);
        ctx.lineTo(width * 0.5 + i * (width * 0.12), height);
        ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(width * 0.5, height * 0.52);
    const unit = Math.min(width, height) / 900;
    ctx.scale(unit, unit);
    ctx.fillStyle = "#0c190c";
    ctx.strokeStyle = "#39FF14";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

window.renderMasterPreview = function(targetCanvas = document.getElementById('display-canvas'), outW = 1024, outH = 1024) {
    targetCanvas.width = outW; targetCanvas.height = outH;
    const ctx = targetCanvas.getContext('2d');
    ctx.fillStyle = "#040604";
    ctx.fillRect(0, 0, outW, outH);

    const { brightness, contrast, saturate, hue, tint, rotation, flipH } = state.editor;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hue}deg)`;

    ctx.save();
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);
    ctx.drawImage(state.baseImageCanvas, -outW / 2, -outH / 2, outW, outH);
    ctx.restore();

    if (state.watermarkEnabled) {
        drawDicrostonyxWatermarkOnCanvas(ctx, outW, outH);
    }
};

window.generateImage = async function() {
    const promptEl = document.getElementById('prompt-input');
    const rawPrompt = promptEl.value.trim() || SAMPLE_PROMPTS[0];
    window.randomizeSeed();
    const seed = state.currentSeed;

    const overlay = document.getElementById('loading-overlay');
    overlay.classList.remove('hidden');

    setTimeout(() => {
        synthesizeProceduralArtwork(rawPrompt, seed, 1024, 1024);
        overlay.classList.add('hidden');
        state.currentPrompt = rawPrompt;
        window.renderMasterPreview();
        showToast("Image Generated!", "Ready to download or edit");
    }, 400);
};

window.updateEditorFilters = function() {
    state.editor.brightness = parseInt(document.getElementById('edit-brightness').value, 10);
    state.editor.contrast = parseInt(document.getElementById('edit-contrast').value, 10);
    document.getElementById('val-brightness').textContent = `${state.editor.brightness}%`;
    document.getElementById('val-contrast').textContent = `${state.editor.contrast}%`;
    window.renderMasterPreview();
};

window.rotateImage90 = function() {
    state.editor.rotation = (state.editor.rotation + 90) % 360;
    window.renderMasterPreview();
};

window.flipImageHorizontal = function() {
    state.editor.flipH = !state.editor.flipH;
    window.renderMasterPreview();
};

window.resetEditorAdjustments = function() {
    state.editor = { brightness: 100, contrast: 100, saturate: 100, hue: 0, tint: 0, rotation: 0, flipH: false, overlayText: "" };
    document.getElementById('edit-brightness').value = 100;
    document.getElementById('edit-contrast').value = 100;
    window.updateEditorFilters();
};

window.selectExportResolution = function(w, h, label) {
    state.exportWidth = w;
    state.exportHeight = h;
    document.getElementById('download-main-btn-text').textContent = `Download ${w}×${h} PNG`;
};

window.downloadProcessedImage = function(format = 'png') {
    const outW = state.exportWidth;
    const outH = state.exportHeight;
    const exportCanvas = document.createElement('canvas');
    window.renderMasterPreview(exportCanvas, outW, outH);

    const link = document.createElement('a');
    link.download = `dicrostonyx-ai-${outW}x${outH}-${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    link.href = exportCanvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png', 0.96);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded", `Saved ${outW}×${outH} image`);
};

window.completeGoogleSignIn = function(email, displayName) {
    const profile = { email, displayName, avatar: state.selectedAvatar, provider: 'google' };
    window.applyAuthenticatedUserToUI(profile, false);
};

window.handleEmailAuthSubmit = function(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email-input').value.trim();
    const profile = { email, displayName: email.split('@')[0], avatar: state.selectedAvatar, provider: 'email' };
    window.applyAuthenticatedUserToUI(profile, false);
};

window.handleLogout = function() {
    window.applyLoggedOutUI();
    showToast("Logged Out", "Signed out of Dicrostonyx Account");
};

window.updateLoggedInUserAvatar = function(url) {
    if (!state.currentUser) return;
    state.currentUser.avatar = url;
    document.getElementById('top-left-avatar-img').src = url;
    document.getElementById('dropdown-avatar-img').src = url;
    window.closeProfileAvatarModal();
    showToast("Avatar Updated", "Synced to top-left badge");
};

window.onload = function() {
    window.renderAvatarPresetGrids();
    document.getElementById('prompt-input').value = SAMPLE_PROMPTS[0];
    synthesizeProceduralArtwork(SAMPLE_PROMPTS[0], state.currentSeed, 1024, 1024);
    window.renderMasterPreview();
};