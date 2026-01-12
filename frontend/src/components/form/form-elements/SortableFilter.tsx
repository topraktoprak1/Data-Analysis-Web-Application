import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";



export default function SortableFilter({id,label,options,value,onchange}:{id:string,label:string,options?:string[],value?:string,onchange:(v:string)=>void}) {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: id});
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }
    return (
        <div ref = {setNodeRef} style={style} {...attributes} {...listeners}>
            <div className="drag-handle" {...attributes} {...listeners} aria-label = {`Drag ${label}`}>☰</div>
            <div className = "filter-body">
                <label>{label}</label>
                <select value={value ?? ""} onChange={e => onchange(e.target.value)} className="pivot-select">
                    <option value = "">(any)</option>
                    {options?.map(o => <option key = {o} value = {o}>{o}</option>)}
                </select>
            </div>
        </div>
    );
}