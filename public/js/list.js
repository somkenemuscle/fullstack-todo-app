let elementBeingDragged = null;
let draggables = document.querySelectorAll('.reorderable-list__item');
let dropzones = document.querySelectorAll('.dropzone');

/* Item-Being-Dragged Handlers */
let startDrag = (event) => {
  console.log('dragging started', event.target.innerHTML);
  // event.target.style.backgroundColor = "rebeccapurple";
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target.innerHTML);
  elementBeingDragged = event.target;
};

let stopDrag = (event) => {
  event.preventDefault();
  elementBeingDragged = null;
};

/* Dropzone Handlers */
let dragInto = (event) => {
  event.preventDefault();
  event.target.classList.add('-dropzone');
  console.log('dragInto');
};

let dragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

let dragOut = (event) => {
  event.preventDefault();
  console.log('dragOut');
  event.target.classList.remove('-dropzone');
};

let drop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  event.target.classList.remove('-dropzone');
  elementBeingDragged.innerHTML = event.target.innerHTML;
  event.target.innerHTML = event.dataTransfer.getData('text/html');
  
  
};



Array.prototype.forEach.call(dropzones, (dropzone => {
  dropzone.addEventListener('dragenter', dragInto);
  dropzone.addEventListener('dragover', dragOver);
  dropzone.addEventListener('dragleave', dragOut);
  dropzone.addEventListener('drop', drop);
}));
 
Array.prototype.forEach.call(draggables, (item => {
  item.addEventListener('dragstart', startDrag);
  item.addEventListener('dragend', stopDrag);
}));

