/**
 * Check if the passed row is already in the maximum nesting allowed
 * @param row
 * @returns {boolean}
 */
var isNewNestingAllowed = function(row) {
  'use strict';

  // nesting level of the current row
  var currentDeepestNesting = row.parentsUntil('#container', '.row').length;

  // calculate the nesting of the leaves
  row.find('.row').each(function(index, childRow) {
    var nestLevel = $(childRow).parentsUntil('#container', '.row').length;

    currentDeepestNesting = Math.max(currentDeepestNesting, nestLevel);
  });

  var allowed = (window.FF_CONFIG.MAX_NESTING_ALLOWED > currentDeepestNesting);
  if (!allowed) {
    console.log('Max nesting reached, new row not allowed');
  }

  return allowed;
};


/**
 * Get the closest row parent or
 * the div with id container if there is none
 * @param elem
 * @returns {*}
 */
var getRowContainer = function(elem) {
  'use strict';

  var rowContainer = null;
  var parent = elem.parent();
  if (parent.attr('id') === 'container') {
    console.log('on the parent container, which is special');
    rowContainer = parent;
  } else if (parent.hasClass('row')) {
    rowContainer = parent;
  } else {
    rowContainer = parent.parent('.row');
  }

  return rowContainer;
};

/**
 * Cleans a column in the following cases:
 * - has no rows -> removes it
 * - has 1 row -> replaces its parent with his child row
 * to avoid having 1 row containing 1 column containing 1 row
 *
 * Otherwise does nothing
 * @param column
 */
var cleanColumn = function(column) {
  'use strict';

  var parentRow = getRowContainer(column),
      childrenRows = column.children('.row');

  if (childrenRows.length === 0) {
    console.log('after reorder the old row is empty, cleaning');
    column.remove();

    if (parentRow.attr('id') !== 'container') {
      recalculateRow(parentRow);
    }
  } else if (childrenRows.length === 1) {
    console.log('after reorder the old row has only one, cleaning');
    var onlyChildRow = childrenRows.first();
    parentRow.replaceWith(onlyChildRow);
    setupDroppable(onlyChildRow);
    setupSortable(onlyChildRow);
  }
};

/**
 * Clean a row resizing or removing it depending on the children columns
 * @param row
 */
var recalculateRow = function(row) {
  'use strict';

  if (row.length !== 0) {

    var childColumns = row.children('.columns');

    if (childColumns.length > 0) {
      console.log('Row has ' + childColumns.length + ' columns');
      var existingColumn = childColumns.first();
      var nestedRows = existingColumn.children('.row');

      if (nestedRows.length === 1) {
        console.log('Child column has nested rows');
        row.replaceWith(nestedRows.first());
      } else {
        console.log('Child column does not have rows');
        resizeElement(existingColumn, 12); // jshint ignore:line
      }

      setupDroppable(row);
    } else {

      // check if is the last row of the container
      var parentRow = getRowContainer(row);

      console.log('Row is empty, removing');

      row.remove();
      // go recursively through all the parents until the container
      if (parentRow.attr('id') !== 'container') {
        recalculateRow(parentRow);
      }
      //}
    }
  }
};

/**
 * Insert a new element in a row in position above or below
 * @param row
 * @param element
 * @param position
 */
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

    if (isNewNestingAllowed(row)) {
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
  }

  resizeElement(element, 12);
  enableResizable(element);
  setupDraggable(element);
  setupDroppable(rowForNewContent);
  setupSortable(rowForNewContent.parent('.columns'));

};


/**
 * Insert a new element in a row from the side
 * @param row
 * @param element
 * @param position
 */
var insertElementInRowSide = function(row, element, position) {
  'use strict';

  var childColumns = row.find('.columns'),
      sibling;

  if (isNewNestingAllowed(row) || childColumns.length === 1) {
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
  }
};

/**
 * Calculate if the position of the helper matches any of the border of the container where the helper is hovering
 * @param container
 * @param helper
 * @returns {*}
 */
var calculatePositionDropped = function(container, helper) {
  'use strict';

  var position = null,
      error = window.FF_CONFIG.POSITION_CALCULATION_ERROR;

  // compare the helper offset with the child columns offset
  if (Math.abs(Math.abs(helper.offset().left) - Math.abs(container.offset().left)) < error) {
    position = 'left';
  } else if (Math.abs(Math.abs(helper.offset().left + helper.outerWidth()) - Math.abs((container.offset().left + container.outerWidth()))) < error) {
    position = 'right';
  } else if (Math.abs(Math.abs((helper.offset().top) - Math.abs(container.offset().top))) < error) {
    position = 'above';
  } else if (Math.abs(Math.abs(helper.offset().top + helper.outerHeight()) - Math.abs((container.offset().top + container.outerHeight()))) < error) {
    position = 'under';
  }

  return position;
};


