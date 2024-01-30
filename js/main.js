"use strict";

const getE = (selector) => document.querySelector(selector);
const proper = (string) => string.charAt(0).toUpperCase() + string.slice(1);
const roundNum = (num) => (!/.00$/.test(num.toFixed(2).toString())) ? num.toFixed(2) : num.toFixed(3);
const replaceSpecialSymbol = (str) => str.split("").map((x) => (x === "(" || x === ")" || x === "/") ? x = `\\` + x : x).join("");
function convertSectoMinSec(inputSec) {
    let mm = Math.floor(inputSec / 60),
        ss = (inputSec % 60).toFixed();
    mm = (mm < 10) ? "0" + mm : mm;
    ss = (ss < 10) ? "0" + ss : ss;
    return mm + " хв " + ss + " сек";
}
const dayNames = ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
    monthNames = ["", "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
const numOfMonthDays = (d, m, y) => (new Date(y, m, d).getDate()),
    monthName = (m) => (monthNames[m].substring(0, 3));

getE('#currYear').innerHTML = new Date().getFullYear();

let categoryRuNames = {
    category_1: "Акции и бонусы",
    category_2: "Безопасность",
    category_3: "Верификация аккаунта",
    category_4: "Вопросы по сайту",
    category_5: "Восстановление доступа",
    category_6: "Другие тикеты",
    category_7: "Закрытие аккаунта",
    category_8: "Изменения аккаунта",
    category_9: "Макс бет (игры/слоты)",
    category_10: "Непройденный депозит",
    category_11: "Партнерство",
    category_12: "Проблемы по сайту",
    category_13: "Проблемы с играми",
    category_14: "Рассылка",
    category_15: "Регистрация",
    category_16: "Тест",
    category_17: "Технические проблемы (кроме бонусов)",
    category_18: "Финансовые операции",
    category_19: "Без категорії",
}

let languagesRuNames = {
    language_1: "Английский",
    language_2: "Немецкий",
    language_3: "Другие языки",
    language_4: "Французский",
    language_5: "Итальянский",
    language_6: "Японский",
    language_19: "Без мови",
}

let btnProcessFiles = getE('#processFiles');
let btnResetFiles = getE('#resetFiles');

let recordsChats = [],
    recordsTickets = [],
    allRecords = [],
    globalWorkRecords = [],
    dateSortedAllRecords = [],
    checkList = [],
    dataByRecordsTickets = [],
    dataByRecordsChats = [],
    managersList = ["noAgent"],
    tagsList = [],
    isDateRangeSelected = false;

let isChatsNeeded = false;
let isTicketsNeeded = false;

async function getInfo() {
    // console.log("чатів =", recordsChats.length, ", тікетів =", recordsTickets.length, " всього =", allRecords.length);
    console.log(allRecords);
    // console.log(globalWorkRecords);

    // console.log("Записи на перевірку:", checkList);
    // console.log("Виріка за період з", new Date(startDate).toLocaleString('uk-UA').replace(",", ""), "по", new Date(endDate).toLocaleString('uk-UA').replace(",", ""));
    getE('.count-box').innerHTML = `<span><span class="count-number">&#10070; ${allRecords.length}</span> звернень</span>`;
}

// CHECK IF CONVERSATION TYPE NEEDED FUNCTION START
let chatCheckBox = getE("#isChatsNeeded"),
    chatsCover = getE(".chats-cover"),
    chatFileInput = getE("#chatsFileInput"),
    ticketCheckBox = getE("#isTicketsNeeded"),
    ticketsCover = getE(".tickets-cover"),
    ticketFileInput = getE("#ticketsFileInput");

getE(".file-input-container").onchange = () => {
    if (chatCheckBox.checked && ticketCheckBox.checked) {
        chatsCover.style.width = 0;
        ticketsCover.style.width = 0;
        chatFileInput.disabled = false;
        ticketFileInput.disabled = false;
        isChatsNeeded = true;
        isTicketsNeeded = true;
        btnProcessFiles.disabled = true;
    }
    else if (!chatCheckBox.checked && ticketCheckBox.checked) {
        chatsCover.style.width = "100%";
        ticketsCover.style.width = 0;
        chatFileInput.disabled = true;
        ticketFileInput.disabled = false;
        isChatsNeeded = false;
        isTicketsNeeded = true;
        btnProcessFiles.disabled = true;
    }
    else if (chatCheckBox.checked && !ticketCheckBox.checked) {
        chatsCover.style.width = 0;
        ticketsCover.style.width = "100%";
        chatFileInput.disabled = false;
        ticketFileInput.disabled = true;
        isChatsNeeded = true;
        isTicketsNeeded = false;
        btnProcessFiles.disabled = true;
    }
    else {
        chatsCover.style.width = "100%";
        ticketsCover.style.width = "100%";
        chatFileInput.disabled = true;
        ticketFileInput.disabled = true;
        isChatsNeeded = false;
        isTicketsNeeded = false;
        getE('.checkChat').style.opacity = 0;
        getE('.checkTicket').style.opacity = 0;
        chatFileInput.value = "";
        ticketFileInput.value = "";
        btnProcessFiles.disabled = true;
    }
}
// CHECK IF CONVERSATION TYPE NEEDED FUNCTION END

// READ FILES FUNCTION START
async function readFiles() {
    getE('.start-instraction-block').style.display = "none";
    if (isChatsNeeded && isTicketsNeeded) {
        await readChats();
        await cleanChatRecords();
        await readTickets();
        await cleanTicketRecords();
    }
    else if (isChatsNeeded) {
        await readChats();
        await cleanChatRecords();
    }
    else if (isTicketsNeeded) {
        await readTickets();
        await cleanTicketRecords();
    }
    disableElem();
    if (recordsTickets.length > 0) buildReportOptionArr.recordsTickets = "";
    if (recordsChats.length > 0) buildReportOptionArr.recordsChats = "";
    if (allRecords.length > 0) buildReportOptionArr.allRecords = "";
    if (checkList.length > 0) {
        showAndBuildDialog(checkList, recordsChats);
        buildReportOptionArr.checkList = "";
        globalWorkRecords = [...allRecords];
    }
    else {
        await buildFilteringSection();
        globalWorkRecords = [...allRecords];
    }
}
// READ FILES FUNCTION END

// CHECK IF LOADED FILE IS PROPER FUNCTION START
let checkChat = false, checkTicket = false;
chatFileInput.onchange = () => {
    let inputElem = chatFileInput.files;
    if (inputElem.length > 0) {
        let newFile = inputElem[0];
        let reader = new FileReader();
        reader.readAsText(newFile);
        reader.onload = function (event) {
            let csvdata = event.target.result;
            let get1Line = csvdata.split('\n');
            let getFCell = get1Line[0].substring(1, get1Line[0].length - 1).split('","');
            if (getFCell[0] === "conferenceId") {
                getE('.checkChat').innerHTML = "&#10004;";
                getE('.checkChat').style.opacity = 1;
                getE('.checkChat').style.color = "green";
                checkChat = true;
                if (!isTicketsNeeded) {
                    checkTicket = true;
                }
                if (checkChat && checkTicket) {
                    btnProcessFiles.disabled = false;
                    btnResetFiles.disabled = false;
                }
            }
            else if (getFCell[0] !== "conferenceId") {
                getE('.checkChat').innerHTML = "&#10006;";
                getE('.checkChat').style.opacity = 1;
                getE('.checkChat').style.color = "red";
                btnProcessFiles.disabled = true;
                btnResetFiles.disabled = false;
                checkChat = false;
            }
        }
    }
}
ticketFileInput.onchange = () => {
    let inputElem = ticketFileInput.files;
    if (inputElem.length > 0) {
        let newFile = inputElem[0];
        let reader = new FileReader();
        reader.readAsText(newFile);
        reader.onload = function (event) {
            let csvdata = event.target.result;
            let get1Line = csvdata.split('\n');
            let getFCell = get1Line[0].substring(1, get1Line[0].length - 1).split('","');
            if (getFCell[0] === "createdAt") {
                getE('.checkTicket').innerHTML = "&#10004;";
                getE('.checkTicket').style.opacity = 1;
                getE('.checkTicket').style.color = "green";
                checkTicket = true;
                if (!isChatsNeeded) {
                    checkChat = true;
                }
                if (checkChat && checkTicket) {
                    btnProcessFiles.disabled = false;
                    btnResetFiles.disabled = false;
                }
            }
            else if (getFCell[0] !== "createdAt") {
                getE('.checkTicket').innerHTML = "&#10006;";
                getE('.checkTicket').style.opacity = 1;
                getE('.checkTicket').style.color = "red";
                btnProcessFiles.disabled = true;
                btnResetFiles.disabled = false;
                checkTicket = false;
            }
        }
    }
}
// CHECK IF LOADED FILE IS PROPER FUNCTION END

// DISABLE COMPONETS FUNCTION START
function disableElem() {
    chatFileInput.disabled = true;
    chatCheckBox.disabled = true;
    ticketCheckBox.disabled = true;
    ticketFileInput.disabled = true;
    btnProcessFiles.disabled = true;
    getE('.checkChat').style.opacity = 0;
    getE('.checkTicket').style.opacity = 0;
    chatsCover.style.width = "100%";
    ticketsCover.style.width = "100%";
    chatCheckBox.checked = false;
    ticketCheckBox.checked = false;
}
// DISABLE COMPONETS FUNCTION END

// READ CHATS FILE FUNCTION START
async function readChats() {
    let chatsFile = chatFileInput.files;
    if (chatsFile.length > 0) {
        return new Promise((resolve, reject) => {
            let fileWChats = chatsFile[0];
            let reader = new FileReader(); // FileReader Object
            reader.addEventListener('load', file => {
                resolve(dataByRecordsChats = (file.target.result).split('\n'));
            });
            reader.readAsText(fileWChats);
        });
    } else {
        alert("Будь ласка завантажте файл-звіт з чатами в форматі .csv");
    }
}
// READ CHATS FILE FUNCTION END

// READ TICKETS FILE FUNCTION START
async function readTickets() {
    btnProcessFiles.disabled = false;
    let ticketsFile = ticketFileInput.files;
    if (ticketsFile.length > 0) {
        return new Promise((resolve, reject) => {
            let fileWTickets = ticketsFile[0];
            let reader = new FileReader(); // FileReader Object
            reader.addEventListener('load', file => {
                resolve(dataByRecordsTickets = (file.target.result).split('\n'));
            });
            reader.readAsText(fileWTickets);
        });
    } else {
        alert("Будь ласка завантажте файл-звіт з тікетами в форматі .csv");
    }
}
// READ TICKETS FILE FUNCTION END

// REMOVE INPUT FILE/S FUNCTION START
function rmvFiles() {
    document.location.reload();
    chatFileInput.value = "";
    ticketFileInput.value = "";
    chatCheckBox.disabled = false;
    ticketCheckBox.disabled = false;
    chatFileInput.disabled = false;
    ticketFileInput.disabled = false;
    btnProcessFiles.disabled = true;
    btnResetFiles.disabled = true;
    getE('.checkChat').style.opacity = 0;
    getE('.checkTicket').style.opacity = 0;
    chatCheckBox.checked = false;
    chatsCover.style.width = "100%";
    isChatsNeeded = false;
    ticketCheckBox.checked = false;
    ticketsCover.style.width = "100%";
    isChatsNeeded = false;
    recordsChats = [];
    recordsTickets = [];
    allRecords = [];
    globalWorkRecords = [];
    checkList = [];
    dataByRecordsTickets = [];
    dataByRecordsChats = [];
    managersList = [];
    tagsList = [];
    isChatsNeeded = false;
    isTicketsNeeded = false;
    getE('.data-main').classList.add("hide");
    reportContainer.classList.add("hide");
    getE('.start-instraction-block').style.display = "flex";
}
// REMOVE INPUT FILE/S FUNCTION END

// CLEAN CHATS FUNCTION START
let startDate, endDate;
async function cleanChatRecords() {
    // find concat positions START
    let fRowArr = dataByRecordsChats[0].substring(1, dataByRecordsChats[0].length - 1).split('","');
    let operatorNickStart,
        operatorIdStart,
        operatorTimeZoneStart,
        preChatEmailStart,
        tag1Start,
        tagEnd,
        customVariableStart,
        firstResponseTimeStart;
    for (let i = 0; i < fRowArr.length; i++) {
        if (fRowArr[i] === "operator 1 nick") operatorNickStart = i;
        if (fRowArr[i] === "operator 1 id") operatorIdStart = i;
        if (fRowArr[i] === "operator 1 time zone") operatorTimeZoneStart = i;
        if (fRowArr[i] === "pre chat: E-mail:") preChatEmailStart = i;
        if (fRowArr[i] === "tag 1") tag1Start = i;
        if (fRowArr[i].includes("tag")) tagEnd = i;
        if (fRowArr[i] === "custom variable 1 name") customVariableStart = i;
        if (fRowArr[i] === "first response time") firstResponseTimeStart = i;
    }
    // find concat positions END

    for (let record = 1; record < dataByRecordsChats.length - 1; record++) {
        let dataByCells = dataByRecordsChats[record].substring(1, dataByRecordsChats[record].length - 1).split('","');
        if (dataByCells[13] === "Project_Nickel" ||
            dataByCells[13] === "Froggy_Like" ||
            dataByCells[13] === "Vasil_expo") {

            // put wide data to arrays START
            let operatorAccounts = [];
            for (let i = operatorNickStart; i < operatorIdStart; i++) {
                if (dataByCells[i] !== "") operatorAccounts.push(dataByCells[i]);
            }
            let operatorIds = [];
            for (let i = operatorIdStart; i < operatorTimeZoneStart; i++) {
                if (dataByCells[i] !== "") operatorIds.push(dataByCells[i]);
            }
            let operatorTimeZones = [];
            for (let i = operatorTimeZoneStart; i < preChatEmailStart; i++) {
                if (dataByCells[i] !== "") operatorTimeZones.push(dataByCells[i]);
            }
            let tags = [];
            for (let i = tag1Start; i < tagEnd; i++) {
                if (dataByCells[i] !== "") tags.push(dataByCells[i]);
                if (/1\s*-/.test(dataByCells[i])) {
                    if (tagsList.length === 0) tagsList.push(dataByCells[i])
                    if (!tagsList.includes(dataByCells[i])) tagsList.push(dataByCells[i])
                }
            }
            let operatorNicks = [];
            for (let tag = 0; tag < tags.length; tag++) {
                if (/7\s*-/.test(tags[tag])) {
                    let setTag = tags[tag].substring((tags[tag].match(/[a-zA-Z]/).index), tags[tag].length)
                    if (tags[tag].includes("/")) setTag = setTag.substring(0, setTag.indexOf('/'));
                    operatorNicks.push(setTag);
                    if (managersList.length === 0) managersList.push(setTag);
                    if (!managersList.includes(setTag)) managersList.push(setTag);
                }
            }
            let convLang = "Без мови";
            for (let tag = 0; tag < tags.length; tag++) {
                if (/6\s*-/.test(tags[tag])) {
                    convLang = tags[tag].substring((tags[tag].match(/[а-яА-Я]/).index), tags[tag].length)
                }
            }
            let customVariableArr = [];
            for (let i = customVariableStart; i < firstResponseTimeStart; i++) {
                if (dataByCells[i] !== "") customVariableArr.push(dataByCells[i]);
            }
            // put wide data to arrays END

            // leave only EMPTY, DUPS and other cases START 
            let checkChat = false;
            if (/@/.test(dataByCells[11])) {
                let tagsLine = tags.join(";");
                if (!/5/.test(tagsLine) &&
                    tags.includes("1-NO REPLY") === false &&
                    tags.includes("1-SPAM") === false) {
                    checkChat = true;
                }
                if (/5/.test(tagsLine)) {
                    checkChat = true;
                }
            }
            // leave only EMPTY, DUPS and other cases END 

            if (checkChat) {
                // mark record with proper PROJECT name START
                let projectName = "";
                if (dataByCells[13] === "Project_Nickel") {
                    projectName = "Project_Nickel"
                }
                else if (dataByCells[13] === "Froggy_Like") {
                    projectName = "Froggy_Like"
                }
                else if (dataByCells[13] === "Vasil_expo") {
                    projectName = "Vasil_expo"
                }
                // mark record with proper PROJECT name END

                // check if conversation without language tag START
                if (convLang === 'Без мови') {
                    let checkRecord = {
                        id: dataByCells[0],
                        project: projectName,
                        sourse: "chat",
                        problemLink: "https://my.livechatinc.com/archives/" + dataByCells[0],
                        problemDesc: "немає мітки мови",
                        problemType: "NOLANG",
                        tags: tags,
                        rmvPosChats: recordsChats.length === 0 ? 0 : recordsChats.length,
                        rmvPosAllList: allRecords.length === 0 ? 0 : allRecords.length,
                    }
                    checkList.push(checkRecord);
                }
                // check if conversation without language tag END

                // check if CATEGORY doubled START
                let dupsCheck = 0;
                for (let i = 0; i < tags.length; i++) {
                    if (tags[i].includes('5')) dupsCheck++;
                }
                if (dupsCheck > 1) {
                    let checkRecord = {
                        id: dataByCells[0],
                        project: projectName,
                        sourse: "chat",
                        problemLink: "https://my.livechatinc.com/archives/" + dataByCells[0],
                        problemDesc: "дубльована мітка категорії/й",
                        problemType: "CATDUPS",
                        tags: tags,
                        rmvPosChats: recordsChats.length === 0 ? 0 : recordsChats.length,
                        rmvPosAllList: allRecords.length === 0 ? 0 : allRecords.length,
                    }
                    checkList.push(checkRecord);
                }
                // check if CATEGORY doubled END

                // check if NO REPLY and/or SPAM with CATEGORY START
                let noRepAndCATcheck = false;
                for (let i = 0; i < tags.length; i++) {
                    if (tags[i].includes("1-NO REPLY") || tags[i].includes("1-SPAM")) {
                        for (let a = 0; a < tags.length; a++) {
                            if (tags[a].includes('5')) {
                                noRepAndCATcheck = true;
                            }
                        }
                    }
                }
                if (noRepAndCATcheck) {
                    let checkRecord = {
                        id: dataByCells[0],
                        project: projectName,
                        sourse: "chat",
                        problemLink: "https://my.livechatinc.com/archives/" + dataByCells[0],
                        problemDesc: "мітка (SPAM та/або NO REPLY) разом з категорією",
                        problemType: "NOREPLYANDCAT",
                        tags: tags,
                        rmvPosChats: recordsChats.length === 0 ? 0 : recordsChats.length,
                        rmvPosAllList: allRecords.length === 0 ? 0 : allRecords.length,
                    }
                    checkList.push(checkRecord);
                }
                // check if NO REPLY and/or SPAM with CATEGORY END

                // find record CATEGORY START
                let category;
                for (let i = 0; i < tags.length; i++) {
                    if (tags[i].includes("5")) {
                        switch (tags[i]) {
                            case "5-Акции и бонусы":
                                category = "Акции и бонусы";
                                break;
                            case "5-Безопасность":
                                category = "Безопасность";
                                break;
                            case "5-Верификация аккаунта":
                                category = "Верификация аккаунта";
                                break;
                            case "5-Вопросы по сайту":
                                category = "Вопросы по сайту";
                                break;
                            case "5-Восстановление доступа":
                                category = "Восстановление доступа";
                                break;
                            case "5-Другие тикеты":
                                category = "Другие тикеты";
                                break;
                            case "5-Закрытие аккаунта":
                                category = "Закрытие аккаунта";
                                break;
                            case "5-Изменения аккаунта":
                                category = "Изменения аккаунта";
                                break;
                            case "5-Макс бет (игры/слоты)":
                                category = "Макс бет (игры/слоты)";
                                break;
                            case "5-Непройденный депозит":
                                category = "Непройденный депозит";
                                break;
                            case "5-Партнерство":
                                category = "Партнерство";
                                break;
                            case "5-Проблемы по сайту":
                                category = "Проблемы по сайту";
                                break;
                            case "5-Проблемы с играми":
                                category = "Проблемы с играми";
                                break;
                            case "5-Рассылка":
                                category = "Рассылка";
                                break;
                            case "5-Регистрация":
                                category = "Регистрация";
                                break;
                            case "5-Тест":
                                category = "Тест";
                                break;
                            case "5-Технические проблемы (кроме бонусов)":
                                category = "Технические проблемы (кроме бонусов)";
                                break;
                            case "5-Технические проблемы(кроме бонусов)":
                                category = "Технические проблемы (кроме бонусов)";
                                break;
                            case "5-Финансовые операции":
                                category = "Финансовые операции";
                                break;
                        }
                    }
                }
                // find record CATEGORY END

                // find report start/end date time START
                if (!startDate) startDate = new Date(dataByCells[1]).getTime();
                else if (new Date(dataByCells[1]).getTime() < startDate) startDate = new Date(dataByCells[1]).getTime();
                if (!endDate) endDate = new Date(dataByCells[1]).getTime();
                else if (new Date(dataByCells[1]).getTime() > endDate) endDate = new Date(dataByCells[1]).getTime();
                // find report start/end date time END

                let recordObj = {
                    createdAt: new Date(dataByCells[1]).toLocaleString("uk-UA").replace(',', ""), // conversation start date&time
                    conferenceId: dataByCells[0].toString(), // conversation ID
                    projectName: projectName, // project name 
                    conversationType: "chat",
                    conversationLink: "https://my.livechatinc.com/archives/" + dataByCells[0],
                    conversationCategory: (category !== undefined) ? category : "Без категорії", // conversation category
                    conversationTags: tags, // converstaion tags
                    conversationLanguage: convLang,
                    operatorNicks: (operatorNicks.length === 0) ? "noAgent" : operatorNicks, // operatorNicks
                    lastOperator: (operatorNicks.length === 0) ? "noAgent" : operatorNicks[operatorNicks.length - 1], // operatorNicks
                    customerId: dataByCells[7], // customer ID (for chats it has unique ID)
                    customerEmail: dataByCells[10], // customer email
                    specialFields: {
                        createdAtMilis: new Date(dataByCells[1]).getTime(),
                        conversationTimings: {
                            conversationDurationSec: dataByCells[5] !== "" ? parseInt(dataByCells[5]) : 0, // conversation duration in seconds
                            queueDurationSec: dataByCells[6] !== "" ? parseInt(dataByCells[6]) : 0, // conversation queue (before agent receive chat) duration in seconds
                            firstResponseTime: dataByCells[firstResponseTimeStart] !== "" ? parseInt(dataByCells[firstResponseTimeStart]) : 0, // first response time (seconds)
                            averageResponseTime: dataByCells[firstResponseTimeStart + 1] !== "" ? parseInt(dataByCells[firstResponseTimeStart + 1]) : 0, // average response time (seconds)
                            agentsChattingDuration: dataByCells[firstResponseTimeStart + 2] !== "" ? parseInt(dataByCells[firstResponseTimeStart + 2]) : 0, // agents chating duration (seconds)
                        },
                        chatStartDate: dataByCells[2], // chatStartDate ***
                        chatStartUrl: dataByCells[3], // chatStartUrl ***
                        referrer: dataByCells[4], // referrer ***
                        visitorNick: dataByCells[8], // customer Name ***
                        visitorIp: dataByCells[9], // visitorIp ***
                        lastAccountId: dataByCells[11], // lastAccountId ***
                        groupNum: dataByCells[12], // groupNum ***
                        conversationCustomerRating: { rateMark: dataByCells[14], rateComment: dataByCells[15] }, // conversation customer rating ***
                        operatorIds: operatorIds, // operatorIds ***
                        operatorTimeZones: operatorTimeZones, // operatorTimeZones ***
                        preChatEmail: dataByCells[19], // preChatEmail ***
                        autoInviteOption: { autoInviteUrl: dataByCells[20], autoInviteAction: dataByCells[21] }, // conversation auto invite option ***
                        conversationGoal: { goalActionName: dataByCells[22], goalDoneBy: dataByCells[23], goalDoneDate: dataByCells[24], }, // conversation goal ***
                        visitorUserAgent: dataByCells[29], // visitorUserAgent ***
                        groupStatusAtStart: dataByCells[30], // groupStatusAtStart ***
                        visitorCountryCode: dataByCells[31], // visitorCountryCode ***
                        operatorAccounts: operatorAccounts, // manager Account
                        customVariables: customVariableArr,
                    },
                }

                // check if chat without category START
                let tagsRow = tags.join(";");
                if (!/5/.test(tagsRow) &&
                    tags.includes("1-NO REPLY") === false &&
                    tags.includes("1-SPAM") === false) {
                    let checkRecord = {
                        id: dataByCells[0],
                        project: projectName,
                        sourse: "chat",
                        problemLink: "https://my.livechatinc.com/archives/" + dataByCells[0],
                        problemDesc: "немає мітки категорії",
                        problemType: "EMPTY",
                        tags: tags,
                        rmvPosChats: recordsChats.length === 0 ? 0 : recordsChats.length,
                        rmvPosAllList: allRecords.length === 0 ? 0 : allRecords.length,
                    }
                    checkList.push(checkRecord);
                }
                // check if chat without category END

                recordsChats.push(recordObj);
                allRecords.push(recordObj);
            }
        }
    }
}
// CLEAN CHATS FUNCTION END

// CLEAN TICKETS FUNCTION START
async function cleanTicketRecords() {
    for (let record = 1; record < dataByRecordsTickets.length - 1; record++) {
        let dataByCells = dataByRecordsTickets[record].substring(1, dataByRecordsTickets[record].length - 1).split('","');

        if (dataByCells[10] === "Менеджеры Project_Nickel" ||
            dataByCells[10] === "Менеджеры Vasil_expo" ||
            dataByCells[10] === "Менеджеры Froggy_Like") {

            let operatorNicks = [];
            let operatorAccountName = [];
            if (dataByCells[11] !== "") operatorAccountName.push(dataByCells[10]);

            if (
                dataByCells[13].length !== 0 && dataByCells[13].includes("5") && dataByCells[13].includes("1-NO REPLY") ||
                dataByCells[13].length !== 0 && dataByCells[13].includes("5") && dataByCells[13].includes("1-SPAM") ||
                dataByCells[13].length !== 0 && !dataByCells[13].includes("1-NO REPLY") && !dataByCells[13].includes("1-SPAM")
            ) {
                let tags = dataByCells[13].split(";"),
                    convLang = "Без мови";
                for (let tag = 0; tag < tags.length; tag++) {
                    if (/7\s*-/.test(tags[tag])) {
                        let setTag = tags[tag].substring((tags[tag].match(/[a-zA-Z]/).index), tags[tag].length)
                        if (tags[tag].includes("/")) setTag = setTag.substring(0, setTag.indexOf('/'));
                        operatorNicks.push(setTag);
                        if (managersList.length === 0) managersList.push(setTag);
                        if (!managersList.includes(setTag)) managersList.push(setTag);
                    }
                    if (/1\s*-/.test(tags[tag])) {
                        if (tagsList.length === 0) tagsList.push(tags[tag])
                        if (!tagsList.includes(tags[tag])) tagsList.push(tags[tag])
                    }
                    if (/6\s*-/.test(tags[tag])) {
                        convLang = tags[tag].substring((tags[tag].match(/[а-яА-Я]/).index), tags[tag].length)
                    }
                }

                // mark record with proper PROJECT name START
                if (dataByCells[10] === "Менеджеры Project_Nickel" ||
                    dataByCells[10] === "Менеджеры Vasil_expo" ||
                    dataByCells[10] === "Менеджеры Froggy_Like") {
                    let projectName = "";
                    if (dataByCells[10] === "Менеджеры Project_Nickel") {
                        projectName = "Project_Nickel"
                    }
                    else if (dataByCells[10] === "Менеджеры Vasil_expo") {
                        projectName = "Vasil_expo"
                    }
                    else if (
                        dataByCells[10] === "Менеджеры Froggy_Like") {
                        projectName = "Froggy_Like"
                    }
                    // mark record with proper PROJECT name END

                    // check if conversation without language tag START
                    if (convLang === 'Без мови') {
                        let checkRecord = {
                            id: dataByCells[4],
                            project: projectName,
                            sourse: "ticket",
                            problemLink: "https://app.helpdesk.com/tickets/" + dataByCells[4],
                            problemDesc: "немає мітки мови",
                            problemType: "NOLANG",
                            tags: tags,
                            rmvPosTickets: recordsTickets.length === 0 ? 0 : recordsTickets.length,
                            rmvPosAllList: allRecords.length === 0 ? 0 : allRecords.length,
                        }
                        checkList.push(checkRecord);
                    }
                    // check if conversation without language tag END

                    // check if CATEGORY doubled START
                    let count = 0;
                    for (let i = 0; i < tags.length; i++) {
                        if (tags[i].includes('5')) {
                            count++;
                        }
                    }
                    if (count > 1) {
                        let checkRecord = {
                            id: dataByCells[4],
                            project: projectName,
                            sourse: "ticket",
                            problemLink: "https://app.helpdesk.com/tickets/" + dataByCells[4],
                            problemDesc: "дубльована мітка категорії/й",
                            problemType: "CATDUPS",
                            tags: tags,
                            rmvPosTickets: recordsTickets.length === 0 ? 0 : recordsTickets.length,
                            rmvPosAllList: allRecords.length === 0 ? 0 : allRecords.length,
                        }
                        checkList.push(checkRecord);
                    }
                    else if (count <= 1) {
                        count = 0;
                    }
                    // check if CATEGORY doubled END

                    // check if NO REPLY and/or SPAM with CATEGORY START
                    let noRepAndCATcheck = false;
                    for (let i = 0; i < tags.length; i++) {
                        if (tags[i].includes("1-NO REPLY") || tags[i].includes("1-SPAM")) {
                            for (let a = 0; a < tags.length; a++) {
                                if (tags[a].includes('5')) {
                                    noRepAndCATcheck = true;
                                }
                            }
                        }
                    }
                    if (noRepAndCATcheck) {
                        let checkRecord = {
                            id: dataByCells[4],
                            project: projectName,
                            sourse: "ticket",
                            problemLink: "https://app.helpdesk.com/tickets/" + dataByCells[4],
                            problemDesc: "мітка (SPAM та/або NO REPLY) разом з категорією",
                            problemType: "NOREPLYANDCAT",
                            tags: tags,
                            rmvPosTickets: recordsTickets.length === 0 ? 0 : recordsTickets.length,
                            rmvPosAllList: allRecords.length === 0 ? 0 : allRecords.length,
                        }
                        checkList.push(checkRecord);
                    }
                    // check if NO REPLY and/or SPAM with CATEGORY END

                    // find record CATEGORY START
                    let category;
                    for (let i = 0; i < tags.length; i++) {
                        if (tags[i].includes('5')) {
                            switch (tags[i]) {
                                case "5-Акции и бонусы":
                                    category = "Акции и бонусы";
                                    break;
                                case "5-Безопасность":
                                    category = "Безопасность";
                                    break;
                                case "5-Верификация аккаунта":
                                    category = "Верификация аккаунта";
                                    break;
                                case "5-Вопросы по сайту":
                                    category = "Вопросы по сайту";
                                    break;
                                case "5-Восстановление доступа":
                                    category = "Восстановление доступа";
                                    break;
                                case "5-Другие тикеты":
                                    category = "Другие тикеты";
                                    break;
                                case "5-Закрытие аккаунта":
                                    category = "Закрытие аккаунта";
                                    break;
                                case "5-Изменения аккаунта":
                                    category = "Изменения аккаунта";
                                    break;
                                case "5-Макс бет (игры/слоты)":
                                    category = "Макс бет (игры/слоты)";
                                    break;
                                case "5-Непройденный депозит":
                                    category = "Непройденный депозит";
                                    break;
                                case "5-Партнерство":
                                    category = "Партнерство";
                                    break;
                                case "5-Проблемы по сайту":
                                    category = "Проблемы по сайту";
                                    break;
                                case "5-Проблемы с играми":
                                    category = "Проблемы с играми";
                                    break;
                                case "5-Рассылка":
                                    category = "Рассылка";
                                    break;
                                case "5-Регистрация":
                                    category = "Регистрация";
                                    break;
                                case "5-Тест":
                                    category = "Тест";
                                    break;
                                case "5-Технические проблемы (кроме бонусов)":
                                    category = "Технические проблемы (кроме бонусов)";
                                    break;
                                case "5-Технические проблемы(кроме бонусов)":
                                    category = "Технические проблемы (кроме бонусов)";
                                    break;
                                case "5-Финансовые операции":
                                    category = "Финансовые операции";
                                    break;
                            }
                        }
                    }
                    // find record CATEGORY END

                    // find report start/end date time START
                    if (!startDate) startDate = new Date(dataByCells[0]).getTime();
                    else if (new Date(dataByCells[0]).getTime() < startDate) startDate = new Date(dataByCells[0]).getTime();
                    if (!endDate) endDate = new Date(dataByCells[0]).getTime();
                    else if (new Date(dataByCells[0]).getTime() > endDate) endDate = new Date(dataByCells[0]).getTime();
                    // find report start/end date time END

                    let record = {
                        createdAt: new Date(dataByCells[0]).toLocaleString("uk-UA").replace(',', ""), // conversation start date&time
                        conferenceId: dataByCells[4].toString(), // conversation ID
                        projectName: projectName, // project name 
                        conversationType: "ticket",
                        conversationLink: "https://app.helpdesk.com/tickets/" + dataByCells[4],
                        conversationCategory: (category !== undefined) ? category : "Без категорії", // conversation category
                        conversationTags: tags, // converstaion tags
                        conversationLanguage: convLang,
                        operatorNicks: (operatorNicks.length === 0) ? "noAgent" : operatorNicks, // operatorNicks
                        lastOperator: (operatorNicks.length === 0) ? "noAgent" : operatorNicks[operatorNicks.length - 1], // operatorNicks
                        customerId: dataByCells[6], // customer ID (for chats it has unique ID)
                        customerEmail: dataByCells[6], // customer email
                        specialFields: {
                            createdAtMilis: new Date(dataByCells[0]).getTime(),
                            operatorAccountName: operatorAccountName, // operator account name
                            requesterName: dataByCells[5], // customer Name ***
                            lastAccountId: dataByCells[12], // agent account Email (agentEmail) ***
                            conversationCustomerRating: { rateMark: dataByCells[15], rateComment: dataByCells[16] }, // conversation customer rating ***
                            updatedAtTicket: dataByCells[1], // ticket last update date&time ***
                            inboundOutboundTicket: dataByCells[2], // ticket source type ***
                            ticketStatus: dataByCells[7], // ticket status ***
                            ticketPriority: dataByCells[8], // ticket priority ***
                            ticketSubject: dataByCells[9], // ticket subject ***
                            publicMessages: dataByCells[14], // number of messages in the ticket
                            ticketInbox: dataByCells[17], // ticket inbox email ***
                            ticketFolder: dataByCells[18], // ticket folder ***
                            secondsFromCreationToSolvedOrClosed: dataByCells[19], // secondsFromCreationToSolvedOrClosed
                            secondsFromAssignmentToSolvedOrClosed: dataByCells[20], // secondsFromAssignmentToSolvedOrClosed
                        },
                    }

                    // check if ticket without category START
                    for (let i = 0; i < tags.length; i++) {
                        if (tags[i].includes('5')) break;
                        if (!tags[i].includes('5')) {
                            if (i === tags.length - 1) {
                                let checkRecord = {
                                    id: dataByCells[4],
                                    project: projectName,
                                    sourse: "ticket",
                                    problemLink: "https://app.helpdesk.com/tickets/" + dataByCells[4],
                                    problemDesc: "немає мітки категорії",
                                    problemType: "EMPTY",
                                    tags: tags,
                                    rmvPosTickets: recordsTickets.length === 0 ? 0 : recordsTickets.length,
                                    rmvPosAllList: allRecords.length === 0 ? 0 : allRecords.length,
                                }
                                checkList.push(checkRecord);
                            }
                        }
                    }
                    // check if ticket without category END
                    recordsTickets.push(record);
                    allRecords.push(record);
                }
            }
        }
    }
}
// CLEAN TICKETS FUNCTION END

// BUILD FILTERING OPTIONS FUNCTION START
async function buildFilteringSection() {
    getE('.data-main').classList.remove("hide");
    let filterControlContainer = getE(".data-filtering-container");
    let badgeCountsObj = await recordsCounter(globalWorkRecords);

    // get&build PROJECTS list START
    let addCountent = "";
    for (let i = 0; i < Object.keys(badgeCountsObj.projectsCount).length; i++) {
        let optionLabel = Object.keys(badgeCountsObj.projectsCount[i]).toString(),
            optionCount = Object.values(badgeCountsObj.projectsCount[i]).toString();
        addCountent += `
        <label name="projectsDropDown" for="isShow${optionLabel}" >
        <input name="projectsDropDown" type="checkbox" name="isShow${optionLabel}" 
        id="isShow${optionLabel}" value="${optionLabel}">
        <div name="projectsDropDown" class="filter-label-text-box">
        <span name="projectsDropDown" class="labelBadge">${(optionLabel.length > 16) ? optionLabel.substring(0, 18) : optionLabel}</span>
        <span id="_${optionLabel}Badge" name="projectsDropDown" class="countBadge ${(optionLabel.length > 16) ? "badgeShadow" : ""}">${optionCount}</span>
        </div>
        </label>`;
    }
    filterControlContainer.innerHTML = `
        <fieldset class="projectsList-fieldset">
        <legend name="projectsDropDown" onclick="showDropDown(event)">Проєкти &#11206;</legend>
        <div name="projectsDropDown" id="projectsDropDown" class="dropDown">
        <label name="projectsDropDown" for="IsShowAllProjects">
        <input type="checkbox" name="projectsDropDown" id="IsShowAllProjects" value="allProjectsList">
        <div name="projectsDropDown" class="filter-label-text-box">
        <span name="projectsDropDown" class="labelBadge">Всі проєкти</span></div>
        </label>
        ${addCountent}
        </div>
        </fieldset>`;
    // get&build PROJECTS list END

    // get&build CONVERSATION TYPES list START
    addCountent = "";
    for (let i = 0; i < Object.keys(badgeCountsObj.convTypesCount).length; i++) {
        let optionLabel = Object.keys(badgeCountsObj.convTypesCount[i]).toString(),
            optionCount = Object.values(badgeCountsObj.convTypesCount[i]).toString();
        addCountent += `
        <label name="convTypesDropDown" for="isShow${optionLabel}" >
        <input name="convTypesDropDown" type="checkbox" name="isShow${optionLabel}" 
        id="isShow${optionLabel}" value="${optionLabel}">
        <div name="convTypesDropDown" class="filter-label-text-box">
        <span name="convTypesDropDown" class="labelBadge">${(optionLabel === "chat") ? "Чати" : "Тікети"}</span>
        <span name="convTypesDropDown" id="_${optionLabel}Badge" class="countBadge">${optionCount}</span>
        </div>
        </label>`;
    }
    filterControlContainer.innerHTML += `
        <fieldset class="conversationTypesList-fieldset">
        <legend name="convTypesDropDown" onclick="showDropDown(event)">Типи звернень &#11206;</legend>
        <div name="convTypesDropDown" id="convTypesDropDown" class="dropDown">
        <label name="convTypesDropDown" for="IsShowAllConversationTypes">
        <input name="convTypesDropDown" type="checkbox" name="IsShowAllConversationTypes" id="IsShowAllConversationTypes" value="allConversationTypes">
        <div name="convTypesDropDown" class="filter-label-text-box"><span name="convTypesDropDown" class="labelBadge">Всі типи</span></div>
        </label>
        ${addCountent}
        </div>
        </fieldset>`;
    // get&build CONVERSATION TYPES list END

    // get&build CATEGORIES list START
    addCountent = "";
    for (let i = 0; i < Object.keys(badgeCountsObj.categoriesCount).length; i++) {
        let optionLabel = Object.keys(badgeCountsObj.categoriesCount[i]).toString(),
            optionCount = Object.values(badgeCountsObj.categoriesCount[i]).toString();

        let optionValue;
        for (const key in categoryRuNames) {
            if (optionLabel === categoryRuNames[key]) {
                optionValue = optionLabel;
                optionLabel = key;
            }
        }
        addCountent += `
        <label name="categoriesDropDown" for="isShow${optionLabel}" >
        <input name="categoriesDropDown" type="checkbox" name="isShow${optionLabel}" 
        id="isShow${optionLabel}" value="${optionValue}">
        <div name="categoriesDropDown" class="filter-label-text-box">
        <span name="categoriesDropDown" class="labelBadge" title="${(optionValue.length > 14) ? optionValue : ""}">${(optionValue.length > 14) ? optionValue.substring(0, 18) : optionValue}</span>
        <span name="categoriesDropDown" id="_${optionLabel}Badge" class="countBadge ${(optionValue.length > 14) ? "badgeShadow" : ""}">${optionCount}</span>
        </div>
        </label>`;
    }
    filterControlContainer.innerHTML += `
        <fieldset class="categoriesList-fieldset">
        <legend name="categoriesDropDown" onclick="showDropDown(event)">Категорії &#11206;</legend>
        <div name="categoriesDropDown" id="categoriesDropDown" class="dropDown">
        <label name="categoriesDropDown" for="IsShowAllCategories">
        <input name="categoriesDropDown" type="checkbox" name="IsShowAllCategories" id="IsShowAllCategories" value="allCategories">
        <div name="categoriesDropDown" class="filter-label-text-box"><span name="categoriesDropDown" class="labelBadge">Всі категорії</span></div>
        </label>
        ${addCountent}
        </div>
        </fieldset>`;
    // get&build CATEGORIES list END

    // get&build LANGUAGES list START
    addCountent = "";
    for (let i = 0; i < Object.keys(badgeCountsObj.languagesCount).length; i++) {
        let optionLabel = Object.keys(badgeCountsObj.languagesCount[i]).toString(),
            optionCount = Object.values(badgeCountsObj.languagesCount[i]).toString();

        let optionValue;
        for (const key in languagesRuNames) {
            if (optionLabel === languagesRuNames[key]) {
                optionValue = optionLabel;
                optionLabel = key;
            }
        }
        addCountent += `
        <label name="languagesDropDown" for="isShow${optionLabel}" >
        <input name="languagesDropDown" type="checkbox" name="isShow${optionLabel}" 
        id="isShow${optionLabel}" value="${optionValue}">
        <div name="languagesDropDown" class="filter-label-text-box">
        <span name="languagesDropDown" class="labelBadge">${(optionValue.length > 14) ? optionValue.substring(0, 14) : optionValue}</span>
        <span name="languagesDropDown" id="_${optionLabel}Badge" class="countBadge ${(optionValue.length > 14) ? "badgeShadow" : ""}">${optionCount}</span>
        </div>
        </label>`;
    }
    filterControlContainer.innerHTML += `
        <fieldset class="languagesList-fieldset">
        <legend name="languagesDropDown" onclick="showDropDown(event)">Мови &#11206;</legend>
        <div name="languagesDropDown" id="languagesDropDown" class="dropDown">
        <label name="languagesDropDown" for="IsShowAllLanguages">
        <input name="languagesDropDown" type="checkbox" name="IsShowAllLanguages" id="IsShowAllLanguages" value="allCategories">
        <div name="languagesDropDown" class="filter-label-text-box"><span name="languagesDropDown" class="labelBadge">Всі мови</span></div>
        </label>
        ${addCountent}
        </div>
        </fieldset>`;
    // get&build LANGUAGES list END

    // get&build AGENTS list START
    addCountent = "";
    for (let i = 0; i < Object.keys(badgeCountsObj.agentsCount).length; i++) {
        let optionLabel = Object.keys(badgeCountsObj.agentsCount[i]).toString(),
            optionCount = Object.values(badgeCountsObj.agentsCount[i]).toString();

        addCountent += `
        <label name="agentsDropDown" for="isShow${optionLabel}" >
        <input name="agentsDropDown" type="checkbox" name="isShow${optionLabel}" 
        id="isShow${optionLabel}" value="${optionLabel}">
        <div name="agentsDropDown" class="filter-label-text-box">
        <span name="agentsDropDown" class="labelBadge">${(optionLabel === "noAgent") ? "Немає відповідального" : optionLabel}</span>
        <span name="agentsDropDown" id="_${optionLabel}Badge" class="countBadge badgeShadow">${optionCount}</span>
        </div>
        </label>`;
    }
    filterControlContainer.innerHTML += `
        <fieldset class="agentsList-fieldset">
        <legend name="agentsDropDown" onclick="showDropDown(event)">Менеджери &#11206;</legend>
        <div name="agentsDropDown" id="agentsDropDown" class="dropDown">
        <label name="agentsDropDown" for="IsShowAllAgents">
        <input name="agentsDropDown" type="checkbox" name="IsShowAllAgents" id="IsShowAllAgents" value="allAgents">
        <div name="agentsDropDown" class="filter-label-text-box"><span name="agentsDropDown" class="labelBadge">Всі категорії</span></div>
        </label>
        ${addCountent}
        </div>
        </fieldset>`;
    // get&build AGENTS list END

    // reset button and info box START
    filterControlContainer.innerHTML += `
    <fieldset class="reset-btn-fieldset">
    <input type="button" id="resetFilters" onclick="resetFilters()" value="Скинути">
    </fieldset>`;
    // reset button and info box END

    // reset sort arrows START
    for (let table = 0; table < getE('.content').children.length; table++) {
        let tRow = getE('.content').children[table].firstElementChild.firstElementChild;
        for (let i = 0; i < tRow.children.length; i++) {
            tRow.children[i].setAttribute('name', true);
            tRow.children[i].firstElementChild.innerHTML = "";
        }
    }
    // reset sort arrows END

    allRecords.sort(function (a, b) { return a.specialFields.createdAtMilis - b.specialFields.createdAtMilis });
    globalWorkRecords.sort(function (a, b) { return a.specialFields.createdAtMilis - b.specialFields.createdAtMilis });

    await buildDatesFilter(startDate, endDate);
    await getInfo();
    await buildFilters();
    await buildReportSection();
    await countCategories(globalWorkRecords);
    await countLanguages(globalWorkRecords);
    await countManagersPerf(globalWorkRecords);
    await countTags(globalWorkRecords);
}
// BUILD FILTERING OPTIONS FUNCTION END

// RESET FILTERS BUTTON FUNCTION START
async function resetFilters() {
    globalWorkRecords = [...allRecords];
    await buildFilteringSection();
    getE("#downloadCustomReport").disabled = true;
    isDateRangeSelected = false;
}
// RESET FILTERS BUTTON FUNCTION END

// BUILD FILTERS FUNCTION START
let buildedFilter = {}, isFiltred = false;
async function buildFilters() {
    // build PROJECTS filter START
    let projectsListSect = getE('.projectsList-fieldset').firstElementChild.nextElementSibling;
    let allProjectsCheckBox = getE('#IsShowAllProjects');

    allProjectsCheckBox.checked = true;
    let firstSelectedArr = [];
    if (allProjectsCheckBox.checked) {
        for (let i = 1; i < projectsListSect.children.length; i++) {
            firstSelectedArr.push(projectsListSect.children[i].firstElementChild.value);
        }
        buildedFilter.projectsFilter = firstSelectedArr;
    }

    allProjectsCheckBox.onchange = () => {
        filterResults(buildedFilter);
        recordsCounter(filteredDataArr);
        for (let i = 1; i < projectsListSect.children.length; i++) {
            projectsListSect.children[i].firstElementChild.checked = false;
        }
    }

    projectsListSect.onchange = () => {
        let selectedProjectsArr = [];
        if (allProjectsCheckBox.checked && firstSelectedArr.length > 0 ||
            !allProjectsCheckBox.checked && firstSelectedArr.length > 0) {
            for (let i = 1; i < projectsListSect.children.length; i++) {
                if (projectsListSect.children[i].firstElementChild.checked) {
                    selectedProjectsArr.push(projectsListSect.children[i].firstElementChild.value);
                    allProjectsCheckBox.checked = false;
                }
            }
            let count = 0;
            for (let i = 1; i < projectsListSect.children.length; i++) {
                if (!projectsListSect.children[i].firstElementChild.checked) count++;
                if (count === projectsListSect.children.length - 1) allProjectsCheckBox.checked = true;
            }
            buildedFilter.projectsFilter = selectedProjectsArr;
        }
        if (allProjectsCheckBox.checked) {
            for (let i = 1; i < projectsListSect.children.length; i++) {
                selectedProjectsArr.push(projectsListSect.children[i].firstElementChild.value)
            }
            buildedFilter.projectsFilter = selectedProjectsArr;
        }
        filterResults(buildedFilter);
        recordsCounter(filteredDataArr);
    }
    // build PROJECTS filter END

    // build CONVERSATION TYPES filter START
    let convTypesSect = getE('.conversationTypesList-fieldset').firstElementChild.nextElementSibling;
    let allConvTypesCheckBox = getE('#IsShowAllConversationTypes');

    allConvTypesCheckBox.checked = true;
    firstSelectedArr = [];
    if (allConvTypesCheckBox.checked) {
        for (let i = 1; i < convTypesSect.children.length; i++) {
            firstSelectedArr.push(convTypesSect.children[i].firstElementChild.value)
        }
        buildedFilter.convTypesFilter = firstSelectedArr;
    }

    allConvTypesCheckBox.onchange = () => {
        filterResults(buildedFilter);
        recordsCounter(filteredDataArr);
        for (let i = 1; i < convTypesSect.children.length; i++) {
            convTypesSect.children[i].firstElementChild.checked = false;
        }
    }

    convTypesSect.onchange = (e) => {
        let selectedConvTypesArr = [];
        if (allConvTypesCheckBox.checked && firstSelectedArr.length > 0 ||
            !allConvTypesCheckBox.checked && firstSelectedArr.length > 0) {
            allConvTypesCheckBox.checked = false;
            for (let i = 1; i < convTypesSect.children.length; i++) {
                if (convTypesSect.children[i].firstElementChild.checked) {
                    selectedConvTypesArr.push(convTypesSect.children[i].firstElementChild.value)
                }
            }
            let count = 0;
            for (let i = 1; i < convTypesSect.children.length; i++) {
                if (!convTypesSect.children[i].firstElementChild.checked) count++;
                if (count === convTypesSect.children.length - 1) allConvTypesCheckBox.checked = true;
            }
            buildedFilter.convTypesFilter = selectedConvTypesArr;
        }
        if (allConvTypesCheckBox.checked) {
            for (let i = 1; i < convTypesSect.children.length; i++) {
                selectedConvTypesArr.push(convTypesSect.children[i].firstElementChild.value)
            }
            buildedFilter.convTypesFilter = selectedConvTypesArr;
        }
        filterResults(buildedFilter);
        recordsCounter(filteredDataArr);
    }
    // build CONVERSATION TYPES filter END

    // build CATEGORIES filter START
    let categoriesListSect = getE('.categoriesList-fieldset').firstElementChild.nextElementSibling;
    let allCategoriesCheckBox = getE('#IsShowAllCategories');

    allCategoriesCheckBox.checked = true;
    firstSelectedArr = [];
    if (allCategoriesCheckBox.checked) {
        for (let i = 1; i < categoriesListSect.children.length; i++) {
            firstSelectedArr.push(categoriesListSect.children[i].firstElementChild.value)
        }
        buildedFilter.categoriesFilter = firstSelectedArr;
    }

    allCategoriesCheckBox.onchange = () => {
        filterResults(buildedFilter);
        recordsCounter(filteredDataArr);
        for (let i = 1; i < categoriesListSect.children.length; i++) {
            categoriesListSect.children[i].firstElementChild.checked = false;
        }
    }

    categoriesListSect.onchange = (e) => {
        let selectedCategoriesArr = [];
        if (allCategoriesCheckBox.checked && firstSelectedArr.length > 0 ||
            !allCategoriesCheckBox.checked && firstSelectedArr.length > 0) {
            allCategoriesCheckBox.checked = false;
            for (let i = 1; i < categoriesListSect.children.length; i++) {
                if (categoriesListSect.children[i].firstElementChild.checked) {
                    selectedCategoriesArr.push(categoriesListSect.children[i].firstElementChild.value);
                }
            }
            let count = 0;
            for (let i = 1; i < categoriesListSect.children.length; i++) {
                if (!categoriesListSect.children[i].firstElementChild.checked) count++;
                if (count === categoriesListSect.children.length - 1) allCategoriesCheckBox.checked = true;
            }
            buildedFilter.categoriesFilter = selectedCategoriesArr;
        }
        if (allCategoriesCheckBox.checked) {
            for (let i = 1; i < categoriesListSect.children.length; i++) {
                selectedCategoriesArr.push(categoriesListSect.children[i].firstElementChild.value)
            }
            buildedFilter.categoriesFilter = selectedCategoriesArr;
        }
        filterResults(buildedFilter);
        recordsCounter(filteredDataArr);
    }
    // build CATEGORIES filter END

    // build LANGUAGES filter START
    let languagesListSect = getE('.languagesList-fieldset').firstElementChild.nextElementSibling;
    let allLanguagesCheckBox = getE('#IsShowAllLanguages');

    allLanguagesCheckBox.checked = true;
    firstSelectedArr = [];
    if (allLanguagesCheckBox.checked) {
        for (let i = 1; i < languagesListSect.children.length; i++) {
            firstSelectedArr.push(languagesListSect.children[i].firstElementChild.value)
        }
        buildedFilter.languagesFilter = firstSelectedArr;
    }

    allLanguagesCheckBox.onchange = () => {
        filterResults(buildedFilter);
        recordsCounter(filteredDataArr);
        for (let i = 1; i < languagesListSect.children.length; i++) {
            languagesListSect.children[i].firstElementChild.checked = false;
        }
    }

    languagesListSect.onchange = (e) => {
        let selectedLanguagesArr = [];
        if (allLanguagesCheckBox.checked && firstSelectedArr.length > 0 ||
            !allLanguagesCheckBox.checked && firstSelectedArr.length > 0) {
            allLanguagesCheckBox.checked = false;
            for (let i = 1; i < languagesListSect.children.length; i++) {
                if (languagesListSect.children[i].firstElementChild.checked) {
                    selectedLanguagesArr.push(languagesListSect.children[i].firstElementChild.value);
                }
            }
            let count = 0;
            for (let i = 1; i < languagesListSect.children.length; i++) {
                if (!languagesListSect.children[i].firstElementChild.checked) count++;
                if (count === languagesListSect.children.length - 1) allLanguagesCheckBox.checked = true;
            }
            buildedFilter.languagesFilter = selectedLanguagesArr;
        }
        if (allLanguagesCheckBox.checked) {
            for (let i = 1; i < languagesListSect.children.length; i++) {
                selectedLanguagesArr.push(languagesListSect.children[i].firstElementChild.value)
            }
            buildedFilter.languagesFilter = selectedLanguagesArr;
        }
        filterResults(buildedFilter);
        recordsCounter(filteredDataArr);
    }
    // build LANGUAGES filter END

    // build AGENTS filter START
    let agentsListSect = getE('.agentsList-fieldset').firstElementChild.nextElementSibling;
    let allAgentsCheckBox = getE('#IsShowAllAgents');

    allAgentsCheckBox.checked = true;
    firstSelectedArr = [];
    if (allAgentsCheckBox.checked) {
        for (let i = 1; i < agentsListSect.children.length; i++) {
            firstSelectedArr.push(agentsListSect.children[i].firstElementChild.value)
        }
        buildedFilter.agentsFilter = firstSelectedArr;
    }

    allAgentsCheckBox.onchange = () => {
        filterResults(buildedFilter);
        recordsCounter(filteredDataArr);
        for (let i = 1; i < agentsListSect.children.length; i++) {
            agentsListSect.children[i].firstElementChild.checked = false;
        }
    }

    agentsListSect.onchange = (e) => {
        let selectedAgentsArr = [];
        if (allAgentsCheckBox.checked && firstSelectedArr.length > 0 ||
            !allAgentsCheckBox.checked && firstSelectedArr.length > 0) {
            allAgentsCheckBox.checked = false;
            for (let i = 1; i < agentsListSect.children.length; i++) {
                if (agentsListSect.children[i].firstElementChild.checked) {
                    selectedAgentsArr.push(agentsListSect.children[i].firstElementChild.value)
                }
            }
            let count = 0;
            for (let i = 1; i < agentsListSect.children.length; i++) {
                if (!agentsListSect.children[i].firstElementChild.checked) count++;
                if (count === agentsListSect.children.length - 1) allAgentsCheckBox.checked = true;
            }
            buildedFilter.agentsFilter = selectedAgentsArr;
        }
        if (allAgentsCheckBox.checked) {
            for (let i = 1; i < agentsListSect.children.length; i++) {
                selectedAgentsArr.push(agentsListSect.children[i].firstElementChild.value)
            }
            buildedFilter.agentsFilter = selectedAgentsArr;
        }
        filterResults(buildedFilter);
        recordsCounter(filteredDataArr);
    }
    // build AGENTS filter END
    isFiltred = true;
}
// BUILD FILTERS FUNCTION END

// FILTER RESULTS FUNCTION START
let filteredDataArr = [], savedfilteredDataArr = [];
async function filterResults(buildedFilter) {
    // filtering by PROJECT NAME START
    if (buildedFilter.projectsFilter !== undefined && buildedFilter.projectsFilter.length !== 0) {
        let filrteringArr = [];
        if (filteredDataArr.length !== 0) {
            filrteringArr = filteredDataArr;
            filteredDataArr = [];
        }
        else if (filteredDataArr.length === 0) {
            filrteringArr = globalWorkRecords;
        }
        for (let i = 0; i < filrteringArr.length; i++) {
            for (let a = 0; a < buildedFilter.projectsFilter.length; a++) {
                if (filrteringArr[i].projectName === buildedFilter.projectsFilter[a]) {
                    filteredDataArr.push(filrteringArr[i]);
                }
            }
        }
    }
    // filtering by PROJECT NAME END

    // filtering by CONVERSATION TYPE START
    if (buildedFilter.convTypesFilter !== undefined && buildedFilter.convTypesFilter.length !== 0) {
        let filrteringArr = [];
        if (filteredDataArr.length !== 0) {
            filrteringArr = filteredDataArr;
            filteredDataArr = [];
        }
        else if (filteredDataArr.length === 0) {
            filrteringArr = globalWorkRecords;
        }
        for (let i = 0; i < filrteringArr.length; i++) {
            for (let a = 0; a < buildedFilter.convTypesFilter.length; a++) {
                if (filrteringArr[i].conversationType === buildedFilter.convTypesFilter[a]) {
                    filteredDataArr.push(filrteringArr[i]);
                }
            }
        }
    }
    // filtering by CONVERSATION TYPE END

    // filtering by CATEGORY START
    if (buildedFilter.categoriesFilter !== undefined && buildedFilter.categoriesFilter.length !== 0) {
        let filrteringArr = [];
        if (filteredDataArr.length !== 0) {
            filrteringArr = filteredDataArr;
            filteredDataArr = [];
        }
        else if (filteredDataArr.length === 0) {
            filrteringArr = globalWorkRecords;
            // sortedArrayByDate.length === 0 ? filrteringArr = allRecords : filrteringArrsortedArrayByDate;
        }
        for (let i = 0; i < filrteringArr.length; i++) {
            for (let a = 0; a < buildedFilter.categoriesFilter.length; a++) {
                if (filrteringArr[i].conversationCategory === buildedFilter.categoriesFilter[a]) {
                    filteredDataArr.push(filrteringArr[i]);
                }
            }
        }
    }
    // filtering by CATEGORY END

    // filtering by LANGUAGES START
    if (buildedFilter.languagesFilter !== undefined && buildedFilter.languagesFilter.length !== 0) {
        let filrteringArr = [];
        if (filteredDataArr.length !== 0) {
            filrteringArr = filteredDataArr;
            filteredDataArr = [];
        }
        else if (filteredDataArr.length === 0) {
            filrteringArr = globalWorkRecords;
        }
        for (let i = 0; i < filrteringArr.length; i++) {
            for (let a = 0; a < buildedFilter.languagesFilter.length; a++) {
                if (filrteringArr[i].conversationLanguage === buildedFilter.languagesFilter[a]) {
                    filteredDataArr.push(filrteringArr[i]);
                }
            }
        }
    }
    // filtering by LANGUAGES END

    // filtering by AGENT NAME START
    if (buildedFilter.agentsFilter !== undefined && buildedFilter.agentsFilter.length !== 0) {
        let filrteringArr = [];
        if (filteredDataArr.length !== 0) {
            filrteringArr = filteredDataArr;
            filteredDataArr = [];
        }
        else if (filteredDataArr.length === 0) {
            filrteringArr = globalWorkRecords;
        }
        for (let i = 0; i < filrteringArr.length; i++) {
            for (let a = 0; a < buildedFilter.agentsFilter.length; a++) {
                if (filrteringArr[i].lastOperator === buildedFilter.agentsFilter[a]) {
                    filteredDataArr.push(filrteringArr[i]);
                }
            }
        }
    }
    // filtering by AGENT NAME END

    // reset sort arrows START
    for (let table = 0; table < getE('.content').children.length; table++) {
        let tRow = getE('.content').children[table].firstElementChild.firstElementChild;
        for (let i = 0; i < tRow.children.length; i++) {
            tRow.children[i].setAttribute('name', true);
            tRow.children[i].firstElementChild.innerHTML = "";
        }
    }
    // reset sort arrows END

    if(filteredDataArr.length>0){
    getE("#downloadCustomReport").disabled = false;
    }

    savedfilteredDataArr = [...filteredDataArr];
    getE('.count-box').innerHTML = `<span><span class="count-number">Y ${savedfilteredDataArr.length}</span> звернень</span>`;
    await recordsCounter(filteredDataArr);
    await countCategories(filteredDataArr);
    await countLanguages(filteredDataArr);
    await countManagersPerf(filteredDataArr);
    await countTags(filteredDataArr);
    filteredDataArr = [];
}
// FILTER RESULTS FUNCTION END

// COUNT ALL ITEMS FUNCTION START
let cleanRecordsCountObj = {}, projectsList;
async function recordsCounter(dataToCount) {
    // count unique project start
    let allRecordsProject = [];
    for (let i = 0; i < dataToCount.length; i++) {
        allRecordsProject.push(dataToCount[i].projectName)
    }
    projectsList = allRecordsProject.filter((item, i, arr) => arr.indexOf(item) === i);
    let newProject = [];
    for (let i = 0; i < projectsList.length; i++) {
        let regexProjectName = new RegExp(projectsList[i], "g");
        let projectCount = allRecordsProject.join(" ").match(regexProjectName).length;
        newProject.push({ [projectsList[i]]: projectCount });
    }
    cleanRecordsCountObj.projectsCount = Object.assign({}, newProject);
    // count unique project end

    // count unique conversation types start
    let newConvTypes = [];
    let allRecordsConversationTypes = [];
    for (let i = 0; i < dataToCount.length; i++) {
        allRecordsConversationTypes.push(dataToCount[i].conversationType)
    }
    let conversationTypesList = allRecordsConversationTypes.filter((item, i, arr) => arr.indexOf(item) === i);
    let addCountent = "";
    for (let i = 0; i < conversationTypesList.length; i++) {
        let regexConversationTypes = new RegExp(conversationTypesList[i], "g");
        let convTypesCount = allRecordsConversationTypes.join(" ").match(regexConversationTypes).length;
        newConvTypes.push({ [conversationTypesList[i]]: convTypesCount });
    }
    cleanRecordsCountObj.convTypesCount = Object.assign({}, newConvTypes);
    // count unique conversation types end

    // count unique categories start
    let newCategories = [];
    let allRecordsCategory = [];
    for (let i = 0; i < dataToCount.length; i++) {
        allRecordsCategory.push(dataToCount[i].conversationCategory);
        if (dataToCount[i].conversationCategory === "Без категорії") {
        }
    }
    let categoriesList = allRecordsCategory.filter((item, i, arr) => arr.indexOf(item) === i);
    addCountent = "";
    for (let i = 0; i < categoriesList.length; i++) {
        let regexCategoryName;
        if (categoriesList[i] !== undefined) {
            if (categoriesList[i] !== "Макс бет (игры/слоты)" &&
                categoriesList[i] !== "Технические проблемы (кроме бонусов)") {
                regexCategoryName = new RegExp(categoriesList[i], "g");
            }
            if (categoriesList[i] === "Макс бет (игры/слоты)") {
                regexCategoryName = /Макс бет \(игры\/слоты\)/g;
            }
            if (categoriesList[i] === "Технические проблемы (кроме бонусов)") {
                regexCategoryName = /Технические проблемы \(кроме бонусов\)/g;
            }
            let categoriesCount = allRecordsCategory.join(" ").match(regexCategoryName).length;
            newCategories.push({ [categoriesList[i]]: categoriesCount });
        }
    }
    cleanRecordsCountObj.categoriesCount = Object.assign({}, newCategories);
    // count unique categories end

    // count unique languages types start
    let newLang = [];
    let allRecordsLanguages = [];
    for (let i = 0; i < dataToCount.length; i++) {
        allRecordsLanguages.push(dataToCount[i].conversationLanguage)
        if (dataToCount[i].conversationLanguage === "Без мови") {
        }
    }
    let languagesList = allRecordsLanguages.filter((item, i, arr) => arr.indexOf(item) === i);
    addCountent = "";
    for (let i = 0; i < languagesList.length; i++) {
        let regexLanguages = new RegExp(languagesList[i], "g");
        let languagesCount = allRecordsLanguages.join(" ").match(regexLanguages).length;
        newLang.push({ [languagesList[i]]: languagesCount });
    }
    cleanRecordsCountObj.languagesCount = Object.assign({}, newLang);
    // count unique languages types end

    // count unique agents start
    let newAgents = [];
    let allRecordsAgent = [];
    for (let i = 0; i < dataToCount.length; i++) {
        allRecordsAgent.push(dataToCount[i].lastOperator)
    }
    let agentsList = allRecordsAgent.filter((item, i, arr) => arr.indexOf(item) === i);
    addCountent = "";
    for (let i = 0; i < agentsList.length; i++) {
        if (agentsList[i] !== undefined) {
            let regexAgentName = new RegExp(agentsList[i], "g");
            let agentsCount = allRecordsAgent.join(" ").match(regexAgentName).length;
            newAgents.push({ [agentsList[i]]: agentsCount });
        }
    }

    cleanRecordsCountObj.agentsCount = Object.assign({}, newAgents);
    // count unique agents end

    return cleanRecordsCountObj;
}
// COUNT ALL ITEMS FUNCTION END

// SHOW AND BUILD DIALOG WINDOW FUNCTION START
let dialogContainer = getE('.dialogWindow-container'),
    dialogWindow = getE('.dialogWindow'),
    dialogHeader = getE('.dialogWindow-header'),
    dialogContent = getE('.dialogWindow-content');
async function showAndBuildDialog(checkList) {
    dialogContainer.classList.toggle('hide');
    dialogContent.innerHTML = `<p>У вибірці виявлено наступні елементи. Оберіть які з них очистити:</p>`;
    let cleanOptions = "", emptyCases = true, noReplyAndCat = true, catDups = true, noLang = true,
        countObj = { empty: 0, noReplyAndCat: 0, catDups: 0, noLang: 0 };
    for (let record = 0; record < checkList.length; record++) {
        if (checkList[record].problemType === "EMPTY" && emptyCases) countObj.empty++;
        if (checkList[record].problemType === "NOREPLYANDCAT" && noReplyAndCat) countObj.noReplyAndCat++;
        if (checkList[record].problemType === "CATDUPS" && catDups) countObj.catDups++;
        if (checkList[record].problemType === "NOLANG" && noLang) countObj.noLang++;
    }
    for (let i = 0; i < checkList.length; i++) {
        let titleSet = `Знайдено ${countObj.empty} звернень в яких відсутня мітка категорії.`;
        if (checkList[i].problemType === "EMPTY" && emptyCases) {
            cleanOptions += `<label for="emptyCases" title="${titleSet}">
            <input type="checkbox" name="emptyCases" id="emptyCases" checked>
            - без мітки категорії
            <span id="emptyBadge">(${countObj.empty})</span>
            </label>`;
            emptyCases = false;
        }
        titleSet = `Знайдено ${countObj.noReplyAndCat} звернень в яких є мітка категорії разом з NO REPLY та/або SPAM.`;
        if (checkList[i].problemType === "NOREPLYANDCAT" && noReplyAndCat) {
            cleanOptions += `<label for="noReplyAndCat" title="${titleSet}">
            <input type="checkbox" name="noReplyAndCat" id="noReplyAndCat" checked>
            - категорія та NO REPLY разом
            <span id="noReplyAndCatBadge"> (${countObj.noReplyAndCat})</span>
            </label>`;
            noReplyAndCat = false;
        }
        titleSet = `Знайдено ${countObj.catDups} звернень в які мають більше ніж одну мітку категорії.`;
        if (checkList[i].problemType === "CATDUPS" && catDups) {
            cleanOptions += `<label for="catDups" title="${titleSet}">
            <input type="checkbox" name="catDups" id="catDups" checked>
            - категорія дубльована
            <span id="catDupsBadge">(${countObj.catDups})</span>
            </label>`;
            catDups = false;
        }
        titleSet = `Знайдено ${countObj.noLang} звернень в які не мають мітки мови.`;
        if (checkList[i].problemType === "NOLANG" && noLang) {
            cleanOptions += `<label for="noLang" title="${titleSet}">
            <input type="checkbox" name="noLang" id="noLang">
            - немає мітки мови
            <span id="noLangBadge">(${countObj.noLang})</span>
            </label>`;
            noLang = false;
        }
    }
    dialogContent.innerHTML += cleanOptions;
}
// SHOW AND BUILD DIALOG WINDOW FUNCTION END

// CHECK CLEANING OPTION FUNCTION START
let cleanChoice = [], cleaningCheck = getE('#cleaningCheck');
dialogWindow.onchange = () => {
    let dialogContent = getE('.dialogWindow-content'),
        btnClean = getE('#dialogClean'),
        btnIgnore = getE('#dialogIgnore'),
        emptyCheck = getE('#emptyCases'),
        emptyBadge = getE('#emptyBadge'),
        noReplyAndCatCheck = getE('#noReplyAndCat'),
        noReplyAndCatBadge = getE('#noReplyAndCatBadge'),
        catDupsCheck = getE('#catDups'),
        catDupsBadge = getE('#catDupsBadge'),
        noLangCheck = getE('#noLang'),
        noLangBadge = getE('#noLangBadge');

    if (cleaningCheck.checked) {
        if (emptyCheck) {
            if (emptyCheck.checked) {
                if (!cleanChoice.includes("EMPTY")) cleanChoice.push("EMPTY");
                emptyBadge.style.display = "block";
            }
            emptyCheck.disabled = true;
        }
        if (noReplyAndCatCheck) {
            if (noReplyAndCatCheck.checked) {
                if (!cleanChoice.includes("NOREPLYANDCAT")) cleanChoice.push("NOREPLYANDCAT");
                noReplyAndCatBadge.style.display = "block";
            }
            noReplyAndCatCheck.disabled = true;
        }
        if (catDupsCheck) {
            if (catDupsCheck.checked) {
                if (!cleanChoice.includes("CATDUPS")) cleanChoice.push("CATDUPS");
                catDupsBadge.style.display = "block";
            }
            catDupsCheck.disabled = true;
        }
        if (noLangCheck) {
            if (noLangCheck.checked) {
                if (!cleanChoice.includes("NOLANG")) cleanChoice.push("NOLANG");
                noLangBadge.style.display = "block";
            }
            noLangCheck.disabled = true;
        }
        btnClean.disabled = false;
        btnIgnore.disabled = false;
    }
    else if (!cleaningCheck.checked) {
        if (emptyCheck) {
            if (emptyCheck.checked) emptyBadge.style.display = "block";
            if (!emptyCheck.checked) {
                emptyBadge.style.display = "none";
                cleanChoice.splice(cleanChoice.indexOf("EMPTY"));
            }
            emptyCheck.disabled = false;
        }
        if (noReplyAndCatCheck) {
            if (noReplyAndCatCheck.checked) noReplyAndCatBadge.style.display = "block";
            if (!noReplyAndCatCheck.checked) {
                noReplyAndCatBadge.style.display = "none";
                cleanChoice.splice(cleanChoice.indexOf("NOREPLYANDCAT"));
            }
            noReplyAndCatCheck.disabled = false;
        }
        if (catDupsCheck) {
            if (catDupsCheck.checked) catDupsBadge.style.display = "block";
            if (!catDupsCheck.checked) {
                catDupsBadge.style.display = "none";
                cleanChoice.splice(cleanChoice.indexOf("CATDUPS"));
            }
            catDupsCheck.disabled = false;
        }
        if (noLangCheck) {
            if (noLangCheck.checked) noLangBadge.style.display = "block";
            if (!noLangCheck.checked) {
                noLangBadge.style.display = "none";
                cleanChoice.splice(cleanChoice.indexOf("NOLANG"));
            }
            noLangCheck.disabled = false;
        }
        btnClean.disabled = true;
        btnIgnore.disabled = true;
    }
}
// CHECK CLEANING OPTION FUNCTION END

// DIALOG CLEAN BUTTON FUNCTION START
function dialogClean() {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < checkList.length; i++) {
            for (let c = 0; c < cleanChoice.length; c++) {
                // clear empty records start
                if (cleanChoice[c] === "EMPTY") {
                    if (checkList[i].problemType === "EMPTY") {
                        for (let a = 0; a < allRecords.length; a++) {
                            if (checkList[i].id === allRecords[a].conferenceId) {
                                allRecords.splice(allRecords.indexOf(allRecords[a]), 1);
                            }
                        }
                        for (let a = 0; a < recordsChats.length; a++) {
                            if (checkList[i].id === recordsChats[a].conferenceId) {
                                recordsChats.splice(recordsChats.indexOf(recordsChats[a]), 1);
                            }
                        }
                        for (let a = 0; a < recordsTickets.length; a++) {
                            if (checkList[i].id === recordsTickets[a].conferenceId) {
                                recordsTickets.splice(recordsTickets.indexOf(recordsTickets[a]), 1);
                            }
                        }
                    }
                }
                // clear empty records end

                // clear records without language start
                if (cleanChoice[c] === "NOLANG") {
                    if (checkList[i].problemType === "NOLANG") {
                        for (let a = 0; a < allRecords.length; a++) {
                            if (checkList[i].id === allRecords[a].conferenceId) {
                                allRecords.splice(allRecords.indexOf(allRecords[a]), 1);
                            }
                        }
                        for (let a = 0; a < recordsChats.length; a++) {
                            if (checkList[i].id === recordsChats[a].conferenceId) {
                                recordsChats.splice(recordsChats.indexOf(recordsChats[a]), 1);
                            }
                        }
                        for (let a = 0; a < recordsTickets.length; a++) {
                            if (checkList[i].id === recordsTickets[a].conferenceId) {
                                recordsTickets.splice(recordsTickets.indexOf(recordsTickets[a]), 1);
                            }
                        }
                    }
                }
                // clear records without language end

                // clear no reply and category records start
                if (cleanChoice[c] === "NOREPLYANDCAT") {
                    if (checkList[i].problemType === "NOREPLYANDCAT") {
                        for (let a = 0; a < allRecords.length; a++) {
                            if (checkList[i].id === allRecords[a].conferenceId) {
                                allRecords.splice(allRecords.indexOf(allRecords[a]), 1);
                            }
                        }
                        for (let a = 0; a < recordsChats.length; a++) {
                            if (checkList[i].id === recordsChats[a].conferenceId) {
                                recordsChats.splice(recordsChats.indexOf(recordsChats[a]), 1);
                            }
                        }
                        for (let a = 0; a < recordsTickets.length; a++) {
                            if (checkList[i].id === recordsTickets[a].conferenceId) {
                                recordsTickets.splice(recordsTickets.indexOf(recordsTickets[a]), 1);
                            }
                        }
                    }
                }
                // clear no reply and category records end

                // clear category dups records start
                if (cleanChoice[c] === "CATDUPS") {
                    if (checkList[i].problemType === "CATDUPS") {
                        for (let a = 0; a < allRecords.length; a++) {
                            if (checkList[i].id === allRecords[a].conferenceId) {
                                allRecords.splice(allRecords.indexOf(allRecords[a]), 1);
                            }
                        }
                        for (let a = 0; a < recordsChats.length; a++) {
                            if (checkList[i].id === recordsChats[a].conferenceId) {
                                recordsChats.splice(recordsChats.indexOf(recordsChats[a]), 1);
                            }
                        }
                        for (let a = 0; a < recordsTickets.length; a++) {
                            if (checkList[i].id === recordsTickets[a].conferenceId) {
                                recordsTickets.splice(recordsTickets.indexOf(recordsTickets[a]), 1);
                            }
                        }
                    }
                }
                // clear category dups records end
            }
        }
        cleaningCheck.checked = false;
        globalWorkRecords = [...allRecords];
        dialogContainer.classList.toggle('hide');
        resolve(buildFilteringSection());
    })
}
// DIALOG CLEAN BUTTON FUNCTION END

