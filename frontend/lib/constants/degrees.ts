
export const DEGREE_OPTIONS = {
    UG: [
        "BTech/BE",
        "BSc",
        "BCA",
        "MBBS",
        "BDS",
        "BPharm",
        "BA/BCom"
    ],
    PG: [
        "MTech/ME",
        "MSc",
        "MCA",
        "MBA",
        "MPharm",
        "MD/MS"
    ],
    Doctoral: [
        "PhD"
    ]
};

export const DEGREE_EXAMS: Record<string, string[]> = {
    "BTech/BE": ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "SRMJEEE", "MET", "WBJEE", "MHT CET", "KCET", "COMEDK"],
    "BSc": ["CUET", "NEST", "ISI Admission Test"],
    "BCA": ["CUET", "IPU CET", "SET"],
    "MBBS": ["NEET"],
    "BDS": ["NEET"],
    "BPharm": ["NEET", "MHT CET", "KCET"],
    "BA/BCom": ["CUET"],
    "MTech/ME": ["GATE"],
    "MSc": ["IIT JAM", "CUET-PG"],
    "MCA": ["NIMCET", "MAH MCA CET"],
    "MBA": ["CAT", "XAT", "SNAP", "NMAT", "CMAT", "MAT", "GMAT"],
    "MPharm": ["GPAT"],
    "MD/MS": ["NEET PG", "INI CET"],
    "PhD": ["CSIR NET", "UGC NET", "GATE"]
};

// Helper to get exams for multiple selected degrees
export const getExamsFordegrees = (selectedDegrees: string[]) => {
    const exams = new Set<string>();
    selectedDegrees.forEach(deg => {
        const degreeExams = DEGREE_EXAMS[deg];
        if (degreeExams) {
            degreeExams.forEach(ex => exams.add(ex));
        }
    });
    return Array.from(exams);
};