function insertElementInContainer(container, element, position) {
  console.log('element dropped in container');
  var $row = $('<div>', {class: 'row display'});
  $row.append(element);

  // position can only be above or under
  if (position === 'under') {
    container.append($row);
  } else {
    container.prepend($row);
  }

  resizeElement(element, 12);
  enableResizable(element);
  setupDraggable(element);
  setupDroppable($row);
  setupSortable(container);
}


/**
 * Callback function for handling the dropping of the element inside a row
 * @param container
 * @param element
 * @param helper
 */
var handleElementDroppedInRow = function(container, element, helper) {
  'use strict';

  var position = calculatePositionDropped(container, helper);

  if (container.attr('id') === 'container') {
    insertElementInContainer(container, element, position);
  } else {

    if (position === null) {
      console.log('element not dropped near borders, defaulting to above');
      position = 'above';
    }

    console.log('Element dropped in a row, ' + position);
    if (position === 'right' || position === 'left') {
      insertElementInRowSide(container, element, position);
    } else {
      insertElementInRowAboveOrBelow(container, element, position);
    }
  }
};


/**
 * Setup the element to have its direct children .row element sortable
 * @param element
 */
var setupSortable = function(element) {
  'use strict';

  element.find('.row').each(function(index, elem) {
    if ($(elem).children('.drag-handle-sortable').length === 0) {
      var row = $(elem);
      var dragIcon = $('<i>', {class: 'fa fa-arrows icon drag-handle drag-handle-sortable'});
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
    distance: 4,
    remove: function() {
      cleanColumn(element);
    }
  });
};


/**
 * Setup the element to be draggable
 * @param element
 */
var setupDraggable = function(element) {
  'use strict';

  if (element.children('.drag-handle-draggable').length === 0) {
    var dragIcon = $('<i>', {class: 'fa fa-bars icon drag-handle drag-handle-draggable'});
    element.prepend(dragIcon);
  }

  element.draggable({
    handle: '.drag-handle-draggable',
    helper: function() {
      return $('<div>', {class: 'component-drag-helper'});
    },
    opacity: 0.5,
    cancel: '> .row',
    cursorAt: {right: 0, top: 0},
    cursor: 'pointer',
    snap: '.ui-droppable:not(.trash)',
    snapMode: 'inner',
    snapTolerance: 40,
    revert: 'invalid',

    drag: function(event, ui) {

      var $container = $('.droppable-hover'),
          position = null;

      if ($container.length === 1) {
        position = calculatePositionDropped($container, ui.helper);

        console.log('position of the helper: ' + position);

        // remove all hover position classes
        $container.removeClass(function(index, clazz) {
          return (clazz.match(/(^|\s)hover-position-\S+/g) || []).join(' ');
        });

        if (position !== null) {
          $container.addClass('hover-position-' + position);
        }
      }
    }
  });
};

/**
 * Setup the element to be droppable
 * @param element
 */
var setupDroppable = function(element) {
  'use strict';

  element.droppable({
    activeClass: 'droppable-active',
    hoverClass: 'droppable-hover',
    accept: '#container .columns, .draggable',
    greedy: true,
    drop: function(event, ui) {

      if ((element.hasClass('row') || element.attr('id') === 'container') && ui.draggable.parent()[0] !== element[0]) {

        var elem = ui.draggable,
            isNewElem = false;

        if (ui.draggable.hasClass('draggable')) {
          elem = ui.draggable.clone();
          elem.removeClass('draggable');
          setupResizable(elem);
          isNewElem = true;
        }

        var previousContainer = elem.parent('.row');

        var parentColumn = previousContainer.parent('.columns');


        handleElementDroppedInRow(element, elem, ui.helper);

        if (!isNewElem) {
          console.log('Cleaning previous container row');
          recalculateRow(previousContainer);

          // check if the column has anything but the icon classes
          if (parentColumn.length !== 0 && parentColumn.children(':not(.' + FF_CONFIG.ICON_CLASS + ')').length === 0) {
            cleanColumn(parentColumn);
          }
        }
      }
    }
  });
};

/**
 * Setup the trash to accept draggable element and delete them
 * @param element
 */
var setupTrash = function(element) {
  'use strict';

  element.droppable({
    activeClass: 'trash-active',
    hoverClass: 'trash-hover',
    accept: '#container .columns, .draggable',
    greedy: true,
    drop: function(event, ui) {
      var previousContainer = ui.draggable.parent('.row');
      ui.draggable.remove();
      console.log('Cleaning previous container row');
      recalculateRow(previousContainer);
    }
  });
};