// DIALOG IGNORE BUTTON FUNCTION START
function dialogIgnore() {
    new Promise((resolve, reject) => {
        dialogContainer.classList.toggle('hide');
        cleaningCheck.checked = false;
        resolve(buildFilteringSection());
    })
}
// DIALOG IGNORE BUTTON FUNCTION END

// UPDATE ALL COUNTS ON PAGE FUNCTION START
const dataFilteringContainer = getE(".data-filtering-container");
dataFilteringContainer.onchange = async (e) => {
    let badgeCountsObj = await recordsCounter(savedfilteredDataArr);
    recCounter(badgeCountsObj);
}
async function recCounter(badgeCountsObj) {
    let countObjKeys = [];
    for (const key in badgeCountsObj) countObjKeys.push(key);
    let countWasSetArr = [];
    for (let objKey = 0; objKey < countObjKeys.length; objKey++) {
        for (let i = 0; i < Object.keys(badgeCountsObj[countObjKeys[objKey]]).length; i++) {
            let optionLabel = Object.keys(badgeCountsObj[countObjKeys[objKey]][i]).toString(),
                optionCount = Object.values(badgeCountsObj[countObjKeys[objKey]][i]).toString();
            if (countObjKeys[objKey] === "categoriesCount") {
                for (const key in categoryRuNames) {
                    if (optionLabel === categoryRuNames[key]) optionLabel = key;
                }
            }
            if (countObjKeys[objKey] === "languagesCount") {
                for (const key in languagesRuNames) {
                    if (optionLabel === languagesRuNames[key]) optionLabel = key;
                }
            }
            let setNewBadgeCount = getE(`#isShow${optionLabel}`).nextElementSibling.children[1];
            setNewBadgeCount.innerHTML = optionCount;
            // setNewBadgeCount.style.opacity = 1;
            // setNewBadgeCount.classList.remove("zeroRecords");
            countWasSetArr.push(setNewBadgeCount.id);
        }
    }
    let allCountBadgeIds = [];
    for (let sectNum = 0; sectNum < dataFilteringContainer.children.length - 1; sectNum++) {
        let currSection = dataFilteringContainer.children[sectNum].firstElementChild.nextElementSibling;
        for (let elem = 1; elem < currSection.children.length; elem++) {
            let checkingElem = currSection.children[elem].firstElementChild.nextElementSibling.children[1];
            allCountBadgeIds.push(checkingElem.id)
        }
    }
    let setZerosArr = allCountBadgeIds.filter(function (n) { return !this.has(n) }, new Set(countWasSetArr));
    for (let zeroElem = 0; zeroElem < setZerosArr.length; zeroElem++) {
        getE(`#${setZerosArr[zeroElem]}`).innerHTML = 0;
        // getE(`#${setZerosArr[zeroElem]}`).style.opacity = 0;
        // getE(`#${setZerosArr[zeroElem]}`).classList.add("zeroRecords");
    }

    if (getE('#IsShowAllProjects').checked &&
        getE('#IsShowAllConversationTypes').checked &&
        getE('#IsShowAllCategories').checked &&
        getE('#IsShowAllLanguages').checked &&
        getE('#IsShowAllAgents').checked && isDateRangeSelected) {
        getE("#downloadCustomReport").disabled = true;
    }
    else {
        getE("#downloadCustomReport").disabled = false;
    }
}
// UPDATE ALL COUNTS ON PAGE FUNCTION END

