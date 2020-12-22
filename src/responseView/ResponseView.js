import {
    Localizer,
    ActionHelper
} from "../common/ActionSdkHelper";
import { Constants } from "../common/utils/Constants";
import { UxUtils } from "../common/utils/UxUtils";
import { Utils } from "../common/utils/Utils";

let $root = "";
let row = {};
let actionInstance = null;
let isShowAnswerEveryQuestion = "";
let summaryAnswerResp = [];
let memberIds = [];
let myUserId = [];
let contextActionId;
let request = "";
let actionDataRows = null;
let actionDataRowsLength = 0;
let questCounter = 1;
let questionKey = "";
let questionsKey = "";
let startKey = "";
let noteKey = "";
let correctKey = "";
let incorrectKey = "";
let correctAnswerIsKey = "";
let submitKey = "";
let nextKey = "";
let backKey = "";
let pagination = 0;
let choiceAnyChoiceKey = "";
let continueKey = "";
let answerResponseKey = "";
let yourAnswerKey = "";
let correctAnswerKey = "";
let yourAnswerIsKey = "";
let quizSummaryKey = "";
let quizExpiredKey = "";
let rightAnswerIsKey = "";
let questionSelectorCounter = 0;
let trainingSummary = "";
let trainingExpired = "";
let doneKey = "";
let completeTrainingKey = "";
let previousKey = "";
let footerSection1 = "";
let footerSection2 = "";
let footerSection3 = "";

/* Async method for fetching localization strings */
/**
 * @description Method to get Local string
 */
async function getStringKeys() {
    Localizer.getString("question").then(function(result) {
        questionKey = result;
        $(".question-key").text(questionKey);
    });

    Localizer.getString("questions").then(function(result) {
        questionsKey = result;
        $(".question-key").text(questionsKey);
    });

    Localizer.getString("start").then(function(result) {
        startKey = result;
        $("#start").text(startKey);
    });

    Localizer.getString("note").then(function(result) {
        noteKey = result;
        $(".note-key").text(noteKey);
    });

    Localizer.getString("chooseAnyChoice").then(function(result) {
        choiceAnyChoiceKey = result;
    });

    Localizer.getString("continue").then(function(result) {
        continueKey = result;
    });

    Localizer.getString("answerResponse").then(function(result) {
        answerResponseKey = result;
    });

    Localizer.getString("correct").then(function(result) {
        correctKey = result;
    });

    Localizer.getString("yourAnswer").then(function(result) {
        yourAnswerKey = result;
    });

    Localizer.getString("incorrect").then(function(result) {
        incorrectKey = result;
    });

    Localizer.getString("correctAnswer").then(function(result) {
        correctAnswerKey = result;
    });

    Localizer.getString("yourAnswerIs").then(function(result) {
        yourAnswerIsKey = result;
    });

    Localizer.getString("rightAnswerIs").then(function(result) {
        rightAnswerIsKey = result;
    });

    Localizer.getString("submit").then(function(result) {
        submitKey = result;
        $(".submit-key").text(submitKey);
    });

    Localizer.getString("quiz_summary").then(function(result) {
        quizSummaryKey = result;
    });

    Localizer.getString("next").then(function(result) {
        nextKey = result;
        $(".next-btn-sec").text(nextKey);
    });

    Localizer.getString("back").then(function(result) {
        backKey = result;
        $(".back-key").text(backKey);
    });

    Localizer.getString("quiz_expired").then(function(result) {
        quizExpiredKey = result;
        $("#quiz-expired-key").text(backKey);
    });

    Localizer.getString("correctAnswerIs").then(function(result) {
        correctAnswerIsKey = result;
    });

    Localizer.getString("trainingSummary").then(function(result) {
        trainingSummary = result;
    });

    Localizer.getString("trainingExpired").then(function(result) {
        trainingExpired = result;
    });

    Localizer.getString("done").then(function(result) {
        doneKey = result;
    });

    Localizer.getString("completeTraining").then(function(result) {
        completeTrainingKey = result;
    });

    Localizer.getString("previous").then(function(result) {
        previousKey = result;
        $(".next-btn-sec").text(previousKey);
    });
}

/**
 * @description Method to get theme and load page content
 * @param request object
 */
async function getTheme(request) {
    let response = await ActionHelper.executeApi(request);
    let context = response.context;
    $("form.section-1").show();
    let theme = context.theme;
    $("link#theme").attr("href", "css/style-" + theme + ".css");
    $("div.section-1").append(`<div class="row"><div class="col-12"><div id="root"></div></div></div>`);
    $root = $("#root");
    setTimeout(() => {
        $("div.section-1").show();
        $("div.footer").show();
    }, Constants.setIntervalTimeThousand());
    ActionHelper.hideLoader();
    OnPageLoad();
}

/**
 * @description Method to get responder ids who responded the app
 * @param actionId string identifier
 */
async function getResponderIds(actionId) {
    ActionHelper
        .executeApi(ActionHelper.requestDataRows(actionId))
        .then(function(batchResponse) {
            actionDataRows = batchResponse.dataRows;
            actionDataRowsLength = actionDataRows == null ? 0 : actionDataRows.length;
            if (actionDataRowsLength > 0) {
                for (let i = 0; i < actionDataRowsLength; i++) {
                    memberIds.push(actionDataRows[i].creatorId);
                }
            }
        }).catch(function(error) {
            console.error("Console log: Error: " + JSON.stringify(error));
        });
}

// *********************************************** HTML ELEMENT***********************************************
/**
 * @description Event when document is ready
 */
$(document).ready(function() {
    request = ActionHelper.getContextRequest();
    getStringKeys();
    getTheme(request);
});

/**
 * @description Method to create body when page load
 */
function OnPageLoad() {
    ActionHelper.executeApi(request).then(function(response) {
            console.info("GetContext - Response: " + JSON.stringify(response));
            myUserId = response.context.userId;
            contextActionId = response.context.actionId;
            getResponderIds(contextActionId);
            getActionInstance(response.context.actionId);
        })
        .catch(function(error) {
            console.error("GetContext - Error: " + JSON.stringify(error));
        });
}

/**
 * @description Method to create body of the app
 * @param actionId string identifier
 */
function getActionInstance(actionId) {
    ActionHelper.executeApi(ActionHelper.getActionRequest(actionId))
        .then(function(response) {
            console.info("Response: " + JSON.stringify(response));
            actionInstance = response.action;
            createBody();
        }).catch(function(error) {
            console.error("Error: " + JSON.stringify(error));
        });
}

/**
 * @description Method to create body
 */
