import { Localizer, ActionHelper } from "../common/ActionSdkHelper";
import { UxUtils } from "../common/utils/UxUtils";
import { Utils } from "../common/utils/Utils";
import { Constants } from "../common/utils/Constants";
import { KeyboardUtils } from "../common/utils/KeyboardUtils";

let questions = new Array();
let validate = true;
let settingText = "";
let opt = "";
let request;
let lastSession = null;

let addMoreOptionsKey = "";
let choicesKey = "";
let checkMeKey = "";
let nextKey = "";
let backKey = "";
let requiredKey = "";
let dueByKey = "";
let questionLeftBlankKey = "";
let submitKey = "";
let resultVisibleToKey = "";
let resultEveryoneKey = "";
let resultMeKey = "";
let correctAnswerKey = "";
let everyoneKey = "";
let onlyMeKey = "";
let showCorrectAnswerKey = "";
let answerCannotChangeKey = "";
let questionCount = 0;
let questionTitleKey = "";
let questionKey = "";
let optionKey = "";
let clearKey = "";
let atleastOneContentKey = "";
let allowMultipleAttemptKey = "";
let uploadCoverImageKey = "";
let coverImageKey = "";
let trainingTitleKey = "";
let assigneeTakeMultipleTraining = "";
let trainingDescriptionOptionalKey = "";
let addContentKey = "";
let ok = "";
let close = "";
let saveAttachmentData = new Array(); // Add Training Banner Image
let uploadImageLabelKey = "";
let addTitlePlaceholderKey = "";
let addDescriptionPlaceholderKey = "";
let uploadFileLabelKey = "";
let uploadVideoLabelKey = "";
let contentLimitExceedKey = "";

/***********************************  Manage Questions *********************************/

/**
 * @event to load more load less text description
 * onClick Load more text
 *
 */
$(document).on("click", ".moreless-button", function() {
    $(".more-text").slideToggle();
    if ($(this).text() == "Load more...") {
        $(this).text("Load less");
        $(this).parent().find(".show-text").css({ "-webkit-line-clamp": "" });
    } else {
        $(this).text("Load more...");
        $(this).parent().find(".show-text").css({ "-webkit-line-clamp": Constants.webkitLineClampCssCount() });
    }
});

/**
 * @event to increase textarea height
 */
$(document).on("input", "#training-text-description", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
});

/**
 * @event Focusin to show trash on focusin at input
 */
$(document).on("focusin", `.option-div, .input-group-append, .input-group, .input-group input[type="text"], .input-tpt, .input-tpt .remove-option`, function() {
    $(this).parents("div.row").find(".remove-option").show();
});

/**
 * @event Focusout to hide trash on focusout at input
 */
$(document).on("focusout", ".option-div, .input-tpt, .input-tpt .remove-option, .check-me-title, .input-group input[type='text']", function() {
    $(this).parents("div.row").find(".remove-option").hide();
});

/**
 * @event to switch to Question Section and hide Summary Section
 */
$(document).on("click", "#add-questions", function() {
    getStringKeys();
    let textNumber = parseInt($("div.training-card-section.section-div").length);
    if (textNumber == 30) {
        Localizer.getString("contentLimitExceed").then(function(result) {
            $("form.sec1 div.section-2 div#root div.training-card-section:last").after(`<span class="text-danger content-limit-exceed">${result}</span>`);
        });
    }
    $(".error-msg").remove();
    $(".section-2").hide();
    $(".section-2-footer").hide();

    if ($("form.sec1 > div.question-section").length > 0) {
        $("form.sec1 > div.question-section").remove();
        $("form.sec1 > .question_button").remove();
        $("form.sec1 > div.question-footer").remove();
    }

    $("form.sec1").append(questionsSection);
    $("form.sec1").append(addQuestionButton);
    $("form.sec1").append(questionFooter);

    let questionCounter = 0;
    $("div.question-section-div:visible").each(function(index, elem) {
        questionCounter = index + 1;
        $(elem)
            .find("span.question-number")
            .text("Question # " + questionCounter);
        $(elem).attr({
            id: "question" + questionCounter
        });
    });

});

/**
 * @event to add question to same section when new question added
 */
$(document).on("click", "#add-questions-same-section", function() {
    let questionCounter;
    $("form.sec1").append(questionsSection);
    $("form > .question_button").remove();

    $("div.question-container:visible").each(function(index, elem) {
        questionCounter = index + 1;
        $(elem)
            .find("span.question-number")
            .html(UxUtils.getQuestionNumber(questionKey, questionCounter));
        $(elem).attr({
            id: "question" + questionCounter
        });
    });
    questionCount++;
    $("form.sec1").append(addQuestionButton);

    /* Focus to last question input */
    $("#question" + questionCounter + " #question-title").focus();
    return false;
});

/**
 * @event on back button on question area
 */
$(document).on("click", "#back-question", function() {
    confirmBox();
});

/**
 * @event to remove sections
 */
$(document).on("click", ".remove-image-section", function() {
    let element = $(this);
    let dataId = $(this).parents(".question-container").attr("id");
    $("div.question-section").find("div.error-msg").remove();
    if ($("div.question-container:visible").length > 1) {
        let confirmBox = UxUtils.getDeleteQuestionConfirmBox(dataId, ok, close);
        // $(this).parents("div.card-box").removeClass("card-box").addClass("card-box-alert");
        $(this).parents("div.question-container").find("div.d-flex").after(confirmBox);
    } else {
        Localizer.getString("atleastOneQuestion").then(function(result) {
            $(this).parents("div.card-box:visible").prepend(getAtLeastOneQuestionError(result));
        });
    }
});

/**
 * @Event to cancel the confirm box for delete question
 */
$(document).on("click", "#cancel-confirm", function() {
    $(this).parents("div.card-box-alert").removeClass("card-box-alert").addClass("card-box");
    $(this).parents(".confirm-box").remove();
});

/**
 * @event Click for cancel button on confirm box of question deletion
 */
$(document).on("click", ".cancel-question-delete", function() {
    $(this).parents(".question-container").find(".add-options").show();
    $(this).parents("div.card-box-alert").removeClass("card-box-alert").addClass("card-box");
    $(this).parents(".confirm-box").remove();
});

/**
 * @Event to delete question when click on confirm area ok button
 */
$(document).on("click", "#delete-question", function() {
    let element = $(this).attr("data-id");
    $("#" + element).parents("div.question-section").remove();
    let questionCounter;
    $("div.question-section").find("div.error-msg").remove();

    $("div.question-container:visible").each(function(index, elem) {
        questionCounter = index + 1;
        $(elem).find("span.question-number").text(questionKey + "&nbsp;#&nbsp;" + questionCounter);
        $(elem).attr({
            id: "question" + questionCounter
        });
    });
});

/**
 * @Event to remove option
 */

$(document).on("click", ".remove-option", function(eve) {
    $("div.question-section").find("div.error-msg").remove();
    if ($(this).parents("div.question-container").find("div.option-div").length > 2) {
        let selector = $(this).closest("div.container");
        $(this).parents("div.option-div").remove();
        $(selector)
            .find("div.option-div div.input-group input[type='text']")
            .each(function(index, elem) {
                let counter = index + 1;
                $(elem).attr({
                    placeholder: "Enter your choice ",
                });
                $(elem).attr({
                    id: "option" + counter
                });
                $(elem)
                    .parents(".option-div")
                    .find("input.form-check-input")
                    .attr({
                        id: "check" + counter
                    });
            });

    } else {
        Localizer.getString("two_option_error").then(function(result) {
            $("div.card-box:visible").append(`<div class="mt--8 mb--8 text-danger error-msg">${result}</div>`);
        });
    }
});

/**
 * @Event to submit question on click done button
 */
$(document).on("click", "#question-done", function() {
    /* Validate */
    let errorText = "";
    let questionNumber = 0;
    let error = false;
    validate = true;
    $("input[type='text']").removeClass("danger");
    $("label.label-alert").remove();
    $("div.error-msg").remove();

    $("div.card-box-alert").removeClass("card-box-alert").addClass("card-box");

    $(".question-container:visible").each(function(qind, quest) {

        let isChecked = false;
        $(quest).find("#options").find(`input[type="checkbox"]`).each(function(optind, opt) {
            if ($(opt).prop("checked") == true) {
                isChecked = true;
            }
        });

        if (isChecked != true) {
            // let questionId = $(quest).attr("id");
            let questionId = qind;
            $(quest)
                .find("div.d-flex-ques")
                .after(`<div class="clearfix"></div>
                    <label class="label-alert d-block option-required-err text-left pull-left mt--8 mb--16"><font>Please select correct choice for the question</font></label>
                    <div class="clearfix"></div>`);
            $(quest)
                .find("div.card-box")
                .removeClass("card-box")
                .addClass("card-box-alert");
            errorText += "Option check required";

            $([document.documentElement, document.body]).animate({
                scrollTop: $(".option-required-err:last").offset().top - 200
            }, 1000);
        }

    });

    $("form")
        .find("input[type='text']")
        .each(function() {
            let element = $(this);
            if (element.val() == "") {
                if (element.attr("id") == "quiz-title") {
                    errorText += "<p>Quiz title is required.</p>";
                    $("#quiz-title").addClass("danger");
                    $("#quiz-title").before(
                        `<label class="label-alert d-block mb--4"><font class="required-key">${requiredKey}</font></label>`
                    );

                    if ($(this).find("div.card-box").length > 0) {
                        $(this).parents("div.card-box").removeClass("card-box").addClass("card-box-alert");
                    }
                } else if (element.attr("id").startsWith("question-title")) {
                    if ($(element).parents("div.form-group-question").find("img.question-preview-image").attr("src") != "") {
                        // Do nothing
                    } else {
                        if ($(this).find("div.card-box").length > 0) {
                            $(this).parents("div.card-box").removeClass("card-box").addClass("card-box-alert");
                        }
                        $(element).addClass("danger");
                        Localizer.getString("questionLeftBlank").then(function(result) {
                            questionLeftBlankKey = result;
                            $(".question-blank-key").text(result);
                            $(element).parents("div.form-group-question").find(".question-number").parent("div")
                                .after(
                                    `<label class="label-alert d-block mb--4"><font class="question-blank-key">${result}</font></label>`
                                );
                        });
                        errorText += "<p>Question cannot not left blank.</p>";
                        $(element).addClass("danger");
                    }
                } else if (element.attr("id").startsWith("option")) {
                    if ($(element).parents("div.radio-outer").find("img.option-preview-image").attr("src") != "") {
                        // Do nothing
                    } else {
                        if ($(this).find("div.card-box").length > 0) {
                            $(this).parents("div.card-box").removeClass("card-box").addClass("card-box-alert");
                        }
                        $(this).addClass("danger");
                        $(this)
                            .parents("div.col-12").parents("div.option-div")
                            .prepend(
                                `<label class="label-alert d-block mb--4"><font class="required-key">${requiredKey}</font></label>`
                            );

                        errorText +=
                            "<p>Blank option not allowed for " +
                            element.attr("placeholder") +
                            ".</p>";
                    }
                }
            }
        });

    if ($.trim(errorText).length <= 0) {
        let questionCount = $("form").find("div.container.question-container").length;
        $("div.question-container").each(function(i, e) {
            let j = $("div.question-section-div").length + 1;
            let textNumber = parseInt($("div.question-section-div").length) + 1;
            /*  Get selected Answer */
            let correct = [];
            let optionChecked = "";
            let optionText = "";
            let optionAttachments = "";

            /* Looping for options */
            $(e)
                .find("div.option-div")
                .each(function(index, elem) {
                    let count = index + 1;
                    let optionsInputs = `<input type="hidden" class="all_options" id="option${count}" value="${$(elem).find("#option" + count).val()}">`;
                    let ifCorrectCheck = "";
                    let styleOptionImage = "d-none";
                    let imagePreview = ($(elem).find("div.option-preview:visible").html()) ? $(elem).find("div.option-preview:visible").html() : "";
                    let optionValue = $(elem).find("#option" + count).val();
                    let questionOptionId = `question${j}option${count}`;

                    if ($(elem).find("div.option-preview:visible").html()) { styleOptionImage = ""; }

                    if (
                        $(e)
                        .find("#check" + count)
                        .is(":checked")
                    ) {
                        ifCorrectCheck = `&nbsp;<i class="success">${Constants.getDefaultTickIcon()}</i>`;
                        optionChecked += `<input type="checkbox" class="d-none quest-answer" checked>`;
                        // if it is checked
                        correct.push(questionOptionId);
                    }
                    optionText += UxUtils.getOptionValue(optionsInputs, imagePreview, optionValue, questionOptionId, ifCorrectCheck, styleOptionImage, count);

                    let optionFile = ($(elem).find("textarea#option-attachment-set").val()) ? $(elem).find("textarea#option-attachment-set").val() : "";
                    if (optionFile) {
                        optionAttachments += `<textarea class="d-none option-image${count}">${optionFile}</textarea>`;
                    }
                });
            let questionInput = `<input type="hidden" class="question${j}" value="${$(e).find("#question-title").val()}">`;
            let questionInputs = $(e).find("div.card-box").clone();
            let questionText = ($(e).find("#question-title").val() != "") ? $(e).find("#question-title").val() : "";
            let questionImage = $(e).find("img.question-preview-image").parent().html();
            let hideQuestionImage = "d-none";
            if ($(e).find("img.question-preview-image").attr("src") != "") {
                $(e).find("img.question-preview-image").addClass("image-responsive question-template-image smallfit");
                hideQuestionImage = "";
            }
            let questionImagearray = ($(e).find("textarea#question-attachment-set").val()) ? $(e).find("textarea#question-attachment-set").val() : "";
            $("div#root div.training-card-section:last").after(UxUtils.getQuestionSection(j, optionChecked, questionImage, hideQuestionImage, questionText, optionText, questionInput, questionImagearray, optionAttachments));
            $("#quest-text-" + textNumber).html(questionInputs);
        });

        /* Create Question Section Here */
        for (let j = 1; j <= questionCount; j++) {

            $("form.sec1 div.section-2:visible div.container div#root div.training-card-section").each(function(index, obj) {
                $(this).attr({
                    "data-id": "text-section-" + index
                });
                $(this).attr({
                    "id": "section-" + index
                });
                if (!($(obj).hasClass("question-section-div"))) {
                    $(this).find("span.counter").text(index);
                }
            });
        }

        $(".question-section").hide();
        $(".question-footer").hide();
        $(".question_button").hide();

        $(".section-2").show();
        $(".section-2-footer").show();

    } else {
        $(".required-key").text(requiredKey);
        $("#submit").prop("disabled", false);
        return;
    }
});

