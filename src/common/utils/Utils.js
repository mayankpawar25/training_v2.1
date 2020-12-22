// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Constants } from "./Constants";
import { UxUtils } from "./UxUtils";

export class Utils {
    /**
     * Method to generate guid
     */
    static generateGUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            let r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * Method to validate the string is json or not
     * @param str string identifier
     */
    static isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    /*
     * Method to get number to word
     * @param num number
     */
    static numbertowords(num) {
        switch (num) {
            case 1:
                return "one";
                break;
            case 2:
                return "two";
                break;
            case 3:
                return "three";
                break;
            case 4:
                return "four";
                break;
            case 5:
                return "five";
                break;
            case 6:
                return "six";
                break;
            case 7:
                return "seven";
                break;
            case 8:
                return "eight";
                break;
            case 9:
                return "nine";
                break;
            case 10:
                return "ten";
                break;
            default:
                break;
        }
    }

    /**
     * @description Method to get image dimensions and image div dimensions
     * @param imageURL contains image url
     * @param selector contains image where url placed
     */
    static getClassFromDimension(imgURL, selector) {
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
            let tid = setInterval(() => {
                if ($(selector).hasClass(getClass) == true) {
                    setTimeout(() => {
                        UxUtils.removeImageLoader($(selector));
                        clearInterval(tid);
                    }, Constants.setIntervalTimeFiveHundred());
                }
            }, Constants.setIntervalTimeHundred());
        });
    }

    /**
     * Method to get remove Image loader from image section
     * @param selector object html on which remove image
     */
    static removeImageLoader(selector) {
        let tid = setInterval(() => {
            if ($(selector).hasClass("heightfit") || $(selector).hasClass("widthfit") || $(selector).hasClass("smallfit")) {
                $(".loader-cover").addClass("d-none");
                clearInterval(tid);
            }
        }, 100);
    }
}