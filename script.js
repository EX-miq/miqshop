// ===== CONFIGURAÇÕES GLOBAIS =====
'use strict';

// Configurações
const CONFIG = {
  whatsappNumber: '258878372764',
  scrollOffset: 150, // Ajustado para as duas barras do cabeçalho
  animationDuration: 300
};

// ===== UTILITÁRIOS =====
const Utils = {
  // Debounce function para otimizar performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Smooth scroll para links internos
  smoothScroll(target, offset = CONFIG.scrollOffset) {
    const element = document.querySelector(target);
    if (element) {
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  },

  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar telefone (formato moçambicano)
  isValidPhone(phone) {
    const phoneRegex = /^(\+258|258)?[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Escapar caracteres especiais para URL
  escapeForURL(str) {
    return encodeURIComponent(str);
  }
};

// ===== NAVEGAÇÃO =====
class Navigation {
  constructor() {
    this.topBar = document.querySelector('.top-bar');
    this.navbar = document.querySelector('.navbar');
    this.navbarCollapse = document.querySelector('#navbarNav');
    this.navbarToggler = document.querySelector('.navbar-toggler');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.init();
  }

  init() {
    this.setupSmoothScrolling();
    this.setupMobileMenuClose();
    this.setupScrollEffects();
    this.setupNavbarToggler();
    this.setupStickyHeaders();
  }

  setupNavbarToggler() {
    if (this.navbarToggler && this.navbarCollapse) {
      // Garantir que o botão hambúrguer funciona
      this.navbarToggler.addEventListener('click', () => {
        const isExpanded = this.navbarToggler.getAttribute('aria-expanded') === 'true';
        this.navbarToggler.setAttribute('aria-expanded', !isExpanded);
      });
    }
  }

  setupSmoothScrolling() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          e.preventDefault();
          Utils.smoothScroll(href);
          
          // Fechar menu mobile se estiver aberto
          if (window.innerWidth < 992 && this.navbarCollapse.classList.contains('show')) {
            const bsCollapse = bootstrap.Collapse.getInstance(this.navbarCollapse);
            if (bsCollapse) {
              bsCollapse.hide();
            }
          }
        }
      });
    });
  }

  setupMobileMenuClose() {
    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
      if (window.innerWidth < 992 && 
          this.navbarCollapse && 
          !this.navbarCollapse.contains(e.target) && 
          !e.target.closest('.navbar-toggler')) {
        const bsCollapse = bootstrap.Collapse.getInstance(this.navbarCollapse);
        if (bsCollapse && this.navbarCollapse.classList.contains('show')) {
          bsCollapse.hide();
        }
      }
    });

    // Fechar menu ao pressionar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(this.navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    });
  }

  setupScrollEffects() {
    const handleScroll = Utils.debounce(() => {
      const scrollY = window.scrollY;
      
      // Efeito de transparência nas barras do cabeçalho
      if (scrollY > 50) {
        if (this.topBar) {
          this.topBar.style.backgroundColor = 'rgba(244, 67, 54, 0.95)';
          this.topBar.style.backdropFilter = 'blur(10px)';
        }
        if (this.navbar) {
          this.navbar.style.backgroundColor = 'rgba(211, 47, 47, 0.95)';
          this.navbar.style.backdropFilter = 'blur(10px)';
        }
      } else {
        if (this.topBar) {
          this.topBar.style.backgroundColor = '#f44336';
          this.topBar.style.backdropFilter = 'none';
        }
        if (this.navbar) {
          this.navbar.style.backgroundColor = '#d32f2f';
          this.navbar.style.backdropFilter = 'none';
        }
      }
    }, 10);

    window.addEventListener('scroll', handleScroll);
    
    // Aplicar cores iniciais imediatamente
    if (this.topBar) {
      this.topBar.style.backgroundColor = '#f44336';
    }
    if (this.navbar) {
      this.navbar.style.backgroundColor = '#d32f2f';
    }
  }

  setupStickyHeaders() {
    // Ajustar posição sticky baseado no tamanho da tela
    const adjustStickyPosition = () => {
      const topBarHeight = this.topBar ? this.topBar.offsetHeight : 0;
      
      if (this.navbar && this.navbar.parentElement) {
        this.navbar.parentElement.style.top = `${topBarHeight}px`;
      }
    };

    // Ajustar na inicialização e no resize
    adjustStickyPosition();
    window.addEventListener('resize', Utils.debounce(adjustStickyPosition, 100));
  }
}