/****************************  Manage Questions Ends ***************************/

/***********************************  Add Text *********************************/

/**
 * @Event to show setting section
 */
$(document).on("click", ".show-setting", function() {
    $(".section-1").hide();
    $(".section-1-footer").hide();
    $("form #setting").show();
});

/**
 * @Event to get on back button at content area
 */
$(document).on("click", "#back-text, #back-photo, #back-video, #back-document", function() {
    confirmBox();
});

/**
 * Add Show Confirm box for discard
 */
function confirmBox() {
    $("div.discardContent").html(discardContent);
}

/**
 * @Method to Go Back to previous step
 */
function goBack() {
    $("div.discardContent").html(" ");
    $(".section-2").show();
    $(".section-2-footer").show();
    $(".text-section").hide();
    $(".text-footer").hide();
    if (!$(".question-section").is(":visible")) {
        $("form.sec1 div.section-2 div#root div.training-card-section:last").remove();
    }
    $(".question-section").hide();
    $(".add_question_button").hide();
    $(".question-footer").hide();
    $(".question_button").hide();
}

/**
 * @Event to Cancel Confirmation if don't want to discard content
 */
$(document).on("click", ".cancel", function() {
    $("div.discardContent").html(" ");
});

/**
 * If discard All changes and Go back to previous step
 */
$(document).on("click", ".discard-success", function() {
    goBack();
});

/**
 * @Event to add text when click on content area button
 */
$(document).on("click", "#add-text", function() {
    $(".error-msg").remove();
    $("#submit").attr("disabled", false);
    $(".loader-overlay").remove();

    let textNumber = parseInt($("div.training-card-section.section-div").length);
    if (textNumber == 30) {
        Localizer.getString("contentLimitExceed").then(function(result) {
            $("form.sec1 div.section-2 div#root div.training-card-section:last").after(`<span class="text-danger content-limit-exceed">${result}</span>`);
        });
    }

    let textData = "";

    $(".section-2").hide();
    $(".section-2-footer").hide();

    if ($("form.sec1 > div.text-section").length > 0) {
        $("form.sec1 > div.text-section").remove();
        $("form.sec1 > div.text-footer").remove();
    }

    $("form.sec1").append(addTextSection);
    $("form.sec1").append(addTextFooter);

    $("form.sec1 div.section-2 div#root div.training-card-section:last").after(UxUtils.getAddTextContainer(textData));
});

/**
 * @Event to submit text when click on done button
 */
$(document).on("click", "#text-done", function() {
    let textNumber = parseInt($("div.training-card-section").length) - 1;

    let errorText = "";
    $("textarea").removeClass("danger");
    $("label.label-alert").remove();

    if ($("input#training-text").val().length <= 0 || $("textarea#training-text-description").val().length <= 0) {

        if ($("textarea#training-text-description").val().length <= 0) {
            $("textarea#training-text-description").before(UxUtils.getRequiredError(requiredKey));
            $("textarea#training-text-description").focus();
            $("textarea#training-text-description").addClass("danger");
        } else {
            $("textarea#training-text-description").removeClass("danger");
        }

        if ($("input#training-text").val().length <= 0) {
            $("input#training-text").before(UxUtils.getRequiredError(requiredKey));
            $("input#training-text").focus();
            $("input#training-text").addClass("danger");
        } else {
            $("input#training-text").removeClass("danger");
        }

    } else {

        let textTrainingTitle = $("input#training-text").val();
        let textTrainingDesc = $("textarea#training-text-description").val();
        $(".text-section").hide();
        $(".text-footer").hide();

        $(".section-2").show();
        $(".section-2-footer").show();

        $("form.sec1 div.section-2:visible div#root div.training-card-section").each(function(index, obj) {
            if (!$(this).hasClass("question-section-div")) {
                $(this).attr({
                    "data-id": "text-section-" + index
                });
                $(this).attr({
                    "id": "section-" + index
                });
                if (!($(obj).hasClass("question-section-div"))) {
                    $(this).find("span.counter").text(index);
                }
            }
        });

        $("#section-" + textNumber).find(".textarea-text").val(textTrainingTitle);
        $("#section-" + textNumber).find(".type").text(textTrainingTitle);

        $("#section-" + textNumber).find(".text-description-preview").text(textTrainingDesc);
        $("#section-" + textNumber).find(".textarea-text-description").val(textTrainingDesc);
        if (textTrainingDesc && (textTrainingDesc.split(/\r\n|\r|\n/).length > 2 || textTrainingDesc.length > 200)) {
            $("#section-" + textNumber).find(".text-description-preview").addClass("show-text");
            $("#section-" + textNumber).find(".text-description-preview").css({ "-webkit-line-clamp": `${Constants.webkitLineClampCssCount()}` });
            $("#section-" + textNumber).find(".text-description-preview").after(Constants.getLoadMoreLink());
        }

    }
});

/**
 * @Event to show photo section when click on add content button
 */
$(document).on("click", "#add-photo", function() {
    let textData = "";
    let textNumber = parseInt($("div.training-card-section").length);
    if (textNumber > 29) {
        Localizer.getString("contentLimitExceed").then(function(result) {
            $("form.sec1 div.section-2 div#root div.training-card-section:last").after(`<span class="text-danger content-limit-exceed">${result}</span>`);
        });
    }
    $(".error-msg").remove();
    $("#submit").attr("disabled", false);
    $(".loader-overlay").remove();

    $(".section-2").hide();
    $(".section-2-footer").hide();

    if ($("form.sec1 > div.text-section").length > 0) {
        $("form.sec1 > div.text-section").remove();
        $("form.sec1 > div.text-footer").remove();
    }
    $("form.sec1 div.section-2 div#root div.training-card-section:last").after(UxUtils.getAddImageSection(textNumber, textData));
    $("form.sec1").append(addPhotoSection);
    $("form.sec1").append(addPhotoFooter);
    $("#upload-photo").click();
});

/**
 * @Event to submit photo
 */
$(document).on("click", "#photo-done", function() {
    let textNumber = parseInt($("div.training-card-section").length) - 1;
    let errorText = "";
    $("input[type='file']#upload-photo").removeClass("danger");
    $("label.label-alert").remove();
    if ($("div.updated-img div.carousel:last").find("div.carousel-inner").html() == undefined || $("#image-training-text").val().length <= 0) {
        if ($("div.updated-img div.carousel:last").find("div.carousel-inner").html() == undefined) {
            $(".change-link").before(UxUtils.getRequiredError(requiredKey));
            $("input[type='file']#upload-photo").focus();
            $("input[type='file']#upload-photo").addClass("danger");
        } else {
            $(".change-link").find(`.label-alert .d-block`).remove();
        }
        if ($("#image-training-text").val().length <= 0) {
            $("#image-training-text").before(UxUtils.getRequiredError(requiredKey));
            $("#image-training-text").focus();
            $("#image-training-text").addClass("danger");
        } else {
            $("#image-training-text").removeClass("danger");
        }
    } else {
        let photoTitle = $("input#image-training-text").val();
        let photoDesc = $("textarea#photo-description").val();
        let photoAttachments = $("textarea#photo-attachments").val();
        $(".text-section").hide();
        $(".text-footer").hide();
        $(".section-2").show();
        $(".section-2-footer").show();
        $("div.photo-section-div").find("span.type").text(" " + photoTitle);
        $("form.sec1 div.section-2:visible div#root div.training-card-section").each(function(index, obj) {
            $(this).attr({
                "data-id": "text-section-" + index
            });
            $(this).attr({
                "id": "section-" + index
            });
            if (!($(obj).hasClass("question-section-div"))) {
                $(this).find("span.counter").text(index);
            }
        });

        /* File reader */
        let input = $("input[type='file']#upload-photo")[0];
        if (input.files) {
            $("#submit").attr("disabled", true);
            $(".body-outer").before(loader);
            let filesAmount = input.files.length;
            let count = 0;
            for (let j = 0; j < filesAmount; j++) {
                let reader = new FileReader();
                reader.onload = function(event) {
                    if (count == 0) {
                        $("#section-" + textNumber).find("#image-sec-" + textNumber).attr({
                            "src": event.target.result
                        });
                        if (filesAmount > 1) {
                            $("#section-" + textNumber).find("#image-sec-" + textNumber).after(`<span class="file-counter">+${filesAmount-1}</span>`);
                        }
                    }
                    count++;
                };
                reader.readAsDataURL(input.files[j]);
            }
            $(".change-link").find(`.label-alert .d-block`).remove();
            let carasoulId = $("div.carousel:last").attr("id");
            $("#section-" + textNumber).find("div.img-thumbnail-new").html(UxUtils.getCarousalSliders($("div.carousel:last").html(), carasoulId));
        }
        $("#section-" + textNumber).find(".textarea-photo-title").val(photoTitle);
        $("#section-" + textNumber).find(".textarea-photo-description").val(photoDesc);
        $("#section-" + textNumber).find(".photo-description-preview").text(photoDesc);
        if (photoDesc.length < 1) {
            $("#section-" + textNumber).find(".photo-description-preview").parent(".col-12").addClass("d-none");
        }
        if (photoDesc && (photoDesc.split(/\r\n|\r|\n/).length > 2 || photoDesc.length > 200)) {
            $("#section-" + textNumber).find(".photo-description-preview").addClass("show-text");
            $("#section-" + textNumber).find(".photo-description-preview").css({ "-webkit-line-clamp": Constants.webkitLineClampCssCount() });
            $("#section-" + textNumber).find(".photo-description-preview").after(Constants.getLoadMoreLink());
        }
        $("#section-" + textNumber).find("textarea.textarea-photo-attachments").val(photoAttachments);

        $("#submit").attr("disabled", false);
        $(".loader-overlay").remove();

    }
});

/**
 * @Event to show video section
 */
$(document).on("click", "#add-video", function() {
    let textNumber = parseInt($("div.training-card-section").length);

    if (textNumber > 29) {
        Localizer.getString("contentLimitExceed").then(function(result) {
            $("form.sec1 div.section-2 div#root div.training-card-section:last").after(`<span class="text-danger content-limit-exceed">${result}</span>`);
        });
    }

    let textData = "";
    $(".error-msg").remove();
    $("#submit").attr("disabled", false);
    $(".loader-overlay").remove();

    $(".section-2").hide();
    $(".section-2-footer").hide();

    if ($("form.sec1 > div.text-section").length > 0) {
        $("form.sec1 > div.text-section").remove();
        $("form.sec1 > div.text-footer").remove();
    }

    $("form.sec1").append(addVideoSection);
    $("form.sec1").append(addVideoFooter);
    $("form.sec1 div.section-2 div#root div.training-card-section:last").after(UxUtils.getAddVideoSection(textNumber, textData));
    $("#upload-video").click();
});

/**
 * @Event to submit video
 */
