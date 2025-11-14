
'use client';

import type { Materia } from '@/types';
import { cn } from '@/lib/utils';
import React from 'react';

type ScheduleData = Materia['horarioActual'];

interface ScheduleDisplayProps {
  scheduleData: ScheduleData;
  className?: string;
}

const parseTime = (timeStr: string): { start: number; end: number } | null => {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{2}):\d{2}-(\d{2}):\d{2}/);
  if (!match) return null;
  return { start: parseInt(match[1]), end: parseInt(match[2]) };
};

const allDaysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export function ScheduleDisplay({ scheduleData, className }: ScheduleDisplayProps) {
  const isDataValid = Array.isArray(scheduleData) && 
                      scheduleData.length > 0 && 
                      scheduleData.some(s => s.horarios && s.horarios.length > 0);

  if (!isDataValid) {
    return <p className="text-sm text-muted-foreground p-4 text-center border rounded-lg">No hay información de horario disponible.</p>;
  }

  const allSlots = scheduleData.flatMap((profSchedule, profIndex) => 
    (profSchedule.horarios || []).map((slot, slotIndex) => {
        const time = parseTime(slot.hora);
        if (!time || !slot.dia || !allDaysOfWeek.includes(slot.dia)) return null;
        return { 
            ...slot, 
            time, 
            profesor: profSchedule.profesor || 'Prof. por Asignar',
            profIndex,
            key: `${profSchedule.profesor}-${slot.dia}-${slot.hora}-${slotIndex}` 
        };
    })
  ).filter((item): item is NonNullable<typeof item> => !!item);
    
  if (allSlots.length === 0) {
    return <p className="text-sm text-muted-foreground p-4 text-center border rounded-lg">No hay horarios programados para esta semana.</p>;
  }
  
  const displayDays = allDaysOfWeek;

  const allTimes = allSlots.map(s => s.time);
  const minHour = Math.floor(Math.min(...allTimes.map(t => t.start)));
  const maxHour = Math.ceil(Math.max(...allTimes.map(t => t.end)));
  const hourRange = Array.from({ length: maxHour - minHour + 1 }, (_, i) => i + minHour);

  const processedSchedules = allSlots.map(slot => {
    const dayIndex = displayDays.indexOf(slot.dia) + 2;
    const rowStart = slot.time.start - minHour + 2;
    const rowDuration = slot.time.end - slot.time.start;
    
    return {
      ...slot,
      gridColumn: `${dayIndex} / span 1`,
      gridRow: `${rowStart} / span ${rowDuration}`,
    };
  });

  return (
    <div className={cn("relative overflow-x-auto rounded-lg border bg-background", className)}>
      <div
        className="grid auto-rows-[2rem]"
        style={{ 
          gridTemplateColumns: `auto repeat(${displayDays.length}, minmax(100px, 1fr))`,
        }}
      >
        <div className="sticky top-0 z-20 bg-muted" style={{ gridColumn: 1, gridRow: 1 }}></div>

        {displayDays.map((day, index) => (
          <div 
            key={day} 
            className="sticky top-0 z-20 flex h-8 items-center justify-center border-b border-l bg-muted px-1 text-center text-xs font-medium text-muted-foreground"
            style={{ gridColumn: index + 2, gridRow: 1 }}
          >
            {day}
          </div>
        ))}

        {hourRange.map((hour, i) => (
          <React.Fragment key={hour}>
            <div 
              className="z-10 flex items-start justify-end border-r pr-2"
              style={{ gridRow: i + 2, gridColumn: 1 }}
            >
              <span className="text-[10px] text-muted-foreground -translate-y-1/2">
                {`${hour.toString().padStart(2, '0')}:00`}
              </span>
            </div>
            {displayDays.map((_, j) => (
              <div
                key={`${i}-${j}`}
                className="border-b border-dashed border-l"
                style={{ gridRow: i + 2, gridColumn: j + 2 }}
              ></div>
            ))}
          </React.Fragment>
        ))}

        {processedSchedules.map(slot => (
          <div
            key={slot.key}
            className="z-10 m-px flex flex-col justify-center overflow-hidden rounded-sm border-transparent bg-muted/50 p-1.5 text-foreground"
            style={{ 
                gridColumn: slot.gridColumn, 
                gridRow: slot.gridRow,
            }}
          >
            <p className="text-xs font-medium leading-tight truncate">{slot.profesor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