// BUILD REPORT SECTION FUNCTION START
let buildReportOptionArr = {};
let reportContainer = getE(".report-container");
async function buildReportSection() {
    reportContainer.style.opacity = '1';
    reportContainer.style.height = '49%';

    // reportContainer.style.padding = '15px 20px';
    // reportContainer.style.display = 'block';
    let addContent = "";
    reportContainer.innerHTML = `
            <div><h2>Сформувати очищені звіти:</h2><p class="info-icon">&#8505;</p><div class="info-message">
            <p>На основі оброблених данних з ваших звітів можна сформувати типізовані звіти з:<br>
            - чатами;<br>
            - листами;<br>
            - всіма зверненнями (чати та листи разом);<br>
            - неправильно проставленими мітками;<br>
            - чатами для перевірки на об'єднання.</p>
            <p>Для того щоб завантажити звіт потрібно спочатку створити відповідний кнопкою "Створити". Коли звіт буде готовий кнопка "Завантажити" стане активною.<br>
            В результаті завантаження ви отримаєте потрібний/і файл/и у форматі .csv.</p></div></div>`;
    for (let i = 0; i < Object.keys(buildReportOptionArr).length; i++) {
        if (Object.keys(buildReportOptionArr)[i] === "recordsChats") {
            addContent = `<fieldset>
            <legend>- чати</legend>
            <input type="button" id="createChatReport" 
            onclick="createReport(recordsChats,'chat')" value="Створити">
            <input type="button" onclick="downloadFile(reportData.chat.fileLink, reportData.chat.reportName)"
            id="downloadChatReport" value="Завантажити" disabled>
            </fieldset>`;
        }
        reportContainer.innerHTML += addContent;
        addContent = "";
        if (Object.keys(buildReportOptionArr)[i] === "recordsTickets") {
            addContent = `<fieldset>
            <legend>- листи</legend>
            <input type="button" id="createTicketReport" 
            onclick="createReport(recordsTickets,'ticket')" value="Створити">
            <input type="button" onclick="downloadFile(reportData.ticket.fileLink, reportData.ticket.reportName)"
            id="downloadTicketReport" value="Завантажити" disabled>
            </fieldset>`;
        }
        reportContainer.innerHTML += addContent;
        addContent = "";
        if (Object.keys(buildReportOptionArr)[i] === "allRecords") {
            addContent = `<fieldset>
            <legend>- спільний звіт</legend>
            <input type="button" id="createGeneralReport" 
            onclick="createReport(allRecords,'general')" value="Створити">
            <input type="button" onclick="downloadFile(reportData.general.fileLink, reportData.general.reportName)"
            id="downloadGeneralReport" value="Завантажити" disabled>
            </fieldset>`;
        }
        reportContainer.innerHTML += addContent;
        addContent = "";
        if (Object.keys(buildReportOptionArr)[i] === "checkList") {
            addContent = `<fieldset>
            <legend>- звернення на перевірку</legend>
            <input type="button" id="createCheckReport" 
            onclick="createReport(checkList,'check')" value="Створити">
            <input type="button" onclick="downloadFile(reportData.check.fileLink, reportData.check.reportName)"
            id="downloadCheckReport" value="Завантажити" disabled>
            </fieldset>`;
        }
        reportContainer.innerHTML += addContent;
    }
    if (recordsChats.length !== 0) {
        addContent = `<fieldset>
        <legend>- чати на об'єднання</legend>
        <input type="button" id="createMergingChatReport" 
        onclick="findMergeChatsStart()" value="Створити">
        <input type="button" onclick="downloadFile(reportData.merging.fileLink, reportData.merging.reportName)"
        id="downloadChatMerging" value="Завантажити" disabled>
        </fieldset>`;
    }
    // if (allRecords.length !== 0) {
        // addContent = `<fieldset>
        // <legend>- погодинка</legend>
        // <input type="button" id="createHourlyDistributionReport" 
        // onclick="launchHourlyDistReport()" value="Створити">
        // <input type="button" onclick="downloadFile(reportData.hourly.fileLink, reportData.hourly.reportName)"
        // id="downloadHourlyDistributionReport" value="Завантажити" disabled>
        // </fieldset>`;
    // }
    reportContainer.innerHTML += addContent;
    reportContainer.classList.remove('hide');
}
// BUILD REPORT SECTION FUNCTION END

