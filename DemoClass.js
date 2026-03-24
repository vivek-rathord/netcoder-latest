let allCourses = document.querySelectorAll(".dropdown-content li a")
let allCoursesArray1 = []
let selectDom = document.querySelector(".demo-courses")
// let xbtn = document.querySelector(".x");
let form = document.querySelector(".blackSec");
let verify_war = document.querySelector(".verify_war")
let otpBox = document.querySelector(".background");
let otpbtn = document.querySelector(".otp-btn");
let otpbutton = document.querySelector(".otp-btn-verify");
let inputs = document.querySelectorAll(".otpNumber input");
let userInputOtp = 0;
let errorMsgBody = document.querySelector(".error-msg-span");
let slot = "Morning"
let otpPara = document.querySelector(".otpPara")


function nothing(e) {
  e.preventdefault
}

function shiftSlot(e) {
  slot = e
  if (slot === "Morning") {
    document.querySelector(".book-demo-slot-btn .btn1").classList.add("active-btn")
    document.querySelector(".book-demo-slot-btn .btn2").classList.remove("active-btn")
  } else {
    document.querySelector(".book-demo-slot-btn .btn1").classList.remove("active-btn")
    document.querySelector(".book-demo-slot-btn .btn2").classList.add("active-btn")

  }
}



function variableassign() {

}


const firebaseConfig = {
  apiKey: "AIzaSyAyM4tvCz7oMagXxz_nOi8spWIsmkhbpb8",
  authDomain: "otp-netcoder-website-demo.firebaseapp.com",
  projectId: "otp-netcoder-website-demo",
  storageBucket: "otp-netcoder-website-demo.appspot.com",
  messagingSenderId: "635675102143",
  appId: "1:635675102143:web:cbe478339b167bf3c8ef0a",
  measurementId: "G-DHH6BG4TD1"
};
firebase.initializeApp(firebaseConfig);



// xbtn.addEventListener("click", () => {
//     form.style.display = "none";
//   });





function openBox() {

  document.querySelector(".book-demo").style.display = "block"
}

function fetchCourse() {
  allCoursesArray1.push(Array.from(allCourses).map((e) => e.innerText))
  allCoursesArray1 = allCoursesArray1[0]
  appendCourse()
}

fetchCourse()


function appendCourse() {
  allCoursesArray1.forEach((e) => {
    let newEle = document.createElement("option")
    newEle.value = e
    newEle.innerText = e
    selectDom.appendChild(newEle)
  })
}

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

// window.addEventListener("load", () => inputs[0].focus());


function shiftbox() {
  let name = document.querySelector(".book-demo #name").value;
  let mail = document.querySelector(".book-demo #email").value;
  let number = document.querySelector(".book-demo #number").value;

  let course = document.querySelector(".book-demo #course").value;
  let address = document.querySelector(".book-demo #address").value;
  let date = document.querySelector(".book-demo #date").value;

  emailjs.send("service_fall03r", "template_zm1kfng", {
    name,
    number,
    mail,
    course,
    address,
    date,
    slot
  });
  document.querySelector(".background").innerHTML = ""
  document.querySelector(".background").innerHTML = "<div class='newAppedHTML'><p>Form Submitted.</p></div>"
}

function codeverify() {

  coderesult
    .confirm(userInputOtp)
    .then(function () {
      setTimeout(() => {
        otpBox.style.display = "none";
        shiftbox()
      }, 2000);
      verify_war.innerHTML = ""
      errorMsgBody.innerHTML = "Verified! And Details Submitted";
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
function verifyOtp() {
  verify_war.innerHTML = ""
  document.querySelector(".book-demo").style.display = "none"
  otpBox.style.display = "block"
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
    "recaptcha-container"
  );
  recaptchaVerifier.render();
  phoneAuth()

}

function phoneAuth() {
  var number = document.querySelector(".book-demo #number").value;
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
      console.log(error)
      alert(error.message);
    });
}


function verify() {
  let name = document.querySelector(".book-demo #name").value;
  let email = document.querySelector(".book-demo #email").value;
  let number = document.querySelector(".book-demo #number").value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;
  const nameRegex = /^[a-zA-Z\s\-']+$/;

  const isValid = emailRegex.test(email) && phoneRegex.test(number.replace(/\D/g, '')) && nameRegex.test(name);

  isValid ? verifyOtp() : verify_war.innerHTML = "Enter Valid Input";


}


// ---------------------------------------------------------------
// brochure-form
// getting reference 
let submitBtn = document.querySelector("form .color-btn");
// end 
// function to validate from 
function valiDateForm() {
  let name = document.querySelector(".brochure-form #name").value
  let number = document.querySelector(".brochure-form #number").value
  let email = document.querySelector(".brochure-form #email").value

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  const isValid = emailRegex.test(email) && phoneRegex.test(number.replace(/\D/g, '')) && nameRegex.test(name);

  if (isValid) {
    sendFormData()
  } else {
    return false
  }



}
// end 

// function to send from data of brochure form
 function sendFormData() {
    const params = {
      name: document.querySelector("#name").value,
      email: document.querySelector("#email").value,
      number: document.querySelector("#number").value
    };

    emailjs.send("service_o2c89my", "template_8k6ptrf", params)
      .then(function (res) {
Swal.fire({
  title: "Great Job!",
  text: "Submission Successful! Your form has been received, and the brochure will be sent to your email soon.",
  icon: "success",
  confirmButtonColor: "#ff5532",
  customClass: {
    popup: 'custom-swal-popup',
    icon: 'custom-swal-icon'
  }
});

      }, function (error) {
        Swal.fire({
          title: "Something went wrong",
          text: "Submission Unsuccessful. Please try again later!",
          icon: "error"
        });
        console.error("EmailJS error:", error);
      });
  }

// end 

submitBtn.addEventListener("click", (event) => {
  event.preventDefault()
  valiDateForm()
})





// end 



// close button 

function closeForm() {
  document.querySelector('.book-demo').style.display = 'none';
  document.querySelector('.close-btn').classList.add('clicked');
  setTimeout(function () {
    document.querySelector('.close-btn').classList.remove('clicked');
  }, 300);
}


  // JavaScript to close the form
  document.getElementById("closeOtpBtn").addEventListener("click", function () {
    document.getElementById("otpModal").style.display = "none";
  });

  // Set min date to today
     window.onload = function () {
        const dateInput = document.getElementById("date");

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const minDate = `${yyyy}-${mm}-${dd}`;
        dateInput.setAttribute("min", minDate);
        dateInput.value = minDate;
    };

    function shiftSlot(slot) {
        const warning = document.querySelector(".verify_war");
        const dateInput = document.getElementById("date");
        const morningBtn = document.getElementById("morningBtn");
        const eveningBtn = document.getElementById("eveningBtn");

        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        const currentHour = today.getHours();

        // Clear warning and reset button colors
        warning.textContent = "";
        morningBtn.classList.remove("selected-slot");
        eveningBtn.classList.remove("selected-slot");

        // Format today's date to compare
        const todayStr = today.toISOString().split('T')[0];

        if (
            slot === "Morning" &&
            dateInput.value === todayStr &&
            currentHour >= 12
        ) {
            warning.textContent = "❌ You cannot book Morning slot after 12:00 PM for today's date.";
            return;
        }

        // Highlight selected button
        if (slot === "Morning") {
            morningBtn.classList.add("selected-slot");
        } else if (slot === "Evening") {
            eveningBtn.classList.add("selected-slot");
        }

        warning.textContent = `✔ Slot selected: ${slot}`;
    }