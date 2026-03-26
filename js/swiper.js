// script.js

// This function dynamically creates and appends slides based on the data array
function renderTestimonials(testimonials) {
    const swiperWrapper = document.querySelector('.swiper-wrapper');
  
    // Clear existing slides if any (optional)
    swiperWrapper.innerHTML = '';
  
    testimonials.forEach(testimonial => {
      // Create the .swiper-slide container
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');
  
      // Stars element
      const stars = document.createElement('div');
      stars.classList.add('stars');
      stars.textContent = testimonial.stars;
  
      // Testimonial content element
      const content = document.createElement('p');
      content.classList.add('testimonial-content');
      content.textContent = testimonial.content;
  
      // Author element
      const author = document.createElement('p');
      author.classList.add('testimonial-author');
      author.textContent = testimonial.author;
  
      // Append stars, content, and author to the slide
      slide.appendChild(stars);
      slide.appendChild(content);
      slide.appendChild(author);
  
      // Finally, append this slide to the .swiper-wrapper
      swiperWrapper.appendChild(slide);
    });
  }
  
  // Wait until DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    // 1) Render the testimonials from the array
    renderTestimonials(testimonials);
  
    // 2) Initialize Swiper
    var swiper = new Swiper('.mySwiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        }
      }
    });
  });
  