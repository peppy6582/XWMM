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

var settingsUrlRecord = Ext.data.Record.create([
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
});


var settingsFile = new Ext.data.Store({
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
});


var SettingsPanel = new Ext.FormPanel({
    fileUpload: true,
    frame: true,
    title: '<div align="center">Settings</div>',
    autoHeight: true,
    defaults: {
        anchor: '95%',
        allowBlank: false,
        msgTarget: 'side'
    },
    items: [
        {
            xtype: 'button',
            text: 'Load',
            width: 10,
            height: 24,
            handler: function (btn, evt) { SettingsPanel.getForm().submit(); },
            listeners: {
                click: function () {
                    settingsFile.load();
                    settingsUrl.load();
                    settings.load();
                }
            }
        }
    ]
});


var grid = new Ext.grid.GridPanel({
    id: 'channelsgrid',
    store: settingsFile,
    columns: [
        {header: "File", width: 260, dataIndex: 'file', sortable: true},
        {header: 'Label', dataIndex: 'label'}
    ],
    enableColumnResize: false,
    height: 200,
    stripeRows: true,
    sm: new Ext.grid.RowSelectionModel({ singleSelect: true })
});


var settingsgrid = new Ext.grid.GridPanel({
    id: 'settingsgrid',
    store: settingsUrl,
    columns: [
        {header: "Path", width: 250, dataIndex: 'path', sortable: true}
    ],
    enableColumnResize: false,
    height:400,
    stripeRows: true,
    sm: new Ext.grid.RowSelectionModel({ singleSelect: true })
});

var channelDetailsPanel = new Ext.FormPanel({
    id: 'channelDetailsPanel',
    title: '<div align="center">Select a Channel</div>',

    region: 'center',

    frame: true,

    layout: 'table',
    layoutConfig: { columns: 2 },
    items:[
        {
            layout: 'form',
            labelWidth: 65,
            padding: '0 10px',
            defaults: {
                xtype: 'textfield',
                width: 400,
                listeners: {
                    change: function() {
                        Ext.getCmp('savebutton').enable();
                    }
                }
            },

            items: [
                {
                    fieldLabel: 'Channel',
                    name: 'id'
                },
                {
                    fieldLabel: 'Setting',
                    name: 'value'
                },
                {
                    fieldLabel: 'Settings2',
                    name: 'libDirectory'
                }
            ]
        }
    ]
});

var settings = new Ext.data.Store({
    proxy: new Ext.data.XBMCProxy({
        url: "http://localhost:8080/vfs/special%3a%2f%2fprofile%2faddon_data%2fscript.pseudotv.live%2fsettings2.xml",
        autoload: false,
        reader: new Ext.data.XmlReader({
            record: '>setting',
            idProperty: '@id',
            fields: [
                {name: 'id', mapping: '@id'},
                {name: 'value', mapping: '@value'}
            ]
        })
    })
 });

PTVL.Mainpanel = new Ext.Panel({
    region: 'center',
    layout: 'border',

    frame: true,
    loadMask: true,

    items: [
        {
            xtype: 'panel',
            region: 'east',
            split: true,
            width: 225,
            items: [{
                layout: 'accordion',
                height: 500,
                items: [

                ]
            }]
        },
        menuBar,
        {
            xtype: 'panel',
            region: 'west',

            layout: 'hbox',
            layoutConfig: {align: 'stretch'},
            width: 380,

            items: [
                {
                    xtype: 'panel',
                    flex: 1,

                    layout: 'vbox',
                    layoutConfig: {align: 'left'},

                    items: [
                        grid,
                        settingsgrid
                    ]
                },

            ]
        },
        {
            xtype: 'panel',
            region: 'center',
            id: 'mainpanel',
            items: [
                channelDetailsPanel,
                SettingsPanel
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
