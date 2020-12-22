import { Localizer, ActionHelper } from "../common/ActionSdkHelper";
import * as html2canvas from "html2canvas";
import { KeyboardUtils } from "../common/utils/KeyboardUtils";
import { UxUtils } from "../common/utils/UxUtils";
import { Utils } from "../common/utils/Utils";
import { Constants } from "../common/utils/Constants";

$(document).ready(function() {
    OnPageLoad();
});

let actionContext = null;
let actionInstance = null;
let actionSummary = null;
let actionDataRows = null;
let actionDataRowsLength = 0;
let responderDate = [];
let actionNonResponders = [];
let myUserId = "";
let score = 0;
let total = 0;
let answerIs = "";
let actionId = "";
let dataResponse = "";
let isCreator = "";
let changeDueDateKey = "";
let cancelKey = "";
let confirmKey = "";
let changeKey = "";
let closeKey= "";
let closeTrainingConfirmKey = "";
let deleteTrainingConfirmKey = "";
let downloadCSVKey = "";
let downloadKey = "";
let downloadImageKey = "";
let backKey = "";
let dueByKey = "";
let expiredOnKey = "";
let changeDueByKey = "";
let closeTrainingKey = "";
let deleteTrainingKey = "";
let correctKey = "";
let incorrectKey = "";
let youKey = "";
let questionKey = "";
let request = ActionHelper.getContextRequest();
let root = document.getElementById("root");
let context = "";
let scoreKey = "";
let questionCount = 0;
let trainingContentKey = "";
let contentSection = "";

getTheme(request);
getStringKeys();

/*
 * Method for fetching localization strings
 */
async function getStringKeys() {
    Localizer.getString("dueBy").then(function(result) {
        dueByKey = result;
    });

    Localizer.getString("expiredOn").then(function(result) {
        expiredOnKey = result;
    });

    Localizer.getString("question").then(function(result) {
        questionKey = result;
    });

    Localizer.getString("correct").then(function(result) {
        correctKey = result;
    });
    Localizer.getString("incorrect").then(function(result) {
        incorrectKey = result;
    });

    Localizer.getString("responders").then(function(result) {
        $(".responder-key").text(result);
    });

    Localizer.getString("nonResponders").then(function(result) {
        $(".non-responder-key").text(result);
    });

    Localizer.getString("you").then(function(result) {
        youKey = result;
    });

    Localizer.getString("changeDueBy").then(function (result) {
        changeDueByKey = result;
        $(".change-due-by-key").text(changeDueByKey);
    });

    Localizer.getString("closeTraining").then(function (result) {
        closeTrainingKey = result;
        $(".close-quiz-key").text(closeTrainingKey);
    });

    Localizer.getString("deleteTraining").then(function (result) {
        deleteTrainingKey = result;
        $(".delete-quiz-key").text(deleteTrainingKey);
    });

    Localizer.getString("changeDueDate").then(function (result) {
        changeDueDateKey = result;
        $(".change-due-date-key").html(changeDueDateKey);
    });

    Localizer.getString("close").then(function (result) {
        closeKey = result;
        $(".close-key").html(closeKey);
    });

    Localizer.getString("cancel").then(function (result) {
        cancelKey = result;
        $(".cancel-key").html(cancelKey);
    });

    Localizer.getString("confirm").then(function (result) {
        confirmKey = result;
        $(".confirm-key").html(confirmKey);
    });

    Localizer.getString("change").then(function (result) {
        changeKey = result;
        $(".change-key").html(changeKey);
    });

    Localizer.getString("closeTrainingConfirm").then(function (result) {
        closeTrainingConfirmKey = result;
        $(".close-quiz-confirm-key").html(closeTrainingConfirmKey);
    });

    Localizer.getString("deleteTrainingConfirm").then(function (result) {
        deleteTrainingConfirmKey = result;
        $(".close-quiz-confirm-key").html(deleteTrainingConfirmKey);
    });

    Localizer.getString("download").then(function(result) {
        downloadKey = result;
        $("#download-key").html(downloadKey);
    });

    Localizer.getString("downloadImage").then(function(result) {
        downloadImageKey = result;
        $("#download-image-key").html(downloadImageKey);
    });

    Localizer.getString("downloadCSV").then(function(result) {
        downloadCSVKey = result;
        $("#download-csv-key").html(downloadCSVKey);
    });

    Localizer.getString("score", ":").then(function (result) {
        scoreKey = result;
    });

    Localizer.getString("trainingContent", ":").then(function (result) {
        trainingContentKey = result;
        $(".training-content-key").text(result);
    });
}

/*
 * Method to get theme color
 * @param request object
 */
async function getTheme(request) {
    getStringKeys();
    dataResponse = await ActionHelper.executeApi(request);
    context = dataResponse.context;
    $("form.section-1").show();
    let theme = context.theme;
    theme = "default";  // Remove this to enable theme based css
    $("link#theme").attr("href", "css/style-" + theme + ".css");
    ActionHelper.hideLoader();
}

/*
 * Method to create app body when page load
 */
function OnPageLoad() {
    ActionHelper.executeApi(request)
        .then(function(response) {
            console.info("GetContext - Response: " + JSON.stringify(response));
            actionContext = response.context;
            actionId = response.context.actionId;
            getDataRows(response.context.actionId);
        })
        .catch(function(error) {
            console.error("GetContext - Error: " + JSON.stringify(error));
        });
}

/*
 * Method to get data rows
 * @param actionId number
 */
function getDataRows(actionId) {
    let getActionRequest = ActionHelper.getActionRequest(actionId);
    let getSummaryRequest = ActionHelper.getDataRowSummary(actionId, true);
    let getDataRowsRequest = ActionHelper.requestDataRows(actionId);
    let batchRequest = ActionHelper.batchRequest([getActionRequest, getSummaryRequest, getDataRowsRequest]);
    ActionHelper.executeBatchApi(batchRequest).then(function(batchResponse) {
        console.info("BatchResponse: " + JSON.stringify(batchResponse));
        actionInstance = batchResponse.responses[0].action;
        actionSummary = batchResponse.responses[1].summary;
        actionDataRows = batchResponse.responses[2].dataRows;
        actionDataRowsLength = actionDataRows == null ? 0 : actionDataRows.length;
        createBody();
    }).catch(function(error) {
        console.log("Console log: Error: " + JSON.stringify(error));
    });
}

/*
 * Method to create boady
 */