$(document).on("click", "#video-done", function() {
    let textNumber = parseInt($("div.training-card-section").length) - 1;
    let videoTitle = $("input#video-training-text").val();
    let videoDesc = $("textarea#video-description").val();
    let videoAttachment = $("textarea#video-attachments").val();

    let errorText = "";
    $("textarea").removeClass("danger");
    $("label.label-alert").remove();

    if ($("input[type='file']#upload-video").val().length <= 0 || $("#video-training-text").val().length <= 0) {
        if ($("input[type='file']#upload-video").val().length <= 0) {
            $("div.video-box").before(UxUtils.getRequiredError(requiredKey));
            $("div.video-box").focus().addClass("danger");
        }

        if ($("#video-training-text").val().length <= 0) {
            $("#video-training-text").before(UxUtils.getRequiredError(requiredKey));
            $("#video-training-text").focus();
            $("#video-training-text").addClass("danger");
        } else {
            $("#video-training-text").removeClass("danger");
        }
    } else {
        $(".label-alert").remove();
        $(".text-section").hide();
        $(".text-footer").hide();
        $(".section-2").show();
        $(".section-2-footer").show();
        $("form.sec1 div.section-2:visible div#root div.training-card-section").each(function(index, obj) {
            $(this).attr({
                "data-id": "text-section-" + index
            });
            $(this).attr({
                "id": "section-" + index
            });
            if (!($(obj).hasClass("question-section-div"))) {
                $(this).find("span.counter").text(index);
            }
        });
        let fileInput = document.getElementById("upload-video");
        let fileUrl = window.URL.createObjectURL(fileInput.files[0]);
        $("#section-" + textNumber).find("span.type").text(videoTitle);
        $("#section-" + textNumber).find("#video-sec-" + textNumber).attr("src", fileUrl);
        $("#section-" + textNumber).find("textarea.textarea-video").val(videoTitle);
        $("#section-" + textNumber).find("textarea.textarea-video-description").val(videoDesc);
        $("#section-" + textNumber).find(".video-description-preview").text(videoDesc);
        if (videoDesc.length < 1) {
            $("#section-" + textNumber).find(".video-description-preview").parent(".col-12").addClass("d-none");
        }
        if (videoDesc && (videoDesc.split(/\r\n|\r|\n/).length > 2 || videoDesc.length > 200)) {
            $("#section-" + textNumber).find(".video-description-preview").addClass("show-text");
            $("#section-" + textNumber).find(".video-description-preview").css({ "-webkit-line-clamp": Constants.webkitLineClampCssCount() });
            $("#section-" + textNumber).find(".video-description-preview").after(Constants.getLoadMoreLink());
        }
        $("#section-" + textNumber).find(".textarea-video-attachments").val(videoAttachment);
        let imageCounter = $("#section-" + textNumber).find(`input[type="file"]`).get(0).files.length;
        $("#section-" + textNumber).find("textarea:last").after(UxUtils.getAttachmentTextarea());
    }
});

/**
 * Even to shwo document upload section
 */
$(document).on("click", "#add-document", function() {
    let textNumber = parseInt($("div.training-card-section").length);

    if (textNumber > 29) {
        Localizer.getString("contentLimitExceed").then(function(result) {
            $("form.sec1 div.section-2 div#root div.training-card-section:last").after(`<span class="text-danger content-limit-exceed">${result}</span>`);
        });
    }

    let textData = "";
    $(".error-msg").remove();
    $("#submit").attr("disabled", false);
    $(".loader-overlay").remove();
    $(".section-2").hide();
    $(".section-2-footer").hide();
    if ($("form.sec1 > div.text-section").length > 0) {
        $("form.sec1 > div.text-section").remove();
        $("form.sec1 > div.text-footer").remove();
    }
    $("form.sec1 div.section-2 div#root div.training-card-section:last").after(UxUtils.getAddDownloadSection(textNumber, textData));
    $("form.sec1").append(addDocumentSection);
    $("form.sec1").append(addDocumentFooter);
    $("#upload-document").click();
});

/**
 * @Event to submit the document area
 */
$(document).on("click", "#document-done", function() {
    let textNumber = parseInt($("div.training-card-section").length) - 1;
    let docTitle = $("#doc-training-text").val();
    let docDescription = $("#document-description").val();
    $("textarea").removeClass("danger");
    $("label.label-alert").remove();
    if ($("div.doc-name").text().trim().length <= 0 || $("#doc-training-text").val().length <= 0) {
        if ($("div.doc-name").text().trim().length <= 0) {
            $("div.doc-box").before(UxUtils.getRequiredError(requiredKey));
        } else {
            $("div.doc-box").parents().find("label.label-alert").remove();
        }
        if ($("#doc-training-text").val().length <= 0) {
            $("#doc-training-text").before(UxUtils.getRequiredError(requiredKey));
            $("#doc-training-text").focus();
            $("#doc-training-text").addClass("danger");
        } else {
            $("#doc-training-text").removeClass("danger");
        }
    } else {
        $(".text-section").hide();
        $(".text-footer").hide();
        $(".section-2").show();
        $(".section-2-footer").show();
        $("div.document-section-div").find("span.type").text(" " + docTitle);
        $("form.sec1 div.section-2:visible div#root div.training-card-section").each(function(index, obj) {
            $(this).attr({
                "data-id": "text-section-" + index
            });
            $(this).attr({
                "id": "section-" + index
            });

            if (!($(obj).hasClass("question-section-div"))) {
                $(this).find("span.counter").text(index);
            }

        });

        $("#section-" + textNumber).find("textarea.textarea-document").val(docTitle);
        $("#section-" + textNumber).find(".document-description-preview").text(docDescription);
        $("#section-" + textNumber).find("textarea.textarea-document-description").val(docDescription);

        if (docDescription.length < 1) {
            $("#section-" + textNumber).find(".document-description-preview").addClass("d-none");
        }

        if (docDescription && (docDescription.split(/\r\n|\r|\n/).length > 2 || docDescription.length > 200)) {
            $("#section-" + textNumber).find(".document-description-preview").addClass("show-text");
            $("#section-" + textNumber).find(".document-description-preview").css({ "-webkit-line-clamp": Constants.webkitLineClampCssCount() });
            $("#section-" + textNumber).find(".document-description-preview").after(Constants.getLoadMoreLink());
        }
        $("#section-" + textNumber).find("textarea.textarea-document-attachment").val($("#document-attachment").val());
        $("#section-" + textNumber).find("#image-sec-" + textNumber).attr("src", "images/doc.png");
        let docfilesize = $("input[type='file']#upload-document")[0].files[0].size / 1024;
        let fileTypeIcon = "";
        let fileType = $("input[type='file']#upload-document")[0].files[0].type;
        $("div.doc-box").html(Constants.getDocumentIcon());
        fileTypeIcon = Constants.getDocumentIcon();
        $("#section-" + textNumber).find("#image-sec-" + textNumber).parents("div.row").find("p.document-description-preview").before(`<p class="mb0 doc-name">${fileTypeIcon}&nbsp;<span class="semi-bold teams-link a-link font-14">` + $("input[type='file']#upload-document")[0].files[0].name + ` (` + Math.round(docfilesize) + ` Kb)</span></p>`);
    }
    $("#section-" + textNumber).find("textarea:last").after(`<textarea id="attachment-id" class="d-none" ></textarea>`);
});

/**
 * @Event to submit photo
 */
$(document).on("change", "#upload-photo", function() {
    if ($(this).val()) {
        $("#photo-done").addClass("disabled");
        $("#photo-done").append(Constants.getDisabledLoader());
        if (imagesPreview(this, ".update-carasoul")) {
            $(".text-section .photo-box").hide();
            $(".text-section .change-link").show();
            $(".text-section .update-carasoul").show();
            $(".text-section .label-alert").remove();
        }
    }
});

/**
 * Method to show image preview
 * @param input object contain the input element data
 * @param placeToInsertImagePreview object contains html element where image preview will be showed
 */
let imagesPreview = function(input, placeToInsertImagePreview) {
    $("div.text-section:visible div.relative").parent().find(`span.text-danger.float-right`).remove();
    if (input.files) {
        let filesAmount = input.files.length;
        if (filesAmount > 10) {
            Localizer.getString("maximum_images_allowed").then(function(result) {
                let msg = result;
                Localizer.getString("alert").then(function(result) {
                    $("div.text-section:visible div.relative").before(`<span class="text-danger error-msg float-right"> ${msg}</span><div class="clearfix"></div>`);
                });
            });
            return false;
        }

        for (let i = 0; i < filesAmount; i++) {
            let fileTypes = ["jpg", "jpeg", "png", "gif", "webp", "jfif"];
            let isSuccess = false;
            if (input.files && input.files[0]) {
                // let reader = new FileReader();
                let extension = input.files[0].name.split(".").pop().toLowerCase();
                isSuccess = fileTypes.indexOf(extension) > -1;
                if (isSuccess) {
                    isSuccess = true;
                } else {
                    $("div.text-section:visible div.relative").before(`<span class="text-danger float-right">Invalid file formate</span><div class="clearfix"></div>`);
                    return false;
                }
            }
        }
        let uniqueCarouselId = Constants.getUniqueId();
        $(".update-carasoul").html("");
        let $carousel = $(`<div id="carouselExampleIndicators${uniqueCarouselId}" class="carousel slide" data-ride="carousel"></div>`);
        let $olSection = $(`<ol class="carousel-indicators"></ol>`);
        let $carouselInner = $(`<div class="carousel-inner"></div>`);
        $carousel.append($olSection);
        $carousel.append($carouselInner);
        let attachmentRequest = "";
        let count = 0;
        let newPhotos = new Array();
        let photoUploadCounter = 0;
        for (let i = 0; i < filesAmount; i++) {
            let reader = new FileReader();
            let $liList = $(`<li data-target="#carouselExampleIndicators${uniqueCarouselId}" data-slide-to="${i}" class="${i == 0 ? "active": ""}"></li>`);
            $olSection.append($liList);
            reader.onload = function(event) {
                let $imgDiv = $(UxUtils.getCarousalImages(count, event.target.result));
                $carouselInner.append($imgDiv);
                count++;
            };
            reader.readAsDataURL(input.files[i]);
            let fileData = input.files[i];
            let attachment = ActionHelper.attachmentUpload(fileData, fileData["type"]);
            attachmentRequest = ActionHelper.requestAttachmentUploadDraft(attachment);
            ActionHelper.executeApi(attachmentRequest)
                .then(function(response) {
                    let filesize = input.files[i].size / Constants.getKbConvertConst();
                    let attachmentData = {
                        "name": input.files[i].name + " ( " + Math.round(filesize) + " Kb)",
                        "type": "Image",
                        "id": response.attachmentId
                    };
                    newPhotos.push(attachmentData);
                    $(input).parent().find("textarea.textarea-photo-attachments").val(JSON.stringify(newPhotos));
                    $("div.text-section").find("textarea#photo-attachments").val(JSON.stringify(newPhotos));
                    photoUploadCounter++;
                });
        }

        let tid = setInterval(() => {
            if (photoUploadCounter == filesAmount) {
                $("#photo-done").removeClass("disabled");
                $("#photo-done").find(Constants.getDisabledLoaderClass()).remove();
                clearInterval(tid);
            }
        }, Constants.setIntervalTimeHundred());
        $carousel.append(UxUtils.getCarousalPagination(uniqueCarouselId));
        $(placeToInsertImagePreview).append($carousel);
        $(".carousel").carousel();
        return true;
    }
    return false;
};

/**
 * @event to show previous carousel slide
 */
$(document).on("click", ".carousel-control-prev", function() {
    $(this).parents(".carousel").carousel("prev");
});

/**
 * @event to show next carousel slide
 */
$(document).on("click", ".carousel-control-next", function() {
    $(this).parents(".carousel").carousel("next");
});

/**
 * @event to show video upload section
 */
$(document).on("change", "#upload-video", function() {
    if (!$(this).val()) {
        return false;
    }
    let fileInput = $(this)[0];
    $(".video-box").parents().find(".text-danger.font-12.pull-right").remove();
    let videoSize = Constants.getVideoUploadingSize();
    let videoFormate = ["video/webm", "video/mp4", "video/avi", "video/ogv", "video/ogg"];
    if (fileInput.files.length > 0) {
        let inputVideoSize = fileInput.files[0].size;
        let sizeOf1MB = 1048576;
        if ((inputVideoSize / sizeOf1MB) > videoSize) {
            $(".video-box").parent(".relative").before(`<span class="text-danger font-12 pull-right">${Constants.getInvalidFileSizeMsg()}</span><div class="clearfix"></div>`);
            return false;
        }
        if ($.inArray(fileInput.files[0].type, videoFormate) == -1) {
            $(".video-box").parent(".relative").before(`<span class="text-danger font-12 pull-right">${Constants.getInvalidFileMsg()}</span><div class="clearfix"></div>`);
            return false;
        }
        $("button#video-done").addClass("disabled");
        $("#video-done").append(Constants.getDisabledLoader());
        let fileUrl = window.URL.createObjectURL(fileInput.files[0]);
        let fileData = fileInput.files[0];
        let attachment = ActionHelper.attachmentUpload(fileData, fileData["type"]);
        let attachmentRequest = ActionHelper.requestAttachmentUploadDraft(attachment);
        ActionHelper.executeApi(attachmentRequest)
            .then(function(response) {
                let newResponse = {
                    "name": fileInput.files[0].name,
                    "type": "Video",
                    "id": response.attachmentId
                };
                $("div.text-section").find("textarea#video-attachments").val(JSON.stringify(newResponse));
                $("button#video-done").removeClass("disabled");
                $("#video-done").find(Constants.getDisabledLoaderClass()).remove();
            });
        $(".updated-video").show();
        $(".change-link").show();
        $(".video-box").hide();
        $(".video-section-preview").last().attr("src", fileUrl);
        $(".video-section-preview").parents("div.relative").find(".label-alert").remove();
    }
});

