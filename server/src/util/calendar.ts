import { Event } from '../graphql-types';
import { prisma } from '../prisma';
import {
  createCalendarEvent as createCalendarEventService,
  patchCalendarEvent,
} from '../services/Google';

export const updateCalendarEventAttendees = async ({
  eventId,
  calendarId,
  calendarEventId,
}: {
  eventId: number;
  calendarId: string | null;
  calendarEventId: string | null;
}) => {
  const attendees = await prisma.event_users.findMany({
    where: {
      event_id: eventId,
      rsvp: { name: 'yes' },
    },
    select: { user: { select: { email: true } } },
  });

  if (calendarId && calendarEventId) {
    try {
      // Patch is necessary here, since an update with unchanged start and end
      // will remove attendees' yes/no/maybe response without notifying them.
      await patchCalendarEvent({
        calendarId,
        calendarEventId,
        attendeeEmails: attendees.map(({ user }) => user.email),
      });
    } catch {
      // TODO: log more details without leaking tokens and user info.
      throw 'Unable to update calendar event attendees';
    }
  }
};

interface CreateCalendarEventData {
  attendeeEmails: string[];
  calendarId: string;
  event: Pick<Event, 'id' | 'ends_at' | 'start_at' | 'name'>;
}

export const createCalendarEvent = async ({
  attendeeEmails,
  calendarId,
  event: { ends_at, id, name, start_at },
}: CreateCalendarEventData) => {
  try {
    const { calendarEventId } = await createCalendarEventService({
      calendarId,
      start: start_at,
      end: ends_at,
      summary: name,
      attendeeEmails,
    });

    return await prisma.events.update({
      where: { id },
      data: { calendar_event_id: calendarEventId },
    });
  } catch {
    // TODO: log more details without leaking tokens and user info.
    throw Error('Unable to create calendar event');
  }
};