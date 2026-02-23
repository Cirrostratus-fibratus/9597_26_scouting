// Theme management
function initTheme() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('selectedTheme') || 'blue';
    setTheme(savedTheme);
    
    // Add theme toggle change event
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Set checkbox state based on saved theme (checked = red, unchecked = blue)
        themeToggle.checked = (savedTheme === 'red');
        themeToggle.addEventListener('change', function() {
            const newTheme = this.checked ? 'red' : 'blue';
            setTheme(newTheme);
            localStorage.setItem('selectedTheme', newTheme);
        });
    }
}

function setTheme(theme) {
    if (theme === 'red') {
        document.body.classList.add('red-theme');
        // Change logo to red version
        const navbarLogo = document.querySelector('.navbar-logo');
        const footerLogo = document.querySelector('.footer-logo');
        if (navbarLogo) navbarLogo.src = 'logo_r.png';
        if (footerLogo) footerLogo.src = 'logo_r.png';
    } else {
        document.body.classList.remove('red-theme');
        // Change logo back to blue version
        const navbarLogo = document.querySelector('.navbar-logo');
        const footerLogo = document.querySelector('.footer-logo');
        if (navbarLogo) navbarLogo.src = 'logo.png';
        if (footerLogo) footerLogo.src = 'logo.png';
    }
}

// Login functionality
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = '26scouting';

function initLogin() {
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const guestBtn = document.getElementById('guestBtn');
    const toggleRegister = document.getElementById('toggleRegister');
    const modalTitle = document.getElementById('modalTitle');
    
    // Check if already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        loginModal.classList.add('hidden');
    } else {
        loginModal.classList.remove('hidden');
    }
    
    // Toggle between login and register forms
    toggleRegister.addEventListener('click', function() {
        loginForm.classList.toggle('hidden');
        registerForm.classList.toggle('hidden');
        if (registerForm.classList.contains('hidden')) {
            modalTitle.textContent = '26 Scouting 登录';
        } else {
            modalTitle.textContent = '26 Scouting 注册';
        }
        loginError.textContent = '';
        registerError.textContent = '';
    });
    
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Check admin account
        if (username === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({
                username: username,
                isAdmin: true,
                canEdit: true
            }));
            loginError.textContent = '';
            loginModal.classList.add('hidden');
            loginForm.reset();
            document.getElementById('username').focus();
            updateFormEditability();
            displayUserInfo();
            return;
        }
        
        // Check registered users
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({
                username: username,
                isAdmin: false,
                canEdit: true
            }));
            loginError.textContent = '';
            loginModal.classList.add('hidden');
            loginForm.reset();
            updateFormEditability();
            displayUserInfo();
        } else {
            loginError.textContent = '用户名或密码错误';
        }
    });
    
    // Register form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const password2 = document.getElementById('regPassword2').value;
        
        if (password !== password2) {
            registerError.textContent = '两次输入的密码不一致';
            return;
        }
        
        if (username.length < 3) {
            registerError.textContent = '用户名至少需要3个字符';
            return;
        }
        
        if (password.length < 6) {
            registerError.textContent = '密码至少需要6个字符';
            return;
        }
        
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        if (users.some(u => u.username === username)) {
            registerError.textContent = '用户名已被使用';
            return;
        }
        
        // Add new user
        users.push({
            username: username,
            password: password
        });
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        // Auto login after registration
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
            username: username,
            isAdmin: false,
            canEdit: true
        }));
        
        registerError.textContent = '';
        loginModal.classList.add('hidden');
        registerForm.reset();
        loginForm.reset();
        updateFormEditability();
        displayUserInfo();
    });
    
    // Guest login
    guestBtn.addEventListener('click', function() {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
            username: '访客',
            isAdmin: false,
            canEdit: false
        }));
        loginModal.classList.add('hidden');
        updateFormEditability();
        displayUserInfo();
    });
    
    // Logout
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        loginModal.classList.remove('hidden');
        loginForm.reset();
        registerForm.reset();
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginError.textContent = '';
        registerError.textContent = '';
        modalTitle.textContent = '26 Scouting 登录';
        document.getElementById('username').focus();
        updateFormEditability();
        displayUserInfo();
        switchPage('main');
    });
}