/**
 * @event when upload document uploadedd
 */
$(document).on("change", "#upload-document", function() {
    let textNumber = parseInt($("div.training-card-section").length) - 1;

    // If file is blank then return back
    if (!$(this).val()) {
        return false;
    }

    if ($(this)[0].files[0].name != undefined || $(this)[0].files[0].name != null) {
        $(".doc-name").html("");
    }

    $("#document-done").addClass("disabled");
    $("#document-done").append(Constants.getDisabledLoader());

    // Convert File size in Kb
    let filesize = $(this)[0].files[0].size / Constants.getKbConvertConst();
    let filename = $(this)[0].files[0].name;
    let fileData = $(this)[0].files[0];
    let fileTypeIcon = "";
    fileTypeIcon = Constants.getDocumentIcon();
    $("a.change-doc-link").show();
    let attachment = ActionHelper.attachmentUpload(fileData, fileData["type"]);
    let attachmentRequest = ActionHelper.requestAttachmentUploadDraft(attachment);
    ActionHelper.executeApi(attachmentRequest)
        .then(function(response) {
            let newResponse = {
                "name": filename + " (" + Math.round(filesize) + " Kb)",
                "type": "Document",
                "id": response.attachmentId
            };
            $("textarea#document-attachment").val(JSON.stringify(newResponse));
            $("#document-done").removeClass("disabled");
            $("#document-done").find(Constants.getDisabledLoaderClass()).remove();
        });
    $("label.label-alert").remove();
    $(".doc-box").addClass("d-none");
    $(".doc-name").append(`${fileTypeIcon}&nbsp; <a class="a-link">${$(this)[0].files[0].name} (${Math.round(filesize)} Kb)</a>`);
});

/**
 * @event to remove the text from preview section
 */
$(document).on("click", ".remove-text", function() {
    let dataId = $(this).parents(".card-box").attr("data-id");
    let confirmBox = UxUtils.getTextConfirmBox(dataId);
    if (!$(this).parents("div.card-box").find("div.confirm-box").is(":visible")) {
        if ($(this).parents(".card-box").hasClass("question-section-div")) {
            $(this).parents("div.card-box").find(".input_section").after(confirmBox);
        } else if ($(this).parents(".card-box").hasClass("text-section-div")) {
            $(this).parents("div.card-box").find("p:last").after(confirmBox);
        } else {
            $(this).parents("div.card-box").find(".row:last").after(confirmBox);
        }
    }
});

/**
 * @event when click on confirm delete section
 */
$(document).on("click", "#confirm-delete-text", function() {
    let eve = $(this).attr("data-id");
    $(`div.card-box[data-id="${eve}"]`).remove();
    $("form.sec1 div.section-2:visible div#root div.training-card-section").each(function(index, obj) {
        if (!($(obj).hasClass("question-section-div"))) {
            $(this).find("span.counter").text(index);
        }
        $(this).attr("data-id", "text-section-" + index);
        $(this).attr("id", "section-" + index);
        if ($(this).find("div.question-inputs").length > 0) {
            $(this).find("div.question-inputs").attr("id", "quest-text-" + index);
        }
    });
});

/**
 * @Event to get Local string and check contains argument to append or not
 */
$(document).on("click", "#next", function() {
    /* Validate */
    let errorText = "";
    let questionNumber = 0;
    $("form").find("input[type='text']").each(function() {
        let element = $(this);
        if (element.val() == "") {
            validate = false;
            if (element.attr("id").startsWith("question-title")) {
                if (questionNumber != element.parents("div.form-group").find("span.question-number").text()) {
                    questionNumber = element.parents("div.form-group").find("span.question-number").text();
                    errorText += "<h6><u>Question " + questionNumber + "</u> </h6>";
                }
                errorText += "<p>Question is required. </p>";
            } else if (element.attr("id").startsWith("option")) {
                if (questionNumber != element.parents("div.card").find("span.question-number").text()) {
                    questionNumber = element
                        .parents("div.card")
                        .find("span.question-number")
                        .text();
                    errorText += "<h6><u>Question " + questionNumber + "</u> </h6>";
                }
                errorText += "<p>Blank option not allowed for " + element.attr("placeholder") + ".</p>";
            }
        }
    });

    if ($.trim(errorText).length <= 0) {
        $(".section-1").hide();
        $("form").append($("#setting").clone());
        $("form #setting").show();
    } else {
        $("#exampleModalCenter")
            .find("#exampleModalLongTitle")
            .html(`<img src="images/error.png"/> Error!`);
        $("#exampleModalCenter").find(".modal-body").html(errorText);
        $("#exampleModalCenter")
            .find(".modal-footer")
            .html(
                `<button type="button" class="btn btn-outline-secondary btn-sm" data-dismiss="modal">Close</button>`
            );
        $("#exampleModalCenter").find("#save-changes").hide();
        $("#exampleModalCenter").modal("show");
    }
});

$(document).on("change", "div.question-container input.form-check-input", function() {
    if ($(this).prop("checked") == true) {
        if ($(this).parents(".card-box-alert").find(".label-alert").length > 1) {
            $(this).parents(".card-box-alert").find(".label-alert.correct-choice-error").remove();
        } else if ($(this).parents(".card-box-alert").find(".label-alert").length == 1) {
            $(this).parents(".card-box-alert").find(".label-alert.correct-choice-error").remove();
            $(this).parents("div.card-box-alert").removeClass("card-box-alert").addClass("card-box");
        }
    }
});
/********************************  Add Text Ends *************************************/

/***********************************  Submit Training *********************************/
/**
 * @Event to submit form
 */
$(document).on("click", "#submit", function() {
    $("#submit").prop("disabled", true);
    $(".body-outer").before(loader);
    submitForm();
});

/**
 * Method to fetch localization sting
 */
async function getStringKeys() {
    Localizer.getString("quizTitle").then(function(result) {
        $("#quiz-title").attr({
            "placeholder": result
        });
    });

    Localizer.getString("quizDescription").then(function(result) {
        $("#quiz-description").attr({
            "placeholder": result
        });
    });

    Localizer.getString("enterTheQuestion").then(function(result) {
        $("#question-title").attr({
            "placeholder": result
        });
        questionTitleKey = result;
    });

    Localizer.getString("option", "").then(function(result) {
        optionKey = result;
    });
    Localizer.getString("dueIn", " 1 week ", "").then(function(result) {
        settingText = result;
        $("#due").text(settingText);
    });

    Localizer.getString("addMoreOptions").then(function(result) {
        addMoreOptionsKey = result;
        $(".add-options").html(`<svg role="presentation" focusable="false" viewBox="8 8 16 16" class="cc gs gt tc gv">
            <path class="ui-icon__outline cc" d="M23.352 16.117c.098.1.148.217.148.352 0 .136-.05.253-.148.351a.48.48 0 0 1-.352.149h-6v6c0 .136-.05.253-.148.351a.48.48 0 0 1-.352.149.477.477 0 0 1-.352-.149.477.477 0 0 1-.148-.351v-6h-6a.477.477 0 0 1-.352-.149.48.48 0 0 1-.148-.351c0-.135.05-.252.148-.352A.481.481 0 0 1 10 15.97h6v-6c0-.135.049-.253.148-.352a.48.48 0 0 1 .352-.148c.135 0 .252.05.352.148.098.1.148.216.148.352v6h6c.135 0 .252.05.352.148z">
            </path>
            <path class="ui-icon__filled gr" d="M23.5 15.969a1.01 1.01 0 0 1-.613.922.971.971 0 0 1-.387.078H17v5.5a1.01 1.01 0 0 1-.613.922.971.971 0 0 1-.387.078.965.965 0 0 1-.387-.079.983.983 0 0 1-.535-.535.97.97 0 0 1-.078-.386v-5.5H9.5a.965.965 0 0 1-.387-.078.983.983 0 0 1-.535-.535.972.972 0 0 1-.078-.387 1.002 1.002 0 0 1 1-1H15v-5.5a1.002 1.002 0 0 1 1.387-.922c.122.052.228.124.32.215a.986.986 0 0 1 .293.707v5.5h5.5a.989.989 0 0 1 .707.293c.09.091.162.198.215.32a.984.984 0 0 1 .078.387z">
            </path>
        </svg> ${addMoreOptionsKey}`);
    });

    Localizer.getString("choices").then(function(result) {
        choicesKey = result;
        $(".choice-label").text(choicesKey);
    });

    Localizer.getString("checkMe").then(function(result) {
        checkMeKey = result;
        $(".check-me").text(checkMeKey);
        $(".check-me-title").attr({
            "title": checkMeKey
        });
    });

    Localizer.getString("next").then(function(result) {
        nextKey = result;
        $(".next-key").text(nextKey);
    });

    Localizer.getString("back").then(function(result) {
        backKey = result;
        $(".back-key").text(backKey);
    });

    Localizer.getString("required").then(function(result) {
        requiredKey = result;
        $(".required-key").text(requiredKey);
    });

    Localizer.getString("dueBy").then(function(result) {
        dueByKey = result;
        $(".due-by-key").text(dueByKey);
    });

    Localizer.getString("resultVisibleTo").then(function(result) {
        resultVisibleToKey = result;
        $(".result-visible-key").text(resultVisibleToKey);
    });

    Localizer.getString("resultEveryone").then(function(result) {
        resultEveryoneKey = result;
    });

    Localizer.getString("resultMe").then(function(result) {
        resultMeKey = result;
    });

    Localizer.getString("correctAnswerSetting", ", ").then(function(result) {
        correctAnswerKey = result;
    });

    Localizer.getString("everyone", ", ").then(function(result) {
        everyoneKey = result;
        $(".everyone-key").text(everyoneKey);
    });

    Localizer.getString("onlyMe", ", ").then(function(result) {
        onlyMeKey = result;
        $(".onlyme-key").text(onlyMeKey);
    });

    Localizer.getString("showCorrectAnswer").then(function(result) {
        showCorrectAnswerKey = result;
        $(".show-correct-key").text(showCorrectAnswerKey);
    });

    Localizer.getString("allowMultipleAttemptKey").then(function(result) {
        allowMultipleAttemptKey = result;
        $(".allow-multiple-attempt").text(allowMultipleAttemptKey);
    });

    Localizer.getString("assigneeTakeMultipleTraining").then(function(result) {
        assigneeTakeMultipleTraining = result;
        $(".allow-multiple-change-key").text(assigneeTakeMultipleTraining);
    });

    Localizer.getString("answerCannotChange").then(function(result) {
        answerCannotChangeKey = result;
        $(".answer-cannot-change-key").text(answerCannotChangeKey);
    });

    Localizer.getString("training_title").then(function(result) {
        $("#training-title").attr("placeholder", result);
    });

    Localizer.getString("training_description").then(function(result) {
        $("#training-description").attr("placeholder", result);
    });

    Localizer.getString("coverImage").then(function(result) {
        $(".cover-image-label").text(result);
        coverImageKey = result;
    });

    Localizer.getString("tap_upload_image").then(function(result) {
        $(".tap-upload-label").text(result);
        uploadImageLabelKey = result;
    });

    Localizer.getString("tap_upload_file").then(function(result) {
        $(".tap-upload-files-label").text(result);
        uploadFileLabelKey = result;
    });

    Localizer.getString("tap_upload_video").then(function(result) {
        $(".tap-upload-video-label").text(result);
        uploadVideoLabelKey = result;
    });

    Localizer.getString("dueBy").then(function(result) {
        $(".due-by-label").text(result);
    });

    Localizer.getString("addContent").then(function(result) {
        $(".add-content-label").text(result);
        addContentKey = result;
    });

    Localizer.getString("photo").then(function(result) {
        $(".photo-label").text(result);
    });

    Localizer.getString("video").then(function(result) {
        $(".video-label").text(result);
    });

    Localizer.getString("document").then(function(result) {
        $(".document-label").text(result);
    });

    Localizer.getString("text").then(function(result) {
        $(".text-label").text(result);
        $(".text-label-placeholder").text(result);
    });

    Localizer.getString("quiz").then(function(result) {
        $(".quiz-label").text(result);
    });

    Localizer.getString("done").then(function(result) {
        $(".done-label").text(result);
    });

    Localizer.getString("tap_upload_photo").then(function(result) {
        $(".tap-upload-label").text(result);
        uploadImageLabelKey = result;
    });

    Localizer.getString("upload_photo").then(function(result) {
        $(".upload-photo-label").text(result);
    });

    Localizer.getString("description_content_about").then(function(result) {
        $(".desc-content-about-placeholder").attr("placeholder", result);
    });

    Localizer.getString("addQuestions").then(function(result) {
        $(".add-question-label").text(result);
    });

    Localizer.getString("close").then(function(result) {
        close = result;
    });

    Localizer.getString("ok").then(function(result) {
        ok = result;
    });

    Localizer.getString("uploadCoverImage").then(function(result) {
        uploadCoverImageKey = result;
        $(".upload-cover-image-key").text(uploadCoverImageKey);
    });

    Localizer.getString("trainingDescriptionOptional").then(function(result) {
        trainingDescriptionOptionalKey = result;
        $(".training-description-optional-key").attr("placeholder", trainingDescriptionOptionalKey);
    });

    Localizer.getString("trainingTitle").then(function(result) {
        trainingTitleKey = result;
        $(".training-title-key").attr("placeholder", trainingTitleKey);
    });

    Localizer.getString("clear").then(function(result) {
        clearKey = result;
        $(".clear-key").text(clearKey);
    });

    Localizer.getString("submit").then(function(result) {
        submitKey = result;
        $(".submit-key").text(submitKey);
    });

    Localizer.getString("question").then(function(result) {
        questionKey = result;
        $(".question-key").text(questionKey);
    });

    Localizer.getString("atleastOneContent").then(function(result) {
        atleastOneContentKey = result;
        $(".at-least-one-content-key").text(atleastOneContentKey);
    });

    Localizer.getString("addTitlePlaceholder").then(function(result) {
        addTitlePlaceholderKey = result;
    });

    Localizer.getString("addDescriptionPlaceholder").then(function(result) {
        addDescriptionPlaceholderKey = result;
    });
}

