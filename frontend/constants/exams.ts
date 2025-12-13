export const EXAMS_BY_COUNTRY: Record<string, string[]> = {
    India: [
        "JEE Main",
        "JEE Advanced",
        "BITSAT",
        "VITEEE",
        "CUET"
    ],
    "United States": [
        "SAT",
        "ACT",
        "AP Exams"
    ],
    "United Kingdom": [
        "GCSE",
        "A Levels",
        "UCAS"
    ],
    Canada: [
        "OUAC",
        "IELTS",
        "TOEFL"
    ],
    Australia: [
        "ATAR",
        "IELTS"
    ],
    Germany: [
        "TestDaF",
        "Goethe-Zertifikat",
        "IELTS"
    ]
};

export const ALL_EXAMS = Array.from(new Set(Object.values(EXAMS_BY_COUNTRY).flat()));
