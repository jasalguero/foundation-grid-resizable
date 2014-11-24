


var recalculateRow = function(row) {
  'use strict';

  var children = row.find('.columns');

  if (children.length > 0) {
    var child = children.first();

    resizeElement(child, 12);
  } else {
    row.remove();
  }
};

var insertElementInRow = function(row, element, position) {
  'use strict';

  var childColumns = row.find('.columns'),
      sibling;

  if (childColumns.length > 1) {
    // group everything into a nested row
    sibling = $('<div>', {class: 'small-6 columns end'});

    var replacementRow = $('<div>', {class: 'row display'});
    row.replaceWith(replacementRow);

    sibling.append(row);
    replacementRow.append(sibling);

    setupDroppable(replacementRow);
    setupSortable(replacementRow.parent());
    setupSortable(sibling);
  } else {
    sibling = childColumns.first();
  }

  if (position === 'left') {
    element.insertBefore(sibling);
  } else {
    element.insertAfter(sibling);
  }

  resizeElement(element, 6);
  enableResizable(element);


  resizeElement(sibling, 6);
  setupDraggable(sibling);
  setupResizable(sibling);

  sibling.find('.columns').each(function(index, elem) {
    enableResizable($(elem));
  });

};


var handleElementDroppedInRow = function(container, element, helper) {
  'use strict';

  var containerLeft = element.offset().left;
  var containerRight = element.offset().left + element.width();
  var distanceToLeft = helper.offset().left - containerLeft;
  var distanceToRight = containerRight - (helper.offset().left + helper.width());
  var oldRow = element.parent('.row');

  var position = 'right';
  if (distanceToLeft <= distanceToRight) {
    position = 'left';
  }
  console.log('Position --> ' + position);

  insertElementInRow(container, element, position);

  recalculateRow(oldRow);
};


var setupSortable = function(element) {
  'use strict';

    element.find('.row').each(function(index, elem) {
      if ($(elem).children('.drag-handle-sortable').length === 0) {
        var row = $(elem);
        var dragIcon = $('<i>', {class: 'fa fa-arrows drag-handle drag-handle-sortable'});
        row.prepend(dragIcon);
      }
    });

    element.sortable({
      cancel: 'input, textarea, button, select, option',
      connectWith: '.columns',
      handle: '.drag-handle-sortable',
      items: '> .row',
      placeholder: 'drag-placeholder',
      forcePlaceholderSize: true,
      opacity: 0.5,
      containment: '#containment-area',
      distance: 4,
      remove: function() {
        if (element.find('.row').length === 0) {
          var parentRow = element.parent('.row');
          element.remove();
          recalculateRow(parentRow);
        }
      }
    });
};

var setupDraggable = function(element) {
  'use strict';

  if (element.children('.drag-handle-draggable').length === 0){
    var dragIcon = $('<i>', {class: 'fa fa-bars drag-handle drag-handle-draggable'});
    element.prepend(dragIcon);
  }

  element.draggable({
    handle: '.drag-handle-draggable',
    helper: function() {
      return $('<div>', {class: 'component-drag-helper'});
    },
    //helper: 'clone',
    opacity: 0.5,
    cancel: '> .row',
    cursorAt: {right: 0, top: 0},
    cursor: 'pointer'
    //stop: function(event, ui) {
    //  setTimeout(function() {
    //    $(ui.draggable).draggable('destroy');
    //  }, 0);
    //}
    //containment: '#containment-area'
  });
};

var setupDroppable = function(element) {
  'use strict';

  element.droppable({
    //activeClass: 'droppable-active',
    hoverClass: 'droppable-hover',
    accept: '#container .columns',
    greedy: true,
    drop: function(event, ui) {

      if (element.hasClass('row') && ui.draggable.parent()[0] !== element[0]) {
        handleElementDroppedInRow(element, ui.draggable, ui.helper);
      }
    }
  });
};
