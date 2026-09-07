document.addEventListener('DOMContentLoaded', function () {
  /*
   * Элементы существующего универсального попапа.
   */
  const modal = document.getElementById('formPopupOverlay');
  const modalDialog = document.getElementById('formPopupContent');
  const closeButton = document.getElementById('formPopupClose');

  const form = document.getElementById('universalLeadForm');

  const titleElement = document.getElementById('formPopupTitle');
  const subtitleElement = document.getElementById('formPopupSubtitle');

  const titleInput = document.getElementById('formPopupTitleInput');
  const formTitleInput = document.getElementById('formPopupFormTitleInput');

  const productIdInput = document.getElementById('formPopupProductIdInput');
  const productNameInput = document.getElementById('formPopupProductInput');

  const nameInput = document.getElementById('formPopupName');
  const phoneInput = document.getElementById('formPopupPhone');

  const submitButton = document.getElementById('formPopupSubmit');
  const statusElement = document.getElementById('formPopupStatus');

  /*
   * Защита от ошибок, если какая-либо часть разметки отсутствует.
   */
  if (
    !modal ||
    !modalDialog ||
    !form ||
    !titleElement ||
    !titleInput ||
    !formTitleInput ||
    !productIdInput ||
    !productNameInput ||
    !nameInput ||
    !phoneInput ||
    !submitButton
  ) {
    console.warn('Не найдена разметка универсальной формы.');
    return;
  }

  const requiredCheckboxes = form.querySelectorAll(
    'input[type="checkbox"][required]'
  );

  let lastFocusedElement = null;

  /*
   * Форматирование номера:
   * +7 (XXX) XXX-XX-XX
   */
  function formatPhone(value) {
    let digits = value.replace(/\D/g, '');

    /*
     * Если номер ввели через 8:
     * 8 999 123 45 67 → +7 (999) 123-45-67
     */
    if (digits.startsWith('8')) {
      digits = '7' + digits.slice(1);
    }

    /*
     * Удаляем 7 как код страны:
     * далее собираем номер вручную с +7.
     */
    if (digits.startsWith('7')) {
      digits = digits.slice(1);
    }

    /*
     * После кода страны можно ввести максимум 10 цифр.
     */
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

  /*
   * Номер должен содержать 11 цифр:
   * 7 + 10 цифр российского номера.
   */
  function isPhoneValid() {
    const digits = phoneInput.value.replace(/\D/g, '');

    return /^7\d{10}$/.test(digits);
  }

  function isNameValid() {
    return nameInput.value.trim().length > 0;
  }

  function areCheckboxesValid() {
    return Array.from(requiredCheckboxes).every(function (checkbox) {
      return checkbox.checked;
    });
  }

  function isFormValid() {
    return (
      isNameValid() &&
      isPhoneValid() &&
      areCheckboxesValid()
    );
  }

  /*
   * Управление состоянием кнопки отправки.
   */
  function updateSubmitButton() {
    submitButton.disabled = !isFormValid();
  }

  /*
   * Сообщения встроенной browser-валидации.
   */
  function updateValidityMessages() {
    nameInput.setCustomValidity(
      isNameValid() ? '' : 'Укажите ваше имя.'
    );

    phoneInput.setCustomValidity(
      !phoneInput.value || isPhoneValid()
        ? ''
        : 'Введите телефон в формате +7 (XXX) XXX-XX-XX.'
    );
  }

  function clearErrors() {
    nameInput.classList.remove('is-invalid');
    phoneInput.classList.remove('is-invalid');

    if (statusElement) {
      statusElement.textContent = '';
      statusElement.className = 'form-popup__status';
    }
  }

  function showValidationErrors() {
    nameInput.classList.toggle('is-invalid', !isNameValid());
    phoneInput.classList.toggle(
      'is-invalid',
      phoneInput.value.length > 0 && !isPhoneValid()
    );
  }

  /*
   * Формируем slug для товара из квиза, если ID товара не задан.
   */
  function createProductId(productName) {
    return productName
      .toLowerCase()
      .replace(/ё/g, 'e')
      .replace(/[^a-zа-я0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '');
  }

  /*
   * Открытие единого попапа.
   */
  function openFormPopup(button) {
    lastFocusedElement = document.activeElement;

    const title =
      button.getAttribute('data-title') ||
      button.textContent.trim() ||
      'Оставить заявку';

    /*
     * Определяем товар по родительской карточке каталога.
     */
    const productCard = button.closest(
      '.product-card[data-product-id], [data-product-id]'
    );

    let productId = '';
    let productName = '';

    if (productCard) {
      productId = productCard.getAttribute('data-product-id') || '';
      productName = productCard.getAttribute('data-product-name') || '';
    }

    /*
     * Для CTA в результате квиза.
     */
    if (button.getAttribute('data-lead-source') === 'quiz') {
      const recommendedProduct = document.getElementById(
        'recommended-product-name'
      );

      if (recommendedProduct) {
        productName = recommendedProduct.textContent.trim();
        productId = createProductId(productName);
      }
    }

    /*
     * Очищаем форму до заполнения служебных полей.
     */
    form.reset();

    /*
     * Галочки после reset остаются включёнными,
     * но задаём их явно для надёжности.
     */
    requiredCheckboxes.forEach(function (checkbox) {
      checkbox.checked = true;
    });

    clearErrors();

    /*
     * Заголовок формы и данные для send.php.
     */
    titleElement.textContent = title;
    titleInput.value = title;
    formTitleInput.value = title;

    productIdInput.value = productId;
    productNameInput.value = productName;

    /*
     * Подзаголовок показываем только для товара.
     */
    if (subtitleElement) {
      if (productName) {
        subtitleElement.textContent = 'Товар: ' + productName;
        subtitleElement.style.display = 'block';
      } else {
        subtitleElement.textContent = '';
        subtitleElement.style.display = 'none';
      }
    }

    updateValidityMessages();
    updateSubmitButton();

    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    setTimeout(function () {
      nameInput.focus();
    }, 50);
  }

  /*
   * Закрытие формы.
   */
  function closeFormPopup() {
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  /*
   * Делаем функцию доступной для остальных скриптов,
   * если она понадобится в будущем.
   */
  window.openFormPopup = openFormPopup;
  window.closeFormPopup = closeFormPopup;

  /*
   * Все CTA-кнопки с данным классом открывают форму.
   */
  document.querySelectorAll('.js-open-form-popup').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      openFormPopup(button);
    });
  });

  /*
   * Закрытие по крестику.
   */
  if (closeButton) {
    closeButton.addEventListener('click', closeFormPopup);
  }

  /*
   * Закрытие по клику/тапу по затемнённой области за пределами окна.
   */
  modal.addEventListener('pointerdown', function (event) {
    if (event.target === modal) {
      closeFormPopup();
    }
  });

  /*
   * Закрытие по Escape.
   */
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hasAttribute('hidden')) {
      closeFormPopup();
    }
  });

  /*
   * Маска при ручном вводе.
   */
  phoneInput.addEventListener('input', function () {
    phoneInput.value = formatPhone(phoneInput.value);

    updateValidityMessages();
    showValidationErrors();
    updateSubmitButton();
  });

  /*
   * Маска при вставке номера:
   * +7 999 123-45-67
   * 8 (999) 123-45-67
   * 9991234567
   */
  phoneInput.addEventListener('paste', function () {
    setTimeout(function () {
      phoneInput.value = formatPhone(phoneInput.value);

      updateValidityMessages();
      showValidationErrors();
      updateSubmitButton();
    }, 0);
  });

  nameInput.addEventListener('input', function () {
    updateValidityMessages();
    showValidationErrors();
    updateSubmitButton();
  });

  requiredCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      updateSubmitButton();
    });
  });

  /*
   * Финальная проверка перед обычной отправкой на send.php.
   */
  form.addEventListener('submit', function (event) {
    updateValidityMessages();
    showValidationErrors();

    if (!isFormValid()) {
      event.preventDefault();

      if (!isNameValid()) {
        nameInput.focus();
        return;
      }

      if (!isPhoneValid()) {
        phoneInput.focus();
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

      return;
    }

    /*
     * Форма корректна.
     * Она будет стандартно отправлена на send.php.
     *
     * Если затем захотите использовать AJAX / fetch,
     * обработчик отправки нужно будет заменить здесь.
     */
  });

  /*
   * Начальное состояние формы.
   */
  updateValidityMessages();
  updateSubmitButton();
});

