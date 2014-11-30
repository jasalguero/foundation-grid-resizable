$(function() {
  'use strict';

  // CONFIGURATION
  window.FF_CONFIG = {

    // used to identify the icons from other elements when checking if a row/column is empty
    ICON_CLASS: 'icon',

    MAX_NESTING_ALLOWED: 1,

    POSITION_CALCULATION_ERROR: 5
  };

  // setup resizing
  $('#container .row').find('.columns').each(function(index, element) {
    setupResizable(element);
  });

  //var droppables = $('#container .row, #container .columns:not(:has(.row))');
  var droppables = $('#container .row, #container');
  droppables.each(function(index, elem) {
    setupDroppable($(elem));
  });

  var $trash = $('.trash');
  setupTrash($trash);

  var draggables = $('#container .row .columns, .draggable');
  draggables.each(function(index, elem) {
    setupDraggable($(elem));
  });

  var sortableContainers = $('#container, #container .columns:has(.row)');
  sortableContainers.each(function(index, elem) {
    setupSortable($(elem));
  });
});