/**
 * Method to submit form
 */
function submitForm() {
    $("form.sec1").find("div.text-danger.error-msg.at-least-one-content-key").remove();
    getStringKeys();
    ActionHelper
        .executeApi(request)
        .then(function(response) {
            console.info("GetContext - Response: " + JSON.stringify(response));
            if ($(".section-2").find("div.card-box:visible").length > 0) {
                createAction(response.context.actionPackageId);
            } else {
                $("#submit").attr("disabled", false);
                $(".loader-overlay").remove();
                $(".section-2").after(UxUtils.getAtLeastOneContainerError(atleastOneContentKey));
            }
        });
    /*
            .catch(function(error) {
                $("#submit").attr("disabled", false);
                $(".loader-overlay").remove();
                $(".section-2").after(UxUtils.getAtLeastOneContainerError(atleastOneContentKey));
                console.error("GetContext - Error123: " + JSON.stringify(error));
            })*/
}

/**
 * Method to get question json
 */
function getQuestionSet() {
    questions = new Array();
    $("form div.section-2 #root").find(".section-div").each(function(index, elem) {
        if ($(elem).hasClass("question-section-div") == true) {

            /* Get Questions */
            let optionType = ActionHelper.getColumnType("singleselect");
            // let questionId = $(elem).data("id");
            let questionId = $(elem).find("span.counter").text();
            let option = [];
            $(elem).find("div.qna-option").each(function(ind, e) {
                let count = ind + 1;
                let optId = "question" + questionId + "option" + count;
                let optTitle = $(elem).find("input#option" + count).val();
                let optionAttachment = ($(elem).find("textarea.option-image" + count).val()) ? [JSON.parse($(elem).find("textarea.option-image" + count).val())] : [];
                if ($(elem).find("input.quest-answer:checked").length > 1) {
                    optionType = ActionHelper.getColumnType("multiselect");
                } else {
                    optionType = ActionHelper.getColumnType("singleselect");
                }
                option.push({
                    name: optId,
                    displayName: optTitle,
                    attachments: optionAttachment
                });
            });
            let questionAttachment = ($(elem).find("textarea.question-image").val()) ? [JSON.parse($(elem).find("textarea.question-image").val())] : [];
            let val = {
                name: questionId.toString(),
                displayName: $(elem).find("input.question" + questionId).val(),
                valueType: optionType,
                allowNullValue: false,
                options: option,
                attachments: questionAttachment,
            };
            questions.push(val);
        } else if ($(elem).hasClass("text-section-div") == true) {
            /*  Get Text  */
            let optionType = ActionHelper.getColumnType("largetext");
            let option = [];
            let optId = index; // $(elem).find("span.counter").text();
            let optTitle = $(elem).find("textarea.textarea-text").val();
            let optDescription = $(elem).find("textarea.textarea-text-description").val();
            option.push({
                name: optId,
                displayName: optDescription
            });
            let val = {
                name: "text-" + optId.toString(),
                displayName: optTitle,
                description: optDescription,
                valueType: optionType,
                allowNullValue: false,
                options: option,
                attachments: [],
            };
            questions.push(val);
        } else if ($(elem).hasClass("photo-section-div") == true) {
            /* Photo */
            let optionType = ActionHelper.getColumnType("largetext");
            let option = [];
            let optId = index; // $(elem).find("span.counter").text();
            let optTitle = $(elem).find("textarea.textarea-photo-title").val();
            let optDesc = $(elem).find("textarea.textarea-photo-description").val();
            let optAttachments = ($(elem).find("textarea.textarea-photo-attachments").val()) ? JSON.parse($(elem).find("textarea.textarea-photo-attachments").val()) : [];
            option.push({
                name: optId,
                displayName: optDesc
            });
            let val = {
                name: "photo-" + optId.toString(),
                displayName: optTitle,
                description: optDesc,
                valueType: optionType,
                allowNullValue: false,
                options: option,
                attachments: optAttachments
            };
            questions.push(val);
        } else if ($(elem).hasClass("document-section-div") == true) {
            /* Document */
            let attachmentId = $(elem).find("textarea#attachment-id").val();
            let optionType = ActionHelper.getColumnType("largetext");
            let option = [];
            let optId = index; // $(elem).find("span.counter").text();
            let optTitle = $(elem).find("textarea.textarea-document").val();
            let optDesc = $(elem).find("textarea.textarea-document-description").val();
            let optAttach = [JSON.parse($(elem).find("textarea.textarea-document-attachment").val())];

            let displayNameArr = {
                "description": optDesc,
                "attachmentId": (attachmentId)
            };
            /* option.push({
                name: optId,
                displayName: JSON.stringify(displayNameArr)
            }); */

            option.push({
                name: optId,
                displayName: optDesc
            });

            let val = {
                name: "document-" + optId.toString(),
                displayName: optTitle,
                description: optDesc,
                valueType: optionType,
                allowNullValue: false,
                options: option,
                attachments: optAttach
            };
            questions.push(val);
        } else if ($(elem).hasClass("video-section-div") == true) {
            /* Video */
            let attachmentId = $(elem).find("textarea#attachment-id").val();
            let optionType = ActionHelper.getColumnType("largetext");
            let option = [];
            let optId = index; // $(elem).find("span.counter").text();
            let optTitle = $(elem).find("textarea.textarea-video").val();
            let optDesc = $(elem).find("textarea.textarea-video-description").val();
            let optAttachment = [JSON.parse($(elem).find("textarea.textarea-video-attachments").val())];

            let displayNameArr = {
                "description": optDesc,
                "attachmentId": (attachmentId)
            };
            //option.push({ name: optId, displayName: JSON.stringify(displayNameArr) });
            option.push({
                name: optId,
                displayName: optDesc
            });

            let val = {
                name: "video-" + optId.toString(),
                displayName: optTitle,
                description: optDesc,
                valueType: optionType,
                allowNullValue: false,
                options: option,
                attachments: optAttachment
            };
            questions.push(val);
        }
    });
    return questions;

}

/**
 * Method to get correct answer from the training quiz
 */
function getCorrectAnswer() {
    let correctOption = [];

    $("form div.section-2 #root").find(".section-div").each(function(index, elem) {
        let correct = [];
        let questionId = $(elem).find("span.counter").text();
        if ($(elem).hasClass("question-section-div") == true) {
            $(elem).find("div.option-div").each(function(ind, e) {
                let count = ind + 1;
                let questionId = $(elem).data("id");
                if ($(elem).find("#quest-text-" + questionId + " #check" + count).is(":checked")) {
                    let optId = "question" + questionId + "option" + count;
                    // if it is checked
                    correct.push(optId);
                }
            });
        } else {
            let optId = "question" + questionId;
            correct.push(optId);
        }
        correctOption[questionId - 1] = correct;
    });

    let property = {
        name: "Question Answers",
        type: "LargeText",
        value: JSON.stringify(correctOption),
    };

    return property;
}

/**
 * Method to create action creates json for store form data
 * @param actionPackageId string identifier contains package id
 */
function createAction(actionPackageId) {
    let trainingTitle = $("#training-title").val();
    let trainingDescription = $("#training-description").val();
    let trainingExpireDate = $("input[name='expiry_date']").val();
    let trainingExpireTime = $("input[name='expiry_time']").val();
    let resultVisible = $("input[name='visible_to']:checked").val();
    let showCorrectAnswer = $("#show-correct-answer").is(":checked") ? "Yes" : "No";
    let allowMultipleAttempt = $("#allow-multiple-attempt").is(":checked") ? "Yes" : "No";
    let questionsSet = getQuestionSet();
    let getcorrectanswers = getCorrectAnswer();
    let properties = [];
    properties.push({
        name: "Training Description",
        type: "LargeText",
        value: trainingDescription,
    }, {
        name: "Training Expire Date Time",
        type: "DateTime",
        value: new Date(trainingExpireDate + " " + trainingExpireTime),
    }, {
        name: "Result Visible",
        type: "Text",
        value: resultVisible,
    }, {
        name: "Show Correct Answer",
        type: "Text",
        value: showCorrectAnswer,
    }, {
        name: "Attachment Id",
        type: "Text",
        value: "",
    }, {
        name: "Allow Multiple Attempt",
        type: "Text",
        value: allowMultipleAttempt,
    });
    properties.push(getcorrectanswers);

    let action = {
        id: Utils.generateGUID(),
        actionPackageId: actionPackageId,
        version: 1,
        displayName: trainingTitle,
        description: trainingDescription,
        expiryTime: new Date(trainingExpireDate + " " + trainingExpireTime).getTime(),
        customProperties: properties,
        dataTables: [{
            name: "TrainingDataSet",
            itemsVisibility: ActionHelper.visibility(),
            rowsVisibility: resultVisible == "Everyone" ? ActionHelper.visibility() : ActionHelper.visibility(),
            itemsEditable: false,
            canUserAddMultipleItems: false,
            dataColumns: questionsSet,
            attachments: saveAttachmentData
        }],
    };
    let request = ActionHelper.createAction(action);
    ActionHelper
        .executeApi(request)
        .then(function(response) {
            console.info("CreateAction - Response: " + JSON.stringify(response));
        })
        .catch(function(error) {
            console.error("CreateAction - Error: " + JSON.stringify(error));
        });
}

/***********************************  Submit Training Ends *******************************/

/**
 * @event when document load is ready
 */
$(document).ready(function() {
    request = ActionHelper.getContextRequest();
    getStringKeys();
    getTheme();
    $(".training-clear").attr({
        "style": "display:none;"
    });
});

/**
 * Method to get theme color and localization
 */