// ==================== МОДАЛЬНОЕ ОКНО «ВСЕ БРЕНДЫ» ====================
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('brandsModal') || document.querySelector('.brands-modal');
    const openBtn = document.getElementById('openBrandsModalBtn') || document.querySelector('.btn-view-all-brands');
    if (!modal || !openBtn) return;

    const closeModal = function () {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('brands-modal-open');
    };
    const openModal = function (event) {
        event.preventDefault();
        event.stopPropagation();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('brands-modal-open');
    };

    openBtn.addEventListener('click', openModal);
    // По требованию: касание/клик в любой зоне открытого окна закрывает его.
    modal.addEventListener('pointerup', function (event) {
        if (event.pointerType === 'touch' || event.pointerType === 'mouse') closeModal();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
});

// ==================== ГОРИЗОНТАЛЬНЫЙ СВАЙП КАТАЛОГА (МОБИЛЬНЫЕ) ====================
document.addEventListener('DOMContentLoaded', function () {
    const catalogGrid = document.querySelector('.catalog-grid');
    if (!catalogGrid) return;

    // Проверяем, является ли устройство мобильным (ширина ≤ 768px)
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeftStart = 0;

    catalogGrid.addEventListener('touchstart', function (e) {
        isDragging = true;
        startX = e.touches[0].pageX;
        scrollLeftStart = this.scrollLeft;
    }, { passive: true });

    catalogGrid.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        const x = e.touches[0].pageX;
        const walk = (startX - x) * 1.5; // коэффициент чувствительности
        this.scrollLeft = scrollLeftStart + walk;
    }, { passive: true });

    catalogGrid.addEventListener('touchend', function () {
        isDragging = false;
    }, { passive: true });
});

