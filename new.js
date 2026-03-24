 if (window.__OTP_FORM_LOADED__) {
  console.warn('Script already loaded, skipping re-init');
} else {
  window.__OTP_FORM_LOADED__ = true;
}

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyA8sJcCZgr-s560FDQqJf2PZygw7UfikiY",
  authDomain: "otp-for-netcoder-website.firebaseapp.com",
  projectId: "otp-for-netcoder-website",
  storageBucket: "otp-for-netcoder-website.firebasestorage.app",
  messagingSenderId: "986300499230",
  appId: "1:986300499230:web:57c01bce30fe09c5f6350f",
  measurementId: "G-X4NBHP5WSR"
};

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

const firebaseAuth = firebase.auth();
const firebaseFirestore = firebase.firestore();

/* ================= EMAILJS ================= */
 const EMAILJS_SERVICE_ID = 'service_fall03r'; //  
const EMAILJS_TEMPLATE_ID = 'template_zm1kfng';
const EMAILJS_PUBLIC_KEY = "arbtZPAg8iH0kJRCt";

let emailjsInitialized = false;

function initializeEmailJS() {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    emailjsInitialized = true;
    console.log('✅ EmailJS initialized');
    return true;
  } catch (error) {
    console.error('❌ EmailJS init failed:', error);
    return false;
  }
}

initializeEmailJS();
/*=============== SHOW MENU ===============*/
const showMenu = (toggleId, navId) => {
    const toggle = document.getElementById(toggleId),
        nav = document.getElementById(navId)

    toggle.addEventListener('click', () => {
        // Add show-menu class to nav menu
        nav.classList.toggle('show-menu')
        // Add show-icon to show and hide menu icon
        toggle.classList.toggle('show-icon')
    })
}

showMenu('nav-toggle', 'nav-menu')

/*=============== SHOW DROPDOWN MENU ===============*/
const dropdownItems = document.querySelectorAll('.dropdown-item')

// 1. Select each dropdown item
dropdownItems.forEach((item) => {
    const dropdownButton = item.querySelector('.dropdown-button')

    // 2. Select each button click
    dropdownButton.addEventListener('click', () => {
        // 7. Select the current show-dropdown class
        const showDropdown = document.querySelector('.show-dropdown')

        // 5. Call the toggleItem function
        toggleItem(item)

        // 8. Remove the show-dropdown class from other items
        if (showDropdown && showDropdown !== item) {
            toggleItem(showDropdown)
        }
    })
})

// 3. Create a function to display the dropdown
const toggleItem = (item) => {
    // 3.1. Select each dropdown content
    const dropdownContainer = item.querySelector('.dropdown-container')

    // 6. If the same item contains the show-dropdown class, remove
    if (item.classList.contains('show-dropdown')) {
        dropdownContainer.removeAttribute('style')
        item.classList.remove('show-dropdown')
    } else {
        // 4. Add the maximum height to the dropdown content and add the show-dropdown class
        dropdownContainer.style.height = dropdownContainer.scrollHeight + 'px'
        item.classList.add('show-dropdown')
    }
}

/*=============== DELETE DROPDOWN STYLES ===============*/
const mediaQuery = matchMedia('(min-width: 1118px)'),
    dropdownContainer = document.querySelectorAll('.dropdown-container')

// Function to remove dropdown styles in mobile mode when browser resizes
const removeStyle = () => {
    // Validate if the media query reaches 1118px
    if (mediaQuery.matches) {
        // Remove the dropdown container height style
        dropdownContainer.forEach((e) => {
            e.removeAttribute('style')
        })

        // Remove the show-dropdown class from dropdown item
        dropdownItems.forEach((e) => {
            e.classList.remove('show-dropdown')
        })
    }
}

addEventListener('resize', removeStyle)
/* ================= GLOBAL STATE ================= */
let currentSlide = 1;
let selectedService = null;
let confirmationResult = null;
let recaptchaVerifier = null;
let otpSent = false;
let formData = {};

/* ================= DOM ================= */
const educationType = document.getElementById('educationType');
const regularCoursesSection = document.getElementById('regularCoursesSection');
const industrialSection = document.getElementById('industrialSection');
const servicesSection = document.getElementById('servicesSection');
const serviceBtns = document.querySelectorAll('.service-btn');
const otpInputs = document.querySelectorAll('.otp-input');
const otpBtn = document.querySelector('.otp-btn');
const otpVerifyBtn = document.querySelector('.otp-btn-verify');

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing form...');
  
  if (educationType) {
    educationType.addEventListener('change', handleEducationTypeChange);
  }
  
  if (serviceBtns.length > 0) {
    serviceBtns.forEach(btn => btn.addEventListener('click', handleServiceSelect));
  }
  
  if (otpInputs.length > 0) {
    setupOTPInputs();
  }
  
  if (otpVerifyBtn) {
    otpVerifyBtn.style.display = 'none';
    otpVerifyBtn.disabled = false;
    otpVerifyBtn.innerText = 'Verify OTP';
  }
});

/* ================= HELPER FUNCTIONS ================= */
function getEducationTypeLabel(type) {
  const labels = {
    'regular': 'Regular Course',
    'industrial': 'Industrial Training',
    'services': 'Our Service'
  };
  return labels[type] || 'Not specified';
}

/* ================= SLIDE 1 ================= */
function handleEducationTypeChange() {
  if (!regularCoursesSection || !industrialSection || !servicesSection) return;
  
  regularCoursesSection.style.display = 'none';
  industrialSection.style.display = 'none';
  servicesSection.style.display = 'none';
  resetErrors();

  if (educationType.value === 'regular') regularCoursesSection.style.display = 'block';
  if (educationType.value === 'industrial') industrialSection.style.display = 'block';
  if (educationType.value === 'services') servicesSection.style.display = 'block';
}