async function getTheme() {
    let response = "";
    let context = "";
    ActionHelper.executeApi(request).then(function(res) {
        response = res;
        context = response.context;
        lastSession = context.lastSessionData;

        let theme = context.theme;
        $("link#theme").attr("href", "css/style-" + theme + ".css");
        $("form.sec1").append(formSection);
        $("form.sec1").append(settingSection);
        $("form.sec1").append(trainingSectionView);
        $("form.sec1").after(optionSection);
        // $("form.sec1").after(toggleSection);
        opt = $("div#option-section .option-div").clone();
        let weekDate = new Date(new Date().setDate(new Date().getDate() + 7))
            .toISOString()
            .split("T")[0];

        let weekMonth = new Date(weekDate).toLocaleString("default", {
            month: "short"
        });
        let weekD = new Date(weekDate).getDate();
        let weekYear = new Date(weekDate).getFullYear();
        let weekDateFormat = weekMonth + " " + weekD + ", " + weekYear;
        let currentTime = (("0" + new Date().getHours()).substr(-2)) + ":" + (("0" + new Date().getMinutes()).substr(-2));

        /* If Edit back the quiz */
        if (lastSession != null) {
            let ddtt = ((lastSession.action.customProperties[1].value).split("T"));
            let dt = ddtt[0].split("-");
            weekDateFormat = new Date(dt[1]).toLocaleString("default", {
                month: "short"
            }) + " " + dt[2] + ", " + dt[0];
            let ttTime = (ddtt[1].split("Z")[0]).split(":");
            currentTime = `${ttTime[0]}:${ ttTime[1]}`;
            if (lastSession.action.customProperties[2].value == "Everyone") {
                $(`input[name="visible_to"][value="Everyone"]`).prop("checked", true);
            } else {
                $(`input[name="visible_to"][value="Only me"]`).prop("checked", true);
            }

            if (lastSession.action.customProperties[3].value == "Yes") {
                $("#show-correct-answer").prop("checked", true);
            } else {
                $("#show-correct-answer").prop("checked", false);
            }

            /* Quiz Section */
            $("#quiz-title").val(lastSession.action.displayName);
            $("#quiz-description").val(lastSession.action.customProperties[0].value);

            /* Due Setting String */
            let end = new Date(weekDateFormat + " " + currentTime);
            let start = new Date();
            let days = calc_date_diff(start, end);

            let resultVisible = lastSession.action.customProperties[2].value == "Everyone" ? resultEveryoneKey : resultMeKey;
            let correctAnswer = lastSession.action.customProperties[3].value == "Yes" ? correctAnswerKey : "";

            Localizer.getString("dueIn", days, correctAnswer).then(function(result) {
                settingText = result;
                $("#due").text(settingText);
            });

        } else {
            $("form.sec1").show();
            $(".section-1").show();
            $(".section-1-footer").show();
        }
        $(".form_date input").val(weekDateFormat);
        $(".form_date").attr({
            "data-date": weekDateFormat
        });

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
        let dateInput = $(`input[name="expiry_date"]`);
        let container = $(".bootstrap-iso form").length > 0 ? $(".bootstrap-iso form").parent() : "body";
        let options = {
            format: "M dd, yyyy",
            container: container,
            todayHighlight: true,
            autoclose: true,
            orientation: "top"
        };

        if (lastSession != null) {
            $(".sec1").show();
            $(".section-1").hide();
            $(".section-1-footer").hide();
            $(".section-2").show();
            $("div.section-2-footer").show();
            getStringKeys();

            $("#training-title").val(lastSession.action.displayName);
            $("#training-description").val(lastSession.action.customProperties[0].value);
            $("#training-title-content").text(lastSession.action.displayName);
            $("#training-description-content").text(lastSession.action.customProperties[0].value);

            /* Check if image upload for training */
            if (lastSession.action.dataTables[0].attachments.length > 0) {
                let req2 = ActionHelper.getAttachmentInfoDraft(lastSession.action.dataTables[0].attachments[0].id);
                saveAttachmentData.push(lastSession.action.dataTables[0].attachments[0]);
                ActionHelper.executeApi(req2)
                    .then(function(response) {
                        $("#training-title-image").attr("src", `${response.attachmentInfo.downloadUrl}`);
                        $("#training-title-image").addClass('heightfit');
                        $("#training-title-image").parent().show();
                        $("#training-img-preview").attr("src", `${response.attachmentInfo.downloadUrl}`);
                        $(".section-1").find(".training-updated-img").show();
                        $(".section-1").find(".photo-box").hide();
                        $(".section-2").find(".img-thumbnail").show();
                        $(".section-2").find("#training-title-image").show();
                        $('.training-clear').show();
                    })
                    .catch(function(error) {
                        console.error("AttachmentAction - Error: sasasa" + JSON.stringify(error));
                    });
                $("#cover-image").after(`<textarea name="training_title" class="training-title" style="display:none">${$("#training-title").val()}</textarea>`);
                $("#cover-image").after(`<textarea name="training_description" class="training-description" style="display:none">${$("#training-description").val()}</textarea>`);
                // $("#cover-image").after(`<span name="is_edit" class="training-is_edit" >Edit</span>`);
            }

            /* Create Text and Question summary */
            lastSession.action.dataTables.forEach((dataTable) => {
                let countQuestionno = 1;
                let countQuestion = 0;
                dataTable.dataColumns.forEach((data, ind) => {
                    let counter = ind + 1;
                    if (data.valueType == "LargeText") {
                        /* Call Text Section 1 */
                        let textTitle = data.displayName.length > 100 ? data.displayName.substr(0, data.displayName.lastIndexOf(" ", 97)) + "..." : data.displayName;

                        if (data.name.indexOf("photo") >= 0) {
                            let uniqueCarouselId = Constants.getUniqueId();
                            let $carousel = $(`<div id="carouselExampleIndicators${uniqueCarouselId}" class="carousel slide "data-ride="carousel"></div>`);
                            let $olSection = $(`<ol class="carousel-indicators"></ol>`);
                            let $carouselInner = $(`<div class="carousel-inner"></div>`);
                            $carousel.append($olSection);
                            $carousel.append($carouselInner);
                            data.attachments.forEach((respData, indx) => {
                                let $liList = $(`<li data-target="#carouselExampleIndicators${uniqueCarouselId}" data-slide-to="${indx}" class="${indx == 0 ? "active": ""}"></li>`);
                                $olSection.append($liList);
                                let getImagedata = ActionHelper.getAttachmentInfoDraft(respData.id);
                                ActionHelper.executeApi(getImagedata)
                                    .then(function(response) {
                                        let $imgDiv = $(UxUtils.getCarousalImages(indx, response.attachmentInfo.downloadUrl));
                                        $carouselInner.append($imgDiv);
                                        console.info("Attachment - Response: " + JSON.stringify(response));
                                    })
                                    .catch(function(error) {
                                        console.error("AttachmentAction - Error: " + JSON.stringify(error));
                                    });
                            });
                            $carousel.append(UxUtils.getCarousalPagination(uniqueCarouselId));
                            let photoDesc = data.options[0].displayName;
                            let loaderClass = "";
                            let loaderCss = "";
                            let loaderButton = "";
                            if (photoDesc && (photoDesc.split(/\r\n|\r|\n/).length > 2 || photoDesc.length > 200)) {
                                loaderClass = "show-text";
                                loaderCss = Constants.getLoadMoreCss();
                                loaderButton = Constants.getLoadMoreLink();
                            }
                            let photoSec = UxUtils.getEditImageSection(counter, data.displayName, photoDesc, JSON.stringify(data.attachments), loaderClass, loaderCss, loaderButton);
                            $("div.section-2 div#root").append(photoSec);

                            $(".edit-carasoul-here").append($carousel);
                            $(".carousel").carousel();

                            if (photoDesc && (photoDesc.split(/\r\n|\r|\n/).length > 2 || photoDesc.length > 200)) {
                                $("#section-" + counter).find(".photo-description-preview").addClass("show-text");
                                $("#section-" + counter).find(".photo-description-preview").css({ "-webkit-line-clamp": Constants.webkitLineClampCssCount() });
                                $("#section-" + counter).find(".photo-description-preview").after(Constants.getLoadMoreLink());
                            }

                            let dname = Utils.isJson(data.options[0].displayName) ? JSON.parse(data.options[0].displayName) : data.options[0].displayName;
                            let attachment = Utils.isJson(dname.attachmentId) ? JSON.parse(dname.attachmentId) : dname.attachmentId;
                            if (attachment != undefined) {
                                $("#text-section-" + counter + " textarea#attachment-id").val(attachment);

                                let attachmentImg = "";
                                $.each(attachment, function(ind, att) {
                                    attachmentImg = att;
                                    return false;
                                });
                                let req = ActionHelper.getAttachmentInfo(attachmentImg);
                                let filesAmount = Object.keys(attachment).length;
                                ActionHelper.executeApi(req)
                                    .then(function(response) {
                                        console.info("Attachment - Response: " + JSON.stringify(response));
                                        $("img#image-sec-" + counter).attr("src", response.attachmentInfo.downloadUrl);
                                        if (filesAmount > 1) {
                                            $("img#image-sec-" + counter).after(`<span class="file-counter">+${filesAmount-1}</span>`);
                                        }
                                    })
                                    .catch(function(error) {
                                        console.error("AttachmentAction - Error: " + JSON.stringify(error));
                                    });

                            }

                        } else if (data.name.indexOf("document") >= 0) {
                            let docDesc = data.options[0].displayName;
                            let loaderClass = "";
                            let loaderCss = "";
                            let loaderButton = "";
                            if (docDesc && (docDesc.split(/\r\n|\r|\n/).length > 2 || docDesc.length > 200)) {
                                loaderClass = "show-text";
                                loaderCss = `-webkit-line-clamp : ${Constants.webkitLineClampCssCount()}`;
                                loaderButton = Constants.getLoadMoreLink();
                            }
                            let documentSection = UxUtils.getEditDownloadSection(counter, data.displayName, data.options[0].displayName, JSON.stringify(data.attachments[0]), Constants.getDocumentIcon(), loaderClass, loaderCss, loaderButton);
                            $("div.section-2 div#root").append(documentSection);
                            let dname = Utils.isJson(data.options[0].displayName) ? JSON.parse(data.options[0].displayName) : data.options[0].displayName;
                            let attachment = Utils.isJson(dname.attachmentId) ? JSON.parse(dname.attachmentId) : dname.attachmentId;
                            if (attachment != undefined) {
                                $("#section-" + counter + " textarea#textarea-document").val(attachment);
                            }

                        } else if (data.name.indexOf("video") >= 0) {
                            let videoId = data.attachments[0].id;
                            let req = ActionHelper.getAttachmentInfoDraft(videoId);
                            let videoDesc = data.options[0].displayName;
                            let videoDownloadURL = "";
                            let loaderClass = "";
                            let loaderCss = "";
                            let loaderButton = "";
                            if (videoDesc && (videoDesc.split(/\r\n|\r|\n/).length > 2 || videoDesc.length > 200)) {
                                loaderClass = "show-text";
                                loaderCss = `-webkit-line-clamp : ${Constants.webkitLineClampCssCount()}`;
                                loaderButton = Constants.getLoadMoreLink();
                            }
                            let videoSection = UxUtils.getEditVideoSection(counter, data.displayName, data.options[0].displayName, JSON.stringify(data.attachments[0]), "", loaderClass, loaderCss, loaderButton);
                            ActionHelper.executeApi(req)
                                .then(function(response) {
                                    console.info("Attachment - Response: videourl" + JSON.stringify(response));
                                    videoDownloadURL += response.attachmentInfo.downloadUrl;
                                    $(`#section-${counter}`).find(`#video-sec-${counter}`).attr("src", videoDownloadURL);
                                })
                                .catch(function(error) {
                                    console.error("AttachmentAction - Error: videourl" + JSON.stringify(error));
                                });
                            $("div.section-2 div#root").append(videoSection);
                        } else {
                            /* text */
                            let textDesc = data.options[0].displayName;
                            let loaderClass = "";
                            let loaderCss = "";
                            let loaderButton = "";
                            if (textDesc && (textDesc.split(/\r\n|\r|\n/).length > 2 || textDesc.length > 200)) {
                                loaderClass = "show-text";
                                loaderCss = `-webkit-line-clamp : ${Constants.webkitLineClampCssCount()}`;
                                loaderButton = Constants.getLoadMoreLink();
                            }
                            let textSection = UxUtils.getEditTextContainer(counter, data.displayName, textDesc, loaderClass, loaderCss, loaderButton);

                            $("div.section-2 div#root").append(textSection);
                        }

                    } else if (data.valueType == "SingleOption" || data.valueType == "MultiOption") {

                        /* Call Question Section 1 */
                        let correct = new Array();
                        let correctOpt = "";
                        let optionText = "";
                        let correctInputs = "";
                        let questionInput = `<input type="hidden" class="question${countQuestionno}" value="${data.displayName}">`;
                        let questionImagearray = "";
                        if (data.attachments.length > 0) {
                            questionImagearray = data.attachments[0];
                            let req = ActionHelper.getAttachmentInfoDraft(questionImagearray.id);
                            ActionHelper.executeApi(req)
                                .then(function(response) {
                                    console.info("Attachment - Response: question image" + JSON.stringify(response));
                                    $(".section-2").find(`#${questionImagearray.id}`).attr("src", response.attachmentInfo.downloadUrl);
                                })
                                .catch(function(error) {
                                    console.error("AttachmentAction - Error: question image" + JSON.stringify(error));
                                });
                        }
                        if (questionImagearray) {
                            questionImagearray = JSON.stringify(questionImagearray);
                        }
                        let imageQuestionURL = "";
                        let optionChecked = "";
                        let optionAttachments = "";
                        data.options.forEach((opt, inde) => {
                            let count = inde + 1;
                            let quesAnsArr = $.parseJSON(lastSession.action.customProperties[Constants.getCorrectAnswerIndex()].value);
                            let imageArray = "";
                            let imageURL = "";
                            let styleOptionImage = "d-none";
                            $(`.opt-image${count}`).parent().find("loader-cover").show();
                            if (opt.attachments.length > 0) {
                                styleOptionImage = "";
                                imageArray = opt.attachments[0];
                                let req = ActionHelper.getAttachmentInfoDraft(imageArray.id);
                                ActionHelper.executeApi(req)
                                    .then(function(response) {
                                        console.info("Attachment - Response: option url" + JSON.stringify(response));
                                        imageURL += response.attachmentInfo.downloadUrl;
                                        $(`.opt-image${count}`).attr("src", response.attachmentInfo.downloadUrl);
                                        $(`.opt-image${count}`).parent().find("loader-cover").hide();
                                    })
                                    .catch(function(error) {
                                        console.error("AttachmentAction - Error: option url" + JSON.stringify(error));
                                    });
                            }
                            if (imageArray) {
                                optionAttachments += `<textarea class="d-none option-image${count}">${JSON.stringify(imageArray)}</textarea>`;
                            }

                            let ifCorrectCheck = "";
                            let questionOptionId = `question${countQuestionno}option${count}`;
                            if ($.inArray(opt.name, quesAnsArr[countQuestion]) != -1) {
                                correctInputs += `<input type="checkbox" id="check${count}" checked>`;
                                optionChecked += `<input type="checkbox" class="d-none quest-answer" checked>`;

                                // if it is checked
                                correct.push(questionOptionId);
                                correctOpt += `<p class="mb0">${opt.displayName}</li>`;
                                ifCorrectCheck = `&nbsp;<i class="success">${Constants.getDefaultTickIcon()}</i>`;
                            }
                            let optionsInputs = `<input type="hidden" class="all_options" id="option${count}" value="${opt.displayName}">`;
                            let imagePreview = `<img src="${imageURL}" class="opt-image opt-image${count} img-responsive smallfit">`;
                            optionText += UxUtils.getOptionValue(optionsInputs, imagePreview, opt.displayName, questionOptionId, ifCorrectCheck, styleOptionImage, count);

                        });

                        let questionImage = "";
                        let hideQuestionImage = "d-none";
                        if (data.attachments.length > 0) {
                            hideQuestionImage = "";
                            questionImage = `<img src="${imageQuestionURL}" id="${questionImagearray.id}" class="question-preview-image question-preview-image heightfit" >`;
                        }
                        let questSection1 = UxUtils.getQuestionSection(countQuestionno, optionChecked, questionImage, hideQuestionImage, data.displayName, optionText, questionInput, questionImagearray, optionAttachments, correctInputs);
                        $("div.section-2 div#root").append(questSection1);
                        countQuestion++;
                        countQuestionno++;
                    }
                });
            });
        }
        dateInput.datepicker(options);
        ActionHelper.hideLoader();
        getStringKeys();
    });
}
/***********************************  Other Actions *******************************/