function createBody() {
    /* Check if already responded */
    /*  Check Expiry date time  */
    let currentTime = new Date().getTime();
    if (actionInstance.expiryTime <= currentTime) {
        let $card = $('<div class="card"></div>');
        let $spDiv = $('<div class="col-sm-12"></div>');
        let $sDiv = $(`<div class="form-group">${trainingExpired}</div>`);
        $card.append($spDiv);
        $spDiv.append($sDiv);
        $root.append($card);
    } else {
        $("div.section-1").show();
        $("div.section-1").append(headSection1);
        $("#section1-training-title").html(actionInstance.displayName);
        $("#section1-training-description").html(actionInstance.customProperties[0].value);
        let allowMultipleAttempt = actionInstance.customProperties[5].value;
        $("#multiple-attempt").hide();
        $("#quiz-title-image").hide();

        if ($.inArray(myUserId, memberIds) !== -1) {
            $("#multiple-attempt").show();
            if (allowMultipleAttempt == "No") {
                Localizer.getString("multipleAttemptNo").then(function(result) {
                    $("#allow-multiple-attempt").append(`<div><b> ${result} </b></div`);
                    $("#start:button").prop("disabled", true);
                });
            }

            if (allowMultipleAttempt == "Yes") {
                Localizer.getString("multipleAttemptYes").then(function(result) {
                    $("#allow-multiple-attempt").append(`<div><b> ${result} </b></div`);
                });
            }
        }

        /* Create Text and Question summary */
        let imageCounter = 0;
        let successDownLoadImageCounter = 0;
        actionInstance.dataTables.forEach((dataTable, ind) => {
            let isImage = false;
            if (dataTable.attachments.length > 0) {
                imageCounter++;
                isImage = true;
                let req = ActionHelper.getAttachmentInfo(contextActionId, dataTable.attachments[0].id);
                ActionHelper.executeApi(req).then(function(response) {
                        actionInstance.dataTables[ind].attachments[0].url = response.attachmentInfo.downloadUrl;
                        if (actionInstance.dataTables[ind].attachments[0].url != null) {
                            $("#quiz-title-image").attr("src", actionInstance.dataTables[0].attachments[0].url);
                            getClassFromDimension(response.attachmentInfo.downloadUrl, ".quiz-template-image");
                            $(".quiz-template-image").show();
                            $(".quiz-updated-img").show();
                            removeImageLoader(".quiz-template-image");
                            successDownLoadImageCounter++;
                        }
                        ActionHelper.hideLoader();

                    })
                    .catch(function(error) {
                        console.error("AttachmentAction - Errorquiz: " + JSON.stringify(error));
                    });
            }
            $("#question-msg").hide();
            dataTable.dataColumns.forEach((data, index) => {
                if (data.valueType == "LargeText") {
                    /* Call Text Section 1 */
                    let counterDescbox = $("div.desc-box").length;
                    let counter = $("div.card-box").length;
                    let textTitle = data.displayName;
                    if (data.name.indexOf("photo") >= 0) {
                        $("#desc-section").append(textSection3);
                        $("div.desc-box p:last").attr("id", "contain-" + counterDescbox);
                        $("div.desc-box p#contain-" + counterDescbox).find("span.counter").text(counterDescbox);
                        $("div.desc-box p#contain-" + counter).find(".text-description").text(textTitle);
                        Localizer.getString("photo").then(function(result) {
                            $("div.desc-box p#contain-" + counterDescbox).find("span.training-type").text(result);
                            $("div.desc-box p#contain-" + counterDescbox).text(textTitle);
                        });

                        if (data.attachments.length > 0) {
                            $.each(data.attachments, function(i, att) {
                                imageCounter++;
                                let attachmentId = att.id;
                                let req = ActionHelper.getAttachmentInfo(contextActionId, attachmentId);
                                ActionHelper.executeApi(req).then(function(response) {
                                        actionInstance.dataTables[ind].dataColumns[index].attachments[i].url = response.attachmentInfo.downloadUrl;
                                        successDownLoadImageCounter++;
                                    })
                                    .catch(function(error) {
                                        console.error("AttachmentAction - Error: " + JSON.stringify(error));
                                    });
                            });
                        }
                    } else if (data.name.indexOf("document") >= 0) {
                        $("#desc-section").append(textSection3);
                        $("div.desc-box p:last").attr("id", "contain-" + counterDescbox);
                        $("div.desc-box p#contain-" + counterDescbox).find("span.counter").text(counterDescbox);
                        Localizer.getString("document").then(function(result) {
                            $("div.desc-box p#contain-" + counterDescbox).find("span.training-type").text(result);
                            $("div.desc-box p#contain-" + counterDescbox).text(textTitle);
                        });
                        if (data.attachments.length > 0) {
                            $.each(data.attachments, function(i, att) {
                                imageCounter++;
                                let attachmentId = att.id;
                                let req = ActionHelper.getAttachmentInfo(contextActionId, attachmentId);
                                ActionHelper.executeApi(req).then(function(response) {
                                        actionInstance.dataTables[ind].dataColumns[index].attachments[i].url = response.attachmentInfo.downloadUrl;
                                        successDownLoadImageCounter++;
                                    })
                                    .catch(function(error) {
                                        console.error("AttachmentAction - Error: " + JSON.stringify(error));
                                    });
                            });
                        }
                    } else if (data.name.indexOf("video") >= 0) {
                        $("#desc-section").append(textSection3);
                        $("div.desc-box p:last").attr("id", "contain-" + counterDescbox);
                        $("div.desc-box p#contain-" + counterDescbox).find("span.counter").text(counterDescbox);
                        $("div.desc-box p#contain-" + counterDescbox).find(".text-description").text(textTitle);
                        Localizer.getString("video").then(function(result) {
                            $("div.desc-box p#contain-" + counterDescbox).find("span.training-type").text(result);
                            $("div.desc-box p#contain-" + counterDescbox).text(textTitle);
                        });

                        if (data.attachments.length > 0) {
                            $.each(data.attachments, function(i, att) {
                                imageCounter++;
                                let attachmentId = att.id;
                                let req = ActionHelper.getAttachmentInfo(contextActionId, attachmentId);
                                ActionHelper.executeApi(req).then(function(response) {
                                        actionInstance.dataTables[ind].dataColumns[index].attachments[i].url = response.attachmentInfo.downloadUrl;
                                        successDownLoadImageCounter++;
                                    })
                                    .catch(function(error) {
                                        console.error("AttachmentAction - Error: " + JSON.stringify(error));
                                    });
                            });
                        }
                    } else {
                        $("#desc-section").append(textSection1);
                        $("div.desc-box p:last").attr("id", "contain-" + counterDescbox);
                        $("div.desc-box p#contain-" + counterDescbox).find("span.counter").text(counterDescbox);
                        Localizer.getString("text").then(function(result) {
                            $("div.desc-box p#contain-" + counterDescbox).find("span.training-type").text(result);
                            $("div.desc-box p#contain-" + counterDescbox).text(textTitle);
                        });
                    }

                } else if (data.valueType == "SingleOption" || data.valueType == "MultiOption") {
                    /* Call Question Section 1 */
                    let correctAnswers = JSON.parse(actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value);
                    let questionCounter = correctAnswers.length;
                    if (questionCounter > 0) {
                        $("#question-msg").show();
                        $("#question-counter").text(questionCounter);
                    }
                    Localizer.getString("question_with", Utils.numbertowords(Object.keys(data.options).length)).then(function(result) {
                        //$("div.desc-box p#contain-" + counterDescbox).find("span.training-type").text(result);
                    });
                    /* Question Attachments */
                    if (data.attachments.length > 0) {
                        imageCounter++;
                        let attachmentId = data.attachments[0].id;
                        let req = ActionHelper.getAttachmentInfo(contextActionId, attachmentId);
                        ActionHelper.executeApi(req).then(function(response) {
                                actionInstance.dataTables[ind].dataColumns[index].attachments[0].url = response.attachmentInfo.downloadUrl;
                                successDownLoadImageCounter++;
                            })
                            .catch(function(error) {
                                console.error("AttachmentAction - Error: " + JSON.stringify(error));
                            });
                    }
                }

                $.each(data.options, function(optind, opt) {
                    if (opt.attachments != undefined && opt.attachments.length > 0) {
                        imageCounter++;
                        let attachmentId = opt.attachments[0].id;
                        let req = ActionHelper.getAttachmentInfo(contextActionId, attachmentId);
                        ActionHelper.executeApi(req).then(function(response) {
                                actionInstance.dataTables[ind].dataColumns[index].options[optind].attachments[0].url = response.attachmentInfo.downloadUrl;
                                successDownLoadImageCounter++;
                            })
                            .catch(function(error) {
                                console.error("AttachmentAction - Error: " + JSON.stringify(error));
                            });
                    }
                });
            });

        });

        //$("div.section-1").append(`<div class="container pb-100"></div>`);
        $("div.section-1").after(footerSection1);
        $("#start").addClass("disabled");
        $("#start").prepend(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);
        let tid = setInterval(() => {
            if (imageCounter == successDownLoadImageCounter) {
                $("#start").find(".spinner-border").remove();
                $("#start").removeClass("disabled");
                clearInterval(tid);
            }
        }, Constants.setIntervalTimeHundred());

    }
}

