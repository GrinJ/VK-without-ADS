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

    //Создаем массив, в котором буем хранить информацию о том, какие блоки надо скрывать, а какие нет
    let hideObj = [];

    //Получаем информацию о состоянии всех чекбоксов
    getMainSettings(loadHideObj);

    //Вызываем главную функцию очистки ВК - вдруг мы уже на странице новостей
    clearPosts();

    //Следим за изменением body, вдруг лента пропала или только появилась при навигации
    let bodyObserver = new MutationObserver(function(mutations){
        mutations.map( function(mutation) {

            //Проверяем, появился ли блок с новостями в DOM
            if($(mutation.target).find("#main_feed").length) {

                //Пишем в лог
                Log('found the feed, starts working');

                //Запускаем функцию очистки
                clearPosts();

                //Запускаем еще одного наблюдателя
                observer.observe(document.getElementById("main_feed"), {attributes: true});
            }
        });
    });

    //Запускаем наблюдателя зя изменением body
    bodyObserver.observe(document.body, {'childList': true, 'subtree': true});

    //Запускаем наблюдателя
    let observer = new MutationObserver(function(mutations){
        mutations.forEach(function(mutation){
            //Пишем в лог
            Log("found some new posts");

            //Вызываем функцию очистки ВК
            clearPosts();
        });
    });

    //Обрабатывает данные, полученные из настроек
    function loadHideObj(settings) {
        $.each(settings, function(index, value) {
            getStringFromStorage(value, setHideObj);
        });
    }

    //Устанавливает значение перменным, ответственным за скрытие или показ блоков
    function setHideObj(name, value) {
        hideObj[name] = value != "unchecked";
    }

    //Очищает неугодные посты
    function clearPosts()
    {
        //Скрываем рекламные блок слева
        if(hideObj["adv-left"])
            $("#ads_left").remove();

        //Скрываем рекомендации в ленте
        if(hideObj["adv-recommend"])
            $(".ads_ads_news_wrap").remove();

        //Скрываем сообщения "Рекламная запись"
        if(hideObj["adv-post"])
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
})();