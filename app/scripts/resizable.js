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
  newSize = Math.min(Math.max((rightPosition - leftPosition), 0), 12);

  console.log('element final position ---> ' + rightPosition);
  console.log('element new size ---> ' + newSize);

  return newSize;
};

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
    initResizable(sibling);
  }
};

var resizeElement = function(element, newSize, oldSize, sizeType) {
  'use strict';

  if (newSize === 0) {
    element.remove();
  } else {

    element.removeClass(sizeType + '-' + oldSize);
    // add the class for the new size
    element.addClass(sizeType + '-' + newSize);
  }
};

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

var handleResizeDrop = function(elem, ui, gridSize, side) {
  'use strict';

  //console.log('numColumns ----> ' + (parseInt(element.width() / gridSize, 10) + 1));
  //console.log('initial position ----> ' + parseInt(element.position().left / gridSize, 10));
  //console.log('cursor position ---->' + (parseInt(ui.offset.left / gridSize, 10) - 1));

  // get position and size of the element in the row
  var newPosition = (parseInt(ui.offset.left / gridSize, 10) - 1);
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
    resizeElement(elem.siblings('.columns').first(), siblingSize, 12 - elemSize, sizeType);
  }

  resizeElement(elem, newSize, elemSize, sizeType);

  if (newSize !== 0) {
    // destroy and recreate the resize behaviour for the column
    // to reflect the new sizes//
    setTimeout(function() {
      $(ui.draggable).draggable('destroy');
      enableResizable(elem);
    }, 0);
  }
};

var enableResizable = function(element) {
  'use strict';

  var parentRow = element.parent('.row');
  //var parentLimits = [parentRow.offset().left-10, parentRow.offset().top,
  //  parentRow.offset().left + parentRow.width(), parentRow.offset().top + parentRow.height()];

  var gridSize = parentRow.width() / 12;

  var leftIcon = element.find('.left-icon-resize');
  var rightIcon = element.find('.right-icon-resize');



  leftIcon.draggable({
    revert: true,
    revertDuration: 100,
    grid: [gridSize],
    helper: function() {
      return $('<i>', {class: 'fa fa-arrows-h left-icon-resize resize-handler resize-handler-active'});
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
      return $('<i>', {class: 'fa fa-arrows-h right-icon-resize resize-handler resize-handler-active'});
    },
    axis: 'x',
    containment: parentRow,
    stop: function(event, ui) {
      handleResizeDrop(element, ui, gridSize, 'right');
    }
  });
};


var initResizable = function(elem) {
  'use strict';

  var element = $(elem);
  var leftIcon = $('<i>', {class: 'fa fa-arrows-h left-icon-resize resize-handler'});
  var rightIcon = $('<i>', {class: 'fa fa-arrows-h right-icon-resize resize-handler'});

  element.prepend(leftIcon);
  element.append(rightIcon);

  enableResizable(element);
};
