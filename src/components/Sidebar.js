import React from 'react';

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="bg-gray-200 p-4">
      <div className="text-center text-lg font-semibold mb-4">Drag Nodes From Here</div>
      <div className="mb-2">
        <div className="text-center bg-white rounded-md shadow-md p-2 cursor-pointer"
             onDragStart={(event) => onDragStart(event, 'input')}
             draggable>
          Input Node
        </div>
      </div>
      <div className="mb-2">
        <div className="text-center bg-white rounded-md shadow-md p-2 cursor-pointer"
             onDragStart={(event) => onDragStart(event, 'default')}
             draggable>
          Default Node
        </div>
      </div>
      <div>
        <div className="text-center bg-white rounded-md shadow-md p-2 cursor-pointer"
             onDragStart={(event) => onDragStart(event, 'output')}
             draggable>
          Output Node
        </div>
      </div>
      <div className="mt-64">
        <h2>
          <b>Instructions:</b>
        </h2>
        <p>
          1. Node labels can be edited just by entering  
        </p>
        <p>
          into the respective node's  text field and then 
        </p>
        <p>
          double-clicking on the node to apply changes
        </p>
        <p>
          2. Node/edges can be deleted using backspace
        </p>
        <p>
          3. Background color of any node can be set by 
        </p>
        <p>
          typing-in the color name and then hovering 
        </p>
        <p>
          onto the node
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

