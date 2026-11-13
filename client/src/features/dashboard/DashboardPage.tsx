import { useEffect, useState } from 'react';
import { get } from '@/lib/api';

type DashboardGroup = {
  id: number;
  name: string;
  meeting_mode: 'in_person' | 'online' | 'hybrid';
  course_code: string | null;
  chat_url: string | null;
};

type DashboardNotification = {
  id: number;
  type: 'joined' | 'left' | 'kicked' | 'request_accepted' | 'request_declined' | 'new_request';
  read_at: string | null;
  created_at: string;
  group_name: string | null;
  actor_name: string | null;
};

interface DashboardResponse {
  groups: DashboardGroup[];
  notifications: DashboardNotification[];
}

export default function DashboardPage() {
  const [groups, setGroups] = useState<DashboardGroup[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const result = (await get('/dashboard')) as DashboardResponse;
        if (active) {
          setGroups(result.groups);
          setNotifications(result.notifications);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Could not load your groups.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') void loadDashboard();
    }

    void loadDashboard();
    const refreshInterval = window.setInterval(loadDashboard, 30_000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  const hasNewNotifications = notifications.some((notification) => notification.read_at === null);

  return (
    <section className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <div>
          <div className="mb-4 h-1 w-12 rounded-full bg-accent" />
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Your Tenjin dashboard</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your study groups</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
            Pick up where you left off and stay connected with your study partners.
          </p>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
        <div>
          {loading && <p className="text-slate-600">Loading your groups...</p>}
          {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">{error}</p>}
          {!loading && !error && groups.length === 0 && (
            <p className="mt-6 text-sm text-slate-500">You haven't joined any groups yet.</p>
          )}

          {!loading && groups.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2">
              {groups.map((group) => {
                const chatUrl = getSafeChatUrl(group.chat_url);
                const content = (
                  <>
                    <GroupIcon meetingMode={group.meeting_mode} />
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-slate-900">{group.name}</h2>
                      {group.course_code && <p className="mt-1 text-sm text-slate-500">{group.course_code}</p>}
                    </div>
                  </>
                );

                return (
                  <li key={group.id}>
                    {chatUrl ? (
                      <a
                        href={chatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open chat for ${group.name}`}
                        className="flex min-w-0 items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="flex min-w-0 items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside aria-labelledby="notifications-heading" className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 id="notifications-heading" className="text-lg font-semibold text-slate-900">Notifications</h2>
            {hasNewNotifications && (
              <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                {notifications.filter((notification) => notification.read_at === null).length} new
              </span>
            )}
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Loading notifications...</p>
          ) : !hasNewNotifications ? (
            <p className="mt-4 text-sm text-slate-500">No new notifications.</p>
          ) : null}

          {notifications.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-100">
              {notifications.map((notification) => (
                <li key={notification.id} className="py-4 first:pt-0 last:pb-0">
                  <p className={`text-sm leading-6 ${notification.read_at ? 'text-slate-500' : 'text-slate-800'}`}>
                    {getNotificationMessage(notification)}
                  </p>
                  <time dateTime={notification.created_at} className="mt-1 block text-xs text-slate-400">
                    {formatNotificationDate(notification.created_at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </aside>
        </div>
      </div>
    </section>
  );
}
// Gets any notification message based on the type of notification. If the actor or group name is missing, it will use a default value.
function getNotificationMessage(notification: DashboardNotification): string {
  const actor = notification.actor_name || 'Someone';
  const group = notification.group_name || 'a group';

  switch (notification.type) {
    case 'joined':
      return `${actor} joined ${group}.`;
    case 'left':
      return `${actor} left ${group}.`;
    case 'kicked':
      return `You were removed from ${group}.`;
    case 'request_accepted':
      return `Your request to join ${group} was accepted.`;
    case 'request_declined':
      return `Your request to join ${group} was declined.`;
    case 'new_request':
      return `${actor} requested to join ${group}.`;
  }
}
// Formats a date string into a more readable format, e.g. "Jan 1, 2023, 12:00 PM"
function formatNotificationDate(date: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}
// Validates a chat URL to ensure it is a valid HTTP or HTTPS URL. Returns the URL if valid, otherwise returns null.
function getSafeChatUrl(chatUrl: string | null): string | null {
  if (!chatUrl) return null;

  try {
    const url = new URL(chatUrl);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}
// Renders an icon representing the meeting mode of a group. The icon is a circle with a different symbol inside depending on the meeting mode.
function GroupIcon({ meetingMode }: { meetingMode: DashboardGroup['meeting_mode'] }) {
  const label = meetingMode === 'online'
    ? 'Online group'
    : meetingMode === 'in_person'
      ? 'In-person group'
      : 'Hybrid group';

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent" aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        {meetingMode === 'online' ? (
          <>
            <rect x="3" y="4" width="18" height="13" rx="2" />
            <path d="M8 21h8m-4-4v4" />
          </>
        ) : meetingMode === 'in_person' ? (
          <>
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </>
        ) : (
          <>
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M3 20v-1a6 6 0 0 1 12 0v1m0-4a5 5 0 0 1 6 4" />
          </>
        )}
      </svg>
    </span>
  );
}