// 1, 2, 3. Кнопка наверх, прокрутка и анимация
document.getElementById('year').textContent = new Date().getFullYear();

const toTopBtn = document.getElementById('to-top');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) toTopBtn.classList.add('show');
  else toTopBtn.classList.remove('show');
});
toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('active');
  });
}, { threshold: 0.1 });
reveals.forEach(reveal => observer.observe(reveal));

// 10. Модальное окно
const modal = document.getElementById('modal');
const modalName = document.getElementById('modal-name');
const modalDesc = document.getElementById('modal-desc');
const closeBtn = document.querySelector('.close-btn');

const doctorsData = {
  "1": { nameRu: "Иванов Иван", nameEn: "Ivan Ivanov", descRu: "Главный врач, стаж 15 лет. Специализация: внутренние болезни, кардиология.", descEn: "Chief physician, 15 years of experience. Specialization: internal diseases, cardiology." },
  "2": { nameRu: "Смирнова Анна", nameEn: "Anna Smirnova", descRu: "Ветеринарный хирург, стаж 8 лет. Специализация: хирургия мелких домашних животных.", descEn: "Veterinary surgeon, 8 years of experience. Specialization: surgery of small pets." },
  "3": { nameRu: "Петров Олег", nameEn: "Oleg Petrov", descRu: "Дерматолог, стаж 6 лет. Специализация: дерматология, уход за шерстью.", descEn: "Dermatologist, 6 years of experience. Specialization: dermatology, coat care." }
};

document.querySelectorAll('.more-info-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const docId = e.target.getAttribute('data-doctor');
    const lang = localStorage.getItem('siteLang') || 'ru';
    modalName.textContent = lang === 'ru' ? doctorsData[docId].nameRu : doctorsData[docId].nameEn;
    modalDesc.textContent = lang === 'ru' ? doctorsData[docId].descRu : doctorsData[docId].descEn;
    modal.classList.add('active');
  });
});
closeBtn.addEventListener('click', () => modal.classList.remove('active'));
window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

// 9. Слайдер без библиотек
const slider = document.getElementById('review-slider');
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function updateSlider() {
  slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

document.getElementById('next-slide').addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlider();
});

document.getElementById('prev-slide').addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlider();
});

// 7, 4. Переключение языка (с сохранением в LocalStorage)
let currentLang = localStorage.getItem('siteLang') || 'ru';
const langBtn = document.getElementById('lang-toggle');

function setLanguage(lang) {
  document.querySelectorAll('[data-ru]').forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
  document.querySelectorAll('[data-ru-placeholder]').forEach(el => {
    el.placeholder = el.getAttribute(`data-${lang}-placeholder`);
  });
  langBtn.textContent = lang === 'ru' ? 'EN' : 'RU';
  currentLang = lang;
  localStorage.setItem('siteLang', lang);
}
langBtn.addEventListener('click', () => setLanguage(currentLang === 'ru' ? 'en' : 'ru'));
setLanguage(currentLang);

// 8. Поиск по услугам
const searchInput = document.getElementById('service-search');
const serviceCards = document.querySelectorAll('.service-card');

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  serviceCards.forEach(card => {
    const nameRu = card.getAttribute('data-name-ru').toLowerCase();
    const nameEn = card.getAttribute('data-name-en').toLowerCase();
    if (nameRu.includes(query) || nameEn.includes(query)) card.classList.remove('hidden-card');
    else card.classList.add('hidden-card');
  });
});

// Отправка формы через Netlify Forms + Валидация
const form = document.getElementById('appointment-form');
const successMsg = document.getElementById('success-msg');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const dateInput = document.getElementById('date');
const serviceSelect = document.getElementById('service');

function showError(input, errorId, message) {
  document.getElementById(errorId).textContent = message;
  input.classList.add('error');
}
function clearError(input, errorId) {
  document.getElementById(errorId).textContent = '';
  input.classList.remove('error');
}

nameInput.addEventListener('input', () => clearError(nameInput, 'name-error'));
phoneInput.addEventListener('input', () => clearError(phoneInput, 'phone-error'));
dateInput.addEventListener('input', () => clearError(dateInput, 'date-error'));
serviceSelect.addEventListener('change', () => clearError(serviceSelect, 'service-error'));

if (localStorage.getItem('savedNameVet')) nameInput.value = localStorage.getItem('savedNameVet');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let isValid = true;
  successMsg.classList.add('hidden');

  // Валидация
  if (serviceSelect.value === "") { showError(serviceSelect, 'service-error', 'Выберите услугу'); isValid = false; } else { clearError(serviceSelect, 'service-error'); }
  if (nameInput.value.trim().length < 2) { showError(nameInput, 'name-error', 'Введите имя'); isValid = false; } else { clearError(nameInput, 'name-error'); }
  
  const phoneDigits = phoneInput.value.replace(/\D/g, ''); 
  if (phoneDigits.length < 10) { showError(phoneInput, 'phone-error', 'Введите корректный телефон'); isValid = false; } else { clearError(phoneInput, 'phone-error'); }
  
  if (!dateInput.value) { showError(dateInput, 'date-error', 'Выберите дату'); isValid = false; } 
  else {
    const selectedDate = new Date(dateInput.value);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (selectedDate < today) { showError(dateInput, 'date-error', 'Дата не может быть в прошлом'); isValid = false; } else { clearError(dateInput, 'date-error'); }
  }

  // Отправка через Netlify
  if (isValid) {
    if (nameInput.value.trim().length > 1) localStorage.setItem('savedNameVet', nameInput.value.trim());

    const formData = new FormData(form);
    
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString()
    }).then(() => {
      successMsg.classList.remove('hidden');
      form.reset();
      if (localStorage.getItem('savedNameVet')) nameInput.value = localStorage.getItem('savedNameVet');
      setTimeout(() => successMsg.classList.add('hidden'), 5000);
    }).catch(() => {
      alert("Произошла ошибка при отправке. Попробуйте позже.");
    });
  }
});

// Клик по кнопке "Записаться" на карточке услуги
document.querySelectorAll('.service-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    document.getElementById('service').value = card.getAttribute('data-service');
    document.getElementById('appointment').scrollIntoView({ behavior: 'smooth' });
  });
});
