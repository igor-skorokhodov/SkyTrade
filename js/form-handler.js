/**
 * Обработчик отправки формы заявки через AJAX
 * Использует FormData для сбора всех полей
 * Отправляет данные на send.php и обрабатывает ответ
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('universalLeadForm');
    if (!form) return;

    // Элементы для обратной связи
    const submitBtn = document.getElementById('formPopupSubmit');
    const statusEl = document.getElementById('formPopupStatus');
    const closeBtn = document.getElementById('formPopupClose');

    // Функция для отображения статуса
    function setStatus(message, isSuccess = false) {
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.style.color = isSuccess ? 'green' : 'red';
            statusEl.style.display = 'block';
        }
    }

    // Функция очистки статуса
    function clearStatus() {
        if (statusEl) {
            statusEl.textContent = '';
            statusEl.style.display = 'none';
        }
    }

    // Обработчик отправки
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Проверяем обязательные чекбоксы (они уже требуют checked, но на всякий случай)
        const privacyCheck = form.querySelector('input[name="privacy_policy"]');
        const consentCheck = form.querySelector('input[name="personal_data_consent"]');
        if (!privacyCheck.checked || !consentCheck.checked) {
            setStatus('Пожалуйста, примите условия Политики и дайте согласие на обработку данных.', false);
            return;
        }

        // Отключаем кнопку, чтобы избежать повторных кликов
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';
        }

        // Собираем данные формы
        const formData = new FormData(form);

        // Добавляем дополнительные данные, если нужно (например, заголовок из попапа)
        const titleInput = document.getElementById('formPopupTitleInput');
        if (titleInput && titleInput.value) {
            formData.append('title', titleInput.value);
        }

        // Отправка AJAX
        fetch('send.php', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setStatus(data.message, true);
                    // Очищаем форму через некоторое время и закрываем попап
                    setTimeout(() => {
                        form.reset();
                        clearStatus();
                        // Закрыть попап (найти оверлей и скрыть)
                        const overlay = document.getElementById('formPopupOverlay');
                        if (overlay) overlay.hidden = true;
                    }, 2500);
                } else {
                    setStatus(data.message || 'Ошибка отправки. Попробуйте ещё раз.', false);
                }
            })
            .catch(error => {
                console.error('Ошибка fetch:', error);
                setStatus('Произошла ошибка связи с сервером. Проверьте соединение.', false);
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Отправить заявку';
                }
            });
    });

    // Очистка статуса при закрытии попапа (если закрывается)
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            clearStatus();
            // Если нужно сбросить disabled кнопки, делаем
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Отправить заявку';
            }
        });
    }

    // Также очищаем статус при открытии попапа (можно добавить в функцию открытия)
    // Но здесь мы не управляем открытием, поэтому оставляем как есть.
});