function handleServiceSelect(e) {
  serviceBtns.forEach(b => b.classList.remove('selected'));
  e.target.classList.add('selected');
  selectedService = e.target.dataset.service;
}

function validateSlide1() {
  resetErrors();
  let valid = true;

  if (!educationType.value) {
    showError('educationTypeError', 'Please select an option');
    valid = false;
  }

  if (educationType.value === 'regular' && (!courseSelect || !courseSelect.value)) {
    showError('courseSelectError', 'Select a course');
    valid = false;
  }

  if (educationType.value === 'industrial') {
    if (!trainingType || !trainingType.value) {
      valid = false;
      showError('trainingTypeError','Required');
    }
    if (!trainingTech || !trainingTech.value) {
      valid = false;
      showError('trainingTechError','Required');
    }
  }

  if (educationType.value === 'services' && !selectedService) {
    showError('serviceError', 'Select a service');
    valid = false;
  }

  if (!valid) return;

  formData = {
    educationType: educationType.value,
    course: courseSelect?.value || '',
    trainingType: trainingType?.value || '',
    technology: trainingTech?.value || '',
    service: selectedService || ''
  };

  goToSlide(2);
}

/* ================= SLIDE 2 ================= */
function validateSlide2() {
  resetErrors();
  let valid = true;

  const name = fullName.value.trim();
  const mobile = mobileNumber.value.trim();
  const email = emailAddress.value.trim();

  if (!name) {
    valid = false;
    showError('fullNameError','Required');
  }
  if (!/^\d{10}$/.test(mobile)) {
    valid = false;
    showError('mobileNumberError','Invalid number');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    valid = false;
    showError('emailAddressError','Invalid email');
  }

  if (!valid) return;

  Object.assign(formData, {
    name, 
    mobile, 
    email,
    address: address?.value || '',
    message: message?.value || ''
  });

  goToSlide(3);
}

/* ================= OTP INPUT ================= */
function setupOTPInputs() {
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      if (input.value && index < 5) otpInputs[index + 1].focus();
      
      const filled = [...otpInputs].every(i => i.value.length === 1);
      if (filled && otpSent) {
        setTimeout(() => {
          verifyOTP();
        }, 300);
      }
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });
}

/* ================= SEND OTP ================= */
async function sendOTP() {
    console.log('Sending OTP to:', formData.mobile);
    
    try {
        otpBtn.disabled = true;
        otpBtn.innerText = 'Sending OTP...';

        if (!recaptchaVerifier) {
            recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
                'recaptcha-container',
                { size: 'normal' }
            );
            await recaptchaVerifier.render();
        }

        const phoneNumber = '+91' + formData.mobile;
        confirmationResult = await firebaseAuth.signInWithPhoneNumber(
            phoneNumber,
            recaptchaVerifier
        );

        otpSent = true;

        otpBtn.style.display = 'none';
        otpVerifyBtn.style.display = 'block';
        otpVerifyBtn.disabled = false;
        otpVerifyBtn.innerText = 'Verify OTP';

        otpInputs.forEach(i => {
            i.disabled = false;
            i.value = '';
        });

        otpInputs[0].focus();

        showToast('OTP sent successfully', 'success');

    } catch (error) {
        console.error('OTP sending error:', error);
        showToast('Failed to send OTP: ' + error.message, 'error');
        otpBtn.disabled = false;
        otpBtn.innerText = 'Send OTP';
    }
}

/* ================= VERIFY OTP ================= */
async function verifyOTP() {
    console.log('Verifying OTP...');

    if (!confirmationResult) {
        alert('Please click Send OTP first');
        return;
    }

    const otp = Array.from(otpInputs).map(i => i.value).join('');

    if (otp.length !== 6) {
        alert('Please enter 6 digit OTP');
        return;
    }

    try {
        otpVerifyBtn.disabled = true;
        otpVerifyBtn.innerText = 'Verifying...';

        await confirmationResult.confirm(otp);

        // SUCCESS
        goToSlide(4);
        startRedirectCountdown();

        // Save to Firebase
        saveToFirebase()
          .then(() => console.log('✅ Data saved to Firebase'))
          .catch(err => console.error('Firebase save error:', err));
        
        // Send email
        sendEmailNotification()
          .then(() => console.log('✅ Email sent successfully'))
          .catch(err => console.error('Email sending error:', err));

    } catch (error) {
        console.error('OTP verification error:', error);
        showToast('Invalid or expired OTP. Please try again.', 'error');
        otpVerifyBtn.disabled = false;
        otpVerifyBtn.innerText = 'Verify OTP';
        
        otpInputs.forEach(i => i.value = '');
        otpInputs[0].focus();
    }
}