// ===== FORMULÁRIO DE CONTACTO =====
class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.fields = {
      nome: document.getElementById('nome'),
      contacto: document.getElementById('contacto'),
      email: document.getElementById('email'),
      produto: document.getElementById('produto'),
      mensagem: document.getElementById('mensagem')
    };
    this.init();
  }

  init() {
    if (this.form) {
      this.setupFormSubmission();
      this.setupFieldValidation();
    }
  }

  setupFormSubmission() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (this.validateForm()) {
        this.sendToWhatsApp();
      }
    });
  }

  setupFieldValidation() {
    // Validação em tempo real
    Object.entries(this.fields).forEach(([key, field]) => {
      if (field) {
        field.addEventListener('blur', () => this.validateField(key, field));
        field.addEventListener('input', () => this.clearFieldError(field));
      }
    });
  }

  validateField(fieldName, field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'nome':
        if (!value) {
          isValid = false;
          errorMessage = 'Nome é obrigatório';
        } else if (value.length < 2) {
          isValid = false;
          errorMessage = 'Nome deve ter pelo menos 2 caracteres';
        }
        break;

      case 'email':
        if (value && !Utils.isValidEmail(value)) {
          isValid = false;
          errorMessage = 'Email inválido';
        }
        break;

      case 'contacto':
        if (value && !Utils.isValidPhone(value)) {
          isValid = false;
          errorMessage = 'Número de telefone inválido';
        }
        break;
    }

    this.showFieldValidation(field, isValid, errorMessage);
    return isValid;
  }

  showFieldValidation(field, isValid, errorMessage) {
    // Remover classes anteriores
    field.classList.remove('is-valid', 'is-invalid');
    
    // Remover mensagem de erro anterior
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
      existingError.remove();
    }

    if (!isValid) {
      field.classList.add('is-invalid');
      
      // Adicionar mensagem de erro
      const errorDiv = document.createElement('div');
      errorDiv.className = 'invalid-feedback';
      errorDiv.textContent = errorMessage;
      field.parentNode.appendChild(errorDiv);
    } else if (field.value.trim()) {
      field.classList.add('is-valid');
    }
  }

  clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  validateForm() {
    let isFormValid = true;

    // Validar campo obrigatório
    const nomeField = this.fields.nome;
    if (nomeField && !this.validateField('nome', nomeField)) {
      isFormValid = false;
    }

    // Validar campos opcionais se preenchidos
    Object.entries(this.fields).forEach(([fieldName, field]) => {
      if (field && field.value.trim() && fieldName !== 'nome') {
        if (!this.validateField(fieldName, field)) {
          isFormValid = false;
        }
      }
    });

    return isFormValid;
  }

  sendToWhatsApp() {
    const formData = this.getFormData();
    const message = this.formatWhatsAppMessage(formData);
    const whatsappURL = `https://wa.me/${CONFIG.whatsappNumber}?text=${Utils.escapeForURL(message)}`;
    
    // Mostrar feedback ao utilizador
    this.showSuccessMessage();
    
    // Abrir WhatsApp
    setTimeout(() => {
      window.open(whatsappURL, '_blank', 'noopener,noreferrer');
    }, 1000);
  }

  getFormData() {
    const data = {};
    Object.entries(this.fields).forEach(([key, field]) => {
      if (field) {
        data[key] = field.value.trim();
      }
    });
    return data;
  }

  formatWhatsAppMessage(data) {
    let message = `🛒 *PEDIDO MIQSHOP*\n\n`;
    message += `👤 *Nome:* ${data.nome}\n`;
    
    if (data.contacto) message += `📞 *Contacto:* ${data.contacto}\n`;
    if (data.email) message += `📧 *Email:* ${data.email}\n`;
    if (data.produto) message += `💻 *Produto:* ${data.produto}\n`;
    if (data.mensagem) message += `💬 *Mensagem:* ${data.mensagem}\n`;
    
    message += `\n📱 Enviado através do site MIQSHOP`;
    
    return message;
  }

  showSuccessMessage() {
    // Criar elemento de sucesso
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success alert-dismissible fade show';
    successDiv.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>
      <strong>Sucesso!</strong> A sua mensagem está a ser enviada para o WhatsApp.
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Inserir antes do formulário
    this.form.parentNode.insertBefore(successDiv, this.form);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 5000);
  }
}

// ===== ANIMAÇÕES E EFEITOS =====
class Animations {
  constructor() {
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupHoverEffects();
    this.setupCarouselEnhancements();
  }

  setupScrollAnimations() {
    // Intersection Observer para animações ao scroll
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, observerOptions);