// СКРИПТ ИНТЕРАКТИВА КАТАЛОГА (без изменений)

document.addEventListener('DOMContentLoaded', function() {
    // 1. Переключение категорий
    const tabBtns = document.querySelectorAll('.tab-btn');
    const productCards = document.querySelectorAll('.product-card');
    const catalogGrid = document.querySelector('.catalog-grid');
    const category = 'chem-anchors';

    productCards.forEach(card => {
        if (card.getAttribute('data-category') === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            productCards.forEach(card => {
                if (card.getAttribute('data-category') === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });

            if (catalogGrid) {
                catalogGrid.scrollLeft = 0;
            }
        });
    });
});

// 2. Листание слайдера в карточках
function changeSlide1(button, direction) {
    const sliderContainer = button.parentElement;
    const imgEl = sliderContainer.querySelector('.slider-img');
    const images = JSON.parse(imgEl.getAttribute('data-images'));
    let currentIndex = parseInt(imgEl.getAttribute('data-index'));

    currentIndex += direction;
    if (currentIndex < 0) {
        currentIndex = images.length - 1;
    } else if (currentIndex >= images.length) {
        currentIndex = 0;
    }

    imgEl.src = images[currentIndex];
    imgEl.setAttribute('data-index', currentIndex);
}

// 3. Передача названия товара в форму "Запросить КП"
function openProductModal(productName) {
    const modal = document.querySelector('#modal-kp');
    if (modal) {
        const inputProduct = modal.querySelector('input[name="product"]');
        if (inputProduct) inputProduct.value = productName;
        modal.style.display = 'block';
    } else {
        const mainForm = document.querySelector('form');
        if (mainForm) {
            mainForm.scrollIntoView({ behavior: 'smooth' });
        }
    }
}