/**
 * @description Method to get image dimensions and image div dimensions
 * @param imageURL contains image url
 * @param selector contains image where url placed
 */
function getClassFromDimension(imgURL, selector) {
    let tmpImg = new Image();
    tmpImg.src = imgURL;
    let imgWidth = 0;
    let imgHeight = 0;
    $(tmpImg).on("load", function() {
        imgWidth = tmpImg.width;
        imgHeight = tmpImg.height;
        let divWidth = Math.round($(selector).width());
        let divHeight = Math.round($(selector).height());
        let getClass = "";
        if (imgHeight > divHeight) {
            /* height is greater than width */
            getClass = ("heightfit");
        } else if (imgWidth > divWidth) {
            /* width is greater than height */
            getClass = ("widthfit");
        } else {
            /* small image */
            getClass = ("smallfit");
        }
        $(selector).addClass(getClass);

    });
}

/**
 * @description Method to get remove Image loader from image section
 * @param selector object html on which remove image
 */
function removeImageLoader(selector) {
    let tid = setInterval(() => {
        if ($(selector).hasClass("heightfit") || $(selector).hasClass("widthfit") || $(selector).hasClass("smallfit")) {
            $(".loader-cover").addClass("d-none");
            clearInterval(tid);
        }
    }, Constants.setIntervalTimeHundred());
}
/**
 * @description Method to create question view
 * @param actionId string identifier
 */
function createQuestionView(indexNum, questionNumber) {
    let count = 1;
    actionInstance.dataTables.forEach((dataTable) => {
        dataTable.dataColumns.forEach((question, ind) => {

            if (ind == indexNum) {
                let count = ind + 1;
                let $card = $('<div class="card-box card-blank card-box-question"></div>');
                let $questionHeading = `<div class="d-table mb--8 pre-none">
                        <label class="font-12">
                            <strong class="question-number-title bold>
                                <label class="font-12">
                                    <span class="training-type question-number">Question</span>&nbsp;#&nbsp;
                                <span class="">${questionNumber}</span>
                                </label>
                            </strong>
                        </label>
                        <label class="float-right result-status" id="status-1"></label>
                        <div class="clearfix"></div>
                    </div>
                    <div class="quiz-updated-img cover-img min-max-132 mb--8 bg-none bdr-none" style="display:none">
                        <img src="" class="image-responsive question-template-image heightfit" style="">
                    </div>
                    <div class="semi-bold font-14 mb--16 question-title"><p class="">${question.displayName}</p></div>`;

                $card.append($questionHeading);
                //add radio button
                if (question.valueType == "SingleOption") {
                    //add checkbox button
                    question.options.forEach((option) => {
                        let attachmentURL = option.attachments.length > 0 ? option.attachments[0].url : "";
                        let $radioOption = getRadioButton(
                            option.displayName,
                            question.name,
                            option.name,
                            attachmentURL
                        );
                        $card.append($radioOption);
                    });
                } else {
                    question.options.forEach((option) => {
                        let attachmentURL = option.attachments.length > 0 ? option.attachments[0].url : "";
                        let $radioOption = getCheckboxButton(
                            option.displayName,
                            question.name,
                            option.name,
                            attachmentURL
                        );
                        $card.append($radioOption);
                    });
                }
                $("div.section-2 > .container:first").append($card);
            }

        });

        count++;
    });
    if (actionInstance.customProperties[3].value == "Yes" && $("div.card-box:visible").find("input").parent("label").attr("disabled") !== "disabled") {
        $("#next").text("Check").attr("id", "check");
    }
}

/**
 * @description Method to create radio button
 * @param text string
 * @param name string
 * @param id string identifier
 */
function getRadioButton(text, name, id, attachmentURL) {
    let $divData = $(` <div class="option-sec">
        <div class="card-box card-bg card-border mb--8">
            <div class="radio-section custom-radio-outer" id="${id}" columnId="${name}" >
                <label class="custom-radio d-block font-14 cursor-pointer selector-inp">
                    <input type="radio" name="${name}" id="${id}">
                        <span class="radio-block"></span>  <div class="pr--32 check-in-div">${text}</div>
                </label>
            </div>
        </div>
    </div>`);
    if (attachmentURL != "") {
        $divData.find(".custom-check").prepend(UxUtils.getOptionImageWithLoader(attachmentURL));
    }
    return $divData;
}

/**
 * @description Method to create checkbox button
 * @param text string
 * @param name string
 * @param id string identifier
 */
function getCheckboxButton(text, name, id, attachmentURL) {
    let $divData = $(`<div class="option-sec">
        <div class="card-box card-bg card-border mb--8">
            <div class="radio-section custom-check-outer selector-inp" id="${id}" columnId="${name}" >
                <label class="custom-check form-check-label d-block">
                    <input type="checkbox" class="radio-block" name="${name}" id="${id}">
                        <span class="checkmark"></span> <div class="pr--32 check-in-div">${text}</div>
                </label>
            </div>
        </div>
    </div>`);
    if (attachmentURL != "") {
        $divData.find(".custom-check").prepend(UxUtils.getOptionImageWithLoader(attachmentURL));
    }
    return $divData;
}

