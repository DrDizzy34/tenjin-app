// Step props so that we can define the shape of 
import type { StepProps } from './types.ts';

// We create two array constants corresponding to the days of the week, and the available range of hours.
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

// TODO: Fix this monstrosity of a loop.
export function AvailabilityStep({ data, update }: StepProps) {
    return (
        <div>
            <p>Pick the hours you're usually free to study (optional):</p>
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        {DAYS.map((day) => (
                            <th key={day}>{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {HOURS.map((hour) => {
                        const hourLabel = `${hour}:00`;
                        return (
                            <tr key={hour}>
                                <td>{hourLabel}</td>
                                {DAYS.map((dayName, day) => {
                                    const isSelected = data.availability.some(slot => slot.day === day && slot.hour === hour);
                                    return (
                                        <td key={`${day}-${hour}`}>
                                            <input 
                                                type="checkbox"
                                                aria-label={`${dayName} ${hourLabel}`}
                                                checked={isSelected}
                                                onChange={() => update({
                                                    availability: isSelected
                                                        ? data.availability.filter(slot => !(slot.day === day && slot.hour === hour))
                                                        : [...data.availability, { day, hour }]
                                                })}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}