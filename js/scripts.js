document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // =========================================================
  // УНИВЕРСАЛЬНЫЙ ПОПАП ФОРМЫ
  // =========================================================

  const formModal = document.getElementById('formPopupOverlay');
  const formModalDialog = document.getElementById('formPopupContent');
  const formCloseButton = document.getElementById('formPopupClose');
  const universalForm = document.getElementById('universalLeadForm');

  const formTitleElement = document.getElementById('formPopupTitle');
  const formSubtitleElement = document.getElementById('formPopupSubtitle');

  const formTitleInput = document.getElementById('formPopupTitleInput');
  const formProductIdInput = document.getElementById('formPopupProductIdInput');
  const formProductNameInput = document.getElementById('formPopupProductInput');

  const formNameInput = document.getElementById('formPopupName');
  const formPhoneInput = document.getElementById('formPopupPhone');

  const formSubmitButton = document.getElementById('formPopupSubmit');
  const formStatusElement = document.getElementById('formPopupStatus');

  let lastFocusedElement = null;

  const formIsReady =
    formModal &&
    formModalDialog &&
    universalForm &&
    formTitleElement &&
    formTitleInput &&
    formProductIdInput &&
    formProductNameInput &&
    formNameInput &&
    formPhoneInput &&
    formSubmitButton;

  const requiredCheckboxes = formIsReady
    ? universalForm.querySelectorAll('input[type="checkbox"][required]')
    : [];

  function formatPhone(value) {
    let digits = value.replace(/\D/g, '');

    if (digits.startsWith('8')) {
      digits = '7' + digits.slice(1);
    }

    if (digits.startsWith('7')) {
      digits = digits.slice(1);
    }

    digits = digits.slice(0, 10);

    if (!digits.length) {
      return '';
    }

    let result = '+7 (' + digits.slice(0, 3);

    if (digits.length >= 3) {
      result += ') ' + digits.slice(3, 6);
    }

    if (digits.length >= 6) {
      result += '-' + digits.slice(6, 8);
    }

    if (digits.length >= 8) {
      result += '-' + digits.slice(8, 10);
    }

    return result;
  }

  function isPhoneValid() {
    if (!formPhoneInput) {
      return false;
    }

    const digits = formPhoneInput.value.replace(/\D/g, '');
    return /^7\d{10}$/.test(digits);
  }

  function isNameValid() {
    return formNameInput && formNameInput.value.trim().length > 0;
  }

  function areCheckboxesValid() {
    return Array.from(requiredCheckboxes).every(function (checkbox) {
      return checkbox.checked;
    });
  }

  function isFormValid() {
    return isNameValid() && isPhoneValid() && areCheckboxesValid();
  }

  function updateSubmitButton() {
    if (formSubmitButton) {
      formSubmitButton.disabled = !isFormValid();
    }
  }

  function updateValidityMessages() {
    if (!formNameInput || !formPhoneInput) {
      return;
    }

    formNameInput.setCustomValidity(
      isNameValid() ? '' : 'Укажите ваше имя.'
    );

    formPhoneInput.setCustomValidity(
      !formPhoneInput.value || isPhoneValid()
        ? ''
        : 'Введите телефон в формате +7 (XXX) XXX-XX-XX.'
    );
  }

  function clearFormErrors() {
    if (formNameInput) {
      formNameInput.classList.remove('is-invalid');
    }

    if (formPhoneInput) {
      formPhoneInput.classList.remove('is-invalid');
    }

    if (formStatusElement) {
      formStatusElement.textContent = '';
      formStatusElement.className = 'form-popup__status';
    }
  }

  function showFormValidationErrors() {
    if (formNameInput) {
      formNameInput.classList.toggle('is-invalid', !isNameValid());
    }

    if (formPhoneInput) {
      formPhoneInput.classList.toggle(
        'is-invalid',
        formPhoneInput.value.length > 0 && !isPhoneValid()
      );
    }
  }

  function createProductId(productName) {
    return String(productName || '')
      .toLowerCase()
      .replace(/ё/g, 'e')
      .replace(/[^a-zа-я0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '');
  }

  function closeFormPopup() {
    if (!formIsReady) {
      return;
    }

    formModal.setAttribute('hidden', '');
    formModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  /*
   * Поддерживает два варианта вызова:
   *
   * openFormPopup(buttonElement)
   *
   * openFormPopup('Заголовок', 'Подзаголовок', 'Название товара')
   */
  function openFormPopup(buttonOrTitle, subtitleText, productNameArg) {
    if (!formIsReady) {
      console.warn('Не найдена разметка универсальной формы.');
      return;
    }

    lastFocusedElement = document.activeElement;

    let title = 'Оставить заявку';
    let productId = '';
    let productName = '';
    let subtitle = '';

    if (
      buttonOrTitle &&
      typeof buttonOrTitle === 'object' &&
      buttonOrTitle.nodeType === 1
    ) {
      const button = buttonOrTitle;

      title =
        button.getAttribute('data-title') ||
        button.textContent.trim() ||
        'Оставить заявку';

      const productCard = button.closest(
        '.product-card[data-product-id], [data-product-id]'
      );

      if (productCard) {
        productId = productCard.getAttribute('data-product-id') || '';
        productName = productCard.getAttribute('data-product-name') || '';
      }

      if (button.getAttribute('data-lead-source') === 'quiz') {
        const recommendedProduct = document.getElementById(
          'recommended-product-name'
        );

        if (recommendedProduct) {
          productName = recommendedProduct.textContent.trim();
          productId = createProductId(productName);
        }
      }
    } else {
      title = String(buttonOrTitle || 'Оставить заявку');
      subtitle = String(subtitleText || '');
      productName = String(productNameArg || '');
      productId = createProductId(productName);
    }

    universalForm.reset();

    requiredCheckboxes.forEach(function (checkbox) {
      checkbox.checked = true;
    });

    clearFormErrors();

    formTitleElement.textContent = title;
    formTitleInput.value = title;

    formProductIdInput.value = productId;
    formProductNameInput.value = productName;

    if (formSubtitleElement) {
      const finalSubtitle = subtitle || (productName ? 'Товар: ' + productName : '');

      if (finalSubtitle) {
        formSubtitleElement.textContent = finalSubtitle;
        formSubtitleElement.style.display = 'block';
      } else {
        formSubtitleElement.textContent = '';
        formSubtitleElement.style.display = 'none';
      }
    }

    updateValidityMessages();
    updateSubmitButton();

    formModal.removeAttribute('hidden');
    formModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    setTimeout(function () {
      formNameInput.focus();
    }, 50);
  }

  window.openFormPopup = openFormPopup;
  window.closeFormPopup = closeFormPopup;

  if (formIsReady) {
    document.querySelectorAll('.js-open-form-popup').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        openFormPopup(button);
      });
    });

    if (formCloseButton) {
      formCloseButton.addEventListener('click', closeFormPopup);
    }

    formModal.addEventListener('pointerdown', function (event) {
      if (event.target === formModal) {
        closeFormPopup();
      }
    });

    formPhoneInput.addEventListener('input', function () {
      formPhoneInput.value = formatPhone(formPhoneInput.value);

      updateValidityMessages();
      showFormValidationErrors();
      updateSubmitButton();
    });

    formPhoneInput.addEventListener('paste', function () {
      setTimeout(function () {
        formPhoneInput.value = formatPhone(formPhoneInput.value);

        updateValidityMessages();
        showFormValidationErrors();
        updateSubmitButton();
      }, 0);
    });

    formNameInput.addEventListener('input', function () {
      updateValidityMessages();
      showFormValidationErrors();
      updateSubmitButton();
    });

    requiredCheckboxes.forEach(function (checkbox) {
      checkbox.addEventListener('change', function () {
        updateSubmitButton();
      });
    });

    universalForm.addEventListener('submit', function (event) {
      updateValidityMessages();
      showFormValidationErrors();

      if (!isFormValid()) {
        event.preventDefault();

        if (!isNameValid()) {
          formNameInput.focus();
          return;
        }

        if (!isPhoneValid()) {
          formPhoneInput.focus();
          return;
        }

        const uncheckedCheckbox = Array.from(requiredCheckboxes).find(
          function (checkbox) {
            return !checkbox.checked;
          }
        );

        if (uncheckedCheckbox) {
          uncheckedCheckbox.focus();
        }
      }
    });

    updateValidityMessages();
    updateSubmitButton();
  }

  // =========================================================
  // МОДАЛЬНОЕ ОКНО «ВСЕ БРЕНДЫ»
  // =========================================================

  const brandsModal =
    document.getElementById('brandsModal') ||
    document.querySelector('.brands-modal');

  const brandsOpenButton =
    document.getElementById('openBrandsModalBtn') ||
    document.querySelector('.btn-view-all-brands');

  if (brandsModal && brandsOpenButton) {
    function openBrandsModal(event) {
      event.preventDefault();

      brandsModal.classList.add('active');
      brandsModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('brands-modal-open');
    }

    function closeBrandsModal() {
      brandsModal.classList.remove('active');
      brandsModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('brands-modal-open');
    }

    brandsOpenButton.addEventListener('click', openBrandsModal);

    brandsModal.addEventListener('pointerdown', function (event) {
      if (event.target === brandsModal) {
        closeBrandsModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (
        event.key === 'Escape' &&
        brandsModal.classList.contains('active')
      ) {
        closeBrandsModal();
      }
    });
  }

// =========================================================
// МОБИЛЬНЫЙ ГОРИЗОНТАЛЬНЫЙ СКРОЛЛ КАТАЛОГА
// Вертикальный свайп оставляет прокрутку страницы доступной.
// =========================================================

const mobileCatalogGrid = document.querySelector('.catalog-grid');

if (mobileCatalogGrid) {
  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;
  let gestureDirection = null;

  const MOBILE_QUERY = window.matchMedia('(max-width: 768px)');
  const DIRECTION_THRESHOLD = 10;
  const HORIZONTAL_SENSITIVITY = 1.2;

  mobileCatalogGrid.addEventListener(
    'touchstart',
    function (event) {
      if (!MOBILE_QUERY.matches || !event.touches.length) {
        return;
      }

      const touch = event.touches[0];

      startX = touch.clientX;
      startY = touch.clientY;
      startScrollLeft = mobileCatalogGrid.scrollLeft;

      // Направление определяется после первого заметного движения.
      gestureDirection = null;
    },
    {
      passive: true,
      capture: true
    }
  );

  mobileCatalogGrid.addEventListener(
    'touchmove',
    function (event) {
      if (!MOBILE_QUERY.matches || !event.touches.length) {
        return;
      }

      const touch = event.touches[0];

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Пока пользователь почти не сдвинул палец — ничего не делаем.
      if (
        gestureDirection === null &&
        absX < DIRECTION_THRESHOLD &&
        absY < DIRECTION_THRESHOLD
      ) {
        return;
      }

      // Фиксируем тип жеста один раз.
      if (gestureDirection === null) {
        gestureDirection = absX > absY ? 'horizontal' : 'vertical';
      }

      /*
       * КРИТИЧЕСКИ ВАЖНО:
       * вертикальное движение не отменяем.
       * Благодаря этому сайт прокручивается вверх / вниз.
       */
      if (gestureDirection === 'vertical') {
        return;
      }

      /*
       * Отменяем стандартное действие только при явном
       * горизонтальном жесте — чтобы листать каталог.
       */
      if (event.cancelable) {
        event.preventDefault();
      }

      mobileCatalogGrid.scrollLeft =
        startScrollLeft - deltaX * HORIZONTAL_SENSITIVITY;
    },
    {
      passive: false,
      capture: true
    }
  );

  function resetCatalogGesture() {
    gestureDirection = null;
  }

  mobileCatalogGrid.addEventListener(
    'touchend',
    resetCatalogGesture,
    {
      passive: true,
      capture: true
    }
  );

  mobileCatalogGrid.addEventListener(
    'touchcancel',
    resetCatalogGesture,
    {
      passive: true,
      capture: true
    }
  );
}

  // =========================================================
  // КАТАЛОГ И ВКЛАДКИ КАТЕГОРИЙ
  // =========================================================

  const catalog = document.querySelector('#catalog');

  if (catalog) {
    const catalogTabs = catalog.querySelector('.catalog-tabs');
    const catalogGrid = catalog.querySelector('.catalog-grid');

    if (catalogTabs && catalogGrid) {
      const tabButtons = Array.from(
        catalogTabs.querySelectorAll('.tab-btn')
      );

      const productCards = Array.from(
        catalogGrid.querySelectorAll('.product-card')
      );

      const LEAVE_DURATION = 260;
      const ENTER_DELAY = 70;
      const LEAVE_DELAY = 35;

      let isSwitchingCategory = false;
      let animationTimer = null;

      function getCardsByCategory(category) {
        return productCards.filter(function (card) {
          return card.dataset.category === category;
        });
      }

      function setActiveTab(activeButton) {
        tabButtons.forEach(function (button) {
          const isActive = button === activeButton;

          button.classList.toggle('is-active', isActive);
          button.classList.toggle('active', isActive);
          button.setAttribute('aria-selected', String(isActive));
        });
      }

      function showInitialCategory(category) {
        productCards.forEach(function (card) {
          const isCurrentCategory = card.dataset.category === category;

          card.classList.toggle('is-hidden', !isCurrentCategory);
          card.classList.toggle('hidden', !isCurrentCategory);

          card.classList.remove('is-entering', 'is-leaving');
        });
      }

      function switchCategory(category) {
        if (animationTimer) {
          clearTimeout(animationTimer);
        }

        const visibleCards = productCards.filter(function (card) {
          return !card.classList.contains('is-hidden');
        });

        const nextCards = getCardsByCategory(category);

        isSwitchingCategory = true;
        catalogGrid.classList.add('is-switching');

        visibleCards.forEach(function (card, index) {
          setTimeout(function () {
            card.classList.add('is-leaving');
          }, index * LEAVE_DELAY);
        });

        const leaveTotalTime =
          LEAVE_DURATION +
          Math.max(0, visibleCards.length - 1) * LEAVE_DELAY;

        animationTimer = setTimeout(function () {
          productCards.forEach(function (card) {
            const isNextCategory = card.dataset.category === category;

            card.classList.remove('is-leaving');

            if (!isNextCategory) {
              card.classList.add('is-hidden', 'hidden');
              return;
            }

            card.classList.remove('is-hidden', 'hidden');
            card.classList.add('is-entering');
          });

          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              nextCards.forEach(function (card, index) {
                setTimeout(function () {
                  card.classList.remove('is-entering');
                }, index * ENTER_DELAY);
              });

              const enterTotalTime =
                LEAVE_DURATION +
                Math.max(0, nextCards.length - 1) * ENTER_DELAY;

              setTimeout(function () {
                catalogGrid.classList.remove('is-switching');
                isSwitchingCategory = false;
              }, enterTotalTime);
            });
          });
        }, leaveTotalTime);
      }

      const initialTab =
        tabButtons.find(function (button) {
          return (
            button.classList.contains('is-active') ||
            button.classList.contains('active')
          );
        }) || tabButtons[0];

      if (initialTab) {
        setActiveTab(initialTab);
        showInitialCategory(initialTab.dataset.category);
      }

      catalogTabs.addEventListener('click', function (event) {
        const clickedTab = event.target.closest('.tab-btn');

        if (
          !clickedTab ||
          !catalogTabs.contains(clickedTab) ||
          isSwitchingCategory ||
          clickedTab.classList.contains('is-active')
        ) {
          return;
        }

        setActiveTab(clickedTab);
        switchCategory(clickedTab.dataset.category);

        catalogGrid.scrollLeft = 0;
      });
    }
  }

  // =========================================================
  // СЛАЙДЕР ИЗОБРАЖЕНИЙ В КАРТОЧКАХ
  // =========================================================

  window.changeSlide1 = function (button, direction) {
    if (!button || !button.parentElement) {
      return;
    }

    const sliderContainer = button.parentElement;
    const imageElement = sliderContainer.querySelector('.slider-img');

    if (!imageElement) {
      return;
    }

    let images = [];

    try {
      images = JSON.parse(imageElement.getAttribute('data-images') || '[]');
    } catch (error) {
      console.warn('Некорректный список изображений слайдера:', error);
      return;
    }

    if (!Array.isArray(images) || images.length === 0) {
      return;
    }

    let currentIndex = parseInt(
      imageElement.getAttribute('data-index') || '0',
      10
    );

    if (Number.isNaN(currentIndex)) {
      currentIndex = 0;
    }

    currentIndex += Number(direction) || 0;

    if (currentIndex < 0) {
      currentIndex = images.length - 1;
    }

    if (currentIndex >= images.length) {
      currentIndex = 0;
    }

    imageElement.src = images[currentIndex];
    imageElement.setAttribute('data-index', String(currentIndex));
  };

  // =========================================================
  // КВИЗ
  // =========================================================

  const quizBlock =
    document.getElementById('quiz-block') ||
    document.querySelector('.quiz-section');

  if (quizBlock) {
    const quizSteps = quizBlock.querySelectorAll('.quiz-step');
    const quizResultBlock = quizBlock.querySelector('.quiz-result');

    const progressFill = document.getElementById('progress-fill');
    const progressContainer = document.getElementById('quiz-progress');
    const stepIndicators = quizBlock.querySelectorAll(
      '.quiz-step-indicator'
    );

    const previousButtons = quizBlock.querySelectorAll('.btn-prev');
    const resetQuizButton = document.getElementById('btn-reset-quiz');

    const recommendedTitle = document.getElementById(
      'recommended-product-name'
    );

    const recommendedDescription = document.getElementById(
      'recommended-product-desc'
    );

    const recommendedImage = document.getElementById(
      'recommended-product-image'
    );

    const quizForm = document.getElementById('quiz-form');
    const quizSuccessMessage = document.getElementById('quiz-success-msg');

    const inputMaterial = document.getElementById('input-quiz-material');
    const inputCondition = document.getElementById('input-quiz-condition');
    const inputDiameter = document.getElementById('input-quiz-diameter');
    const inputRecommendation = document.getElementById(
      'input-quiz-recommendation'
    );

    let currentQuizStep = 1;

    let quizData = {
      material: '',
      condition: '',
      diameter: ''
    };

    function getRecommendation(data) {
      if (data.condition && data.condition.includes('зима')) {
        return {
          name: 'ITH 410 Wi (зимний)',
          desc: 'Винилэстеровый состав для быстрых монтажных работ при отрицательных температурах (до -20°C).',
          image: 'images/products/ith-410-ve-winter.webp'
        };
      }

      if (
        data.material === 'Растянутая зона бетона' ||
        data.condition === 'Алмазное бурение' ||
        data.diameter === 'М24 и выше'
      ) {
        return {
          name: 'ITH 585 EPOXE',
          desc: 'Чистый эпоксидный состав для высочайших нагрузок, глубокой анкеровки и алмазного бурения.',
          image: 'images/products/ith-500-epox-bit-ex.webp'
        };
      }

      if (
        data.material === 'Кирпич' ||
        data.material === 'Газобетон'
      ) {
        return {
          name: 'ITH 300 Pe (Полиэстер)',
          desc: 'Оптимальный экономичный состав для пустотелого кирпича, пеноблока и легких бетонов.',
          image: 'images/products/ith-300-pe.webp'
        };
      }

      if (data.condition === 'Мокрые отверстия') {
        return {
          name: 'ITH 410 Ve (Винилэстер)',
          desc: 'Устойчив к влаге и воде в отверстиях, повышенная химическая стойкость и надежность.',
          image: 'images/products/ith-410-ve.webp'
        };
      }

      return {
        name: 'ITH 410 Ve (Винилэстер)',
        desc: 'Универсальный и эффективный химический анкер для бетона и сложного монтажа.',
        image: 'images/products/ith-410-ve.webp'
      };
    }

    function updateQuizResult() {
      const recommendation = getRecommendation(quizData);

      if (recommendedTitle) {
        recommendedTitle.textContent = recommendation.name;
      }

      if (recommendedDescription) {
        recommendedDescription.textContent = recommendation.desc;
      }

      if (recommendedImage) {
        recommendedImage.src = recommendation.image;
        recommendedImage.alt = recommendation.name;
      }

      if (inputMaterial) {
        inputMaterial.value = quizData.material;
      }

      if (inputCondition) {
        inputCondition.value = quizData.condition;
      }

      if (inputDiameter) {
        inputDiameter.value = quizData.diameter;
      }

      if (inputRecommendation) {
        inputRecommendation.value = recommendation.name;
      }
    }

    function goToQuizStep(stepNumber) {
      currentQuizStep = stepNumber;

      if (stepNumber === 'result') {
        if (progressContainer) {
          progressContainer.style.display = 'none';
        }

        quizSteps.forEach(function (step) {
          step.classList.remove('active');
        });

        if (quizResultBlock) {
          quizResultBlock.classList.add('active');
        }

        updateQuizResult();
        return;
      }

      if (progressContainer) {
        progressContainer.style.display = 'flex';
      }

      if (quizResultBlock) {
        quizResultBlock.classList.remove('active');
      }

      quizSteps.forEach(function (step) {
        const stepIndex = parseInt(
          step.getAttribute('data-step') || '0',
          10
        );

        step.classList.toggle('active', stepIndex === stepNumber);
      });

      const percent = (stepNumber / 3) * 100;

      if (progressFill) {
        progressFill.style.width = percent + '%';
      }

      stepIndicators.forEach(function (indicator) {
        const indicatorStep = parseInt(
          indicator.getAttribute('data-step-num') || '0',
          10
        );

        indicator.classList.remove('active', 'completed');

        if (indicatorStep === stepNumber) {
          indicator.classList.add('active');
        } else if (indicatorStep < stepNumber) {
          indicator.classList.add('completed');
        }
      });
    }

    const quizOptionButtons = quizBlock.querySelectorAll(
      '.quiz-btn, .quiz-option'
    );

    quizOptionButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();

        const parentStep = button.closest('.quiz-step');

        if (!parentStep) {
          return;
        }

        const stepNumber = parseInt(
          parentStep.getAttribute('data-step') || '0',
          10
        );

        parentStep
          .querySelectorAll('.quiz-btn, .quiz-option')
          .forEach(function (option) {
            option.classList.remove('selected');
          });

        button.classList.add('selected');

        const field = button.getAttribute('data-field');
        const value =
          button.getAttribute('data-value') ||
          button.textContent.trim();

        if (stepNumber === 1 || field === 'material') {
          quizData.material = value;

          setTimeout(function () {
            goToQuizStep(2);
          }, 200);

          return;
        }

        if (stepNumber === 2 || field === 'condition') {
          quizData.condition = value;

          setTimeout(function () {
            goToQuizStep(3);
          }, 200);

          return;
        }

        if (stepNumber === 3 || field === 'diameter') {
          quizData.diameter = value;

          setTimeout(function () {
            goToQuizStep('result');
          }, 200);
        }
      });
    });

    previousButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();

        if (
          typeof currentQuizStep === 'number' &&
          currentQuizStep > 1
        ) {
          goToQuizStep(currentQuizStep - 1);
        }
      });
    });

    if (resetQuizButton) {
      resetQuizButton.addEventListener('click', function (event) {
        event.preventDefault();

        quizData = {
          material: '',
          condition: '',
          diameter: ''
        };

        quizOptionButtons.forEach(function (button) {
          button.classList.remove('selected');
        });

        if (quizForm) {
          quizForm.reset();

          const submitButton = quizForm.querySelector(
            'button[type="submit"]'
          );

          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Получить расчёт и КП';
          }
        }

        if (quizSuccessMessage) {
          quizSuccessMessage.style.display = 'none';
        }

        goToQuizStep(1);
      });
    }

    if (quizForm) {
      quizForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(quizForm);

        const submissionData = {
          name: formData.get('name'),
          phone: formData.get('phone'),
          material: quizData.material,
          condition: quizData.condition,
          diameter: quizData.diameter,
          recommendation: inputRecommendation
            ? inputRecommendation.value
            : ''
        };

        console.log('Данные квиза для отправки:', submissionData);

        if (quizSuccessMessage) {
          quizSuccessMessage.style.display = 'block';
        }

        const submitButton = quizForm.querySelector(
          'button[type="submit"]'
        );

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Отправлено!';
        }
      });
    }

    goToQuizStep(1);
  }

  // =========================================================
  // МОБИЛЬНОЕ МЕНЮ
  // =========================================================

  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const expanded =
        navToggle.getAttribute('aria-expanded') === 'true';

      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('is-open');
    });
  }

  // =========================================================
  // ОСНОВНОЙ СЛАЙДЕР
  // =========================================================

  const slides = Array.from(document.querySelectorAll('.slide'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const mainSlider = document.querySelector('.slider');

  if (slides.length > 0) {
    let currentSlide = 0;
    let sliderTimer = null;

    function showSlide(index) {
      const normalizedIndex =
        ((index % slides.length) + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle(
          'active',
          slideIndex === normalizedIndex
        );
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle(
          'active',
          dotIndex === normalizedIndex
        );
      });

      currentSlide = normalizedIndex;
    }

    window.changeSlide = function (delta) {
      showSlide(currentSlide + Number(delta || 0));
    };

    window.goToSlide = function (index) {
      showSlide(Number(index) || 0);
    };

    sliderTimer = setInterval(function () {
      window.changeSlide(1);
    }, 6000);

    if (mainSlider) {
      mainSlider.addEventListener('mouseenter', function () {
        clearInterval(sliderTimer);
      });
    }
  }

  // =========================================================
  // ПОПАП СЕРТИФИКАТОВ
  // =========================================================

  const certificateOverlay = document.getElementById(
    'certPopupOverlay'
  );

  const certificateImage = document.getElementById('certPopupImg');
  const certificates = document.querySelectorAll('.certs img');

  if (certificateOverlay && certificateImage && certificates.length > 0) {
    certificates.forEach(function (image) {
      image.addEventListener('click', function () {
        certificateImage.src = image.src;
        certificateImage.alt = image.alt || 'Сертификат';

        certificateOverlay.removeAttribute('hidden');
      });
    });

    certificateOverlay.addEventListener('click', function (event) {
      if (event.target === certificateOverlay) {
        certificateOverlay.setAttribute('hidden', '');
      }
    });
  }

  // =========================================================
  // СЛАЙДЕР БРЕНДОВ
  // =========================================================

  const brandsTrack = document.querySelector('.brands-track');

  if (brandsTrack) {
    const brandItems = Array.from(
      brandsTrack.querySelectorAll('.brands-item')
    ).map(function (item) {
      return item.outerHTML;
    });

    if (brandItems.length > 0) {
      const mobileQuery = window.matchMedia('(max-width: 767px)');

      let currentBrandSlide = 0;
      let brandsSliderInterval = null;

      function buildBrandsSlider() {
        const brandsPerSlide = mobileQuery.matches ? 3 : 5;
        const brandSlides = [];

        for (let i = 0; i < brandItems.length; i += brandsPerSlide) {
          brandSlides.push(
            '<div class="brands-slide">' +
              brandItems.slice(i, i + brandsPerSlide).join('') +
              '</div>'
          );
        }

        brandsTrack.innerHTML = brandSlides.join('');
        brandsTrack.style.transform = 'translateX(0)';
        currentBrandSlide = 0;

        clearInterval(brandsSliderInterval);

        if (brandSlides.length <= 1) {
          return;
        }

        brandsSliderInterval = setInterval(function () {
          currentBrandSlide =
            (currentBrandSlide + 1) % brandSlides.length;

          brandsTrack.style.transform =
            'translateX(-' + currentBrandSlide * 100 + '%)';
        }, 3000);
      }

      buildBrandsSlider();

      mobileQuery.addEventListener('change', buildBrandsSlider);
    }
  }

  // =========================================================
  // COOKIE POPUP
  // =========================================================

  const cookiePopup = document.getElementById('cookie-popup');
  const cookieAcceptButton = document.getElementById('cookie-accept');

  try {
    if (
      cookiePopup &&
      !localStorage.getItem('cookieConsent')
    ) {
      cookiePopup.hidden = false;
    }

    if (cookieAcceptButton) {
      cookieAcceptButton.addEventListener('click', function () {
        localStorage.setItem('cookieConsent', 'true');

        if (cookiePopup) {
          cookiePopup.hidden = true;
        }
      });
    }
  } catch (error) {
    console.warn('Cookie init error:', error);
  }

  // =========================================================
  // ПОПАП ПОЛИТИКИ / ИНФОРМАЦИИ
  // =========================================================

  const policyOverlay = document.getElementById('popupOverlay');
  const policyCloseButton = document.getElementById('popupClose');

  if (policyOverlay) {
    const policyOpenersSelectors = [
      '#openPopupBtn',
      '#openPopupBtn2',
      '#openPopupBtn3',
      '#openPopupBtn4',
      '#openPopupBtnQuiz'
    ];

    const policyOpeners = policyOpenersSelectors
      .map(function (selector) {
        return document.querySelector(selector);
      })
      .filter(Boolean);

    function openPolicyPopup(event) {
      if (event) {
        event.preventDefault();
      }

      policyOverlay.removeAttribute('hidden');
    }

    function closePolicyPopup(event) {
      if (event) {
        event.preventDefault();
      }

      policyOverlay.setAttribute('hidden', '');
    }

    policyOpeners.forEach(function (button) {
      button.addEventListener('click', openPolicyPopup);
    });

    if (policyCloseButton) {
      policyCloseButton.addEventListener('click', closePolicyPopup);
    }

    policyOverlay.addEventListener('click', function (event) {
      if (event.target === policyOverlay) {
        closePolicyPopup();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !policyOverlay.hidden) {
        closePolicyPopup();
      }
    });
  }

  // =========================================================
  // ОБРАБОТКА ОШИБОК ИЗОБРАЖЕНИЙ
  // =========================================================

  const IMAGE_PLACEHOLDER =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  function setImagePlaceholder(image) {
    if (!image || image.tagName !== 'IMG') {
      return;
    }

    if (image.dataset.errorHandlerInitialized === 'true') {
      return;
    }

    image.dataset.errorHandlerInitialized = 'true';

    if (image.src && image.src.startsWith('file:///')) {
      image.src = IMAGE_PLACEHOLDER;
    }

    image.addEventListener('error', function onImageError() {
      if (!image.src.startsWith('data:')) {
        image.src = IMAGE_PLACEHOLDER;
      }

      image.removeEventListener('error', onImageError);
    });
  }

  document.querySelectorAll('img').forEach(setImagePlaceholder);

  if (window.MutationObserver) {
    const imageObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type !== 'childList') {
          return;
        }

        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) {
            return;
          }

          if (node.tagName === 'IMG') {
            setImagePlaceholder(node);
          }

          if (node.querySelectorAll) {
            node.querySelectorAll('img').forEach(setImagePlaceholder);
          }
        });
      });
    });

    imageObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // =========================================================
  // ESC — ЗАКРЫТИЕ ОСНОВНЫХ ПОПАПОВ
  // =========================================================

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') {
      return;
    }

    if (formIsReady && !formModal.hasAttribute('hidden')) {
      closeFormPopup();
    }
  });
});

  // =========================================================
  // СКРЫТИЕ БРЕНДОВ И АРТИКУЛОВ
  // =========================================================