/**
 * @description Method to show Result view if already attempted the quiz
 */
function loadSummaryView() {
    $("div.section-2").hide();
    $("div.section-2-footer").hide();
    isShowAnswerEveryQuestion = actionInstance.customProperties[3].value;
    if ($(".section-3").length <= 0) {
        $("div.section-2").after(`<div class="section-3"><div class="container"><label><strong>${trainingSummary}</strong></label></div></div>`);
        $("div.section-3 .container:first").append(headSection1);

        /* Main Heading and Description */
        $("div.section-3 #multiple-attempt").hide();
        $("div.section-3 #quiz-title-image").hide();
        $("div.section-3 .quiz-updated-img").hide();
        $("div.section-3 #section1-training-title").hide();
        $("div.section-3 #section1-training-description").hide();
        $("div.section-3 #question-msg").hide();
        /* Create Text and Question summary */
        actionInstance.dataTables.forEach((dataTable, ind) => {
            let questCount = 1;
            dataTable.dataColumns.forEach((data, ind) => {
                $("div.section-3").show();
                //$("div.section-3").append(textSection2);
                if (data.valueType == "LargeText") {
                    //$("div.section-3 .container:first").append(textSection2);
                    let counter = $("div.card-box").length;
                    let counterDescbox = $("div.desc-box").length;
                    /* Call Text Section 1 */
                    //let counter = $(".section-3 div.card-box").length;
                    //let textTitle = data.displayName;
                    let textDescription = data.options[0].displayName;

                    let textTitle = data.displayName;
                    //$("div.section-3 .container:first").append(textSection1);
                    $("div.section-3 #desc-section").append(textSection1);
                    $("div.desc-box p:last").attr("id", "contain-" + counterDescbox);
                    $("div.desc-box p#contain-" + counterDescbox).find("span.counter").text(counterDescbox);
                    Localizer.getString("text").then(function(result) {
                        $("div.desc-box p#contain-" + counterDescbox).find("span.training-type").text(result);
                        $("div.desc-box p#contain-" + counterDescbox).text(textTitle);
                    });

                    if (data.name.indexOf("photo") >= 0) {
                        Localizer.getString("photo").then(function(result) {
                            //$("div.card-box#content-" + counter).find(".training-type").text(result);
                            $("div.desc-box p#contain-" + counterDescbox).find("span.training-type").text(result);
                            $("div.desc-box p#contain-" + counterDescbox).text(textTitle);
                        });
                        let attachments = data.attachments;
                        let $carousel = $(`<div id="carouselExampleIndicators" class="carousel slide max-min-220" data-ride="carousel"></div>`);
                        let $olSection = $(`<ol class="carousel-indicators"></ol>`);
                        let $carouselInner = $(`<div class="carousel-inner"></div>`);

                        if (attachments.length > 0) {
                            let count = 0;
                            $carousel.append($olSection);
                            $carousel.append($carouselInner);
                            attachments.forEach(function(att, i) {
                                let $imgDiv = $(`<div class="carousel-item ${count == 0 ? "active" : ""}">
                                                        <img class="d-block w-100" src="${att.url}" alt="${count + 1} slide">
                                                    </div>`);
                                $carouselInner.append($imgDiv);
                                $carousel.append(UxUtils.getCarouselSection());
                                count++;
                            });
                            $("div.card-box#content-" + counter).find("#text-description").after($carousel);
                            $(".carousel").carousel();
                            //$(".carousel").after("<hr>");
                        }
                    } else if (data.name.indexOf("video") >= 0) {
                        Localizer.getString("video").then(function(result) {
                            $("div.card-box#content-" + counter).find(".training-type").text(result);
                        });
                        $("div.card-box#content-" + counter).find("#text-description").after('<div class="embed-responsive embed-responsive-4by3"><video controls="" playsinline class="video" id="' + data.name + '" src="' + data.attachments[0].url + '"></video></div>');
                    } else if (data.name.indexOf("document") >= 0) {
                        Localizer.getString("document").then(function(result) {
                            $("div.card-box#content-" + counter).find(".training-type").text(result);
                            $("div.card-box#content-" + counter).find("#text-description").after(`<p><a href="${data.attachments[0].url}" class="font-14 semi-bold teams-link a-link" download>${data.attachments[0].name}</a></p>`);
                        });
                    }
                } else if (data.valueType == "SingleOption" || data.valueType == "MultiOption") {
                    /* Call Question Section 1 */
                    let textTitle = data.displayName;
                    let counterDescbox = $("div.desc-box").length;
                    let questionCounter = $("div.section-3 .container:first div.col-12 div.card-box div#desc-section div.question-box-sec").length;
                    questionCounter++;
                    if (questionCounter > 0) {
                        $("div.section-3 .container:first div.col-12 div.card-box p#question-msg").show();
                        $("div.section-3 .container:first div.col-12 div.card-box  span#question-counter").text(questionCounter);
                    }
                    $("div#desc-section").append(questionSection1);
                    $("div.desc-box p:last").attr("id", "contain-" + counterDescbox);
                    $("div.desc-box p#contain-" + counterDescbox).find("span.counter").text(counterDescbox);
                    Localizer.getString("question_with", Utils.numbertowords(Object.keys(data.options).length)).then(function(result) {
                        $("div.desc-box p#contain-" + counterDescbox).find("span.training-type").text(result);
                        $("div.desc-box p#contain-" + counterDescbox).text(textTitle).hide();
                    });
                }
            });

            let $mb16Div2 = $(`<div class="mt--16"></div>`);
            /*  Check Show Correct Answer  */
            if (Object.keys(row).length > 0) {
                let correctAnswer = actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value;
                let score = 0;
                $(".section-2").find("div.card-box-question").each(function(i, val) {
                    let cardQuestion = $(val).clone().show();
                    $(".section-3").find(".container:first").append(cardQuestion);
                    let correctAnswerString = "";
                    let userAnswerString = "";
                    let userAnswerArray = row[i + 1];
                    if ($(val).find(".option-sec input[type='radio']").length > 0) {
                        if (Utils.isJson(correctAnswer)) {
                            correctAnswer = JSON.parse(correctAnswer);
                        }
                        correctAnswerString = correctAnswer[i];
                        $(val).find(".option-sec input[type='radio']").each(function(optindex, opt) {
                            let optId = $(opt).attr("id");
                            if (correctAnswer[i].includes(optId)) {
                                $(cardQuestion).find("input[type='radio']#" + optId).parent("label.custom-radio").find(".check-in-div").append(`&nbsp;<i class="success-with-img">
                                ${Constants.getSuccessTickIcon()}
                                </i>`);
                            }
                        });
                    } else {
                        if (Utils.isJson(correctAnswer)) {
                            correctAnswer = JSON.parse(correctAnswer);
                        }
                        correctAnswerString = correctAnswer[i];
                        //correctAnswerString = correctAnswer[questCount].join(",");
                        $(val).find(".option-sec input[type='checkbox']").each(function(optindex, opt) {
                            let optId = $(opt).attr("id");
                            if (correctAnswer[i].includes(optId)) {
                                $(cardQuestion).find("input[type='checkbox']#" + optId).parent("label.custom-check").find(".check-in-div").append(`&nbsp;<i class="success-with-img">
                                ${Constants.getSuccessTickIcon()}
                                </i>`);
                            }
                        });
                    }
                    if (Utils.isJson(userAnswerArray)) {
                        userAnswerString = JSON.parse(userAnswerArray).join(",");
                    } else {
                        userAnswerString = userAnswerArray;
                    }

                    if (correctAnswerString == userAnswerString) {
                        score++;
                        $(cardQuestion).find(".result-status").html(UxUtils.getCorrectArea(correctKey));
                    } else {
                        $(cardQuestion).find(".result-status").html(UxUtils.getIncorrectArea(incorrectKey));
                    }
                });
                let scoreIs = (score / correctAnswer.length) * 100;
                if (scoreIs % 1 != 0) {
                    scoreIs = parseFloat(scoreIs).toFixed(2);
                }
                Localizer.getString("score", ":").then(function(result) {
                    $($mb16Div2).append(UxUtils.getScoreResponseView(result, scoreIs));
                });

                let summeryQuestionCounter = $("div.section-3 .container:first div.col-12 div.card-box div#desc-section div.question-box-sec").length;
                if (summeryQuestionCounter > 0) {
                    $(".section-3 .row").before($mb16Div2);
                }

                $(".summary-section").find(".option-sec .card-box").removeClass("alert-success");
            }
        });
        $("div.section-3 .container:first").after(footerSection3);
        //$("div.section-3 .container:first").after(UxUtils.getSummarySectionFooter(completeTrainingKey));
    }

}

