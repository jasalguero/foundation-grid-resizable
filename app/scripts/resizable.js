/**
 * Extract the current size and foundation class type of the element
 * @param element
 * @returns {{size: number, type: string}}
 */
var extractSizeAndType = function(element) {
  'use strict';

  var result = {
    size: 1,
    type: 'small'
  };

  var classList = element.attr('class').split(/\s+/);
  $.each(classList, function(index, clazz) {
    if (clazz.indexOf('small-') > -1 && clazz.lastIndexOf('-') === 5) {
      result.size = parseInt(clazz.split('-')[1], 10);
    } else if (clazz.indexOf('medium-') > -1 && clazz.lastIndexOf('-') === 5) {
      result.size = parseInt(clazz.split('-')[1], 10);
      result.type = 'medium';
    } else if (clazz.indexOf('large-') > -1 && clazz.lastIndexOf('-') === 5) {
      result.size = parseInt(clazz.split('-')[1], 10);
      result.type = 'large';
    }
  });

  return result;
};

/**
 * Calculate the new size of the element based in its current left and right limits
 * and which resizing icon was dragged
 * @param newPosition
 * @param elemLeftPosition
 * @param elemSize
 * @param side
 * @returns {number}
 */
var calculateNewSize = function(newPosition, elemLeftPosition, elemSize, side) {
  'use strict';

  var newSize,
      rightPosition,
      leftPosition;

  if (side === 'left') {
    rightPosition = elemLeftPosition + elemSize;
    leftPosition = newPosition;
  } else {
    rightPosition = newPosition;
    leftPosition = elemLeftPosition;
  }
  newSize = Math.min(Math.max((rightPosition - leftPosition), 1), 11);

  console.log('element final position ---> ' + rightPosition);
  console.log('element new size ---> ' + newSize);

  return newSize;
};

/**
 * Insert another columns object in the row with complementing
 * size of the current one
 * @param element
 * @param size
 * @param position
 * @param sizeType
 */
var createSibling = function(element, size, position, sizeType) {
  'use strict';

  if (size > 0) {
    var sizeClass = sizeType + '-' + size;
    var sibling = $('<div>', {class: 'columns end ' + sizeClass});
    sibling.html(size);

    var row = element.parent('.row');
    if (position === 'left') {
      row.prepend(sibling);
    } else {
      row.append(sibling);
    }

    setupDraggable(sibling);
    setupResizable(sibling);
  }
};

/**
 * Sets the new size for the element maintaining its current foundation size class
 * @param element
 * @param newSize
 */
var resizeElement = function(element, newSize) {
  'use strict';

  if (newSize === 0) {
    element.remove();
    console.log('Element new size 0, removed');
  } else {
    var extracted = extractSizeAndType(element);

    element.removeClass(extracted.type + '-' + extracted.size);
    // add the class for the new size
    element.addClass(extracted.type + '-' + newSize);

    console.log('Element new size: ' + extracted.type + '-' + newSize);
  }
};

/**
 * Extract the current size foundation class used by the element
 * @param elem
 * @param elemSize
 * @returns {string}
 */
var getSizeTypeFromElem = function(elem, elemSize) {
  'use strict';

  // default to large if the other options are not present
  var sizeType = 'large';

  if (elem.hasClass('small-' + elemSize)) {
    sizeType = 'small';
  } else if (elem.hasClass('medium-' + elemSize)) {
    sizeType = 'medium';
  }

  return sizeType;
};

/**
 * Based on the icon's position determines the new size of the columns object
 * and calls for the resizing of it and its sibling, if there is
 * @param elem
 * @param ui
 * @param gridSize
 * @param side
 */
var handleResizeDrop = function(elem, ui, gridSize, side) {
  'use strict';

  console.log('numColumns ----> ' + (parseInt($(elem).width() / gridSize, 10) + 1));
  console.log('initial position ----> ' + parseInt($(elem).position().left / gridSize, 10));
  console.log('cursor position ---->' + (parseInt(ui.offset.left / gridSize, 10) - 1));

  // get position and size of the element in the row
  var parentOffset = elem.parent('.row').offset();
  var newPosition = (parseInt((ui.offset.left - parentOffset.left) / gridSize, 10));
  var elemSize = (parseInt(elem.width() / gridSize, 10) + 1);
  var elemLeftPosition = (parseInt(elem.position().left / gridSize, 10));

  // calculate the new size for the element
  var newSize = calculateNewSize(newPosition, elemLeftPosition, elemSize, side);

  var sizeType = getSizeTypeFromElem(elem, elemSize);

  var hasSiblings = elem.siblings('.columns').length > 0;
  var siblingSize = 12 - newSize;

  // there are no siblings, have to create new element
  if (!hasSiblings) {
    console.log('creating sibling with size ' + newSize);
    createSibling(elem, siblingSize, side, sizeType);
  } else {
    console.log('resizing sibling with size ' + (12 - elemSize));
    resizeElement(elem.siblings('.columns').first(), siblingSize);
  }

  resizeElement(elem, newSize);

  if (newSize !== 0) {
    // destroy and recreate the resize behaviour for the column
    // to reflect the new sizes//
    setTimeout(function() {
      $(ui.draggable).draggable('destroy');
      enableResizable(elem);
    }, 0);
  }
};

/**
 * Use the inserted icons as handles to manage the resizing
 * @param element
 */
var enableResizable = function(element) {
  'use strict';

  var parentRow = element.parent('.row');

  // make the grid that will defined the steps for the positions based in the container row
  var gridSize = parentRow.width() / 12;

  var leftIcon = element.find('.left-icon-resize');
  var rightIcon = element.find('.right-icon-resize');

  leftIcon.draggable({
    revert: true,
    revertDuration: 100,
    grid: [gridSize],
    helper: function() {
      return $('<i>', {class: 'fa fa-arrows-h icon left-icon-resize resize-handler resize-handler-active'});
    },
    axis: 'x',
    containment: parentRow,
    stop: function(event, ui) {
      handleResizeDrop(element, ui, gridSize, 'left');
    }
  });

  rightIcon.draggable({
    revert: true,
    revertDuration: 100,
    grid: [gridSize],
    helper: function() {
      return $('<i>', {class: 'fa fa-arrows-h icon right-icon-resize resize-handler resize-handler-active'});
    },
    axis: 'x',
    containment: parentRow,
    stop: function(event, ui) {
      handleResizeDrop(element, ui, gridSize, 'right');
    }
  });

  element.find('.columns').each(function(index, elem) {
    enableResizable($(elem));
  });
};


/**
 * Insert the icons in the element and call the setup
 * @param elem
 */
var setupResizable = function(elem) {
  'use strict';

  var element = $(elem);
  var leftIcon = $('<i>', {class: 'fa fa-arrows-h icon left-icon-resize resize-handler'});
  var rightIcon = $('<i>', {class: 'fa fa-arrows-h icon right-icon-resize resize-handler'});

  element.prepend(leftIcon);
  element.append(rightIcon);

  enableResizable(element);
};