function updateFormEditability() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const formInputs = document.querySelectorAll('#prescoutingForm input, #prescoutingForm select, #prescoutingForm textarea');
    const teamNumber = document.getElementById('teamNumber').value;
    const teamData = prescoutingData[teamNumber];
    
    // Guests cannot edit
    if (currentUser.username === '访客') {
        formInputs.forEach(input => {
            input.disabled = true;
        });
        document.querySelector('.btn-submit').disabled = true;
        return;
    }
    
    // Determine if current user can edit
    let canEdit = currentUser.canEdit;
    
    // If not admin and there's existing data, only allow edit if user is the creator
    if (!currentUser.isAdmin && teamData && teamData.createdBy !== currentUser.username) {
        canEdit = false;
    }
    
    if (canEdit) {
        formInputs.forEach(input => {
            if (input.id !== 'teamName' && input.id !== 'photoPreview') {
                input.disabled = false;
            }
        });
        document.querySelector('.btn-submit').disabled = false;
    } else {
        formInputs.forEach(input => {
            input.disabled = true;
        });
        document.querySelector('.btn-submit').disabled = true;
    }
}

function displayUserInfo() {
    const userInfo = document.getElementById('userInfo');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (currentUser.username) {
        let userClass = 'user';
        let roleText = currentUser.username;
        
        if (currentUser.username === '访客') {
            userClass = 'guest';
        } else if (currentUser.isAdmin) {
            userClass = 'admin';
            roleText = '[管理员] ' + currentUser.username;
        }
        
        userInfo.textContent = roleText;
        userInfo.className = 'user-info ' + userClass;
    } else {
        userInfo.textContent = '';
        userInfo.className = 'user-info';
    }
}

// Initialize login on page load
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
});

window.addEventListener('load', function() {
    initLogin();
    initPrescouting();
    initProfile();
    updateFormEditability();
    displayUserInfo();
});

// Navigation for pages and sections
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Skip logout link
        if (this.getAttribute('id') === 'logoutBtn') {
            return;
        }
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        
        // Handle page navigation
        switch(targetId) {
            case 'profile':
                switchPage('profile');
                break;
            case 'prescouting':
                switchPage('prescouting');
                break;
            case 'scouting':
                switchPage('scouting');
                break;
            default:
                // Handle main page navigation (teams, home)
                switchPage('main');
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 100);
                }
        }
    });
});

function switchPage(pageName) {
    const mainContent = document.getElementById('mainContent');
    const prescoutingPage = document.getElementById('prescoutingPage');
    const scoutingPage = document.getElementById('scoutingPage');
    const profilePage = document.getElementById('profilePage');
    
    // Hide all pages
    mainContent.classList.remove('active');
    prescoutingPage.classList.remove('active');
    scoutingPage.classList.remove('active');
    profilePage.classList.remove('active');
    
    // Show selected page
    switch(pageName) {
        case 'prescouting':
            prescoutingPage.classList.add('active');
            break;
        case 'scouting':
            scoutingPage.classList.add('active');
            break;
        case 'profile':
            profilePage.classList.add('active');
            loadProfilePage();
            break;
        default:
            mainContent.classList.add('active');
    }
}

