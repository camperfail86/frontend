export type Criterion = { id: string; title: string; max: number };

export const CRITERIA: Criterion[] = [
    { id: "idea", title: "Идея / полезность", max: 10 },
    { id: "implementation", title: "Реализация", max: 10 },
    { id: "quality", title: "Качество кода", max: 10 },
    { id: "presentation", title: "Презентация", max: 10 },
];