document.addEventListener('DOMContentLoaded', function() {
    // 1. Поиск элементов квиза
    const quizBlock = document.getElementById('quiz-block') || document.querySelector('.quiz-section');
    if (!quizBlock) return;

    const steps = quizBlock.querySelectorAll('.quiz-step');
    const resultBlock = quizBlock.querySelector('.quiz-result');
    const progressFill = document.getElementById('progress-fill');
    const stepIndicators = quizBlock.querySelectorAll('.quiz-step-indicator');
    const progressContainer = document.getElementById('quiz-progress');

    // Кнопки возврата назад
    const prevBtns = quizBlock.querySelectorAll('.btn-prev');
    const btnReset = document.getElementById('btn-reset-quiz');

    // Поля результата
    const recommendedTitle = document.getElementById('recommended-product-name');
    const recommendedDesc = document.getElementById('recommended-product-desc');

    // Поля формы
    const quizForm = document.getElementById('quiz-form');
    const successMsg = document.getElementById('quiz-success-msg');
    const inputMaterial = document.getElementById('input-quiz-material');
    const inputCondition = document.getElementById('input-quiz-condition');
    const inputDiameter = document.getElementById('input-quiz-diameter');
    const inputRecommendation = document.getElementById('input-quiz-recommendation');

    // Текущее состояние
    let currentStep = 1;
    let quizData = {
        material: '',
        condition: '',
        diameter: ''
    };

    // 2. Функция подбора подходящего анкера
    function getRecommendation(data) {
        // Низкие температуры (зима)
        if (data.condition && data.condition.includes('зима')) {
            return {
                name: 'ITH 410 Wi (зимний)',
                desc: 'Винилэстеровый состав для быстрых монтажных работ при отрицательных температурах (до -20°C).'
            };
        }

        // Высокие нагрузки / Алмазное бурение / Большой диаметр / Растянутая зона
        if (data.material === 'Растянутая зона бетона' || data.condition === 'Алмазное бурение' || data.diameter === 'М24 и выше') {
            return {
                name: 'ITH 585 EPOXE',
                desc: 'Чистый эпоксидный состав для высочайших нагрузок, глубокой анкеровки и алмазного бурения.'
            };
        }

        // Кирпич / Газобетон
        if (data.material === 'Кирпич' || data.material === 'Газобетон') {
            return {
                name: 'ITH 300 Pe (Полиэстер)',
                desc: 'Оптимальный экономичный состав для пустотелого кирпича, пеноблока и легких бетонов.'
            };
        }

        // Мокрые отверстия
        if (data.condition === 'Мокрые отверстия') {
            return {
                name: 'ITH 410 Ve (Винилэстер)',
                desc: 'Устойчив к влаге и воде в отверстиях, повышенная химическая стойкость и надежность.'
            };
        }

        // Значение по умолчанию (Бетон, Обычные условия, М8-М24)
        return {
            name: 'ITH 410 Ve (Винилэстер)',
            desc: 'Универсальный и эффективный химический анкер для бетона и сложного монтажа.'
        };
    }

    // 3. Переключение на конкретный шаг
    function goToStep(stepNum) {
        currentStep = stepNum;

        // Переключаем видимость шагов
        steps.forEach(step => {
            const stepIndex = parseInt(step.getAttribute('data-step'), 10);
            if (stepIndex === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Показываем/скрываем блок результата
        if (stepNum === 'result') {
            if (progressContainer) progressContainer.style.display = 'none';
            steps.forEach(step => step.classList.remove('active'));
            if (resultBlock) resultBlock.classList.add('active');

            // Расчет и отображение результата
            const recommendation = getRecommendation(quizData);
            if (recommendedTitle) recommendedTitle.textContent = recommendation.name;
            if (recommendedDesc) recommendedDesc.textContent = recommendation.desc;

            // Заполнение скрытых полей формы
            if (inputMaterial) inputMaterial.value = quizData.material;
            if (inputCondition) inputCondition.value = quizData.condition;
            if (inputDiameter) inputDiameter.value = quizData.diameter;
            if (inputRecommendation) inputRecommendation.value = recommendation.name;

        } else {
            if (progressContainer) progressContainer.style.display = 'flex';
            if (resultBlock) resultBlock.classList.remove('active');

            // Обновление прогресс-бара
            const percent = (currentStep / 3) * 100;
            if (progressFill) progressFill.style.width = percent + '%';

            // Обновление индикаторов шагов
            stepIndicators.forEach(ind => {
                const indStep = parseInt(ind.getAttribute('data-step-num'), 10);
                ind.classList.remove('active', 'completed');
                if (indStep === currentStep) {
                    ind.classList.add('active');
                } else if (indStep < currentStep) {
                    ind.classList.add('completed');
                }
            });
        }
    }

    // 4. Обработка клика по вариантам ответа
    const optionBtns = quizBlock.querySelectorAll('.quiz-btn, .quiz-option');
    optionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();

            const parentStep = btn.closest('.quiz-step');
            if (!parentStep) return;

            const stepNum = parseInt(parentStep.getAttribute('data-step'), 10);

            // Снимаем выделение у соседних кнопок текущего шага
            parentStep.querySelectorAll('.quiz-btn, .quiz-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            // Сохраняем выбранное значение
            const field = btn.getAttribute('data-field');
            const value = btn.getAttribute('data-value') || btn.textContent.trim();

            if (stepNum === 1 || field === 'material') {
                quizData.material = value;
                setTimeout(() => goToStep(2), 200);
            } else if (stepNum === 2 || field === 'condition') {
                quizData.condition = value;
                setTimeout(() => goToStep(3), 200);
            } else if (stepNum === 3 || field === 'diameter') {
                quizData.diameter = value;
                setTimeout(() => goToStep('result'), 200);
            }
        });
    });

    // 5. Обработка кнопок "Назад"
    prevBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof currentStep === 'number' && currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
    });

    // 6. Сброс / Пройти опрос заново
    if (btnReset) {
        btnReset.addEventListener('click', function(e) {
            e.preventDefault();
            quizData = { material: '', condition: '', diameter: '' };

            // Сбрасываем выбранные кнопки
            optionBtns.forEach(btn => btn.classList.remove('selected'));

            if (quizForm) quizForm.reset();
            if (successMsg) successMsg.style.display = 'none';

            goToStep(1);
        });
    }

    // 7. Отправка формы квиза
    if (quizForm) {
        quizForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Сбор данных формы
            const formData = new FormData(quizForm);
            const submissionData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                material: quizData.material,
                condition: quizData.condition,
                diameter: quizData.diameter,
                recommendation: inputRecommendation ? inputRecommendation.value : ''
            };

            console.log('Данные квиза для отправки:', submissionData);

            // Показываем сообщение об успешной отправке
            if (successMsg) {
                successMsg.style.display = 'block';
            }

            const submitBtn = quizForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправлено!';
            }
        });
    }

    // Инициализация первично
    goToStep(1);
});