document.addEventListener('DOMContentLoaded', function () {
  const MAX_VISIBLE_ITEMS = 5;

  document.querySelectorAll('.product-card .param-row').forEach(function (row) {
    const label = row.querySelector('.param-label');

    // Работаем только с полями «Бренды» и «Артикулы»
    if (!label || !/^(Бренды|Артикулы):\s*$/i.test(label.textContent.trim())) {
      return;
    }

    // Получаем текст после span.param-label
    const fullText = Array.from(row.childNodes)
      .filter(function (node) {
        return node !== label;
      })
      .map(function (node) {
        return node.textContent;
      })
      .join('')
      .trim();

    const items = fullText
      .split(',')
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);

    // Если позиций 5 или меньше — ничего не меняем
    if (items.length <= MAX_VISIBLE_ITEMS) {
      return;
    }

    const shortText = items.slice(0, MAX_VISIBLE_ITEMS).join(', ');
    const hiddenText = items.slice(MAX_VISIBLE_ITEMS).join(', ');

    // Удаляем исходный текст, оставляя сам заголовок (span)
    Array.from(row.childNodes).forEach(function (node) {
      if (node !== label) {
        node.remove();
      }
    });

    const visiblePart = document.createElement('span');
    visiblePart.className = 'param-values-visible';
    visiblePart.textContent = shortText;

    const hiddenPart = document.createElement('span');
    hiddenPart.className = 'param-values-hidden';
    hiddenPart.textContent = ', ' + hiddenText;
    hiddenPart.hidden = true;

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'param-more-btn';
    toggleButton.textContent = '...';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-label', 'Показать все значения');

    toggleButton.addEventListener('click', function () {
      const isHidden = hiddenPart.hidden;

      hiddenPart.hidden = !isHidden;
      toggleButton.setAttribute('aria-expanded', String(isHidden));

      if (isHidden) {
        toggleButton.textContent = 'Свернуть';
        toggleButton.setAttribute('aria-label', 'Свернуть список');
      } else {
        toggleButton.textContent = '...';
        toggleButton.setAttribute('aria-label', 'Показать все значения');
      }
    });

    row.appendChild(document.createTextNode(' '));
    row.appendChild(visiblePart);
    row.appendChild(hiddenPart);
    row.appendChild(document.createTextNode(' '));
    row.appendChild(toggleButton);
  });
});