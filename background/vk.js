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

    //Массивы, в которых буем хранить фразы для проверки записей
    let wordsObj = [];
    let wordsRegex = [];

    //Получаем информацию о состоянии всех чекбоксов
    getMainSettings(loadHideObj);

    //Получаем словарь
    getWords();

    //Вызываем главную функцию очистки ВК - вдруг мы уже на странице новостей
    clearPosts();

    //Следим за изменением body, вдруг лента пропала или только появилась при навигации
    let bodyObserver = new MutationObserver(function(mutations){
        mutations.map( function(mutation) {

            //Проверяем, появился ли блок с новостями в DOM
            if($(mutation.target).find("#main_feed").length) {

                //Пишем в лог
                Log('found the feed, starts working');

                //Загружаем все регулярные выражения
                loadRegexp();

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

    //Выгружает данные о словесных фильтрах из хранилища
    function getWords() {

        //Пробегаемся по всем ключам
        $.each(["words", "url", "repost"], function(index, value) {
            getStringFromStorage(value, setWordsObj);
        });
    }

    //Устанавливает значение словарей
    function setWordsObj(key, result) {

        //Проверим, создался ли объект
        if (wordsObj[key] == undefined)
            wordsObj[key] = {};

        //Пробуем загрузить локалную базу данных
        jQuery.getJSON(chrome.extension.getURL("../data/data.json"), function (data) {

            //Проверим, есть ли в хранилище список слов
            if (typeof(result) != "undefined") {

                //Парсим в объект полученных из настроек данные
                wordsObj[key] = jQuery.parseJSON(result)[key];
            }
            else
                wordsObj[key] = data[key];
        });
    }

    //Загружает данные о регулярных выражениях
    function loadRegexp() {
        $.each(["words", "url", "repost"], function(index, value) {
            wordsRegex[value] = wordsObj[value] != "" ? new RegExp(buildRegexp(value), 'ig') : undefined;
        });
    }

    //Строит регулярные выражения
    function buildRegexp(key) {

        //Делаем замену в каждом элементе массива и возвращаем как строку
        return wordsObj[key].map(function(x){
            if(x != "") {
                x = x.includes(",") ? "(?=.*" + x.replace(/,( |)/g, ")(?=.*") + ")" : x;

                //Делаем замену слешей для ссылок
                return x.replace(/\//g, "\\/");
            }
            else
                return "filter has empty value";
        }).join("|");
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

        //Если массив с фильтрами был создан и заполнен
        if (wordsRegex != []) {

            //Пробежимся по всем найденным постам, которые еще не обрабатывали до этого
            $(document).find(".feed_row_unshown,.feed_row").not("filter-checked").each(function () {

                //Флаг, отвечающий за то, нужно ли скрыть текущий блок или нет
                let shouldHide = false;

                //Проверим, является ли этот пост рекламой в сообществе
                if (!shouldHide && hideObj["adv-wall"]) {

                    //Если пристуствует элемент в надписью "Реклама в сообществе"
                    if ($(this).find(".wall_marked_as_ads").length) {
                        shouldHide = true;
                    }
                }

                //Получаем содержимое текста новости
                let wallText = $(this).find(".wall_text");

                //Проверим, соответствует ли текст записи введенным параметрам
                if(!shouldHide && wordsRegex["words"] != "" && wordsRegex["words"] != undefined) {

                    //Если удалось найти текст в данной записи
                    if(wallText.length) {
                        //Проверяем на соответствие фильтру пользователя
                        if(wordsRegex["words"].test(wallText.text()))
                            shouldHide = true;
                    }
                }

                //Проверим валидность ссылок, если они вообще присутствуют
                if(!shouldHide && wordsRegex["url"] != "" && wordsRegex["url"] != undefined) {

                    //Пробегаемся по всем найденным ссылкам, если их нет - код не выполнится
                    $.each(wallText.find("a"), function() {
                        if (wordsRegex["url"].test($(this).text()) || wordsRegex["url"].test(this.href)) {

                            //Устанавливаем значение флага
                            shouldHide = true;

                            //Выходим из цикла
                            return false;
                        }
                    });
                }

                //Проверим наличие репостов в данной записи
                if(!shouldHide && wordsRegex["repost"] != "" && wordsRegex["repost"] != undefined) {

                    //Если в записи пристутствует репост какой-либо другой записи
                    if(wallText.find(".copy_quote").length) {
                        //Получаем элемент, содержащий автора записи
                        let author = $(this).find(".author");

                        //Проверяем на соответствие фильтру
                        if(wordsRegex["repost"].test("https://vk.com" + author.attr('href')) || wordsRegex["repost"].test(author.text()))
                            shouldHide = true;
                    }
                }

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
    }
})();