async function createBody() {
    await getUserprofile();
    let getSubscriptionCount = "";
    $("#root").html("");
    /*  Head Section  */
    if (myUserId == dataResponse.context.userId && myUserId == actionInstance.creatorId) {
        isCreator = true;
        headCreator();

        if (actionInstance.status == "Closed") {
            $(".close-quiz-event").remove();
            $(".change-due-by-event").remove();
        }
        if (actionInstance.status == "Expired") {
            $(".change-due-by-event").remove();
        }
    } else {
        head();
    }

    /*  Person Responded X of Y Responses  */
    getSubscriptionCount = ActionHelper.getSubscriptionMemberCount(actionContext.subscription);

    let response = await ActionHelper.executeApi(getSubscriptionCount);

    if (isCreator == true) {
        let $pcard = $('<div class="progress-section"></div>');
        let memberCount = response.memberCount;
        let participationPercentage = 0;

        participationPercentage = Math.round(
            (actionSummary.rowCreatorCount / memberCount) * 100
        );

        Localizer.getString("participation", participationPercentage).then(function(result) {
            $pcard.append(`<label class="mb--4"><strong>${result} </strong></label><div class="progress mb-2"><div class="progress-bar bg-primary" role="progressbar" style="width:${participationPercentage}%" aria-valuenow="${participationPercentage}" aria-valuemin="0" aria-valuemax="100"></div></div>`);
        });

        Localizer.getString("xofyPeopleResponded", actionSummary.rowCount, memberCount).then(function(result) {
            $pcard.append(`<p class="date-color cursor-pointer md-0" id="show-responders"><span tabindex="0" role="button">${result}</span></p>`);
        });

        $("#root").append($pcard);
    }
    let responderDateLength = Object.keys(responderDate).length;
    if (responderDateLength > 0) {
        if (myUserId == dataResponse.context.userId) {
            createCreatorQuestionView(myUserId, responderDate);
        } else if (myUserId == dataResponse.context.userId && myUserId != actionInstance.creatorId) {
            let isResponded = false;
            responderDate.forEach((responder) => {
                if (responder.value2 == myUserId) {
                    createQuestionView(myUserId);
                    isResponded = true;
                }
            });

            if (isResponded == false) {
                actionNonResponders.forEach((nonresponders) => {
                    if (nonresponders.value2 == myUserId) {
                        let name = nonresponders.label;
                        let matches = name.match(/\b(\w)/g); // [D,P,R]
                        let initials = matches.join("").substring(0, 2); // DPR
                        Localizer.getString("youYetRespond").then(function (result) {
                            $("div#root div:first").append(UxUtils.getInitials(nonresponders.value2, initials, result));
                            $("div#root div:first").append(UxUtils.breakline());
                            $("div#" + nonresponders.value2).after(UxUtils.breakline());
                        });
                    }
                });
            }
        } else {
            responderDate.forEach((responder) => {
                if (responder.value2 == myUserId) {
                    createReponderQuestionView(myUserId, responder);
                }
            });
        }
    } else {
        actionNonResponders.forEach((nonresponders) => {
            if (nonresponders.value2 == myUserId) {
                if (myUserId == dataResponse.context.userId && myUserId == actionInstance.creatorId) {
                    createCreatorQuestionView();
                } else {
                    let name = nonresponders.label;
                    let matches = name.match(/\b(\w)/g); // [D,P,R]
                    let initials = matches.join("").substring(0, 2); // DPR
                    Localizer.getString("youYetRespond").then(function (result) {
                        $("#root div:first").append(UxUtils.getInitials(nonresponders.value2, initials, result));
                        $("#root div:first").append(UxUtils.breakline());
                        $("div#" + nonresponders.value2).after(UxUtils.breakline());
                    });
                }
            }
        });
    }

    if (isCreator == true) {
        if (context.hostClientType == "web") {
            footerDownload();
        }
    } else {
        footerClose();
    }
    return true;
}

/**
 * @description Method for footer for return back to landing page
 */
function footerClose() {
    $("#root").append(UxUtils.getFooterCloseArea(closeKey));
}

/**
 * @description Method for footer with download button
 */
function footerDownload() {
    $("#root").append(UxUtils.getFooterDownloadButton(downloadKey, downloadImageKey, downloadCSVKey));
}

/**
 * @description Method for creating head section for title, progress bar, dueby
 */
function head() {
    let title = actionInstance.displayName;
    let description = actionInstance.customProperties[0]["value"];
    let dueby = new Date(actionInstance.expiryTime).toDateString();
    let $card = $(`<div class=""></div>`);
    let $titleSec = $(UxUtils.getQuizTitleResponders(title));
    let $descriptionSec = $(UxUtils.getQuizDescription(description));
    let currentTimestamp = new Date().getTime();
    let $dateSec = $(UxUtils.getResponderQuizDate(actionInstance.expiryTime, currentTimestamp, dueByKey, expiredOnKey, dueby));
    $card.append($titleSec);
    $card.append($descriptionSec);
    $card.append($dateSec);
    $("#root").append($card);
    if (actionInstance.dataTables[0].attachments.length > 0 && (actionInstance.dataTables[0].attachments[0].id != null || actionInstance.dataTables[0].attachments[0].id  != "")) {
        let req = ActionHelper.getAttachmentInfo(actionId, actionInstance.dataTables[0].attachments[0].id);
        ActionHelper.executeApi(req).then(function (response) {
            $card.prepend(UxUtils.getQuizBannerImageWithLoader(response.attachmentInfo.downloadUrl));
            Utils.getClassFromDimension(response.attachmentInfo.downloadUrl, ".quiz-template-image");
        })
        .catch(function (error) {
            console.error("AttachmentAction - Error7: " + JSON.stringify(error));
        });
    }
}

/**
 * @description Method for creating head section for title, progress bar, dueby
 */
function headCreator() {
    let title = actionInstance.displayName;
    let description = actionInstance.customProperties[0]["value"];
    let dueby = new Date(actionInstance.expiryTime).toDateString();
    let $card = $(`<div class=""></div>`);
    let $titleDiv = $(`<div class="d-table mb--4"></div>`);
    let $titleSec = $(UxUtils.getQuizTitle(title));
    let $creatorButtons = $(UxUtils.creatorQuizDateManageSection(changeDueByKey, closeTrainingKey, deleteTrainingKey));
    let $descriptionSec = $(UxUtils.getQuizDescription(description));
    let currentTimestamp = new Date().getTime();
    let $dateSec = $(`<p class="mb--16 date-text font-12">${actionInstance.expiryTime > currentTimestamp ? dueByKey + " " : expiredOnKey + " "} ${dueby}</p>`);
    $titleDiv.append($titleSec);
    $titleDiv.append($creatorButtons);
    $card.append($titleDiv);
    $card.append($descriptionSec);
    $card.append($dateSec);
    $("#root").append($card);

    if (actionInstance.dataTables[0].attachments.length > 0 && (actionInstance.dataTables[0].attachments[0].id != null || actionInstance.dataTables[0].attachments[0].id  != "")) {
        let req = ActionHelper.getAttachmentInfo(actionId, actionInstance.dataTables[0].attachments[0].id);
        ActionHelper.executeApi(req).then(function (response) {
            $card.prepend(UxUtils.getQuizBannerImageWithLoader(response.attachmentInfo.downloadUrl));
            Utils.getClassFromDimension(response.attachmentInfo.downloadUrl, ".training-template-image");
        })
        .catch(function (error) {
            console.error("AttachmentAction - Error7: " + JSON.stringify(error));
        });
    }
}

/*
 * Method to get user profile
 */
async function getUserprofile() {
    let memberIds = [];
    responderDate = [];
    actionNonResponders = [];
    if (actionDataRowsLength > 0) {
        for (let i = 0; i < actionDataRowsLength; i++) {
            memberIds.push(actionDataRows[i].creatorId);
            let requestResponders = ActionHelper.getSusbscriptionMembers(actionContext.subscription, [actionDataRows[i].creatorId]);
            let responseResponders = await ActionHelper.executeApi(requestResponders);
            let perUserProfile = responseResponders.members;
            responderDate.push({
                label: perUserProfile[0].displayName,
                value: new Date(actionDataRows[i].updateTime).toDateString(),
                value2: perUserProfile[0].id,
            });
        }
    }

    myUserId = actionContext.userId;
    let requestNonResponders = ActionHelper.getSubscriptionNonParticipants(actionContext.actionId, actionContext.subscription.id);
    let responseNonResponders = await ActionHelper.executeApi(requestNonResponders);
    let tempresponse = responseNonResponders.nonParticipants;
    if (tempresponse != null) {
        for (let i = 0; i < tempresponse.length; i++) {
            actionNonResponders.push({
                label: tempresponse[i].displayName,
                value2: tempresponse[i].id,
            });
        }
    }
}

/*
 * Method to get respponders list
 */
function getResponders() {
    $("table#responder-table tbody").html("");

    for (let itr = 0; itr < responderDate.length; itr++) {
        let id = responderDate[itr].value2;
        let name = "";
        if (responderDate[itr].value2 == myUserId) {
            name = youKey;
        } else {
            name = responderDate[itr].label;
        }
        let date = responderDate[itr].value;

        let matches = responderDate[itr].label.match(/\b(\w)/g); // [D,P,R]
        let initials = matches.join("").substring(0, 2); // DPR

        let correctAnswer = Utils.isJson(actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value) ? JSON.parse(actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value) : actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value;
        if (correctAnswer.length > 0){
            let score = scoreCalculate(responderDate[itr].value2);
            $(".tabs-content:first")
            .find("table#responder-table tbody")
            .append(UxUtils.getResponderScoreWithDate(responderDate[itr].value2, initials, name, date, scoreKey, score));
        }else{
            $(".tabs-content:first")
                .find("table#responder-table tbody")
                .append(UxUtils.getResponderWithDate(responderDate[itr].value2, initials, name, date, scoreKey, score));
        }
    }
}