// Add active class to navigation link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Add scroll effect to header
let lastScrollTop = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    let scrollTop = window.scrollY;
    
    if (scrollTop > lastScrollTop) {
        // Scrolling DOWN
        header.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    } else {
        // Scrolling UP
        header.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Welcome message on page load
window.addEventListener('load', () => {
    console.log('欢迎来到 26 Scouting！');
});

// Prescouting functionality
let prescoutingData = {};
const teamsMap = new Map();
let currentPhotoData = null;

function initPrescouting() {
    // Load prescoutingData from localStorage
    const savedData = localStorage.getItem('prescoutingData');
    if (savedData) {
        prescoutingData = JSON.parse(savedData);
    }
    
    // Restructure team cards to include info section
    document.querySelectorAll('.team-card').forEach(card => {
        const text = card.textContent.trim();
        const teamNum = text.split(' ')[0];
        teamsMap.set(teamNum, text);
        
        // Restructure card HTML
        card.innerHTML = `
            <div class="team-card-name">${text}</div>
            <div class="team-card-info"></div>
        `;
        
        // Add click event to navigate to prescouting section
        card.addEventListener('click', function() {
            const teamNumber = teamNum;
            if (prescoutingData[teamNumber]) {
                // Scroll to prescouting section
                document.getElementById('prescouting').scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => {
                    highlightPrescoutingResult(teamNumber);
                }, 800);
            }
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('teamSearch');
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase().trim();
        document.querySelectorAll('.team-card').forEach(card => {
            const teamName = card.querySelector('.team-card-name').textContent.toLowerCase();
            if (searchText === '' || teamName.includes(searchText)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // Photo upload preview
    document.getElementById('teamPhoto').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentPhotoData = event.target.result;
                const preview = document.getElementById('photoPreview');
                preview.innerHTML = `<img src="${currentPhotoData}" alt="队伍照片">`;
                preview.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Team number input change
    document.getElementById('teamNumber').addEventListener('change', function() {
        const teamNum = this.value;
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Check if user has permission to edit this team
        if (!currentUser.isAdmin && currentUser.username !== '访客') {
            const assignedTeams = getUserAssignedTeams(currentUser.username);
            if (teamNum && !assignedTeams.includes(teamNum)) {
                alert('您只能填写管理员指定的队伍。');
                this.value = '';
                document.getElementById('teamName').value = '';
                return;
            }
        }
        
        const teamName = Array.from(teamsMap.values()).find(name => name.startsWith(teamNum));
        document.getElementById('teamName').value = teamName || '';
        
        // Load existing data if available
        if (prescoutingData[teamNum]) {
            const data = prescoutingData[teamNum];
            document.getElementById('coachTime').value = data.coachTime === '未填写' ? '' : data.coachTime;
            document.getElementById('competitionCount').value = data.competitionCount === '未填写' ? '' : data.competitionCount;
            document.getElementById('chassisType').value = data.chassisType === '未选择' ? '' : data.chassisType;
            document.getElementById('rampChoice').value = data.rampChoice === '未选择' ? '' : data.rampChoice;
            document.getElementById('shooterCount').value = data.shooterCount === '未填写' ? '' : data.shooterCount;
            document.getElementById('climbLevel').value = data.climbLevel === '未选择' ? '' : data.climbLevel;
            document.getElementById('maxBalls').value = data.maxBalls === '未填写' ? '' : data.maxBalls;
            document.getElementById('shootTime').value = data.shootTime === '未填写' ? '' : data.shootTime;
            document.getElementById('startingPosition').value = data.startingPosition === '无' ? '' : data.startingPosition;
            document.getElementById('manualStrategy').value = data.manualStrategy === '无' ? '' : data.manualStrategy;
            document.getElementById('autoScore').value = data.autoScore === '无' ? '' : data.autoScore;
            document.getElementById('autoClimb').value = data.autoClimb === '未选择' ? '' : data.autoClimb;
            document.getElementById('strategyOverview').value = data.strategyOverview === '无' ? '' : data.strategyOverview;
            document.getElementById('notes').value = data.notes === '无' ? '' : data.notes;
            
            if (data.photoData) {
                const preview = document.getElementById('photoPreview');
                preview.innerHTML = `<img src="${data.photoData}" alt="队伍照片">`;
                preview.classList.add('has-image');
                currentPhotoData = data.photoData;
            }
        }
        
        updateFormEditability();
    });
    
    // Handle robot function selection
    const robotFunctionSelect = document.getElementById('robotFunction');
    if (robotFunctionSelect) {
        robotFunctionSelect.addEventListener('change', function() {
            const otherFunctionGroup = document.getElementById('otherFunctionGroup');
            if (this.value === 'Other') {
                otherFunctionGroup.style.display = 'block';
            } else {
                otherFunctionGroup.style.display = 'none';
            }
        });
    }
    
    // Form submission
    document.getElementById('prescoutingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Prevent guest from submitting
        if (currentUser.username === '访客') {
            alert('访客无法提交问卷，请登录账户后继续。');
            return;
        }
        
        const teamNumber = document.getElementById('teamNumber').value;
        const teamName = document.getElementById('teamName').value;
        const coachTime = document.getElementById('coachTime').value || '未填写';
        const competitionCount = document.getElementById('competitionCount').value || '未填写';
        const chassisType = document.getElementById('chassisType').value || '未选择';
        const rampChoice = document.getElementById('rampChoice').value || '未选择';
        const shooterCount = document.getElementById('shooterCount').value || '未填写';
        const climbLevel = document.getElementById('climbLevel').value || '未选择';
        const maxBalls = document.getElementById('maxBalls').value || '未填写';
        const shootTime = document.getElementById('shootTime').value || '未填写';
        const startingPosition = document.getElementById('startingPosition').value || '无';
        const manualStrategy = document.getElementById('manualStrategy').value || '无';
        const robotFunction = document.getElementById('robotFunction').value || '未选择';
        const otherFunction = document.getElementById('otherFunction').value || '';
        const autoScore = document.getElementById('autoScore').value || '无';
        const autoAccuracy = document.getElementById('autoAccuracy').value || '无';
        const autoClimb = document.getElementById('autoClimb').value || '未选择';
        const manualAccuracy = document.getElementById('manualAccuracy').value || '无';
        const strategyOverview = document.getElementById('strategyOverview').value || '无';
        const notes = document.getElementById('notes').value || '无';
        
        if (!teamNumber) {
            alert('请输入队伍号');
            return;
        }
        
        if (!chassisType || chassisType === '') {
            alert('请选择机器底盘种类');
            return;
        }
        
        if (!rampChoice || rampChoice === '') {
            alert('请选择走斜坡还是下面');
            return;
        }
        
        if (!robotFunction || robotFunction === '') {
            alert('请选择功能/位置');
            return;
        }
        
        if (robotFunction === 'Other' && !otherFunction) {
            alert('请填写其他功能/位置');
            return;
        }
        
        // Check if data already exists and current user is not admin
        if (prescoutingData[teamNumber] && !currentUser.isAdmin && prescoutingData[teamNumber].createdBy !== currentUser.username) {
            alert('该队伍已被其他用户填写，您无法编辑。请联系管理员。');
            return;
        }
        
        const timestamp = new Date();
        const data = {
            teamNumber,
            teamName,
            coachTime,
            competitionCount,
            chassisType,
            rampChoice,
            shooterCount,
            climbLevel,
            maxBalls,
            shootTime,
            startingPosition,
            manualStrategy,
            robotFunction,
            otherFunction,
            autoScore,
            autoAccuracy,
            autoClimb,
            manualAccuracy,
            strategyOverview,
            notes,
            photoData: currentPhotoData,
            createdBy: prescoutingData[teamNumber] ? prescoutingData[teamNumber].createdBy : currentUser.username,
            createdAt: prescoutingData[teamNumber] ? prescoutingData[teamNumber].createdAt : timestamp.toLocaleString('zh-CN'),
            lastEditedBy: currentUser.username,
            lastEditedAt: timestamp.toLocaleString('zh-CN')
        };
        
        prescoutingData[teamNumber] = data;
        // Save to localStorage
        localStorage.setItem('prescoutingData', JSON.stringify(prescoutingData));
        displayPrescoutingData();
        highlightTeamCard(teamNumber, data);
        this.reset();
        document.getElementById('teamName').value = '';
        document.getElementById('photoPreview').innerHTML = '';
        document.getElementById('photoPreview').classList.remove('has-image');
        currentPhotoData = null;
    });
    
    // Display existing data and highlight cards
    displayPrescoutingData();
    Object.entries(prescoutingData).forEach(([teamNum, data]) => {
        highlightTeamCard(teamNum, data);
    });
}

function displayPrescoutingData() {
    const container = document.getElementById('prescoutingData');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Hide survey results from guests
    if (currentUser.username === '访客') {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = '<h3>已填写的Prescouting问卷</h3>';
    
    Object.values(prescoutingData).forEach(data => {
        const div = document.createElement('div');
        div.className = 'data-item';
        let photoHtml = '';
        let creatorInfo = `<p><small><strong>填写者：</strong>${data.createdBy} (${data.createdAt})</small></p>`;
        let editorInfo = '';
        if (data.lastEditedBy && data.lastEditedBy !== data.createdBy) {
            editorInfo = `<p><small><strong>最后修改者：</strong>${data.lastEditedBy} (${data.lastEditedAt})</small></p>`;
        }
        if (data.photoData) {
            photoHtml = `<img src="${data.photoData}" alt="队伍照片" class="data-item-photo">`;
        }
        div.innerHTML = `
            <h4>${data.teamNumber} ${data.teamName}</h4>
            ${creatorInfo}
            ${editorInfo}
            ${photoHtml}
            <p><strong>操作手练习时长：</strong>${data.coachTime}</p>
            <p><strong>参加比赛次数：</strong>${data.competitionCount}次</p>
            <p><strong>底盘种类：</strong>${data.chassisType}</p>
            <p><strong>走斜坡还是下面：</strong>${data.rampChoice}</p>
            <p><strong>发射通道数：</strong>${data.shooterCount}</p>
            <p><strong>能够爬升至：</strong>${data.climbLevel}</p>
            <p><strong>最大储球量：</strong>${data.maxBalls}</p>
            <p><strong>满仓发射时长：</strong>${data.shootTime}秒</p>
            <p><strong>起始位置：</strong>${data.startingPosition}</p>
            <p><strong>手动策略：</strong>${data.manualStrategy}</p>
            <p><strong>功能/位置：</strong>${data.robotFunction}${data.otherFunction ? ' - ' + data.otherFunction : ''}</p>
            <p><strong>自动程序得分：</strong>${data.autoScore}</p>
            <p><strong>自动准确率：</strong>${data.autoAccuracy}</p>
            <p><strong>自动是否爬升：</strong>${data.autoClimb}</p>
            <p><strong>手动发射准确率：</strong>${data.manualAccuracy}</p>
            <p><strong>策略概述：</strong>${data.strategyOverview}</p>
            <p><strong>备注：</strong>${data.notes}</p>
        `;
        container.appendChild(div);
    });
}

function highlightTeamCard(teamNumber, data) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Hide scouting info from guests
    if (currentUser.username === '访客') {
        return;
    }
    
    document.querySelectorAll('.team-card').forEach(card => {
        const nameDiv = card.querySelector('.team-card-name');
        if (nameDiv && nameDiv.textContent.trim().startsWith(teamNumber)) {
            card.classList.add('team-scouted');
            const infoDiv = card.querySelector('.team-card-info');
            let photoHtml = '';
            let photoButton = '';
            if (data.photoData) {
                photoButton = '<button class="photo-toggle">📷 显示照片</button>';
                photoHtml = `<div class="photo-container" style="display: none;"><img src="${data.photoData}" alt="队伍照片" class="team-card-photo"></div>`;
            }
            infoDiv.innerHTML = `
                ${photoButton}
                ${photoHtml}
                <div class="team-card-details">
                    <p><strong>底盘：</strong> ${data.chassisType}</p>
                    <p><strong>爬升等级：</strong> ${data.climbLevel}</p>
                    <p><strong>发射通道：</strong> ${data.shooterCount}</p>
                    <p><strong>自动爬升：</strong> ${data.autoClimb}</p>
                </div>
            `;
            
            // Add click event to photo toggle button
            const toggleBtn = infoDiv.querySelector('.photo-toggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const container = infoDiv.querySelector('.photo-container');
                    const isHidden = container.style.display === 'none';
                    container.style.display = isHidden ? 'block' : 'none';
                    toggleBtn.textContent = isHidden ? '🙈 隐藏照片' : '📷 显示照片';
                });
            }
        }
    });
}

function highlightPrescoutingResult(teamNumber) {
    // Remove previous highlight
    document.querySelectorAll('.data-item').forEach(item => {
        item.classList.remove('highlighted');
    });
    
    // Find and highlight the corresponding data item
    const dataItems = document.querySelectorAll('.data-item');
    dataItems.forEach(item => {
        const h4 = item.querySelector('h4');
        if (h4 && h4.textContent.trim().startsWith(teamNumber)) {
            item.classList.add('highlighted');
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

// Profile Page functionality
function initProfile() {
    // Load user team assignments from localStorage
    if (!localStorage.getItem('userTeamAssignments')) {
        localStorage.setItem('userTeamAssignments', JSON.stringify({}));
    }
}

function loadProfilePage() {
    const profileContent = document.getElementById('profileContent');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.username) {
        profileContent.innerHTML = '<p>请先登录</p>';
        return;
    }
    
    // Calculate user statistics
    const userSurveys = [];
    Object.entries(prescoutingData).forEach(([teamNum, data]) => {
        if (data.createdBy === currentUser.username || data.lastEditedBy === currentUser.username) {
            userSurveys.push({
                teamNumber: teamNum,
                teamName: data.teamName,
                createdBy: data.createdBy,
                createdAt: data.createdAt
            });
        }
    });
    
    // Get assigned teams
    const assignedTeams = getUserAssignedTeams(currentUser.username);
    
    let html = `
        <div class="profile-stats">
            <div class="stat-card">
                <h3>${userSurveys.length}</h3>
                <p>填写问卷数</p>
            </div>
    `;
    
    if (currentUser.isAdmin) {
        html += `
            <div class="stat-card">
                <h3>${Object.keys(prescoutingData).length}</h3>
                <p>总问卷数</p>
            </div>
        `;
    }
    
    html += `</div>`;
    
    // Show assigned teams for regular users
    if (!currentUser.isAdmin && assignedTeams.length > 0) {
        html += `
            <div class="profile-my-assignments">
                <h3>📋 我的指定队伍</h3>
                <div>
        `;
        assignedTeams.forEach(teamNum => {
            const teamName = Array.from(teamsMap.values()).find(name => name.startsWith(teamNum)) || teamNum;
            const isScouted = prescoutingData[teamNum] && prescoutingData[teamNum].createdBy === currentUser.username;
            html += `
                <div class="assigned-team-item" style="background: ${isScouted ? '#d4edda' : 'white'}; color: ${isScouted ? '#28a745' : '#667eea'};">
                    ${teamNum} ${teamName} ${isScouted ? '✓ 已填写' : ''}
                </div>
            `;
        });
        html += `
                </div>
            </div>
        `;
    }
    
    // Show my surveys
    if (userSurveys.length > 0) {
        html += `
            <div class="profile-my-surveys">
                <h3>✓ 我填写的Prescouting问卷</h3>
        `;
        userSurveys.forEach(survey => {
            html += `
                <div class="survey-item">
                    <strong>${survey.teamNumber} ${survey.teamName}</strong> - 
                    <small>填写于 ${survey.createdAt}</small>
                </div>
            `;
        });
        html += `</div>`;
    }
    
    // Admin panel
    if (currentUser.isAdmin) {
        html += getAdminPanel();
    }
    
    profileContent.innerHTML = html;
    
    // Add event listeners for admin panel
    if (currentUser.isAdmin) {
        // Add collapsible button listeners
        document.querySelectorAll('.collapsible-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.dataset.target;
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.classList.toggle('collapsed');
                    this.classList.toggle('collapsed');
                }
            });
        });
        
        // Add batch assign button listener
        const batchAssignBtn = document.getElementById('batchAssignBtn');
        if (batchAssignBtn) {
            batchAssignBtn.addEventListener('click', function() {
                const selectedUsers = Array.from(document.querySelectorAll('.user-checkbox:checked')).map(cb => cb.value);
                const selectedTeams = Array.from(document.querySelectorAll('.team-checkbox:checked')).map(cb => cb.value);
                
                if (selectedUsers.length === 0) {
                    alert('请选择至少一个用户');
                    return;
                }
                
                if (selectedTeams.length === 0) {
                    alert('请选择至少一个队伍');
                    return;
                }
                
                if (confirm(`确认要将 ${selectedTeams.length} 个队伍分配给 ${selectedUsers.length} 个用户吗？`)) {
                    batchAssignTeams(selectedUsers, selectedTeams);
                    loadProfilePage(); // Refresh page
                }
            });
        }
        
        document.querySelectorAll('.assign-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const username = this.dataset.username;
                const teamSelect = this.parentElement.querySelector('.team-select');
                const teamNum = teamSelect.value;
                if (teamNum) {
                    assignTeamToUser(username, teamNum);
                    loadProfilePage(); // Refresh page
                }
            });
        });
        
        // Add delete user button listeners
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const username = this.dataset.username;
                if (confirm(`确认要注销用户 "${username}" 的账户吗？此操作无法撤销。`)) {
                    deleteUser(username);
                    loadProfilePage(); // Refresh page
                }
            });
        });
        
        // Add delete survey button listeners
        document.querySelectorAll('.delete-survey-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const teamNum = this.dataset.teamNum;
                if (confirm(`确认要删除队伍 ${teamNum} 的问卷吗？此操作无法撤销。`)) {
                    deleteSurvey(teamNum);
                    loadProfilePage(); // Refresh page
                }
            });
        });
    }
}