/**
 * @event to back button
 */
$(document).on("click", "#back", function() {
    $(".section-2").hide();
    $(".section-2-footer").hide();

    $("#setting").hide();

    $(".section-1").show();
    $(".section-1-footer").show();
    $(".error-msg").remove();
});

/**
 * @event to back button click from setting page
 */
$(document).on("click", "#back-setting", function() {
    $(".error-msg").remove();
    $(".section-1").show();
    $(".section-1-footer").show();
    $("form #setting").hide();
    $("#due").text(settingText);
});

/**
 * @event to next button
 */
$(document).on("click", "#next1", function() {
    $(".error-msg").remove();
    $(`input[type="text"]`).removeClass("danger");
    $("label.label-alert").remove();
    $("div.card-box-alert").removeClass("card-box-alert").addClass("card-box");

    $("form > .section-1")
        .find(`input[type="text"]`)
        .each(function() {
            let element = $(this);
            if (element.val() == "") {
                validate = false;

                $(this)
                    .parents("div.card-box")
                    .removeClass("card-box")
                    .addClass("card-box-alert");

                if (element.attr("id") == "training-title") {
                    $("#training-title").addClass("danger");
                    $("#training-title").before(`<label class="label-alert d-block mb--4">${requiredKey}</label>`);
                }
            } else {
                $(".section-1").hide();
                $("div.section-1-footer").hide();

                $(".section-2").show();
                $("div.section-2-footer").show();

                $("#training-title-content").text($("#training-title").val());
                if ($("#training-description").val()) {
                    $("#training-description-content").text($("#training-description").val());
                }

                if ($(".training-title").length > 0) {
                    $(".training-title").val($("#training-title").val());
                } else {
                    $("#cover-image").after(`<textarea name="training_title" class="training-title" style="display:none">${$("#training-title").val()}</textarea>`);
                }
                if ($(".training-description").length > 0) {
                    $(".training-description").val($("#training-description").val());
                    $("#cover-image").after(`<textarea name="training_description" class="training-description" style="display:none">${$("#training-description").val()}</textarea>`);
                } else {
                    $("#cover-image").after(`<textarea name="training_description" class="training-description" style="display:none">${$("#training-description").val()}</textarea>`);
                }
            }
        });

    let imageCounter = $(".training-card-section").find(`input[type="file"]`).get(0).files.length;
    if (imageCounter > 0) {
        $(".body-outer").before(loader);
        for (let i = 0; i < imageCounter; i++) {
            let fileData = $(".training-card-section").find(`input[type="file"]`).get(0).files[i];
        }
        $(".loader-overlay").remove();
    } else {
        $("#training-title-content").parents("div.col-9").addClass("col-12").removeClass("col-9");
        $("#training-title-content").parents("div.row").find("div.col-3").hide();
    }
});

/**
 * @event when training cover image changes
 */
$(document).on("change", "#cover-image", function() {
    $(".error-msg").remove();
    if ($(this).val()) {
        let urlResponse = readURL(this, "#training-img-preview, #training-title-image", "next1");
        $(".cover-image-loader").parent().parent().find("span.text-danger.pull-right").remove();
        if (urlResponse == true) {
            $(".photo-box").hide();
            // $(".quiz-updated-img").show();
            $(".training-updated-img").show();
            $("#training-title-image").show();
            $("#training-title-image").parent(".quiz-updated-img").show();
            $(".training-clear").show();
            if (!$("#next1").hasClass("disabled")) {
                $("#next1").addClass("disabled");
                $("#next1").prepend(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);
            }

            /* Perform image upload for quiz template */
            let fileData = this;
            if ($(fileData).val() != "") {
                $(".cover-image-loader").show();
                let coverImage = fileData.files[0];

                let attachment = ActionHelper.attachmentUpload(coverImage, coverImage["type"]);
                let attachmentRequest = {};
                attachmentRequest = ActionHelper.requestAttachmentUploadDraft(attachment);
                ActionHelper.executeApi(attachmentRequest)
                    .then(function(response) {
                        let attachmentData = {
                            "name": "training-banner",
                            "type": "Image",
                            "id": response.attachmentId
                        };
                        saveAttachmentData.push(attachmentData);
                        $("#next1").removeClass("disabled");
                        $("#next1").find(`span.spinner-border.spinner-border-sm`).remove();
                        $("div.section-2").find("div.training-card-section").after(`<textarea id="training-attachment-id" class="d-none">${JSON.stringify(attachmentData)}</textarea>`);
                        attachmentSet.push(attachmentData);
                    })
                    .catch(function(error) {
                        console.log("GetContext - Error2: " + JSON.stringify(error));
                    });
            }

        } else {

            $(".photo-box").show();
            $(".img-thumbnail").hide();
            $(".training-updated-img").hide();
            $("#training-title-image").hide();
            $(".training-clear").hide();

            $(".cover-image-loader").parent().before(`<span class="text-danger pull-right">Invalid file formate</span><div class="clearfix"></div>`);
        }
    }
});

/**
 * @event when click on clear button on training section
 */
$(document).on("click", ".training-clear", function() {
    $(".error-msg").remove();
    $("div.section-1 .photo-box").show();
    $("div.section-1 .training-updated-img").hide();
    $("div.section-1 .training-clear").hide();

    $("#training-img-preview").attr("src", "");

    $("#training-title-image").parent().hide();

    $("#training-attachment-id").remove();

    $("div#section-0 #cover-image").val("");
    $("div#section-0 .img-thumbnail").hide();
    $("div#section-0 .img-thumbnail").parents(".rows").addClass("col-12").removeClass("col-9");
});

/**
 * @event when click on class then open hidden file
 */
$(document).on("click", ".upvj", function(event) {
    event.preventDefault();
    if ($(this).parents("div.section-1").length > 0) {
        $(".section-2").find("div.training-card-section:first").find(`
                                    input[type = "file"]
                                    `).click();
    } else {
        $(".section-2").find("div.training-card-section:last").find(`
                                    input[type = "file"]
                                    `).click();
    }
});

/***********************************  Other Actions Ends ***************************/

/***********************************  Settings ***************************/
/**
 * @event when change on setting inputs
 */
$(document).on("change", `input[name="expiry_date"], input[name="expiry_time"], .visible-to, #show-correct-answer`, function() {
    let end = new Date($(`input[name="expiry_date"]`).val() + " " + $(`input[name="expiry_time"]`).val());
    let start = new Date();
    let days = calc_date_diff(start, end);
    $(this).parents("div.row").find(".error-msg").remove();
    if (days == undefined) {
        let $errSec = $(` < p class = "text-danger error-msg" > < /p>`);
        Localizer.getString("alert_invalid_date_time").then(function(result) {
            $errSec.append(result);
        });
        $("small.invalid-date-error").prepend($errSec);
        $("#back-setting").parents("a.cursur-pointer").addClass("disabled");
        $("#back").addClass("disabled");
        $("#back").find("span[tabindex=0]").addClass("disabled");
    } else {
        $("#back").removeClass("disabled");
        $("#back").find("span[tabindex=0]").removeClass("disabled");
        $("#back-setting").parents("a.cursur-pointer").removeClass("disabled");
        let resultVisible = $(".visible-to:checked").val() == "Everyone" ? resultEveryoneKey : resultMeKey;
        let correctAnswer = $("#show-correct-answer:eq(0)").is(":checked") == true ? correctAnswerKey : "";
        Localizer.getString("dueIn", days, correctAnswer).then(function(result) {
            settingText = result;
            $("span#due").text(settingText);
        });
    }
});

/********************************  Settings Ends ***********************/

/***********************************  Methods ***************************/
/**
 * Method to get date difference between two date
 * @param start datetime start date
 * @param end datetime end date
 */
function calc_date_diff(start, end) {
    let days = (end - start) / (1000 * 60 * 60 * 24);
    let hourText = "";
    let minuteText = "";

    if (days > 6) {
        let weeks = Math.ceil(days) / 7;
        return Math.floor(weeks) + " week";
    } else {
        if (days < 1) {
            let t1 = start.getTime();
            let t2 = end.getTime();

            let minsDiff = Math.floor((t2 - t1) / 1000 / 60);
            let hourDiff = Math.floor(minsDiff / 60);
            minsDiff = minsDiff % 60;

            if (hourDiff > 1) {
                hourText = "hours";
            } else {
                hourText = "hour";
            }
            if (hourDiff > 1) {
                minuteText = "minutes";
            } else {
                minuteText = "minute";
            }
            if (hourDiff > 0 && minsDiff > 0) {
                return hourDiff + " " + hourText + ", " + minsDiff + " " + minuteText;
            } else if (hourDiff > 0 && minsDiff <= 0) {
                return hourDiff + " " + hourText;
            } else if (hourDiff <= 0 && minsDiff > 0) {
                return minsDiff + " " + minuteText;
            }
        } else {
            return Math.ceil(days) + " days";
        }
    }
}

/**
 * Method to get base64 data of file
 * @param input object html file type input element
 * @param elem object html elem where preview need to show
 */
function readURL(input, elem) {
    let fileTypes = ["jpg", "jpeg", "png", "gif", "webp", "jfif"];
    let isSuccess = false;
    $(elem).removeClass("heightfit");
    $(elem).removeClass("widthfit");
    $(elem).removeClass("smallfit");
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        let extension = input.files[0].name.split(".").pop().toLowerCase();
        isSuccess = fileTypes.indexOf(extension) > -1;
        if (isSuccess) {
            reader.onload = function(e) {
                let image = new Image();
                image.src = e.target.result;

                image.onload = function() {
                    let imgWidth = this.width;
                    let imgHeight = this.height;
                    let divWidth = $(elem).width();
                    let divHeight = $(elem).height();
                    $(elem).attr("src", this.src);
                    let classSelector = "";
                    if (imgHeight > divHeight) {
                        /* height is greater than width */
                        classSelector = "heightfit";
                    } else if (imgWidth > divWidth) {
                        /* width is greater than height */
                        classSelector = "widthfit";
                    } else {
                        /* small image */
                        classSelector = "smallfit";
                    }
                    $(elem).addClass(classSelector);
                    let tid = setInterval(() => {
                        if ($(elem).hasClass(classSelector)) {
                            $(".loader-cover").hide();
                            clearInterval(tid);
                        }
                    }, Constants.setIntervalTimeHundred());
                };
            };
        } else {
            return false;
        }
        reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
    return true;
}

/***********************************  Methods Ends ***************************/
/***********************************  HTML Section ***************************/

/**
 * @event Onclick Enter or Space Key click on back or submit button
 */
$(document).on("keydown", "div[tabindex=0] , span[tabindex=0] , a[tabindex=0]", function(e) {
    let key = e.which;
    if (key === 13 || key === 32) {
        e.preventDefault();
        if ($(this).attr("role") == "checkbox") {
            $(this).find("input[type=checkbox]").click();
        }

        if ($(this).attr("role") == "button") {
            if ($(this).data("id") == "back" && $(this).hasClass("disabled")) {
                return false;
            }
            $("#" + $(this).data("id")).click();
        }

        if ($(this).attr("role") == "input") {
            $(".quiz-clear").click();
        }
        if ($(this).attr("role") == "image" || $(this).attr("role") == "doc") {
            if ($(this).parents("div.section-1").length > 0) {
                $(".section-2").find("div.training-card-section:first").find(`input[type="file"]`).click();
            } else {
                $(".section-2").find("div.training-card-section:last").find(`input[type="file"]`).click();
            }
        }

        return false;
    }

});

