import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { paths } from "@/config/paths";
import { CRITERIA } from "@/features/evaluation/criteria";

type Project = {
    id: number;
    name: string;
    description?: string | null;
    author_id: number;
};

type Scores = Record<string, number>;

export default function EvaluateRoute() {
    const navigate = useNavigate();
    const { projectId } = useParams();

    const pid = projectId ? Number(projectId) : null;

    const [project, setProject] = useState<Project | null>(null);
    const [participantId, setParticipantId] = useState<number | null>(null);

    const [scores, setScores] = useState<Scores>({});
    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const init: Scores = {};
        for (const c of CRITERIA) init[c.id] = 0;
        setScores(init);
    }, []);

    useEffect(() => {
        async function load() {
            if (!pid || Number.isNaN(pid)) {
                setError("Неверный id проекта");
                return;
            }

            setLoading(true);
            setError("");

            try {
                const p = (await api.get(`/projects/${pid}`)) as Project;
                setProject(p);
                setParticipantId(p.author_id);
            } catch (e: any) {
                setError(e?.response?.data?.detail || e?.message || "Не удалось загрузить проект");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [pid]);

    const canSubmit = !!pid && !!participantId && !loading;

    async function submit() {
        if (!canSubmit) return;

        setLoading(true);
        setError("");

        try {
            await api.post("/evaluations/", {
                project_id: pid,
                participant_id: participantId,
                scores,
                comment: comment.trim() || undefined,
            });

            navigate(paths.app.result.getHref(String(pid)));
        } catch (e: any) {
            setError(e?.response?.data?.detail || e?.message || "Не удалось отправить оценку");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
            <h2 style={{ margin: 0 }}>Оценивание</h2>

            {error ? (
                <div style={{ padding: 10, border: "1px solid #ef4444", borderRadius: 8 }}>{error}</div>
            ) : null}

            <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontWeight: 700 }}>Проект</div>
                <div>{project ? `#${project.id} — ${project.name}` : loading ? "Загрузка..." : "—"}</div>
            </div>

            <label style={{ display: "grid", gap: 6 }}>
                Участник (author_id проекта)
                <input value={participantId ?? ""} readOnly />
            </label>

            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, display: "grid", gap: 10 }}>
                <div style={{ fontWeight: 700 }}>Критерии</div>

                {CRITERIA.map((c) => (
                    <div key={c.id} style={{ display: "grid", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ fontWeight: 600 }}>{c.title}</div>
                            <div style={{ opacity: 0.7 }}>max: {c.max}</div>
                        </div>

                        <input
                            type="number"
                            min={0}
                            max={c.max}
                            value={scores[c.id] ?? 0}
                            onChange={(e) => setScores((prev) => ({ ...prev, [c.id]: Number(e.target.value) }))}
                        />
                    </div>
                ))}
            </div>

            <label style={{ display: "grid", gap: 6 }}>
                Комментарий (не обязательно)
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
            </label>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="primary" onClick={submit} disabled={!canSubmit}>
                    {loading ? "..." : "Отправить оценку"}
                </Button>

                {pid ? (
                    <Button variant="primary" onClick={() => navigate(paths.app.result.getHref(String(pid)))} disabled={loading}>
                        Результаты проекта
                    </Button>
                ) : null}
            </div>
        </div>
    );
}