// GENERATE REPORT FUNCTION START
let reportData = { chat: {}, ticket: {}, general: {}, check: {}, merging: {}, filtered: {}, hourly: {} };
async function createReport(recordsForReport, reportType) {
    let recordsToWork = [...recordsForReport];
    return new Promise((resolve) => {
        let csv = "";
        let fRow = false;
        for (let row = 0; row < recordsToWork.length; row++) {
            if (reportType === "check") {
                delete recordsToWork[row].rmvPosChats;
                delete recordsToWork[row].rmvPosTickets;
                delete recordsToWork[row].rmvPosAllList;
            }
            let keysAmount = Object.keys(recordsToWork[row]).length;
            let keysCounter = 0;
            if (row === 0) {
                for (let key in recordsToWork[row]) {
                    if (keysCounter + 1 < keysAmount) {
                        let dataToSet = "\"" + key + "\"";
                        csv += dataToSet + (keysCounter + 2 < keysAmount ? ',' : '\r\n');
                        keysCounter++;
                        fRow = true;
                    }
                }
            }
            keysCounter = 0;
            if (row === 0 && fRow) {
                for (let key in recordsToWork[row]) {
                    if (keysCounter + 1 < keysAmount) {
                        let dataToSet = "\"" + (Array.isArray(recordsToWork[row][key]) ? recordsToWork[row][key].join(";") : recordsToWork[row][key]) + "\"";
                        csv += dataToSet + (keysCounter + 2 < keysAmount ? ',' : '\r\n');
                        keysCounter++;
                    }
                }
            }
            else {
                for (let key in recordsToWork[row]) {
                    if (keysCounter + 1 < keysAmount) {
                        let dataToSet = "\"" + (Array.isArray(recordsToWork[row][key]) ? recordsToWork[row][key].join(";") : recordsToWork[row][key]) + "\"";
                        csv += dataToSet + (keysCounter + 2 < keysAmount ? ',' : '\r\n');
                        keysCounter++;
                    }
                }
            }
            keysCounter = 0;
        }
        let setToButton;
        let reportDateTime = new Date().toLocaleString("uk-UA");
        if (reportType === "chat") {
            getE('#createChatReport').disabled = true;
            reportData.chat.reportName = "CHAT_report_" + reportDateTime.replace(",", "");
            reportData.chat.fileLink = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv);
            setToButton = getE('#downloadChatReport');
        }
        if (reportType === "ticket") {
            getE('#createTicketReport').disabled = true;
            reportData.ticket.reportName = "TICKET_report_" + reportDateTime.replace(",", "");
            reportData.ticket.fileLink = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv);
            setToButton = getE('#downloadTicketReport');
        }
        if (reportType === "general") {
            getE('#createGeneralReport').disabled = true;
            reportData.general.reportName = "GENERAL_report_" + reportDateTime.replace(",", "");
            reportData.general.fileLink = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv);
            setToButton = getE('#downloadGeneralReport');
        }
        if (reportType === "check") {
            getE('#createCheckReport').disabled = true;
            reportData.check.reportName = "CHECK_report_" + reportDateTime.replace(",", "");
            reportData.check.fileLink = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv);
            setToButton = getE('#downloadCheckReport');
        }
        if (reportType === "filteredData") {
            reportData.filtered.reportName = "FILTERED_report_" + reportDateTime.replace(",", "");
            reportData.filtered.fileLink = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv);
            setToButton = false;
        }
        if (!setToButton) downloadFile(reportData.filtered.fileLink, reportData.filtered.reportName);
        else resolve(setToButton.disabled = false);
    })

}
// GENERATE REPORT FUNCTION END

