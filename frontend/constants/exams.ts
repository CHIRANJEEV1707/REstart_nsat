export const EXAMS_BY_COUNTRY: Record<string, string[]> = {
    India: [
        "JEE Main",
        "JEE Advanced",
        "BITSAT",
        "VITEEE",
        "COMEDK",
        "WBJEE",
        "MHTCET",
        "CUET",
        "NSAT"
    ],
    "United States": [
        "SAT",
        "ACT",
        "AP Exams",
        "TOEFL",
        "IELTS"
    ],
    "United Kingdom": [
        "IELTS",
        "UCAS",
        "A Levels",
        "IB"
    ],
    Canada: [
        "IELTS",
        "TOEFL"
    ],
    Germany: [
        "IELTS",
        "TestDaF",
        "Goethe-Zertifikat"
    ],
    Australia: [
        "IELTS",
        "TOEFL",
        "ATAR"
    ],
    Switzerland: [
        "IELTS"
    ],
    Singapore: [
        "SAT",
        "IELTS"
    ],
    Ireland: [
        "IELTS"
    ],
    "New Zealand": [
        "IELTS"
    ]
};

// Default exams to show on International page when no country is selected
export const INTL_COMMON_EXAMS = [
    "SAT",
    "ACT",
    "IELTS",
    "TOEFL",
    "AP Exams",
    "A Levels",
    "IB",
    "UCAS",
    "TestDaF",
    "Goethe-Zertifikat",
    "ATAR"
];

export const ALL_EXAMS = Array.from(new Set(Object.values(EXAMS_BY_COUNTRY).flat()));