/* ================= FIREBASE SAVE ================= */
async function saveToFirebase() {
  try {
    const docRef = await firebaseFirestore.collection('contactSubmissions').add({
      ...formData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      source: 'website',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Document written with ID:', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    throw error;
  }
}

/* ================= EMAIL (SIMPLE VERSION) ================= */
async function sendEmailNotification() {
  try {
    console.log('📧 Sending email notification...');
    
    // Check EmailJS
    if (!emailjsInitialized) {
      initializeEmailJS();
    }
    
    // Check if Service ID needs update
    if (EMAILJS_SERVICE_ID === 'service_epzpdfu') {
      console.error('❌ IMPORTANT: Update EMAILJS_SERVICE_ID with your actual Service ID from EmailJS dashboard');
    }
    
    // SIMPLE DATA for SIMPLE TEMPLATE
    const emailData = {
      name: formData.name || 'No Name',
      email: formData.email || 'No Email',
      phone: formData.mobile || 'No Phone',
      address: formData.address || 'Not provided',
      education_type: getEducationTypeLabel(formData.educationType),
      course: formData.course || formData.service || formData.trainingType || 'Not specified',
      technology: formData.technology || 'Not specified',
      message: formData.message || 'No message provided',
      timestamp: new Date().toLocaleString('en-IN'),
      reference_id: 'NC-' + Date.now().toString().slice(-6)
    };
    
    console.log('📧 Email data (simple):', emailData);
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      emailData
    );
    
    console.log(' Email sent successfully');
    showToast('Form submitted! Email sent.', 'success');
    return response;
    
  } catch (error) {
    console.error(' Email sending failed:', error);
    
    if (error.text) {
      console.error('Error details:', error.text);
      
      if (error.text.includes('service ID')) {
        console.error('❌ PROBLEM: Service ID is wrong');
        console.error('Current Service ID:', EMAILJS_SERVICE_ID);
        console.error('Go to https://dashboard.emailjs.com and get your actual Service ID');
      }
    }
    
    // Still success for user
    showToast('Form submitted successfully!', 'success');
    
    return { status: 200, text: 'Form submitted' };
  }
}

/* ================= UI HELPERS ================= */
function goToSlide(n) {
  document.querySelectorAll('.form-slide').forEach(s => s.classList.remove('active'));
  const targetSlide = document.getElementById(`slide${n}`);
  if (targetSlide) {
    targetSlide.classList.add('active');
    currentSlide = n;
  }
}

function showError(id, msg) { 
  const el = document.getElementById(id);
  if (el) el.innerText = msg; 
}

function resetErrors() { 
  document.querySelectorAll('.error-message').forEach(e => e.innerText=''); 
}

function showToast(msg, type = 'success') {
  console.log(`Toast: ${type} - ${msg}`);
  
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
    `;
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = msg;
  toast.style.cssText = `
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#ff9800'};
    color: white;
    padding: 12px 20px;
    margin-bottom: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode === toastContainer) {
      toastContainer.removeChild(toast);
    }
  }, 4000);
}

function startRedirectCountdown() {
  let count = 5;
  const countdownEl = document.querySelector('.countdown');
  if (countdownEl) {
    const interval = setInterval(() => {
      countdownEl.innerText = --count;
      if (count <= 0) {
        clearInterval(interval);
        window.location.href = 'index.html';
      }
    }, 1000);
  }
}

/* ================= TEST FUNCTION ================= */
window.testEmailJS = async function() {
  try {
    console.log('🧪 Testing EmailJS with simple template...');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      address: 'Test Address',
      education_type: 'Regular Course',
      course: 'Web Development',
      technology: 'MERN Stack',
      message: 'This is a test message',
      timestamp: new Date().toLocaleString(),
      reference_id: 'TEST-' + Date.now().toString().slice(-6)
    };
    
    console.log('Test data:', testData);
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      testData
    );
    
    console.log('Test email sent successfully!');
    showToast(' Test email sent! Check inbox.', 'success');
    return response;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    showToast('❌ Test failed: ' + (error.text || 'Check console'), 'error');
  }
};

// Make functions globally available
window.validateSlide1 = validateSlide1;
window.validateSlide2 = validateSlide2;
window.sendOTP = sendOTP;
window.verifyOTP = verifyOTP;
window.goToSlide = goToSlide;

console.log('✅ Form script loaded successfully');


// setup done  email js  configure 

//  chabot for  the contactjs

// Netcoder Data Extractor with proper icon handling
// class NetcoderDataExtractor {
//     constructor() {
//         this.baseUrl = 'https://netcoder.in';
//         this.cachedData = null;
//     }

//     async fetchData() {
//         try {
//             // Try to fetch actual data from netcoder.in
//             // Note: This requires CORS support or a proxy
//             const response = await fetch(this.baseUrl, {
//                 mode: 'cors',
//                 headers: {
//                     'Accept': 'text/html',
//                     'User-Agent': 'Netcoder-Chatbot/1.0'
//                 }
//             });
            
//             if (!response.ok) throw new Error('Failed to fetch');
            
//             const html = await response.text();
//             return this.parseHTML(html);
            
//         } catch (error) {
//             console.warn('Using fallback data:', error.message);
//             return this.getFallbackData();
//         }
//     }

//     parseHTML(html) {
//         // This is a simplified parser - in production you'd need more robust parsing
//         const parser = new DOMParser();
//         const doc = parser.parseFromString(html, 'text/html');
        
//         // Extract courses (example selectors - adjust based on actual website)
//         const courses = [];
//         const courseElements = doc.querySelectorAll('.course, .course-item, [class*="course"]');
        
//         courseElements.forEach((el, index) => {
//             const title = el.querySelector('h3, h4, .title')?.textContent || `Course ${index + 1}`;
//             const description = el.querySelector('p, .desc, .description')?.textContent || '';
//             const price = el.querySelector('.price, .fee')?.textContent || '';
            
//             courses.push({
//                 id: index + 1,
//                 title: title.trim(),
//                 description: description.trim(),
//                 price: price.trim() || 'Contact for pricing',
//                 duration: 'Varies',
//                 icon: this.getCourseIcon(title)
//             });
//         });
        
