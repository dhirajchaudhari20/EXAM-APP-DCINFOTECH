// This script dynamically generates pricing cards for various services using JavaScript.
// Ensure the DOM is fully loaded before executing the script
// Pricing data array
const pricingData = [
  {
    badge: { text: "Exclusive Offer", class: "bg-warning text-dark" },
    newTag: { text: "New", class: "bg-danger" },
    icon: "fab fa-google",
    title: "Google Cloud Training",
    colorClass: "text-primary",
    price: "2,000",
    marketPrice: "5,000",
    priceInfo: "Starting From",
    features: [
      { icon: "fas fa-graduation-cap text-primary", text: "<strong>Comprehensive</strong> Google Cloud Training" },
      { icon: "fas fa-user-friends text-primary", text: "<strong>Personalized</strong> 1-on-1 Mentorship" },
      { icon: "fas fa-lock-open text-primary", text: "<strong>Exclusive Access</strong> to Cloud Resources" },
      { icon: "fas fa-certificate text-primary", text: "<strong>Dedicated Assistance</strong> for Certification" },
      { icon: "fas fa-laptop-code text-primary", text: "<strong>Hands-On</strong> Practical Learning" }
    ],
    button: { text: "Get to Know More", link: "google-cloud-certifications" }
  },
  {
    badge: { text: "Trending", class: "bg-warning text-dark" },
    newTag: { text: "New", class: "bg-danger" },
    icon: "fab fa-aws",
    title: "AWS Training",
    colorClass: "text-secondary",
    price: "2,000",
    marketPrice: "5,000",
    priceInfo: "Starting From",
    features: [
      { icon: "fas fa-graduation-cap text-secondary", text: "<strong>Comprehensive</strong> AWS Training" },
      { icon: "fas fa-user-friends text-secondary", text: "<strong>Personalized</strong> 1-on-1 Mentorship" },
      { icon: "fas fa-lock-open text-secondary", text: "<strong>Exclusive Access</strong> to AWS Resources" },
      { icon: "fas fa-certificate text-secondary", text: "<strong>Dedicated Assistance</strong> for Certification" },
      { icon: "fas fa-laptop-code text-secondary", text: "<strong>Hands-On</strong> Practical Learning" }
    ],
    button: { text: "Get to Know More", link: "aws-certifications" }
  },
  {
    badge: { text: "Save 75%", class: "bg-success text-white" },
    icon: "fas fa-code",
    title: "Web Development",
    colorClass: "text-success",
    price: "2,000",
    marketPrice: "8,000",
    priceInfo: "/ Month",
    features: [
      { icon: "fas fa-globe text-success", text: "<strong>1</strong> Custom Website" },
      { icon: "fas fa-link text-success", text: "<strong>1</strong> Domain (Free)" },
      { icon: "fas fa-hdd text-success", text: "<strong>20 GB</strong> Hosting Space" },
      { icon: "fas fa-exchange-alt text-success", text: "<strong>100 GB</strong> Bandwidth" },
      { icon: "fas fa-search text-success", text: "<strong>Basic</strong> SEO Optimization" },
      { icon: "fas fa-sync text-success", text: "<strong>2</strong> Revisions" }
    ],
    button: { text: "Get Started", link: "live-chat" }
  },
  {
    badge: { text: "Save 55%", class: "bg-info text-dark" },
    icon: "fab fa-wordpress-simple",
    title: "WordPress Solutions",
    colorClass: "text-info",
    price: "4,500",
    marketPrice: "10,000",
    priceInfo: "/ Month",
    features: [
      { icon: "fas fa-layer-group text-info", text: "<strong>5</strong> WordPress Sites" },
      { icon: "fas fa-hdd text-info", text: "<strong>100 GB</strong> Hosting Space" },
      { icon: "fas fa-exchange-alt text-info", text: "<strong>500 GB</strong> Bandwidth" },
      { icon: "fas fa-search-plus text-info", text: "<strong>Advanced</strong> SEO Optimization" },
      { icon: "fas fa-infinity text-info", text: "<strong>Unlimited</strong> Revisions" }
    ],
    button: { text: "Get Started", link: "live-chat" }
  },
  {
    badge: { text: "Save 50%", class: "bg-primary text-white" },
    popular: { text: "Popular", class: "bg-primary" },
    icon: "fas fa-cloud",
    title: "Cloud Services",
    colorClass: "text-primary",
    price: "7,500",
    marketPrice: "15,000",
    priceInfo: "/ Month",
    features: [
      { icon: "fab fa-google text-primary", text: "<strong>Google Cloud</strong> Integration" },
      { icon: "fas fa-database text-primary", text: "<strong>200 GB</strong> Cloud Storage" },
      { icon: "fas fa-infinity text-primary", text: "<strong>Unlimited</strong> Bandwidth" },
      { icon: "fas fa-globe text-primary", text: "<strong>3 Free</strong> Domains" },
      { icon: "fas fa-cloud-upload-alt text-primary", text: "<strong>Cloud Migration</strong> from On-Premises to Google Cloud" }
    ],
    button: { text: "Get Started", link: "live-chat" }
  },
  {
    badge: { text: "Trending", class: "bg-warning text-dark" },
    newTag: { text: "New", class: "bg-danger" },
    icon: "fas fa-robot",
    title: "AI Automation",
    colorClass: "text-warning",
    price: "15,000",
    marketPrice: "25,000",
    priceInfo: "/ Project",
    features: [
      { icon: "fas fa-cogs text-warning", text: "<strong>Workflow</strong> Automation" },
      { icon: "fas fa-bolt text-warning", text: "<strong>Zapier/Make</strong> Integrations" },
      { icon: "fas fa-file-invoice text-warning", text: "<strong>Auto</strong> Invoicing & CRM" },
      { icon: "fas fa-clock text-warning", text: "<strong>Save 20+ Hours</strong> / Week" },
      { icon: "fas fa-headset text-warning", text: "<strong>24/7</strong> Bot Support" }
    ],
    button: { text: "Automate Now", link: "live-chat" }
  },
  {
    badge: { text: "High Demand", class: "bg-danger text-white" },
    icon: "fas fa-comments",
    title: "AI Chatbots",
    colorClass: "text-danger",
    price: "10,000",
    marketPrice: "18,000",
    priceInfo: "/ Bot",
    features: [
      { icon: "fab fa-whatsapp text-danger", text: "<strong>WhatsApp</strong> & Web Bots" },
      { icon: "fas fa-brain text-danger", text: "<strong>Smart</strong> NLP Responses" },
      { icon: "fas fa-user-tie text-danger", text: "<strong>Human</strong> Handoff" },
      { icon: "fas fa-chart-bar text-danger", text: "<strong>Lead</strong> Generation" },
      { icon: "fas fa-calendar-check text-danger", text: "<strong>Auto</strong> Appointment Booking" }
    ],
    button: { text: "Build My Bot", link: "live-chat" }
  },
  {
    badge: { text: "Enterprise", class: "bg-dark text-white" },
    icon: "fas fa-brain",
    title: "Enterprise AI",
    colorClass: "text-dark",
    price: "50,000",
    marketPrice: "1,00,000",
    priceInfo: "Starting From",
    features: [
      { icon: "fas fa-microchip text-dark", text: "<strong>Custom</strong> LLM Models" },
      { icon: "fas fa-server text-dark", text: "<strong>Private</strong> AI Server Setup" },
      { icon: "fas fa-shield-alt text-dark", text: "<strong>Data</strong> Security & Consulting" },
      { icon: "fas fa-code-branch text-dark", text: "<strong>API</strong> Integration" },
      { icon: "fas fa-users-cog text-dark", text: "<strong>Employee</strong> AI Training" }
    ],
    button: { text: "Consult Now", link: "live-chat" }
  }
];

