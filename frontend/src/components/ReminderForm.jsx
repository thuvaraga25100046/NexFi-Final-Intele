import { useState } from 'react';

const API_URL = 'http://localhost:8080/api/reminders';

export default function ReminderForm() {
    const [form, setForm] = useState({
        title: '',
        amount: '',
        phoneNumber: '',
        dueDate: '',
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    function updateField(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: form.title.trim(),
                    amount: Number(form.amount),
                    phoneNumber: form.phoneNumber.trim(),
                    dueDate: form.dueDate,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Unable to create reminder.'
                );
            }

            setMessage(
                'Reminder saved! SMS is scheduled for 7 days before the due date.'
            );

            setForm({
                title: '',
                amount: '',
                phoneNumber: '',
                dueDate: '',
            });
        } catch (error) {
            setMessage(
                error.message ||
                'Backend connection failed. Check that Spring Boot is running.'
            );
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        'w-full rounded-lg border border-slate-200 bg-slate-50 ' +
        'px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 ' +
        'dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 ' +
        'dark:[color-scheme:dark]';

    const labelClass =
        'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200';

    return (
        <section className="max-w-xl rounded-2xl border border-slate-200/90 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-white">
            <h2 className="mb-1 text-xl font-semibold">
                Payment Reminder
            </h2>

            <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                Get an SMS 7 days before your payment due date.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelClass}>
                        Payment title
                    </label>
                    <input
                        className={inputClass}
                        name="title"
                        value={form.title}
                        onChange={updateField}
                        placeholder="e.g. Supplier payment"
                        maxLength={120}
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>
                        Amount (LKR)
                    </label>
                    <input
                        className={inputClass}
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={updateField}
                        min="0.01"
                        step="0.01"
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>
                        Phone number
                    </label>
                    <input
                        className={inputClass}
                        type="tel"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={updateField}
                        placeholder="+94771234567"
                        pattern="\+[1-9][0-9]{7,14}"
                        title="Enter international format, e.g. +94771234567"
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>
                        Payment due date
                    </label>
                    <input
                        className={inputClass}
                        type="date"
                        name="dueDate"
                        value={form.dueDate}
                        onChange={updateField}
                        min={new Date().toLocaleDateString('en-CA')}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Reminder'}
                </button>

                {message && (
                    <p
                        role="status"
                        className="break-words text-sm text-slate-700 dark:text-slate-200"
                    >
                        {message}
                    </p>
                )}
            </form>
        </section>
    );
}