//         // Extract services
//         const services = [];
//         const serviceElements = doc.querySelectorAll('.service, .service-item, [class*="service"]');
        
//         serviceElements.forEach((el, index) => {
//             const title = el.querySelector('h3, h4, .title')?.textContent || `Service ${index + 1}`;
//             const description = el.querySelector('p, .desc')?.textContent || '';
            
//             services.push({
//                 id: index + 1,
//                 title: title.trim(),
//                 description: description.trim(),
//                 icon: this.getServiceIcon(title),
//                 features: ['Custom Solution', 'Expert Team', 'Support']
//             });
//         });
        
//         return {
//             courses: courses.length > 0 ? courses : this.getFallbackData().courses,
//             services: services.length > 0 ? services : this.getFallbackData().services,
//             extractedAt: new Date().toISOString()
//         };
//     }

//     getCourseIcon(title) {
//         const lowerTitle = title.toLowerCase();
//         if (lowerTitle.includes('web') || lowerTitle.includes('full stack')) return 'fa-solid fa-code';
//         if (lowerTitle.includes('data') || lowerTitle.includes('ai')) return 'fa-solid fa-robot';
//         if (lowerTitle.includes('mobile')) return 'fa-solid fa-mobile-screen-button';
//         if (lowerTitle.includes('cloud')) return 'fa-solid fa-cloud';
//         if (lowerTitle.includes('design')) return 'fa-solid fa-paintbrush';
//         return 'fa-solid fa-graduation-cap';
//     }

//     getServiceIcon(title) {
//         const lowerTitle = title.toLowerCase();
//         if (lowerTitle.includes('web')) return 'fa-solid fa-laptop-code';
//         if (lowerTitle.includes('mobile')) return 'fa-solid fa-mobile-screen-button';
//         if (lowerTitle.includes('ai') || lowerTitle.includes('machine')) return 'fa-solid fa-brain';
//         if (lowerTitle.includes('cloud')) return 'fa-solid fa-server';
//         if (lowerTitle.includes('design')) return 'fa-solid fa-paintbrush';
//         return 'fa-solid fa-gears';
//     }

//     getFallbackData() {
//         return {
//             courses: [
//                 {
//                     id: 1,
//                     title: "Full Stack Development",
//                     description: "Learn complete web development with modern technologies",
//                     price: "₹35,000",
//                     duration: "6 Months",
//                     icon: "fa-solid fa-code"
//                 },
//                 {
//                     id: 2,
//                     title: "Data Science & AI",
//                     description: "Master data analysis and artificial intelligence",
//                     price: "₹45,000",
//                     duration: "8 Months",
//                     icon: "fa-solid fa-robot"
//                 }
//             ],
//             services: [
//                 {
//                     id: 1,
//                     title: "Web Development",
//                     description: "Custom web solutions for your business",
//                     icon: "fa-solid fa-laptop-code",
//                     features: ["React", "Node.js", "MongoDB", "AWS"]
//                 },
//                 {
//                     id: 2,
//                     title: "Mobile App Development",
//                     description: "iOS and Android applications",
//                     icon: "fa-solid fa-mobile-screen-button",
//                     features: ["React Native", "Flutter", "Firebase"]
//                 }
//             ]
//         };
//     }

//     async getData() {
//         if (this.cachedData) {
//             return this.cachedData;
//         }
        
//         this.cachedData = await this.fetchData();
//         return this.cachedData;
//     }
// }

// // Floating Right Side Chatbot with Tabs and Animations
// class FloatingRightChatbot {
//     constructor() {
//         this.isOpen = false;
//         this.currentTab = 'chat';
//         this.currentLanguage = 'en';
//         this.messages = [];
//         this.initialize();
//     }

//     initialize() {
//         this.createChatbot();
//         this.loadNetcoderData();
//         this.setupEventListeners();
//         this.showWelcomeMessage();
//         this.autoOpen();
//     }

//     createChatbot() {
//         // Create main container
//         const container = document.createElement('div');
//         container.className = 'floating-right-chatbot';
//         container.innerHTML = `
//             <div class="chatbot-float-btn">
//                 <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqzxnAkp2rwPtM9tLiY5fSEZKiiBu9qE-rpw&s" 
//                      alt="Netcoder Chatbot">
//                 <div class="float-notification">1</div>
//             </div>
            
//             <div class="chatbot-popup-container">
//                 <!-- Header -->
//                 <div class="popup-header">
//                     <div class="header-left">
//                         <div class="header-avatar">
//                             <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqzxnAkp2rwPtM9tLiY5fSEZKiiBu9qE-rpw&s" 
//                                  alt="Netcoder Logo">
//                         </div>
//                         <div class="header-info">
//                             <h3>Netcoder AI</h3>
//                             <p>
//                                 <span class="status-dot"></span>
//                                 Online • 24/7 Support
//                             </p>
//                         </div>
//                     </div>
//                     <div class="header-actions">
//                         <button class="header-btn" id="minimizeBtn">
//                             <i class="fa-solid fa-minus"></i>
//                         </button>
//                         <button class="header-btn" id="closePopupBtn">
//                             <i class="fa-solid fa-xmark"></i>
//                         </button>
//                     </div>
//                 </div>
                
//                 <!-- Tabs -->
//                 <div class="chatbot-tabs">
//                     <button class="tab-btn active" data-tab="chat">
//                         <i class="fa-regular fa-comment-dots"></i>
//                         Chat
//                     </button>
//                     <button class="tab-btn" data-tab="courses">
//                         <i class="fa-solid fa-graduation-cap"></i>
//                         Courses
//                     </button>
//                     <button class="tab-btn" data-tab="services">
//                         <i class="fa-solid fa-gears"></i>
//                         Services
//                     </button>
//                 </div>
                