      // Observar elementos que devem ser animados
      const animatedElements = document.querySelectorAll('.product-card, .service-card, .contact-info');
      animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
      });
    }
  }

  setupHoverEffects() {
    // Efeitos de hover para cards de produtos
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });

    // Efeitos para cards de serviços
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px) scale(1.05)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  setupCarouselEnhancements() {
    const carousel = document.getElementById('heroCarousel');
    if (carousel) {
      // Pausar carousel ao hover
      carousel.addEventListener('mouseenter', () => {
        const bsCarousel = bootstrap.Carousel.getInstance(carousel);
        if (bsCarousel) {
          bsCarousel.pause();
        }
      });

      carousel.addEventListener('mouseleave', () => {
        const bsCarousel = bootstrap.Carousel.getInstance(carousel);
        if (bsCarousel) {
          bsCarousel.cycle();
        }
      });
    }
  }
}

// ===== PERFORMANCE E OTIMIZAÇÕES =====
class Performance {
  constructor() {
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.setupImageOptimization();
  }

  setupLazyLoading() {
    // Lazy loading para imagens (fallback para browsers antigos)
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

  setupImageOptimization() {
    // Otimização de imagens baseada na largura da tela
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Adicionar loading="lazy" se não estiver presente
      if (!img.hasAttribute('loading') && !img.closest('.carousel-item.active')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }
}

// ===== ACESSIBILIDADE =====
class Accessibility {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupARIA();
  }

  setupKeyboardNavigation() {
    // Navegação por teclado para o carousel
    const carousel = document.getElementById('heroCarousel');
    if (carousel) {
      carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          const prevButton = carousel.querySelector('.carousel-control-prev');
          if (prevButton) prevButton.click();
        } else if (e.key === 'ArrowRight') {
          const nextButton = carousel.querySelector('.carousel-control-next');
          if (nextButton) nextButton.click();
        }
      });
    }
  }

  setupFocusManagement() {
    // Melhorar o foco visual
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
    focusableElements.forEach(el => {
      el.addEventListener('focus', () => {
        el.style.outline = '2px solid var(--primary-color)';
        el.style.outlineOffset = '2px';
      });
      
      el.addEventListener('blur', () => {
        el.style.outline = '';
        el.style.outlineOffset = '';
      });
    });
  }

  setupARIA() {
    // Melhorar ARIA labels dinamicamente
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
      const title = card.querySelector('.card-title');
      if (title && !card.hasAttribute('aria-label')) {
        card.setAttribute('aria-label', `Produto: ${title.textContent}`);
      }
    });
  }
}

// ===== BOTÃO VOLTAR AO TOPO =====
class BackToTop {
  constructor() {
    this.button = document.querySelector('.back-to-top');
    this.init();
  }

  init() {
    if (this.button) {
      this.setupScrollListener();
      this.setupClickHandler();
      this.setupInitialState();
    }
  }

  setupInitialState() {
    // Mostrar o botão imediatamente se já estivermos abaixo de 300px
    if (window.scrollY > 300) {
      this.button.classList.add('show');
    }
  }

  setupScrollListener() {
    const handleScroll = Utils.debounce(() => {
      const scrollY = window.scrollY;
      
      if (scrollY > 300) {
        this.button.classList.add('show');
      } else {
        this.button.classList.remove('show');
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);
    
    // Verificar posição inicial
    handleScroll();
  }

  setupClickHandler() {
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Scroll suave para o topo (seção home)
      const homeSection = document.getElementById('home');
      if (homeSection) {
        homeSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        // Fallback para o topo da página
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      
      // Analytics/tracking opcional
      console.log('Back to top button clicked');
    });
  }
}
class WhatsAppIntegration {
  constructor() {
    this.init();
  }

  init() {
    this.setupDirectLinks();
    this.setupFloatButton();
  }

  setupDirectLinks() {
    // Configurar links diretos do WhatsApp nos produtos
    const productButtons = document.querySelectorAll('a[href*="wa.me"]');
    productButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Adicionar analytics ou tracking se necessário
        console.log('WhatsApp link clicked:', button.closest('.product-card')?.querySelector('.card-title')?.textContent);
      });
    });
  }

  setupFloatButton() {
    const floatButton = document.querySelector('.whatsapp-float');
    if (floatButton) {
      // Adicionar funcionalidade extra ao botão flutuante
      floatButton.addEventListener('click', () => {
        console.log('WhatsApp float button clicked');
      });
    }
  }
}

// ===== FORÇAR CORES DINAMICAMENTE =====
class ColorForcer {
  constructor() {
    this.init();
  }

