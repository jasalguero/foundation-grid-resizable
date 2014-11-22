var initDraggable = function() {
  'use strict';

  var sortableContainers = $('#container, #container .columns:has(.row)');

  sortableContainers.find('.row').each(function(index, elem) {
    var element = $(elem);

    var dragIcon = $('<i>', {class: 'fa fa-arrows drag-icon'});
    element.prepend(dragIcon);
  });

  sortableContainers.sortable({
    cancel: 'input, textarea, button, select, option',
    connectWith: '.columns',
    handle: '.drag-icon',
    items: '> .row',
    placeholder: 'drag-placeholder',
    forcePlaceholderSize: true,
    opacity: 0.5,
    containment: '#containment-area',
    distance: 4
  });

  //$('.item-draggable').each(function(index, elem) {
  //  var element = $(elem);
  //
  //  var dragIcon = $('<i>', {class: 'fa fa-arrows drag-icon'});
  //  element.prepend(dragIcon);
  //
  //  //element.draggable({
  //  //  handle: '.drag-icon',
  //  //  connectToSortable: '#container, #container .columns',
  //  //  revert: 'invalid'
  //  //});
  //});

};