//                 <!-- Tab Content -->
//                 <div class="tab-content">
//                     <!-- Chat Tab -->
//                     <div class="tab-pane active" id="chatTab">
//                         <div class="chat-messages" id="chatMessages">
//                             <!-- Messages will be added here -->
//                         </div>
//                         <div class="typing-container" id="typingContainer">
//                             <div class="typing-dots">
//                                 <div class="typing-dot"></div>
//                                 <div class="typing-dot"></div>
//                                 <div class="typing-dot"></div>
//                             </div>
//                             <div class="typing-text">Netcoder AI is typing...</div>
//                         </div>
//                     </div>
                    
//                     <!-- Courses Tab -->
//                     <div class="tab-pane" id="coursesTab">
//                         <div class="courses-grid" id="coursesGrid">
//                             <!-- Courses will be loaded here -->
//                         </div>
//                     </div>
                    
//                     <!-- Services Tab -->
//                     <div class="tab-pane" id="servicesTab">
//                         <div class="services-list" id="servicesList">
//                             <!-- Services will be loaded here -->
//                         </div>
//                     </div>
//                 </div>
                
//                 <!-- Chat Input -->
//                 <div class="chat-input-area">
//                     <div class="input-wrapper">
//                         <input type="text" class="chat-input" id="chatInput" 
//                                placeholder="Type your message here...">
//                         <button class="send-btn" id="sendBtn">
//                             <i class="fa-solid fa-paper-plane"></i>
//                         </button>
//                     </div>
//                     <div class="quick-suggestions">
//                         <button class="quick-suggestion" data-question="Tell me about Netcoder.in">
//                             About Us
//                         </button>
//                         <button class="quick-suggestion" data-question="What courses do you offer?">
//                             Courses
//                         </button>
//                         <button class="quick-suggestion" data-question="What services do you provide?">
//                             Services
//                         </button>
//                     </div>
//                 </div>
                
//                 <!-- Language Switcher -->
//                 <div class="language-switcher-bottom">
//                     <button class="lang-option active" data-lang="en">
//                         <i class="fa-solid fa-globe"></i> English
//                     </button>
//                     <button class="lang-option" data-lang="hi">
//                         <i class="fa-solid fa-globe"></i> हिंदी
//                     </button>
//                 </div>
//             </div>
//         `;
        
//         document.body.appendChild(container);
//         this.container = container;
//     }

//     async loadNetcoderData() {
//         // Load data using NetcoderDataExtractor
//         try {
//             const extractor = new NetcoderDataExtractor();
//             const extractedData = await extractor.getData();
            
//             // Merge extracted data with chatbot data
//             this.data = {
//                 en: {
//                     courses: extractedData.courses || [],
//                     services: extractedData.services || [],
//                     responses: {
//                         welcome: "Hello! I'm your Netcoder.in AI assistant. How can I help you today?",
//                         about: "Netcoder.in is a leading software development company offering cutting-edge solutions in web development, mobile apps, AI/ML, and cloud services. We've been transforming ideas into digital reality since 2018.",
//                         services: "We offer a wide range of services including Custom Web Development, Mobile App Development, AI Solutions, Cloud Services, and UI/UX Design.",
//                         courses: "We offer comprehensive courses in Full Stack Web Development, Data Science & AI, Mobile App Development, and Cloud Computing.",
//                         contact: "You can contact us at:\n📧 contact@netcoder.in\n📞 +91 98765 43210\n📍 Tech Park, Bangalore",
//                         default: "I can help you with information about our courses, services, or contact details. What would you like to know?"
//                     }
//                 },
//                 hi: {
//                     courses: [
//                         {
//                             id: 1,
//                             title: "फुल स्टैक वेब डेवलपमेंट",
//                             description: "React, Node.js, MongoDB और क्लाउड डिप्लॉयमेंट के साथ आधुनिक वेब डेवलपमेंट सीखें",
//                             price: "₹35,000",
//                             duration: "6 महीने",
//                             icon: "fa-solid fa-code"
//                         },
//                         {
//                             id: 2,
//                             title: "डेटा साइंस और एआई",
//                             description: "Python, मशीन लर्निंग, डीप लर्निंग और एआई एल्गोरिदम सीखें",
//                             price: "₹45,000",
//                             duration: "8 महीने",
//                             icon: "fa-solid fa-robot"
//                         }
//                     ],
//                     services: [
//                         {
//                             id: 1,
//                             title: "कस्टम वेब डेवलपमेंट",
//                             description: "आपके व्यवसाय के अनुरूप उत्तरदायी, स्केलेबल वेब अनुप्रयोग बनाएं",
//                             icon: "fa-solid fa-laptop-code",
//                             features: ["React/Next.js", "Node.js", "MongoDB", "AWS"]
//                         }
//                     ],
//                     responses: {
//                         welcome: "नमस्ते! मैं आपका Netcoder.in AI सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
//                         about: "Netcoder.in एक प्रमुख सॉफ्टवेयर डेवलपमेंट कंपनी है जो वेब डेवलपमेंट, मोबाइल ऐप्स, AI/ML और क्लाउड सेवाओं में अत्याधुनिक समाधान प्रदान करती है। हम 2018 से विचारों को डिजिटल वास्तविकता में बदल रहे हैं।",
//                         services: "हम कस्टम वेब डेवलपमेंट, मोबाइल ऐप डेवलपमेंट, एआई समाधान, क्लाउड सेवाएं और UI/UX डिजाइन सहित विस्तृत सेवाएं प्रदान करते हैं।",
//                         courses: "हम फुल स्टैक वेब डेवलपमेंट, डेटा साइंस एंड एआई, मोबाइल ऐप डेवलपमेंट और क्लाउड कंप्यूटिंग में व्यापक पाठ्यक्रम प्रदान करते हैं।",
//                         contact: "आप हमसे संपर्क कर सकते हैं:\n📧 contact@netcoder.in\n📞 +91 98765 43210\n📍 टेक पार्क, बैंगलोर",
//                         default: "मैं आपकी हमारे पाठ्यक्रमों, सेवाओं या संपर्क विवरण के बारे में जानकारी में मदद कर सकता हूं। आप क्या जानना चाहेंगे?"
//                     }
//                 }
//             };
            
