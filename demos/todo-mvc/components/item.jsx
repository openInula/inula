import { Input } from './input';

import { TOGGLE_ITEM, REMOVE_ITEM, UPDATE_ITEM } from '../constants';

export const Item = function Item({ todo, dispatch }) {
  let isWritable = false;
  const { title, completed, id } = todo;

  const toggleItem = () => dispatch({ type: TOGGLE_ITEM, payload: { id } });
  const removeItem = () => dispatch({ type: REMOVE_ITEM, payload: { id } });
  const updateItem = (id, title) => dispatch({ type: UPDATE_ITEM, payload: { id, title } });

  const handleDoubleClick = () => {
    isWritable = true;
  };

  const handleBlur = () => {
    isWritable = false;
  };

  const handleUpdate = title => {
    if (title.length === 0) removeItem(id);
    else updateItem(id, title);

    isWritable = false;
  };

  return (
    <li className={todo.completed ? 'completed' : ''} data-testid="todo-item">
      <div className="view">
        <if cond={isWritable}>
          <Input onSubmit={handleUpdate} label="Edit Todo Input" defaultValue={title} onBlur={handleBlur} />
        </if>
        <else>
          <input
            className="toggle"
            type="checkbox"
            data-testid="todo-item-toggle"
            checked={completed}
            onChange={toggleItem}
          />
          <label data-testid="todo-item-label" onDoubleClick={handleDoubleClick}>
            {title}
          </label>
          <button className="destroy" data-testid="todo-item-button" onClick={removeItem} />
        </else>
      </div>
    </li>
  );
};
