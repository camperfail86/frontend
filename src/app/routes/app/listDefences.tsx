import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

type ProjectType = { id: number; name: string };

type ScheduledDefense = {
    id: number;
    title: string;
    project_type: ProjectType;
    start_at: string;
    end_at: string;
    location: string;
    project_id: number | null;
};

type Project = { id: number; name: string };

const fmtDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("ru-RU", { year: "numeric", month: "2-digit", day: "2-digit" });
}

const fmtTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function ListDefences() {
    const [slots, setSlots] = useState<ScheduledDefense[]>([]);
    const [types, setTypes] = useState<ProjectType[]>([]);
    const [projectNames, setProjectNames] = useState<Record<number, string>>({});

    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTypeId, setSelectedTypeId] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError("");

            try {
                const scheduledRes = await api.get("/defense/scheduled");
                const typesRes = await api.get("/defense/project-types");

                const scheduled: ScheduledDefense[] = scheduledRes?.items ?? [];
                setSlots(scheduled);

                const projectTypes: ProjectType[] = typesRes?.items ?? [];
                setTypes(projectTypes);

                const projectsRes = await api.get("/projects/");
                const projects: Project[] = projectsRes?.items ?? [];

                const map: Record<number, string> = {};
                for (const p of projects) map[p.id] = p.name;
                setProjectNames(map);
            } catch (e: any) {
                setError(e?.response?.data?.detail || e?.message || "Ошибка загрузки");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const dates: string[] = [];
    for (const d of slots) {
        const key = d.start_at.slice(0, 10);
        if (!dates.includes(key)) dates.push(key);
    }
    dates.sort();

    let filtered = slots;

    if (selectedDate) {
        filtered = filtered.filter((d) => d.start_at.slice(0, 10) === selectedDate);
    }

    if (selectedTypeId) {
        filtered = filtered.filter((d) => String(d.project_type?.id) === selectedTypeId);
    }

    return (
        <div style={{ maxWidth: 900, display: "grid", gap: 12 }}>
            <h2>Список защит</h2>

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
                    {types.map((t) => (
                        <option key={t.id} value={String(t.id)}>
                            {t.name}
                        </option>
                    ))}
                </select>

                <Button
                    onClick={() => {
                        setSelectedDate("");
                        setSelectedTypeId("");
                    }}
                    disabled={loading}
                >
                    Сбросить
                </Button>
            </div>

            {loading && <div>Загрузка...</div>}
            {!loading && error && <div style={{ color: "#b91c1c" }}>Ошибка: {error}</div>}
            {!loading && !error && filtered.length === 0 && <div>Ничего не найдено</div>}

            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
                {filtered.map((d) => (
                    <li key={d.id} style={{ border: "1px solid #e5e7eb", padding: 12, borderRadius: 8 }}>
                        <div style={{ display: "grid", gap: 6 }}>
                            <b>{d.title || `Слот #${d.id}`}</b>

                            <div>Тип: {d.project_type?.name ?? "—"}</div>
                            <div>Дата: {fmtDate(d.start_at)}</div>
                            <div>Время: {fmtTime(d.start_at)} — {fmtTime(d.end_at)}</div>
                            <div>Локация: {d.location || "—"}</div>
                            <div>Проект: {projectNames[d.project_id] || `#${d.project_id}`}</div>
                            <Button asChild className="w-fit">
                                <Link to={`/evaluate/${d.project_id}`}>Оценить</Link>
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}