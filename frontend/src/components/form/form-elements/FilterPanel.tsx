import React, {useState} from 'react';
import {DndContext, closestCenter, DragEndEvent} from '@dnd-kit/core';
import {arrayMove, SortableContext, rectSortingStrategy} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import SortableFilter from './SortableFilter'; // see component below

type Filter = { id: string; label: string; value?: any; options?: any[] };

export default function FilterPanel({initialFilters, onChange}:{initialFilters:Filter[]; onChange:(filters:Filter[])=>void}) {
  const [filters, setFilters] = useState<Filter[]>(initialFilters);
  const [visible, setVisible] = useState(true);

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over || active.id === over.id) return;
    const oldIndex = filters.findIndex(f => f.id === active.id);
    const newIndex = filters.findIndex(f => f.id === over.id);
    const next = arrayMove(filters, oldIndex, newIndex);
    setFilters(next);
    onChange(next); // reapply cascade externally
  };

  const handleValueChange = (id:string, value:any) => {
    const next = filters.map(f => f.id === id ? {...f, value} : f);
    setFilters(next);
    onChange(next); // reapply cascade externally
  };

  return (
    <>
      <button aria-expanded={visible} onClick={()=>setVisible(v=>!v)}>{visible ? 'Hide Filters' : 'Show Filters'}</button>
      <div className={`filters-wrapper ${visible ? 'open' : 'closed'}`}>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filters.map(f=>f.id)} strategy={rectSortingStrategy}>
            {filters.map(f => (
              <SortableFilter key={f.id} id={f.id} label={f.label} value={f.value} options={f.options}
                onchange={v=>handleValueChange(f.id, v)} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </>
  );
}
