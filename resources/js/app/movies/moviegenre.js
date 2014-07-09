var MovieRecord = Ext.data.Record.create([
    { name: 'movieid' },
    { name: 'Movietitle', mapping: 'title' },
    { name: 'watched', mapping: 'playcount' },
    { name: 'set' },
    { name: 'year' }
]);

var sortArticles = docCookies.getItem('sortArticles') === '1';
var storeMovie = new Ext.data.Store({
    autoLoad: true,

    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovies',
            params: {
                properties: [
                    'title', 'year', 'playcount', 'set'
                ],
                sort: {
                    order: 'ascending',
                    ignorearticle: sortArticles,
                    method: 'sorttitle'
                }
            },
            id: 'XWMM'
        }
    }),
    reader: new Ext.data.JsonReader({ root: 'result.movies' }, MovieRecord)
});

var movieGrid = new Ext.grid.GridPanel({
    title: 'Movies by Genre',
    id: 'Moviegrid',
    store: storeMovie,

    region: 'west',
    width: 285,
    frame: true,
    split: true,

    cm: movieColumnModel,
    autoExpandColumn: 'title',
    enableColumnResize: false,
    stripeRows: true,

    viewConfig: {
        headersDisabled: true
    },

    sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),

    listeners: {
        rowcontextmenu: function(grid, rowIndex, e) {
            e.stopEvent();
            gridContextMenu.showAt(e.getXY());
            return false;
        }
    },

    tbar: {
            xtype: 'toolbar',
            height: 30,
            items: [
                {
                    id: 'genreFilterCombo',
                    store: XWMM.video.genreStore,

                    xtype: 'combo',
                    name: 'label',
                    emptyText: 'Filter by genre...',
                    displayField: 'label',
                    mode: 'local',
                    triggerAction: 'all',
                    listeners: {
                        select: function(combo, record, index) {
                            storeMovie.proxy.conn.xbmcParams.params.filter = {
                                field: 'genre',
                                operator: 'contains',
                                value: record.data.label
                            };
                            storeMovie.load();
                        }
                    }
                }
            ]
        }
});