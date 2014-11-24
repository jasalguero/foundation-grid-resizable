$(function() {
  'use strict';

  // setup resizing
  $('#container').find('.columns').each(function(index, element) {
    setupResizable(element);
  });

  var droppables = $('#container .row, #container .columns:has(.row)');
  droppables.each(function(index, elem) {
    setupDroppable($(elem));
  });

  var draggables = $('#container .columns');
  draggables.each(function(index, elem) {
    setupDraggable($(elem));
  });

  var sortableContainers = $('#container, #container .columns:has(.row)');
  sortableContainers.each(function(index, elem) {
    setupSortable($(elem));
  });
});