/**
 * @description Calculate the score
 * @param userId String Identifier
 */
function scoreCalculate(userId) {
    let total = 0;
    let score = 0;
    actionInstance.dataTables.forEach((dataTable) => {
        total = Object.keys(dataTable.dataColumns).length;

        /* Correct Answer */
        let correctResponse = JSON.parse(
            actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value
        );

        for (let i = 0; i < actionDataRowsLength; i++) {
            if (actionDataRows[i].creatorId == userId) {
                for (let c = 0; c < correctResponse.length; c++) {
                    let correctAnsString = "";
                    let userAnsString = "";
                    if ($.isArray(correctResponse[c])) {
                        if (correctResponse[c].length > 1) {
                            correctAnsString = correctResponse[c].join(",");
                        } else {
                            correctAnsString = correctResponse[c][0];
                        }
                    } else {
                        correctAnsString = correctResponse[c];
                    }

                    if (Utils.isJson(actionDataRows[i].columnValues[c + 1])) {
                        let responderAnsArr = JSON.parse(actionDataRows[i].columnValues[c + 1]);
                        if (responderAnsArr.length > 1) {
                            userAnsString = responderAnsArr.join(",");
                        } else {
                            userAnsString = responderAnsArr[0];
                        }
                    } else {
                        userAnsString = actionDataRows[i].columnValues[c + 1];
                    }

                    if (correctAnsString == userAnsString) {
                        score++;
                    }

                }
            }
        }
    });
    let scoreIs = (score / total) * 100;
    if (scoreIs % 1 != 0) {
        scoreIs = scoreIs.toFixed(2);
    }
    return scoreIs;
}

/*
 * Method to get non responders list
 */
function getNonresponders() {
    $("table#non-responder-table tbody").html("");

    for (let itr = 0; itr < actionNonResponders.length; itr++) {
        let id = actionNonResponders[itr].value2;
        let name = "";
        if (actionNonResponders[itr].value2 == myUserId) {
            name = "You";
        } else {
            name = actionNonResponders[itr].label;
        }
        let matches = actionNonResponders[itr].label.match(/\b(\w)/g); // [D,P,R]
        let initials = matches.join("").substring(0, 2); // DPR

        let date = actionNonResponders[itr].value;
        $(".tabs-content:first")
            .find("table#non-responder-table tbody")
            .append(`<tr>
                <td>
                    <div class="d-flex">
                        <div class="avtar">
                            ${initials}
                        </div>
                        <div class="avtar-txt">${name}</div>
                    </div>
                </td>
            </tr>`);
    }
}

/*
 * Event to get result based on userId
 */
$(document).on("click", ".getresult", function() {
    let userId = $(this).attr("id");
    $("#root").html("");
    head();
    $("#root").append($(".question-content").clone());
    createQuestionView(userId);
    footer(userId);
});

/*
 * Method to create responder question view
 * @param userId string identifier
 * @param responder object
 */
