
import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../internationalCollege.json');

const rates: { [key: string]: number } = {
    "USA": 84,
    "UK": 107,
    "Switzerland": 95,
    "France": 90,
    "Germany": 90,
    "Netherlands": 90,
    "Belgium": 90,
    "Italy": 90,
    "Spain": 90,
    "Ireland": 90,
    "Finland": 90,
    "Sweden": 7.8,
    "Denmark": 12,
    "Norway": 7.6,
    "Canada": 60,
    "Australia": 55,
    "Singapore": 63,
    "Hong Kong": 10.8,
    "New Zealand": 51,
    "Japan": 0.55,
    "South Korea": 0.06,
    "China": 11.5,
    "Austria": 90, // Euro
    "Malaysia": 18,
    "Russia": 0.9,
    "New York": 84,
};

// Default rate if country not found (keep as is or 1? better to log warning)
// We will assume 1 if not found, but we should check.

interface College {
    name: string;
    location: { city: string; state: string };
    type: string;
    fees: number;
    exams_required: string[];
    restart_score: number;
    badges: string[];
    description: string;
    website: string;
    placement_stats: { average_package: string; highest_package: string };
    country: string;
    image: string;
    isTrending: boolean;
    trendingScore: number;
}

const convertFees = () => {
    try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const colleges: College[] = JSON.parse(rawData);
        let updatedCount = 0;

        const updatedColleges = colleges.map(college => {
            const country = college.country;
            let rate = rates[country];

            if (!rate) {
                // Fallback for some common variations
                if (['Scotland', 'Wales', 'Northern Ireland'].includes(country)) rate = rates['UK'];
                else if (country === 'United States') rate = rates['USA'];
                else if (country === 'United Kingdom') rate = rates['UK'];
            }

            if (rate) {
                // If fee is unreasonably low (like < 1000) it might be per semester or already converted or something else?
                // But user instructions are to convert. 
                // ETH Zurich was 1600 (CHF probably). 1600 * 95 = 152000 INR. Seems reasonable for sem/year.
                // Princeton 59810 * 84 = ~50 Lakhs. Reasonable.

                // We will overwrite the fee.
                // Check if it looks like it's already in INR (e.g. > 100000 and country is USA/UK)? 
                // No, Princeton is 59810. 59810 INR is too low for Princeton.
                // So we assume the values provided in the JSON are in local currency.

                const originalFee = college.fees;
                const convertedFee = Math.round(originalFee * rate);

                // console.log(`Converting ${college.name} (${country}): ${originalFee} -> ${convertedFee}`);
                updatedCount++;
                return {
                    ...college,
                    fees: convertedFee
                };
            } else {
                console.warn(`Rate not found for country: ${country}. Fee remains: ${college.fees}`);
                return college;
            }
        });

        fs.writeFileSync(filePath, JSON.stringify(updatedColleges, null, 4));
        console.log(`Successfully updated fees for ${updatedCount} colleges.`);

    } catch (error) {
        console.error("Error updating fees:", error);
    }
};

convertFees();