function getAdminPanel() {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const assignments = JSON.parse(localStorage.getItem('userTeamAssignments') || '{}');
    
    // Batch assignment section
    let html = `
        <div class="profile-admin-panel">
            <div class="admin-panel-header">
                <h3>⚙️ 管理员面板 - 批量分配队伍</h3>
                <button class="collapsible-btn collapsed" data-target="batch-assignment-content">▼</button>
            </div>
            <div id="batch-assignment-content" class="batch-assignment-content collapsed">
                <div class="batch-assignment">
                    <div class="batch-users-selection">
                        <h4>选择用户</h4>
                        <div class="users-checkbox-group">
    `;
    
    users.forEach(user => {
        html += `
                        <label class="checkbox-label">
                            <input type="checkbox" class="user-checkbox" value="${user.username}">
                            ${user.username}
                        </label>
        `;
    });
    
    html += `
                    </div>
                </div>
                
                <div class="batch-teams-selection">
                    <h4>选择队伍</h4>
                    <div class="teams-checkbox-group">
    `;
    
    const allTeams = Array.from(teamsMap.keys()).sort((a, b) => parseInt(a) - parseInt(b));
    allTeams.forEach(teamNum => {
        const teamName = teamsMap.get(teamNum);
        html += `
                        <label class="checkbox-label">
                            <input type="checkbox" class="team-checkbox" value="${teamNum}">
                            ${teamNum} ${teamName}
                        </label>
        `;
    });
    
    html += `
                    </div>
                </div>
                
                <button id="batchAssignBtn" class="batch-assign-btn">批量分配</button>
            </div>
            </div>
        </div>
    `;
    
    let html2 = `
        <div class="profile-admin-panel">
            <div class="admin-panel-header">
                <h3>⚙️ 管理员面板 - 队伍分配</h3>
                <button class="collapsible-btn collapsed" data-target="team-assignment-content">▼</button>
            </div>
            <div id="team-assignment-content" class="batch-assignment-content collapsed">
                <div class="admin-users-list">
    `;
    
    users.forEach(user => {
        const userAssignments = assignments[user.username] || [];
        const userSurveyCount = Object.values(prescoutingData).filter(d => d.createdBy === user.username).length;
        
        html2 += `
            <div class="admin-user-item">
                <h4>👤 ${user.username}</h4>
                <div class="admin-user-stats">
                    已填写问卷：${userSurveyCount} | 
                    已分配队伍：${userAssignments.length}
                </div>
                <div class="team-assignment">
                    <select class="team-select" data-username="${user.username}">
                        <option value="">选择队伍...</option>
        `;
        
        allTeams.forEach(teamNum => {
            const teamName = teamsMap.get(teamNum);
            html2 += `<option value="${teamNum}">${teamNum} ${teamName}</option>`;
        });
        
        html2 += `
                    </select>
                    <button class="assign-btn" data-username="${user.username}">分配</button>
                </div>
                <div class="assigned-teams">
                    <strong>已分配：${userAssignments.length > 0 ? userAssignments.join(', ') : '无'}</strong>
                </div>
                <div class="admin-user-actions">
                    <button class="delete-user-btn" data-username="${user.username}" style="background-color: #dc3545; color: white;">注销账户</button>
                </div>
            </div>
        `;
    });
    
    html2 += `
            </div>
        </div>
            </div>
        </div>
    `;
    
    // Add survey management section
    html2 += `
        <div class="profile-admin-panel">
            <div class="admin-panel-header">
                <h3>⚙️ 管理员面板 - 删除问卷</h3>
                <button class="collapsible-btn collapsed" data-target="survey-delete-content">▼</button>
            </div>
            <div id="survey-delete-content" class="batch-assignment-content collapsed">
                <div class="admin-surveys-list">
    `;
    
    Object.entries(prescoutingData).forEach(([teamNum, data]) => {
        html2 += `
            <div class="admin-survey-item">
                <strong>${teamNum} ${data.teamName}</strong> - 
                <small>填写者：${data.createdBy} | 填写于 ${data.createdAt}</small>
                <button class="delete-survey-btn" data-team-num="${teamNum}" style="background-color: #ffc107; color: black; margin-left: 1rem; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer;">删除问卷</button>
            </div>
        `;
    });
    
    html2 += `
                </div>
            </div>
        </div>
    `;
    
    return html + html2;
}