function createReponderQuestionView(userId, responder) {
    $("div#root > div.question-content").html("");
    let count = 1;
    answerIs = "";
    total = 0;
    score = 0;

    let name = responder.label;
    let matches = name.match(/\b(\w)/g); // [D,P,R]
    let initials = matches.join("").substring(0, 2); // DPR
    let $youSection = `<table class="table" cellspacing="0" id="responder-table">
                            <tbody>
                                <tr id="${myUserId}" class="getresult cursor-pointer">
                                    <td>
                                        <div class="d-flex ">
                                            <div class="avtar">
                                                ${initials}
                                            </div>
                                            <div class="avtar-txt">${name}</div>
                                        </div>
                                    </td>
                                    <td class="text-right avtar-txt">
                                        ${responder.value}
                                        <svg role="presentation" focusable="false" viewBox="8 8 16 16" class="right-carate">
                                            <path class="ui-icon__outline gr" d="M16.38 20.85l7-7a.485.485 0 0 0 0-.7.485.485 0 0 0-.7 0l-6.65 6.64-6.65-6.64a.485.485 0 0 0-.7 0 .485.485 0 0 0 0 .7l7 7c.1.1.21.15.35.15.14 0 .25-.05.35-.15z">
                                            </path>
                                            <path class="ui-icon__filled" d="M16.74 21.21l7-7c.19-.19.29-.43.29-.71 0-.14-.03-.26-.08-.38-.06-.12-.13-.23-.22-.32s-.2-.17-.32-.22a.995.995 0 0 0-.38-.08c-.13 0-.26.02-.39.07a.85.85 0 0 0-.32.21l-6.29 6.3-6.29-6.3a.988.988 0 0 0-.32-.21 1.036 1.036 0 0 0-.77.01c-.12.06-.23.13-.32.22s-.17.2-.22.32c-.05.12-.08.24-.08.38 0 .28.1.52.29.71l7 7c.19.19.43.29.71.29.28 0 .52-.1.71-.29z">
                                            </path>
                                        </svg>
                                    </td>
                                </tr>
                            </tbody>
                        </table>`;
    $("#root").append($youSection);

    actionInstance.dataTables.forEach((dataTable) => {
        dataTable.dataColumns.forEach((question, ind) => {
            answerIs = "";
            let count = ind + 1;

            let $cardDiv = $(`<div class="card-blank"></div>`);
            let $formGroup = $(`<div class="form-group"></div>`);
            let $row = $(`<div class="row"></div>`);
            let $hoverBtn = $('<div class="hover-btn"></div>');
            $cardDiv.append($formGroup);
            $formGroup.append($row);
            if (question.name.indexOf("photo") >= 0) {
                /* Photo Section */
                let $col9 = $(`<div class="col-9"></div>`);
                let content = "";
                $formGroup.append($row);
                $row.append($col9);
                Localizer.getString("photo").then(function(result) {
                    content = `<label class="mb0"><strong><span class="counter">${count}</span>.
                                    <span class="training-type">${result}</span></strong>
                                </label>
                                <span class="float-right result"></span>
                                <p class="mb0 text-description text-justify">${question.displayName}</p>`;
                    $col9.append(content);
                });

                let dname = Utils.isJson(question.options[0].displayName) ? JSON.parse(question.options[0].displayName) : question.options[0].displayName;
                let attachment = Utils.isJson(dname.attachmentId) ? JSON.parse(dname.attachmentId) : dname.attachmentId;
                if (attachment != undefined) {
                    let attachmentImg = "";
                    $.each(attachment, function(ind, att) {
                        attachmentImg = att;
                        return false;
                    });

                    let req = ActionHelper.getAttachmentInfo(attachmentImg);
                    let filesAmount = Object.keys(attachment).length;
                    let $col3 = $(`<div class="col-3"></div>`);
                    let $imgThumbnail = $(`<div class="img-thumbnail"></div>`);
                    ActionHelper.setAttachmentPreview(req, question.name, filesAmount, $imgThumbnail, $col3, "photo");
                    $row.append($col3);
                }
                $formGroup.append($row);
                $cardDiv.append($formGroup);
                $("#root").append($cardDiv);
                $("#root").append("<hr>");
            } else if (question.name.indexOf("document") >= 0) {
                /* Document Section */
                let $col9 = $(`<div class="col-9"></div>`);
                let content = "";
                $formGroup.append($row);
                $row.append($col9);
                Localizer.getString("document").then(function(result) {
                    content = `<label class="mb0"><strong><span class="counter">${count}</span>.
                                    <span class="training-type">${result}</span></strong>
                                </label>
                                <span class="float-right result"></span>
                                <p class="mb0 text-description text-justify">${question.displayName}</p>`;
                    $col9.append(content);
                });

                let dname = Utils.isJson(question.options[0].displayName) ? JSON.parse(question.options[0].displayName) : question.options[0].displayName;
                let attachment = Utils.isJson(dname.attachmentId) ? JSON.parse(dname.attachmentId) : dname.attachmentId;
                if (attachment != undefined) {
                    let attachmentImg = "";
                    $.each(attachment, function(ind, att) {
                        attachmentImg = att;
                        return false;
                    });
                    let req = ActionHelper.getAttachmentInfo(attachmentImg);
                    let filesAmount = Object.keys(attachment).length;
                    let $col3 = $(`<div class="col-3"></div>`);
                    let $imgThumbnail = $(`<div class="img-thumbnail"></div>`);
                    ActionHelper.setAttachmentPreview(req, question.name, filesAmount, $imgThumbnail, $col3, "document");
                    $row.append($col3);
                }
                $formGroup.append($row);
                $cardDiv.append($formGroup);
                $("#root").append($cardDiv);
                $("#root").append("<hr>");
            } else if (question.name.indexOf("video") >= 0) {
                /* Video Section */
                let $col9 = $(`<div class="col-9"></div>`);
                let content = "";

                $formGroup.append($row);
                $row.append($col9);
                Localizer.getString("video").then(function(result) {
                    content = `<label class="mb0"><strong><span class="counter">${count}</span>.
                                    <span class="training-type">${result}</span></strong>
                                </label>
                                <span class="float-right result"></span>
                                <p class="mb0 text-description text-justify">${question.displayName}</p>`;
                    $col9.append(content);
                });
                let dname = Utils.isJson(question.options[0].displayName) ? JSON.parse(question.options[0].displayName) : question.options[0].displayName;
                let attachment = Utils.isJson(dname.attachmentId) ? JSON.parse(dname.attachmentId) : dname.attachmentId;
                if (attachment != undefined) {
                    let attachmentImg = "";
                    $.each(attachment, function(ind, att) {
                        attachmentImg = att;
                        return false;
                    });
                    let req = ActionHelper.getAttachmentInfo(attachmentImg);
                    let $col3 = $(`<div class="col-3"></div>`);
                    let $imgThumbnail = $(`<div class="img-thumbnail"></div>`);
                    ActionHelper.setAttachmentPreview(req, question.name, 1, $imgThumbnail, $col3, "video");
                    $row.append($col3);
                }

                $formGroup.append($row);
                $cardDiv.append($formGroup);
                $("#root").append($cardDiv);
                $("#root").append("<hr>");
            } else {
                if (question.options.length > 1) {
                    /* Question Section */
                    let $rowdDiv = $('<div class="row"></div>');
                    let $qDiv = $('<div class="col-sm-12"></div>');
                    let $dflex = $("<div class='d-table'></div>");

                    $cardDiv.append($rowdDiv);
                    $rowdDiv.append($qDiv);

                    let $questionHeading = $(`<label class="mb0"></label>`);
                    $questionHeading.append(
                        "<strong>" + count + ". " + question.displayName + "</strong>"
                    );

                    $cardDiv.append($dflex);
                    $dflex.append($questionHeading);

                    $dflex.append(
                        '<label class="float-right mb0" id="status-' + question.name + '"></label>'
                    );

                    question.options.forEach((option) => {
                        /* User Responded */
                        let userResponse = [];
                        let userResponseAnswer = "";

                        for (let i = 0; i < actionDataRowsLength; i++) {
                            if (actionDataRows[i].creatorId == userId) {
                                userResponse = actionDataRows[i].columnValues;
                                let userResponseLength = Object.keys(userResponse).length;

                                for (let j = 1; j <= userResponseLength; j++) {
                                    if (Utils.isJson(userResponse[j])) {
                                        let userResponseAns = JSON.parse(userResponse[j]);
                                        let userResponseAnsLen = userResponseAns.length;
                                        if (userResponseAnsLen > 1) {
                                            for (let k = 0; k < userResponseAnsLen; k++) {
                                                if (userResponseAns[k] == option.name) {
                                                    userResponseAnswer = userResponseAns[k];
                                                } else {
                                                    continue;
                                                }
                                            }
                                        } else {
                                            userResponseAnswer = userResponseAns;
                                        }
                                    } else {
                                        if (userResponse[j] == option.name) {
                                            userResponseAnswer = userResponse[j];
                                        }
                                    }
                                }
                            }
                        }
                        /* Correct Answer */
                        let correctResponse = JSON.parse(
                            actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value
                        );
                        let correctResponseLength = Object.keys(correctResponse).length;
                        let correctAnswer = "";
                        for (let j = 0; j < correctResponseLength; j++) {

                            let correctResponseAns = correctResponse[j];
                            let correctResponseAnsLen = correctResponseAns.length;
                            for (let k = 0; k < correctResponseAnsLen; k++) {
                                if (correctResponseAns[k] == option.name) {
                                    correctAnswer = correctResponseAns[k];
                                }
                            }
                        }

                        if (question.options.length > 1) {
                            let $radioOption = getOptions(
                                option.displayName,
                                question.name,
                                option.name,
                                userResponseAnswer,
                                correctAnswer,
                            );
                            $cardDiv.append($radioOption);
                            let res = "";
                            if(answerIs.toLowerCase() == "correct") {
                                res = correctKey;
                            } else {
                                res = incorrectKey;
                            }
                            $cardDiv.find("#status-" + question.name).html(`<span class="${answerIs.toLowerCase() == "correct" ? "text-success" : "text-danger"}">${res}</span>`);
                        }
                    });

                    if (answerIs == "Correct") {
                        score++;
                    }
                    $("#root").append($cardDiv);
                } else {
                    /* Text Section */
                    let $textSection = "";
                    let $clearfix = $(`<div class="clearfix"></div>`);
                    $formGroup.append($hoverBtn);
                    Localizer.getString("video").then(function(result) {
                        $textSection = $(`<label class="mb0"><strong><span class="counter">${count}</span>.
                                        <span class="training-type">Text</span></strong></label>
                                        <span class="float-right result"></span>`);
                        $hoverBtn.append($textSection);
                    });
                    $formGroup.append($clearfix);
                    let $descriptionSection = `<p class="mb0 text-description text-justify">${question.displayName}</p>`;
                    $cardDiv.append($descriptionSection);
                }
                $("#root").append($cardDiv);
                $("#root").append("<hr>");
            }
        });
        count++;
    });
    $("#root").append('<div class="ht-100"></div>');
}

/*
 * Method to create creator questions view
 * @param userId string identifier
 * @param responderData object
 */
