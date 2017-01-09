/*
 * Модуль настроек расширения VK without ADS.
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

//Список глобальных переменных
var wordsObj = {};

//Вызывает все необходимые функции в начале загрузки страницы
$(document).ready(function()
{
    //Управляет боковым меню
    $('.admin-content:not(:first)').hide();
    $('.admin-menu li > a').click(function(e) {
        e.preventDefault();
        $('.admin-menu li').removeClass('active');
        $(this).closest('li').addClass('active');

        $('.admin-content').hide();
        $('#' + $(this).attr('data-target-id')).show();
    });

    //Вызываем функцию, получающущю информацию о состоянии чекбоксах
    loadCheckboxes();

    //Добавляем необходимые элементы в списки
    loadWords();

    //Вызываем функцию, выводящую номер версии
    printAppVersion();

    //Вызывается при клике на какую-либо кнопку
    $('body').on('click', 'button', function() {

        //Получаем информацию о ключе и действии
        let key = this.id.split("-")[0];
        let action = this.id.split("-")[1];

        //Вызываем необходимую функцию
        switch (action) {
            case "add":
                return addWord(key);
                break;
            case "cancel":
                return cancelWord(key);
                break;
            case "save":
                return saveWord(key);
                break;
            case "edit":
                return editWord(key, $(this).attr("data"));
                break;
            case "delete":
                deleteWord(key, $(this).attr("data"));
                break;
        }
    });

    //Вызвается при изменении статуса любого чекбокса
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
    let value = status ? "checked" : "unchecked";

    //Сохраняем значение в хранилище
    saveStringToStorage(name, value);
}

//Загружает начальные списки фильтров
function loadWords() {
    $.each(["words", "url", "repost"], function(index, value) { getWords(value); });
}

//Выгружает данные о словесных фильтрах из хранилища
function getWords(key) {

    //Пробуем получить данные из хранилища
    getStringFromStorage(key, prepareWords);
}

//Преобразует полученную ифнормацию о словарях
function prepareWords(key, result) {

    //Проверим, создался ли объект
    if (wordsObj[key] == undefined)
        wordsObj[key] = {};

    //Пробуем загрузить локалную базу данных
    jQuery.getJSON("../data/data.json", function (data) {

        //Проверим, есть ли в хранилище список слов
        if (typeof(result) != "undefined") {

            //Парсим в объект полученных из настроек данные
            wordsObj[key] = jQuery.parseJSON(result)[key];
        }
        else
            wordsObj[key] = data[key];

        //Вызываем функцию, отображающую данные
        displayData(key, wordsObj);
    });
}

//Отображает полученные данные
function displayData(key, data) {
    //Очищаем div со списком слов
    $("#" + key + "-list").empty();

    //Пробегаемся по всему полученному массиву и добавляем элементы
    $.each(wordsObj[key].reverse(), function(index, value){
        if(value != "")
            $("#" + key + "-list").append(
                '<li class="list-group-item"> \
                    <div class="buttons-action"> \
                        <button type="submit" class="btn btn-success" id="' + key + '-edit" data="' + index + '"><span class="glyphicon glyphicon-edit"></span></button> \
                        <button type="submit" class="btn btn-danger" id="' + key + '-delete" data="' + index + '"><span class="glyphicon glyphicon-trash"></span></button> \
                    </div> \
                    ' + value + ' \
                </li>');
    });
}

//Добавляет новое слово в список
function addWord(key) {
    //Если что-то ввели в форму ввода
    if($("#" + key + "-new").val())
    {
        //Добавляем новое слово
        wordsObj[key].reverse().push($("#" + key + "-new").val());

        //Сохраняем значение
        saveJSONToStorage(key, wordsObj);

        //Очищаем поле ввода
        $("#" + key + "-new").val("");

        //Отображаем новый список слов
        getWords(key);
    }
    else 
        alert('Пожалуйста, введите значение');
}

//Отменяет ввод нового слова
function cancelWord(key) {
    //Очищаем поле ввода
    $("#" + key + "-new").val("");

    //Меняем кнопки
    $("#" + key + "-add").show();
    $("#" + key + "-save").hide();
}

//Вызывается при клике на кнопку "Изменить"
function editWord(key, id) {

    //Задаем значение
    $("#" + key + "-new").val( wordsObj[key][id] );
    $("#" + key + "-id").val( id );

    //Меняем значение кнопки
    $("#" + key + "-add").hide();
    $("#" + key + "-save").show();
}

//Вызывается пдля удаления элемента
function deleteWord(key, id) {

    //Создаем подтверждающее уведомление
    var message = confirm("Вы действительно хотите удалить объект \"" + wordsObj[key][id] + "\"");
    if (message == true) {
        //Удаляем данный элемент
        wordsObj[key].splice(id, 1);

        //Меняем массив местами
        wordsObj[key].reverse();

        //Сохраняем значение
        saveJSONToStorage(key, wordsObj);

        //Отображаем новый список слов
        getWords(key);
    }
}

//Вызывается для сохранения измененного слова
function saveWord(key) {

    //Проверим, введены ли не пустые значения
    if($("#" + key + "-id").val() && $("#" + key + "-new").val()) {

        //Меняем значение в массиве
        wordsObj[key][ parseInt($("#" + key + "-id").val()) ] = $("#" + key + "-new").val();

        //Меняем массив местами
        wordsObj[key].reverse();

        //Сохраняем значение
        saveJSONToStorage(key, wordsObj);

        //Очищаем поле ввода
        $("#" + key + "-new").val("");
        $("#" + key + "-id").val("");

        //Меняем кнопки
        $("#" + key + "-add").show();
        $("#" + key + "-save").hide();

        //Отображаем новый список слов
        getWords(key);
    }
    else 
        alert('Невозможно сохранить пустое значение');
}

//Выводит номер версии приложения
function printAppVersion() {
    $(".version").html(chrome.runtime.getManifest().version);
}