// DOWNLOAD FILE FUNCTION START
function downloadFile(fileLink, reportName) {
    let newW = window.open();
    let link = document.createElement('a');
    link.id = 'download-csv';
    link.setAttribute('href', fileLink);
    link.setAttribute('download', `${reportName}.csv`);
    document.body.appendChild(link);
    document.querySelector("#download-csv").click();
    document.querySelector("#download-csv").remove();
    fileLink = '';
    reportName = '';
    newW.close();
}
// DOWNLOAD FILE FUNCTION END

// SHOW DROP DOWN LIST FUNTION START
let currentDropDownName;
function showDropDown(e) {
    currentDropDownName = 'emptyName';
    if (!e.target.classList.contains('activeDropDown')) {
        for (let i = 0; i < dataFilteringContainer.children.length - 1; i++) {
            dataFilteringContainer.children[i].firstElementChild.classList.remove('activeDropDown');
            dataFilteringContainer.children[i].firstElementChild.nextElementSibling.classList.remove('showDropDown');
        }
        e.target.nextElementSibling.classList.toggle('showDropDown');
        e.target.classList.toggle('activeDropDown');
        currentDropDownName = e.target.getAttribute('name');
    }
    if ((e.target.id === "dates-range-label")) {
        currentDropDownName = e.target.getAttribute('name');
        e.target.nextElementSibling.classList.toggle('showDropDown');
    }
}
// SHOW DROP DOWN LIST FUNTION END

