/*
 * Главный фоновый модуль VK without ADS.
 *
 * Copyright 2011 - 2017 EasyCoding Team (ECTeam).
 * Copyright 2005 - 2017 EasyCoding Team.
 *
 * Лицензия: GPL v3 (см. файл LICENSE).
 * Лицензия контента: Creative Commons 3.0 BY.
 *
 * Запрещается использовать этот файл при использовании любой
 * лицензии, отличной от GNU GPL версии 3 и с ней совместимой.
 *
 * Официальный блог EasyCoding Team: http://www.easycoding.org/
 * Официальная страница проекта: http://www.easycoding.org/projects/vkwithoutads
 *
 * Более подробная инфорация о программе в readme.txt,
 * о лицензии - в LICENSE.
 */

(function (){
 
	//Вызываем главную функцию очистки ВК
	clearPosts();

	//Запускаем наблюдателя
	var observer = new MutationObserver(function(mutations){
	    mutations.forEach(function(mutation){
	    	//Пишем в лог
	    	Log("found some new posts");

	    	//Вызываем функцию очистки ВК
	        clearPosts();
	    });
	});

	//Запускаем ожидание появления блока с новостями на странице, так как у ВК свя межстраничная навигация
	waitForElementToDisplay("#main_feed", 50);	

	//Функция, которая запустит обозревателя при появлении нужного элемента
	function waitForElementToDisplay(selector, time) {

		//Если нужный элемент появился на странице
        if(document.querySelector(selector) != null) {

        	//Получаем объект
			var myElement = document.getElementById("main_feed");

        	//Запускаем обозревателя
			observer.observe(myElement, {attributes: true});

			//Пишем данные в лог
            Log("feed appears in html let's start");

            //Выходим из функции
            return;
        }
        else {
        	//Иначе ждем
            setTimeout(function() {
                waitForElementToDisplay(selector, time);
            }, time);
        }
    }
	 
    //Очищает неугодные посты
	function clearPosts()
	{
		//Скрываем рекламные блок слева
		$("#ads_left").remove();

		//Скрываем рекомендации в ленте
		$(".ads_ads_news_wrap").remove();

		//Скрываем сообщения "Рекламная запись"
		$("[data-ad]").remove();


		var myStringArray = ["Hello","World"];

		//Пробежимся по всем найденным постам
		$(document).find(".feed_row_unshown,.feed_row").not("filter-checked").each(function(){

			//Отвечает за то, нужно ли скрыть текущий блок или нет
			var shouldHide = false;

			//Проверим, является ли этот пост рекламой в сообществе
			if (!shouldHide) {

				if ($(this).find(".wall_marked_as_ads").length) {
					//$(this).find("div.page_block").css("background-color", "red");
					shouldHide = true;
				}
			}
			
			//test = $(this).find("div.page_block");

			//test.css( "background-color", "blue" );

			/*if($(this).text().indexOf("ГУМ") != -1) {
			//	$(this).remove();
			
				test = $(this).find("div.page_block");

				console.log(test);

				test.css( "background-color", "red" );
			}*/

			//Проверим, надо ли удалить скрыть этот блок - если надо - скрываем
			if (shouldHide)
				//$(this).remove();
				$(this).find("div.page_block").css("background-color", "red");
			else
				$(this).find("div.page_block").css("background-color", "blue");

			//Добавляем в конце особый класс, чтобы не проверять одни и те же блоки по несколько раз
			$(this).addClass("filter-checked");

		});
	} 

	

	/*/Вызываем предварительную очистку ленты
	clearPosts();

	//Детекируем добавление новых постов в ленте
	$("#main_feed").on('DOMNodeInserted', function(e) {
	    if ( $(e.target).hasClass('feed_row') || $(e.target).hasClass('feed_row_unshown') ) {
	       //element with .MyClass was inserted.
	       console.log('added new post');

	       //И вызываем функцию очистки постов
	       clearPosts();
	    }
	});	
	
	//Вызовем функцию очистки от рекламы при клике на любую ссылку, тк ВК на самом деле не делает переадресацию в общепринятом смысле
	/*$( "a" ).click(function() {
	  clearPosts();
	});

	//Проверяем не изменился ли адрес в адресной строке
	var loc = window.location.href;
	setInterval(function() {

		if (loc != window.location.href) {
			//console.log("href changed");

			console.log($(document).find("#main_feed").length);

			if ($(document).find("#main_feed").length) {

				console.log("feed found");

				//console.log($("#main_feed").text());
				

				clearPosts();

				//Сохраняем новое значение адресной строки
				loc = window.location.href;
			}
		}
	}, 50);
	*/


	/*$("#main_feed").bind("DOMSubtreeModified", function() {
	    console.log("tree changed");

	});*/

	/*var targetNodes         = $("#main_feed");
	var MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
	var myObserver          = new MutationObserver (mutationHandler);
	var obsConfig           = { childList: true, characterData: true, attributes: true, subtree: true };

	//--- Add a target node to the observer. Can only add one node at a time.
	targetNodes.each ( function () {
	    myObserver.observe (this, obsConfig);
	} );

	function mutationHandler (mutationRecords) {
	    //console.info ("mutationHandler:");

	    

	    mutationRecords.forEach ( function (mutation) {
	        //console.log (mutation.type);

	        if (typeof mutation.removedNodes == "object") {
	            var jq = $(mutation.removedNodes);
	            //clearPosts();
	            //console.log (jq);
	            //console.log (jq.is("span.myclass2"));
	            //console.log (jq.html() );
	        }
	    } );
	}


	//$('body').hide();

	//Создаем объект, за которым будем следить
	var target = document.querySelector("#feed_wall");

	//Создаем объект наблюдателя
	var MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
	var observer = new MutationObserver (newPostsInFeed);

	//Настраиваем наблюдателя
	observer.observe(target, {childList: true, characterData: true, attributes: true, subtree: true} );

	//Вызывается при изменении DOM
	function newPostsInFeed(mutations)
	{
		mutations.forEach(function(mutation) {
			if (typeof mutation.removedNodes == "object") {
				var jq = $(mutation.removedNodes);
				console.log(jq.contains("feed_row"));
			}
        	//console.log(mutation.addedNodes);
    	});   
	}

	// Этот observer будет следить за добавлением аудиозаписей в найденные списки аудиозаписей
	var trackObserver = new MutationObserver(listModified);

	//alert('test');

	// Первоначально, проверим, не существуют ли уже списки аудиозаписей на странице
	var list_ids = ['pad_playlist', 'pad_search_list', 'initial_list', 'search_list', 'choose_audio_rows'];
	for (var i= 0 ; i < list_ids.length; i++)
	{
		var list = document.getElementById(list_ids[i]);
		if (list)
		{
			// добавим ссылки "Скачать" ко всем записям, и будем следить за изменениями с помощью trackObserver
			listFound(list);
		}
	}
	// отдельно ищем результат поиска аудиозаписей, потому что там нужно проверить css класс
	list = document.getElementById('results');
	if (list && list.classList.contains('audio_results'))
	{
		listFound(list);
	}

	// Создадим observer для нотификаций о создании новых элементов на странице
	var listObserver = new MutationObserver(elementAdded);
	// и следим за body, когда новые списки аудиозаписей добавятся
	listObserver.observe(document.body, {childList: true, subtree: true});

	// вызывается при любой модификации DOM страницы
	function elementAdded(mutations)
	{
		//alert(mutations);

		for (var i = 0; i < mutations.length; i++)
		{
			var added = mutations[i].addedNodes;
			// просмотрим добавленные элементы на предмет списка аудиозаписей
			for (var j = 0; j < added.length; j++)
			{
				findAudioLists(added[j]);
			}
		}
	}

	// рекурсивная функция проходит по добавленным элементам и ищет в них списки аудиозаписей
	function findAudioLists(node)
	{
		if (node.id)	// у списка должно быть id
		{
			for (var i = 0; i < list_ids.length; i++)	// смотрим, совпадает ли id с искомыми
			{
				if (list_ids[i] == node.id)
				{
					listFound(node);
					return;	// не будем искать внутри уже найденного списка
				}
			}
			if (node.id == 'results')	// отдельно будем искать '#results.audio_results' - результаты поиска
			{
				if (node.classList.contains('audio_results'))
				{
					listFound(node);
					return;
				}
			}
		}
		// пройдемся по дереву добавленного элемента
		var child = node.firstElementChild;
		while (child)
		{
			findAudioLists(child);	// вызываем рекурсивно для всех дочерних элементов
			child = child.nextElementSibling;
		}
	}

	// найден один из списков, в котором содержатся аудиозаписи
	function listFound(listNode)
	{
		if (listNode.children.length)	// в новом списке уже есть аудиозаписи
		{
			for (var j = 0; j < listNode.children.length; j++)
			{
				addDownloadLink(listNode.children[j]);	// добавим в каждую по ссылке "Скачать"
			}
		}
		trackObserver.observe(listNode, {childList: true});	// следим за добавлением новых записей -> listModified()
	}

	// вызывается, когда в список песен добавляются (или удаляются) элементы
	function listModified(mutations)
	{
		for (var i = 0; i < mutations.length; i++)
		{
			var mut = mutations[i];
			// пройдем по добавленным песням
			for (var j = 0; j < mut.addedNodes.length; j++)
			{
				addDownloadLink(mut.addedNodes[j]);
			}
			// удаленныые записи - mut.removedNodes игнорируем
		}
	}

	// Добавляет ссылку "Скачать" к разметке песни
	function addDownloadLink(row)
	{
		// новый элемент-аудиозапись может иметь различную разметку, в зависимости от того, куда добавляется
		if (!row.classList.contains('audio'))
		{
			// возможно, это элемент из списка "Прикрепить аудиозапись"
			row = row.querySelector('div.audio');	// внутри него содержится 'div.audio', с которым мы будем работать
			if (!row)
			{
				return;
			}
		}
		var titleNode = row.querySelector('div.title_wrap');	// Исполнитель песни + название
		if (!titleNode)	// если ничего не находим - выйдем (может, разметка была изменена?)
		{
			return;
		}
		// может, наша ссылка уже есть? Так бывает, если вконтакте перемещает список из одного элемента в другой
		if (titleNode.querySelector('a.downloadLink'))
		{
			return;	// ссылка уже была добавлена ранее
		}
		var input = row.querySelector('div.play_btn > input');	// найдем input, в котором хранится url
		if (!input)
		{
			input = row.querySelector('div.play_btn_wrap + input');	// проверим другой способ разметки
			if (!input)
			{
				return;	// не та разметка
			}
		}
		var ref = input.getAttribute('value');	// сам URL
		ref = ref.substr(0, ref.indexOf('?'));	// обрежем все после '?', чтобы оставить только ссылку на mp3

		var link = document.createElement('a');
		link.className = 'downloadLink';	// Добавим класс 'downloadLink' для нашей ссылки
		link.textContent = "^";
		link.setAttribute('title', "Скачать");
		link.setAttribute('download', titleNode.textContent + '.mp3');	// Имя файла для загрузки
		link.setAttribute('href', ref);
		link.addEventListener('click', function(event){	// при клике на нашу ссылку, отменим запуск проигрывателя
			event.stopPropagation();
		});
		titleNode.appendChild(link);
	}*/

})();