  init() {
    // Aplicar cores imediatamente
    this.forceColors();
    
    // Aplicar cores após carregamento completo
    document.addEventListener('DOMContentLoaded', () => {
      this.forceColors();
    });
    
    // Aplicar cores após carregamento da janela
    window.addEventListener('load', () => {
      this.forceColors();
    });
    
    // Observar mudanças no DOM e reaplicar cores
    this.observeChanges();
  }

  forceColors() {
    // Forçar segunda barra branca
    this.forceSecondBarWhite();
    
    // Forçar primeira barra vermelha
    this.forceFirstBarRed();
    
    // Forçar rodapé vermelho
    this.forceFooterRed();
    
    // Forçar ícones vermelhos
    this.forceIconsRed();
  }

  forceSecondBarWhite() {
    // Selecionar todos os elementos da segunda barra
    const mainHeader = document.querySelector('.main-header');
    const navbar = document.querySelector('.navbar');
    const navbarBrand = document.querySelector('.navbar-brand');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navIcons = document.querySelectorAll('.navbar-nav .nav-link i');
    const navbarToggler = document.querySelector('.navbar-toggler');

    // Forçar fundo branco no header principal
    if (mainHeader) {
      mainHeader.style.setProperty('background-color', '#ffffff', 'important');
      mainHeader.style.setProperty('background', '#ffffff', 'important');
      mainHeader.style.setProperty('background-image', 'none', 'important');
      mainHeader.style.setProperty('border-bottom', '3px solid #d32f2f', 'important');
    }

    // Forçar fundo branco na navbar
    if (navbar) {
      navbar.style.setProperty('background-color', '#ffffff', 'important');
      navbar.style.setProperty('background', '#ffffff', 'important');
      navbar.style.setProperty('background-image', 'none', 'important');
    }

    // Forçar logo vermelho
    if (navbarBrand) {
      navbarBrand.style.setProperty('color', '#d32f2f', 'important');
      navbarBrand.style.setProperty('text-decoration', 'none', 'important');
      
      // Forçar span dentro do logo
      const brandSpan = navbarBrand.querySelector('span');
      if (brandSpan) {
        brandSpan.style.setProperty('color', '#d32f2f', 'important');
      }
    }

    // Forçar links de navegação vermelhos
    navLinks.forEach(link => {
      link.style.setProperty('color', '#d32f2f', 'important');
      link.style.setProperty('text-decoration', 'none', 'important');
      link.style.setProperty('font-weight', '600', 'important');
    });

    // Forçar ícones de navegação vermelhos
    navIcons.forEach(icon => {
      icon.style.setProperty('color', '#d32f2f', 'important');
    });

    // Forçar botão hambúrguer vermelho
    if (navbarToggler) {
      navbarToggler.style.setProperty('border', '2px solid #d32f2f', 'important');
      navbarToggler.style.setProperty('background', 'transparent', 'important');
      
      // Forçar linhas do hambúrguer vermelhas
      const togglerSpans = navbarToggler.querySelectorAll('span');
      togglerSpans.forEach(span => {
        span.style.setProperty('background', '#d32f2f', 'important');
        span.style.setProperty('background-color', '#d32f2f', 'important');
      });
    }

    // Aplicar a todos os elementos navbar possíveis
    const allNavbarElements = document.querySelectorAll('.main-header, .navbar, header.main-header, nav.navbar');
    allNavbarElements.forEach(element => {
      element.style.setProperty('background-color', '#ffffff', 'important');
      element.style.setProperty('background', '#ffffff', 'important');
      element.style.setProperty('background-image', 'none', 'important');
    });
  }

  forceButtonsRed() {
    // Forçar todos os botões primários vermelhos
    const primaryButtons = document.querySelectorAll('.btn-primary, .btn.btn-primary, a.btn-primary, button.btn-primary');
    primaryButtons.forEach(button => {
      button.style.setProperty('background-color', '#d32f2f', 'important');
      button.style.setProperty('background', '#d32f2f', 'important');
      button.style.setProperty('border-color', '#d32f2f', 'important');
      button.style.setProperty('color', '#ffffff', 'important');
      button.style.setProperty('text-decoration', 'none', 'important');
      
      // Ícones dentro dos botões
      const icon = button.querySelector('i');
      if (icon) {
        icon.style.setProperty('color', '#ffffff', 'important');
      }
    });
  }

