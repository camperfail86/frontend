import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

type ProjectType = { id: number; name: string };

type DefenseSlot = {
    id: number;
    defense_day_id: number;
    slot_index: number;
    title: string;
    project_type: ProjectType;
    start_at: string;
    end_at: string;
    location: string;
    capacity: number;
};

type ListResponse<T> = { items: T[] };

function getDateKey(iso: string) {
    return new Date(iso).toISOString().slice(0, 10);
}

function format(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ListDefences() {
    const [slots, setSlots] = useState<DefenseSlot[]>([]);
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTypeId, setSelectedTypeId] = useState("");

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const slotsRes = (await api.get("/defense/slots")) as ListResponse<DefenseSlot>;
                const typesRes = (await api.get("/defense/project-types")) as ListResponse<ProjectType>;

                setSlots(slotsRes.items || []);
                setProjectTypes(typesRes.items || []);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const dates: string[] = [];
    for (const s of slots) {
        const d = getDateKey(s.start_at);
        if (!dates.includes(d)) {
            dates.push(d);
        }
    }
    dates.sort();

    let filtered = slots;
    if (selectedDate) {
        filtered = filtered.filter((s) => getDateKey(s.start_at) === selectedDate);
    }
    if (selectedTypeId) {
        filtered = filtered.filter((s) => String(s.project_type?.id) === selectedTypeId);
    }

    return (
        <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
            <h2 style={{ margin: 0 }}>Список защит</h2>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} disabled={loading}>
                    <option value="">Дата (все)</option>
                    {dates.map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>

                <select value={selectedTypeId} onChange={(e) => setSelectedTypeId(e.target.value)} disabled={loading}>
                    <option value="">Тип проекта (все)</option>
                    {projectTypes.map((t) => (
                        <option key={t.id} value={String(t.id)}>
                            {t.name}
                        </option>
                    ))}
                </select>

                <Button
                    variant="primary"
                    onClick={() => {
                        setSelectedDate("");
                        setSelectedTypeId("");
                    }}
                    disabled={loading}
                >
                    Сбросить фильтры
                </Button>
            </div>

            {loading ? <div>Загрузка…</div> : null}

            {!loading && filtered.length === 0 ? <div>Ничего не найдено</div> : null}

            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                {filtered.map((s) => (
                    <li key={s.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
                        <div style={{ display: "grid", gap: 6 }}>
                            <div style={{ fontWeight: 700 }}>{s.title || `Слот #${s.id}`}</div>
                            <div style={{ opacity: 0.8 }}>Тип: {s.project_type?.name}</div>
                            <div style={{ opacity: 0.8 }}>
                                Время: {format(s.start_at)} — {format(s.end_at)}
                            </div>
                            <div style={{ opacity: 0.8 }}>Локация: {s.location}</div>
                            <div style={{ opacity: 0.8 }}>Вместимость: {s.capacity}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