function createCreatorQuestionView(userId, responderData) {
    $("div#root > div.question-content").html("");
    let count = 1;
    answerIs = "";
    total = 0;
    score = 0;
    let $youSection = "";
    Localizer.getString("aggregrateResult").then(function(result) {
        $youSection = UxUtils.getYouAsIntial(result, userId);
        $("#root div.progress-section").after($youSection);
    });

    let imageCounter = 0;
    let successDownLoadImageCounter = 0;
    let tid = setInterval(() => {
        /* Correct Answer */
        let correctResponse = JSON.parse(
            actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value
        );
        if($(".aggregrate-section").length > 0) {
            $("#root").append(contentSection);
            actionInstance.dataTables.forEach((dataTable, ind) => {
                let isImage = false;
                let scoreArray = {};
                if (dataTable.attachments.length > 0) {
                    imageCounter++;
                    isImage = true;
                    let req = ActionHelper.getAttachmentInfo(actionId, dataTable.attachments[0].id);
                    ActionHelper.executeApi(req).then(function(response) {
                        $("#root .d-table:first").before(UxUtils.trainingTemplateImageSection());
                        actionInstance.dataTables[ind].attachments[0].url = response.attachmentInfo.downloadUrl;
                        if (actionInstance.dataTables[ind].attachments[0].url != null) {
                            $("img.training-template-image").attr("src", actionInstance.dataTables[0].attachments[0].url);
                            Utils.getClassFromDimension(response.attachmentInfo.downloadUrl, ".training-template-image");
                            Utils.removeImageLoader(".training-template-image");
                            successDownLoadImageCounter++;
                        }
                        ActionHelper.hideLoader();

                    })
                    .catch(function(error) {
                        console.log("AttachmentAction - ErrorTraining: " + JSON.stringify(error));
                    });
                }
                let qCounter = 0;
                dataTable.dataColumns.forEach((data, qindex) => {
                    if (data.valueType == "LargeText") {
                        /* Call Text Section 1 */
                        $("#question-msg").hide();
                        $(".training-contents").after(UxUtils.trainingTitle(data.displayName));
                    } else if (data.valueType == "SingleOption" || data.valueType == "MultiOption") {
                        answerIs = "";
                        let $quesContDiv = $(`<div class="question-content disabled2" id="content-${data.name}"></div>`);
                        let $mtDiv = $(`<div class="mt--16"></div>`);
                        let $dflexDiv = $(`<div class="d-table mb--4"></div>`);

                        $quesContDiv.append($mtDiv);
                        $("#root").append($quesContDiv);
                        let count = qCounter + 1;
                        $dflexDiv.append(UxUtils.getQuestionNumberContainer(questionKey, count));
                        $dflexDiv.append(`<label class="float-right font-12 bold" id="status-${data.name}"> </label>`);
                        $mtDiv.append($dflexDiv);
                        let $blankQDiv = $(`<div class=""></div>`);
                        $mtDiv.append($blankQDiv);
                        $blankQDiv.append(`
                            <div class="semi-bold font-16 mb--16">${data.displayName}</div>
                        `);
                        let questionAttachmentId = data.attachments.length > 0 ? data.attachments[0].id : "";
                        if (questionAttachmentId != "") {
                            let req = ActionHelper.getAttachmentInfo(actionId, questionAttachmentId);
                            ActionHelper.executeApi(req).then(function (response) {
                                console.info("Attachment - Response: " + JSON.stringify(response));
                                $blankQDiv.prepend(UxUtils.quizTemplateImageWithLoader(response.attachmentInfo.downloadUrl));
                                Utils.getClassFromDimension(response.attachmentInfo.downloadUrl, `#content-${data.name} img.question-image`);
                            })
                            .catch(function (error) {
                                console.error("AttachmentAction - Error: " + JSON.stringify(error));
                            });
                        }
                        let correctAnswerCounter = 0;
                        scoreArray[data.name] = 0;

                        /* check for correct answer for each users */
                        for (let i = 0; i < actionDataRowsLength; i++) {
                            for (let c = 0; c < correctResponse.length; c++) {
                                let correctAnsString = "";
                                let userAnsString = "";
                                if ($.isArray(correctResponse[c])) {
                                    if (correctResponse[c].length > 1) {
                                        correctAnsString = correctResponse[c].join(",");
                                    } else {
                                        correctAnsString = correctResponse[c][0];
                                    }
                                } else {
                                    correctAnsString = correctResponse[c];
                                }

                                if (Utils.isJson(actionDataRows[i].columnValues[count])) {
                                    let responderAnsArr = JSON.parse(actionDataRows[i].columnValues[count]);
                                    if (responderAnsArr.length > 1) {
                                        userAnsString = responderAnsArr.join(",");
                                    } else {
                                        userAnsString = responderAnsArr[0];
                                    }
                                } else {
                                    userAnsString = actionDataRows[i].columnValues[count];
                                }
                                if (correctAnsString == userAnsString) {
                                    scoreArray[data.name] = scoreArray[data.name] + 1;
                                }

                            }
                        }

                        let isRadio = true;
                        if (JSON.parse(actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value)[qCounter] != undefined && JSON.parse(actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value)[qCounter].length > 1) {
                            isRadio = false;
                        }

                        data.options.forEach((option, iii) => {
                            /* User Responded */
                            let $cardDiv = $(`<div class="card-box card-bg card-border mb--8 "></div>`);
                            let userResponse = [];
                            let userResponseAnswer = "";
                            for (let i = 0; i < actionDataRowsLength; i++) {
                                userResponse = actionDataRows[i].columnValues;
                                let userResponseLength = Object.keys(userResponse).length;
                                let userResArr = [];
                                for (let j = 1; j <= userResponseLength; j++) {
                                    if (Utils.isJson(userResponse[j])) {
                                        let userResponseAns = JSON.parse(userResponse[j]);
                                        let userResponseAnsLen = userResponseAns.length;
                                        if (userResponseAnsLen > 1) {
                                            for (let k = 0; k < userResponseAnsLen; k++) {
                                                if (userResponseAns[k] == option.name) {
                                                    userResponseAnswer = userResponseAns[k];
                                                    userResArr.push(userResponseAnswer);
                                                }
                                            }
                                        } else {
                                            if (userResponseAns[0] == option.name) {
                                                userResponseAnswer = userResponseAns[0];
                                                userResArr.push(userResponseAnswer);
                                            }
                                        }
                                    } else {
                                        if (userResponse[j] == option.name) {
                                            userResponseAnswer = userResponse[j];
                                            userResArr.push(userResponseAnswer);
                                        }
                                    }
                                }
                            }

                            /* Correct Answer */
                            let correctResponse = JSON.parse(
                                actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value
                            );

                            let correctResponseLength = Object.keys(correctResponse).length;
                            if(correctResponse != null) {
                                let correctAnswer = "";
                                for (let j = 0; j < correctResponseLength; j++) {
                                    let correctResponseAns = correctResponse[j];
                                    let correctResponseAnsLen = correctResponseAns.length;

                                    for (let k = 0; k < correctResponseAnsLen; k++) {
                                        if (correctResponseAns[k] == option.name) {
                                            correctAnswer = correctResponseAns[k];
                                            correctAnswerCounter++;
                                        }
                                    }
                                }
                            }

                            let optName = option.displayName;
                            let attachmentId = option.attachments.length > 0 ? option.attachments[0].id : "";
                            let optId = option.name;
                            let $radioOption = "";
                            let result = "";
                            for (let j = 0; j < correctResponseLength; j++) {
                                let correctResponseAns = correctResponse[j];
                                if (correctResponseAns.includes(option.name)) {
                                    result = "correct";
                                }
                            }
                            if (isRadio) {
                                $radioOption = getRadioOptionsCreator(
                                    optName,
                                    optId,
                                    qindex,
                                    result,
                                    attachmentId
                                );
                                $cardDiv.append($radioOption);
                            } else {
                                let $checkOption = getCheckOptionsCreator(
                                    optName,
                                    optId,
                                    qindex,
                                    result,
                                    attachmentId
                                );
                                $cardDiv.append($checkOption);
                            }
                            $quesContDiv.append($cardDiv);
                        });
                        qCounter++;

                        if (actionDataRowsLength == 0) {
                            let aggregrateQuestionScore = 0;
                            $dflexDiv.find("#status-" + data.name).html(UxUtils.getAggregrateScoreContainer(aggregrateQuestionScore, correctKey));
                        } else {
                            let aggregrateQuestionScore = ((scoreArray[data.name] * 100) / actionDataRowsLength);
                            if (aggregrateQuestionScore % 1 != 0) {
                                aggregrateQuestionScore = aggregrateQuestionScore.toFixed(2);
                            }
                            $dflexDiv.find("#status-" + data.name).html(UxUtils.getAggregrateScoreContainer(aggregrateQuestionScore, correctKey));
                        }
                    }
                });
            });
            clearInterval(tid);
        }
    }, Constants.setIntervalTimeHundred());
}

/*
 * Method to create question view
 * @param userId string identifier
 */