// *********************************************** HTML ELEMENT END***********************************************

// *********************************************** SUBMIT ACTION***********************************************
/**
 * @description Method to submit form
 */
function submitForm() {
    ActionHelper
        .executeApi(ActionHelper.getContextRequest())
        .then(function(response) {
            console.info("GetContext - Response: " + JSON.stringify(response));
            addDataRows(response.context.actionId);
        })
        .catch(function(error) {
            console.error("GetContext - Error: " + JSON.stringify(error));
        });
}

/**
 * @description  Method to get data row
 * @param actioId string identifier
 */
function getDataRow(actionId) {
    if (Object.keys(row).length <= 0) {
        row = { "": "" };
    }
    let data = {
        id: Utils.generateGUID(),
        actionId: actionId,
        dataTableId: "TrainingDataSet",
        columnValues: row,
    };
    return data;
}

/**
 * @description  Method to add data row
 * @param actionId string identifier
 */
function addDataRows(actionId) {
    let addDataRowRequest = ActionHelper.addDataRow(getDataRow(actionId));
    // let closeViewRequest = ActionHelper.closeView();
    let batchRequest = ActionHelper.batchRequest([addDataRowRequest]);
    ActionHelper.executeBatchApi(batchRequest)
        .then(function(batchResponse) {
            console.info("BatchResponse: " + JSON.stringify(batchResponse));
        })
        .catch(function(error) {
            console.error("Error: " + JSON.stringify(error));
        });
}

/**
 * @description  Method to create training section with pagination
 * @param indexNum number identifier
 */
function createTrainingSection(indexNum) {
    /* Create Text and Question summary */
    actionInstance.dataTables.forEach((dataTable, index) => {
        if (index == 0) {
            let y = Object.keys(dataTable.dataColumns).length;
            $("#y").text(y);
            dataTable.dataColumns.forEach((data, ind) => {
                if (ind == indexNum) {
                    let x = ind + 1;
                    $("#x").text(x);
                    let y = $("#y").text();
                    if (data.valueType == "LargeText") {
                        /* Call Text Section 1 */
                        $("div.section-2 > .container:first").append(textSection2);
                        let counter = $("div.section-2 .container > div.card-box").length;
                        let textTitle = data.displayName;
                        let textDescription = data.options[0].displayName;
                        $("div.section-2 > .container:first > div.card-box:last").find("span.counter").text(counter);
                        $("div.section-2 > .container:first > div.card-box:last").find("#text-description").text(textTitle);
                        $("div.section-2 > .container:first > div.card-box:last").find(".text-content-section").text(textDescription);
                        $("div.section-2 > .container:first > div.card-box:last").attr("id", "page-" + counter);
                        if (data.name.indexOf("photo") >= 0) {
                            Localizer.getString("photo").then(function(result) {
                                $("div.section-2 > .container:first > div.card-box:last").find("span.section-type-title").text(result);
                            });
                            let attachments = data.attachments;
                            let $carousel = $('<div id="carouselExampleIndicators" class="carousel slide max-min-220" data-ride="carousel"></div>');
                            let $olSection = $('<ol class="carousel-indicators"></ol>');
                            let $carouselInner = $('<div class="carousel-inner"></div>');
                            if (attachments.length > 0) {
                                let count = 0;
                                $carousel.append($olSection);
                                $carousel.append($carouselInner);
                                attachments.forEach(function(att, i) {
                                    let $imgDiv = $(`<div class="carousel-item ${count == 0 ? "active" : ""}">
                                                        <img class="d-block w-100" src="${att.url}" alt="${count + 1} slide">
                                                    </div>`);
                                    $carouselInner.append($imgDiv);
                                    $carousel.append(UxUtils.getCarouselSection());
                                    count++;
                                });
                                $("div.section-2 .container:first div.card-box:visible").find("#text-description").after($carousel);
                                $(".carousel").carousel();
                                //$(".carousel").after("<hr>");
                            }
                        } else if (data.name.indexOf("document") >= 0) {
                            Localizer.getString("document").then(function(result) {
                                $("div.section-2 > .container:first > div.card-box:last").find("span.section-type-title").text(result);
                            });
                            $("div.section-2 > .container:first > div.card-box:last").find("#text-description").after(`<p class="doc-name">${Constants.getDocumentIcon()} <a href="${data.attachments[0].url}" class="font-14 semi-bold teams-link a-link" download>${data.attachments[0].name}</a></p>`);
                        } else if (data.name.indexOf("video") >= 0) {
                            let textTitle = data.displayName;
                            let textDescription = data.options[0].displayName;
                            $("div.section-1").append(textSection3);
                            $("div.section-2 > .container:first > div.card-box:last").find("span.counter").text(counter);
                            $("div.section-2 > .container:first > div.card-box:last").find("#text-description").text(textTitle);
                            $("div.section-2 > .container:first > div.card-box:last").find(".text-content-section").text(textDescription);
                            Localizer.getString("video").then(function(result) {
                                $("div.section-2 > .container:first > div.card-box:last").find("span.section-type-title").text(result);
                                $("div.section-2 > .container:first > div.card-box:last").find("img.image-sec").remove();
                                $("div.section-2 > .container:first > div.card-box:last").attr("id", data.name);
                            });
                            $("div.section-2 > .container:first > div.card-box:last").find("#text-description").after('<div class="embed-responsive embed-responsive-4by3"><video controls="" playsinline class="video" id="' + data.name + '" src="' + data.attachments[0].url + '"></video></div>');
                        } else {
                            /* text */
                            $("div.section-1").append(textSection1);
                            $("div.card-box:last").find("span.counter").text(counter);
                            $("div.card-box:last").find("#text-description").text(textTitle);

                        }

                    } else if (data.valueType == "SingleOption" || data.valueType == "MultiOption") {
                        createQuestionView(indexNum, questCounter);
                        let counter = $("div.section-2 .container > div.card-box").length;
                        if (data.attachments.length > 0) {
                            $(".question-template-image").attr("src", data.attachments[0].url);
                            $(".quiz-updated-img").show();
                        }
                        if (data.options.length > 0) {
                            $.each(data.options, function(i, opt) {
                                if (opt.attachments != undefined && opt.attachments.length > 0) {
                                    let imageUrl = opt.attachments[0].url;
                                    $("div.section-2 > .container:first > div.card-box.card-box-question")
                                        .find(`input#question${questCounter}option${i + 1}`)
                                        .before(`<div class="option-image-section cover-img min-max-132 mb--4" id="quiz-ans-image">
                                                <img src="${imageUrl}" class="opt-image img-responsive heightfit">
                                            </div>`);
                                }
                            });
                        }
                        $("div.section-2 > .container:first > div.card-box:last").find("span.counter").text(counter);
                        questCounter++;
                    }
                }
                if ($("#x").text() == $("#y").text()) {
                    $(".footer.section-2-footer .check-key").text(doneKey);
                    $(".footer.section-2-footer #next").text(doneKey);
                    $(".footer.section-2-footer #next").addClass("done-key");
                    $(".footer.section-2-footer #check").text(doneKey);
                    $(".footer.section-2-footer #check").addClass("done-key");
                    $(".footer.section-2-footer .check-key").removeClass(".check-key").addClass("done-key");
                }
            });
        }
    });
}