/**
 * @event Keydown and Click when question cover image changes
 */
$(document).on({
    keydown: function(e) {
        let key = e.which;
        if (key === 13 || key === 32) {
            e.preventDefault();
            $(this).click();
            return false;
        }
    },
    click: function(e) {
        e.preventDefault();
        $(this).parents(".input-group").find(`input[type="file"]`).click();
        return false;
    }
}, ".question-image, .option-image");

/**
 * @event Change when question cover image changes
 */
$(document).on("change", `input[name="question_image"]`, function() {
    $(".invalid-file-question").remove();
    let urlReturn = readURL(this, $(this).parents("div.form-group-question").find(".question-preview-image"));
    if (urlReturn == true) {
        if (!$("#question-done").hasClass("disabled")) {
            $("#question-done").addClass("disabled");
            $("#question-done").append(Constants.getDisabledLoader());
        }
        $(this).parents("div.form-group-question").find(".question-preview-image").show();
        $(this).parents("div.form-group-question").find(".question-preview").show();
        $(".remove-option").hide();

        /* Perform image upload for question image */
        let fileData = this;
        if ($(fileData).val() != "") {
            if (!$("#submit").hasClass("disabled")) {
                $("#submit").addClass("disabled");
                $("#submit").prepend(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);
            }
            let coverImage = fileData.files[0];
            let attachment = ActionHelper.attachmentUpload(coverImage, coverImage["type"]);
            let attachmentRequest = ActionHelper.requestAttachmentUploadDraft(attachment);
            let imgIndex = $(this).attr("id");
            ActionHelper.executeApi(attachmentRequest)
                .then(function(response) {
                    let attachmentData = {
                        "name": "question-banner-" + imgIndex,
                        type: "Image",
                        id: response.attachmentId
                    };
                    let selector = $(this).parents(".question-container").attr("id");
                    if ($("#" + selector).find("#question-attachment-id").length > 0) {
                        $("#" + selector).find("#question-attachment-id").val(response.attachmentId);
                        $("#" + selector).find("#question-attachment-set").val(JSON.stringify(attachmentData));
                    } else {
                        $(fileData).after(`<textarea id="question-attachment-id" class="d-none" >${response.attachmentId}</textarea>`);
                        $(fileData).after(`<textarea id="question-attachment-set" class="d-none" >${JSON.stringify(attachmentData)}</textarea>`);
                    }
                    $("#submit").removeClass("disabled");
                    $("#submit").find(`.spinner-border.spinner-border-sm`).remove();
                    $("#question-done").removeClass("disabled");
                    $("#question-done").find(Constants.getDisabledLoaderClass()).remove();
                })
                .catch(function(error) {
                    console.log("GetContext - Error3: " + JSON.stringify(error));
                });
        }
    } else {
        $(".question-preview-image").attr("src", "");
        $(".question-preview").hide();
        $(this).parents(".form-group-question").find(".question-preview").before(`<label class="label-alert d-block mb--4 invalid-file-question"><font class="invalid-file-key">${invalidFileFormatKey}</font></label>`);
        $(this).parents("div.input-group-append").find("#question-attachment-id").remove();
        $(this).parents("div.input-group-append").find("#question-attachment-set").remove();
    }
});

/**
 * @event Change when option cover image changes
 */
$(document).on("change", `input[name="option_image"]`, function() {
    $(".invalid-file-option").remove();
    let urlReturn = readURL(this, $(this).parents("div.row").find(".option-preview-image"));
    $(this).parents("div.row").find(".option-preview-image").show();
    $(this).parents("div.row").find("div.option-preview").show();
    if (urlReturn == true) {
        if (!$("#question-done").hasClass("disabled")) {
            $("#question-done").addClass("disabled");
            $("#question-done").append(Constants.getDisabledLoader());
        }
        let fileData = this;
        $(".remove-option").hide();
        if ($(fileData).val() != "") {
            if (!$("#submit").hasClass("disabled")) {
                $("#submit").addClass("disabled");
                $("#submit").prepend(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);
            }
            let coverImage = fileData.files[0];
            let attachment = ActionHelper.attachmentUpload(coverImage, coverImage["type"]);
            let attachmentRequest = ActionHelper.requestAttachmentUploadDraft(attachment);
            let imgIndex = $(this).attr("id");
            ActionHelper.executeApi(attachmentRequest)
                .then(function(response) {
                    let attachmentData = {
                        "name": "option-banner-" + imgIndex,
                        type: "Image",
                        id: response.attachmentId
                    };
                    let selector = $(this).parents(".row");
                    if ($(selector).find("textarea#option-attachment-id").length > 0) {
                        $(selector).find("textarea#option-attachment-id").val(response.attachmentId);
                        $(selector).find("textarea#option-attachment-set").val(JSON.stringify(attachmentData));
                    } else {
                        $(fileData).after(`<textarea id="option-attachment-id" class="d-none" >${response.attachmentId}</textarea>`);
                        $(fileData).after(`<textarea id="option-attachment-set" class="d-none" >${JSON.stringify(attachmentData)}</textarea>`);
                    }
                    $("#submit").removeClass("disabled");
                    $("#submit").find(`.spinner-border.spinner-border-sm`).remove();
                    $("#question-done").removeClass("disabled");
                    $("#question-done").find(Constants.getDisabledLoaderClass()).remove();
                })
                .catch(function(error) {
                    console.log("GetContext - Error4: " + JSON.stringify(error));
                });
        }
    } else {
        $(".option-preview-image").attr("src", "");
        $(".option-preview").hide();
        $(this).parents("div.option-div").prepend(`<label class="label-alert d-block mb--4 invalid-file-option"><font class="invalid-file-key">${invalidFileFormatKey}</font></label>`);
        $(this).parents("div.option-div").find("#question-attachment-id").remove();
        $(this).parents("div.option-div").find("#question-attachment-set").remove();
    }
});

/**
 * @event Keydown event for correct answer inputs
 */
KeyboardUtils.keydownClick(document, ".check-me-title");

/**
 * @event Click event for correct answer inputs
 */
$(document).on({
    click: function(e) {
        e.preventDefault();
        if ($(this).parents("div.col-12").find(`input[type="checkbox"]`).prop("checked") == false) {
            $(this).parents("div.col-12").find(`input[type="checkbox"]`).prop("checked", true);
            $(this).addClass("checked-112");
        } else {
            $(this).parents("div.col-12").find(`input[type="checkbox"]`).prop("checked", false);
            $(this).removeClass("checked-112");
        }
        return false;
    }
}, ".check-me-title");

/**
 * @event Keydown event for remove options
 */
KeyboardUtils.removeOptionKeydownClick(document, ".remove-option-href");

/**
 * @event Keydown and Click for remove the Question from the section-2
 */
KeyboardUtils.keydownClick(document, ".remove-question");

/**
 * @event Click for remove the Question from the section-2
 */
$(document).on({
    click: function(e) {
        let element = $(this);
        $(this).parents(".question-container").find(".confirm-box").remove();
        $(this).parents(".question-container").find(".question-required-err").remove();

        if ($("div.question-container:visible").length > 1) {
            $(this).parents(".question-container").find(".add-options").hide();
            $(this).parents(".question-container").find(".form-group-opt").after(`
            <div class="confirm-box">
                <div class="clearfix"></div>
                <div class="d-flex-alert  mb--8">
                    <div class="pr--8">
                        <label class="confirm-box text-danger">Are you sure you want to delete?</label>
                    </div>
                    <div class="pl--8 text-right">
                        <button type="button" class="btn btn-primary-outline btn-sm cancel-question-delete mr--8">Cancel</button>
                        <button type="button" class="btn btn-primary btn-sm" id="delete-question">Ok</button>
                    </div>
                </div>
            </div>
        `);

            $([document.documentElement, document.body]).animate({
                scrollTop: $(this).parents(".question-container").find(".confirm-box").offset().top - 200
            }, 1000);

            $(this).parents(".question-container").find(".confirm-box #delete-question").focus();

            $(document).on("click", "#delete-question", function() {
                $(this).parents("div.question-container").remove();
                let questionCounter;
                $("div.question-container:visible").each(function(index, elem) {
                    questionCounter = index + 1;
                    $(elem).find("span.question-number").text("Question # " + questionCounter);
                    $(elem).find(`input[name="question_image"]`).attr({
                        id: "question-image-" + questionCounter
                    });
                    $(elem).attr({
                        id: "question" + questionCounter
                    });
                });
            });
        } else {
            $(this).parents("div.question-container")
                .find("div.d-flex-ques")
                .after(`<label class="text-danger d-block question-required-err"><font class="mb--4 d-block">For quiz atleast one question is required.</font></label>`);

            $([document.documentElement, document.body]).animate({
                scrollTop: $(".text-danger.d-block:first").offset().top - 200
            }, 2000);
        }
    }
}, ".remove-question");

/**
 * @event Keydown to add the Option under question
 */
KeyboardUtils.keydownClick(document, ".add-options");

/**
 * @event Click to add the Option under question
 */
$(document).on({
    click: function(e) {
        e.preventDefault();
        if ($(this).parents("div#options").find(`div.option-div input[type="text"][id^=option]`).length >= 10) {
            $(this).parents(".question-container").find(".add-options").hide();
            $(this).parents(".question-container").find(".add-options").after(`<div class="max-option-err-box">${maxTenOptionKey}</div>`);

            $([document.documentElement, document.body]).animate({
                scrollTop: $(this).parents(".question-container").find(".max-option-err-box").offset().top - 200
            }, 1000);
            return false;
        }
        $(this).parents(".container").find("div.option-div:last").after(opt.clone());

        let selector = $(this).parents("div.container");
        let counter = 0;
        $(selector)
            .find(`div.option-div div.input-group input[type="text"]`)
            .each(function(index, elem) {
                counter = index + 1;
                $(elem).attr({
                    placeholder: "Enter your choice",
                });
                $(elem).attr({
                    id: "option" + counter
                });
                $(elem)
                    .parents(".option-div")
                    .find("input[type='file']")
                    .attr({
                        id: "option-image-" + counter
                    });
                $(elem)
                    .parents(".option-div")
                    .find("input.form-check-input")
                    .attr({
                        id: "check" + counter
                    });
            });
        $(".check-me").text(checkMeKey);
        $(".check-me-title").attr({
            "title": checkMeKey
        });
        $(this).parents(".container").find("div.option-div:last").find("input#option" + counter).focus();
        return false;
    }
}, ".add-options");

/*  HTML Sections  */
/**
 * Variable contains form section
 */
let formSection = UxUtils.getLandingContainer(uploadCoverImageKey, trainingTitleKey, trainingDescriptionOptionalKey, coverImageKey, clearKey, settingText, nextKey);

/**
 * Variable contains training section
 */
let trainingSectionView = UxUtils.getTrainingContentArea(backKey, submitKey, addContentKey);

/**
 * Variable contains question section
 */
let questionsSection = UxUtils.getQuestionArea(questionKey, questionTitleKey, checkMeKey);

/**
 * Variable contains add button section
 */
let addQuestionButton = UxUtils.getAddQuestionButton();

/**
 * Variable contains question footer
 */
let questionFooter = UxUtils.getQuestionAreaFooter();

/**
 * Variable contains option section
 */
let optionSection = UxUtils.getOptionArea(checkMeKey);

/**
 * Variable contains text section
 */
let addTextSection = UxUtils.getTextContentArea();

/**
 * Variable contains text footer section
 */
let addTextFooter = UxUtils.getTextContentFooter();

/**
 * Variable contains photo section
 */
let addPhotoSection = UxUtils.getImageContentArea(addTitlePlaceholderKey, addDescriptionPlaceholderKey, uploadImageLabelKey);

/**
 * Variable contains photo footer section
 */
let addPhotoFooter = UxUtils.getImageContentFooter();
/**
 * Variable contains video section
 */
let addVideoSection = UxUtils.getVideoContentArea();

/**
 * Variable contains video footer section
 */
let addVideoFooter = UxUtils.getVideoContentFooter();
/**
 * Variable contains document section
 */
let addDocumentSection = UxUtils.getDocumentContentArea();

/**
 * Variable contains document footer section
 */
let addDocumentFooter = UxUtils.getDocumentContentFooter();
/**
 * Variable contains setting section
 */
let settingSection = UxUtils.getSettingContentArea(dueByKey, resultVisibleToKey, everyoneKey, onlyMeKey, showCorrectAnswerKey, answerCannotChangeKey, allowMultipleAttemptKey, assigneeTakeMultipleTraining);
/**
 * Variable contains toggle section
 */

/**
 * Variable contains Loader
 */
let loader = UxUtils.getLoaderContentArea();

/**
 * Variable contains Discard content
 */
let discardContent = UxUtils.getDiscardContentArea();

/***********************************  HTML Section Ends***************************/