document.addEventListener('DOMContentLoaded', () => {
    try {
        const toggle = document.querySelector('.nav__toggle');
        const menu = document.getElementById('navMenu');
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', String(!expanded));
                menu.classList.toggle('is-open');
            });
        }
    } catch (e) {
        console.warn('Nav init error:', e);
    }

    try {
        const slides = Array.from(document.querySelectorAll('.slide'));
        const dots = Array.from(document.querySelectorAll('.dot'));
        let current = 0;

        function show(i) {
            slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
            dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
            current = i;
        }

        window.changeSlide = (delta) => {
            let i = (current + delta + slides.length) % slides.length;
            show(i);
        };
        window.goToSlide = (i) => show(i);

        let timer = setInterval(() => window.changeSlide(1), 6000);
        document.querySelector('.slider')?.addEventListener('mouseenter', () => clearInterval(timer));
    } catch (e) {
        console.warn('Slider init error:', e);
    }

    try {
        const certOverlay = document.getElementById('certPopupOverlay');
        const certImg = document.getElementById('certPopupImg');
        const certs = document.querySelectorAll('.certs img');
        certs.forEach(img => {
            img.addEventListener('click', () => {
                if (certImg && certOverlay) {
                    certImg.src = img.src;
                    certImg.alt = img.alt || 'Сертификат';
                    certOverlay.removeAttribute('hidden');
                }
            });
        });
        if (certOverlay) {
            const closeCertPopup = () => certOverlay.setAttribute('hidden', '');
            certOverlay.addEventListener('click', closeCertPopup);
            certOverlay.addEventListener('touchend', closeCertPopup);
        }
    } catch (e) {
        console.warn('Cert popup init error:', e);
    }

    try {
        const track = document.querySelector('.brands-track');
        if (track) {
            const brands = Array.from(track.querySelectorAll('.brands-item'))
                .map(item => item.outerHTML);
            const mobileQuery = window.matchMedia('(max-width: 767px)');
            let currentBrandSlide = 0;
            let sliderInterval;

            function buildBrandsSlider() {
                const brandsPerSlide = mobileQuery.matches ? 3 : 5;
                const slides = [];
                for (let i = 0; i < brands.length; i += brandsPerSlide) {
                    slides.push(`
                        <div class="brands-slide">
                            ${brands.slice(i, i + brandsPerSlide).join('')}
                        </div>
                    `);
                }
                track.innerHTML = slides.join('');
                currentBrandSlide = 0;
                track.style.transform = 'translateX(0)';
                clearInterval(sliderInterval);
                const totalBrandSlides = slides.length;
                sliderInterval = setInterval(() => {
                    currentBrandSlide = (currentBrandSlide + 1) % totalBrandSlides;
                    track.style.transform = `translateX(-${currentBrandSlide * 100}%)`;
                }, 3000);
            }
            buildBrandsSlider();
            mobileQuery.addEventListener('change', buildBrandsSlider);
        }
    } catch (e) {
        console.warn('Brands slider init error:', e);
    }

    try {
        const cookiePopup = document.getElementById('cookie-popup');
        const cookieAccept = document.getElementById('cookie-accept');
        if (cookiePopup && !localStorage.getItem('cookieConsent')) cookiePopup.hidden = false;
        cookieAccept?.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            if (cookiePopup) cookiePopup.hidden = true;
        });
    } catch (e) {
        console.warn('Cookie init error:', e);
    }

    try {
        const overlay = document.getElementById('popupOverlay');
        const content = document.getElementById('popupContent');
        const closeBtn = document.getElementById('popupClose');
        if (overlay && content) {
            const openersSel = ['#openPopupBtn', '#openPopupBtn2', '#openPopupBtn3', '#openPopupBtn4', '#openPopupBtnQuiz'];
            const openers = openersSel.map(s => document.querySelector(s)).filter(Boolean);
            const open = (e) => { e?.preventDefault();
                overlay.removeAttribute('hidden'); };
            const close = (e) => { e?.preventDefault();
                overlay.setAttribute('hidden', ''); };
            openers.forEach(b => b.addEventListener('click', open));
            closeBtn?.addEventListener('click', close);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) close(); });
        }
    } catch (e) {
        console.warn('Policy popup init error:', e);
    }

    const formOverlay = document.getElementById('formPopupOverlay');
    const formCloseBtn = document.getElementById('formPopupClose');
    const formTitleEl = document.getElementById('formPopupTitle');
    const formSubtitleEl = document.getElementById('formPopupSubtitle');
    const formTitleInput = document.getElementById('formPopupTitleInput');
    const formProductInput = document.getElementById('formPopupProductInput');

    window.openFormPopup = function(titleText, subtitleText = '', productName = '') {
        if (formTitleEl) formTitleEl.textContent = titleText;
        if (formTitleInput) formTitleInput.value = titleText;
        if (formSubtitleEl) {
            if (subtitleText) {
                formSubtitleEl.textContent = subtitleText;
                formSubtitleEl.style.display = 'block';
            } else {
                formSubtitleEl.textContent = '';
                formSubtitleEl.style.display = 'none';
            }
        }
        if (formProductInput) {
            formProductInput.value = productName;
        }
        formOverlay?.removeAttribute('hidden');
    };

    function closeFormPopup() {
        formOverlay?.setAttribute('hidden', '');
    }

    document.querySelectorAll('.js-open-form-popup').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const title = btn.getAttribute('data-title') || btn.textContent.trim();
            openFormPopup(title, '', '');
        });
    });

    formCloseBtn?.addEventListener('click', closeFormPopup);
    formOverlay?.addEventListener('click', (e) => {
        if (e.target === formOverlay) closeFormPopup();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && formOverlay && !formOverlay.hidden) {
            closeFormPopup();
        }
    });

   
   // КАТАЛОГ
    try {
    const catalog = document.querySelector('#catalog');
    const tabs = catalog?.querySelector('.catalog-tabs');
    const grid = catalog?.querySelector('.catalog-grid');

    if (!catalog || !tabs || !grid) {
        throw new Error('Не найдены элементы каталога');
    }

    const tabButtons = [...tabs.querySelectorAll('.tab-btn')];
    const cards = [...grid.querySelectorAll('.product-card')];

    const LEAVE_DURATION = 260; // длительность ухода карточек, мс
    const ENTER_DELAY = 70;     // задержка между появлением карточек, мс
    const LEAVE_DELAY = 35;     // задержка между исчезновением карточек, мс

    let isSwitching = false;
    let animationTimer = null;

    /**
     * Возвращает карточки выбранной категории.
     */
    function getCardsByCategory(category) {
        return cards.filter(card => card.dataset.category === category);
    }

    /**
     * Устанавливает активную вкладку.
     */
    function setActiveTab(activeButton) {
        tabButtons.forEach(button => {
            const isActive = button === activeButton;

            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', String(isActive));
        });
    }

    /**
     * Первичная фильтрация без анимации.
     */
    function showInitialCategory(category) {
        cards.forEach(card => {
            const isCurrentCategory = card.dataset.category === category;

            card.classList.toggle('is-hidden', !isCurrentCategory);
            card.classList.remove('is-entering', 'is-leaving');
        });
    }

    /**
     * Анимированное переключение категории.
     */
    function switchCategory(category) {
        clearTimeout(animationTimer);

        const visibleCards = cards.filter(
            card => !card.classList.contains('is-hidden')
        );

        const nextCards = getCardsByCategory(category);

        isSwitching = true;
        grid.classList.add('is-switching');

        // 1. Каскадно скрываем текущие карточки.
        visibleCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('is-leaving');
            }, index * LEAVE_DELAY);
        });

        const leaveTotalTime =
            LEAVE_DURATION + Math.max(0, visibleCards.length - 1) * LEAVE_DELAY;

        // 2. После завершения ухода скрываем старые и готовим новые.
        animationTimer = setTimeout(() => {
            cards.forEach(card => {
                const isNextCategory = card.dataset.category === category;

                card.classList.remove('is-leaving');

                if (!isNextCategory) {
                    card.classList.add('is-hidden');
                    return;
                }

                card.classList.remove('is-hidden');
                card.classList.add('is-entering');
            });

            // Браузер должен зафиксировать стартовое состояние is-entering.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    nextCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.remove('is-entering');
                        }, index * ENTER_DELAY);
                    });

                    const enterTotalTime =
                        LEAVE_DURATION +
                        Math.max(0, nextCards.length - 1) * ENTER_DELAY;

                    // Разрешаем следующее переключение после завершения анимации.
                    setTimeout(() => {
                        grid.classList.remove('is-switching');
                        isSwitching = false;
                    }, enterTotalTime);
                });
            });
        }, leaveTotalTime);
    }

    /**
     * Находим стартовую активную вкладку.
     * Можно сразу добавить class="is-active" первой кнопке в HTML,
     * но скрипт корректно сработает и без этого.
     */
    const initialTab =
        tabButtons.find(button => button.classList.contains('is-active')) ||
        tabButtons[0];

    if (initialTab) {
        const initialCategory = initialTab.dataset.category;

        setActiveTab(initialTab);
        showInitialCategory(initialCategory);
    }

    tabs.addEventListener('click', event => {
        const clickedTab = event.target.closest('.tab-btn');

        if (
            !clickedTab ||
            !tabs.contains(clickedTab) ||
            isSwitching ||
            clickedTab.classList.contains('is-active')
        ) {
            return;
        }

        setActiveTab(clickedTab);
        switchCategory(clickedTab.dataset.category);
    });
} catch (error) {
    console.warn('Catalog init error:', error);
}


