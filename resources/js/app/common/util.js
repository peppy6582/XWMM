/* global Ext: false, XWMM: false */
/*
 * Copyright 2011 slash2009.
 * Copyright 2013 Zernable.
 * Copyright 2013 uNiversal.
 * Copyright 2013, 2014 Andrew Fyfe.
 *
 * This file is part of XBMC Web Media Manager (XWMM).
 *
 * XWMM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * XWMM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with XWMM.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.ns('XWMM.util');

/**
 * Convert a string to title case.
 * @param {string} str The string to convert.
 * @return {string} The string converted to title case.
 */
XWMM.util.toTitleCase = function(str) {
    return str.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};


/**
 * Converts an array to a string list.
 * @param {array} value The array to convert.
 * @return {string} The list.
 */
XWMM.util.convertArrayToList = function(value) {
    if (value === undefined || value.length === 0) {
        return '';
    }
    else {
        return value.join(' / ');
    }
};

/**
 * Convert a string list into an array.
 * @param {string} stringList The string to split.
 * @param {(string|RegExp)} sep The separator to split the list on.
 * @returns {Array} The string list as an array.
 */
XWMM.util.convertListToArray = function(stringList, sep) {
    var inList = stringList.split(sep);
    var outList = [];
    for (var i = 0, len = inList.length; i < len; i++) {
        listItem = inList[i].trim();
        if (listItem.length > 0) {
            outList.push(listItem);
        }
    }
    return outList;
}

/**
 * Strip the image:// prefix from artwork urls.
 * @param {string} value The artwork url to convert.
 * @return {string} The converted url.
 */
XWMM.util.convertArtworkURL = function(value) {
    if (value === undefined) {
        return '';
    }
    else {
        // subtract image:// from the start and / from the end.
        return '/image/' + value.substr(8, value.length - 9);
    }
};

/**
 * Convert a rating to 1 decimal place
 * @param {string} value The rating to convert.
 * @return {string} The converted rating.
 */
XWMM.util.convertRating = function(value) {
    return value.toFixed(1);
};

/**
 * Return the file name part of a path
 * @param {string} value The path.
 * @return {string} The file name.
 */
XWMM.util.convertPathToFileName = function(value) {
    var fileName = /([^\\\/]+)$/.exec(value);

    return fileName === null ?
        value :
        fileName[1];
};

/**
 * Return the directory part of a path
 * @param {string} value The path.
 * @return {string} The directory.
 */
XWMM.util.convertPathToDirectory = function(value, record) {
    var dirPath = value.replace(/([^\\\/]+)$/, '');
    return dirPath === null ?
        value :
        dirPath;
};

/**
 * Merge 2 objects.
 * @param {string} object1 The first object to merge.
 * @param {string} object2 The second object to merge.
 */
XWMM.util.merge2Objects = function(object1, object2) {
    for (var prop in object2) {
        object1[prop] = object2[prop];
    }
};

XWMM.util.findResolution = function(width) {
    var resolution;

    if (width === 0) {
        resolution = 'defaultscreen';
    }
    else if (width < 721) {
        resolution = '480';
    }
    else if (width < 961) { // 960x540
        resolution = '540';
    }
    else if (width < 1281) { // 1280x720
        resolution = '720';
    }
    else { // 1920x1080
        resolution = '1080';
    }

    return resolution;
};

XWMM.util.findAspect = function(aspect) {
    var ratio;

    if (aspect === 0) {
        ratio = 'default';
    }
    else if (aspect < 1.4) {
        ratio = '1.33';
    }
    else if (aspect < 1.7) {
        ratio = '1.66';
    }
    else if (aspect < 1.8) {
        ratio = '1.78';
    }
    else if (aspect < 1.9) {
        ratio = '1.85';
    }
    else if (aspect < 2.3) {
        ratio = '2.20';
    }
    else {
        ratio = '2.35';
    }

    return ratio;
};