// *********************************************** SUBMIT ACTION END***********************************************
// *********************************************** OTHER ACTION STARTS***********************************************

$(document).on("click", ".done-key", function() {
    submitForm();
});

/**
 * @event when click on start button on summary view of page
 */
$(document).on("click", "#start", function() {
    $("div.section-1").hide();
    $("div.section-1-footer").hide();
    $("div.section-1").after(`<div class="section-2"><div class="container"></div></div>`);

    /* Show first section */
    $("div.section-2").after(footerSection2);
    //$("div.section-2").after(UxUtils.getResponseTrainingSectionFooter(previousKey, nextKey));

    //$("div.section-2").append(`<div class="container pb-100"></div>`);

    createTrainingSection(pagination);
    $("#back").prop("disabled", true);
    $("#back").addClass("disabled");
});

/**
 * @event click on check button for getting correct or incorrect answer
 */
$(document).on("click", "#check", function() {
    /* Question Validations */
    let data = [];
    let answerKeys = Utils.isJson(actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value) ? JSON.parse(actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value) : actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value;
    let correctAnsArr = [];
    let selectedAnswer = [];
    let allOptions = [];
    let checkCounter = 0;
    let correctAnswer = false;
    let attrName = "";
    let isChecked = false;

    $("div.card-box:visible").find("input[type='checkbox']:checked").each(function(ind, ele) {
        if ($(ele).is(":checked")) {
            checkCounter++;
            selectedAnswer.push($.trim($(ele).attr("id")));
            attrName = $(ele).attr("name");
            data.push($(this).attr("id"));
            isChecked = true;
        }
    });

    $("div.card-box:visible").find("input[type='checkbox']").each(function(ind, ele) {
        allOptions.push($.trim($(this).attr("id")));
    });

    $("div.card-box:visible").find("input[type='radio']:checked").each(function(ind, ele) {
        allOptions.push($.trim($(this).attr("id")));
    });

    if (!row[(questionSelectorCounter + 1)]) {

        row[(questionSelectorCounter + 1)] = [];
    }
    row[(questionSelectorCounter + 1)] = JSON.stringify(data);

    $("div.card-box:visible").find("input[type='radio']:checked").each(function(ind, ele) {
        if ($(ele).is(":checked")) {
            checkCounter++;
            selectedAnswer.push($.trim($(ele).attr("id")));
            attrName = $(ele).attr("name");

            if (!row[(questionSelectorCounter + 1)]) { row[(questionSelectorCounter + 1)] = []; }
            row[(questionSelectorCounter + 1)] = $(this).attr("id");

            isChecked = true;
        }
    });

    if (checkCounter <= 0) {
        $("#next").prop("disabled", true).addClass("disabled");
    } else {
        $("#next").prop("disabled", false).removeClass("disabled");
    }

    if ($(".error-msg").length > 0) {
        $(".error-msg").remove();
    }
    /* Validate if show answer is Yes */
    if (isChecked == true) {
        isChecked = false;
        let ansRes = [];

        $.each(selectedAnswer, function(i, selectedSubarray) {
            if ($.inArray(selectedSubarray, answerKeys[(attrName - 1)]) !== -1) {
                ansRes.push("true");
            } else {
                ansRes.push("false");
            }
        });

        if ((answerKeys[(attrName - 1)].length == ansRes.length) && ($.inArray("false", ansRes) == -1)) {
            correctAnswer = true;
        } else {
            correctAnswer = false;
        }

        $("div.section-2").find("div.card-box").each(function(inde, ele) {
            if ($(ele).is(":visible")) {
                summaryAnswerResp[inde] = correctAnswer;
                return false;
            }
        });

        let correctValue = correctAnsArr.join();
        if (actionInstance.customProperties[3].value == "Yes" && $("div.card-box:visible").find("input").parent("label").attr("disabled") !== "disabled") {
            if (correctAnswer == true) {
                $("div.card-box:last").find(".result").remove();
                $(".result-status").append('<span class="text-success semi-bold">Correct</span>');

                $.each(answerKeys[(attrName - 1)], function(ii, subarr) {
                    correctAnsArr.push($.trim($("#" + subarr).text()));
                    $("#" + subarr).find("div.check-in-div").append(`&nbsp;<i class="success-with-img">${Constants.getSuccessTickIcon()}</i>`);
                });

                $.each(allOptions, function(i, val) {
                    if ($.inArray(val, answerKeys[(attrName - 1)]) != -1) {
                        $("div.option-sec").find("div#" + val).parent().addClass("alert-success");
                    }
                });
                $("#check").text("Next").attr("id", "next");

            } else {
                $("div.card-box:last").find(".result").remove();
                $(".result-status").append('<span class="text-danger semi-bold">Incorrect</span>');
                $.each(answerKeys[(attrName - 1)], function(ii, subarr) {
                    correctAnsArr.push($.trim($("#" + subarr).text()));
                    $("#" + subarr).find("div.check-in-div").append(`&nbsp;<i class="success-with-img">${Constants.getSuccessTickIcon()}</i>`);
                });

                $.each(allOptions, function(i, val) {
                    if ($.inArray(val, answerKeys[(attrName - 1)]) == -1) {
                        $("div.option-sec").find("div#" + val).parent().addClass("alert-danger");
                    }
                });

                $("#check").text("Next").attr("id", "next");
            }

            $("div.section-2").find("div.card-box:visible").find("input").each(function(ind, ele) {
                $(ele).parent("label").attr("disabled", true);
                if ($(ele).parents("div.custom-radio-outer").length > 0) {
                    $(ele).parents("div.custom-radio-outer").addClass("disabled");
                } else {
                    $(ele).parents("div.custom-check-outer").addClass("disabled");
                }
            });
        }

    } else {
        Localizer.getString("notePleaseChooseChoice").then(function(result) {
            $("div.section-2").find("div.card-box:visible").find(".option-sec:last").append(`<p class="mt--32 text-danger choice-required-err"><font>${result}</font></p>`);
        });
    }


});

