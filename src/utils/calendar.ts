import { RRule } from 'rrule';
import { Task } from '../types';
import { generateId } from './helpers';

interface CalendarEvent {
  summary: string;
  description?: string;
  dtstart: string;
  dtend: string;
  location?: string;
  rrule?: string;
}

function cleanRRuleString(raw: string): string {
  // Extract the main RRULE components before any malformed data
  const mainComponents = ['FREQ', 'UNTIL', 'BYDAY', 'WKST', 'INTERVAL', 'COUNT'];
  const parts = raw.split(';');
  const cleaned = parts
    .map(part => {
      const [key] = part.split('=');
      if (!mainComponents.includes(key)) return null;

      if (key === 'BYDAY') {
        // Extract only valid day codes (MO,TU,WE,TH,FR,SA,SU)
        const value = part.split('=')[1];
        const days = value.split(',')
          .map(day => day.match(/^(MO|TU|WE|TH|FR|SA|SU)$/)?.[0])
          .filter(Boolean);
        return days.length ? `BYDAY=${days.join(',')}` : null;
      }

      if (key === 'UNTIL') {
        // Extract only the date/time part
        const value = part.split('=')[1];
        const match = value.match(/(\d{8}T\d{6}Z?)/);
        return match ? `UNTIL=${match[1]}` : null;
      }

      // Keep other valid components as is
      return part.split('\n')[0];
    })
    .filter(Boolean)
    .join(';');

  return cleaned;
}

function expandRecurringEvents(event: CalendarEvent, rruleString: string): CalendarEvent[] {
  try {
    const cleanedRRule = cleanRRuleString(rruleString);
    if (!cleanedRRule) {
      console.warn('Invalid RRULE string after cleaning:', rruleString);
      return [event];
    }

    const start = new Date(event.dtstart);
    const end = new Date();
    end.setDate(end.getDate() + 30); // Look ahead 30 days

    const rule = RRule.fromString(cleanedRRule);
    rule.options.dtstart = start;

    const dates = rule.between(start, end, true);
    if (!dates.length) return [event];

    const duration = new Date(event.dtend).getTime() - new Date(event.dtstart).getTime();
    const timeOffset = new Date(event.dtstart);

    return dates.map(recurringDate => {
      const start = new Date(
        recurringDate.getFullYear(),
        recurringDate.getMonth(),
        recurringDate.getDate(),
        timeOffset.getUTCHours(),
        timeOffset.getUTCMinutes(),
        timeOffset.getUTCSeconds()
      );

      const end = new Date(start.getTime() + duration);

      return {
        ...event,
        dtstart: start.toISOString(),
        dtend: end.toISOString(),
      };
    });
  } catch (error) {
    console.warn('Failed to parse RRULE:', error, 'Original string:', rruleString);
    return [event];
  }
}

export const parseICSFile = async (file: File): Promise<CalendarEvent[]> => {
  const text = await file.text();
  const events: CalendarEvent[] = [];
  let currentEvent: Partial<CalendarEvent> = {};
  let currentRrule = '';
  let isEvent = false;
  
  const lines = text.split(/\r\n|\n|\r/);
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Handle line continuations
    while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      line += lines[i + 1].trim();
      i++;
    }

    if (line === 'BEGIN:VEVENT') {
      isEvent = true;
      currentEvent = {};
      currentRrule = '';
      continue;
    }
    
    if (line === 'END:VEVENT') {
      isEvent = false;
      if (currentEvent.summary && currentEvent.dtstart && currentEvent.dtend) {
        if (currentRrule) {
          try {
            const expandedEvents = expandRecurringEvents(currentEvent as CalendarEvent, currentRrule);
            events.push(...expandedEvents);
          } catch (error) {
            console.warn('Failed to expand recurring event:', error);
            events.push(currentEvent as CalendarEvent);
          }
        } else {
          events.push(currentEvent as CalendarEvent);
        }
      }
      continue;
    }
    
    if (!isEvent) continue;

    const [key, ...values] = line.split(':');
    const value = values.join(':');
    const baseKey = key.split(';')[0];

    switch (baseKey) {
      case 'SUMMARY':
        currentEvent.summary = value;
        break;
      case 'DESCRIPTION':
        currentEvent.description = value;
        break;
      case 'DTSTART':
        currentEvent.dtstart = parseICalDate(value);
        break;
      case 'DTEND':
        currentEvent.dtend = parseICalDate(value);
        break;
      case 'LOCATION':
        currentEvent.location = value;
        break;
      case 'RRULE':
        currentRrule = value;
        break;
    }
  }
  
  // Sort events by start time
  events.sort((a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime());
  
  return events;
};

const parseICalDate = (value: string): string => {
  // Handle basic format: YYYYMMDD or YYYYMMDDTHHMMSS[Z]
  const basicDate = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/);
  if (basicDate) {
    const [_, year, month, day, hour = '00', minute = '00', second = '00'] = basicDate;
    const date = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    ));
    return date.toISOString();
  }
  
  // Try parsing as ISO string
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }
  
  throw new Error(`Invalid date format: ${value}`);
};

export const convertEventsToTasks = (events: CalendarEvent[]): Task[] => {
  // Filter out events that are 24 hours or longer
  const filteredEvents = events.filter(event => {
    const start = new Date(event.dtstart);
    const end = new Date(event.dtend);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return durationHours < 24;
  });

  // Convert remaining events to tasks
  return filteredEvents.map(event => {
    const start = new Date(event.dtstart);
    const end = new Date(event.dtend);
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    const notes = [
      event.description,
      event.location ? `📍 ${event.location}` : null
    ].filter(Boolean).join('\n\n');
    
    return {
      id: generateId(),
      name: event.summary,
      duration: durationMinutes,
      notes: notes || undefined,
      isAnchored: true,
      anchoredStartTime: start.toLocaleTimeString([], { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: false 
      }),
      completed: false,
      scheduledDate: event.dtstart
    };
  });
};