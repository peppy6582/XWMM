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

// -----------------------------------------
// MUSIC include.js
//------------------------------------------

function updateMusicAlbum() {

    var record = Ext.getCmp('albumGrid').getSelectionModel().getSelected();

        Ext.MessageBox.show({
        title: 'Please wait',
        msg: 'Saving changes',
        progressText: 'Checking changes...',
        width:300,
        progress:true,
        closable:false,
        animEl: 'samplebutton'
    });

    var f = function(v){
        return function(){
            var myText;
        if(v === 30){
            Ext.MessageBox.hide();
        }else{
            var i = v/29;
            if (v === 1) {
                myText = 'Checking changes...';
                if (standardInfo.getForm().isDirty()) {
                    updateXBMCTables(standardInfo.form, 'album', AlbumGrid.getSelectionModel().getSelected().data.albumid);
                    myText = 'updating Album info';
                }
            }
            if (v === 19) {
                if ((extraInfo.getForm().isDirty()) || (albumDescription.getForm().isDirty())) {
//                  ValidateAlbuminfo(record);
                    updateXBMCTables(extraInfo.form, 'albuminfo', AlbumGrid.getSelectionModel().getSelected().data.albumid);
                    updateXBMCTables(albumDescription.form, 'albuminfo', AlbumGrid.getSelectionModel().getSelected().data.albumid);
                    myText = 'updating Extra info';
                }
            }
            Ext.MessageBox.updateProgress(i, myText);
        }
        };
    };
    for(var i = 1; i < 31; i++){
        setTimeout(f(i), i*100);
    }
}

function ValidateAlbuminfo (record) {
    // check if record exists otherwise create it
    // AlbumInfoStore.reload();
    // if (AlbumInfoStore.find('idAlbum',record.data.albumid,0,false,false) == -1) {
    if (record.data.scraperInfo === false) {
        // # BROKEN - HTTP API no longer supported
        console.error('BROKEN! - HTTP API no longer supported');
        //var inputUrl = '/xbmcCmds/xbmcHttp?command=execmusicdatabase(INSERT INTO albuminfo (idAlbum, iYear, idGenre) VALUES ("'+record.data.albumid+'", "'+record.data.year+'", "'+record.data.genre+'""))';
        //XBMCExecSql(inputUrl);
        record.data.scraperInfo = true;
    }
}

function getMusicCoverList(str, r) {

    var result = [];
    if (str === '' || str === undefined ) return result;

    if (str.match('<thumb><thumb>') === null) {
        str = '<test>'+str+'</test>';
    }
    str = str.replace(/\n/g,'');

    if (window.DOMParser)
     {
      parser=new DOMParser();
      xmlDoc=parser.parseFromString(str,'text/xml');
     }
    else // Internet Explorer
     {
      xmlDoc=new ActiveXObject('Microsoft.XMLDOM');
      xmlDoc.async='false';
      xmlDoc.loadXML(str);
     }

     var MasterUrl = getTagAttribute(xmlDoc.documentElement, 'url');
     if (MasterUrl === null){ MasterUrl = '';}
     for (var i=0 ; i < xmlDoc.documentElement.childNodes.length; i++) {
        var downloadUrl = MasterUrl + xmlDoc.getElementsByTagName('thumb')[i].childNodes[0].nodeValue;
        var previewUrl = xmlDoc.getElementsByTagName('thumb')[i].getAttribute('preview');
        if (previewUrl === '' || previewUrl === null) { previewUrl = downloadUrl;}
            else { previewUrl = MasterUrl + previewUrl;}
        // need to change preview url for impawards links
        if (previewUrl.match('impaward') !== null) {previewUrl = previewUrl.replace(/posters\//g,'thumbs/imp_');}

        result.push([previewUrl, downloadUrl, 'Remote', '']);
    }
     return result;
}

function getTagAttribute(xmlString, tag) {
    var temp ="";
    for (var i=0 ; i < xmlString.attributes.length; i++) {
        if (xmlString.attributes[i].nodeName == tag) {
            temp = xmlString.attributes[i].nodeValue
        }
    }
    return temp;
}

function GetAlbumDetails(r) {

    var jsonResponse = xbmcJsonRPC('{"jsonrpc": "2.0", "method": "AudioLibrary.GetAlbumDetails", "params": {"albumid": '+r.data.albumid+', "properties": ["title", "genre", "year", "rating", "theme", "mood", "style", "type", "description", "albumlabel"]}, "id": 1}');

    XWMM.util.merge2Objects(r.data, jsonResponse.albumdetails);

    r.data.currentThumbnail = '/image/' + encodeURI(r.data.currentThumbnail);
    r.data.details = true;
}