//             // If no data was extracted, use fallback
//             if (this.data.en.courses.length === 0) {
//                 this.data.en.courses = new NetcoderDataExtractor().getFallbackData().courses;
//             }
//             if (this.data.en.services.length === 0) {
//                 this.data.en.services = new NetcoderDataExtractor().getFallbackData().services;
//             }
            
//         } catch (error) {
//             console.error('Error loading data:', error);
//             // Use fallback data
//             const fallback = new NetcoderDataExtractor().getFallbackData();
//             this.data = {
//                 en: {
//                     courses: fallback.courses,
//                     services: fallback.services,
//                     responses: {
//                         welcome: "Hello! I'm your Netcoder.in AI assistant. How can I help you today?",
//                         about: "Netcoder.in is a leading software development company offering cutting-edge solutions in web development, mobile apps, AI/ML, and cloud services.",
//                         services: "We offer a wide range of services including Web Development, Mobile App Development, AI Solutions, and Cloud Services.",
//                         courses: "We offer comprehensive courses in Full Stack Web Development, Data Science & AI, and Mobile App Development.",
//                         contact: "You can contact us at:\n📧 contact@netcoder.in\n📞 +91 98765 43210",
//                         default: "I can help you with information about our courses, services, or contact details."
//                     }
//                 },
//                 hi: {
//                     courses: [],
//                     services: [],
//                     responses: {
//                         welcome: "नमस्ते! मैं आपका Netcoder.in AI सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
//                         about: "Netcoder.in एक प्रमुख सॉफ्टवेयर डेवलपमेंट कंपनी है।",
//                         services: "हम कस्टम वेब डेवलपमेंट, मोबाइल ऐप डेवलपमेंट, एआई समाधान प्रदान करते हैं।",
//                         courses: "हम फुल स्टैक वेब डेवलपमेंट, डेटा साइंस एंड एआई में पाठ्यक्रम प्रदान करते हैं।",
//                         contact: "आप हमसे संपर्क कर सकते हैं:\n📧 contact@netcoder.in\n📞 +91 98765 43210",
//                         default: "मैं आपकी हमारे पाठ्यक्रमों, सेवाओं या संपर्क विवरण के बारे में जानकारी में मदद कर सकता हूं।"
//                     }
//                 }
//             };
//         }
        
//         this.renderCourses();
//         this.renderServices();
//     }

//     setupEventListeners() {
//         const floatBtn = this.container.querySelector('.chatbot-float-btn');
//         const closeBtn = this.container.querySelector('#closePopupBtn');
//         const minimizeBtn = this.container.querySelector('#minimizeBtn');
//         const sendBtn = this.container.querySelector('#sendBtn');
//         const chatInput = this.container.querySelector('#chatInput');
//         const tabBtns = this.container.querySelectorAll('.tab-btn');
//         const langOptions = this.container.querySelectorAll('.lang-option');
//         const quickSuggestions = this.container.querySelectorAll('.quick-suggestion');
//         const notification = this.container.querySelector('.float-notification');

//         // Toggle chatbot
//         floatBtn.addEventListener('click', () => this.toggleChatbot());
//         closeBtn.addEventListener('click', () => this.closeChatbot());
//         minimizeBtn.addEventListener('click', () => this.minimizeChatbot());

//         // Send message
//         sendBtn.addEventListener('click', () => this.sendMessage());
//         chatInput.addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') this.sendMessage();
//         });

//         // Tab switching
//         tabBtns.forEach(btn => {
//             btn.addEventListener('click', () => {
//                 const tab = btn.dataset.tab;
//                 this.switchTab(tab);
//             });
//         });

//         // Language switching
//         langOptions.forEach(option => {
//             option.addEventListener('click', () => {
//                 const lang = option.dataset.lang;
//                 this.switchLanguage(lang);
//             });
//         });

//         // Quick suggestions
//         quickSuggestions.forEach(suggestion => {
//             suggestion.addEventListener('click', () => {
//                 const question = suggestion.dataset.question;
//                 chatInput.value = question;
//                 this.sendMessage();
//             });
//         });

//         // Hide notification when chatbot opens
//         floatBtn.addEventListener('click', () => {
//             notification.style.display = 'none';
//         });

//         // Close when clicking outside
//         document.addEventListener('click', (e) => {
//             if (this.isOpen && 
//                 !this.container.contains(e.target) && 
//                 !e.target.closest('.chatbot-float-btn')) {
//                 this.closeChatbot();
//             }
//         });
//     }

//     toggleChatbot() {
//         const popup = this.container.querySelector('.chatbot-popup-container');
//         const floatBtn = this.container.querySelector('.chatbot-float-btn');
        
//         this.isOpen = !this.isOpen;
        
