let continuebtn = document.querySelector(".continue-btn-form")
let submitbtn = document.querySelector(".submit-btn-form")
let allCourses = document.querySelectorAll(".dropdown-content li a")
let allCoursesArray = []
let selectDom = document.querySelector(".option-inputs")
let verify_war = document.querySelector(".verify_war")
let otpBox = document.querySelector(".background");
let otpbtn = document.querySelector(".otp-btn");
let otpbutton = document.querySelector(".otp-btn-verify");
let inputs = document.querySelectorAll(".otpNumber input");
let userInputOtp =0;
let errorMsgBody = document.querySelector(".error-msg-span");


inputs.forEach((input, index1) => {
    input.addEventListener("keyup", (e) => {
      const currentInput = input,
        nextInput = input.nextElementSibling,
        prevInput = input.previousElementSibling;
      if (currentInput.value.length > 1) {
        currentInput.value = "";
        return;
      }
      if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
        nextInput.removeAttribute("disabled");
        nextInput.focus();
      }
    
      if (e.key === "Backspace") {
        inputs.forEach((input, index2) => {
          if (index1 <= index2 && prevInput) {
            input.setAttribute("disabled", true);
            input.value = "";
            prevInput.focus();
          }
        });
      }
    
      if (!inputs[5].disabled && inputs[5].value !== "") {
        otpbutton.classList.add("active");
        return;
      }
      otpbutton.classList.remove("active");
    });
    });
    


const firebaseConfig = {
  apiKey: "AIzaSyA8sJcCZgr-s560FDQqJf2PZygw7UfikiY",
  authDomain: "otp-for-netcoder-website.firebaseapp.com",
  projectId: "otp-for-netcoder-website",
  storageBucket: "otp-for-netcoder-website.firebasestorage.app",
  messagingSenderId: "986300499230",
  appId: "1:986300499230:web:57c01bce30fe09c5f6350f",
  measurementId: "G-X4NBHP5WSR"
};
      firebase.initializeApp(firebaseConfig);




function fetchCourse (){
    allCoursesArray.push(Array.from(allCourses).map((e)=>e.innerText))
    allCoursesArray =  allCoursesArray[0]
    appendCourse()
}

fetchCourse()


function appendCourse(){
    allCoursesArray.forEach((e)=>{
        let newEle = document.createElement("option")
        newEle.value = e
        newEle.innerText = e
        selectDom.appendChild(newEle)
    })
}




continuebtn.addEventListener("click",()=>{
    document.querySelector(".contact-form .slides:nth-child(1)").style.transform = "translateX(-20%)"
    document.querySelector(".contact-form .slides:nth-child(2)").style.transform = "translateX(50%)"
})



function shiftbox(){
    let name = document.querySelector("#name").value;
    let email = document.querySelector("#email").value;
    let number = document.querySelector("#number").value;
    
    let course = document.querySelector("#courses").value;
    let address = document.querySelector("#address").value;
    let message = document.querySelector("#message").value;
  
    emailjs.send("service_xukw6z4", "template_ny7v7la", {
      name,
      number,
      email,
      course,
      address,
      message,
    });
    document.querySelector(".contact-form .slides:nth-child(3)").style.transform = "translateX(-170%)"
    document.querySelector(".contact-form .slides:nth-child(4)").style.transform = "translateX(-150%)"
    let i = 5;
    function inter (){
        document.querySelector(".valReturn").innerText = i;
        i--
        if(i < 0 ){
            
            clearInterval(interval)
            document.location.href="/"
        }
    }
   let interval =  setInterval(inter,1000)
}

function phoneAuth() {
    var number = document.getElementById("number").value;
    number = '+91' + number;
    firebase
      .auth()
      .signInWithPhoneNumber(number, window.recaptchaVerifier)
      .then(function (confirmationResult) {
        window.confirmationResult = confirmationResult;
        coderesult = confirmationResult;
        
      })
      .catch(function (error) {
        otpBox.style.display = "none";
        alert(error.message);
      });
  }

function verifyOtp(){
  // inputs[0].focus()
  document.querySelector(".contact-form .slides:nth-child(2)").style.transform = "translateX(-170%)"
  document.querySelector(".contact-form .slides:nth-child(3)").style.transform = "translateX(-50%)"
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
        "recaptcha-container"
      );
      recaptchaVerifier.render();
      phoneAuth()
}

function verify(){
    let name = document.querySelector("#name").value;
    let email = document.querySelector("#email").value;
    let number = document.querySelector("#number").value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/; 
    const nameRegex = /^[a-zA-Z\s\-']+$/;
  
    const isValid = emailRegex.test(email) && phoneRegex.test(number.replace(/\D/g, '')) && nameRegex.test(name);
    
  
    isValid ? verifyOtp():verify_war.innerHTML="Enter Valid Input";
    

  }

  function codeverify() {

    coderesult
      .confirm(userInputOtp)
      .then(function () {
        setTimeout(() => {
          shiftbox()
        }, 1500);
        verify_war.innerHTML=""
        errorMsgBody.innerHTML = "Verified!";
      })
      .catch(function (err) {
        errorMsgBody.innerHTML = "Incorrect OTP";
        otpPara.innerHTML = "Please Re-Verify Captcha."
      });
  }

  otpbutton.addEventListener("click", (e) => {
    e.preventDefault();
    userInputOtp = Array.from(inputs).map((e) => parseInt(e.value.toString()[0])).join("");
    if (userInputOtp.length !== 6) {
      errorMsgBody.innerHTML = "Enter 6-digit OTP";
  
    } else {
      errorMsgBody.innerHTML = "Verifying...";
      codeverify();
    }
  });

  otpbutton.addEventListener("click",(e)=>{
    e.preventDefault()

  })
  

  submitbtn.addEventListener("click",(e)=>{
    e.preventDefault()
    verify();
    
  })