function createQuestionView(userId) {
    total = 0;
    score = 0;
    $("div#root > div.question-content").html("");
    $("div#root > div.question-content").append(contentSection);
    let resQuestCount = 0;
    actionInstance.dataTables.forEach((dataTable) => {
        total = Object.keys(dataTable.dataColumns).length;
        dataTable.dataColumns.forEach((question, ind) => {
            if (question.valueType == "LargeText") {
                /* Call Text Section 1 */
                $("#question-msg").hide();
                $(".training-contents").after(`<p class="mt--16 font-16 semi-bold">${question.displayName}</p>`);
            } else if (question.valueType == "SingleOption" || question.valueType == "MultiOption") {
                answerIs = "";
                let $questionDiv = $(`<div class="question-content disabled2" id="content-${question.name}"></div>`);
                let $mtDiv = $(`<div class="mt--16"></div>`);
                let $dtableDiv = $(`<div class="d-table mb--4 "></div>`);
                let count = ind + 1;
                let questionAttachmentId = question.attachments != "" ? question.attachments[0].id : "";

                $questionDiv.append($mtDiv);
                $mtDiv.append($dtableDiv);
                $dtableDiv.append(UxUtils.getQuestionNumberContainer(questionKey, (questionCount + 1)));

                $dtableDiv.append(`<label class="float-right font-12 bold" id="status-${question.name}"></label>`);

                let $blankQDiv = $(`<div class=""></div>`);
                $mtDiv.append($blankQDiv);
                $blankQDiv.append(UxUtils.getQuestionTitleContainer(question.displayName));

                if (questionAttachmentId.length > 0) {
                    let req = ActionHelper.getAttachmentInfo(actionId, questionAttachmentId);
                    ActionHelper.executeApi(req).then(function (response) {
                        console.info("Attachment - Response: " + JSON.stringify(response));
                        $blankQDiv.prepend(UxUtils.getQuestionImageWithLoader(response.attachmentInfo.downloadUrl));
                        Utils.getClassFromDimension(response.attachmentInfo.downloadUrl, `#content-${question.name} img.question-image`);
                    })
                        .catch(function (error) {
                            console.error("AttachmentAction - Error: " + JSON.stringify(error));
                        });
                }

                let $blankDiv = $(`<div class=" "></div>`);
                $mtDiv.append($blankDiv);
                let optAnsArr = [];
                let isRadio = true;

                if (JSON.parse(actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value)[resQuestCount].length > 1) {
                    isRadio = false;
                }
                question.options.forEach((option, optind) => {
                    /* User Responded */
                    let userResponse = [];
                    let userResponseAnswer = "";
                    let correctAnsArr = [];
                    for (let i = 0; i < actionDataRowsLength; i++) {
                        if (actionDataRows[i].creatorId == userId) {
                            userResponse = actionDataRows[i].columnValues;
                            let userResponseLength = Object.keys(userResponse).length;
                            for (let j = 1; j <= userResponseLength; j++) {
                                if (Utils.isJson(userResponse[j]) == true) {
                                    let userResponseAns = JSON.parse(userResponse[j]);
                                    let userResponseAnsLen = userResponseAns.length;
                                    if (userResponseAnsLen > 1) {
                                        for (let k = 0; k < userResponseAnsLen; k++) {
                                            if (userResponseAns[k] == option.name) {
                                                userResponseAnswer = userResponseAns[k];
                                            } else {
                                                continue;
                                            }
                                        }
                                    } else {
                                        if (userResponseAns[0] == option.name) {
                                            userResponseAnswer = userResponseAns[0];
                                        }
                                    }
                                } else {
                                    if (userResponse[j] == option.name) {
                                        userResponseAnswer = userResponse[j];
                                    }
                                }
                            }
                        }
                    }
                    /* Correct Answer */
                    let correctResponse = JSON.parse(
                        actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value
                    );
                    let correctResponseLength = Object.keys(correctResponse).length;
                    let correctAnswer = "";
                    for (let j = 0; j < correctResponseLength; j++) {
                        let correctResponseAns = correctResponse[j];
                        let correctResponseAnsLen = correctResponseAns.length;
                        for (let k = 0; k < correctResponseAnsLen; k++) {
                            if (correctResponseAns[k] == option.name) {
                                correctAnswer = correctResponseAns[k];
                                correctAnsArr = correctResponseAns;
                            }
                        }
                    }

                    let optName = option.displayName;
                    let optAttachmentId = option.attachments != 0 ? option.attachments[0].id : "";

                    if (isRadio) {
                        let $radioOption = getRadioOptions(
                            optName,
                            question.name,
                            option.name,
                            userResponseAnswer,
                            correctAnswer,
                            optAttachmentId
                        );
                        $blankDiv.append($radioOption);
                    } else {
                        let $checkOption = getCheckOptions(
                            optName,
                            question.name,
                            option.name,
                            userResponseAnswer,
                            correctAnswer,
                            optAttachmentId
                        );
                        $blankDiv.append($checkOption);
                    }
                    if (answerIs.toLowerCase() == "correct") {
                        optAnsArr[optind] = answerIs;
                    } else if (answerIs.toLowerCase() == "incorrect") {
                        optAnsArr[optind] = "incorrect";
                    }

                    let result = "";
                    if (answerIs.toLowerCase() == "correct") {
                        result = correctKey;
                    } else {
                        result = incorrectKey;
                    }
                    $questionDiv.find("#status-" + question.name).html(`<span class="semi-bold ${answerIs.toLowerCase() == "correct" ? "text-success" : "text-danger"}">${result}</span>`);
                });

                if (optAnsArr.includes("incorrect") != true) {
                    score++;
                }
                $("div#root").append($questionDiv);
                questionCount++;
                resQuestCount++;
            }
        });
    });

    let scorePercentage = (score / total) * Constants.getPrecentageHundred();
    if (scorePercentage % 1 != 0) {
        scorePercentage = scorePercentage.toFixed(2);
    }
    if (questionCount > 0){
        Localizer.getString("score", ":").then(function (result) {
            $("#root > div.progress-section").after(UxUtils.getScoreContainer(result, scorePercentage));
        });
    }
}

/**
 * @desc Method for Question view based on user id
 * @param text String contains correct and incorrect message
 * @param name String contains option name
 * @param id String contains option id
 * @param userResponse String contains user response data
 * @param correctAnswer String contains correct answer
 * @param attachmentId String contains attachment id of option
 */
function getRadioOptions(text, name, id, userResponse, correctAnswer, attachmentId) {
    let $oDiv = $(`<div class=""></div>`);
    /*  If answer is correct  and answered */
    if ($.trim(userResponse) == $.trim(id) && $.trim(correctAnswer) == $.trim(id)) {
        $oDiv.append(UxUtils.getRadioInnerResponderQuestionSuccess(id, text));
        if (answerIs == "") {
            answerIs = "Correct";
        }
    } else if (($.trim(userResponse) == $.trim(id) && $.trim(correctAnswer) != $.trim(userResponse))) {
        /* If User Response is correct and answered incorrect */
        $oDiv.append(UxUtils.getRadioInnerResponderQuestionCorrect(id, text));
        answerIs = "Incorrect";
    } else if (($.trim(userResponse) != $.trim(id) && $.trim(correctAnswer) == $.trim(id))) {
        /* If User Response is incorrect and not answered */
        $oDiv.append(UxUtils.getRadioInnerResponderQuestionCorrect2(id, text));
        answerIs = "Incorrect";
    } else {
        $oDiv.append(UxUtils.getRadioInnerResponderQuestionNormal(id, text));
    }

    if (attachmentId.length > 0) {
        let req = ActionHelper.getAttachmentInfo(actionId, attachmentId);
        $oDiv.find("label.custom-radio").attr("id", attachmentId);
        ActionHelper.executeApi(req).then(function (response) {
            console.info("Attachment - Response: " + JSON.stringify(response));
            $oDiv.find("label.custom-radio#" + attachmentId).prepend(UxUtils.getOptionImage(response.attachmentInfo.downloadUrl));
            Utils.getClassFromDimension(response.attachmentInfo.downloadUrl, `#${id} img.opt-image`);
        })
        .catch(function (error) {
            console.error("AttachmentAction - Error: " + JSON.stringify(error));
        });
    }
    return $oDiv;
}

/**
 * @desc Method for Question view Checkbox based on user id
 * @param text String contains correct and incorrect message
 * @param name String contains option name
 * @param id String contains option id
 * @param userResponse String contains user response data
 * @param correctAnswer String contains correct answer
 * @param attachmentId String contains attachment id of option
 */
