/*
 * Модуль настроек расширения VK without ADS.
 *
 * Copyright 2011 - 2017 EasyCoding Team (ECTeam).
 * Copyright 2005 - 2017 EasyCoding Team.
 *
 * Лицензия: GPL v3 (см. файл LICENSE.txt).
 * Лицензия контента: Creative Commons 3.0 BY.
 *
 * Запрещается использовать этот файл при использовании любой
 * лицензии, отличной от GNU GPL версии 3 и с ней совместимой.
 *
 * Официальный блог EasyCoding Team: http://www.easycoding.org/
 * Официальная страница проекта: http://www.easycoding.org/projects/vkwithoutads
 *
 * Более подробная инфорация о программе в readme.txt,
 * о лицензии - в LICENSE.txt.
 */

//Вызывает все необходимые функции в начале загрузки страницы
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

    //Вызываем функцию добавления элементов в блок "Фильтр слов"
    getWords();

    //Вызываем функцию, выводящую номер версии
    printAppVersion();
});

//Перехватывает все нажатия на кнопки
$(document).ready(function () {

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
});

//Устанавливаем состояние переключателей
function loadCheckboxes() {

    $.each(["adv-recommend", "adv-post", "adv-left", "adv-readmore"], function(index, value) {
        getStringFromStorage(value, getCheckboxStatus);
    });
}

//Изменяет состояние чекбоксов
function getCheckboxStatus(name, value) {

    //Если есть информация в настройках
    if (value == "unchecked")
        $("#" + name).attr('checked', false);
    else
        $("#" + name).attr('checked', true);
}

//Сохраняет информацию о состоянии чекбокса
function setCheckboxStatus(name, status) {

    //Получаем знчение
    var value = status ? "checked" : "unchecked";

    //Сохраняем значение в хранилище
    saveStringToStorage(name, value);
}

//Выгружает данные о словесных фильтрах из хранилища
var wordsObj;
function getWords(key = 'words') {

    //chrome.storage.local.clear();

    //Получаем данные о сохранненой информации
    chrome.storage.local.get(key, function (result) {

        //Получаем информацию о сохраненных словах
        wordsList = result.words;

        //Пробуем загрузить локалную базу данных
        jQuery.getJSON("../data/data.json", function (data) {

            //Проверим, есть ли в хранилище список слов
            if (typeof(wordsList) != "undefined") {

                //Парсим в объект полученных из настроек данные
                wordsObj = jQuery.parseJSON(wordsList);
            }
            else
                wordsObj = data;

            //Вызываем функцию, отображающую данные
            displayData(key, wordsObj);
        });
    });
}

//Отображает полученные данные
function displayData(key, data) {
    //Очищаем div со списком слов
    $("#words-list").empty();

    //Пробегаемся по всему полученному массиву и добавляем элементы
    $.each(wordsObj[key].reverse(), function(index, value){
        $("#" + key + "-list").append('<li class="list-group-item"> \
                                <div class="buttons-action"> \
                                    <button type="submit" class="btn btn-success" id="editWord" data="' + index + '"><span class="glyphicon glyphicon-edit"></span></button> \
                                    <button type="submit" class="btn btn-danger" id="deleteWord" data="' + index + '"><span class="glyphicon glyphicon-trash"></span></button> \
                                </div> \
                                ' + value + ' \
                            </li>');
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
        saveJSONToStorage('words', wordsObj);

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
        saveJSONToStorage('words', wordsObj);

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
        saveJSONToStorage('words', wordsObj);

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
