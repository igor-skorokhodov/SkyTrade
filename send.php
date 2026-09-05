<?php
/**
 * Обработчик отправки формы заявки (AJAX)
 * Ожидает POST-запрос с полями: name, phone, title, form_title, product_id, product_name, form_name
 * Дополнительно могут быть quiz_* поля.
 * Возвращает JSON: { success: bool, message: string }
 */

// Настройки
$toEmail = 'i.vlad.sk@xmail.ru'; // замените на ваш email
$subjectPrefix = 'Заявка с сайта Скай Трейд';

// Проверяем, что запрос POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешён']);
    exit;
}

// Получаем данные
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$title = isset($_POST['title']) ? trim($_POST['title']) : '';
$formTitle = isset($_POST['form_title']) ? trim($_POST['form_title']) : '';
$productId = isset($_POST['product_id']) ? trim($_POST['product_id']) : '';
$productName = isset($_POST['product_name']) ? trim($_POST['product_name']) : '';
$formName = isset($_POST['form_name']) ? trim($_POST['form_name']) : '';

// Дополнительные поля квиза (если есть)
$quizMaterial = isset($_POST['quiz_material']) ? trim($_POST['quiz_material']) : '';
$quizCondition = isset($_POST['quiz_condition']) ? trim($_POST['quiz_condition']) : '';
$quizDiameter = isset($_POST['quiz_diameter']) ? trim($_POST['quiz_diameter']) : '';
$quizRecommendation = isset($_POST['quiz_recommendation']) ? trim($_POST['quiz_recommendation']) : '';

// Валидация обязательных полей
$errors = [];
if (empty($name)) {
    $errors[] = 'Имя обязательно для заполнения';
}
if (empty($phone)) {
    $errors[] = 'Телефон обязателен для заполнения';
} elseif (!preg_match('/^[\+\d\(\)\s\-]{7,20}$/', $phone)) {
    // Проверка на допустимые символы (нестрогая)
    $errors[] = 'Введите корректный номер телефона';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Формируем письмо
$subject = $subjectPrefix;
if (!empty($formTitle)) {
    $subject .= ' — ' . $formTitle;
}

$message = "Поступила новая заявка с сайта.\n\n";
$message .= "Имя: $name\n";
$message .= "Телефон: $phone\n";

if (!empty($formTitle)) {
    $message .= "Тема заявки: $formTitle\n";
}
if (!empty($formName)) {
    $message .= "Тип формы: $formName\n";
}
if (!empty($productName)) {
    $message .= "Товар: $productName (ID: $productId)\n";
}
if (!empty($title)) {
    $message .= "Доп. заголовок: $title\n";
}

// Данные квиза
$quizData = [];
if (!empty($quizMaterial)) $quizData[] = "Материал основания: $quizMaterial";
if (!empty($quizCondition)) $quizData[] = "Условия монтажа: $quizCondition";
if (!empty($quizDiameter)) $quizData[] = "Диаметр: $quizDiameter";
if (!empty($quizRecommendation)) $quizData[] = "Рекомендация: $quizRecommendation";
if (!empty($quizData)) {
    $message .= "\n--- Данные квиза ---\n";
    $message .= implode("\n", $quizData) . "\n";
}

// Заголовки письма
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/plain; charset=utf-8\r\n";
$headers .= "From: Сайт Скай Трейд <no-reply@sky-trade.ru>\r\n";
$headers .= "Reply-To: $name <$toEmail>\r\n"; // можно указать email клиента, если есть

// Отправка
$mailSent = mail($toEmail, $subject, $message, $headers);

if ($mailSent) {
    echo json_encode(['success' => true, 'message' => 'Заявка успешно отправлена!']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка при отправке письма. Попробуйте позже.']);
}

