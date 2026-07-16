/* ==========================================================================
   SARS Global Interactive Logic
   Features: Sticky Nav, Mobile Menu, Scroll Reveals, Timeline Drawing,
             Drag Carousel, Rotating Quotes, Count-up Stats, FAQ Accordions,
             and Form Submission Validation.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Sticky Navigation Header
     ========================================================================== */
  const header = document.getElementById('nav-header');
  
  const handleScrollHeader = () => {
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScrollHeader);
  handleScrollHeader(); // Initial check on load


  /* ==========================================================================
     2. Mobile Menu Toggle & Overlay Navigation
     ========================================================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const toggleMobileMenu = () => {
    const isOpen = menuToggle.classList.toggle('open');
    mobileOverlay.classList.toggle('open', isOpen);
    
    // Disable scrolling on body when overlay is active
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  menuToggle.addEventListener('click', toggleMobileMenu);

  // Close mobile menu when clicking nav links
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      mobileOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  /* ==========================================================================
     3. Scroll-Triggered Reveal Animations (Intersection Observer)
     ========================================================================== */
  const revealElements = document.querySelectorAll(
    '.trigger-fade-up, .trigger-slide-left, .trigger-slide-right, .trigger-anim'
  );

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          // If this is the stats container, trigger the stats counter count-up
          if (entry.target.id === 'stats-container' || entry.target.querySelector('#stats-container')) {
            startStatsCounting();
          }
          
          observer.unobserve(entry.target); // Animates once
        }
      });
    }, {
      threshold: 0.15 // Triggers when 15% of the element is visible
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('revealed'));
    startStatsCounting();
  }


  /* ==========================================================================
     4. Numbered Process Timeline (Scroll-Linked SVG Drawing Line)
     ========================================================================== */
  const processSection = document.getElementById('process');
  const drawPath = document.getElementById('timeline-draw-path');
  const timelineSteps = document.querySelectorAll('.timeline-step');

  const handleTimelineScroll = () => {
    if (!processSection || !drawPath) return;

    const rect = processSection.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    
    // Calculate scroll progress: starts when section top hits 75% of viewport height
    // and finishes when section bottom reaches 25% of viewport height
    const startPoint = viewHeight * 0.75;
    const endPoint = viewHeight * 0.25;
    const totalRange = rect.height + startPoint - endPoint;
    const currentProgressRaw = (startPoint - rect.top) / totalRange;
    
    let progress = Math.max(0, Math.min(1, currentProgressRaw));
    
    // Animate the path stroke-dashoffset (100 is dasharray size)
    drawPath.style.strokeDashoffset = 100 - (progress * 100);
    
    // Stagger step node highlight thresholds
    const stepThresholds = [0.15, 0.45, 0.75, 0.95];
    timelineSteps.forEach((step, index) => {
      if (progress >= stepThresholds[index]) {
        step.classList.add('active-step');
      } else {
        step.classList.remove('active-step');
      }
    });
  };

  window.addEventListener('scroll', handleTimelineScroll);
  handleTimelineScroll(); // Run initially


  /* ==========================================================================
     5. Drag/Swipe Horizontal Carousel (Featured Opportunities)
     ========================================================================== */
  const carouselViewport = document.getElementById('carousel-viewport');
  const carouselTrack = document.getElementById('carousel-track');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');

  if (carouselViewport && carouselTrack) {
    let isDown = false;
    let startX;
    let scrollLeft;

    // Mouse Drag events
    carouselViewport.addEventListener('mousedown', (e) => {
      isDown = true;
      carouselViewport.classList.add('active');
      startX = e.pageX - carouselViewport.offsetLeft;
      scrollLeft = carouselViewport.scrollLeft;
    });

    carouselViewport.addEventListener('mouseleave', () => {
      isDown = false;
      carouselViewport.classList.remove('active');
    });

    carouselViewport.addEventListener('mouseup', () => {
      isDown = false;
      carouselViewport.classList.remove('active');
    });

    carouselViewport.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carouselViewport.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll speed modifier
      carouselViewport.scrollLeft = scrollLeft - walk;
    });

    // Arrow Button navigation clicks
    const getCardWidth = () => {
      const card = carouselTrack.querySelector('.role-card');
      return card ? card.offsetWidth + 24 : 344; // Card width + gap
    };

    btnPrev.addEventListener('click', () => {
      carouselViewport.scrollBy({
        left: -getCardWidth(),
        behavior: 'smooth'
      });
    });

    btnNext.addEventListener('click', () => {
      carouselViewport.scrollBy({
        left: getCardWidth(),
        behavior: 'smooth'
      });
    });
  }


  /* ==========================================================================
     6. Auto-Rotating Testimonials (Highlight Quote Strip)
     ========================================================================== */
  const quoteSlides = document.querySelectorAll('.quote-slide');
  const quoteDots = document.querySelectorAll('.quote-dot');
  let quoteIndex = 0;
  let quoteTimer;

  const showQuoteSlide = (index) => {
    // Clear active classes
    quoteSlides.forEach(slide => slide.classList.remove('active-slide'));
    quoteDots.forEach(dot => dot.classList.remove('active-dot'));
    
    // Set active item
    quoteSlides[index].classList.add('active-slide');
    quoteDots[index].classList.add('active-dot');
    quoteIndex = index;
  };

  const startQuoteTimer = () => {
    clearInterval(quoteTimer);
    quoteTimer = setInterval(() => {
      let nextIndex = (quoteIndex + 1) % quoteSlides.length;
      showQuoteSlide(nextIndex);
    }, 7000); // Transitions quotes every 7 seconds
  };

  // Wire manual quote dot navigators
  quoteDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showQuoteSlide(index);
      startQuoteTimer(); // Reset timer upon user interaction
    });
  });

  if (quoteSlides.length > 0) {
    showQuoteSlide(0);
    startQuoteTimer();
  }


  /* ==========================================================================
     7. Stats Count-Up Animation
     ========================================================================== */
  let statsTriggered = false;

  function startStatsCounting() {
    if (statsTriggered) return;
    statsTriggered = true;
    
    const stats = document.querySelectorAll('.stat-number');
    const duration = 1500; // Animation duration in milliseconds

    stats.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      const startValue = 0;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Ease-out cubic formula
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + easeProgress * (target - startValue));
        
        // Format thousands with commas (e.g. 1,200)
        stat.textContent = currentValue.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          stat.textContent = target.toLocaleString();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  // Trigger counters immediately on load if stats section is in view
  const statsContainer = document.getElementById('stats-container');
  if (statsContainer) {
    const containerTop = statsContainer.getBoundingClientRect().top;
    if (containerTop < window.innerHeight) {
      startStatsCounting();
    }
  }


  /* ==========================================================================
     8. FAQ Accordion Height Collapse/Expand logic
     ========================================================================== */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');
      const isActive = item.classList.contains('active');

      // Collapse all other active items (Only one open at a time)
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.accordion-content').style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });


  /* ==========================================================================
     9. Contact Form Validation & Animated Feedback Interaction
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const btnSubmit = document.getElementById('btn-submit');

  if (contactForm && btnSubmit) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
      let formIsValid = true;

      // Validate inputs
      inputs.forEach(input => {
        const formGroup = input.parentElement;
        
        if (input.type === 'email') {
          // Email regular expression
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value.trim())) {
            formGroup.classList.add('invalid');
            formIsValid = false;
          } else {
            formGroup.classList.remove('invalid');
          }
        } else {
          if (input.value.trim() === '') {
            formGroup.classList.add('invalid');
            formIsValid = false;
          } else {
            formGroup.classList.remove('invalid');
          }
        }
        
        // Remove error outline on keydown
        input.addEventListener('input', () => {
          if (input.value.trim() !== '') {
            formGroup.classList.remove('invalid');
          }
        });
      });

      // If valid, simulate backend request with visual success state
      if (formIsValid) {
        btnSubmit.disabled = true;
        btnSubmit.classList.add('success');
        
        // Reset form details after a delay
        setTimeout(() => {
          contactForm.reset();
          btnSubmit.classList.remove('success');
          btnSubmit.disabled = false;
        }, 3000);
      }
    });
  }

  /* ==========================================================================
     10. Dynamic Text Instant Swap/Fade Cycler
     ========================================================================== */
  const dynamicTextEl = document.getElementById('dynamic-typing-text');
  if (dynamicTextEl) {
    const roles = [
      'Frontend Engineer',
      'Backend Engineer',
      'AI Engineer',
      'Data Engineer',
      'Full Stack Engineer'
    ];
    let roleIndex = 0;

    const cycleRole = () => {
      // Fade out rapidly
      dynamicTextEl.style.opacity = 0;

      setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        dynamicTextEl.textContent = roles[roleIndex];
        // Fade back in
        dynamicTextEl.style.opacity = 1;
      }, 150);
    };

    setInterval(cycleRole, 3000);
  }

  /* ==========================================================================
     11. Matched Candidate Card Stacker Feed Loop
     ========================================================================== */
  const feedContainer = document.getElementById('matched-feed-container');
  if (feedContainer) {
    const candidatesList = [
      {
        name: 'Mukul Dhupia',
        role: 'DevOps Engineer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80'
      },
      {
        name: 'Sarah Jenkins',
        role: 'AI Scientist',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80'
      },
      {
        name: 'David Mercer',
        role: 'Backend Developer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80'
      },
      {
        name: 'Priya Nair',
        role: 'Product Manager',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80'
      },
      {
        name: 'Alex Rodriguez',
        role: 'Security Architect',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&h=80&q=80'
      }
    ];

    let candidateIndex = 0;

    // Helper to generate card node
    const createCardNode = (candidate) => {
      const card = document.createElement('div');
      card.className = 'matched-feed-card';
      card.innerHTML = `
        <div class="feed-card-badge">CANDIDATE MATCHED</div>
        <div class="feed-card-body">
          <img src="${candidate.avatar}" class="feed-card-avatar" alt="${candidate.name}">
          <div class="feed-card-info">
            <div class="feed-card-name">${candidate.name}</div>
            <div class="feed-card-role">${candidate.role}</div>
          </div>
        </div>
      `;
      return card;
    };

    // Initialize with exactly 3 active candidate cards immediately
    for (let i = 0; i < 3; i++) {
      const card = createCardNode(candidatesList[candidateIndex]);
      feedContainer.appendChild(card);
      card.classList.add('slide-in');
      candidateIndex = (candidateIndex + 1) % candidatesList.length;
    }

    const pushFeedCard = () => {
      const candidate = candidatesList[candidateIndex];
      const card = createCardNode(candidate);

      // Append new card at the bottom
      feedContainer.appendChild(card);

      // Slide in
      requestAnimationFrame(() => {
        card.classList.add('slide-in');
      });

      // Keep stack count at exactly 3 elements
      const activeCards = feedContainer.querySelectorAll('.matched-feed-card');
      if (activeCards.length > 3) {
        const oldestCard = activeCards[0];
        oldestCard.style.transform = 'translateY(-120px) scale(0.85)';
        oldestCard.style.opacity = '0';
        
        setTimeout(() => {
          oldestCard.remove();
        }, 600);
      }

      candidateIndex = (candidateIndex + 1) % candidatesList.length;
    };

    // Cycle candidates feed stack every 3.5 seconds
    setInterval(pushFeedCard, 3500);
  }
});