/**
 * @event Change for radio or check box
 */
$(document).on("change", "input[type='radio'], input[type='checkbox']", function() {
    $(this).each(function(ind, opt) {
        if ($(opt).is(":checked")) {
            $(".text-danger.choice-required-err").remove();
            $("#next").attr("disabled", false).removeClass("disabled");
            return false;
        }
    });
});

/**
 * @event Click Event on next button to load next page or content
 */
$(document).on("click", "#next", function() {

    //$("#back").addClass("disabled");
    //$("#back").removeClass("disabled");
    let data = [];
    let limit = $("#y").text();

    if ($(".error-msg").length > 0) {
        $(".error-msg").remove();
    }
    /* Validate */
    if ($("div.card-box:visible").find(".training-type").text() == "Question") {
        /* Question Validations */
        let answerKeys = Utils.isJson(actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value) ? JSON.parse(actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value) : actionInstance.customProperties[Constants.getCorrectAnswerIndex()].value;
        let correctAnsArr = [];
        let selectedAnswer = [];
        let checkCounter = 0;
        let correctAnswer = false;
        let attrName = "";
        let isChecked = false;

        $("div.card-box:visible").find("input[type='checkbox']:checked").each(function(ind, ele) {
            if ($(ele).is(":checked")) {
                checkCounter++;
                selectedAnswer.push($.trim($(ele).attr("id")));
                attrName = $(ele).attr("name");
                data.push($(this).attr("id"));
                isChecked = true;
            }
        });
        if (!row[(questionSelectorCounter + 1)]) { row[(questionSelectorCounter + 1)] = []; }
        row[(questionSelectorCounter + 1)] = JSON.stringify(data);
        $("div.card-box:visible").find("input[type='radio']:checked").each(function(ind, ele) {
            if ($(ele).is(":checked")) {
                checkCounter++;
                selectedAnswer.push($.trim($(ele).attr("id")));
                attrName = $(ele).attr("name");
                if (!row[(questionSelectorCounter + 1)]) { row[(questionSelectorCounter + 1)] = []; }
                row[(questionSelectorCounter + 1)] = $(this).attr("id");
                isChecked = true;
            }
        });

        if (checkCounter <= 0) {
            $("#next").prop("disabled", true).addClass("disabled");
        } else {
            $("#next").prop("disabled", false).removeClass("disabled");
        }

        /* Validate if show answer is Yes */
        if (isChecked == true) {
            $(".text-danger.choice-required-err").remove();
            $("#next").attr("disabled", "false").removeClass("disabled");
            isChecked = false;
            let ansRes = [];
            $.each(selectedAnswer, function(i, selectedSubarray) {
                if ($.inArray(selectedSubarray, answerKeys[(attrName - 1)]) !== -1) {
                    ansRes.push("true");
                } else {
                    ansRes.push("false");
                }
            });

            if ((answerKeys[(attrName - 1)].length == ansRes.length) && ($.inArray("false", ansRes) == -1)) {
                correctAnswer = true;
            } else {
                correctAnswer = false;
            }

            $("div.section-2").find("div.card-box").each(function(inde, ele) {
                if ($(ele).is(":visible")) {
                    summaryAnswerResp[inde] = correctAnswer;
                    return false;
                }
            });

            $.each(answerKeys[(attrName - 1)], function(ii, subarr) {
                correctAnsArr.push($.trim($("#" + subarr).text()));
            });

            let correctValue = correctAnsArr.join();

            if (actionInstance.customProperties[3].value == "Yes" && $("div.card-box:visible").find("input").parent("label").attr("disabled") !== "disabled") {
                if (correctAnswer == true) {
                    /* If Correct Answer */
                    pagination++;
                    questionSelectorCounter++;

                    let limit = $("#y").text();
                    if (pagination < limit) {
                        $("#next").prop("disabled", false).removeClass("disabled");
                        $("#back").prop("disabled", false).removeClass("disabled");

                        $("div.section-2 > .container:first > div.card-box:nth-child(" + pagination + ")").hide();
                        if ($("div.section-2 > .container:first > div.card-box").length <= pagination) {
                            createTrainingSection(pagination);
                        } else {
                            $("div.section-2 > .container:first > div.card-box:nth-child(" + (pagination + 1) + ")").show();
                            setTimeout(
                                function() {
                                    if ($("div.card-box:visible").find(".training-type").text() == "Question") {
                                        if (actionInstance.customProperties[3].value == "Yes" && $("div.card-box:visible").find("input").parent("label").attr("disabled") !== "disabled") {
                                            $("#next").text("Check").attr("id", "check");
                                        }
                                    }
                                }, Constants.setIntervalTimeFiveHundred());
                        }
                        $("#x").text((pagination + 1));

                    }
                } else {
                    /* If Incorrect */
                    let limit = $("#y").text();
                    pagination++;

                    if (pagination < limit) {
                        $("#next").prop("disabled", false).removeClass("disabled");
                        $("#back").prop("disabled", false).removeClass("disabled");;

                        $("div.section-2 > .container:first > div.card-box:nth-child(" + pagination + ")").hide();
                        if ($("div.section-2 > .container:first > div.card-box").length <= pagination) {
                            createTrainingSection(pagination);
                        } else {
                            $("div.section-2 > .container:first > div.card-box:nth-child(" + (pagination + 1) + ")").show();
                            setTimeout(
                                function() {
                                    if ($("div.card-box:visible").find(".training-type").text() == "Question") {
                                        if (actionInstance.customProperties[3].value == "Yes" && $("div.card-box:visible").find("input").parent("label").attr("disabled") !== "disabled") {
                                            $("#next").text("Check").attr("id", "check");
                                        }
                                    }
                                }, Constants.setIntervalTimeFiveHundred());
                        }
                        $("#x").text((pagination + 1));
                    } else {
                        /* Show Summary */
                        $("#next").prop("disabled", true).addClass("disabled");
                    }
                }
            } else {
                /* If Question is not answerable */
                let limit = $("#y").text();
                pagination++;
                questionSelectorCounter++;

                if (pagination < limit) {
                    $("#next").prop("disabled", false).removeClass("disabled");
                    $("#back").prop("disabled", false).removeClass("disabled");

                    $("div.section-2 > .container:first > div.card-box:nth-child(" + pagination + ")").hide();
                    if ($("div.section-2 > .container:first > div.card-box").length <= pagination) {
                        createTrainingSection(pagination);
                    } else {
                        $("div.section-2 > .container:first > div.card-box:nth-child(" + (pagination + 1) + ")").show();
                        setTimeout(
                            function() {
                                if ($("div.card-box:visible").find(".training-type").text() == "Question") {
                                    if (actionInstance.customProperties[3].value == "Yes" && $("div.card-box:visible").find("input").parent("label").attr("disabled") !== "disabled") {
                                        $("#next").text("Check").attr("id", "check");
                                    }
                                }
                            }, Constants.setIntervalTimeFiveHundred());
                    }
                    $("#x").text((pagination + 1));

                    $("div.section-2").find("div.card-box").each(function(inde, ele) {
                        if ($(ele).is(":visible")) {
                            summaryAnswerResp[inde] = true;
                            return false;
                        }
                    });
                } else {
                    /* Show Summary */
                    $("#next").prop("disabled", true).addClass("disabled");
                    loadSummaryView();
                }
            }
        } else {

            Localizer.getString("notePleaseChooseChoice").then(function(result) {
                $("div.section-2").find("div.card-box:visible").find(".option-sec:last").append(`<p class="mt--32 text-danger choice-required-err"><font>${result}</font></p>`);
            });
        }

        if (pagination >= limit) {
            loadSummaryView();
        }
    } else {
        /* Not Question Type */
        pagination++;
        limit = $("#y").text();
        //row[pagination] = "question" + pagination;

        if (pagination < limit) {
            $("#next").prop("disabled", false).removeClass("disabled");
            $("#back").prop("disabled", false).removeClass("disabled");

            $("div.section-2 > .container:first > div.card-box:nth-child(" + pagination + ")").hide();
            if ($("div.section-2 > .container:first > div.card-box").length <= pagination) {
                createTrainingSection(pagination);
            } else {
                $("div.section-2 > .container:first > div.card-box:nth-child(" + (pagination + 1) + ")").show();
                setTimeout(
                    function() {
                        if ($("div.card-box:visible").find(".training-type").text() == "Question") {
                            if (actionInstance.customProperties[3].value == "Yes" && $("div.card-box:visible").find("input").parent("label").attr("disabled") !== "disabled") {
                                $("#next").text("Check").attr("id", "check");
                            }
                        }
                    }, Constants.setIntervalTimeFiveHundred());
            }
            $("#x").text((pagination + 1));
        } else {
            /* Show Summary */
            $("#next").prop("disabled", true).addClass("disabled");
            loadSummaryView();
        }
        if (pagination >= limit) {
            loadSummaryView();
        }
    }
    if ($("#x").text() == $("#y").text()) {
        $(".footer.section-2-footer .check-key").text(doneKey);
        $(".footer.section-2-footer #next").text(doneKey);
        $(".footer.section-2-footer #next").addClass("done-key");
        $(".footer.section-2-footer #check").text(doneKey);
        $(".footer.section-2-footer #check").addClass("done-key");
        $(".footer.section-2-footer .check-key").removeClass(".check-key").addClass("done-key");
    }
});