// HIDE DROP DOWN LIST FUNTION START
window.onclick = (e) => {
    if (e.target.id !== "dates-range-label" && e.target.getAttribute('name') === "datesDropDown") {
    }
    else if (e.target.id !== "dates-range-label") {
        getE('#dates-range-label').nextElementSibling.classList.remove('showDropDown');
        getE('#dates-range-label').classList.remove('activeDropDown');
        for (let i = 0; i < dataFilteringContainer.children.length - 1; i++) {
            let legendElem = dataFilteringContainer.children[i].firstElementChild;
            if (legendElem.nextElementSibling.classList.contains('showDropDown') &&
                e.target.getAttribute('name') !== currentDropDownName) {
                legendElem.nextElementSibling.classList.remove('showDropDown');
                legendElem.classList.remove('activeDropDown');
            }
        }
    }
    else if (e.target.id === "dates-range-label") {
        let legendElem = e.target;
        legendElem.nextElementSibling.classList.toggle('showDropDown');
    }
}
// HIDE DROP DOWN LIST FUNTION END

// SHOW DATA TABLE CONTAINER FUCNTION START
function showDataTable() {
    getE('.display-data-container').classList.remove('hide');
}
// SHOW DATA TABLE CONTAINER FUCNTION END

// DATA TABLE SHOW/HIDE EFFECT FUNCTION START
let menu = document.querySelector('.menu'),
    content = document.querySelector('.content');
menu.onclick = (e) => {
    for (let elem = 0; elem < menu.children.length; elem++) {
        if (menu.children[elem].id === e.target.id) {
            menu.children[elem].classList.add('active');
            let idNum = e.target.id.substring(e.target.id.length - 1);
            for (let conElem = 0; conElem < content.children.length; conElem++) {
                if (content.children[conElem].id === `data-table-${idNum}`) content.children[conElem].classList.add('show');
                else content.children[conElem].classList.remove('show');
            }
        }
        else menu.children[elem].classList.remove('active');
    }
}
// DATA TABLE SHOW/HIDE EFFECT FUNCTION END

// COUNT CATEGORIES FUNCTION START
let countedCategoriesList = [], savedCountedCategoriesList = [];
async function countCategories(recordsToCount) {
    let allCategories = "";
    for (let record = 0; record < recordsToCount.length; record++) {
        allCategories += recordsToCount[record].conversationCategory + ",";
    }
    for (const categoryKey in categoryRuNames) {
        let categoryName = categoryRuNames[categoryKey], categoryRegex;
        if (categoryName !== "Макс бет (игры/слоты)" &&
            categoryName !== "Технические проблемы (кроме бонусов)") {
            categoryRegex = new RegExp(categoryName, "gm");
        }
        if (categoryName === "Макс бет (игры/слоты)") categoryRegex = /Макс бет \(игры\/слоты\)/gm;
        if (categoryName === "Технические проблемы (кроме бонусов)") categoryRegex = /Технические проблемы \(кроме бонусов\)/gm;
        if (categoryRegex.test(allCategories)) {
            let categoryCount = allCategories.match(categoryRegex).length;
            countedCategoriesList.push({ [categoryName]: categoryCount });
        }
    }
    savedCountedCategoriesList = [...countedCategoriesList];
    await buildTable(savedCountedCategoriesList, "categories");
    countedCategoriesList = [];
}
// COUNT CATEGORIES FUNCTION END

// COUNT LANGUAGES FUNCTION START
let countedLanguagesList = [], savedCountedLanguagesList = [];
async function countLanguages(recordsToCount) {
    let allLanguages = "";
    for (let record = 0; record < recordsToCount.length; record++) {
        allLanguages += recordsToCount[record].conversationLanguage + ",";
    }
    for (const langKey in languagesRuNames) {
        let langName = languagesRuNames[langKey],
            langRegex = new RegExp(langName, "gm");
        if (langRegex.test(allLanguages)) {
            let langCount = allLanguages.match(langRegex).length;
            countedLanguagesList.push({ [langName]: langCount });
        }
    }
    await buildTable(countedLanguagesList, "languages");
    savedCountedLanguagesList = [...countedLanguagesList];
    countedLanguagesList = [];
}
// COUNT LANGUAGES FUNCTION END

// COUNT MANAGERS PERFORMANCE FUNCTION START
let countedManagersPerfList = [], savedCountedManagersPerfList = [];
async function countManagersPerf(recordsToCount) {
    let allManagersChat = "",
        allManagersGen = "";
    for (let record = 0; record < recordsToCount.length; record++) {
        if (recordsToCount[record].conversationType === 'chat') {
            allManagersChat += recordsToCount[record].lastOperator + ",";
        }
        allManagersGen += recordsToCount[record].lastOperator + ",";
    }
    // manager all conversations count START
    for (let manager = 0; manager < managersList.length; manager++) {
        let managerRegex = new RegExp(managersList[manager], "gm");
        if (managerRegex.test(allManagersGen)) {
            let managerCount = allManagersGen.match(managerRegex).length;
            countedManagersPerfList.push({ [managersList[manager]]: { convCount: managerCount, allConvDur: 0, allFirstResp: 0, chatsCount: 0, ticketsCount: 0 } });
        }
    }
    // manager all conversations count END

    // manager chats and tickets separately count START
    for (let record = 0; record < recordsToCount.length; record++) {
        if (recordsToCount[record].conversationType === 'chat') {
            for (let manager = 0; manager < countedManagersPerfList.length; manager++) {
                let currManagerObj = Object.keys(countedManagersPerfList[manager]).toString();
                if (recordsToCount[record].lastOperator === currManagerObj) {
                    countedManagersPerfList[manager][currManagerObj].chatsCount++;
                }
            }
        }
        else if (recordsToCount[record].conversationType === 'ticket') {
            for (let manager = 0; manager < countedManagersPerfList.length; manager++) {
                let currManagerObj = Object.keys(countedManagersPerfList[manager]).toString();
                if (recordsToCount[record].lastOperator === currManagerObj) {
                    countedManagersPerfList[manager][currManagerObj].ticketsCount++;
                }
            }
        }
    }
    // manager chats and tickets separately count END

    // all conversations duration per manager START
    for (let record = 0; record < recordsToCount.length; record++) {
        if (recordsToCount[record].conversationType === 'chat' &&
            recordsToCount[record].specialFields !== undefined) {
            for (let manager = 0; manager < countedManagersPerfList.length; manager++) {
                let currManagerObj = Object.keys(countedManagersPerfList[manager]).toString();
                if (recordsToCount[record].lastOperator === currManagerObj) {
                    countedManagersPerfList[manager][currManagerObj].allConvDur += (parseInt((recordsToCount[record].specialFields.conversationTimings.agentsChattingDuration)));
                    if (recordsToCount[record].lastOperator === "noAgent") {
                        countedManagersPerfList[manager][currManagerObj].allConvDur = -1;
                    }
                }
            }
        }
    }
    // all conversations duration per manager END

    // all conversations first reponse time per manager START
    for (let record = 0; record < recordsToCount.length; record++) {
        if (recordsToCount[record].conversationType === 'chat') {
            for (let manager = 0; manager < countedManagersPerfList.length; manager++) {
                let currManagerObj = Object.keys(countedManagersPerfList[manager]).toString();
                if (recordsToCount[record].lastOperator === currManagerObj) {
                    countedManagersPerfList[manager][currManagerObj].allFirstResp += (parseInt((recordsToCount[record].specialFields.conversationTimings.firstResponseTime)));
                    if (recordsToCount[record].lastOperator === "noAgent") {
                        countedManagersPerfList[manager][currManagerObj].allFirstResp = -1;
                    }
                }
            }
        }
    }
    // all conversations first reponse time per manager END

    // count average conversations and first response time per manager START
    for (let keyIndex = 0; keyIndex < countedManagersPerfList.length; keyIndex++) {
        for (const key in countedManagersPerfList[keyIndex]) {
            countedManagersPerfList[keyIndex][key].avgConvTime = countedManagersPerfList[keyIndex][key].allConvDur / countedManagersPerfList[keyIndex][key].chatsCount;
            countedManagersPerfList[keyIndex][key].avgFirstResp = countedManagersPerfList[keyIndex][key].allFirstResp / countedManagersPerfList[keyIndex][key].chatsCount;
        }
    }
    // count average conversations and first response time per manager END

    await buildTable(countedManagersPerfList, "managers");
    savedCountedManagersPerfList = [...countedManagersPerfList];
    countedManagersPerfList = [];
}
// COUNT MANAGERS PERFORMANCE FUNCTION END