// Render pricing cards
// Render pricing cards
const pricingCards = document.getElementById('pricing-cards');
pricingCards.innerHTML = pricingData.map((plan, idx) => {
  // Determine which badge to show (Priority: Popular > New > Badge)
  let badgeHtml = '';
  if (plan.popular) {
    badgeHtml = `<span class="badge-custom badge-popular">${plan.popular.text}</span>`;
  } else if (plan.newTag) {
    badgeHtml = `<span class="badge-custom badge-new">${plan.newTag.text}</span>`;
  } else if (plan.badge) {
    badgeHtml = `<span class="badge-custom badge-save">${plan.badge.text}</span>`;
  }

  return `
  <div class="col-xl-3 col-lg-3 col-md-6 col-12 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay="${idx * 100}">
    <div class="pricing-card w-100 ${plan.popular ? 'popular-card' : ''}">
      ${badgeHtml}
      
      <div class="card-header-custom">
        <div class="plan-icon">
          <i class="${plan.icon}"></i>
        </div>
        <h3 class="plan-name">${plan.title}</h3>
        
        <div class="price-container">
          <div class="main-price">
            <span class="currency">₹</span>
            <span class="amount">${plan.price}</span>
            <span class="period">${plan.priceInfo}</span>
          </div>
          <div class="market-price-container">
            <span class="market-price">₹${plan.marketPrice}</span>
            ${plan.badge ? `<span class="save-badge">${plan.badge.text}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="card-body-custom d-flex flex-column">
        <ul class="feature-list flex-grow-1">
          ${plan.features.map(feature => `
            <li>
              <i class="${feature.icon.replace(/text-[a-z]+/g, '').trim()}"></i>
              <span>${feature.text}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="card-footer-custom">
        <a href="${plan.button.link === 'live-chat' ? 'javascript:void(0)' : plan.button.link + '.html'}" 
           class="btn-custom ${plan.popular ? 'btn-primary-custom' : 'btn-outline-custom'}"
           ${plan.button.link === 'live-chat' ? 'onclick="if(typeof Tawk_API !== \'undefined\'){Tawk_API.toggle();}else{alert(\'Chat is loading...\')}"' : ''}>
           ${plan.button.text}
        </a>
        
        <div class="payment-modes">
           <i class="fab fa-google-pay" title="Google Pay"></i>
           <i class="fab fa-cc-visa" title="Visa"></i>
           <i class="fab fa-cc-mastercard" title="Mastercard"></i>
        </div>
      </div>
    </div>
  </div>
  `;
}).join('');
