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

Ext.ns('PTVL');

var settingsFileRecord = Ext.data.Record.create([
    { name: 'file' },
    { name: 'label'}
]);

/*var settingsUrlRecord = Ext.data.Record.create([
    { name: 'path', mapping: '@path'}
]);

var settingsUrl = new Ext.data.Store({
    autoload: true,
    proxy: new Ext.data.XBMCProxy({
        jsonData: {
            jsonrpc: '2.0',
            method: 'Files.PrepareDownload',
            params: {
                path: 'special://profile/addon_data/script.pseudotv.live/settings2.xml'
            },
            id: 'path'
        }
    }),
    reader: new Ext.data.JsonReader({ root: 'result'}, settingsUrlRecord)
});*/

var settings = new Ext.data.GroupingStore({
    id: 'settingsStore',
    url: '/resources/js/app/ptvl/settings2.xml',
    autoload: false,
    reader: new Ext.data.XmlReader({
        record: '>setting',
        idProperty: '@id',
        fields: [
            {name: 'id', mapping: '@id'},
            {name: 'value', mapping: '@value'},
            {name: 'number'}
        ],
        groupField: 'number'
    })
});

settings.load();

settings.on('load', function(store, recs, opt){
    settings.each(function(record){
        var channel_id = record.get('id');
        channel_id = channel_id.split("_");
        record.set('number', channel_id[1]);
    });
}, this);

/*var settingsFile = new Ext.data.Store({
    autoload: true,
    proxy: new Ext.data.XBMCProxy({
        jsonData: {
            jsonrpc: '2.0',
            method: 'Files.GetDirectory',
            params: {
                media: 'files',
                directory: 'special://profile/addon_data/script.pseudotv.live',
                properties: ['file']
            },
            id: 'libDirectory'
        }
    }),
    reader: new Ext.data.JsonReader({ root: 'result.files' }, settingsFileRecord)
});*/

var channelgrid = new Ext.grid.GridPanel({
    id: 'channelsgrid',
    title: '<div align="center">Select a Channel</div>',
    store: settings,
    columns: [
        {header: "Id", width: 130, dataIndex: 'id', sortable: true},
        {header: 'Value', dataIndex: 'value'},
        {header: 'Channel Number', dataIndex: 'number'}
    ],
    view: new Ext.grid.GroupingView({
        forceFit:true,
        groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
    }),
    enableColumnResize: false,
    height: 750,
    stripeRows: true,
    sm: new Ext.grid.RowSelectionModel({ singleSelect: true })
});

var optionsPanel = new Ext.FormPanel({
    id: 'optionsPanel',
    title: '<div align="center">Select Options</div>',
    layout: 'form',
    frame: true,
    height: 220,
    items:[
        {
            xtype: 'checkboxgroup',
            columns: 2,
            items: [
                {boxLabel: 'Display Logo', name: 'ChkLogo'},
                {boxLabel: "Don't play this channel", name: 'ChkDontPlayChannel'},
                {boxLabel: 'Force random', name: 'ChkRandom'},
                {boxLabel: 'Force realtime', name: 'ChkRealTime'},
                {boxLabel: 'Force resume', name: 'ChkResume'},
                {boxLabel: 'Pause when not watching', name: 'ChkPause'},
                {boxLabel: 'Only play unwatched', name: 'ChkUnwatched'},
                {boxLabel: 'Play shows in order', name: 'ChkResume'},
                {boxLabel: 'Only play watched', name: 'ChkWatched'},
                {boxLabel: 'Exclude Strms', name: 'ChkIceLibrary'},
                {boxLabel: 'Exclude BCTs', name: 'ChkExcludeBCT'},
                {boxLabel: 'Disable ComingUp Popup', name: 'ChkPop'}
            ]
        },
        {
          xtype: 'spacer',
            height: 10
        },
        {
            xtype: 'textfield',
            bodyStyle: 'padding:15px',
            fieldLabel: 'Reset Every X Hours',
            name: 'reset'
        }
    ]
});

var channelDetailsPanel = new Ext.FormPanel({
    id: 'channelDetailsPanel',
    title: '<div align="center">Channel Settings</div>',
    layout: 'form',
    frame: true,
    labelAlign: 'left',
    labelWidth: 75,
    items:[
            {
                xtype: 'textfield',
                fieldLabel: 'Channel',
                style:'width: 100%',
                name: 'id'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Setting',
                style:'width: 100%',
                name: 'value'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Option',
                style:'width: 100%',
                name: 'libDirectory'
            }
        ]
});

PTVL.Mainpanel = new Ext.Panel({
    region: 'center',
    layout: 'border',

    frame: true,
    loadMask: true,

    items: [
        menuBar,
        {
            xtype: 'panel',
            region: 'west',
            collapsible: true,
            layout: 'fit',
            width: 320,
            frame: true,
            items: [
                        channelgrid
            ]
        },
        {
            xtype: 'panel',
            region: 'center',
            layout: 'vbox',
            layoutConfig: {align: 'stretch'},
            id: 'mainpanel',
            items: [
                channelDetailsPanel,
                optionsPanel
            ]
        }
    ],

    initEvents: function() {
        Ext.getCmp('channelsgrid').getSelectionModel().on('rowselect', this.channelSelect, this);
    },

    channelSelect: function(sm, rowIdx, record) {
        var channelDetailsPanel = Ext.getCmp('channelsgrid');
        updateChannelDetails(record);
    }
});
