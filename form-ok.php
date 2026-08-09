
<!DOCTYPE html>
<html lang="ru">
<head>
  
    <meta charset="UTF-8">
    <title>Спасибо!</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
body {
    color: #313E47;
    font-family: Arial;
    text-align: center;
    background: url(body.jpg) repeat;
    padding-top: 60px;
}
h2 {    
    font-size: 36px;
    font-weight: 700;
    line-height: 44px;    
    text-transform: uppercase;
}
h3 {
	color:#464646;
    font-size: 32px; 	
}
.success {
	font-size: 21px;
	line-height: 1.4em;
}

.shiny-button {
	display: inline-block;
    text-transform: uppercase;
    text-decoration: none;
    font-family: sans-serif;
    color: #FFFFFF;
    border-radius: 10px;
    padding: 15px 30px 12px 30px;
    background: #2774E9;
    letter-spacing: 1px;
    font-size: 16px;
}

.shiny-button:hover {
      background: #4790ff;
}

@media (max-width: 900px)  {
body {
	padding-top: 20px;
}
h2 {
	font-size: 23px;
	line-height: 33px;
}
.success {
	font-size: 17px;
    line-height: 1.5em;
}
h3 {
	font-size: 21px;
}	
	
}

 @media screen and (min-width: 768px){
   .rwd-break { display: none; }
}
</style>
<script src="js/jquery-3.3.1.min.js"></script>
  <!-- Top.Mail.Ru counter -->

<script type="text/javascript">

var _tmr = window._tmr || (window._tmr = []);

_tmr.push({id: "3425244", type: "pageView", start: (new Date()).getTime()});

(function (d, w, id) {

if (d.getElementById(id)) return;

var ts = d.createElement("script"); ts.type = "text/javascript"; ts.async = true; ts.id = id;

ts.src = "https://top-fwz1.mail.ru/js/code.js";

var f = function () {var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ts, s);};

if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }

})(document, window, "tmr-code");
_tmr.push({ type: 'reachGoal', id: 3425244, goal: 'sand_lead'});
</script>

<noscript><div><img src="https://top-fwz1.mail.ru/counter?id=3425244;js=na" style="position:absolute;left:-9999px;" alt="Top.Mail.Ru" /></div></noscript>

<!-- /Top.Mail.Ru counter -->
<!-- Top.Mail.Ru counter -->

<script type="text/javascript">

var _tmr = window._tmr || (window._tmr = []);

_tmr.push({id: "3468843", type: "pageView", start: (new Date()).getTime()});

(function (d, w, id) {

if (d.getElementById(id)) return;

var ts = d.createElement("script"); ts.type = "text/javascript"; ts.async = true; ts.id = id;

ts.src = "https://top-fwz1.mail.ru/js/code.js";

var f = function () {var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ts, s);};

if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }

})(document, window, "tmr-code");
_tmr.push({ type: 'reachGoal', id: 3468843, goal: 'send_lead'});

</script>

<noscript><div><img src="https://top-fwz1.mail.ru/counter?id=3468843;js=na" style="position:absolute;left:-9999px;" alt="Top.Mail.Ru" /></div></noscript>

<!-- /Top.Mail.Ru counter -->
</head>
<body>
  
  
	<div class="main">
		<img src="index.png">
		<h2>Спасибо!<br class="rwd-break"> Ваша заявка принята!</h2>
		<p class="success">В ближайшее время мы с Вами свяжемся. <br>Пожалуйста, включите ваш контактный телефон.</p>
		<!--<h3>Спасибо что выбрали нас!</h3>	-->	
		<a href="" class="shiny-button" onclick="history.back();return false;"><strong>Вернуться на сайт</strong></a>
    </div>  
    <!-- calltouch -->
    <script>
      (function (w, d, n, c) {
        w.CalltouchDataObject = n;
        w[n] = function () {
          w[n]['callbacks'].push(arguments);
        };
        if (!w[n]['callbacks']) {
          w[n]['callbacks'] = [];
        }
        w[n]['loaded'] = false;
        if (typeof c !== 'object') {
          c = [c];
        }
        w[n]['counters'] = c;
        for (var i = 0; i < c.length; i += 1) {
          p(c[i]);
        }
        function p(cId) {
          var a = d.getElementsByTagName('script')[0],
            s = d.createElement('script'),
            i = function () {
              a.parentNode.insertBefore(s, a);
            },
            m = typeof Array.prototype.find === 'function',
            n = m ? 'init-min.js' : 'init.js';
          s.async = true;
          s.src = 'https://mod.calltouch.ru/' + n + '?id=' + cId;
          if (w.opera == '[object Opera]') {
            d.addEventListener('DOMContentLoaded', i, false);
          } else {
            i();
          }
        }
      })(window, document, 'ct', 'pkldafgr');
    </script>
		<script type="text/javascript">
      $(document).ready(function () {
        $(document).on('click', 'button[type="submit"]', function () {
          var m = jQuery(this).closest('form');
          var phone = m.find('input[type="tel"]').val();
          if (!!phone) {
            var phone_ct = phone.replace(/[^0-9]/gim, '');
            if (phone_ct != '') {
              if (phone_ct[0] == '8') {
                phone_ct = phone_ct.substring(1);
              }
              if (phone_ct[0] == '7') {
                phone_ct = phone_ct.substring(1);
              }
              phone_ct = '7' + phone_ct;
              window.ctw.createRequest(
                'form_site',
                phone_ct,
                [],
                function (success, data) {
                  console.log(success, data);
                }
              );
            }
          }
        });
      });
    </script>
    <!-- calltouch -->
</body>
</html>