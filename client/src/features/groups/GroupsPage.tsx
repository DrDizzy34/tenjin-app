import { useEffect, useState } from 'react';
import type { Group } from '@shared/types';
import { get, post } from '@/lib/api';
import { GroupCard } from './GroupCard';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import CreateGroupForm from './CreateGroupForm';
import { RequestForm } from './RequestForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';

const GROUP_SHOW_MAX = 6;

export default function GroupsPage() {
    // State related to the primary function of the page.
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [requestingGroup, setRequestingGroup] = useState<Group | null>(null);
    const [startIndex, setStartIndex] = useState(0);
    
    // State related to the filtering functions of the page.
    const [searchText, setSearchText] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [modeFilter, setModeFilter] = useState('');
    const [sortFilter, setSortFilter] = useState('');
    const [sortJoin, setSortJoin] = useState('');
    const [onlyJoinable, setOnlyJoinable] = useState(false);

    // Cleaned text provided by the filter input, and course options narrowed down by specifically the courses that currently exist in a group.
    const search = searchText.trim().toLowerCase();
    const courseOptions = [...new Set(groups.map((g) => g.course_code).filter((code) => code !== null))];
    
    const visibleGroups = groups.filter((group) => {
        // Basically, if search is empty, filters none, else it filters the available groups based on various search conditions including name, description, and course code.
        const matchesSearch = search === '' || group.name.toLowerCase().includes(search) || (group.description ?? '').toLowerCase().includes(search) || (group.course_code ?? '').toLowerCase().includes(search);

        // Groups are filtered based on the selected course value.
        const matchesCourse = courseFilter === '' || group.course_code === courseFilter;

        // In a similar fashion, groups are filtered based on the selected value for group preference.
        const matchesMode = modeFilter === '' || group.meeting_mode.includes(modeFilter);

        // Filters based on groups that are currently able to be requested, or joinable.
        const matchesOnlyJoinable = !onlyJoinable || (!(group.is_member) && !(group.has_pending_request) && (group.capacity > group.member_count));

        // Filters based on join policy.
        const sortJoinOnly = sortJoin === '' || group.join_policy.includes(sortJoin);

        // Returns the union of them, essentially allowing for mixed combinations.
        return matchesSearch && matchesCourse && matchesMode && matchesOnlyJoinable && sortJoinOnly;
    });

    const sorted = sortFilter === 'match'
        ? [...visibleGroups].sort((a, b) => b.score - a.score)
        : visibleGroups;
    const currentGroups = sorted.slice(startIndex, startIndex + GROUP_SHOW_MAX);

    // Loads groups (separated so that it can be used else where besides the initial load).
    async function loadGroups() {
        try {
            const result = await get('/groups');
            setGroups(result);
        } catch {
            setError("Couldn't load groups, please try reloading.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadGroups();
    }, []);

    async function handleJoin(groupId: number, message?: string) {
        const result = await post(`/groups/${groupId}/join`, { message });

        setGroups((prev) => prev.map((g) => {
            if (g.id !== groupId) return g;
            return result.status === 'joined'
                ? { ...g, is_member: true, member_count: g.member_count + 1 }
                : { ...g, has_pending_request: true };
        }));
    }

    async function handleLeave(groupId: number) {
        await post(`/groups/${groupId}/leave`);
        setGroups((prev) => prev.map((group) => (
            group.id === groupId
                ? { ...group, is_member: false, member_count: Math.max(0, group.member_count - 1) }
                : group
        )));
    }

    return (
        <div className="mx-auto max-w-screen-2xl py-10 space-y-4 sm:px-10 lg:px-14">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Groups</h1>
            <p className="text-slate-600">Explore and manage your study groups.</p>

            <Button onClick={() => setShowCreate(true)}>Create group</Button>

            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create a group">
                <CreateGroupForm onCreated={() => {
                    setShowCreate(false);
                    setStartIndex(0);
                    loadGroups();
                }}/>
            </Modal>

            <Modal
                open={requestingGroup !== null}
                onClose={() => setRequestingGroup(null)}
                title={`Request to join ${requestingGroup?.name ?? ''}`}
            >
                {requestingGroup && (
                    <RequestForm 
                        group={requestingGroup}
                        onSend={async (message) => {
                            await handleJoin(requestingGroup.id, message);
                            setRequestingGroup(null);
                        }}
                    />
                )}
            </Modal>

            {loading ? (
                <p className="text-slate-600">Loading groups...</p>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : (
                <>
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        <Input 
                            label="Search group:"
                            type="text"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setStartIndex(0);
                            }}
                        />

                        <Select
                            label="Course:"
                            value={courseFilter}
                            onChange={(e) => {
                                setCourseFilter(e.target.value);
                                setStartIndex(0);
                            }}
                        >
                            <option value="">General</option> 
                            {courseOptions.map((course) => (
                                <option key={`filter-by-${course}`} value={course}>
                                    {course}
                                </option>
                            ))}

                        </Select>

                        <Select
                            label="Meeting mode:"
                            value={modeFilter}
                            onChange={(e) => {
                                setModeFilter(e.target.value);
                                setStartIndex(0);
                            }}
                        >
                            <option value="">Any</option> 
                            <option value="in_person">In person</option> 
                            <option value="online">Online</option> 
                            <option value="hybrid">Hybrid</option> 
                        </Select>

                        <Select
                            label="Sort by:"
                            value={sortFilter}
                            onChange={(e) => {
                                setSortFilter(e.target.value);
                                setStartIndex(0);
                            }}
                        >
                            <option value="">Date</option>
                            <option value="match">Match</option>
                        </Select>

                        <Select
                            label="Join:"
                            value={sortJoin}
                            onChange={(e) => {
                                setSortJoin(e.target.value);
                                setStartIndex(0);
                            }}
                        >
                            <option value="">Default</option>
                            <option value="request">Request</option>
                            <option value="open">Join</option>
                        </Select>

                        <Checkbox
                            label="Only joinable"
                            type="checkbox"
                            checked={onlyJoinable}
                            onChange={() => {
                                setOnlyJoinable(!onlyJoinable);
                                setStartIndex(0);
                            }}
                        />
                    </div>

                    {visibleGroups.length === 0 ? (
                        <p className="text-slate-600">No groups match your filters.</p>
                    ) : (
                        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {visibleGroups.map((group) => (
                                <GroupCard key={group.id} group={group} onJoin={handleJoin} onLeave={handleLeave} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}