var cleanRowsForEmpties = function(row) {
  'use strict';

  var parentContainer = row.parent('.row'),
      childrenRows = row.children('.row');

  if (parentContainer.length === 0) {
    console.log('on the parent container, which is special');
    parentContainer = $('#container');
  }

  if (childrenRows('.row').length === 0) {
    console.log('after reorder the old row is empty, cleaning');
    row.remove();
    recalculateRow(parentContainer);
  } else if (childrenRows.length === 1) {
    console.log('after reorder the old row has only one, cleaning');
    var onlyChildRow = childrenRows.first();
    row.replaceWith(onlyChildRow);
    setupDroppable(onlyChildRow);
    setupSortable(parentContainer);
  }

  // go recursively through all the parents until the container
  if (parentContainer.attr('id') !== 'container') {
    cleanRowsForEmpties(parentContainer);
  }
};

var recalculateRow = function(row) {
  'use strict';

  var childColumns = row.children('.columns');

  if (childColumns.length > 0) {
    console.log('Row has ' + childColumns.length + ' columns');
    var existingColumn = childColumns.first();
    var nestedRows = existingColumn.children('.row');

    if (nestedRows.length !== 0) {
      console.log('Child column has nested rows');
      row.replaceWith(nestedRows.first());
    } else {
      console.log('Child column does not have rows');
      resizeElement(existingColumn, 12);
    }
  } else {
    console.log('Row is empty, removing');
    row.remove();
  }
};

var insertElementInRowAboveOrBelow = function(row, element, position) {
  'use strict';

  var existingColumns = row.children('.columns'),
      nestedRows = existingColumns.children('.row'),
      rowForNewContent = $('<div>', {class: 'row display'});

  if ((existingColumns.length === 1) && (nestedRows.length !== 0)) {
    console.log('row has only 1 column object with nested rows, appending it to the existing rows');
    rowForNewContent.append(element);

    if (position === 'above') {
      rowForNewContent.insertBefore(nestedRows.first());
    } else {
      rowForNewContent.insertAfter(nestedRows.last());
    }

  } else {
    console.log('wrapping the existing content of the row in a nested one and appending the new element');

    var newContainerRow = $('<div>', {class: 'row display'});
    var newColumn = $('<div>', {class: 'small-12 columns end'});

    rowForNewContent.append(element);
    row.replaceWith(newContainerRow);

    if (position === 'above') {
      newColumn.append(rowForNewContent);
      newColumn.append(row);
    } else {
      newColumn.append(row);
      newColumn.append(rowForNewContent);
    }
    newContainerRow.append(newColumn);
    setupResizable(newColumn);
    setupDraggable(newColumn);

    setupDroppable(newContainerRow);
    setupDroppable(rowForNewContent);
    setupDroppable(row);
    setupSortable(newContainerRow.parent());

    row.find('.columns').each(function(index, elem) {
      enableResizable($(elem));
      setupDraggable($(elem));
    });
  }

  resizeElement(element, 12);
  enableResizable(element);
  setupDraggable(element);
  setupDroppable(rowForNewContent);
  setupSortable(rowForNewContent.parent('.columns'));

};


var insertElementInRowSide = function(row, element, position) {
  'use strict';

  var childColumns = row.find('.columns'),
      sibling;

  if (childColumns.length > 1) {
    // group everything into a nested row
    sibling = $('<div>', {class: 'small-6 columns end'});

    var newRow = $('<div>', {class: 'row display'});
    row.replaceWith(newRow);

    sibling.append(row);
    newRow.append(sibling);

    setupDroppable(newRow);
    setupDroppable(row);
    setupSortable(newRow.parent());
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
  setupDraggable(element);


  resizeElement(sibling, 6);
  setupResizable(sibling);
  setupDraggable(sibling);

  sibling.find('.columns').each(function(index, elem) {
    enableResizable($(elem));
    setupDraggable($(elem));
    setupSortable($(elem));
  });

};

calculatePositionDropped = function(container, element, helper) {
  'use strict';

  var position = 'right',
      firstColumn = container.children('.columns').first(),
      lastColumn = container.children('.columns').last(),
      // need the padding bottom to calculate properly the offset respect to the last element
      paddingBottom = parseInt((container.innerHeight() - container.height()) / 2, 10);


  // compare the helper offset with the child columns offset
  if (helper.offset().left < firstColumn.offset().left) {
    position = 'left';
  } else if ((helper.offset().left + helper.width()) > (lastColumn.offset().left + lastColumn.width())) {
    position = 'right';
  } else if (helper.offset().top < firstColumn.offset().top) {
    position = 'above';
  } else if (helper.offset().top > (firstColumn.offset().top + firstColumn.height() - paddingBottom)) {
    position = 'under';
  }

  //console.log('Helper offset -->' + JSON.stringify(helper.offset()));
  //console.log('Helper width -->' + JSON.stringify(helper.offset()));
  //console.log('Container Left --> ' + containerLeft);
  //console.log('Container Right --> ' + containerRight);
  //console.log('Distance To Left --> ' + distanceToLeft);
  //console.log('Distance To Right --> ' + distanceToRight);

  return position;
};


var handleElementDroppedInRow = function(container, element, helper) {
  'use strict';

  var previousContainer = element.parent('.row'),
      position = calculatePositionDropped(container, element, helper);

  console.log('Element dropped in a row, ' + position);
  if (position === 'right' || position === 'left') {
    insertElementInRowSide(container, element, position);
  } else {
    insertElementInRowAboveOrBelow(container, element, position);
  }

  console.log('Cleaning previous container row');
  recalculateRow(previousContainer);
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
      cleanRowsForEmpties(element);
    }
  });
};

var setupDraggable = function(element) {
  'use strict';

  if (element.children('.drag-handle-draggable').length === 0) {
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
    cursor: 'pointer',
    snap: '.ui-droppable',
    snapMode: 'inner'
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
    accept: '#container .columns, .draggable',
    greedy: true,
    drop: function(event, ui) {


      if (element.hasClass('row') && ui.draggable.parent()[0] !== element[0]) {

        if (ui.draggable.hasClass('draggable')) {
          ui.draggable.removeClass('draggable');
          setupResizable(ui.draggable);
        }

        handleElementDroppedInRow(element, ui.draggable, ui.helper);
      }
    }
  });
};