  forceSobreTextRed() {
    // Forçar texto da secção "Sobre a MIQSHOP" vermelho
    const sobreSection = document.querySelector('#sobre');
    if (sobreSection) {
      // Título
      const title = sobreSection.querySelector('h2');
      if (title) {
        title.style.setProperty('color', '#d32f2f', 'important');
        title.style.setProperty('font-weight', '700', 'important');
      }

      // Parágrafos
      const paragraphs = sobreSection.querySelectorAll('p.lead, p:not(.small)');
      paragraphs.forEach(p => {
        p.style.setProperty('color', '#d32f2f', 'important');
        p.style.setProperty('font-weight', '500', 'important');
      });

      // Ícones
      const icons = sobreSection.querySelectorAll('i.text-primary, i.fa-shipping-fast, i.fa-shield-alt');
      icons.forEach(icon => {
        icon.style.setProperty('color', '#d32f2f', 'important');
      });

      // Subtítulos h5
      const subtitles = sobreSection.querySelectorAll('h5');
      subtitles.forEach(h5 => {
        h5.style.setProperty('color', '#d32f2f', 'important');
        h5.style.setProperty('font-weight', '600', 'important');
      });
    }
  }

  forceFirstBarRed() {
    const topBar = document.querySelector('.top-bar');
    const topBarElements = document.querySelectorAll('.top-bar, .top-bar *, .contact-info-top *, .social-links-top *');

    if (topBar) {
      topBar.style.setProperty('background-color', '#d32f2f', 'important');
      topBar.style.setProperty('background', '#d32f2f', 'important');
    }

    topBarElements.forEach(element => {
      if (element.tagName === 'A' || element.tagName === 'I' || element.tagName === 'SPAN') {
        element.style.setProperty('color', '#ffffff', 'important');
      }
    });
  }

  forceFooterRed() {
    const footer = document.querySelector('footer');
    const footerElements = document.querySelectorAll('footer, footer *, footer a, footer i, footer h5, footer h6, footer p');

    if (footer) {
      footer.style.setProperty('background-color', '#d32f2f', 'important');
      footer.style.setProperty('background', '#d32f2f', 'important');
    }

    footerElements.forEach(element => {
      element.style.setProperty('color', '#ffffff', 'important');
    });
  }

  forceIconsRed() {
    // Ícones de contacto
    const contactIcons = document.querySelectorAll('.contact-item i');
    contactIcons.forEach(icon => {
      icon.style.setProperty('color', '#d32f2f', 'important');
    });

    // Ícones de serviços
    const serviceIcons = document.querySelectorAll('.service-icon');
    serviceIcons.forEach(icon => {
      icon.style.setProperty('background', 'linear-gradient(135deg, #d32f2f, #b71c1c)', 'important');
    });

    // Botões primários
    const primaryButtons = document.querySelectorAll('.btn-primary');
    primaryButtons.forEach(btn => {
      btn.style.setProperty('background-color', '#d32f2f', 'important');
      btn.style.setProperty('border-color', '#d32f2f', 'important');
      btn.style.setProperty('color', '#ffffff', 'important');
    });

    // Links de contacto específicos
    const contactLinks = document.querySelectorAll('.contact-item a');
    contactLinks.forEach(link => {
      link.style.setProperty('color', '#d32f2f', 'important');
      link.style.setProperty('text-decoration', 'none', 'important');
    });

    // Ícones dentro de botões
    const buttonIcons = document.querySelectorAll('.btn i');
    buttonIcons.forEach(icon => {
      icon.style.setProperty('color', '#ffffff', 'important');
    });

    // Links específicos que podem estar azuis
    const blueLinks = document.querySelectorAll('a[href*="whatsapp"], a[href*="mailto"], a[href*="tel"]');
    blueLinks.forEach(link => {
      if (!link.closest('footer') && !link.closest('.top-bar')) {
        link.style.setProperty('color', '#d32f2f', 'important');
        link.style.setProperty('text-decoration', 'none', 'important');
      }
    });
  }

  observeChanges() {
    const observer = new MutationObserver(() => {
      this.forceColors();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }
}

// ===== INICIALIZAÇÃO =====
class App {
  constructor() {
    this.init();
  }

  init() {
    // Aguardar o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    try {
      // Inicializar componentes
      new Navigation();
      new ContactForm();
      new Animations();
      new Performance();
      new Accessibility();
      new BackToTop();
      new WhatsAppIntegration();
      new ColorForcer(); // Adicionar forçador de cores
      
      // Adicionar estilos CSS para animações
      this.addAnimationStyles();
      
      console.log('MIQSHOP: Aplicação inicializada com sucesso');
    } catch (error) {
      console.error('MIQSHOP: Erro na inicialização:', error);
    }
  }

  addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      
      .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      
      @media (prefers-reduced-motion: reduce) {
        .animate-on-scroll {
          opacity: 1;
          transform: none;
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// ===== INICIAR APLICAÇÃO =====
new App();
