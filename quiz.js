/**
 * Исправленный и рабочий скрипт квиза подбора химических анкеров SkyTrade
 */
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
                name: 'ITH 410 Ve Winter (Зимний)',
                desc: 'Винилэстеровый состав для быстрых монтажных работ при отрицательных температурах (до -20°C).'
            };
        }

        // Высокие нагрузки / Алмазное бурение / Большой диаметр / Растянутая зона
        if (data.material === 'Растянутая зона бетона' || data.condition === 'Алмазное бурение' || data.diameter === 'М24 и выше') {
            return {
                name: 'ITH 500 EPOX / BIT-EX',
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