function getCheckOptions(text, name, id, userResponse, correctAnswer, attachmentId) {
    let $oDiv = $(`<div class=""></div>`);
    /*  If answer is correct  and answered */
    if ($.trim(userResponse) == $.trim(id) && $.trim(correctAnswer) == $.trim(id)) {
        $oDiv.append(UxUtils.getCheckboxForInnerResponderQuestionSuccess(id, text));
        if (answerIs == "") {
            answerIs = "Correct";
        }
    } else if (($.trim(userResponse) == $.trim(id) && $.trim(correctAnswer) != $.trim(userResponse))) {
        /* If User Response is correct and answered incorrect */
        $oDiv.append(UxUtils.getCheckboxForInnerResponderQuestionCorrect(id, text));
        answerIs = "Incorrect";
    } else if (($.trim(userResponse) != $.trim(id) && $.trim(correctAnswer) == $.trim(id))) {
        /* If User Response is incorrect and not answered */
        $oDiv.append(UxUtils.getCheckboxForInnerResponderQuestionCorrect2(id, text));
        answerIs = "Incorrect";
    } else {
        $oDiv.append(UxUtils.getCheckboxForInnerResponderQuestionNormal(id, text));
    }

    if (attachmentId.length > 0) {
        let req = ActionHelper.getAttachmentInfo(actionId, attachmentId);
        $oDiv.find("label.custom-check").attr("id", attachmentId);
        ActionHelper.executeApi(req).then(function (response) {
            console.info("Attachment - Response: " + JSON.stringify(response));
            $oDiv.find("label.custom-check#" + attachmentId).prepend(UxUtils.getOptionImage(response.attachmentInfo.downloadUrl));
            Utils.getClassFromDimension(response.attachmentInfo.downloadUrl, `#${id} img.opt-image`);
        })
        .catch(function (error) {
            console.error("AttachmentAction - Error: " + JSON.stringify(error));
        });
    }
    return $oDiv;
}

/*
 * Method to create options view
 * @param text string contains correct or incorrect text
 * @param name string
 * @param id string
 * @param userResponse Array contains user responded answer for a question
 * @param correctAnswer Array contains correct answer of a question
 * @param isText String for identify the response is question type or other
 */
function getOptions(text, name, id, userResponse, correctAnswer, isText = "") {
    if (isText == true) {
        // This is for text block
        return true;
    }
    let $oDiv = $('<div class="form-group"></div>');

    /*  If answer is correct  and answered */
    if (userResponse == id && correctAnswer == id) {
        $oDiv.append(
            '<div class="form-group alert alert-success"><p class="mb0">' +
            text +
            ' <i class="fa  pull-right fa-check"></i> </p></div>'
        );
        if (answerIs == "") {
            answerIs = "Correct";
        }
    } else if (userResponse != id && correctAnswer == id) {
        /* If User Response is incorrect and not answered */
        $oDiv.append(
            '<div class="form-group alert alert-normal"><p class="mb0">' +
            text +
            ' <i class="fa fa-pull-right text-success fa-check"></p></div>'
        );
    } else if (userResponse == id && correctAnswer != id) {
        /* If User Response is incorrect and answered */
        $oDiv.append(
            '<div class="alert alert-danger"><p class="mb0">' +
            text +
            '<i class="fa fa-pull-right fa-close"></i></p></div>'
        );
        answerIs = "Incorrect";

    } else {
        $oDiv.append(
            '<div class="form-group alert alert-normal""><p class="mb0">' +
            text +
            "</p></div>"
        );
    }

    return $oDiv;
}

/*
 * Method to create footer
 * @param userId String identifier
 */
function footer(userId) {
    Localizer.getString("back").then(function(result) {
        $("#root div.question-content:last").append(UxUtils.getSummaryViewResponderSummaryFooter(userId, result));
    });
}

/*
 * Method to create footer
 */
function footer1() {
    Localizer.getString("back").then(function(result) {
        $("#root > div.card-box").append(UxUtils.getSummaryViewTabFooter(result));
    });
}

/**
 * @description Method contains section to date change of training
 */
function changeDateSection() {
    $("#root div:first").prepend(UxUtils.getChangeDateSection(changeDueDateKey, cancelKey, changeKey));
}

/**
 * @description Method contains section to close training
 */
function closeTrainingSection() {
    $("#root div:first").prepend(UxUtils.getCloseTrainingSection(closeTrainingKey, closeTrainingConfirmKey, cancelKey, confirmKey));
}

/**
 * @description Method contains section to delete training
 */
function deleteTrainingSection() {
    $("#root div:first").prepend(UxUtils.deleteTrainingSection(deleteTrainingKey, deleteTrainingConfirmKey, cancelKey, confirmKey));
}

/*
 * Method to create responder and non-responder page
 */
function create_responder_nonresponders() {
    if (actionInstance.customProperties[2].value == "Only me") {
        if (actionContext.userId == actionInstance.creatorId) {
            $("#root").html("");
            if ($(".tabs-content:visible").length <= 0) {
                let $card1 = $('<div class="card-box"></div>');
                let tabs = $(".tabs-content").clone();
                $card1.append(tabs.clone());
                $("#root").append($card1);
                footer1();
            }

            /*  Add Responders  */
            getResponders();

            /*  Add Non-reponders  */
            getNonresponders();
        } else {
            alert("Visible to sender only");
        }
    } else {
        $("#root").html("");
        if ($(".tabs-content:visible").length <= 0) {
            let $card1 = $('<div class="card-box"></div>');
            let tabs = $(".tabs-content").clone();
            $card1.append(tabs.clone());
            $("#root").append($card1);
            footer1();
        }

        // Add Responders
        getResponders();

        // Add Non-reponders
        getNonresponders();
    }
}

/**
 * @description Method for Question view based on user id
 * @param text String contains correct and incorrect message
 * @param name String contains option name
 * @param id String contains option id
 * @param userResponse String contains user response data
 * @param correctAnswer String contains correct answer
 * @param attachmentId String contains attachment id of option
 */
function getRadioOptionsCreator(text, optId, ind, result, attachmentId) {
    let $oDiv = $(`<div class="form-group"></div>`);
    /*  If answer is correct  and answered */
    if (result == "correct") {
        $oDiv.append(UxUtils.getCorrectRadiobox(optId, ind, text));
    } else {
        $oDiv.append(UxUtils.getRadioboxSimple(optId, ind, text));
    }
    if (attachmentId != "" && attachmentId.length > 0) {
        let req = ActionHelper.getAttachmentInfo(actionId, attachmentId);
        ActionHelper.executeApi(req).then(function (response) {
            console.info("Attachment - Response: " + JSON.stringify(response));
            $oDiv.find("label.custom-radio").prepend(UxUtils.getOptionImageWithLoader(response.attachmentInfo.downloadUrl));
            Utils.getClassFromDimension(response.attachmentInfo.downloadUrl, `#${optId} .opt-image`);
        })
            .catch(function (error) {
                console.error("AttachmentAction - Error: " + JSON.stringify(error));
            });
    }
    return $oDiv;
}

/**
 * @description Method for Question view based on user id
 * @param text String contains correct and incorrect message
 * @param name String contains option name
 * @param id String contains option id
 * @param userResponse String contains user response data
 * @param correctAnswer String contains correct answer
 * @param attachmentId String contains attachment id of option
 */
function getCheckOptionsCreator(text, optId, ind, result, attachmentId) {
    let $oDiv = $(`<div class="form-group"></div>`);
    /*  If answer is correct  and answered */
    if (result == "correct") {
        $oDiv.append(UxUtils.getCorrectCheckbox(optId, ind, text));
    } else {
        $oDiv.append(UxUtils.getCheckboxSimple(optId, ind, text));
    }
    if (attachmentId != "" && attachmentId.length > 0) {
        let req = ActionHelper.getAttachmentInfo(actionId, attachmentId);
        ActionHelper.executeApi(req).then(function (response) {
            console.info("Attachment - Response: " + JSON.stringify(response));
            $oDiv.find("label.custom-check").prepend(UxUtils.getOptionImageWithLoader(response.attachmentInfo.downloadUrl));
            Utils.getClassFromDimension(response.attachmentInfo.downloadUrl, `#${optId} .opt-image`);
        }).catch(function (error) {
            console.error("AttachmentAction - Error: " + JSON.stringify(error));
        });
    }
    return $oDiv;
}