//         if (this.isOpen) {
//             popup.classList.add('active');
//             floatBtn.classList.add('active');
            
//             // Focus on input after animation
//             setTimeout(() => {
//                 this.container.querySelector('#chatInput').focus();
//             }, 300);
            
//             // Scroll to bottom of messages
//             this.scrollToBottom();
//         } else {
//             popup.classList.remove('active');
//             floatBtn.classList.remove('active');
//         }
//     }

//     closeChatbot() {
//         this.container.querySelector('.chatbot-popup-container').classList.remove('active');
//         this.container.querySelector('.chatbot-float-btn').classList.remove('active');
//         this.isOpen = false;
//     }

//     minimizeChatbot() {
//         this.closeChatbot();
//     }

//     switchTab(tabName) {
//         this.currentTab = tabName;
        
//         // Update active tab button
//         const tabBtns = this.container.querySelectorAll('.tab-btn');
//         tabBtns.forEach(btn => {
//             btn.classList.toggle('active', btn.dataset.tab === tabName);
//         });
        
//         // Show active tab content
//         const tabPanes = this.container.querySelectorAll('.tab-pane');
//         tabPanes.forEach(pane => {
//             pane.classList.toggle('active', pane.id === `${tabName}Tab`);
//         });
        
//         // If switching to chat tab, focus input
//         if (tabName === 'chat') {
//             setTimeout(() => {
//                 this.container.querySelector('#chatInput').focus();
//             }, 300);
//         }
//     }

//     switchLanguage(lang) {
//         this.currentLanguage = lang;
        
//         // Update active language button
//         const langOptions = this.container.querySelectorAll('.lang-option');
//         langOptions.forEach(option => {
//             option.classList.toggle('active', option.dataset.lang === lang);
//         });
        
//         // Update content based on language
//         this.updateContentForLanguage(lang);
        
//         // Update input placeholder
//         const placeholder = lang === 'hi' 
//             ? 'अपना संदेश यहाँ लिखें...' 
//             : 'Type your message here...';
//         this.container.querySelector('#chatInput').placeholder = placeholder;
//     }

//     updateContentForLanguage(lang) {
//         // Update quick suggestions
//         const suggestions = this.container.querySelectorAll('.quick-suggestion');
//         if (lang === 'hi') {
//             suggestions[0].textContent = 'हमारे बारे में';
//             suggestions[1].textContent = 'पाठ्यक्रम';
//             suggestions[2].textContent = 'सेवाएं';
//         } else {
//             suggestions[0].textContent = 'About Us';
//             suggestions[1].textContent = 'Courses';
//             suggestions[2].textContent = 'Services';
//         }
        
//         // Re-render courses and services
//         this.renderCourses();
//         this.renderServices();
//     }

//     renderCourses() {
//         const coursesGrid = this.container.querySelector('#coursesGrid');
//         const courses = this.data[this.currentLanguage].courses;
        
//         if (!courses || courses.length === 0) {
//             coursesGrid.innerHTML = `
//                 <div class="no-data" style="text-align: center; padding: 40px 20px; color: #94a3b8;">
//                     <i class="fa-solid fa-book" style="font-size: 3rem; margin-bottom: 15px; color: #FF6B35;"></i>
//                     <p>${this.currentLanguage === 'hi' ? 'कोर्स जल्द ही उपलब्ध होंगे' : 'Courses coming soon'}</p>
//                 </div>
//             `;
//             return;
//         }
        
//         coursesGrid.innerHTML = courses.map((course, index) => `
//             <div class="course-card" style="animation-delay: ${index * 0.1}s">
//                 <div class="course-header">
//                     <div class="course-icon">
//                         <i class="${course.icon}"></i>
//                     </div>
//                     <div class="course-price">${course.price}</div>
//                 </div>
//                 <div class="course-title">${course.title}</div>
//                 <div class="course-desc">${course.description}</div>
//                 <div class="course-footer">
//                     <div class="course-duration">
//                         <i class="fa-regular fa-clock"></i> ${course.duration}
//                     </div>
//                     <button class="enroll-btn" data-course-id="${course.id}">
//                         ${this.currentLanguage === 'hi' ? 'दाखिला लें' : 'Enroll Now'}
//                     </button>
//                 </div>
//             </div>
//         `).join('');
        
//         // Add event listeners to enroll buttons
//         coursesGrid.querySelectorAll('.enroll-btn').forEach(btn => {
//             btn.addEventListener('click', (e) => {
//                 e.stopPropagation();
//                 const courseId = btn.dataset.courseId;
//                 this.showCourseDetails(courseId);
//             });
//         });
//     }

//     renderServices() {
//         const servicesList = this.container.querySelector('#servicesList');
//         const services = this.data[this.currentLanguage].services;
        
//         if (!services || services.length === 0) {
//             servicesList.innerHTML = `
//                 <div class="no-data" style="text-align: center; padding: 40px 20px; color: #94a3b8;">
//                     <i class="fa-solid fa-gears" style="font-size: 3rem; margin-bottom: 15px; color: #FF6B35;"></i>
//                     <p>${this.currentLanguage === 'hi' ? 'सेवाएं जल्द ही उपलब्ध होंगी' : 'Services coming soon'}</p>
//                 </div>
//             `;
//             return;
//         }
        
//         servicesList.innerHTML = services.map((service, index) => `
//             <div class="service-item" style="animation-delay: ${index * 0.1}s">
//                 <div class="service-icon">
//                     <i class="${service.icon}"></i>
//                 </div>
//                 <div class="service-title">${service.title}</div>
//                 <div class="service-desc">${service.description}</div>
//                 <div class="service-features">
//                     ${service.features.map(feature => `
//                         <span class="service-feature">${feature}</span>
//                     `).join('')}
//                 </div>
//             </div>
//         `).join('');
//     }

