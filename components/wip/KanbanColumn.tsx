/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";

const PHASE_LABELS: Record<string, string> = {
  RAW_MATERIALS: "Raw Materials",
  DESIGN: "Design",
  PRINTING: "Printing",
  POST_PRINTING: "Post Printing",
};

export function KanbanColumn({ 
  id, 
  cards, 
  isAdmin,
  onDelete,
  onMarkComplete
}: { 
  id: string; 
  cards: any[]; 
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onMarkComplete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-slate-100 rounded-lg h-full max-h-[calc(100vh-140px)] border shadow-sm">
      <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-lg">
        <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide">
          {PHASE_LABELS[id] || id}
        </h3>
        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>

      <div 
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${
          isOver ? 'bg-slate-200 shadow-inner' : ''
        }`}
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard 
              key={card.id} 
              card={card} 
              isAdmin={isAdmin}
              onDelete={onDelete}
              onMarkComplete={onMarkComplete}
            />
          ))}
        </SortableContext>
        
        {cards.length === 0 && (
          <div className="h-full border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}
