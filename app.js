// Shared behaviour for every page (front-end demo only, no database).
var ROLE_KEY = "rf-role";

function getRole() {
  try { return sessionStorage.getItem(ROLE_KEY) || "guest"; } catch (e) { return "guest"; }
}
function setRole(role) {
  try { sessionStorage.setItem(ROLE_KEY, role); } catch (e) {}
}

// Navigation links for each role: [label, file, extra class]
var NAV = {
  guest: [["Home", "index.html"], ["Browse", "browse.html"], ["Log in", "login.html"], ["Sign up", "signup.html", "btn btn-small"]],
  user: [["Home", "index.html"], ["Browse", "browse.html"], ["My Favorites", "favorites.html"], ["Log out", "login.html", "logout"]],
  admin: [["Home", "index.html"], ["Recipe List", "admin.html"], ["Add Recipe", "recipe-form.html"], ["Log out", "login.html", "logout"]]
};

function renderHeader() {
  var header = document.getElementById("site-header");
  if (!header) return;
  var role = getRole();
  var page = location.pathname.split("/").pop() || "index.html";
  var items = NAV[role].map(function (l) {
    var current = l[1] === page ? ' aria-current="page"' : "";
    var cls = l[2] ? ' class="' + l[2] + '"' : "";
    return '<li><a href="' + l[1] + '"' + cls + current + ">" + l[0] + "</a></li>";
  }).join("");
  header.innerHTML =
    '<a class="brand" href="index.html">Recipe Finder</a>' +
    '<nav aria-label="Main navigation"><ul class="nav-links">' + items + "</ul></nav>" +
    '<div class="role-picker"><label for="role-select">Preview as</label>' +
    '<select id="role-select"><option value="guest">Guest</option><option value="user">User</option><option value="admin">Admin</option></select></div>';
  var select = document.getElementById("role-select");
  select.value = role;
  select.addEventListener("change", function () { setRole(select.value); renderHeader(); });
  header.querySelectorAll(".logout").forEach(function (a) {
    a.addEventListener("click", function () { setRole("guest"); });
  });
}
renderHeader();

// Login: pick a role, then go to the matching page
var loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var role = document.getElementById("login-role").value;
    setRole(role);
    location.href = role === "admin" ? "admin.html" : "browse.html";
  });
}

// Sign-up: check that both passwords match
var signupForm = document.getElementById("signup-form");
if (signupForm) {
  var pw = document.getElementById("password");
  var pw2 = document.getElementById("confirm");
  function checkMatch() {
    pw2.setCustomValidity(pw.value === pw2.value ? "" : "Passwords do not match.");
  }
  pw.addEventListener("input", checkMatch);
  pw2.addEventListener("input", checkMatch);
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    location.href = "login.html";
  });
}

// Favorite buttons (details page and browse page)
document.querySelectorAll(".fav-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var saved = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", String(!saved));
    var off = btn.dataset.off || "♡ Save";
    var on = btn.dataset.on || "♥ Saved";
    btn.textContent = saved ? off : on;
  });
});

// Favorites page: remove a card and show the empty state when none are left
document.querySelectorAll(".remove-fav").forEach(function (btn) {
  btn.addEventListener("click", function () {
    btn.closest(".recipe-card").remove();
    var left = document.querySelectorAll("#fav-grid .recipe-card").length;
    document.getElementById("fav-empty").hidden = left !== 0;
    document.getElementById("fav-count").textContent = left + (left === 1 ? " saved recipe" : " saved recipes");
  });
});

// Admin list: delete a row and show the empty state when the table is empty
document.querySelectorAll(".delete-row").forEach(function (btn) {
  btn.addEventListener("click", function () {
    if (!confirm("Delete this recipe?")) return;
    btn.closest("tr").remove();
    var left = document.querySelectorAll("#admin-body tr").length;
    document.getElementById("admin-empty").hidden = left !== 0;
  });
});

// Add/Edit form: repeatable ingredient rows and edit mode title
var addBtn = document.getElementById("add-ingredient");
if (addBtn) {
  var list = document.getElementById("ingredient-list");
  var tpl = document.getElementById("ingredient-template");
  addBtn.addEventListener("click", function () {
    list.appendChild(tpl.content.cloneNode(true));
  });
  list.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-ingredient") && list.children.length > 1) {
      e.target.closest(".ingredient-row").remove();
    }
  });
  if (new URLSearchParams(location.search).get("mode") === "edit") {
    document.getElementById("form-title").textContent = "Edit recipe";
    document.getElementById("save-btn").textContent = "Save changes";
    document.title = "Edit Recipe | Recipe Finder";
  }
  document.getElementById("recipe-form").addEventListener("submit", function (e) {
    e.preventDefault();
    location.href = "admin.html";
  });
}
