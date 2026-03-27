import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api-client";

type ResultItem = {
    participant_id?: number;
    project_id?: number;
    average_score?: number;
    evaluations_count?: number;
};

type ListResponse = {
    items: ResultItem[]
};

export default function ResultsRoute() {
    const { projectId } = useParams();
    const pid = Number(projectId);

    const [items, setItems] = useState<ResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError("");
            try {
                const res = (await api.get(`/evaluations/results/by-project/${pid}`)) as ListResponse;
                setItems(res.items);
            } catch (e: any) {
                setError(e?.response?.data?.detail || e?.message || "Не удалось загрузить результаты");
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [pid]);

    return (
        <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
            <h2 style={{ margin: 0 }}>Результаты по проекту #{pid}</h2>

            {loading && <div>Загрузка…</div>}
            {error && <div style={{ padding: 10, border: "1px solid #ef4444", borderRadius: 8 }}>{error}</div>}
            {!loading && !error && items.length === 0 && <div>Пока нет данных.</div>}

            {!loading && !error && items.length > 0 && (
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                    {items.map((it, idx) => (
                        <li key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
                            <div style={{ display: "grid", gap: 6 }}>
                                <div>
                                    <b>ID участника:</b> {it.participant_id ?? "-"}
                                </div>
                                <div>
                                    <b>ID проекта:</b> {it.project_id ?? "-"}
                                </div>
                                <div>
                                    <b>Средняя оценка:</b> {it.average_score ?? "-"}
                                </div>
                                <div>
                                    <b>Количество оценок:</b> {it.evaluations_count ?? "-"}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