//     showCourseDetails(courseId) {
//         const course = this.data[this.currentLanguage].courses.find(c => c.id == courseId);
//         if (!course) return;
        
//         // Switch to chat tab and send course info
//         this.switchTab('chat');
        
//         const message = this.currentLanguage === 'hi'
//             ? `${course.title} के बारे में अधिक जानकारी चाहते हैं? यह ${course.duration} का कोर्स है और इसकी कीमत ${course.price} है।`
//             : `Interested in ${course.title}? This is a ${course.duration} course priced at ${course.price}.`;
        
//         this.addBotMessage(message);
        
//         // Ask if they want to enroll
//         setTimeout(() => {
//             const followUp = this.currentLanguage === 'hi'
//                 ? "क्या आप इस कोर्स में दाखिला लेना चाहेंगे? हम आपको विस्तृत जानकारी भेज सकते हैं।"
//                 : "Would you like to enroll in this course? We can send you more details.";
            
//             this.addBotMessage(followUp);
//         }, 1000);
//     }

//     showWelcomeMessage() {
//         const welcomeMsg = this.data[this.currentLanguage].responses.welcome;
//         this.addBotMessage(welcomeMsg);
//     }

//     addMessage(text, isUser = false) {
//         const chatMessages = this.container.querySelector('#chatMessages');
//         const messageDiv = document.createElement('div');
//         messageDiv.className = `chat-message ${isUser ? 'message-user' : 'message-bot'}`;
        
//         messageDiv.innerHTML = `
//             <div class="message-avatar">
//                 <i class="fa-solid ${isUser ? 'fa-user' : 'fa-robot'}"></i>
//             </div>
//             <div class="message-content">${text}</div>
//         `;
        
//         chatMessages.appendChild(messageDiv);
//         this.scrollToBottom();
        
//         // Add animation
//         setTimeout(() => {
//             messageDiv.style.opacity = '1';
//             messageDiv.style.transform = 'translateY(0)';
//         }, 10);
//     }

//     addUserMessage(text) {
//         this.addMessage(text, true);
//         this.messages.push({ text, isUser: true });
//     }

//     addBotMessage(text) {
//         this.addMessage(text, false);
//         this.messages.push({ text, isUser: false });
//     }

//     showTypingIndicator() {
//         const typingContainer = this.container.querySelector('#typingContainer');
//         typingContainer.classList.add('active');
//         this.scrollToBottom();
//     }

//     hideTypingIndicator() {
//         const typingContainer = this.container.querySelector('#typingContainer');
//         typingContainer.classList.remove('active');
//     }

//     async sendMessage() {
//         const input = this.container.querySelector('#chatInput');
//         const message = input.value.trim();
        
//         if (!message) return;
        
//         // Add user message
//         this.addUserMessage(message);
//         input.value = '';
        
//         // Show typing indicator
//         this.showTypingIndicator();
        
//         // Simulate AI processing
//         await this.simulateTyping();
        
//         // Generate response
//         const response = this.generateResponse(message);
        
//         // Hide typing and show response
//         this.hideTypingIndicator();
//         this.addBotMessage(response);
        
//         // Auto-scroll
//         this.scrollToBottom();
//     }

//     simulateTyping() {
//         return new Promise(resolve => {
//             const delay = 1000 + Math.random() * 1000; // 1-2 seconds
//             setTimeout(resolve, delay);
//         });
//     }

//     generateResponse(userMessage) {
//         const lang = this.currentLanguage;
//         const responses = this.data[lang].responses;
//         const message = userMessage.toLowerCase();
        
//         if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
//             return responses.welcome;
//         } else if (message.includes('about') || message.includes('what is netcoder')) {
//             return responses.about;
//         } else if (message.includes('service')) {
//             return responses.services;
//         } else if (message.includes('course')) {
//             return responses.courses;
//         } else if (message.includes('contact') || message.includes('email') || message.includes('phone')) {
//             return responses.contact;
//         } else if (message.includes('thank')) {
//             return lang === 'hi' 
//                 ? "आपका धन्यवाद! यदि आपके और प्रश्न हैं तो बताएं।" 
//                 : "You're welcome! Let me know if you have more questions.";
//         } else if (message.includes('price') || message.includes('cost')) {
//             return lang === 'hi'
//                 ? "हमारे पाठ्यक्रम ₹20,000 से ₹45,000 तक हैं। सेवाओं की कीमत परियोजना आवश्यकताओं पर निर्भर करती है।"
//                 : "Our courses range from ₹20,000 to ₹45,000. Service pricing depends on project requirements.";
//         } else {
//             return responses.default;
//         }
//     }

//     scrollToBottom() {
//         const chatMessages = this.container.querySelector('#chatMessages');
//         if (chatMessages) {
//             setTimeout(() => {
//                 chatMessages.scrollTop = chatMessages.scrollHeight;
//             }, 100);
//         }
//     }

//     autoOpen() {
//         // Auto-open after 3 seconds on first visit
//         if (!sessionStorage.getItem('chatbotAutoOpened')) {
//             setTimeout(() => {
//                 this.toggleChatbot();
//                 sessionStorage.setItem('chatbotAutoOpened', 'true');
//             }, 3000);
//         }
//     }
// }

// // Initialize chatbot when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     window.netcoderFloatingChatbot = new FloatingRightChatbot();
// });