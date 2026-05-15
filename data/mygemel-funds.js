/**
 * MyGemel Fund Data - Real data from igemel-net.co.il
 * Data source: https://www.igemel-net.co.il/
 * Last update: March 2026
 */

const MyGemelFunds = {
    meta: {
        lastUpdate: '2026-03',
        source: 'iGemel-Net',
        sourceUrls: {
            training: 'https://www.igemel-net.co.il/%D7%A7%D7%A8%D7%A0%D7%95%D7%AA-%D7%94%D7%A9%D7%AA%D7%9C%D7%9E%D7%95%D7%AA/',
            pension: 'https://www.igemel-net.co.il/%D7%A7%D7%A8%D7%A0%D7%95%D7%AA-%D7%A4%D7%A0%D7%A1%D7%99%D7%94/',
            gemel: 'https://www.igemel-net.co.il/%D7%92%D7%9E%D7%9C-%D7%9C%D7%94%D7%A9%D7%A7%D7%A2%D7%94/'
        }
    },

    // Training Funds - קרנות השתלמות (Real data from igemel-net.co.il)
    training: [
        {
            nameHe: "אינפיניטי השתלמות משולב סחיר",
            companyHe: "אינפיניטי",
            month: -1.47,
            year1: 57.4,
            year3: 138.01,
            year5: 142.89,
            fee: 0.59
        },
        {
            nameHe: "השתלמות משפטנים מניות",
            companyHe: "משפטנים",
            month: -4.95,
            year1: 39.42,
            year3: 99.17,
            year5: 95.23,
            fee: 0.41
        },
        {
            nameHe: "אינפיניטי השתלמות מניות",
            companyHe: "אינפיניטי",
            month: -3.9,
            year1: 29.58,
            year3: 81.45,
            year5: 91.97,
            fee: 0.59
        },
        {
            nameHe: "רעות - מניות",
            companyHe: "רעות",
            month: -4.62,
            year1: 28.25,
            year3: 82.69,
            year5: 88.97,
            fee: 0.45
        },
        {
            nameHe: "רום ספיר מניות",
            companyHe: "רום",
            month: -4.28,
            year1: 30.2,
            year3: 85.65,
            year5: 85.64,
            fee: 0.3
        },
        {
            nameHe: "עובדי מדינה - מניות",
            companyHe: "החברה",
            month: -4.6,
            year1: 28.42,
            year3: 79.02,
            year5: 82.26,
            fee: 0.38
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול מניות",
            companyHe: "ילין לפידות",
            month: -4.48,
            year1: 22.76,
            year3: 71.01,
            year5: 78.53,
            fee: 0.67
        },
        {
            nameHe: "אנליסט השתלמות מניות",
            companyHe: "אנליסט",
            month: -4.16,
            year1: 21.94,
            year3: 74.5,
            year5: 76.93,
            fee: 0.63
        },
        {
            nameHe: "מור השתלמות - מניות",
            companyHe: "מור",
            month: -4.25,
            year1: 26.15,
            year3: 74.55,
            year5: 76.53,
            fee: 0.71
        },
        {
            nameHe: "מיטב השתלמות מניות",
            companyHe: "מיטב",
            month: -4.83,
            year1: 28.57,
            year3: 76.54,
            year5: 76.14,
            fee: 0.55
        },
        {
            nameHe: "מגדל השתלמות מניות",
            companyHe: "מגדל",
            month: -4.56,
            year1: 28.66,
            year3: 75.66,
            year5: 75.69,
            fee: 0.49
        },
        {
            nameHe: "אומגה קרן השתלמות מסלול מניות",
            companyHe: "מנורה מבטחים",
            month: -4.96,
            year1: 30.76,
            year3: 77.05,
            year5: 75.33,
            fee: 0.44
        },
        {
            nameHe: "הראל השתלמות מסלול מניות",
            companyHe: "הראל",
            month: -4.76,
            year1: 28.96,
            year3: 71.41,
            year5: 75.26,
            fee: 0.53
        },
        {
            nameHe: "מינהל - השתלמות - מניות",
            companyHe: "מינהל",
            month: -3.53,
            year1: 28.15,
            year3: 79.07,
            year5: 74.33,
            fee: 0.55
        },
        {
            nameHe: "מנורה השתלמות מניות",
            companyHe: "מנורה מבטחים",
            month: -4.94,
            year1: 30.4,
            year3: 74.75,
            year5: 73.62,
            fee: 0.49
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע מניות",
            companyHe: "קרן",
            month: -4.74,
            year1: 29.27,
            year3: 71.17,
            year5: 72.95,
            fee: 0.19
        },
        {
            nameHe: "קרן השתלמות לאקדמאים במדעי החברה והרוח מסלול מניות",
            companyHe: "אקדמאים",
            month: -4.71,
            year1: 27.89,
            year3: 80.21,
            year5: 72.47,
            fee: 0.28
        },
        {
            nameHe: "הפניקס השתלמות מניות",
            companyHe: "הפניקס",
            month: -4.73,
            year1: 27.59,
            year3: 74.1,
            year5: 70.97,
            fee: 0.58
        },
        {
            nameHe: "הנדסאים השתלמות - מסלול מניות",
            companyHe: "הנדסאים",
            month: -5.21,
            year1: 24.57,
            year3: 67.08,
            year5: 69.03,
            fee: 0.35
        },
        {
            nameHe: "כלל השתלמות מניות",
            companyHe: "כלל",
            month: -4.81,
            year1: 31.71,
            year3: 73.99,
            year5: 68.04,
            fee: 0.53
        },
        {
            nameHe: "הפניקס השתלמות עוקב  מדד s&p500",
            companyHe: "הפניקס",
            month: -4.05,
            year1: 0.09,
            year3: 46.8,
            year5: 65.06,
            fee: 0.57
        },
        {
            nameHe: "מיטב השתלמות עוקב מדד S&P500",
            companyHe: "מיטב",
            month: -4.23,
            year1: 0.04,
            year3: 47.58,
            year5: 64.85,
            fee: 0.54
        },
        {
            nameHe: "כלל השתלמות עוקב  מדד s&p 500",
            companyHe: "כלל",
            month: -4.31,
            year1: -0.07,
            year3: 45.32,
            year5: 62.63,
            fee: 0.48
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים-מניות",
            companyHe: "יחד רופאים",
            month: -3.88,
            year1: 21.73,
            year3: 60.65,
            year5: 59.6,
            fee: 0.38
        },
        {
            nameHe: "מור השתלמות -עוקב מדד S&P 500",
            companyHe: "מור",
            month: -4.37,
            year1: 0.34,
            year3: 45.86,
            year5: 56.93,
            fee: 0.7
        },
        {
            nameHe: "השתלמות משפטנים",
            companyHe: "משפטנים",
            month: -2.17,
            year1: 20.27,
            year3: 51.54,
            year5: 56.39,
            fee: 0.42
        },
        {
            nameHe: "השתלמות שופטים",
            companyHe: "החברה",
            month: -2.2,
            year1: 18.68,
            year3: 48.32,
            year5: 52.96,
            fee: 0.33
        },
        {
            nameHe: "ק.ה.ר",
            companyHe: "ק.ה.ר",
            month: -2.25,
            year1: 21.15,
            year3: 52.75,
            year5: 52.53,
            fee: 1.02
        },
        {
            nameHe: "אינפיניטי השתלמות  כללי",
            companyHe: "אינפיניטי",
            month: -2.03,
            year1: 17.72,
            year3: 47.68,
            year5: 50.95,
            fee: 0.6
        },
        {
            nameHe: "קרן השתלמות למורים בבתיה\"ס העי\"ס במכללות ובסמינרים מסלול כללי",
            companyHe: "עגור",
            month: -2.6,
            year1: 15.5,
            year3: 43.89,
            year5: 50.53,
            fee: 0.19
        },
        {
            nameHe: "אנליסט השתלמות כללי",
            companyHe: "אנליסט",
            month: -1.62,
            year1: 14.45,
            year3: 46.61,
            year5: 50.47,
            fee: 0.62
        },
        {
            nameHe: "קרן השתלמות למורים בבתי הספר העי\"ס במכללות ובסמינרים מסלול כללי",
            companyHe: "עגור",
            month: -2.55,
            year1: 15.34,
            year3: 43.63,
            year5: 49.36,
            fee: 0.2
        },
        {
            nameHe: "עובדי מדינה - כללי",
            companyHe: "החברה",
            month: -2.42,
            year1: 16.34,
            year3: 45.29,
            year5: 49.18,
            fee: 0.38
        },
        {
            nameHe: "מור השתלמות - כללי",
            companyHe: "מור",
            month: -1.83,
            year1: 14.51,
            year3: 42.58,
            year5: 48.97,
            fee: 0.7
        },
        {
            nameHe: "מיטב השתלמות כללי",
            companyHe: "מיטב",
            month: -2.44,
            year1: 15.12,
            year3: 42.68,
            year5: 47.67,
            fee: 0.6
        },
        {
            nameHe: "מנורה השתלמות מניות סחיר",
            companyHe: "מנורה מבטחים",
            month: -7.28,
            year1: 9.2,
            year3: 45.3,
            year5: 47.09,
            fee: 0.5
        },
        {
            nameHe: "רום קלאסי כללי",
            companyHe: "רום",
            month: -2.31,
            year1: 16.87,
            year3: 43.83,
            year5: 46.66,
            fee: 0.31
        },
        {
            nameHe: "אלטשולר שחם השתלמות מניות",
            companyHe: "אלטשולר שחם",
            month: -5,
            year1: 21.47,
            year3: 61.58,
            year5: 46.57,
            fee: 0.68
        },
        {
            nameHe: "קרן השתלמות עובדי חברת חשמל",
            companyHe: "החברה",
            month: -2.29,
            year1: 17.67,
            year3: 46.85,
            year5: 46.17,
            fee: 0.34
        },
        {
            nameHe: "ק.ל.ע מסלול כללי",
            companyHe: "ק.ל.ע.",
            month: -2.48,
            year1: 16.83,
            year3: 45.25,
            year5: 45.54,
            fee: 0.49
        },
        {
            nameHe: "כלל השתלמות כללי",
            companyHe: "כלל",
            month: -2.25,
            year1: 17.94,
            year3: 42.69,
            year5: 45.3,
            fee: 0.54
        },
        {
            nameHe: "אומגה השתלמות מסלול כללי",
            companyHe: "מנורה מבטחים",
            month: -2.86,
            year1: 16.51,
            year3: 43.33,
            year5: 45.15,
            fee: 0.54
        },
        {
            nameHe: "מורים תיכוניים - מסלול כללי",
            companyHe: "מור",
            month: -1.47,
            year1: 16.51,
            year3: 43.03,
            year5: 45.1,
            fee: 0.12
        },
        {
            nameHe: "מורים תיכוניים - מסלול כללי",
            companyHe: "מור",
            month: -1.48,
            year1: 16.53,
            year3: 43.23,
            year5: 45.05,
            fee: 0.12
        },
        {
            nameHe: "קרן השתלמות לעובדי בנק ישראל",
            companyHe: "מיטב",
            month: -2.71,
            year1: 14.77,
            year3: 42.42,
            year5: 45.04,
            fee: 0.38
        },
        {
            nameHe: "הפניקס השתלמות כללי",
            companyHe: "הפניקס",
            month: -2.63,
            year1: 15.21,
            year3: 42.91,
            year5: 44.96,
            fee: 0.65
        },
        {
            nameHe: "מגדל השתלמות כללי",
            companyHe: "מגדל",
            month: -2.28,
            year1: 15.16,
            year3: 39.76,
            year5: 44.73,
            fee: 0.54
        },
        {
            nameHe: "מורים וגננות - מסלול כללי",
            companyHe: "מור",
            month: -1.45,
            year1: 16.05,
            year3: 42.87,
            year5: 43.62,
            fee: 0.12
        },
        {
            nameHe: "מנורה השתלמות כללי",
            companyHe: "מנורה מבטחים",
            month: -2.58,
            year1: 16.84,
            year3: 40.86,
            year5: 43.6,
            fee: 0.63
        },
        {
            nameHe: "קרן השתלמות עוצ\"מ",
            companyHe: "עוצ\"מ",
            month: -1.87,
            year1: 22.81,
            year3: 50.85,
            year5: 43.2,
            fee: 0.6
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול כללי",
            companyHe: "ילין לפידות",
            month: -2.78,
            year1: 12.06,
            year3: 39.5,
            year5: 43.12,
            fee: 0.68
        },
        {
            nameHe: "מורים וגננות - מסלול כללי",
            companyHe: "מור",
            month: -1.55,
            year1: 16.19,
            year3: 42.61,
            year5: 42.79,
            fee: 0.12
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע כללי",
            companyHe: "קרן",
            month: -2.62,
            year1: 14.89,
            year3: 37.41,
            year5: 41.88,
            fee: 0.21
        },
        {
            nameHe: "הנדסאים השתלמות - מסלול כללי",
            companyHe: "הנדסאים",
            month: -2.37,
            year1: 15.37,
            year3: 42.17,
            year5: 41.44,
            fee: 0.35
        },
        {
            nameHe: "הראל השתלמות כללי",
            companyHe: "הראל",
            month: -2.66,
            year1: 14.83,
            year3: 36.34,
            year5: 41.21,
            fee: 0.6
        },
        {
            nameHe: "רעות-כללי",
            companyHe: "רעות",
            month: -2.23,
            year1: 16.12,
            year3: 41.37,
            year5: 41.15,
            fee: 0.46
        },
        {
            nameHe: "אחים ואחיות - מסלול כללי",
            companyHe: "יהב",
            month: -2.13,
            year1: 16.12,
            year3: 40.82,
            year5: 40.59,
            fee: 0.27
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים- כללי",
            companyHe: "יחד רופאים",
            month: -1.67,
            year1: 13.23,
            year3: 36.68,
            year5: 40.46,
            fee: 0.38
        },
        {
            nameHe: "הראל השתלמות מסלול הלכה",
            companyHe: "הראל",
            month: -2.71,
            year1: 16.84,
            year3: 39.1,
            year5: 39.6,
            fee: 0.67
        },
        {
            nameHe: "הפניקס השתלמות הלכה",
            companyHe: "הפניקס",
            month: -3.06,
            year1: 14.52,
            year3: 40.63,
            year5: 39.59,
            fee: 0.66
        },
        {
            nameHe: "קרן השתלמות לאקדמאים במדעי החברה והרוח מסלול כללי",
            companyHe: "אקדמאים",
            month: -2.8,
            year1: 14.59,
            year3: 40.21,
            year5: 39.05,
            fee: 0.28
        },
        {
            nameHe: "קרן השתלמות של עובדי האוניברסיטה העברית כללי",
            companyHe: "חברת",
            month: -1.97,
            year1: 10.57,
            year3: 32.79,
            year5: 38.94,
            fee: 0.44
        },
        {
            nameHe: "עובדי המדינה הלכתי הלכה יהודית",
            companyHe: "החברה",
            month: -2.41,
            year1: 14.7,
            year3: 36.83,
            year5: 38.35,
            fee: 0.38
        },
        {
            nameHe: "מינהל-השתלמות - כללי",
            companyHe: "מינהל",
            month: -1.65,
            year1: 16.61,
            year3: 40.86,
            year5: 38.27,
            fee: 0.56
        },
        {
            nameHe: "ק.ס.מ",
            companyHe: "החברה",
            month: -2.35,
            year1: 14.37,
            year3: 38.71,
            year5: 37.95,
            fee: 0.51
        },
        {
            nameHe: "מיטב השתלמות כהלכה",
            companyHe: "מיטב",
            month: -2.68,
            year1: 14.67,
            year3: 37.02,
            year5: 37.06,
            fee: 0.72
        },
        {
            nameHe: "מגדל השתלמות  הלכה",
            companyHe: "מגדל",
            month: -2.63,
            year1: 15.2,
            year3: 39.01,
            year5: 37.02,
            fee: 0.59
        },
        {
            nameHe: "רום הלכה",
            companyHe: "רום",
            month: -2.09,
            year1: 13.52,
            year3: 35.52,
            year5: 36.99,
            fee: 0.31
        },
        {
            nameHe: "כלל השתלמות הלכה",
            companyHe: "כלל",
            month: -2.53,
            year1: 16.34,
            year3: 39.12,
            year5: 36.84,
            fee: 0.56
        },
        {
            nameHe: "קרן השתלמות למורים בבתי הספר העי\"ס במכללות ובסמינרים מסלול הלכה",
            companyHe: "עגור",
            month: -2.46,
            year1: 14.2,
            year3: 36.49,
            year5: 36.78,
            fee: 0.17
        },
        {
            nameHe: "קרן השתלמות למורים בבתיה\"ס העי\"ס במכללות ובסמינרים מסלול הלכה",
            companyHe: "עגור",
            month: -2.38,
            year1: 13.43,
            year3: 35.36,
            year5: 35.89,
            fee: 0.2
        },
        {
            nameHe: "מנורה השתלמות עוקב מדדים גמיש",
            companyHe: "מנורה מבטחים",
            month: -2.32,
            year1: 12.06,
            year3: 38.01,
            year5: 35.46,
            fee: 0.62
        },
        {
            nameHe: "מורים וגננות - מסלול הלכה",
            companyHe: "מור",
            month: -2.56,
            year1: 13.22,
            year3: 37.5,
            year5: 34.69,
            fee: 0.12
        },
        {
            nameHe: "מורים תיכוניים - מסלול הלכה",
            companyHe: "מור",
            month: -2.61,
            year1: 13.06,
            year3: 37.18,
            year5: 33.96,
            fee: 0.12
        },
        {
            nameHe: "מור השתלמות - אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "מור",
            month: -0.8,
            year1: 8.37,
            year3: 29.7,
            year5: 33.57,
            fee: 0.68
        },
        {
            nameHe: "מורים תיכוניים - מסלול הלכה",
            companyHe: "מור",
            month: -2.61,
            year1: 12.9,
            year3: 36.52,
            year5: 33.53,
            fee: 0.12
        },
        {
            nameHe: "מורים וגננות - מסלול הלכה",
            companyHe: "מור",
            month: -2.63,
            year1: 13.06,
            year3: 37.03,
            year5: 33.45,
            fee: 0.12
        },
        {
            nameHe: "פ.ר.ח - כללי",
            companyHe: "יהב",
            month: -1.45,
            year1: 14.07,
            year3: 36.91,
            year5: 32.92,
            fee: 0.76
        },
        {
            nameHe: "הפניקס השתלמות שריעה",
            companyHe: "הפניקס",
            month: -3.73,
            year1: 5.43,
            year3: 36.02,
            year5: 32.58,
            fee: 0.67
        },
        {
            nameHe: "אלטשולר שחם השתלמות כללי ב'",
            companyHe: "אלטשולר שחם",
            month: -3.34,
            year1: 14.33,
            year3: 39.45,
            year5: 32.47,
            fee: 0.69
        },
        {
            nameHe: "מיטב השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "מיטב",
            month: -1.62,
            year1: 10.15,
            year3: 30.86,
            year5: 30.91,
            fee: 0.57
        },
        {
            nameHe: "אלטשולר שחם השתלמות כללי",
            companyHe: "אלטשולר שחם",
            month: -2.59,
            year1: 12.52,
            year3: 35.44,
            year5: 30.34,
            fee: 0.69
        },
        {
            nameHe: "מיטב השתלמות עוקב מדדים גמיש",
            companyHe: "מיטב",
            month: -3.8,
            year1: 1.82,
            year3: 28.16,
            year5: 29.45,
            fee: 0.63
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול אג\"ח עם מניות (עד 25% מניות)",
            companyHe: "ילין לפידות",
            month: -1.95,
            year1: 7.13,
            year3: 25.94,
            year5: 28.55,
            fee: 0.7
        },
        {
            nameHe: "אלטשולר שחם השתלמות הלכה",
            companyHe: "אלטשולר שחם",
            month: -3.32,
            year1: 11.48,
            year3: 33.96,
            year5: 27.85,
            fee: 0.74
        },
        {
            nameHe: "מנורה השתלמות אשראי ואג\"ח",
            companyHe: "מנורה מבטחים",
            month: -1.74,
            year1: 8.87,
            year3: 26.83,
            year5: 25.54,
            fee: 0.47
        },
        {
            nameHe: "אנליסט השתלמות אשראי ואג\"ח עד 25% מניות",
            companyHe: "אנליסט",
            month: -0.95,
            year1: 10.02,
            year3: 27.99,
            year5: 25.41,
            fee: 0.5
        },
        {
            nameHe: "הראל השתלמות משולב סחיר",
            companyHe: "הראל",
            month: -3.68,
            year1: -1.14,
            year3: 23.76,
            year5: 25.35,
            fee: 0.54
        },
        {
            nameHe: "אינפיניטי השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "אינפיניטי",
            month: -1.65,
            year1: 9.35,
            year3: 28.19,
            year5: 23.54,
            fee: 0.34
        },
        {
            nameHe: "מיטב השתלמות אשראי ואג\"ח",
            companyHe: "מיטב",
            month: -0.61,
            year1: 5.82,
            year3: 19.11,
            year5: 23.35,
            fee: 0.59
        },
        {
            nameHe: "רעות - אשראי ואג\"ח עד 25% מניות",
            companyHe: "רעות",
            month: -1.42,
            year1: 10.85,
            year3: 24.17,
            year5: 23.26,
            fee: 0.46
        },
        {
            nameHe: "כלל השתלמות אשראי ואג\"ח עם מניות(עד 25% מניות)",
            companyHe: "כלל",
            month: -1.04,
            year1: 9.83,
            year3: 26.71,
            year5: 23.17,
            fee: 0.51
        },
        {
            nameHe: "אנליסט השתלמות משולב סחיר",
            companyHe: "אנליסט",
            month: -2.13,
            year1: -6.53,
            year3: 17.83,
            year5: 23.02,
            fee: 0.62
        },
        {
            nameHe: "עובדי מדינה - משולב-אג\"ח עד 25 אחוז מניות",
            companyHe: "החברה",
            month: -1.42,
            year1: 8.44,
            year3: 23.43,
            year5: 22.36,
            fee: 0.38
        },
        {
            nameHe: "הפניקס השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "הפניקס",
            month: -0.81,
            year1: 6.93,
            year3: 23.75,
            year5: 22.12,
            fee: 0.63
        },
        {
            nameHe: "הראל השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "הראל",
            month: -0.96,
            year1: 5.72,
            year3: 19.29,
            year5: 22.03,
            fee: 0.55
        },
        {
            nameHe: "ק.ל.ע אג\"ח עד 25% מניות",
            companyHe: "ק.ל.ע.",
            month: -1.62,
            year1: 8.39,
            year3: 24.15,
            year5: 21.87,
            fee: 0.49
        },
        {
            nameHe: "אומגה השתלמות עד 25% מניות",
            companyHe: "מנורה מבטחים",
            month: -1.49,
            year1: 6.85,
            year3: 24.4,
            year5: 21.48,
            fee: 0.48
        },
        {
            nameHe: "אלטשולר שחם השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "אלטשולר שחם",
            month: -1.22,
            year1: 7.14,
            year3: 20.57,
            year5: 20.93,
            fee: 0.7
        },
        {
            nameHe: "אינפיניטי השתלמות אשראי ואג\"ח",
            companyHe: "אינפיניטי",
            month: -0.83,
            year1: 6.87,
            year3: 22.52,
            year5: 20.16,
            fee: 0.68
        }
    ],

    // Pension Funds - קרנות פנסיה (Real data from igemel-net.co.il)
    pension: [
        {
            nameHe: "מיטב פנסיה מקיפה עוקב מדדי מניות",
            companyHe: "מיטב",
            month: -4.31,
            year1: 18.91,
            year3: 63.11,
            year5: 80.97,
            fee: 1.31
        },
        {
            nameHe: "מגדל מקפת משלימה מניות",
            companyHe: "מגדל",
            month: -4.67,
            year1: 29.04,
            year3: 74.18,
            year5: 75.54,
            fee: 1.02
        },
        {
            nameHe: "מיטב פנסיה כללית מניות",
            companyHe: "מיטב",
            month: -4.78,
            year1: 28.38,
            year3: 75.26,
            year5: 74.63,
            fee: 1.11
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מניות",
            companyHe: "הפניקס",
            month: -4.99,
            year1: 28.25,
            year3: 73.73,
            year5: 72.92,
            fee: 1.29
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול מניות",
            companyHe: "מנורה מבטחים",
            month: -3.51,
            year1: 23.1,
            year3: 60.75,
            year5: 72.74,
            fee: 1.73
        },
        {
            nameHe: "הראל פנסיה כללית מניות",
            companyHe: "הראל",
            month: -4.87,
            year1: 28.71,
            year3: 70.9,
            year5: 71.08,
            fee: 1.13
        },
        {
            nameHe: "מגדל מקפת אישית מניות",
            companyHe: "מגדל",
            month: -3.14,
            year1: 22.32,
            year3: 59.26,
            year5: 69.16,
            fee: 1.61
        },
        {
            nameHe: "מיטב פנסיה מקיפה מניות",
            companyHe: "מיטב",
            month: -3.32,
            year1: 21.3,
            year3: 58.99,
            year5: 69,
            fee: 1.31
        },
        {
            nameHe: "הראל פנסיה - מניות",
            companyHe: "הראל",
            month: -3.29,
            year1: 21.4,
            year3: 55.63,
            year5: 67.54,
            fee: 1.51
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מניות",
            companyHe: "הפניקס",
            month: -3.51,
            year1: 22.41,
            year3: 59.01,
            year5: 66.39,
            fee: 1.55
        },
        {
            nameHe: "כלל פנסיה מניות",
            companyHe: "כלל",
            month: -3.35,
            year1: 23.42,
            year3: 57.29,
            year5: 65.02,
            fee: 1.54
        },
        {
            nameHe: "מיטב פנסיה מקיפה עוקב מדד S&P500",
            companyHe: "מיטב",
            month: -2.85,
            year1: 2.17,
            year3: 40.88,
            year5: 64.88,
            fee: 1.31
        },
        {
            nameHe: "הפניקס פנסיה מקיפה  - מסלול לבני 50 ומטה",
            companyHe: "הפניקס",
            month: -2.4,
            year1: 18.49,
            year3: 51.02,
            year5: 64.8,
            fee: 1.55
        },
        {
            nameHe: "הראל פנסיה כללית עוקב מדד s&p",
            companyHe: "הראל",
            month: -4.22,
            year1: 0.33,
            year3: 46.52,
            year5: 64.04,
            fee: 1.13
        },
        {
            nameHe: "מיטב פנסיה כללית עוקב מדד S&P500",
            companyHe: "מיטב",
            month: -4.23,
            year1: 0.02,
            year3: 47.68,
            year5: 63.57,
            fee: 1.11
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2055",
            companyHe: "מנורה מבטחים",
            month: -2.62,
            year1: 19.99,
            year3: 50.14,
            year5: 63.51,
            fee: 1.73
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2060",
            companyHe: "מנורה מבטחים",
            month: -2.68,
            year1: 20.35,
            year3: 50.71,
            year5: 62.45,
            fee: 1.73
        },
        {
            nameHe: "מיטב פנסיה מקיפה לבני 50 ומטה",
            companyHe: "מיטב",
            month: -2.55,
            year1: 17.71,
            year3: 50.15,
            year5: 61.67,
            fee: 1.31
        },
        {
            nameHe: "הפניקס פנסיה מקיפה עוקב מדד S&P500",
            companyHe: "הפניקס",
            month: -2.79,
            year1: 2.03,
            year3: 38.06,
            year5: 61.2,
            fee: 1.55
        },
        {
            nameHe: "כלל פנסיה לבני 50 ומטה",
            companyHe: "כלל",
            month: -2.3,
            year1: 20.32,
            year3: 48.81,
            year5: 60.85,
            fee: 1.54
        },
        {
            nameHe: "הראל פנסיה עוקב מדד s&p 500",
            companyHe: "הראל",
            month: -2.88,
            year1: 2.19,
            year3: 40.91,
            year5: 60.81,
            fee: 1.13
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2050",
            companyHe: "מנורה מבטחים",
            month: -2.6,
            year1: 18.67,
            year3: 47.14,
            year5: 60.3,
            fee: 1.73
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2045",
            companyHe: "מנורה מבטחים",
            month: -2.53,
            year1: 17.96,
            year3: 45.45,
            year5: 59.18,
            fee: 1.73
        },
        {
            nameHe: "מנורה מבטחים פנסיה יעד לפרישה 2065",
            companyHe: "מנורה מבטחים",
            month: -2.78,
            year1: 20.67,
            year3: 51.83,
            year5: 58.89,
            fee: 1.73
        },
        {
            nameHe: "מיטב פנסיה מקיפה לבני 50 עד 60",
            companyHe: "מיטב",
            month: -2.12,
            year1: 15.6,
            year3: 45.41,
            year5: 58.41,
            fee: 1.31
        },
        {
            nameHe: "מגדל מקפת אישית לבני 50 ומטה",
            companyHe: "מגדל",
            month: -2.6,
            year1: 18.13,
            year3: 46.85,
            year5: 58.1,
            fee: 1.61
        },
        {
            nameHe: "מנורה מבטחים פנסיה - כללי",
            companyHe: "מנורה מבטחים",
            month: -2.41,
            year1: 17.33,
            year3: 44.49,
            year5: 57.71,
            fee: 1.73
        },
        {
            nameHe: "מגדל מקפת אישית כללי",
            companyHe: "מגדל",
            month: -1.92,
            year1: 16.32,
            year3: 42.34,
            year5: 57.38,
            fee: 1.61
        },
        {
            nameHe: "מגדל מקפת אישית עוקב מדדים למקבלי קצבה",
            companyHe: "מגדל",
            month: -1.82,
            year1: 13.34,
            year3: 39.79,
            year5: 57.12,
            fee: 1.61
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול לבני 50 עד 60",
            companyHe: "הפניקס",
            month: -2.22,
            year1: 16.23,
            year3: 46.02,
            year5: 56.65,
            fee: 1.55
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2040",
            companyHe: "מנורה מבטחים",
            month: -2.2,
            year1: 17.06,
            year3: 43.78,
            year5: 56.16,
            fee: 1.73
        },
        {
            nameHe: "כלל פנסיה כללי",
            companyHe: "כלל",
            month: -2.09,
            year1: 17.85,
            year3: 43.4,
            year5: 55.27,
            fee: 1.54
        },
        {
            nameHe: "הראל פנסיה - גילאי 50 ומטה",
            companyHe: "הראל",
            month: -2.48,
            year1: 17.45,
            year3: 43.12,
            year5: 54.79,
            fee: 1.51
        },
        {
            nameHe: "כלל פנסיה לבני 50-60",
            companyHe: "כלל",
            month: -2.1,
            year1: 17.22,
            year3: 43.5,
            year5: 54,
            fee: 1.54
        },
        {
            nameHe: "הראל פנסיה - הלכה",
            companyHe: "הראל",
            month: -2.09,
            year1: 17.56,
            year3: 44.47,
            year5: 53.7,
            fee: 1.51
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול הלכה",
            companyHe: "הפניקס",
            month: -2.06,
            year1: 16.45,
            year3: 43.55,
            year5: 52.97,
            fee: 1.55
        },
        {
            nameHe: "מגדל מקפת אישית לבני 50 עד 60",
            companyHe: "מגדל",
            month: -2.17,
            year1: 15.57,
            year3: 41.9,
            year5: 52.19,
            fee: 1.61
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2060",
            companyHe: "מנורה מבטחים",
            month: -2.96,
            year1: 19.81,
            year3: 48.45,
            year5: 51.1,
            fee: 1.06
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2055",
            companyHe: "מנורה מבטחים",
            month: -2.91,
            year1: 19.57,
            year3: 48.01,
            year5: 51.01,
            fee: 1.06
        },
        {
            nameHe: "מגדל מקפת אישית הלכה",
            companyHe: "מגדל",
            month: -2.14,
            year1: 16.09,
            year3: 42.48,
            year5: 50.85,
            fee: 1.61
        },
        {
            nameHe: "הראל  פנסיה - גילעד כללי",
            companyHe: "הראל",
            month: -2.06,
            year1: 14.99,
            year3: 38.77,
            year5: 50.5,
            fee: 1.51
        },
        {
            nameHe: "הראל פנסיה - מנוף כללי",
            companyHe: "הראל",
            month: -2.13,
            year1: 14.89,
            year3: 38.84,
            year5: 50.5,
            fee: 1.51
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2035",
            companyHe: "מנורה מבטחים",
            month: -1.99,
            year1: 14.22,
            year3: 38.9,
            year5: 50.42,
            fee: 1.73
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2045",
            companyHe: "מנורה מבטחים",
            month: -2.83,
            year1: 18.06,
            year3: 45.23,
            year5: 49.86,
            fee: 1.06
        },
        {
            nameHe: "הראל פנסיה - גילאי 50 עד 60",
            companyHe: "הראל",
            month: -2.28,
            year1: 14.86,
            year3: 38.59,
            year5: 49.43,
            fee: 1.51
        },
        {
            nameHe: "כלל פנסיה הלכה",
            companyHe: "כלל",
            month: -2.12,
            year1: 16.86,
            year3: 42.5,
            year5: 49.42,
            fee: 1.54
        },
        {
            nameHe: "מנורה מבטחים משלימה -יעד לפרישה 2050",
            companyHe: "מנורה מבטחים",
            month: -2.86,
            year1: 18.96,
            year3: 46.55,
            year5: 49.34,
            fee: 1.06
        },
        {
            nameHe: "מיטב פנסיה מקיפה הלכה",
            companyHe: "מיטב",
            month: -2.2,
            year1: 15.59,
            year3: 41.31,
            year5: 49.31,
            fee: 1.31
        },
        {
            nameHe: "מיטב פנסיה כללית לבני 50 ומטה",
            companyHe: "מיטב",
            month: -3.02,
            year1: 17.59,
            year3: 48.38,
            year5: 49.25,
            fee: 1.11
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה מניות",
            companyHe: "אלטשולר שחם",
            month: -3.55,
            year1: 17.46,
            year3: 52.86,
            year5: 49.24,
            fee: 1.3
        },
        {
            nameHe: "מיטב פנסיה מקיפה הלכה למקבלי קצבה",
            companyHe: "מיטב",
            month: null,
            year1: 11.32,
            year3: 32.94,
            year5: 48.75,
            fee: 1.31
        },
        {
            nameHe: "מגדל מקפת אישית הלכה למקבלי קצבה",
            companyHe: "מגדל",
            month: null,
            year1: 10.55,
            year3: 31.8,
            year5: 47.74,
            fee: 1.61
        },
        {
            nameHe: "מנורה מבטחים פנסיה בסיסי למקבלי קצבה",
            companyHe: "מנורה מבטחים",
            month: null,
            year1: 10.29,
            year3: 31.15,
            year5: 47.69,
            fee: 1.73
        },
        {
            nameHe: "כלל פנסיה משלימה לבני 50 ומטה",
            companyHe: "כלל",
            month: -2.56,
            year1: 20.15,
            year3: 47.14,
            year5: 47.62,
            fee: 1.02
        },
        {
            nameHe: "מנורה מבטחים משלימה יעד לפרישה 2065",
            companyHe: "מנורה מבטחים",
            month: -3.4,
            year1: 19.83,
            year3: 48.58,
            year5: 47.29,
            fee: 1.06
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה למקבלי קצבה קיימים",
            companyHe: "אלטשולר שחם",
            month: null,
            year1: 8.07,
            year3: 29.26,
            year5: 47.27,
            fee: 1.37
        },
        {
            nameHe: "מגדל מקפת אישית בסיסי למקבלי קצבה",
            companyHe: "מגדל",
            month: null,
            year1: 9.47,
            year3: 30.18,
            year5: 47.22,
            fee: 1.61
        },
        {
            nameHe: "מנורה מבטחים פנסיה עוקב מדדי מניות",
            companyHe: "מנורה מבטחים",
            month: -3.13,
            year1: 6.71,
            year3: 35.98,
            year5: 47.22,
            fee: 1.73
        },
        {
            nameHe: "מיטב פנסיה מקיפה בסיסי למקבלי קצבה",
            companyHe: "מיטב",
            month: null,
            year1: 9.32,
            year3: 31.9,
            year5: 47.13,
            fee: 1.31
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מסלול לבני 50 ומטה",
            companyHe: "הפניקס",
            month: -3.03,
            year1: 17.69,
            year3: 47.09,
            year5: 46.96,
            fee: 1.55
        },
        {
            nameHe: "מגדל מקפת משלימה לבני 50 ומטה",
            companyHe: "מגדל",
            month: -2.96,
            year1: 17.58,
            year3: 45.38,
            year5: 46.82,
            fee: 1.02
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול בסיסי למקבלי קצבה",
            companyHe: "הפניקס",
            month: null,
            year1: 9.85,
            year3: 31.72,
            year5: 46.68,
            fee: 1.55
        },
        {
            nameHe: "הראל פנסיה -  הלכה למקבלי קצבה",
            companyHe: "הראל",
            month: -8,
            year1: 10.97,
            year3: 29.96,
            year5: 46.66,
            fee: 1.51
        },
        {
            nameHe: "כלל פנסיה מסלול בסיסי למקבלי קצבה",
            companyHe: "כלל",
            month: null,
            year1: 9.37,
            year3: 28.99,
            year5: 46.21,
            fee: 1.54
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה מסלול לבני 50 ומטה",
            companyHe: "אלטשולר שחם",
            month: -2.56,
            year1: 15.61,
            year3: 45.79,
            year5: 45.95,
            fee: 1.3
        },
        {
            nameHe: "כלל פנסיה מסלול הלכה למקבלי קצבה",
            companyHe: "כלל",
            month: null,
            year1: 9.48,
            year3: 30.37,
            year5: 45.76,
            fee: 1.54
        },
        {
            nameHe: "הראל פנסיה כללית - גילאי 50 ומטה",
            companyHe: "הראל",
            month: -2.98,
            year1: 19,
            year3: 44.32,
            year5: 45.73,
            fee: 1.13
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה בסיסי למקבלי קצבה",
            companyHe: "אלטשולר שחם",
            month: null,
            year1: 8.12,
            year3: 28.53,
            year5: 45.43,
            fee: 1.3
        },
        {
            nameHe: "מנורה מבטחים משלימה עוקב מדדי מניות",
            companyHe: "מנורה מבטחים",
            month: -4.46,
            year1: 6.46,
            year3: 39.98,
            year5: 45.17,
            fee: 1.06
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית מניות",
            companyHe: "אלטשולר שחם",
            month: -5.54,
            year1: 20.24,
            year3: 61.32,
            year5: 44.38,
            fee: 1.34
        },
        {
            nameHe: "הראל  פנסיה - בסיסי למקבלי קצבה",
            companyHe: "הראל",
            month: null,
            year1: 9.57,
            year3: 28.47,
            year5: 43.92,
            fee: 1.51
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2030",
            companyHe: "מנורה מבטחים",
            month: -1.46,
            year1: 11.96,
            year3: 32.45,
            year5: 43.76,
            fee: 1.73
        },
        {
            nameHe: "מיטב פנסיה כללית לבני 50 עד 60",
            companyHe: "מיטב",
            month: -2.63,
            year1: 15.18,
            year3: 43.04,
            year5: 43.54,
            fee: 1.11
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2040",
            companyHe: "מנורה מבטחים",
            month: -2.58,
            year1: 15.69,
            year3: 40.1,
            year5: 43.45,
            fee: 1.06
        },
        {
            nameHe: "מגדל מקפת משלימה כללי",
            companyHe: "מגדל",
            month: -2.3,
            year1: 15.56,
            year3: 41.09,
            year5: 43.29,
            fee: 1.02
        },
        {
            nameHe: "מיטב פנסיה מקיפה לבני 60 ומעלה",
            companyHe: "מיטב",
            month: -1.32,
            year1: 11.48,
            year3: 34.94,
            year5: 43.18,
            fee: 1.31
        },
        {
            nameHe: "כלל פנסיה משלימה - כללי",
            companyHe: "כלל",
            month: -2.3,
            year1: 17.94,
            year3: 40.9,
            year5: 42.79,
            fee: 0.98
        },
        {
            nameHe: "כלל פנסיה כללי",
            companyHe: "כלל",
            month: 2.15,
            year1: 9.46,
            year3: 20.26,
            year5: 42.46,
            fee: 1.54
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה מסלול לבני 50-60",
            companyHe: "אלטשולר שחם",
            month: -2.62,
            year1: 13.24,
            year3: 40.96,
            year5: 42.1,
            fee: 1.3
        },
        {
            nameHe: "הפניקס פנסיה מקיפה מסלול פאסיבי לבני 50 ומטה",
            companyHe: "הפניקס",
            month: 1.16,
            year1: 12.94,
            year3: 20.68,
            year5: 41.82,
            fee: 1.55
        },
        {
            nameHe: "כלל פנסיה לבני 60 ומעלה",
            companyHe: "כלל",
            month: -1.27,
            year1: 12.49,
            year3: 32.15,
            year5: 41.6,
            fee: 1.54
        },
        {
            nameHe: "כלל פנסיה משלימה לבני 50 עד 60",
            companyHe: "כלל",
            month: -2.35,
            year1: 16.74,
            year3: 40.84,
            year5: 41.23,
            fee: 0.98
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2025",
            companyHe: "מנורה מבטחים",
            month: 0.73,
            year1: 11.31,
            year3: 31.09,
            year5: 41.2,
            fee: 1.73
        },
        {
            nameHe: "מנורה מבטחים פנסיה קצבה לזכאים קיימים",
            companyHe: "מנורה מבטחים",
            month: 0.22,
            year1: 6.59,
            year3: 21.95,
            year5: 40.6,
            fee: 1.73
        },
        {
            nameHe: "כלל פנסיה קצבה לזכאים קיימים",
            companyHe: "כלל",
            month: 0.45,
            year1: 6.76,
            year3: 23.09,
            year5: 40.56,
            fee: 1.54
        },
        {
            nameHe: "מגדל מקפת משלימה לבני 50 עד 60",
            companyHe: "מגדל",
            month: -2.51,
            year1: 15.33,
            year3: 39.78,
            year5: 40.25,
            fee: 1.02
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול לבני 60 ומעלה",
            companyHe: "הפניקס",
            month: -1.61,
            year1: 10.86,
            year3: 33.15,
            year5: 40.23,
            fee: 1.55
        },
        {
            nameHe: "מיטב פנסיה כללית הלכה",
            companyHe: "מיטב",
            month: -2.79,
            year1: 14,
            year3: 34.14,
            year5: 40.04,
            fee: 1.11
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול הלכה",
            companyHe: "מנורה מבטחים",
            month: -2.42,
            year1: 15.09,
            year3: 36.86,
            year5: 39.91,
            fee: 1.73
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה הלכה",
            companyHe: "אלטשולר שחם",
            month: -2.83,
            year1: 11.69,
            year3: 38.48,
            year5: 39.53,
            fee: 1.3
        },
        {
            nameHe: "מגדל מקפת אישית לבני 60 ומעלה",
            companyHe: "מגדל",
            month: -1.52,
            year1: 10.96,
            year3: 31.23,
            year5: 39.36,
            fee: 1.61
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2035",
            companyHe: "מנורה מבטחים",
            month: -2.44,
            year1: 14.32,
            year3: 36.47,
            year5: 38.73,
            fee: 1.06
        },
        {
            nameHe: "הראל פנסיה כללית - כללי",
            companyHe: "הראל",
            month: -2.54,
            year1: 14.35,
            year3: 35.19,
            year5: 38.22,
            fee: 1.13
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מסלול לבני 50 עד 60",
            companyHe: "הפניקס",
            month: -2.93,
            year1: 15.23,
            year3: 40.85,
            year5: 38.21,
            fee: 1.55
        },
        {
            nameHe: "מגדל מקפת משלימה הלכה",
            companyHe: "מגדל",
            month: -2.52,
            year1: 15.7,
            year3: 39.2,
            year5: 37.6,
            fee: 1.02
        },
        {
            nameHe: "הראל פנסיה כללית - גילאי 50 עד 60",
            companyHe: "הראל",
            month: -2.81,
            year1: 14.99,
            year3: 37.56,
            year5: 37.1,
            fee: 1.13
        },
        {
            nameHe: "הראל פנסיה - גילאי 60 ומעלה",
            companyHe: "הראל",
            month: -1.46,
            year1: 11.23,
            year3: 29.2,
            year5: 36.83,
            fee: 1.51
        },
        {
            nameHe: "הפניקס פנסיה מקיפה מסלול פאסיבי לבני 50 עד 60",
            companyHe: "הפניקס",
            month: 0.98,
            year1: 11.43,
            year3: 18.73,
            year5: 36.5,
            fee: 1.55
        },
        {
            nameHe: "מגדל מקפת אישית קצבה לזכאים קיימים",
            companyHe: "מגדל",
            month: 0.1,
            year1: 6.89,
            year3: 20.46,
            year5: 36.45,
            fee: 1.61
        },
        {
            nameHe: "כלל פנסיה משלימה בסיסי למקבלי קצבה",
            companyHe: "כלל",
            month: -1.87,
            year1: 14.2,
            year3: 36.31,
            year5: 35.67,
            fee: 0.98
        }
    ],

    // Gemel Funds - קופות גמל להשקעה (Real data from igemel-net.co.il)
    gemel: [
        {
            nameHe: "-4.09%",
            companyHe: "-4.09%",
            month: null,
            year1: 95.21,
            year3: 96.86,
            year5: 0.55,
            fee: null
        },
        {
            nameHe: "-4.8%",
            companyHe: "-4.8%",
            month: null,
            year1: 74.21,
            year3: 66.96,
            year5: 0.64,
            fee: null
        },
        {
            nameHe: "-4.36%",
            companyHe: "-4.36%",
            month: null,
            year1: 77.84,
            year3: 77.53,
            year5: 0.59,
            fee: null
        },
        {
            nameHe: "-4.85%",
            companyHe: "-4.85%",
            month: 28.65,
            year1: 76.98,
            year3: 76.28,
            year5: 0.59,
            fee: null
        },
        {
            nameHe: "-5.04%",
            companyHe: "-5.04%",
            month: 27.43,
            year1: 74.81,
            year3: 71.29,
            year5: 0.59,
            fee: null
        },
        {
            nameHe: "-4.48%",
            companyHe: "-4.48%",
            month: 26.69,
            year1: 83.21,
            year3: 90.95,
            year5: 0.6,
            fee: null
        },
        {
            nameHe: "-4.29%",
            companyHe: "-4.29%",
            month: 25.98,
            year1: 75.51,
            year3: 72.43,
            year5: 0.73,
            fee: null
        },
        {
            nameHe: "-4.57%",
            companyHe: "-4.57%",
            month: 22.82,
            year1: 71.02,
            year3: 77.95,
            year5: 0.67,
            fee: null
        },
        {
            nameHe: "-4.17%",
            companyHe: "-4.17%",
            month: 21.97,
            year1: 74.5,
            year3: 75.94,
            year5: 0.61,
            fee: null
        },
        {
            nameHe: "-5.27%",
            companyHe: "-5.27%",
            month: 20.93,
            year1: 61.15,
            year3: 46.24,
            year5: 0.59,
            fee: null
        }
    ],

    // Get data by type
    getData(type) {
        // Try to load from localStorage first (for user updates)
        this.loadFromStorage();
        return this[type] || [];
    },

    // Get last update date
    getLastUpdate() {
        this.loadFromStorage();
        return this.meta.lastUpdate;
    },

    // Update data for a specific type
    updateData(type, newData) {
        if (!['training', 'pension', 'gemel'].includes(type)) return false;

        this[type] = newData;
        this.meta.lastUpdate = new Date().toISOString().slice(0, 7);
        this.saveToStorage();
        return true;
    },

    // Save to localStorage
    saveToStorage() {
        const dataToSave = {
            meta: this.meta,
            training: this.training,
            pension: this.pension,
            gemel: this.gemel
        };
        localStorage.setItem('mygemel_fund_data', JSON.stringify(dataToSave));
    },

    // Load from localStorage (only if stored data is newer than the built-in file data)
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('mygemel_fund_data');
            if (stored) {
                const data = JSON.parse(stored);
                const storedPeriod = data.meta && data.meta.lastUpdate;
                const builtInPeriod = this.meta.lastUpdate;
                if (storedPeriod && storedPeriod >= builtInPeriod) {
                    if (data.meta) this.meta = data.meta;
                    if (data.training) this.training = data.training;
                    if (data.pension) this.pension = data.pension;
                    if (data.gemel) this.gemel = data.gemel;
                }
            }
        } catch (e) {
            console.warn('Failed to load MyGemel data from storage:', e);
        }
    },

    // Check if data needs update (older than 1 month)
    needsUpdate() {
        if (!this.meta.lastUpdate) return true;
        const lastUpdate = new Date(this.meta.lastUpdate + '-01');
        const now = new Date();
        const monthsDiff = (now.getFullYear() - lastUpdate.getFullYear()) * 12 +
                          (now.getMonth() - lastUpdate.getMonth());
        return monthsDiff >= 1;
    }
};

// Initialize by loading from storage
MyGemelFunds.loadFromStorage();
