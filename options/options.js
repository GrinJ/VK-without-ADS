$(document).ready(function()
{
    var navItems = $('.admin-menu li > a');
    var navListItems = $('.admin-menu li');
    var allWells = $('.admin-content');
    var allWellsExceptFirst = $('.admin-content:not(:first)');
    
    allWellsExceptFirst.hide();
    navItems.click(function(e)
    {
        e.preventDefault();
        navListItems.removeClass('active');
        $(this).closest('li').addClass('active');
        
        allWells.hide();
        var target = $(this).attr('data-target-id');
        $('#' + target).show();
    });

    //Вызываем функцию, получающущю информацию о состоянии чекбоксах
    loadCheckboxes();

    //Вызывается при клике на кнопку "Добавить слово"
    $( "#add-word" ).click(function() {
        addWord();
    });

    //Вызывается при клике на кнопку "Отменить слово"
    $( "#cancel-word" ).click(function() {
        cancelWord();
    });

    //Вызывается при клике на кнопку "Отменить слово"
    $( "#save-word" ).click(function() {
        saveWord();
    });

    //Вызывается при клике на кнопку "Редактировать слово"
    $('body').on('click', 'button#editWord', function() {
        editWord($(this).attr("data"));
    });

    //Вызывается при клике на кнопку "Редактировать слово"
    $('body').on('click', 'button#deleteWord', function() {
        deleteWord($(this).attr("data"));
    });

    //Вызвается при изменении статуса любоко чекбокса
    $(":checkbox").on('change', function() {

        //Вызываем функцию для сохранения данных
        setCheckboxStatus(this.id, this.checked);
    });

    //Вызываем функцию добавления элементов в блок "Фильтр слов"
    getWords();

    //Вызываем функцию, выводящую номер версии
    printAppVersion();
});

//Устанавливаем состояние переключателей
function loadCheckboxes() {

    getCheckboxStatus("adv-recommend");
    getCheckboxStatus("adv-post");
    getCheckboxStatus("adv-left");
    getCheckboxStatus("adv-readmore");
}

//Получает информацию о состоянии чекбокса
function getCheckboxStatus(name) {

    //Загружаем информацию о состоянии чекбокса
    chrome.storage.local.get(name, function (result) {

        //Если есть информация в настройках
        if (result[name] == "unchecked") 
            $("#" + name).attr('checked', false);
        else
            $("#" + name).attr('checked', true);
    });
}

//Сохраняет информацию о состоянии чекбокса
function setCheckboxStatus(name, status) {

    //Получаем знчение
    var value = status ? "checked" : "unchecked";

    //Сохраняем значение в хранилище
    chrome.storage.local.set({[name]: value});
}

//Выгружает данные о словесных фильтрах из хранилища
var wordsObj;
function getWords() {

    //chrome.storage.local.clear();

    //Получаем данные о сохранненой информации
    chrome.storage.local.get('words', function (result) {
        //Получаем информацию о словах
        wordsList = result.words;

        //Проверим, есть ли в хранилище список слов
        if (typeof(wordsList) == "undefined") {
            wordsList = '{"words": ["Вступ(и|ите|ай|айте)", "Подпи(шись|саться|сывайся|шитесь)", "Репост", "Добав(ь|ьте|ляем|ляй|ляйтесь|лю|ляю|ляемся|ить)", "Прогнозы на спорт", "Смотреть подробнее", "Kylie Jenner", "Олим Трейд", "Заработ(ать|ывай|тай)", "Распродажа, здесь", "Розыгрыш", "(Сделай|За) репост", "Пере(йди|йдите|ходи|ходим|ходите) по ссылк", "Зака(жи|жите|зывай) сейчас", "Депозит", "Опцион", "Черная, блэк, маск(а|у), купить"]}';
        }

        //Читаем массив
        wordsObj = jQuery.parseJSON(wordsList);

        //Очищаем div со списком слов
        $("#words-list").empty();

        testObj = wordsObj.words;

        //Пробегаемся по всему полученному массиву
        $.each(wordsObj.words.reverse(), function(index, value){
            $("#words-list").append('<li class="list-group-item"> \
                                <div class="buttons-action"> \
                                    <button type="submit" class="btn btn-success" id="editWord" data="' + index + '"><span class="glyphicon glyphicon-edit"></span></button> \
                                    <button type="submit" class="btn btn-danger" id="deleteWord" data="' + index + '"><span class="glyphicon glyphicon-trash"></span></button> \
                                </div> \
                                ' + value + ' \
                            </li>');
        });
    });
}

//Добавляет новое слово в список
function addWord() {
    //Если что-то ввели в форму ввода
    if($("#new-word").val())
    {
        //Добавляем новое слово
        wordsObj.words.reverse().push($("#new-word").val());

        //Сохраняем значение
        chrome.storage.local.set({
            ['words']: JSON.stringify(wordsObj)
        });

        //Очищаем поле ввода
        $("#new-word").val("");

        //Отображаем новый список слов
        getWords();
    }
    else 
        alert('Пожалуйста, введите значение');
}

//Отменяет ввод нового слова
function cancelWord() {
    //Очищаем поле ввода
    $("#new-word").val("");

    //Меняем кнопки
    $("#add-word").show();
    $("#save-word").hide();
}

//Вызывается при клике на кнопку "Изменить"
function editWord(id) {

    //Задаем значение
    $("#new-word").val( wordsObj.words[id] );
    $("#edit-id").val( id );

    //Меняем значение кнопки
    $("#add-word").hide();
    $("#save-word").show();
}

//Вызывается пдля удаления элемента
function deleteWord(id) {

    //Создаем подтверждающее уведомление
    var message = confirm("Вы действительно хотите удалить объект \"" + wordsObj.words[id] + "\"");
    if (message == true) {
        //Удаляем данный элемент
        wordsObj.words.splice(id, 1);

        //Меняем массив местами
        wordsObj.words.reverse();

        //Сохраняем значение
        chrome.storage.local.set({
            ['words']: JSON.stringify(wordsObj)
        });

        //Отображаем новый список слов
        getWords();
    }
}

//Вызывается для сохранения измененного слова
function saveWord() {

    //Проверим, введены ли не пустые значения
    if($("#edit-id").val() && $("#new-word").val()) {

        //Меняем значение в массиве
        wordsObj.words[ parseInt($("#edit-id").val()) ] = $("#new-word").val();

        //Меняем массив местами
        wordsObj.words.reverse();

        //Сохраняем значение
        chrome.storage.local.set({
            ['words']: JSON.stringify(wordsObj)
        });

        //Очищаем поле ввода
        $("#new-word").val("");
        $("#edit-id").val("");

        //Меняем кнопки
        $("#add-word").show();
        $("#save-word").hide();

        //Отображаем новый список слов
        getWords();
    }
    else 
        alert('Невозможно сохранить пустое значение');
}

//Выводит номер версии приложения
function printAppVersion() {
    $(".version").html(chrome.runtime.getManifest().version);
}
