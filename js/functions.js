/*
 * Модуль общих функций расширения VK without ADS.
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

//Сохраняет строку в хранилище
function saveStringToStorage(key, value)
{
    chrome.storage.local.set({[key]: value});
}

//Возвращает строку из хранилища
function getStringFromStorage(key, callback)
{
    chrome.storage.local.get(key, function (result) {

        callback(key, result[key]);
    });
}

//Сохраняет JSON в хранилище
function saveJSONToStorage(key, value)
{
    chrome.storage.local.set({
        [key]: JSON.stringify(value)
    });
}

//Функция, которая пишет данные в лог
function Log(message) {
    console.log("VK Posts Filter: " + message);
}