// Квиз скрипт (без изменений)
document.addEventListener('DOMContentLoaded', function() {
    const quizBlock = document.getElementById('quiz-block') || document.querySelector('.quiz-section');
    if (!quizBlock) return;
    const steps = quizBlock.querySelectorAll('.quiz-step');
    const resultBlock = quizBlock.querySelector('.quiz-result');
    const progressFill = document.getElementById('progress-fill');
    const stepIndicators = quizBlock.querySelectorAll('.quiz-step-indicator');
    const progressContainer = document.getElementById('quiz-progress');
    const prevBtns = quizBlock.querySelectorAll('.btn-prev');
    const btnReset = document.getElementById('btn-reset-quiz');
    const recommendedTitle = document.getElementById('recommended-product-name');
    const recommendedDesc = document.getElementById('recommended-product-desc');
    const recommendedImage = document.getElementById('recommended-product-image');
    const quizForm = document.getElementById('quiz-form');
    const successMsg = document.getElementById('quiz-success-msg');
    const inputMaterial = document.getElementById('input-quiz-material');
    const inputCondition = document.getElementById('input-quiz-condition');
    const inputDiameter = document.getElementById('input-quiz-diameter');
    const inputRecommendation = document.getElementById('input-quiz-recommendation');
    let currentStep = 1;
    let quizData = { material: '', condition: '', diameter: '' };

    function getRecommendation(data) {
        if (data.condition && data.condition.includes('зима')) {
            return { name: 'ITH 410 Wi (зимний)', desc: 'Винилэстеровый состав для быстрых монтажных работ при отрицательных температурах (до -20°C).', image: 'images/products/ith-410-ve-winter.webp' };
        }
        if (data.material === 'Растянутая зона бетона' || data.condition === 'Алмазное бурение' || data.diameter === 'М24 и выше') {
            return { name: 'ITH 585 EPOXE', desc: 'Чистый эпоксидный состав для высочайших нагрузок, глубокой анкеровки и алмазного бурения.', image: 'images/products/ith-500-epox-bit-ex.webp' };
        }
        if (data.material === 'Кирпич' || data.material === 'Газобетон') {
            return { name: 'ITH 300 Pe (Полиэстер)', desc: 'Оптимальный экономичный состав для пустотелого кирпича, пеноблока и легких бетонов.', image: 'images/products/ith-300-pe.webp' };
        }
        if (data.condition === 'Мокрые отверстия') {
            return { name: 'ITH 410 Ve (Винилэстер)', desc: 'Устойчив к влаге и воде в отверстиях, повышенная химическая стойкость и надежность.', image: 'images/products/ith-410-ve.webp' };
        }
        return { name: 'ITH 410 Ve (Винилэстер)', desc: 'Универсальный и эффективный химический анкер для бетона и сложного монтажа.', image: 'images/products/ith-410-ve.webp' };
    }

    function goToStep(stepNum) {
        currentStep = stepNum;
        steps.forEach(function(step) {
            const stepIndex = parseInt(step.getAttribute('data-step'), 10);
            if (stepIndex === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        if (stepNum === 'result') {
            if (progressContainer) progressContainer.style.display = 'none';
            steps.forEach(function(step) { step.classList.remove('active'); });
            if (resultBlock) resultBlock.classList.add('active');
            const recommendation = getRecommendation(quizData);
            if (recommendedTitle) recommendedTitle.textContent = recommendation.name;
            if (recommendedDesc) recommendedDesc.textContent = recommendation.desc;
            if (recommendedImage) { recommendedImage.src = recommendation.image;
                recommendedImage.alt = recommendation.name; }
            if (inputMaterial) inputMaterial.value = quizData.material;
            if (inputCondition) inputCondition.value = quizData.condition;
            if (inputDiameter) inputDiameter.value = quizData.diameter;
            if (inputRecommendation) inputRecommendation.value = recommendation.name;
            return;
        }
        if (progressContainer) progressContainer.style.display = 'flex';
        if (resultBlock) resultBlock.classList.remove('active');
        const percent = (currentStep / 3) * 100;
        if (progressFill) progressFill.style.width = percent + '%';
        stepIndicators.forEach(function(ind) {
            const indStep = parseInt(ind.getAttribute('data-step-num'), 10);
            ind.classList.remove('active', 'completed');
            if (indStep === currentStep) ind.classList.add('active');
            else if (indStep < currentStep) ind.classList.add('completed');
        });
    }

    const optionBtns = quizBlock.querySelectorAll('.quiz-btn, .quiz-option');
    optionBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const parentStep = btn.closest('.quiz-step');
            if (!parentStep) return;
            const stepNum = parseInt(parentStep.getAttribute('data-step'), 10);
            parentStep.querySelectorAll('.quiz-btn, .quiz-option').forEach(function(option) { option.classList.remove('selected'); });
            btn.classList.add('selected');
            const field = btn.getAttribute('data-field');
            const value = btn.getAttribute('data-value') || btn.textContent.trim();
            if (stepNum === 1 || field === 'material') {
                quizData.material = value;
                setTimeout(function() { goToStep(2); }, 200);
                return;
            }
            if (stepNum === 2 || field === 'condition') {
                quizData.condition = value;
                setTimeout(function() { goToStep(3); }, 200);
                return;
            }
            if (stepNum === 3 || field === 'diameter') {
                quizData.diameter = value;
                setTimeout(function() { goToStep('result'); }, 200);
            }
        });
    });

    prevBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof currentStep === 'number' && currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
    });

    if (btnReset) {
        btnReset.addEventListener('click', function(e) {
            e.preventDefault();
            quizData = { material: '', condition: '', diameter: '' };
            optionBtns.forEach(function(btn) { btn.classList.remove('selected'); });
            if (quizForm) {
                quizForm.reset();
                const submitBtn = quizForm.querySelector('button[type="submit"]');
                if (submitBtn) { submitBtn.disabled = false;
                    submitBtn.textContent = 'Получить расчёт и КП'; }
            }
            if (successMsg) successMsg.style.display = 'none';
            const defaultRecommendation = getRecommendation(quizData);
            if (recommendedTitle) recommendedTitle.textContent = defaultRecommendation.name;
            if (recommendedDesc) recommendedDesc.textContent = defaultRecommendation.desc;
            if (recommendedImage) { recommendedImage.src = defaultRecommendation.image;
                recommendedImage.alt = defaultRecommendation.name; }
            goToStep(1);
        });
    }

    if (quizForm) {
        quizForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(quizForm);
            const submissionData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                material: quizData.material,
                condition: quizData.condition,
                diameter: quizData.diameter,
                recommendation: inputRecommendation ? inputRecommendation.value : ''
            };
            console.log('Данные квиза для отправки:', submissionData);
            if (successMsg) successMsg.style.display = 'block';
            const submitBtn = quizForm.querySelector('button[type="submit"]');
            if (submitBtn) { submitBtn.disabled = true;
                submitBtn.textContent = 'Отправлено!'; }
        });
    }
    goToStep(1);
});

