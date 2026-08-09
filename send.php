<?php
ini_set('display_errors', 'On');
date_default_timezone_set('Europe/Moscow');

$thanks_file = 'form-ok.php';
$phone = trim($_REQUEST['phone']);
if (strlen($phone) > 11 ) {	
	try {

		$name = trim($_REQUEST['name']);

		$title = trim($_REQUEST['title']);
		$comment = trim($_REQUEST['comment']);
		$form_name = trim($_REQUEST['form_name']);
		$form_type_model_name = trim($_REQUEST['form_type_model_name']);
		$form_diler = trim($_REQUEST['form_diler']);
		$marka = trim($_REQUEST['marka']);
		$model = trim($_REQUEST['model']);
		$year = trim($_REQUEST['year']);
		$range_first_pay = trim($_REQUEST['range_first_pay']);
		$range_period = trim($_REQUEST['range_period']);
		
        $ip = $_SERVER['REMOTE_ADDR'];
		
		$site = $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URL']);

		
		$from = array('noreply@' . $site);
		$to = file(__DIR__ . '/email.cnf');
		$to = array_map('trim', $to);
		$subject = 'Новый заказ с сайта ' . $site;
		$message = 'Поступил новый заказ с сайта ' . $site . ':
			<table>
				<tr>
					<td><b>Дата:</b></td>
					<td>' . date('d.m.Y H:i') . '</td>
				</tr>';
      		if($name != '') {
				$message .= '<tr>
					<td><b>Имя:</b></td>
					<td>' . $name . '</td>
				</tr>';
			}	
			if($phone != '') {
				$message .= '<tr>
					<td><b>Телефон:</b></td>
					<td>' . $phone . '</td>
				</tr>';
			}
			if($title != '') {
				$message .= '<tr>
					<td><b>Форма:</b></td>
					<td>' . $title . '</td>
				</tr>';
			}
			if($comment != '') {
				$message .= '<tr>
					<td><b>comment:</b></td>
					<td>' . $comment . '</td>
				</tr>';
			}			
			if($form_type_model_name != '') {
				$message .= '<tr>
					<td><b>form_type_model_name:</b></td>
					<td>' . $form_type_model_name . '</td>
				</tr>';
			}
			if($form_diler != '') {
				$message .= '<tr>
					<td><b>form_diler:</b></td>
					<td>' . $form_diler . '</td>
				</tr>';
			}
			if($marka != '') {
				$message .= '<tr>
					<td><b>Марка:</b></td>
					<td>' . $marka . '</td>
				</tr>';
			}
			if($model != '') {
				$message .= '<tr>
					<td><b>Модель:</b></td>
					<td>' . $model . '</td>
				</tr>';
			}
			if($year != '') {
				$message .= '<tr>
					<td><b>Год:</b></td>
					<td>' . $year . '</td>
				</tr>';
			}
			if($range_first_pay != '') {
				$message .= '<tr>
					<td><b>Первоначальный взнос:</b></td>
					<td>' . $range_first_pay . '</td>
				</tr>';
			}
			if($range_period != '') {
				$message .= '<tr>
					<td><b>Срок кредита, мес:</b></td>
					<td>' . $range_period . '</td>
				</tr>';
			}
     		if($ip != '') {
				$message .= '<tr>
					<td><b>IP address:</b></td>
					<td>' . $ip . '</td>
				</tr>';
			}
						
	    $message .= '</table>';				
		
		$headers = "MIME-Version: 1.0\r\n";
		$headers .= "Content-type: text/html; charset=utf-8\r\n";
		$headers .= "From: " . implode(',', $from) . "\r\n";

		$result = mail(implode(',', $to), $subject, $message, $headers);
		
		if($result) {
			header('Location: ' . $thanks_file);
		}
		else {
			echo 'Ошибка';
		}
	}
	catch(Exception $e) {
		echo 'Ошибка';
	}
}