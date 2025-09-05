// Typing Effect
const text = ["Aspiring Software Developer", "Data Analyst", "Problem Solver", "Tech Innovator"];
let i = 0, j = 0, currentText = "", isDeleting = false;

function type() {
  currentText = text[i];
  let display = document.getElementById("typing");

  if (!isDeleting) {
    display.textContent = currentText.slice(0, ++j);
    if (j === currentText.length) {
      isDeleting = true;
      setTimeout(type, 1500);
      return;
    }
  } else {
    display.textContent = currentText.slice(0, --j);
    if (j === 0) {
      isDeleting = false;
      i = (i + 1) % text.length;
    }
  }
  setTimeout(type, isDeleting ? 50 : 100);
}
type();

// Footer Year
document.getElementById("year").textContent = new Date().getFullYear();
