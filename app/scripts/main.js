var calculateNewSize = function(newPosition, elemLeftPosition, elemSize, side) {
  'use strict';

  var newSize,
      rightPosition,
      leftPosition;


  if (side === 'left') {
    rightPosition = elemLeftPosition + elemSize;
    leftPosition = newPosition;
  }else {
    rightPosition = newPosition;
    leftPosition = elemLeftPosition;
  }
  newSize = rightPosition - leftPosition;

  console.log('element final position ---> ' + rightPosition);
  console.log('element new size ---> ' + newSize);

  return newSize;
};

var createSibling = function(element, size, position) {
  'use strict';
  var sizeClass = 'small-' + size;
  var sibling = $('<div>', {class: 'columns end ' + sizeClass});
  sibling.html(size);

  var row = element.parent('.row');
  if (position === 'left') {
    row.prepend(sibling);
  }else {
    row.append(sibling);
  }
  initResizable(sibling);
};

var resizeElement = function(element, newSize) {
  'use strict';

  // remove the class that defines the current size
  var classList = element.attr('class').split(/\s+/);
  $.each( classList, function(index, clazz){
    if (clazz.indexOf('small-') > -1 && clazz.lastIndexOf('-') === 5) {
      console.log('class size ---> ', clazz);
      element.removeClass(clazz);
    }
  });

  // add the class for the new size
  element.addClass('small-' + newSize);
};

var handleResizeDrop = function(elem, ui, gridSize, side) {
  'use strict';

  //console.log('numColumns ----> ' + (parseInt(element.width() / gridSize, 10) + 1));
  //console.log('initial position ----> ' + parseInt(element.position().left / gridSize, 10));
  console.log('cursor position ---->' + (parseInt(ui.offset.left / gridSize, 10) - 1));

  // get position and size of the element in the row
  var newPosition = (parseInt(ui.offset.left / gridSize, 10) - 1);
  var elemSize = (parseInt(elem.width() / gridSize, 10) + 1);
  var elemLeftPosition = (parseInt(elem.position().left / gridSize, 10));

  // calculate the new size for the element
  var newSize = calculateNewSize(newPosition, elemLeftPosition, elemSize, side);
  resizeElement(elem, newSize);

  // resize the sibling or create a new one
  var siblings = elem.siblings();
  var siblingSize = 12 - newSize;
  // there are no siblings, have to create new element
  if (siblings.length === 0) {
    createSibling(elem, siblingSize, side);
  } else {
    resizeElement(siblings.first(), siblingSize);
  }

  // destroy and recreate the resize behaviour for the column
  // to reflect the new sizes//
  setTimeout(function() {
    $(ui.draggable).draggable('destroy');
    enableResizable(elem);
  }, 0);
};

var enableResizable = function(element) {
  'use strict';

  var parentRow = element.parent('.row');
  var gridSize = parentRow.width() / 12;

  var leftIcon = element.find('.left-icon-resize');
  var rightIcon = element.find('.right-icon-resize');

  leftIcon.draggable({
    revert: true,
    revertDuration: 100,
    grid: [gridSize],
    helper: 'clone',
    axis: 'x',
    containment: parentRow,
    stop: function( event, ui ) {
      handleResizeDrop(element, ui, gridSize, 'left');
    }
  });

  rightIcon.draggable({
    revert: true,
    revertDuration: 100,
    grid: [gridSize],
    helper: 'clone',
    axis: 'x',
    containment: parentRow,
    stop: function( event, ui ) {
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



$(function() {
  'use strict';

  // setup resizing
  $('#container').find('.columns').each(function(index, element) {
    initResizable(element);
  });
});