// ==================== ИГНОРИРОВАНИЕ ОШИБОК ЗАГРУЗКИ ИЗОБРАЖЕНИЙ ====================
(function ignoreImageErrors() {
    /**
     * Заменяет src изображения на прозрачный пиксель, если оно ведёт на локальный файл
     * или если при загрузке произошла ошибка.
     */
    function setPlaceholder(img) {
        if (!img || img.tagName !== 'IMG') return;
        // Прозрачный 1x1 пиксель в формате GIF (base64)
        const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        if (img.src && img.src.startsWith('file:///')) {
            img.src = PLACEHOLDER;
        }
        // Добавляем обработчик ошибок на случай, если загрузка всё же провалится
        img.addEventListener('error', function onError(e) {
            e.stopPropagation(); // Предотвращаем всплытие, но это не скрывает консоль
            this.src = PLACEHOLDER;
            // Удаляем обработчик, чтобы избежать зацикливания
            this.removeEventListener('error', onError);
        });
    }

    // Обрабатываем все уже существующие изображения
    document.querySelectorAll('img').forEach(setPlaceholder);

    // Отслеживаем появление новых изображений (например, при динамической подгрузке)
    if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.tagName === 'IMG') {
                            setPlaceholder(node);
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll('img').forEach(setPlaceholder);
                        }
                    });
                }
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Дополнительно: перехватываем ошибки загрузки ресурсов (не обязательно, но может помочь)
    window.addEventListener('error', function(e) {
        if (e.target && e.target.tagName === 'IMG') {
            e.preventDefault();
            e.stopPropagation();
            // Если изображение уже не обработано, ставим заглушку
            if (e.target.src && !e.target.src.startsWith('data:')) {
                e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            }
            return false;
        }
    }, true); // Используем фазу захвата, чтобы перехватить до консоли

})(); 