// COUNT TAGS FUNCTION START
let countedTagsList = [], savedCountedTagsList = [];
async function countTags(recordsToCount) {
    let allTags = "";
    for (let record = 0; record < recordsToCount.length; record++) {
        allTags += recordsToCount[record].conversationTags + ',';
    }
    for (let tag = 0; tag < tagsList.length; tag++) {
        let currTag;
        (tagsList[tag].includes('(') || tagsList[tag].includes(')') || tagsList[tag].includes('/')) ?
            currTag = replaceSpecialSymbol(tagsList[tag]) :
            currTag = tagsList[tag];
        (currTag === "1-бездеп") ? currTag = currTag + "," : currTag
        let tagRegex = new RegExp(currTag, "gm");
        if (tagRegex.test(allTags)) {
            let tagCount = allTags.match(tagRegex).length;
            countedTagsList.push({ [tagsList[tag]]: tagCount });
        }
    }
    await buildTable(countedTagsList, "tags");
    savedCountedTagsList = [...countedTagsList];
    countedTagsList = [];
}
// COUNT TAGS FUNCTION END

// BUILD DATA TABLES FUNCTION START
async function buildTable(dataToWork, tableType) {
    let content = '';
    // build CATEGORIES table START
    let tableCategories = getE('#data-table-1');
    if (tableType === "categories") {
        let catSum = 0;
        for (let c = 0; c < dataToWork.length; c++) catSum += parseInt(Object.values(dataToWork[c]));
        tableCategories.firstElementChild.nextElementSibling.innerHTML = "";
        for (let i = 0; i < Object.keys(dataToWork).length; i++) {
            let catLabel = Object.keys(dataToWork[i]).toString(),
                catCount = Object.values(dataToWork[i]).toString(),
                percent = ((catCount / catSum) * 100);
            content += `<tr><td>${catLabel}</td><td>${catCount}</td><td>${roundNum(percent)}%</td></tr>`;
        }
        content += `<tr><td>Разом категорій</td><td>${catSum} шт.</td><td></td></tr>`;
        tableCategories.firstElementChild.nextElementSibling.innerHTML = content;
    }
    // build CATEGORIES table END

    // build CATEGORIES table START
    let tableLanguages = getE('#data-table-2');
    if (tableType === "languages") {
        let langSum = 0;
        for (let c = 0; c < dataToWork.length; c++) langSum += parseInt(Object.values(dataToWork[c]));
        tableLanguages.firstElementChild.nextElementSibling.innerHTML = "";
        for (let i = 0; i < Object.keys(dataToWork).length; i++) {
            let langLabel = Object.keys(dataToWork[i]).toString(),
                langCount = Object.values(dataToWork[i]).toString(),
                percent = ((langCount / langSum) * 100);
            content += `<tr><td>${langLabel}</td><td>${langCount}</td><td>${roundNum(percent)}%</td></tr>`;
        }
        content += `<tr><td>Разом категорій</td><td>${langSum} шт.</td><td></td></tr>`;
        tableLanguages.firstElementChild.nextElementSibling.innerHTML = content;
    }
    // build CATEGORIES table END

    // build MANAGERS PERFORMANCE table START
    let tableManagers = getE('#data-table-3');
    if (tableType === "managers") {
        let convSum = 0, chatSum = 0, ticketSum = 0, teamAvgConvTime = 0, teamAvgFirsrRespTime = 0;
        for (let c = 0; c < dataToWork.length; c++) {
            convSum += dataToWork[c][Object.keys(dataToWork[c]).toString()].convCount;
            chatSum += dataToWork[c][Object.keys(dataToWork[c]).toString()].chatsCount;
            ticketSum += dataToWork[c][Object.keys(dataToWork[c]).toString()].ticketsCount;
        }
        tableManagers.firstElementChild.nextElementSibling.innerHTML = "";
        for (let i = 0; i < dataToWork.length; i++) {
            let managerLabel = Object.keys(dataToWork[i]).toString(),
                managerChatsCount = dataToWork[i][managerLabel].chatsCount,
                managerTicketsCount = dataToWork[i][managerLabel].ticketsCount,
                managerConvCount = dataToWork[i][managerLabel].convCount,
                managerAvgConvTime = dataToWork[i][managerLabel].avgConvTime ? dataToWork[i][managerLabel].avgConvTime : 0,
                managerAvgFirsrRespTime = dataToWork[i][managerLabel].avgFirstResp ? dataToWork[i][managerLabel].avgFirstResp : 0,
                percent = ((managerConvCount / convSum) * 100);
            content += `<tr>
            <td>${(managerLabel === "noAgent") ? "Немає відповідального" : managerLabel}</td>
            <td>${managerChatsCount}</td>
            <td>${managerTicketsCount}</td>
            <td>${managerConvCount}</td>
            <td>${roundNum(percent)}%</td>
            <td>${(managerLabel === "noAgent") ? "" : convertSectoMinSec(managerAvgConvTime)}</td>
            <td>${(managerLabel === "noAgent") ? "" : convertSectoMinSec(managerAvgFirsrRespTime)}</td></tr>`;
            teamAvgConvTime += managerAvgConvTime;
            teamAvgFirsrRespTime += managerAvgFirsrRespTime;
        }
        teamAvgConvTime ? teamAvgConvTime /= dataToWork.length : 0;
        teamAvgFirsrRespTime ? teamAvgFirsrRespTime /= dataToWork.length : 0;
        content += `<tr>
        <td>Разом</td><td>${chatSum}</td><td>${ticketSum}</td><td>${convSum}</td>
        <td>Середні значення</td><td>${convertSectoMinSec(teamAvgConvTime)}</td><td>${convertSectoMinSec(teamAvgFirsrRespTime)}</td></tr>`;
        tableManagers.firstElementChild.nextElementSibling.innerHTML = content;
    }
    // build MANAGERS PERFORMANCE table END

    // build TAGS table START
    let tableTags = getE('#data-table-4');
    if (tableType === "tags") {
        let tagsSum = 0;
        for (let c = 0; c < Object.keys(dataToWork).length; c++) tagsSum += parseInt(Object.values(dataToWork[c]));
        tableTags.firstElementChild.nextElementSibling.innerHTML = "";
        for (let i = 0; i < Object.keys(dataToWork).length; i++) {
            let tagLabel = Object.keys(dataToWork[i]).toString(),
                labelCount = Object.values(dataToWork[i]).toString(),
                percent = ((labelCount / tagsSum) * 100);
            content += `<tr><td>${tagLabel}</td><td>${labelCount}</td><td>${roundNum(percent)}%</td></tr>`;
        }
        content += `<tr><td>Разом міток</td><td>${tagsSum} шт.</td><td></td></tr>`;
        tableTags.firstElementChild.nextElementSibling.innerHTML = content;
    }
    // build TAGS table END
}
// BUILD DATA TABLES FUNCTION END

// FIND MERGE CHATS FUCNTION STARTER START
async function findMergeChatsStart() {
    getE('#createMergingChatReport').disabled = true;
    dialogContainer.innerHTML = `
        <div class="load-box">
        <div class="load-image"></div>
        <p class="load-tip">Перепочиньте поки ми шукаємо чати з можливим об'єднанням для вас!)</p>
        </div>`;
    dialogContainer.classList.remove('hide');
    setTimeout(() => findChatsForMerge(recordsChats), 1000)
}
// FIND MERGE CHATS FUCNTION STARTER END

// FIND CHATS FOR MERGING FUNCTION START
let mergingArr = [];
async function findChatsForMerge(arrToWork) {
    return new Promise((resolve) => {
        let mergingObj = {};
        for (const key of projectsList) mergingObj[key] = [];
        for (let record = 0; record < arrToWork.length; record++) {
            for (const key in mergingObj) {
                if (key === arrToWork[record].projectName) {
                    mergingObj[key].push(arrToWork[record]);
                }
            }
        }
        for (const key in mergingObj) {
            mergingObj[key].sort((a, b) => a.customerId.toLowerCase() < b.customerId.toLowerCase() ? -1 : 1);
            let count = 0;
            for (let i = 0; i < mergingObj[key].length; i++) {
                let currID = mergingObj[key][i].customerId,
                    currTime = mergingObj[key][i].specialFields.createdAtMilis;
                for (let a = 0; a < mergingObj[key].length; a++) {
                    let compareID = mergingObj[key][a].customerId,
                        compareTime = mergingObj[key][a].specialFields.createdAtMilis;
                    if (currID === compareID) count++;
                    else count = 0;
                    if (count > 1) {
                        if (currTime - compareTime < 0 && currTime - compareTime > -86400000) {
                            if (!mergingArr.includes(mergingObj[key][i]) &&
                                !mergingArr.includes(mergingObj[key][a])) {
                                mergingArr.push(mergingObj[key][i], mergingObj[key][a]);
                            }
                        }
                        if (currTime - compareTime > 0 && currTime - compareTime < 86400000) {
                            if (!mergingArr.includes(mergingObj[key][i]) &&
                                !mergingArr.includes(mergingObj[key][a])) {
                                mergingArr.push(mergingObj[key][i], mergingObj[key][a]);
                            }
                        }
                    }
                }
            }
        }
        let csv = "";
        let fRow = false;
        for (let row = 0; row < mergingArr.length; row++) {
            let keysAmount = Object.keys(mergingArr[row]).length;
            let keysCounter = 0;
            if (row === 0) {
                for (let key in mergingArr[row]) {
                    if (keysCounter + 1 < keysAmount) {
                        let dataToSet = "\"" + key + "\"";
                        csv += dataToSet + (keysCounter + 2 < keysAmount ? ',' : '\r\n');
                        keysCounter++;
                        fRow = true;
                    }
                }
            }
            keysCounter = 0;
            if (row === 0 && fRow) {
                for (let key in mergingArr[row]) {
                    if (keysCounter + 1 < keysAmount) {
                        let dataToSet = "\"" + (Array.isArray(mergingArr[row][key]) ? mergingArr[row][key].join(";") : mergingArr[row][key]) + "\"";
                        csv += dataToSet + (keysCounter + 2 < keysAmount ? ',' : '\r\n');
                        keysCounter++;
                    }
                }
            }
            else {
                for (let key in mergingArr[row]) {
                    if (keysCounter + 1 < keysAmount) {
                        let dataToSet = "\"" + (Array.isArray(mergingArr[row][key]) ? mergingArr[row][key].join(";") : mergingArr[row][key]) + "\"";
                        csv += dataToSet + (keysCounter + 2 < keysAmount ? ',' : '\r\n');
                        keysCounter++;
                    }
                }
            }
            keysCounter = 0;
        }
        reportData.merging.reportName = "MERGE_CHATS_report_" + (new Date().toLocaleString("uk-UA")).replace(",", "");
        reportData.merging.fileLink = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv);
        dialogContainer.classList.add('hide');
        resolve(getE('#downloadChatMerging').disabled = false);
    });
}
// FIND CHATS FOR MERGING FUNCTION END

// SORT STRING COLUMN FUNCTION START
let arrowUp = "&#11205",
    arrowDown = "&#11206";
async function sortColumnStr(e, recordsToSort) {
    let currentElem, sortedRecords;
    (e.target.tagName.toLowerCase() === "span") ? currentElem = e.target.parentNode : currentElem = e.target;
    if (currentElem.getAttribute('name') === "false") {
        sortedRecords = recordsToSort.sort((a, b) => Object.keys(a)[0].toLowerCase() < Object.keys(b)[0].toLowerCase() ? 1 : -1);
        currentElem.setAttribute('name', true);
        currentElem.firstElementChild.innerHTML = arrowUp;
    }
    else if (currentElem.getAttribute('name')) {
        sortedRecords = recordsToSort.sort((a, b) => Object.keys(a)[0].toLowerCase() < Object.keys(b)[0].toLowerCase() ? -1 : 1);
        currentElem.setAttribute('name', false);
        currentElem.firstElementChild.innerHTML = arrowDown;
    }
    let parent = currentElem.parentNode;
    for (let elem = 0; elem < parent.children.length; elem++) {
        if (parent.children[elem] !== currentElem) {
            parent.children[elem].setAttribute('name', true);
            parent.children[elem].firstElementChild.innerHTML = "";
        }
    }
    if (recordsToSort === savedCountedCategoriesList) {
        await buildTable(sortedRecords, "categories");
    }
    if (recordsToSort === savedCountedLanguagesList) {
        await buildTable(sortedRecords, "languages");
    }
    if (recordsToSort === savedCountedManagersPerfList) {
        await buildTable(sortedRecords, "managers");
    }
    if (recordsToSort === savedCountedTagsList) {
        await buildTable(sortedRecords, "tags");
    }
}
// SORT STRING COLUMN FUNCTION END

// SORT NUMBER COLUMN FUNCTION START
async function sortColumnNum(e, recordsToSort, sortBy) {
    let currentElem, sortedRecords;
    (e.target.tagName.toLowerCase() === "span") ? currentElem = e.target.parentNode : currentElem = e.target;
    if (currentElem.getAttribute('name') === "false") {
        (sortBy === "") ?
            sortedRecords = recordsToSort.sort(function (a, b) { return a[Object.keys(a)[0]] - b[Object.keys(b)[0]] }) :
            sortedRecords = recordsToSort.sort(function (a, b) { return a[Object.keys(a)[0]][sortBy] - b[Object.keys(b)[0]][sortBy] });
        currentElem.setAttribute('name', true);
        currentElem.firstElementChild.innerHTML = arrowUp;
    }
    else if (currentElem.getAttribute('name')) {
        (sortBy === "") ?
            sortedRecords = recordsToSort.sort(function (a, b) { return b[Object.keys(b)[0]] - a[Object.keys(a)[0]] }) :
            sortedRecords = recordsToSort.sort(function (a, b) { return b[Object.keys(b)[0]][sortBy] - a[Object.keys(a)[0]][sortBy] });
        currentElem.setAttribute('name', false);
        currentElem.firstElementChild.innerHTML = arrowDown;
    }
    let parent = currentElem.parentNode;
    for (let elem = 0; elem < parent.children.length; elem++) {
        if (parent.children[elem] !== currentElem) {
            parent.children[elem].setAttribute('name', true);
            parent.children[elem].firstElementChild.innerHTML = "";
        }
    }
    if (recordsToSort === savedCountedCategoriesList) {
        await buildTable(sortedRecords, "categories");
    }
    if (recordsToSort === savedCountedLanguagesList) {
        await buildTable(sortedRecords, "languages");
    }
    if (recordsToSort === savedCountedManagersPerfList) {
        await buildTable(sortedRecords, "managers");
    }
    if (recordsToSort === savedCountedTagsList) {
        await buildTable(sortedRecords, "tags");
    }
}
// SORT NUMBER COLUMN FUNCTION END

// COPY TABLE DATA TO CLIPBOARD FUNCTION START
function copyTableText(e) {
    let copyData = '',
        copyTable = e.target.parentNode.parentNode.parentNode.parentNode,
        copyText = copyTable.firstElementChild.nextElementSibling.innerHTML.toString();
    let dataByRows = copyText.split("</tr>");
    for (let i = 0; i < dataByRows.length; i++) {
        dataByRows[i] = dataByRows[i].replace("<tr>", "");
        dataByRows[i] = dataByRows[i].replace("&amp;", "\&");
        dataByRows[i] = dataByRows[i].replace(/<td>/g, "");
        dataByRows[i] = dataByRows[i].replace(/<\/td>/g, "\t");
        dataByRows[i] = dataByRows[i].slice(0, -1);
    }
    dataByRows.pop();
    copyData = dataByRows.join('\n');
    navigator.clipboard.writeText(copyData);
    e.target.disabled = true;
    e.target.style.display = "none";
    e.target.nextElementSibling.style.display = "block";
    e.target.nextElementSibling.nextElementSibling.style.width = '65px';
    e.target.nextElementSibling.nextElementSibling.style.padding = '2px';
    setTimeout(() => {
        e.target.style.display = "block";
        e.target.nextElementSibling.style.display = "none";
        e.target.nextElementSibling.nextElementSibling.style.width = '0';
        e.target.nextElementSibling.nextElementSibling.style.padding = '2px 0';
        e.target.disabled = false;
    }, 1000);
}
// COPY TABLE DATA TO CLIPBOARD FUNCTION END

function moreOptions() { }

