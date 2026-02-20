import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type ListResponse<T> = { items: T[] };

type DefenseDay = {
    id: number;
    date: string;
    max_slots: number;
    first_slot_time: string;
};

type DefenseSlot = {
    id: number;
    defense_day_id: number;
    slot_index: number;
    title: string;
    start_at: string;
    end_at: string;
    location: string;
    capacity: number;
    project_type?: { id: number; name: string };
};

type ProjectItem = {
    id: number;
    title?: string;
    name?: string;
};

// function formatSlot(s: DefenseSlot) {
//     const start = new Date(s.start_at);
//     const end = new Date(s.end_at);
//
//     const ok = !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime());
//
//     const time = ok
//         ? `${start.toLocaleDateString()} ${start.toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//         })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
//         : `${s.start_at} - ${s.end_at}`;
//
//     const type = s.project_type?.name ? ` · ${s.project_type.name}` : "";
//     const title = s.title ? ` · ${s.title}` : "";
//
//     return `#${s.slot_index} · ${time}${type}${title}`;
// }
function formatSlot(s: DefenseSlot) {
    const start = new Date(s.start_at);
    const end = new Date(s.end_at);

    const time = `${start.toLocaleDateString()} · ${start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`

    const title = s.title ? ` · ${s.title}` : "";

    return `#${s.slot_index} · ${time}${title}`;
}

export default function Project() {
    const [days, setDays] = useState<DefenseDay[]>([]);
    const [slots, setSlots] = useState<DefenseSlot[]>([]);
    const [projects, setProjects] = useState<ProjectItem[]>([]);

    const [dayId, setDayId] = useState("");
    const [slotId, setSlotId] = useState("");
    const [projectId, setProjectId] = useState("");

    const [loadingDays, setLoadingDays] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [registering, setRegistering] = useState(false);

    const [error, setError] = useState("");

    const loading = loadingDays || loadingSlots || loadingProjects || registering;
    const canRegister = dayId !== "" && slotId !== "" && projectId !== "" && !loading;

    async function fetchDays() {
        setLoadingDays(true);
        setError("");
        try {
            const data = await api.get("/defense/days") as ListResponse<DefenseDay>;
            const list = data.items;
            setDays(list);

            if (list.length > 0) {
                setDayId(String(list[0].id));
            } else {
                setDayId("");
            }
        } catch (e: any) {
            setError(e?.response?.data?.detail || e?.message || "Не удалось загрузить дни");
        } finally {
            setLoadingDays(false);
        }
    }

    async function fetchProjects() {
        setLoadingProjects(true);
        setError("");
        try {
            const data = await api.get("/projects/") as ListResponse<ProjectItem>;
            const list = data.items;
            setProjects(list);

            if (list.length > 0) {
                setProjectId(String(list[0].id));
            } else {
                setProjectId("");
            }
        } catch (e: any) {
            setError(e?.response?.data?.detail || e?.message || "Не удалось загрузить проекты");
        } finally {
            setLoadingProjects(false);
        }
    }

    async function fetchSlots(forDayId: string) {
        setLoadingSlots(true);
        setError("");
        try {
            const data = await api.get("/defense/slots") as ListResponse<DefenseSlot>;
            const all = data.items;

            const filtered = all.filter((s) => s.defense_day_id === Number(forDayId));
            setSlots(filtered);

            if (filtered.length > 0) {
                setSlotId(String(filtered[0].id));
            } else {
                setSlotId("");
            }
        } catch (e: any) {
            setError(e?.response?.data?.detail || e?.message || "Не удалось загрузить слоты");
        } finally {
            setLoadingSlots(false);
        }
    }

    async function register() {
        setRegistering(true);
        setError("");
        try {
            await api.post(`/defense/slots/${slotId}/register`, {
                slot_id: Number(slotId),
                project_id: Number(projectId),
            });

            await fetchSlots(dayId);
        } catch (e: any) {
            setError(e?.response?.data?.detail || e?.message || "Не удалось записаться");
        } finally {
            setRegistering(false);
        }
    }

    useEffect(() => {
        fetchProjects();
        fetchDays();
    }, []);

    useEffect(() => {
        if (dayId) {
            fetchSlots(dayId);
        } else {
            setSlots([]);
            setSlotId("");
        }
    }, [dayId]);

    return (
        <div style={{ display: "grid", gap: 12, maxWidth: 700 }}>
            <h2 style={{ margin: 0 }}>Запись на защиту</h2>

            {error ? (
                <div style={{ padding: 10, border: "1px solid #ef4444", borderRadius: 8 }}>{error}</div>
            ) : <></>}

            <label style={{ display: "grid", gap: 6 }}>
                Проект
                <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    disabled={loading || projects.length === 0}
                >
                    <option value="">{projects.length ? "Выберите проект" : "Проектов нет"}</option>
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                            #{p.id} {p.title ?? p.name ?? ""}
                        </option>
                    ))}
                </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
                День защиты
                <select value={dayId} onChange={(e) => setDayId(e.target.value)} disabled={loading}>
                    <option value="">{days.length ? "Выберите день" : "Дней нет"}</option>
                    {days.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.date} (max: {d.max_slots}, c {d.first_slot_time})
                        </option>
                    ))}
                </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
                Слот
                <select value={slotId} onChange={(e) => setSlotId(e.target.value)} disabled={loading || !dayId}>
                    <option value="">{slots.length ? "Выберите слот" : "Слотов нет"}</option>
                    {slots.map((s) => (
                        <option key={s.id} value={s.id}>
                            {formatSlot(s)}
                        </option>
                    ))}
                </select>
            </label>

            <Button variant="primary" onClick={register} disabled={!canRegister}>
                {registering ? "..." : "Записаться на защиту"}
            </Button>
        </div>
    );
}
