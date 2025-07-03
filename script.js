// script.js

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login");
  const signupSection = document.getElementById("signup");
  const showLoginBtn = document.getElementById("showLogin");
  const showSignupBtn = document.getElementById("showSignup");

  if (showLoginBtn && showSignupBtn && loginSection && signupSection) {
    showLoginBtn.addEventListener("click", () => {
      loginSection.style.display = "block";
      signupSection.style.display = "none";
    });

    showSignupBtn.addEventListener("click", () => {
      loginSection.style.display = "none";
      signupSection.style.display = "block";
    });
  }

  window.togglePassword = function (inputId, toggleIcon) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
      input.type = "text";
      toggleIcon.textContent = "🙈";
    } else {
      input.type = "password";
      toggleIcon.textContent = "👁";
    }
  };

  // ===================== SIGNUP =====================
  const signupBtn = document.getElementById("signup-btn");
  if (signupBtn) {
    signupBtn.addEventListener("click", signupHandler);

    // Handle enter key
    const signupForm = document.getElementById("signup-form") || document;
    signupForm.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        signupHandler();
      }
    });
  }

  function signupHandler() {
    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;
    const agreeTerms = document.getElementById("agree-terms")?.checked;
    const agreePrivacy = document.getElementById("agree-privacy")?.checked;
    const agreeFeedback = document.getElementById("agree-feedback")?.checked;

    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!agreeTerms || !agreePrivacy || !agreeFeedback) {
      alert("Please agree to all required checkboxes.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("musicPlayerUsers") || "[]");
    const emailExists = users.some(u => u.email === email);
    if (emailExists) {
      alert("Email already registered. Please login.");
      return;
    }

    users.push({ username, email, password });
    localStorage.setItem("musicPlayerUsers", JSON.stringify(users));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loggedInUser", username);
    alert("Signup successful! Redirecting to Home...");
    window.location.href = "index.html";
  }

  // ===================== LOGIN =====================
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", loginHandler);

    // Handle enter key
    const loginForm = document.getElementById("login-form") || document;
    loginForm.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        loginHandler();
      }
    });
  }

  function loginHandler() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const rememberMe = document.getElementById("remember-me")?.checked;

    const users = JSON.parse(localStorage.getItem("musicPlayerUsers") || "[]");
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (!foundUser) {
      alert("Invalid email or password.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loggedInUser", foundUser.username);
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }

    alert(`Welcome back, ${foundUser.username}! Redirecting to Home...`);
    window.location.href = "index.html";
  }

  if (localStorage.getItem("rememberMe") === "true") {
    localStorage.setItem("isLoggedIn", "true");
  }

  const welcomeUser = document.getElementById("welcome-user");
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const loggedInUsername = localStorage.getItem("loggedInUser");

  if (welcomeUser && isLoggedIn === "true" && loggedInUsername) {
    welcomeUser.textContent = `🎉 Welcome, ${loggedInUsername}!`;
  }

  const isProtectedPage = !window.location.pathname.includes("login.html") && !window.location.pathname.includes("signup.html");
  if (isProtectedPage && isLoggedIn !== "true") {
    window.location.href = "login.html";
  }

  const logoutBtn = document.querySelector(".logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("rememberMe");
      alert("You have been logged out.");
      window.location.href = "login.html";
    });
  }

  const loginLink = document.getElementById("login-link");
  const signupLink = document.getElementById("signup-link");
  const logoutButton = document.getElementById("logout-btn");

  if (isLoggedIn === "true") {
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";
    if (logoutButton) logoutButton.style.display = "inline-block";
  } else {
    if (loginLink) loginLink.style.display = "inline-block";
    if (signupLink) signupLink.style.display = "inline-block";
    if (logoutButton) logoutButton.style.display = "none";
  }

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA") {
      event.preventDefault();

      const audio = document.getElementById("audio-player");
      const togglePlayBtn = document.getElementById("toggle-play-btn");

      if (audio && togglePlayBtn) {
        if (audio.paused) {
          audio.play();
          togglePlayBtn.textContent = "⏸️ Pause";
        } else {
          audio.pause();
          togglePlayBtn.textContent = "▶️ Play";
        }
      }
    }
  });

  
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
      e.preventDefault();
      alert("🎉 Your message has been sent!");
      this.reset();
    });
  }
});
