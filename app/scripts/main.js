$(function() {
  'use strict';

  // setup resizing
  $('#container').find('.columns').each(function(index, element) {
    initResizable(element);
  });

  initDraggable();
});