// SELECTED DATE RANGE FUNCTION START
let fPickDateCheck = true, lPickDateCheck = false, filterFirstData = "", filterLastData = "", sortedArrayByDate = [];
async function pickDate(e) {
    if (e.target.tagName.toLowerCase() === 'button') {
        if (fPickDateCheck) {
            fPickDateCheck = false;
            filterFirstData = new Date(e.target.value.split('_').join(' ')).getTime();
            lPickDateCheck = true;
            e.target.classList.add('firstLast_date');
        }
        else if (lPickDateCheck) {
            lPickDateCheck = false;
            filterLastData = new Date(e.target.value.split('_').join(' ')).getTime();
            e.target.classList.add('firstLast_date');
        }
        if (!fPickDateCheck && !lPickDateCheck) {
            if (filterFirstData > filterLastData) {
                let temp = filterLastData;
                filterLastData = filterFirstData;
                filterFirstData = temp;
            }

            isDateRangeSelected = true;

            filterLastData = new Date(new Date(filterLastData).getFullYear() + "-" +
                (new Date(filterLastData).getMonth() + 1) + "-" +
                new Date(filterLastData).getDate() + " 23:59:59").getTime();
            // console.log(new Date(filterFirstData), "-", new Date(filterLastData));

            await buildFilteringSection();
            await buildFilters();
            await filterResults(buildedFilter);

            sortedArrayByDate = savedfilteredDataArr.filter((item) => {
                return item.specialFields.createdAtMilis >= filterFirstData &&
                    item.specialFields.createdAtMilis <= filterLastData
            });
            savedfilteredDataArr = sortedArrayByDate;
            globalWorkRecords = sortedArrayByDate;

            let badgeCountsObj = await recordsCounter(sortedArrayByDate);
            recCounter(badgeCountsObj);

            getE("#datesDropDown").classList.remove('showDropDown');
            getE("#dates-range-label").classList.remove('activeDropDown');
            currentDropDownName = '';

            let sDate = new Date(filterFirstData).getDate(),
                sMonthName = monthNames[new Date(filterFirstData).getMonth() + 1],
                sYear = new Date(filterFirstData).getFullYear(),
                eDate = new Date(filterLastData).getDate(),
                eMonthName = monthNames[new Date(filterLastData).getMonth() + 1],
                eYear = new Date(filterLastData).getFullYear();

            getE('#dates-range-label').innerHTML = `${sDate} ${sMonthName.substring(0, 3)}, ${sYear} - ${eDate} ${eMonthName.substring(0, 3)}, ${eYear} &#11206;`

            await recordsCounter(sortedArrayByDate);
            countedCategoriesList = [];
            await countCategories(sortedArrayByDate);
            countedLanguagesList = [];
            await countLanguages(sortedArrayByDate);
            countedManagersPerfList = [];
            await countManagersPerf(sortedArrayByDate);
            countedTagsList = [];
            await countTags(sortedArrayByDate);
            getE('.count-box').innerHTML = `<span><span class="count-number">Y ${sortedArrayByDate.length}</span> звернень</span>`;
            filterFirstData = "", filterLastData = "",
                fPickDateCheck = true, lPickDateCheck = false;
            sortedArrayByDate = [];
            getE("#downloadCustomReport").disabled = false;
        }
    }
}
// SELECTED DATE RANGE FUNCTION END

getE(".bottom-dates").onmouseover = (e) => {
    if (lPickDateCheck) {
        if (e.target.tagName.toLowerCase() === 'button') {
            let currParentElem = getE(`#m_${savedFullDatesList[dateSlideIndx].split('_')[2]}_${savedFullDatesList[dateSlideIndx].split('_')[3]}`),
                fElemIndx = 0, lElemIndx = 0;
            for (let dateElem = 0; dateElem < currParentElem.children.length; dateElem++) {
                if (currParentElem.children[dateElem].getAttribute("class") === "firstLast_date") {
                    fElemIndx = dateElem;
                }
                if (currParentElem.children[dateElem] === e.target) {
                    lElemIndx = dateElem;
                }
            }
            for (let elem = 0; elem < currParentElem.children.length; elem++) {
                if (!currParentElem.children[elem].disabled) {
                    currParentElem.children[elem].style.backgroundColor = 'unset';
                    currParentElem.children[elem].style.color = 'unset';
                }
            }
            for (let dateElem = fElemIndx; dateElem <= lElemIndx; dateElem++) {
                if (!currParentElem.children[dateElem].disabled) {
                    currParentElem.children[dateElem].style.backgroundColor = '#8bb8fc';
                    currParentElem.children[dateElem].style.color = 'white';
                }
            }
        }
    }
}

// BUILD DATE FILTER FUNCTION START
let savedFullDatesList = [];
async function buildDatesFilter(startDate, endDate) {
    getE('.bottom-dates').innerHTML = "";
    let datesContent = '', fullDatesList = [];

    // start dates info start
    let sDate = new Date(startDate).getDate(), sDayOFWeekNum, sMonthFirstDayOFWeekNum;
    new Date(startDate).getDay() === 0 ? sDayOFWeekNum = 7 : sDayOFWeekNum = new Date(startDate).getDay() + 1;
    let sDayOFWeekName = dayNames[sDayOFWeekNum],
        sMonthNum = new Date(startDate).getMonth() + 1,
        sMonthName = monthNames[sMonthNum],
        sYear = new Date(startDate).getFullYear(),
        sLastMonthDay = numOfMonthDays(0, sMonthNum, sYear);
    new Date(sYear, sMonthNum - 1, 1).getDay() === 0 ? sMonthFirstDayOFWeekNum = 7 : sMonthFirstDayOFWeekNum = (new Date(sYear, sMonthNum - 1, 1).getDay());
    // start dates info end

    // end dates info start
    let eDate = new Date(endDate).getDate(), eDayOFWeekNum, eMonthLastDayOFWeekNum;
    new Date(endDate).getDay() === 0 ? eDayOFWeekNum = 7 : eDayOFWeekNum = new Date(endDate).getDay() + 1;
    let eDayOFWeekName = dayNames[eDayOFWeekNum],
        eMonthNum = new Date(endDate).getMonth() + 1,
        eMonthName = monthNames[eMonthNum],
        eYear = new Date(endDate).getFullYear(),
        eLastMonthDay = numOfMonthDays(0, eMonthNum, eYear);
    new Date(eYear, eMonthNum, 0).getDay() === 0 ? eMonthLastDayOFWeekNum = 7 : eMonthLastDayOFWeekNum = (new Date(eYear, eMonthNum, 0).getDay());
    // end dates info end

    getE('#dates-range-label').innerHTML = `${sDate} ${sMonthName.substring(0, 3)}, ${sYear} - ${eDate} ${eMonthName.substring(0, 3)}, ${eYear} &#11206;`

    // prev month start
    let prevMonthLastDayOFWeekNum, prevMonthNum, prevMonthYear;
    new Date(startDate).getMonth() === 0 ? prevMonthNum = 12 : prevMonthNum = (new Date(startDate).getMonth() + 1) - 1;
    let prevMonthName = monthNames[prevMonthNum];
    (eYear - sYear > 0) ? (prevMonthYear = sYear) : (sMonthNum === 1 ? prevMonthYear = sYear - 1 : prevMonthYear = sYear);
    let prevMonthLastDay = numOfMonthDays(0, prevMonthNum, prevMonthYear)
    new Date(prevMonthYear, prevMonthNum, 0).getDay() === 0 ? prevMonthLastDayOFWeekNum = 7 : prevMonthLastDayOFWeekNum = (new Date(prevMonthYear, prevMonthNum, 0).getDay());
    let prevMonthStartBuildDate = (prevMonthLastDay - prevMonthLastDayOFWeekNum) + 1;
    // prev month end

    // next month start
    let nextMonthFirstDayOFWeekNum, nextMonthNum, nextMonthYear;
    new Date(endDate).getMonth() === 11 ? nextMonthNum = 1 : nextMonthNum = (new Date(endDate).getMonth() + 1) + 1;
    let nextMonthName = monthNames[nextMonthNum];
    (eYear - sYear > 0) ? (nextMonthYear = eYear) : (eMonthNum === 12 ? nextMonthYear = eYear + 1 : nextMonthYear = eYear);
    let nextMonthLastDay = numOfMonthDays(0, nextMonthNum, nextMonthYear),
        nextMonthStartBuildDate = (nextMonthLastDay - eDayOFWeekNum) + 2;
    new Date(nextMonthYear, nextMonthNum - 1, 1).getDay() === 0 ? nextMonthFirstDayOFWeekNum = 7 : nextMonthFirstDayOFWeekNum = (new Date(nextMonthYear, nextMonthNum - 1, 1).getDay());
    // next month end

    for (let year = sYear; year <= eYear; year++) {
        for (let month = 1; month < monthNames.length; month++) {
            if (sYear !== eYear) {
                let monthN = monthNames[month];
                if (year === sYear && month >= sMonthNum) {
                    fullDatesList.push(`${monthN}_${numOfMonthDays(0, month, year)}_${month}_${year}`);
                }
                else if (year !== sYear && year !== eYear) {
                    fullDatesList.push(`${monthN}_${numOfMonthDays(0, month, year)}_${month}_${year}`);
                }
                if (year === eYear && month <= eMonthNum) {
                    fullDatesList.push(`${monthN}_${numOfMonthDays(0, month, year)}_${month}_${year}`);
                }
            }
            else {
                if (year === sYear && month >= sMonthNum && month <= eMonthNum) {
                    let monthN = monthNames[month];
                    fullDatesList.push(`${monthN}_${numOfMonthDays(0, month, year)}_${month}_${year}`);
                }
            }
        }
    }

    for (let month = 0; month < fullDatesList.length; month++) {
        let currDateInfo = fullDatesList[month].split('_');
        datesContent += `<div name="datesDropDown" class="one-month-box" id="m_${currDateInfo[2]}_${currDateInfo[3]}">`;
        // build prev month days drafts start
        if (sMonthFirstDayOFWeekNum !== 1 && month === 0) {
            for (let i = 1; i <= prevMonthLastDayOFWeekNum; i++) {
                datesContent +=
                    `<button name="datesDropDown" value="${prevMonthNum}_${prevMonthStartBuildDate}_${prevMonthYear}" disabled>${prevMonthStartBuildDate}</button>`;
                prevMonthStartBuildDate++;
            }
        }
        // build prev month days drafts end

        // build main months days start
        if (sDate !== 1 && month === 0) {
            for (let i = 1; i < sDate; i++) {
                datesContent +=
                    `<button name="datesDropDown" value="${sMonthNum}_${i}_${sYear}" disabled>${i}</button>`;
            }
        }
        if (sMonthNum === eMonthNum) {
            for (let i = sDate; i <= eDate; i++) {
                datesContent +=
                    `<button name="datesDropDown" value="${sMonthNum}_${i}_${sYear}">${i}</button>`;
            }
        }
        else {
            for (let a = 1; a <= currDateInfo[1]; a++) {
                if (a === 1 && currDateInfo[0] !== monthNames[sMonthNum]) {
                    let currMonthFirstDay = new Date(currDateInfo[3], currDateInfo[2] - 1, 1),
                        currMonthFirstDayNum;
                    new Date(currMonthFirstDay).getDay() === 0 ? currMonthFirstDayNum = 7 : currMonthFirstDayNum = new Date(currMonthFirstDay).getDay();
                    let count = fullDatesList[month - 1].split('_')[1] - (currMonthFirstDayNum - 2);
                    for (let i = 1; i < currMonthFirstDayNum; i++) {
                        datesContent +=
                            `<button name="datesDropDown" 
                            value="${fullDatesList[month - 1].split('_')[2]}_${count}_${fullDatesList[month - 1].split('_')[3]}" 
                            class="other-month-date">${count}</button>`;
                        count++;
                    }
                }
                if (currDateInfo[0] === monthNames[sMonthNum] && a >= sDate) {
                    datesContent +=
                        `<button name="datesDropDown" value="${currDateInfo[2]}_${a}_${currDateInfo[3]}">${a}</button>`;
                }
                if (currDateInfo[0] !== monthNames[sMonthNum] && currDateInfo[0] !== monthNames[eMonthNum]) {
                    datesContent +=
                        `<button name="datesDropDown" value="${currDateInfo[2]}_${a}_${currDateInfo[3]}">${a}</button>`;
                }
                if (currDateInfo[0] === monthNames[eMonthNum] && a <= eDate) {
                    datesContent +=
                        `<button name="datesDropDown" value="${currDateInfo[2]}_${a}_${currDateInfo[3]}">${a}</button>`;
                }
                if (a === parseInt(currDateInfo[1]) && month !== fullDatesList.length - 1) {
                    let currMonthLastDay = new Date(currDateInfo[3], currDateInfo[2] - 1, currDateInfo[1]),
                        currMonthLastDayNum;
                    new Date(currMonthLastDay).getDay() === 0 ? currMonthLastDayNum = 7 : currMonthLastDayNum = new Date(currMonthLastDay).getDay();
                    let count = 1;
                    for (let i = currMonthLastDayNum; i < 7; i++) {
                        datesContent +=
                            `<button name="datesDropDown" value="${fullDatesList[month + 1].split('_')[2]}_${count}_${fullDatesList[month + 1].split('_')[3]}" class="other-month-date">${count}</button>`;
                        count++;
                    }
                }
            }
        }
        if (eDate !== eLastMonthDay && month === fullDatesList.length - 1) {
            for (let i = eDate + 1; i <= eLastMonthDay; i++) {
                datesContent +=
                    `<button name="datesDropDown" value="${currDateInfo[2]}_${i}_${currDateInfo[3]}" disabled>${i}</button>`;
            }
        }
        // build main months days end

        // build next month days drafts start
        if (eMonthLastDayOFWeekNum !== 7 && month === fullDatesList.length - 1) {
            let count = 1;
            for (let i = nextMonthFirstDayOFWeekNum; i <= 7; i++) {
                datesContent +=
                    `<button name="datesDropDown" value="${count}_${nextMonthName.substring(0, 3)}_${nextMonthYear}" disabled>${count}</button>`;
                count++;
            }
        }
        // build next month days drafts end

        datesContent += `</div>`;
    }
    if (fullDatesList.length - 1 !== 0) { getE("#month-next").disabled = false; }
    getE(".month-label").innerHTML = fullDatesList[0].split('_')[0];
    getE('.bottom-dates').innerHTML = datesContent;
    savedFullDatesList = [...fullDatesList];
    fullDatesList = [];
}
// BUILD DATE FILTER FUNCTION END

// SLIDE MOUNTHS PAGES FUNCTION START
let dateSlideIndx = 0;
function dateSlidePage(e) {
    let dateSlidePrev = getE("#month-prev"),
        dateSlideNext = getE("#month-next"),
        arrLength = savedFullDatesList.length - 1;
    if (e.target.id === "month-next" && dateSlideIndx !== arrLength) {
        dateSlideIndx++;
        getE(".month-label").innerHTML = savedFullDatesList[dateSlideIndx].split('_')[0];
        dateSlidePrev.disabled = false;
        let currElem = getE(`#m_${savedFullDatesList[dateSlideIndx].split('_')[2]}_${savedFullDatesList[dateSlideIndx].split('_')[3]}`);
        currElem.previousElementSibling.style.display = 'none';
        currElem.style.display = 'flex';
        if (dateSlideIndx === arrLength) {
            dateSlideIndx = arrLength;
            dateSlideNext.disabled = true;
        }
    }
    if (e.target.id === "month-prev" && dateSlideIndx !== 0) {
        dateSlideIndx--;
        getE(".month-label").innerHTML = savedFullDatesList[dateSlideIndx].split('_')[0];
        dateSlideNext.disabled = false;
        let currElem = getE(`#m_${savedFullDatesList[dateSlideIndx].split('_')[2]}_${savedFullDatesList[dateSlideIndx].split('_')[3]}`);
        currElem.nextElementSibling.style.display = 'none';
        currElem.style.display = 'flex';
        if (dateSlideIndx === 0) {
            dateSlidePrev.disabled = true;
        }
    }
}
// SLIDE MOUNTHS PAGES FUNCTION END

// LAUNCH BUILD HOURLY DISTRIBUTION REPORT FUNCTION START
async function launchHourlyDistReport() {
}
// LAUNCH BUILD HOURLY DISTRIBUTION REPORT FUNCTION END

// BUILD HOURLY DISTRIBUTION REPORT START
let hourlyArr = [];
async function buildHourlyDistReport(arrToWork) {
}
// BUILD HOURLY DISTRIBUTION REPORT END