/**
 * @event click on back button
 */
$(document).on("click", "#back", function() {
    $("#next").text("Next");
    $("#next").removeClass("done-key");
    if ($(".error-msg").length > 0) {
        $(".error-msg").remove();
    }
    if ($("#check").length > 0) {
        $("#check").text("Next").attr("id", "next");
    }
    if (pagination < 1) {
        $("#back").prop("disabled", true).addClass("disabled");
    } else {
        $("#back").prop("disabled", false).removeClass("disabled");
        $("#next").prop("disabled", false).removeClass("disabled");
        $("div.section-2 > .container:first > div.card-box:nth-child(" + (pagination + 1) + ")").hide();
        $("div.section-2 > .container:first > div.card-box:nth-child(" + pagination + ")").show();
        setTimeout(
            function() {
                if ($("div.card-box:visible").find(".training-type").text() == "Question") {
                    if (actionInstance.customProperties[3].value == "Yes" && $("div.card-box:visible").find("input").parent("label").attr("disabled") !== "disabled") {
                        $("#next").text("Check").attr("id", "check");
                    }
                }
            }, Constants.setIntervalTimeFiveHundred());
        $("#x").text(pagination);
        pagination--;
    }
    if ($("#x").text() == $("#y").text()) {
        $(".footer.section-2-footer .check-key").text(doneKey);
        $(".footer.section-2-footer #next").text(doneKey);
        $(".footer.section-2-footer #next").addClass("done-key");
        $(".footer.section-2-footer #check").text(doneKey);
        $(".footer.section-2-footer #check").addClass("done-key");
        $(".footer.section-2-footer .check-key").removeClass(".check-key").addClass("done-key");
    }
});

/**
 * @event Click to submit form
 */
$(document).on("click", ".submit-form", function() {
    let closeViewRequest = ActionHelper.closeView();
    ActionHelper
        .executeApi(closeViewRequest)
        .then(function(batchResponse) {
            console.info("BatchResponse: " + JSON.stringify(batchResponse));
        })
        .catch(function(error) {
            console.error("Error3: " + JSON.stringify(error));
        });
});

// *********************************************** OTHER ACTION END***********************************************
/**
 * @description Variable contains head section
 */
let headSection1 = UxUtils.getResponseHeader();

/**
 * @description Variable contains text Landing section
 */
let textSection1 = UxUtils.getResponseLandingSection();

/**
 * @description Variable contains Text Section View
 */
let textSection3 = UxUtils.getResponseTextSection();

/**
 * @description Variable contains Question Section View
 */
let questionSection1 = UxUtils.getResponseQuestionSection();

/**
 * @description Variable contains footer section
 */
Localizer.getString("start").then(function(result) {
    startKey = result;
    footerSection1 = UxUtils.getFooterLanding(startKey);
});

/**
 * @description Variable contains text view Training section
 */
let textSection2 = UxUtils.getResponseTextTrainingSection();

/**
 * @description Variable contains footer section
 */
Localizer.getString("next").then(function(result) {
    nextKey = result;
    Localizer.getString("previous").then(function(results) {
        previousKey = results;
        footerSection2 = UxUtils.getResponseTrainingSectionFooter(previousKey, nextKey);
    });
});

/**
 * @description Variable contains footer section
 */
Localizer.getString("completeTraining").then(function(result) {
    completeTrainingKey = result;
    footerSection3 = UxUtils.getSummarySectionFooter(completeTrainingKey);
});