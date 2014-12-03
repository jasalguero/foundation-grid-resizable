$(function() {
  'use strict';

  window.FF_CONFIG = {

    // used to identify the icons from other elements when checking if a row/column is empty
    ICON_CLASS: 'icon',

    // nesting level allowed: (e.g. 1 = container + row + nested row)
    MAX_NESTING_ALLOWED: 1,

    // error margin to calculate the position of the helper regarding the borders
    POSITION_CALCULATION_ERROR: 5
  };

  // setup resizing of the columns
  $('#container .row').find('.columns').each(function(index, element) {
    setupResizable(element);
  });

  // setup drop areas
  var droppables = $('#container .row, #container');
  droppables.each(function(index, elem) {
    setupDroppable($(elem));
  });

  // setup the trash area
  var $trash = $('.trash');
  setupTrash($trash);

  // setup the columns elements to be dragged
  var draggables = $('#container .row .columns, .draggable');
  draggables.each(function(index, elem) {
    setupDraggable($(elem));
  });

  // setup the row containers to allow sorting
  var sortableContainers = $('#container, #container .columns:has(.row)');
  sortableContainers.each(function(index, elem) {
    setupSortable($(elem));
  });
});