/*
 * Event to click on back button and recreate landing page
 */
$(document).on("click", ".back", function() {
    createBody();
});

/*
 * Event to click on back button and back to responder and non responder tab page
 */
$(document).on("click", ".back1", function() {
    let userId = $(this).attr("userid-data");
    create_responder_nonresponders();
});

/**
 * @event Change event for expiry date and time
 */
$(document).on("change", "input[name='expiry_time'], input[name='expiry_date']", function () {
    $("#change-quiz-date").removeClass("disabled");
});
/**
 * @event Keydown event for download image in png
 */
KeyboardUtils.keydownClick(document, "#closeKey");

/**
 * @event Click Event for back to responder and non responder page
 */
$(document).on("click", "#closeKey", function () {
    let closeViewRequest = ActionHelper.closeView();

    ActionHelper
        .executeApi(closeViewRequest)
        .then(function (batchResponse) {
            console.info("BatchResponse: " + JSON.stringify(batchResponse));
        })
        .catch(function (error) {
            console.error("Error3: " + JSON.stringify(error));
        });
});

$(document).on("click", "#change-quiz-date", function () {
    let quizExpireDate = $("input[name='expiry_date']").val();
    let quizExpireTime = $("input[name='expiry_time']").val();
    actionInstance.expiryTime = new Date(quizExpireDate + " " + quizExpireTime).getTime();
    actionInstance.customProperties[1].value = new Date(quizExpireDate + " " + quizExpireTime);
    ActionHelper.updateActionInstance(actionInstance);
});

/**
 * @event Keydown event for download image in png
 */
KeyboardUtils.keydownClick(document, "#downloadImage");

/**
 * @event Click event for download image in png
 */
$(document).on({
    click: function(e) {
        let bodyContainerDiv = document.getElementsByClassName("container")[0];
        let backgroundColorOfResultsImage = theme;
        $(".footer").hide();
        html2canvas(bodyContainerDiv, {
            width: bodyContainerDiv.scrollWidth,
            height: bodyContainerDiv.scrollHeight,
            backgroundColor: backgroundColorOfResultsImage,
            useCORS: true,
        }).then((canvas) => {
            let fileName = "training";
            let base64Image = canvas.toDataURL("image/png");
            if (window.navigator.msSaveBlob) {
                window.navigator.msSaveBlob(canvas.msToBlob(), fileName);
            } else {
                let data = base64Image;
                if (data && fileName) {
                    let a = document.createElement("a");
                    a.href = data;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            }
            $(".footer").show();
        });
    }
}, "#downloadImage");

/**
 * @event Keydown event for download CSV
 */
KeyboardUtils.keydownClick(document, "#downloadCSV");

/**
 * @event Click event for download CSV
 */
$(document).on({
    click: function(e) {
        ActionHelper.downloadCSV(actionId, "training");
    }
}, "#downloadCSV");

/**
 * @event Keydown event to show change due by date
 */
KeyboardUtils.keydownClick(document, ".change-due-by-event");

/**
 * @event Click event to show change due by date
 */
$(document).on({
    click: function(e) {
        e.preventDefault();
        $(".change-date").remove();
        $(".close-quiz").remove();
        $(".delete-quiz").remove();

        changeDateSection();

        let ddtt = ((actionInstance.customProperties[1].value).split("T"));
        let dt = ddtt[0].split("-");
        let weekDateFormat = new Date(dt[1]).toLocaleString("default", { month: "short" }) + " " + dt[2] + ", " + dt[0];
        let timeData = new Date(actionInstance.expiryTime);
        let hourData = timeData.getHours();
        let minuteData = timeData.getMinutes();
        let currentTime = hourData + ":" + minuteData;
        $(".form_date input").val(weekDateFormat);
        $(".form_date").attr({ "data-date": weekDateFormat });
        $(".form_time").datetimepicker({
            language: "en",
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 1,
            minView: 0,
            maxView: 1,
            forceParse: 0
        });

        $(".form_time input").val(currentTime);

        let dateInput = $("input[name='expiry_date']");
        let container = $(".bootstrap-iso form").length > 0 ? $(".bootstrap-iso form").parent() : "body";
        let options = {
            format: "M dd, yyyy",
            container: container,
            todayHighlight: true,
            autoclose: true,
            orientation: "top"
        };
        dateInput.datepicker(options);
        return false;
    }
}, ".change-due-by-event");

/**
 * @event Click event to close change, close and delete quiz confirm section
 */
$(document).on("click", ".cancel-question-delete", function () {
    $(".change-date").remove();
    $(".close-quiz").remove();
    $(".delete-quiz").remove();
});

/**
 * @event Click event for delete quiz
 */
$(document).on("click", "#delete-quiz", function () {
    ActionHelper.deleteActionInstance(actionId);
});

/**
 * @event Click event for change quiz expiry date
 */
$(document).on("click", "#change-quiz-question", function () {
    ActionHelper.closeActionInstance(actionId, actionInstance.version);
});

/**
 * @event Keydown event to show delete quiz
 */
KeyboardUtils.keydownClick(document, ".delete-quiz-event");

/**
 * @event Click event to show delete quiz
 */
$(document).on({
    click: function (e) {
        e.preventDefault();
        $(".change-date").remove();
        $(".close-quiz").remove();
        $(".delete-quiz").remove();
        deleteTrainingSection();
        return false;
    }
}, ".delete-quiz-event");

/**
 * @event Keydown event to show close quiz
 */
KeyboardUtils.keydownClick(document, ".close-quiz-event");

/**
 * @event Click event to show close quiz
 */
$(document).on({
    click: function (e) {
        e.preventDefault();
        $(".change-date").remove();
        $(".close-quiz").remove();
        $(".delete-quiz").remove();
        closeTrainingSection();
        return false;
    }
}, ".close-quiz-event");

/**
 * @event Keydown event to show change due by date
 */
KeyboardUtils.keydownClick(document, ".change-due-by-event");

/**
 * @event Click event to show change due by date
 */
$(document).on({
    click: function (e) {
        e.preventDefault();
        $(".change-date").remove();
        $(".close-quiz").remove();
        $(".delete-quiz").remove();

        changeDateSection();

        let ddtt = ((actionInstance.customProperties[1].value).split("T"));
        let dt = ddtt[0].split("-");
        let weekDateFormat = new Date(dt[1]).toLocaleString("default", { month: "short" }) + " " + dt[2] + ", " + dt[0];
        let timeData = new Date(actionInstance.expiryTime);
        let hourData = timeData.getHours();
        let minuteData = timeData.getMinutes();
        let currentTime = hourData + ":" + minuteData;
        $(".form_date input").val(weekDateFormat);
        $(".form_date").attr({ "data-date": weekDateFormat });
        $(".form_time").datetimepicker({
            language: "en",
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 1,
            minView: 0,
            maxView: 1,
            forceParse: 0
        });

        $(".form_time input").val(currentTime);

        let dateInput = $("input[name='expiry_date']");
        let container = $(".bootstrap-iso form").length > 0 ? $(".bootstrap-iso form").parent() : "body";
        let options = {
            format: "M dd, yyyy",
            container: container,
            todayHighlight: true,
            autoclose: true,
            orientation: "top"
        };
        dateInput.datepicker(options);
        return false;
    }
}, ".change-due-by-event");

/*
 * Event to show responders and non responders page
 */
$(document).on("click", "#show-responders", function() {
    create_responder_nonresponders();
});

/**
 * Variable contains text section for media file
 */
Localizer.getString("trainingContent").then(function (result) {
    trainingContentKey = result;
    contentSection = UxUtils.getTrainingContentContainer(trainingContentKey);
});

/**
 * @event Keydown event for show responders list
 */
KeyboardUtils.keydownClick(document, "#show-responders span");

/**
 * @event Keydown event for back button
 */
KeyboardUtils.keydownClick(document, ".back");

/**
 * @event Keydown event for back button of responders result view
 */
KeyboardUtils.keydownClick(document, ".back1");


/**
 * @event Keydown event for result view of responders
 */
KeyboardUtils.keydownClick(document, ".getresult");