document.addEventListener('DOMContentLoaded', () => {

  /* ================= HEADER SCROLL EFFECT ================= */
  const header = document.querySelector('.site-header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });


  /* ================= MOBILE MENU ================= */
  const menuBtn = document.querySelector('.menu-btn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn = mobileMenu?.querySelector('.close-btn');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // lock scroll
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }

  // Close menu when clicking a link
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });


  /* ================= GALLERY LIGHTBOX ================= */
  const grid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const caption = document.querySelector('.lightbox-caption');
  const lightboxClose = document.querySelector('.lightbox-close');

  function openLightbox(img) {
    lightboxImg.src = img.dataset.full || img.src;
    caption.textContent =
      img.closest('figure')?.querySelector('figcaption')?.textContent || '';
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    caption.textContent = '';
  }

  if (grid) {
    grid.addEventListener('click', e => {
      const img = e.target.closest('img');
      if (!img) return;
      openLightbox(img);
    });
  }

  lightboxClose?.addEventListener('click', closeLightbox);

  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });


  /* ================= BOOKING FORM ================= */
const form = document.getElementById('bookingForm');
const success = document.getElementById('bookingSuccess');

if (form && success) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = form.querySelector('#fullName').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    const date = form.querySelector('#date').value;

    if (!name || !phone || !date) {
      alert('Please enter your name, phone number, and preferred date.');
      return;
    }

    fetch('http://localhost:5000/api/book-appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, phone, date })
    })
    .then(res => res.json())
    .then(data => {
      success.innerHTML = `
        ✅ <strong>${data.message}</strong><br>
        Name: ${name}<br>
        Phone: ${phone}<br>
        Date: ${date}
      `;
      success.style.display = 'block';
      form.reset();
    })
    .catch(() => {
      alert('Server error. Please try again.');
    });
  });
}

/* ================= DOCTOR MODAL LOGIC ================= */

const doctorData = {
  awais: {
    name: "Dr. Md Awaisuddin",
    role: "Therapeutic Hijama & Wellness Specialist",
    img: "assets/doctor-amina.jpg.jpeg",
    details: [
      "🩺 5+ years of experience in Hijama (Cupping Therapy), Unani & Modern Medicine",
      "🎓 B.Sc BZC",
      "🎓 BUMS (Bachelor of Unani Medicine & Surgery)",
      "🎓 DNHE (Diploma in Nutrition & Health Education)",
      "💆‍♂️ Specializes in pain management, detox therapy & stress relief",
      "🧼 Follows strict hygiene & sterilization protocols",
      "🏠 Clinic & home-visit services available",
      "🗣 Languages: English, Hindi, Telugu, Urdu"
    ]
  },

  xxx: {
    name: "Dr. XXX",
    role: "Senior Hijama Practitioner & Women Care Specialist",
    img: "assets/doctor-omar.jpg.jpeg",
    details: [
      "👩‍⚕️ Specialized in women-centric hijama & holistic care",
      "🎓 BUMS (Bachelor of Unani Medicine & Surgery)",
      "🌸 Focus on hormonal balance & gynecological wellness",
      "🩺 Gentle, Patient-Centric therapeutic approach",
      "🧼 Uses disposable & medically approved equipment",
      "🗣 Languages: English, Hindi, Urdu"
    ]
  }
};

const doctorModal = document.getElementById('doctorModal');
const closeDoctorModal = document.getElementById('closeDoctorModal');

document.querySelectorAll('.doctor-card').forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.doctor;
    const data = doctorData[key];
    if (!data) return;

    document.getElementById('doctorModalImg').src = data.img;
    document.getElementById('doctorModalImg').alt = data.name;
    document.getElementById('doctorModalName').textContent = data.name;
    document.getElementById('doctorModalRole').textContent = data.role;

    const list = document.getElementById('doctorModalDetails');
    list.innerHTML = '';
    data.details.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });

    doctorModal.classList.add('open');
    doctorModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // lock scroll
  });
});

closeDoctorModal.addEventListener('click', closeModal);

doctorModal.addEventListener('click', e => {
  if (e.target === doctorModal) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

function closeModal() {
  doctorModal.classList.remove('open');
  doctorModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

});
// Disable past dates in calendar
document.getElementById('date').min =
  new Date().toISOString().split('T')[0];
