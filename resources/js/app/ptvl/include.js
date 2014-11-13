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

function setWatched() {
    var episodeGrid = Ext.getCmp('episodeGird');
    var selectedEpisode = episodeGrid.getSelectionModel().getSelected();

    if (selectedEpisode.data.playcount === 0) {
        setXBMCWatched(selectedEpisode.data.episodeid, 'episode', true);
        selectedEpisode.data.playcount = 1;
        episodeGrid.getView().refresh();
    }
}

function setUnwatched() {
    var episodeGrid = Ext.getCmp('episodeGird');
    var selectedEpisode = episodeGrid.getSelectionModel().getSelected();

    if (selectedEpisode.data.playcount !== 0) {
        setXBMCWatched(selectedEpisode.data.episodeid, 'episode', false);
        selectedEpisode.data.playcount = 0;
        episodeGrid.getView().refresh();
    }
}

function updateXBMCAll() {
    Ext.MessageBox.show({
        title: 'Please wait',
        msg: 'Saving changes',
        progressText: 'Checking changes...',
        width: 300,
        progress: true,
        closable: false,
        animEl: 'samplebutton'
    });

    var f = function(v) {
        return function() {
            if (v === 30) {
                Ext.MessageBox.hide();
            }
            else {
                var i = v/29;
                var mesg = '';
                var form;

                if (v === 1) {
                    mesg = 'Checking for changes...';
                    form = Ext.getCmp('episodedetailPanel').getForm();
                    if (form.isDirty()) {
                        updateXBMCTables(form, 'episode',
                            Ext.getCmp('episodeGird').getSelectionModel().getSelected().data.episodeid);
                        mesg = 'Updating episode information...';
                    }
                }
                if (v === 10) {
                    form = Ext.getCmp('tvShowdetailPanel').getForm();
                    if (form.isDirty()) {
                        updateXBMCTables(form, 'tvshow',
                            Ext.getCmp('tvshowgrid').getSelectionModel().getSelected().data.tvshowid);
                        mesg = 'Updating TV show information...';
                    }
                }
                Ext.MessageBox.updateProgress(i, mesg);
            }
        };
    };

    for(var i = 1; i < 31; i++) {
        setTimeout(f(i), i*100);
    }
}

function loadTVShowDetails(record) {
    var request = {
        jsonrpc: '2.0',
        method: 'VideoLibrary.GetTVShowDetails',
        params: {
            tvshowid: record.data.tvshowid,
            properties: [
                'title', 'genre', 'year', 'rating', 'plot', 'playcount', 'studio', 'mpaa',
                'premiered', 'votes', 'fanart', 'thumbnail', 'file', 'episodeguide'
            ]
        },
        id: 'XWMM'
    };
    var response = xbmcJsonRPC(request);
    XWMM.util.merge2Objects(record.data, response.tvshowdetails);

    //fix up some data retrieved
    record.data.genre = XWMM.util.convertArrayToList(response.tvshowdetails.genre);
    record.data.studio = XWMM.util.convertArrayToList(response.tvshowdetails.studio);
    record.data.rating = XWMM.util.convertRating(response.tvshowdetails.rating);
    record.data.fanart = XWMM.util.convertArtworkURL(response.tvshowdetails.fanart);
    record.data.thumbnail = XWMM.util.convertArtworkURL(response.tvshowdetails.thumbnail);
    updateTVShowDetails(record);
}

function updateTVShowDetails(record) {
    Ext.getCmp('tvShowStarRating').updateSrc(record);
    Ext.getCmp('tvshowcover').updateSrc(record.data.banner);
    Ext.getCmp('tvShowdetailPanel').getForm().loadRecord(record);
}

function updateChannelDetails(record) {
    Ext.getCmp('channelDetailsPanel').getForm().loadRecord(record);
}