function getUserAssignedTeams(username) {
    const assignments = JSON.parse(localStorage.getItem('userTeamAssignments') || '{}');
    return assignments[username] || [];
}

function assignTeamToUser(username, teamNum) {
    const assignments = JSON.parse(localStorage.getItem('userTeamAssignments') || '{}');
    
    if (!assignments[username]) {
        assignments[username] = [];
    }
    
    if (!assignments[username].includes(teamNum)) {
        assignments[username].push(teamNum);
    }
    
    localStorage.setItem('userTeamAssignments', JSON.stringify(assignments));
}

function batchAssignTeams(usernames, teamNums) {
    const assignments = JSON.parse(localStorage.getItem('userTeamAssignments') || '{}');
    
    usernames.forEach(username => {
        if (!assignments[username]) {
            assignments[username] = [];
        }
        
        teamNums.forEach(teamNum => {
            if (!assignments[username].includes(teamNum)) {
                assignments[username].push(teamNum);
            }
        });
    });
    
    localStorage.setItem('userTeamAssignments', JSON.stringify(assignments));
}

function deleteUser(username) {
    // Delete from registered users
    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    users = users.filter(u => u.username !== username);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Delete user's team assignments
    const assignments = JSON.parse(localStorage.getItem('userTeamAssignments') || '{}');
    delete assignments[username];
    localStorage.setItem('userTeamAssignments', JSON.stringify(assignments));
    
    // Delete user's surveys
    Object.entries(prescoutingData).forEach(([teamNum, data]) => {
        if (data.createdBy === username) {
            delete prescoutingData[teamNum];
        }
    });
    savePrescoutingData();
}

function deleteSurvey(teamNum) {
    // Delete from prescoutingData
    if (prescoutingData[teamNum]) {
        delete prescoutingData[teamNum];
        savePrescoutingData();
    }
}

function savePrescoutingData() {
    localStorage.setItem('prescoutingData', JSON.stringify(prescoutingData));
}

function restrictTeamSelection() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const teamNumberInput = document.getElementById('teamNumber');
    
    if (!currentUser.isAdmin && currentUser.username !== '访客') {
        const assignedTeams = getUserAssignedTeams(currentUser.username);
        
        teamNumberInput.addEventListener('change', function() {
            const selectedTeam = this.value;
            if (selectedTeam && !assignedTeams.includes(selectedTeam)) {
                alert('您只能填写管理员指定的队伍。');
                this.value = '';
                document.getElementById('teamName').value = '';
            }
        });
    }
}
