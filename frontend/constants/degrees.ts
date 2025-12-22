export const DEGREE_EXAM_MAP = {
    BTech: ["JEE Main", "JEE Advanced", "VITEEE", "BITSAT", "COMEDK"],
    MBA: ["CAT", "XAT", "GMAT", "NMAT"],
    MS: ["GRE", "TOEFL", "IELTS"],
    MTech: ["GATE"],
} as const;

export const DEGREES = Object.keys(DEGREE_EXAM_MAP) as (keyof typeof DEGREE_EXAM_MAP)[];