function updateEpisodeDetails(record) {
    Ext.getCmp('episodeStarRating').updateSrc(record);
    Ext.getCmp('episodedetailPanel').getForm().loadRecord(record);
    Ext.getCmp('filedetailPanel').getForm().loadRecord(record);

    var videoCodec = Ext.getCmp('videocodec').getEl().dom;
    var aspect = Ext.getCmp('aspect').getEl().dom;
    var resolution = Ext.getCmp('resolution').getEl().dom;
    var audioChannels = Ext.getCmp('audiochannels').getEl().dom;
    var audioCodec = Ext.getCmp('audiocodec').getEl().dom;

    videoCodec.src = Ext.BLANK_IMAGE_URL;
    aspect.src = Ext.BLANK_IMAGE_URL;
    resolution.src = Ext.BLANK_IMAGE_URL;
    audioChannels.src = Ext.BLANK_IMAGE_URL;
    audioCodec.src = Ext.BLANK_IMAGE_URL;

    if (record.data.streamdetails !== undefined) {
        if (record.data.streamdetails.video !== undefined &&
            record.data.streamdetails.video.length > 0) {
            videoCodec.src = (record.data.streamdetails.video[0].codec !== undefined) ?
                '../resources/images/flags/video/' + record.data.streamdetails.video[0].codec + '.png' :
                Ext.BLANK_IMAGE_URL;
            aspect.src = (record.data.streamdetails.video[0].aspect !== undefined) ?
                '../resources/images/flags/aspectratio/' +
                    XWMM.util.findAspect(record.data.streamdetails.video[0].aspect) + '.png' :
                Ext.BLANK_IMAGE_URL;
            resolution.src = (record.data.streamdetails.video[0].width !== undefined) ?
                '../resources/images/flags/video/' +
                    XWMM.util.findResolution(record.data.streamdetails.video[0].width) + '.png' :
                Ext.BLANK_IMAGE_URL;
        }
        if (record.data.streamdetails.audio !== undefined &&
            record.data.streamdetails.audio.length > 0) {
            audioChannels.src = (record.data.streamdetails.audio[0].channels !== undefined) ?
                '../resources/images/flags/audio/' + record.data.streamdetails.audio[0].channels + '.png' :
                Ext.BLANK_IMAGE_URL;
            audioCodec.src = (record.data.streamdetails.audio[0].codec !== undefined) ?
                '../resources/images/flags/audio/' + record.data.streamdetails.audio[0].codec + '.png' :
                Ext.BLANK_IMAGE_URL;
        }
    }
}

function clearEpisodeDetails() {
    episodeStars.updateSrc({data:{}});
    Ext.getCmp('seasoncover').updateSrc(undefined);

    Ext.getCmp('episodedetailPanel').getForm().reset();
    Ext.getCmp('filedetailPanel').getForm().reset();

    Ext.getCmp('videocodec').getEl().dom.src = Ext.BLANK_IMAGE_URL;
    Ext.getCmp('aspect').getEl().dom.src = Ext.BLANK_IMAGE_URL;
    Ext.getCmp('resolution').getEl().dom.src = Ext.BLANK_IMAGE_URL;
    Ext.getCmp('audiochannels').getEl().dom.src = Ext.BLANK_IMAGE_URL;
    Ext.getCmp('audiocodec').getEl().dom.src = Ext.BLANK_IMAGE_URL;
}

function tvShowGenreChange(sm) {
    var selectedTVShow = Ext.getCmp('tvshowgrid').getSelectionModel().getSelected();
    var selectedGenres = sm.getSelections();
    var genres = [];

    for (var i = 0, len = selectedGenres.length; i < len; i++) {
        genres.push(selectedGenres[i].data.label);
    }

    var list = genres.join(' / ');
    selectedTVShow.data.genre = list;
    Ext.getCmp('genreString').setValue(list);

    Ext.getCmp('savebutton').enable();
}

function updateTVShowGenreGrid(record) {
    var genreGrid = Ext.getCmp('genresGrid');
    var genreIds = [];
    var genres = XWMM.util.convertListToArray(record.data.genre, /[,\/\|]+/); // Split list separated with , / or |.

    var index;
    for (var i = 0, genreCount = genres.length; i < genreCount; i++) {
        index = genreGrid.getStore().findExact('label', genres[i], 0);
        if (index > -1) {
            genreIds.push(index);
        }
    }

    if (genreIds.length > 0) {
        genreGrid.getSelectionModel().clearSelections(false);
        genreGrid.getSelectionModel().selectRows(genreIds, true);
    }
}

function checkWatched(value) {
    return value === 1 ?
        '<img src="../resources/images/icons/checked.png" width="16" height="16" alt="Watched">' :
        '';
}
