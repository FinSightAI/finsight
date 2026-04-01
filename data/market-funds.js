/**
 * Market Funds Data - Centralized data for all fund comparisons
 * Source: TheMarker SuperMarker
 *
 * This file contains market data for:
 * - Training Funds (קרנות השתלמות)
 * - Pension Funds (קרנות פנסיה)
 * - Gemel Funds (קופות גמל)
 */

const MarketFunds = {
    // Metadata
    meta: {
        lastUpdate: '2026-02',
        source: 'TheMarker SuperMarker',
        sourceUrls: {
            training: 'https://www.supermarker.themarker.com/Gemel/CompareHishtalmutFunds.aspx',
            pension: 'https://www.supermarker.themarker.com/pension/ComparePensionFunds.aspx',
            gemel: 'https://www.supermarker.themarker.com/Gemel/CompareKupotGemel.aspx'
        }
    },

    // Training Funds Data (קרנות השתלמות)
    training: [
        {
            nameHe: "אינפיניטי השתלמות משולב סחיר",
            companyHe: "אינפיניטי",
            month: 1.33,
            year1: 51.71,
            year3: 145.47,
            year5: 149.6,
            fee: 0.59,
            assets: 176.34
        },
        {
            nameHe: "השתלמות משפטנים מניות",
            companyHe: "משפטנים",
            month: 0.88,
            year1: 38.01,
            year3: 112.87,
            year5: 109.98,
            fee: 0.41,
            assets: 13.77
        },
        {
            nameHe: "אינפיניטי השתלמות מניות",
            companyHe: "אינפיניטי",
            month: 0.44,
            year1: 28.56,
            year3: 88.21,
            year5: 106.46,
            fee: 0.59,
            assets: 884.8
        },
        {
            nameHe: "רעות - מניות",
            companyHe: "רעות",
            month: 1.35,
            year1: 30.51,
            year3: 94.07,
            year5: 105.13,
            fee: 0.45,
            assets: 68.89
        },
        {
            nameHe: "רום ספיר מניות",
            companyHe: "רום ספיר",
            month: 1.5,
            year1: 30.16,
            year3: 97.91,
            year5: 100.28,
            fee: 0.3,
            assets: 111.47
        },
        {
            nameHe: "עובדי מדינה - מניות",
            companyHe: "עובדי",
            month: 1.3,
            year1: 29.91,
            year3: 90.07,
            year5: 98.32,
            fee: 0.38,
            assets: 133.04
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול מניות",
            companyHe: "ילין לפידות",
            month: 0.76,
            year1: 24.81,
            year3: 81.72,
            year5: 94.65,
            fee: 0.67,
            assets: 13148.74
        },
        {
            nameHe: "מור השתלמות - מניות",
            companyHe: "מור",
            month: 1.17,
            year1: 29.23,
            year3: 82.53,
            year5: 91.53,
            fee: 0.71,
            assets: 12925.51
        },
        {
            nameHe: "אנליסט השתלמות מניות",
            companyHe: "אנליסט",
            month: 0.29,
            year1: 23.37,
            year3: 85.02,
            year5: 90.89,
            fee: 0.63,
            assets: 16644.08
        },
        {
            nameHe: "הראל השתלמות מסלול מניות",
            companyHe: "הראל",
            month: 1.03,
            year1: 32.13,
            year3: 80.19,
            year5: 90.15,
            fee: 0.53,
            assets: 3353.95
        },
        {
            nameHe: "מגדל השתלמות מניות",
            companyHe: "מגדל",
            month: 1.07,
            year1: 30.87,
            year3: 84.13,
            year5: 89.55,
            fee: 0.49,
            assets: 3138.4
        },
        {
            nameHe: "מיטב השתלמות מניות",
            companyHe: "מיטב",
            month: 1.11,
            year1: 31.24,
            year3: 85.53,
            year5: 89.37,
            fee: 0.55,
            assets: 5492.53
        },
        {
            nameHe: "אומגה קרן השתלמות מסלול מניות",
            companyHe: "אומגה",
            month: 1.06,
            year1: 33.3,
            year3: 86.72,
            year5: 89.24,
            fee: 0.44,
            assets: 137.07
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע מניות",
            companyHe: "קרן החיסכון",
            month: 1.09,
            year1: 32.5,
            year3: 79.91,
            year5: 87.49,
            fee: 0.19,
            assets: 1490.7
        },
        {
            nameHe: "קרן השתלמות לאקדמאים במדעי החברה והרוח מסלול מניות",
            companyHe: "אקדמאים",
            month: 1.4,
            year1: 29.8,
            year3: 90.32,
            year5: 87.06,
            fee: 0.28,
            assets: 121.52
        },
        {
            nameHe: "מנורה השתלמות מניות",
            companyHe: "מנורה",
            month: 1.01,
            year1: 32.94,
            year3: 84.24,
            year5: 87.02,
            fee: 0.49,
            assets: 2026.7
        },
        {
            nameHe: "הפניקס השתלמות מניות",
            companyHe: "הפניקס",
            month: 0.65,
            year1: 29.72,
            year3: 82.21,
            year5: 86.35,
            fee: 0.58,
            assets: 5514.55
        },
        {
            nameHe: "מינהל - השתלמות - מניות",
            companyHe: "מינהל",
            month: 1.32,
            year1: 27.87,
            year3: 87.76,
            year5: 82.93,
            fee: 0.55,
            assets: 49.64
        },
        {
            nameHe: "הפניקס השתלמות עוקב  מדד s&p500",
            companyHe: "הפניקס",
            month: 0.16,
            year1: 3.91,
            year3: 52.2,
            year5: 81.87,
            fee: 0.57,
            assets: 10063.93
        },
        {
            nameHe: "הנדסאים השתלמות - מסלול מניות",
            companyHe: "הנדסאים",
            month: 0.75,
            year1: 25.4,
            year3: 78.82,
            year5: 81.38,
            fee: 0.35,
            assets: 56.86
        },
        {
            nameHe: "מיטב השתלמות עוקב מדד S&P500",
            companyHe: "מיטב",
            month: 0.01,
            year1: 4.13,
            year3: 53.89,
            year5: 80.38,
            fee: 0.54,
            assets: 3486.21
        },
        {
            nameHe: "כלל השתלמות מניות",
            companyHe: "כלל",
            month: 1.51,
            year1: 33.7,
            year3: 81.74,
            year5: 80,
            fee: 0.53,
            assets: 3162.61
        },
        {
            nameHe: "כלל השתלמות עוקב  מדד s&p 500",
            companyHe: "כלל",
            month: 0.38,
            year1: 3.15,
            year3: 51.41,
            year5: 78.91,
            fee: 0.48,
            assets: 4365.76
        },
        {
            nameHe: "מור השתלמות -עוקב מדד S&P 500",
            companyHe: "מור",
            month: 0.23,
            year1: 3.83,
            year3: 52.72,
            year5: 72.54,
            fee: 0.7,
            assets: 2232.52
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים-מניות",
            companyHe: "יחד",
            month: 0.77,
            year1: 23.65,
            year3: 66.35,
            year5: 68.53,
            fee: 0.38,
            assets: 23.02
        },
        {
            nameHe: "השתלמות משפטנים",
            companyHe: "משפטנים",
            month: 0.65,
            year1: 21.11,
            year3: 56.83,
            year5: 62.27,
            fee: 0.42,
            assets: 496.83
        },
        {
            nameHe: "מנורה השתלמות מניות סחיר",
            companyHe: "מנורה",
            month: 1.52,
            year1: 17,
            year3: 56.61,
            year5: 61.69,
            fee: 0.5,
            assets: 753.72
        },
        {
            nameHe: "השתלמות שופטים",
            companyHe: "השתלמות",
            month: 0.51,
            year1: 19.68,
            year3: 53.49,
            year5: 58.82,
            fee: 0.33,
            assets: 474.04
        },
        {
            nameHe: "קרן השתלמות למורים בבתיה\"ס העי\"ס במכללות ובסמינרים מסלול כללי",
            companyHe: "כלל",
            month: 0.93,
            year1: 17.21,
            year3: 48.65,
            year5: 58.35,
            fee: 0.19,
            assets: 750.51
        },
        {
            nameHe: "ק.ה.ר",
            companyHe: "ק.ה.ר",
            month: 0.64,
            year1: 21.29,
            year3: 59.34,
            year5: 58.15,
            fee: 1.02,
            assets: 125.41
        },
        {
            nameHe: "אלטשולר שחם השתלמות מניות",
            companyHe: "אלטשולר שחם",
            month: -0.53,
            year1: 24.02,
            year3: 69.81,
            year5: 57.61,
            fee: 0.68,
            assets: 6679.61
        },
        {
            nameHe: "קרן השתלמות למורים בבתי הספר העי\"ס במכללות ובסמינרים מסלול כללי",
            companyHe: "כלל",
            month: 0.96,
            year1: 16.93,
            year3: 48.46,
            year5: 56.94,
            fee: 0.2,
            assets: 10217.43
        },
        {
            nameHe: "אנליסט השתלמות כללי",
            companyHe: "אנליסט",
            month: 0.19,
            year1: 14.85,
            year3: 49.98,
            year5: 56.67,
            fee: 0.62,
            assets: 20889.02
        },
        {
            nameHe: "אינפיניטי השתלמות  כללי",
            companyHe: "אינפיניטי",
            month: 0.6,
            year1: 17.23,
            year3: 52.7,
            year5: 56.63,
            fee: 0.6,
            assets: 313.98
        },
        {
            nameHe: "עובדי מדינה - כללי",
            companyHe: "כלל",
            month: 1.09,
            year1: 18.06,
            year3: 49.95,
            year5: 56.22,
            fee: 0.38,
            assets: 3333.64
        },
        {
            nameHe: "מור השתלמות - כללי",
            companyHe: "כלל",
            month: 0.85,
            year1: 15.94,
            year3: 45.62,
            year5: 55.24,
            fee: 0.7,
            assets: 26545.44
        },
        {
            nameHe: "מיטב השתלמות כללי",
            companyHe: "מיטב",
            month: 0.73,
            year1: 16.96,
            year3: 46.65,
            year5: 54.44,
            fee: 0.6,
            assets: 32825.07
        },
        {
            nameHe: "רום קלאסי כללי",
            companyHe: "רום",
            month: 0.92,
            year1: 17.97,
            year3: 48.36,
            year5: 52.5,
            fee: 0.31,
            assets: 5663.03
        },
        {
            nameHe: "אומגה השתלמות מסלול כללי",
            companyHe: "אומגה",
            month: 0.75,
            year1: 18.45,
            year3: 47.73,
            year5: 52.05,
            fee: 0.54,
            assets: 2143.24
        },
        {
            nameHe: "הפניקס השתלמות כללי",
            companyHe: "הפניקס",
            month: 0.54,
            year1: 17.28,
            year3: 46.39,
            year5: 51.86,
            fee: 0.65,
            assets: 23067.71
        },
        {
            nameHe: "קרן השתלמות עובדי חברת חשמל",
            companyHe: "קרן",
            month: 1.14,
            year1: 19.17,
            year3: 51.63,
            year5: 51.8,
            fee: 0.34,
            assets: 796.82
        },
        {
            nameHe: "קרן השתלמות לעובדי בנק ישראל",
            companyHe: "קרן",
            month: 0.65,
            year1: 16.68,
            year3: 46.9,
            year5: 51.38,
            fee: 0.38,
            assets: 185.03
        },
        {
            nameHe: "כלל השתלמות כללי",
            companyHe: "כלל",
            month: 0.98,
            year1: 19.37,
            year3: 46.03,
            year5: 51.32,
            fee: 0.54,
            assets: 21252.78
        },
        {
            nameHe: "ק.ל.ע מסלול כללי",
            companyHe: "כלל",
            month: 1.34,
            year1: 18.9,
            year3: 50.08,
            year5: 51.18,
            fee: 0.49,
            assets: 728.23
        },
        {
            nameHe: "מגדל השתלמות כללי",
            companyHe: "מגדל",
            month: 0.62,
            year1: 16.8,
            year3: 43.26,
            year5: 50.83,
            fee: 0.54,
            assets: 19881.82
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול כללי",
            companyHe: "ילין לפידות",
            month: 0.46,
            year1: 13.95,
            year3: 44.72,
            year5: 50.82,
            fee: 0.68,
            assets: 24341.57
        },
        {
            nameHe: "מורים תיכוניים - מסלול כללי",
            companyHe: "כלל",
            month: 1.57,
            year1: 17.24,
            year3: 46.73,
            year5: 50.02,
            fee: 0.12,
            assets: 9464.66
        },
        {
            nameHe: "מורים תיכוניים - מסלול כללי",
            companyHe: "כלל",
            month: 1.55,
            year1: 17.34,
            year3: 46.97,
            year5: 49.92,
            fee: 0.12,
            assets: 804.43
        },
        {
            nameHe: "מנורה השתלמות כללי",
            companyHe: "מנורה",
            month: 0.85,
            year1: 18.64,
            year3: 44.85,
            year5: 49.92,
            fee: 0.63,
            assets: 12905.74
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע כללי",
            companyHe: "קרן החיסכון",
            month: 0.83,
            year1: 16.93,
            year3: 41.5,
            year5: 48.6,
            fee: 0.21,
            assets: 5012.97
        },
        {
            nameHe: "קרן השתלמות עוצ\"מ",
            companyHe: "קרן",
            month: 0.98,
            year1: 22.95,
            year3: 53.42,
            year5: 48.54,
            fee: 0.6,
            assets: 68.44
        },
        {
            nameHe: "מורים וגננות - מסלול כללי",
            companyHe: "כלל",
            month: 1.46,
            year1: 16.73,
            year3: 46.37,
            year5: 48.46,
            fee: 0.12,
            assets: 28938.27
        },
        {
            nameHe: "הראל השתלמות כללי",
            companyHe: "הראל",
            month: 0.75,
            year1: 17.07,
            year3: 40.3,
            year5: 47.96,
            fee: 0.6,
            assets: 14840.73
        },
        {
            nameHe: "מורים וגננות - מסלול כללי",
            companyHe: "כלל",
            month: 1.55,
            year1: 16.93,
            year3: 46.16,
            year5: 47.71,
            fee: 0.12,
            assets: 1219.46
        },
        {
            nameHe: "הנדסאים השתלמות - מסלול כללי",
            companyHe: "הנדסאים",
            month: 0.88,
            year1: 17.25,
            year3: 47,
            year5: 46.96,
            fee: 0.35,
            assets: 2048.14
        },
        {
            nameHe: "הפניקס השתלמות הלכה",
            companyHe: "הפניקס",
            month: 0.99,
            year1: 16.61,
            year3: 46.22,
            year5: 46.89,
            fee: 0.66,
            assets: 351.72
        },
        {
            nameHe: "הראל השתלמות מסלול הלכה",
            companyHe: "הראל",
            month: 1.23,
            year1: 18.36,
            year3: 44.43,
            year5: 46.68,
            fee: 0.67,
            assets: 629.99
        },
        {
            nameHe: "רעות-כללי",
            companyHe: "רעות",
            month: 0.8,
            year1: 17.28,
            year3: 45.72,
            year5: 46.16,
            fee: 0.46,
            assets: 2473.6
        },
        {
            nameHe: "קרן השתלמות לאקדמאים במדעי החברה והרוח מסלול כללי",
            companyHe: "אקדמאים",
            month: 0.75,
            year1: 16.22,
            year3: 45.62,
            year5: 45.23,
            fee: 0.28,
            assets: 2652.25
        },
        {
            nameHe: "אחים ואחיות - מסלול כללי",
            companyHe: "כלל",
            month: 0.75,
            year1: 17.25,
            year3: 44.66,
            year5: 45.1,
            fee: 0.27,
            assets: 2258.91
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים- כללי",
            companyHe: "כלל",
            month: 0.57,
            year1: 14.42,
            year3: 39.29,
            year5: 44.86,
            fee: 0.38,
            assets: 1203.35
        },
        {
            nameHe: "עובדי המדינה הלכתי הלכה יהודית",
            companyHe: "עובדי",
            month: 0.86,
            year1: 15.97,
            year3: 41.76,
            year5: 44.8,
            fee: 0.38,
            assets: 20.23
        },
        {
            nameHe: "קרן השתלמות של עובדי האוניברסיטה העברית כללי",
            companyHe: "כלל",
            month: 0.66,
            year1: 12.97,
            year3: 35.02,
            year5: 44.01,
            fee: 0.44,
            assets: 470.5
        },
        {
            nameHe: "מגדל השתלמות  הלכה",
            companyHe: "מגדל",
            month: 0.95,
            year1: 16.38,
            year3: 43.99,
            year5: 43.64,
            fee: 0.59,
            assets: 505.08
        },
        {
            nameHe: "מיטב השתלמות כהלכה",
            companyHe: "מיטב",
            month: 0.53,
            year1: 15.89,
            year3: 42.32,
            year5: 43.31,
            fee: 0.72,
            assets: 462.5
        },
        {
            nameHe: "ק.ס.מ",
            companyHe: "ק.ס.מ",
            month: 0.67,
            year1: 15.57,
            year3: 42.74,
            year5: 43.1,
            fee: 0.51,
            assets: 274.3
        },
        {
            nameHe: "רום הלכה",
            companyHe: "רום",
            month: 0.74,
            year1: 14.71,
            year3: 39.99,
            year5: 42.6,
            fee: 0.31,
            assets: 50.21
        },
        {
            nameHe: "מינהל-השתלמות - כללי",
            companyHe: "מינהל",
            month: 0.77,
            year1: 16.9,
            year3: 45.04,
            year5: 42.4,
            fee: 0.56,
            assets: 1109.29
        },
        {
            nameHe: "קרן השתלמות למורים בבתי הספר העי\"ס במכללות ובסמינרים מסלול הלכה",
            companyHe: "כלל",
            month: 0.98,
            year1: 15.45,
            year3: 41.12,
            year5: 42.34,
            fee: 0.17,
            assets: 14.38
        },
        {
            nameHe: "כלל השתלמות הלכה",
            companyHe: "כלל",
            month: 0.77,
            year1: 17.76,
            year3: 43.53,
            year5: 42.3,
            fee: 0.56,
            assets: 334.03
        },
        {
            nameHe: "קרן השתלמות למורים בבתיה\"ס העי\"ס במכללות ובסמינרים מסלול הלכה",
            companyHe: "כלל",
            month: 0.92,
            year1: 14.74,
            year3: 40.12,
            year5: 41.36,
            fee: 0.2,
            assets: 349.74
        },
        {
            nameHe: "מנורה השתלמות עוקב מדדים גמיש",
            companyHe: "מנורה",
            month: 0.44,
            year1: 13,
            year3: 41.64,
            year5: 40.74,
            fee: 0.62,
            assets: 1036
        },
        {
            nameHe: "מורים וגננות - מסלול הלכה",
            companyHe: "מור",
            month: 0.43,
            year1: 14.66,
            year3: 42.78,
            year5: 40.21,
            fee: 0.12,
            assets: 37.9
        },
        {
            nameHe: "אלטשולר שחם השתלמות כללי ב'",
            companyHe: "כלל",
            month: -0.22,
            year1: 15.97,
            year3: 44.03,
            year5: 39.53,
            fee: 0.69,
            assets: 668.23
        },
        {
            nameHe: "מורים תיכוניים - מסלול הלכה",
            companyHe: "מור",
            month: 0.42,
            year1: 14.47,
            year3: 42.45,
            year5: 39.44,
            fee: 0.12,
            assets: 18.95
        },
        {
            nameHe: "מורים תיכוניים - מסלול הלכה",
            companyHe: "מור",
            month: 0.49,
            year1: 14.36,
            year3: 41.69,
            year5: 39.01,
            fee: 0.12,
            assets: 398.22
        },
        {
            nameHe: "מורים וגננות - מסלול הלכה",
            companyHe: "מור",
            month: 0.42,
            year1: 14.41,
            year3: 42.42,
            year5: 38.95,
            fee: 0.12,
            assets: 1603.49
        },
        {
            nameHe: "הפניקס השתלמות שריעה",
            companyHe: "הפניקס",
            month: 0.41,
            year1: 8.28,
            year3: 42.81,
            year5: 38.29,
            fee: 0.67,
            assets: 154.9
        },
        {
            nameHe: "מור השתלמות - אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "מור",
            month: 0.48,
            year1: 9.4,
            year3: 31.26,
            year5: 36.42,
            fee: 0.68,
            assets: 1519.62
        },
        {
            nameHe: "מיטב השתלמות עוקב מדדים גמיש",
            companyHe: "מיטב",
            month: 0.44,
            year1: 6.5,
            year3: 33.97,
            year5: 36.32,
            fee: 0.63,
            assets: 1206.97
        },
        {
            nameHe: "פ.ר.ח - כללי",
            companyHe: "כלל",
            month: 0.49,
            year1: 14.91,
            year3: 41.57,
            year5: 36.28,
            fee: 0.76,
            assets: 136.38
        },
        {
            nameHe: "אלטשולר שחם השתלמות כללי",
            companyHe: "כלל",
            month: -0.03,
            year1: 14.11,
            year3: 39.27,
            year5: 35.97,
            fee: 0.69,
            assets: 30870.86
        },
        {
            nameHe: "מיטב השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "מיטב",
            month: 0.54,
            year1: 11.54,
            year3: 33.77,
            year5: 34.39,
            fee: 0.57,
            assets: 3603.48
        },
        {
            nameHe: "אלטשולר שחם השתלמות הלכה",
            companyHe: "אלטשולר שחם",
            month: -0.15,
            year1: 14.08,
            year3: 39.53,
            year5: 33.78,
            fee: 0.74,
            assets: 302.14
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול אג\"ח עם מניות (עד 25% מניות)",
            companyHe: "ילין לפידות",
            month: 0.32,
            year1: 8.72,
            year3: 29.48,
            year5: 33.25,
            fee: 0.7,
            assets: 4651.66
        },
        {
            nameHe: "הראל השתלמות משולב סחיר",
            companyHe: "הראל",
            month: 2.52,
            year1: 5.01,
            year3: 27.09,
            year5: 32.1,
            fee: 0.54,
            assets: 660.52
        },
        {
            nameHe: "מנורה השתלמות אשראי ואג\"ח",
            companyHe: "מנורה",
            month: 0.38,
            year1: 10.17,
            year3: 27.82,
            year5: 28.26,
            fee: 0.47,
            assets: 550.46
        },
        {
            nameHe: "אנליסט השתלמות אשראי ואג\"ח עד 25% מניות",
            companyHe: "אנליסט",
            month: 0.28,
            year1: 10.32,
            year3: 30.59,
            year5: 28.08,
            fee: 0.5,
            assets: 498
        },
        {
            nameHe: "אנליסט השתלמות משולב סחיר",
            companyHe: "אנליסט",
            month: 1.27,
            year1: -1.5,
            year3: 20.8,
            year5: 28.04,
            fee: 0.62,
            assets: 768.62
        },
        {
            nameHe: "אינפיניטי השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "אינפיניטי",
            month: 0.19,
            year1: 9.7,
            year3: 32.7,
            year5: 26.71,
            fee: 0.34,
            assets: 85.96
        },
        {
            nameHe: "רעות - אשראי ואג\"ח עד 25% מניות",
            companyHe: "רעות",
            month: 0.44,
            year1: 11.23,
            year3: 27.35,
            year5: 26.21,
            fee: 0.46,
            assets: 15.19
        },
        {
            nameHe: "הפניקס השתלמות עוקב מדדים גמיש",
            companyHe: "הפניקס",
            month: 1.58,
            year1: 2.56,
            year3: 25.84,
            year5: 26.01,
            fee: 0.61,
            assets: 452.66
        },
        {
            nameHe: "כלל השתלמות אשראי ואג\"ח עם מניות(עד 25% מניות)",
            companyHe: "כלל",
            month: 0.38,
            year1: 10.37,
            year3: 28.93,
            year5: 25.53,
            fee: 0.51,
            assets: 452.42
        },
        {
            nameHe: "עובדי מדינה - משולב-אג\"ח עד 25 אחוז מניות",
            companyHe: "עובדי",
            month: 0.51,
            year1: 9.4,
            year3: 26.47,
            year5: 25.48,
            fee: 0.38,
            assets: 22.89
        },
        {
            nameHe: "ק.ל.ע אג\"ח עד 25% מניות",
            companyHe: "ק.ל.ע",
            month: 0.6,
            year1: 9.34,
            year3: 27.41,
            year5: 25.38,
            fee: 0.49,
            assets: 10.12
        },
        {
            nameHe: "מיטב השתלמות אשראי ואג\"ח",
            companyHe: "מיטב",
            month: 0.31,
            year1: 6.66,
            year3: 20.66,
            year5: 25.28,
            fee: 0.59,
            assets: 979.93
        },
        {
            nameHe: "הראל השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "הראל",
            month: 0.48,
            year1: 7.17,
            year3: 20.77,
            year5: 24.94,
            fee: 0.55,
            assets: 2720.21
        },
        {
            nameHe: "אומגה השתלמות עד 25% מניות",
            companyHe: "אומגה",
            month: 0.32,
            year1: 8.12,
            year3: 27.19,
            year5: 24.71,
            fee: 0.48,
            assets: 20.63
        },
        {
            nameHe: "הפניקס השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "הפניקס",
            month: 0.44,
            year1: 8.04,
            year3: 24.83,
            year5: 23.55,
            fee: 0.63,
            assets: 2900.08
        },
        {
            nameHe: "אלטשולר שחם השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "אלטשולר שחם",
            month: 0.31,
            year1: 8.44,
            year3: 22.85,
            year5: 23.48,
            fee: 0.7,
            assets: 4147.08
        },
        {
            nameHe: "הנדסאים השתלמות - מסלול אשראי ואג\"ח",
            companyHe: "הנדסאים",
            month: 0.15,
            year1: 8.5,
            year3: 27.74,
            year5: 22.38,
            fee: 0.35,
            assets: 67.63
        },
        {
            nameHe: "אינפיניטי השתלמות אשראי ואג\"ח",
            companyHe: "אינפיניטי",
            month: 0.11,
            year1: 7.12,
            year3: 24.94,
            year5: 22.27,
            fee: 0.68,
            assets: 158.34
        },
        {
            nameHe: "מנורה השתלמות עוקב מדדי אגח עד 25% מניות",
            companyHe: "מנורה",
            month: 0.17,
            year1: 9.58,
            year3: 26.35,
            year5: 21,
            fee: 0.54,
            assets: 139.63
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול אשראי ואג\"ח",
            companyHe: "ילין לפידות",
            month: 0.26,
            year1: 6.55,
            year3: 18.81,
            year5: 19.92,
            fee: 0.68,
            assets: 578.93
        },
        {
            nameHe: "השתלמות משפטנים אשראי ואג\"ח",
            companyHe: "משפטנים",
            month: -0.21,
            year1: 11.36,
            year3: 24.02,
            year5: 19.61,
            fee: 0.42,
            assets: 4.09
        },
        {
            nameHe: "מינהל - השתלמות - אשראי ואג\"ח",
            companyHe: "מינהל",
            month: 0.08,
            year1: 5.01,
            year3: 15.45,
            year5: 19.15,
            fee: 0.56,
            assets: 18.08
        },
        {
            nameHe: "שיבולת - השתלמות",
            companyHe: "שיבולת",
            month: 0.01,
            year1: 4.21,
            year3: 17.77,
            year5: 19.11,
            fee: 0.21,
            assets: 205.79
        },
        {
            nameHe: "כלל השתלמות אשראי ואג\"ח",
            companyHe: "כלל",
            month: 0.2,
            year1: 6.36,
            year3: 19.83,
            year5: 19.11,
            fee: 0.54,
            assets: 398.7
        },
        {
            nameHe: "רום רביד אשראי ואג\"ח",
            companyHe: "רום",
            month: 0.29,
            year1: 6,
            year3: 17.52,
            year5: 18.52,
            fee: 0.31,
            assets: 102.08
        },
        {
            nameHe: "כלל השתלמות כספי(שקלי)",
            companyHe: "כלל",
            month: 0.41,
            year1: 5.01,
            year3: 15.8,
            year5: 17.18,
            fee: 0.52,
            assets: 222.98
        },
        {
            nameHe: "אלטשולר שחם השתלמות כספי (שקלי)",
            companyHe: "אלטשולר שחם",
            month: 0.3,
            year1: 5.15,
            year3: 15.21,
            year5: 16.83,
            fee: 0.66,
            assets: 287.48
        },
        {
            nameHe: "אלטשולר שחם השתלמות אשראי ואג\"ח",
            companyHe: "אלטשולר שחם",
            month: 0.58,
            year1: 4.87,
            year3: 16.31,
            year5: 16.67,
            fee: 0.66,
            assets: 572.97
        },
        {
            nameHe: "אלטשולר שחם השתלמות  אג\"ח ממשלות",
            companyHe: "אלטשולר שחם",
            month: 0.26,
            year1: 6.12,
            year3: 16.23,
            year5: 16.59,
            fee: 0.7,
            assets: 214.89
        },
        {
            nameHe: "מיטב השתלמות אג\"ח ממשלות",
            companyHe: "מיטב",
            month: 0.25,
            year1: 5.69,
            year3: 17.19,
            year5: 16.56,
            fee: 0.62,
            assets: 188.39
        },
        {
            nameHe: "הפניקס השתלמות אשראי ואג\"ח",
            companyHe: "הפניקס",
            month: 0.28,
            year1: 5.38,
            year3: 18.43,
            year5: 16.28,
            fee: 0.64,
            assets: 720.84
        },
        {
            nameHe: "מנורה השתלמות אג\"ח עד 25% מניות",
            companyHe: "מנורה",
            month: 0.44,
            year1: 5.13,
            year3: 17.8,
            year5: 16.27,
            fee: 0.62,
            assets: 1528.79
        },
        {
            nameHe: "מגדל השתלמות עוקב מדדים - גמיש",
            companyHe: "מגדל",
            month: 1.65,
            year1: 0.83,
            year3: 15.92,
            year5: 15.87,
            fee: 0.54,
            assets: 371.29
        },
        {
            nameHe: "אחים ואחיות - מסלול אשראי ואג\"ח",
            companyHe: "אחים",
            month: 0.08,
            year1: 5.37,
            year3: 17.83,
            year5: 15.71,
            fee: 0.27,
            assets: 29.93
        },
        {
            nameHe: "אנליסט השתלמות אשראי ואג\"ח",
            companyHe: "אנליסט",
            month: 0.39,
            year1: 6.39,
            year3: 18.83,
            year5: 15.36,
            fee: 0.61,
            assets: 240.75
        },
        {
            nameHe: "מור השתלמות -כספי (שקלי)",
            companyHe: "מור",
            month: 0.29,
            year1: 4.41,
            year3: 13.57,
            year5: 15.25,
            fee: 0.68,
            assets: 151.5
        },
        {
            nameHe: "מגדל השתלמות אשראי ואג\"ח",
            companyHe: "מגדל",
            month: 0.16,
            year1: 5.93,
            year3: 19.58,
            year5: 15.18,
            fee: 0.56,
            assets: 456.95
        },
        {
            nameHe: "הפניקס השתלמות כספי (שקלי)",
            companyHe: "הפניקס",
            month: 0.39,
            year1: 4.67,
            year3: 14.17,
            year5: 14.98,
            fee: 0.6,
            assets: 266.06
        },
        {
            nameHe: "מיטב השתלמות כספי (שקלי)",
            companyHe: "מיטב",
            month: 0.28,
            year1: 4.51,
            year3: 14.55,
            year5: 14.89,
            fee: 0.52,
            assets: 245.96
        },
        {
            nameHe: "רעות - אשראי ואג\"ח",
            companyHe: "רעות",
            month: 0.14,
            year1: 4.34,
            year3: 10.84,
            year5: 14.71,
            fee: 0.46,
            assets: 40.1
        },
        {
            nameHe: "אנליסט השתלמות כספי (שקלי)",
            companyHe: "אנליסט",
            month: 0.31,
            year1: 4.43,
            year3: 14.14,
            year5: 14.53,
            fee: 0.58,
            assets: 124.67
        },
        {
            nameHe: "הראל השתלמות אשראי ואג\"ח",
            companyHe: "הראל",
            month: 0.57,
            year1: 6.85,
            year3: 16.66,
            year5: 14.5,
            fee: 0.6,
            assets: 338.57
        },
        {
            nameHe: "מנורה השתלמות כספי (שקלי)",
            companyHe: "מנורה",
            month: 0.3,
            year1: 4.34,
            year3: 14.06,
            year5: 13.94,
            fee: 0.51,
            assets: 169.03
        },
        {
            nameHe: "מגדל השתלמות כספי (שקלי)",
            companyHe: "מגדל",
            month: 0.2,
            year1: 4.66,
            year3: 14.23,
            year5: 13.94,
            fee: 0.5,
            assets: 183.86
        },
        {
            nameHe: "קרן השתלמות לאקדמאים במדעי החברה והרוח מסלול אשראי ואג\"ח",
            companyHe: "אקדמאים",
            month: 0.21,
            year1: 6.54,
            year3: 16.61,
            year5: 13.37,
            fee: 0.28,
            assets: 51.68
        },
        {
            nameHe: "מורים תיכוניים - מסלול אשראי ואג\"ח",
            companyHe: "מור",
            month: 0.05,
            year1: 5.61,
            year3: 16.64,
            year5: 12.83,
            fee: 0.11,
            assets: 8.4
        },
        {
            nameHe: "מורים וגננות - מסלול אשראי ואג\"ח",
            companyHe: "מור",
            month: 0.1,
            year1: 5.68,
            year3: 16.47,
            year5: 12.82,
            fee: 0.11,
            assets: 11.28
        },
        {
            nameHe: "אומגה השתלמות אשראי ואג\"ח",
            companyHe: "אומגה",
            month: 0.37,
            year1: 9.43,
            year3: 18.99,
            year5: 12.73,
            fee: 0.53,
            assets: 47.09
        },
        {
            nameHe: "עובדי המדינה - אג\"ח ממשלות",
            companyHe: "עובדי",
            month: 0.21,
            year1: 5.15,
            year3: 14.58,
            year5: 12.66,
            fee: 0.38,
            assets: 27.47
        },
        {
            nameHe: "מורים וגננות - מסלול אשראי ואג\"ח",
            companyHe: "מור",
            month: 0.11,
            year1: 5.75,
            year3: 16.32,
            year5: 12.27,
            fee: 0.12,
            assets: 2.02
        },
        {
            nameHe: "מורים תיכוניים - מסלול אשראי ואג\"ח",
            companyHe: "מור",
            month: 0.07,
            year1: 5.62,
            year3: 16.26,
            year5: 12.15,
            fee: 0.12,
            assets: 2.91
        },
        {
            nameHe: "פ.ר.ח אשראי ואג\"ח",
            companyHe: "פ.ר.ח",
            month: 0.13,
            year1: 5.2,
            year3: 15.82,
            year5: 11.65,
            fee: 0.75,
            assets: 1.12
        },
        {
            nameHe: "אנליסט השתלמות אג\"ח ממשלות",
            companyHe: "אנליסט",
            month: 0.41,
            year1: 6.26,
            year3: 16.18,
            year5: 11.1,
            fee: 0.58,
            assets: 66.45
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים- אג\"ח ממשלות",
            companyHe: "יחד",
            month: 0.13,
            year1: 4.58,
            year3: 13.04,
            year5: 10.88,
            fee: 0.38,
            assets: 7.12
        },
        {
            nameHe: "קרן השתלמות למורים בבתי הספר העי\"ס במכללות ובסמינרים  מסלול אשראי ואג\"ח",
            companyHe: "כלל",
            month: 0.16,
            year1: 4.55,
            year3: 14.87,
            year5: 9.94,
            fee: 0.17,
            assets: 2.2
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע אשראי ואג\"ח",
            companyHe: "קרן החיסכון",
            month: 0.45,
            year1: 5.98,
            year3: 12.29,
            year5: 9.71,
            fee: 0.19,
            assets: 142.23
        },
        {
            nameHe: "קרן השתלמות למורים בבתי הספר העי\"ס במכללות ובסמינרים מסלול אשראי ואג\"ח",
            companyHe: "כלל",
            month: 0.14,
            year1: 4.47,
            year3: 14.8,
            year5: 9.28,
            fee: 0.21,
            assets: 3.72
        },
        {
            nameHe: "רעות - כספי (שקלי)",
            companyHe: "רעות",
            month: 0.31,
            year1: 4.33,
            year3: 14.07,
            year5: 9.05,
            fee: 0.46,
            assets: 21.73
        },
        {
            nameHe: "אינפיניטי השתלמות אג\"ח ממשלות",
            companyHe: "אינפיניטי",
            month: 0.32,
            year1: 5.38,
            year3: 13.92,
            year5: 8.87,
            fee: 0.35,
            assets: 48.86
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול אג\"ח ממשלות",
            companyHe: "ילין לפידות",
            month: 0.13,
            year1: 4.99,
            year3: 12.47,
            year5: 8.1,
            fee: 0.7,
            assets: 138.76
        },
        {
            nameHe: "גלובל נט השתלמות IRA",
            companyHe: "גלובל",
            month: 0,
            year1: 0,
            year3: 0,
            year5: 5.53,
            fee: 0.29,
            assets: 441.27
        },
        {
            nameHe: "מגדל השתלמות אג\"ח ממשלות",
            companyHe: "מגדל",
            month: 0.26,
            year1: 4.85,
            year3: 12.09,
            year5: 4.62,
            fee: 0.61,
            assets: 135.25
        },
        {
            nameHe: "סלייס השתלמות בניהול אישי",
            companyHe: "סלייס",
            month: 0,
            year1: 0,
            year3: 0,
            year5: 0,
            fee: 0.34,
            assets: 103.12
        },
        {
            nameHe: "גלובל נט השתלמות בניהול אישי",
            companyHe: "גלובל",
            month: 0,
            year1: 0,
            year3: 0,
            year5: 0,
            fee: 0.31,
            assets: 2271.54
        },
        {
            nameHe: "מגדל השתלמות בניהול אישי IRA",
            companyHe: "מגדל",
            month: 0,
            year1: 0,
            year3: 0,
            year5: 0,
            fee: 0.36,
            assets: 140.26
        },
        {
            nameHe: "הפניקס השתלמות בניהול אישי",
            companyHe: "הפניקס",
            month: 0,
            year1: 0,
            year3: 0,
            year5: 0,
            fee: 0.24,
            assets: 1165.55
        },
        {
            nameHe: "מיטב השתלמות בניהול אישי",
            companyHe: "מיטב",
            month: 0,
            year1: 0,
            year3: 0,
            year5: 0,
            fee: 0.3,
            assets: 4576.25
        },
        {
            nameHe: "איי.אר.איי ישראל השתלמות בניהול אישי",
            companyHe: "איי.אר.איי",
            month: 0,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "אומגה קרן השתלמות אג\"ח עד 15% מניות",
            companyHe: "אומגה",
            month: 0,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "מנורה השתלמות-אג\"ח ממשלת ישראל",
            companyHe: "מנורה",
            month: 0,
            year1: null,
            year3: null,
            year5: null,
            fee: 0,
            assets: 0
        },
        {
            nameHe: "אנליסט השתלמות כללי אג\"ח עד 10% מניות",
            companyHe: "אנליסט",
            month: 0.43,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "מנורה  השתלמות אג\"ח עד 10% מניות",
            companyHe: "מנורה",
            month: 0,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול אג\"ח עד 15% מניות",
            companyHe: "ילין לפידות",
            month: 0.84,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "ק.ס.מ אג\"ח",
            companyHe: "ק.ס.מ",
            month: 0,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "ק.ס.מ מניות",
            companyHe: "ק.ס.מ",
            month: null,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "סלייס השתלמות כללי פאסיבי",
            companyHe: "כלל",
            month: null,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "סלייס השתלמות מניות מניות",
            companyHe: "סלייס",
            month: null,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "סלייס השתלמות אג\"ח פאסיבי",
            companyHe: "סלייס",
            month: null,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "סלייס השתלמות מדד מניות ישראל",
            companyHe: "סלייס",
            month: null,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "סלייס השתלמות מדד אג\"ח ישראל",
            companyHe: "סלייס",
            month: null,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "סלייס השתלמות אג\"ח צמוד מדד בינוני",
            companyHe: "סלייס",
            month: null,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "סלייס השתלמות חו\"ל חו\"ל",
            companyHe: "סלייס",
            month: null,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "סלייס השתלמות חו\"ל פאסיבי",
            companyHe: "סלייס",
            month: null,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "סלייס השתלמות כללי",
            companyHe: "כלל",
            month: -0.68,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "סלייס השתלמות אג\"ח אג\"ח",
            companyHe: "סלייס",
            month: -0.48,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "סלייס השתלמות מניות פאסיבי",
            companyHe: "סלייס",
            month: 2.04,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "סלייס השתלמות מדד חו\"ל",
            companyHe: "סלייס",
            month: -2.32,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 0
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע - עוקב מדד s&p500",
            companyHe: "קרן החיסכון",
            month: 0.12,
            year1: 3.56,
            year3: 52.73,
            year5: null,
            fee: 0.19,
            assets: 1281.85
        },
        {
            nameHe: "אנליסט השתלמות עוקב מדד S&P500",
            companyHe: "אנליסט",
            month: 0.33,
            year1: 3.18,
            year3: 51.88,
            year5: null,
            fee: 0.62,
            assets: 1561.38
        },
        {
            nameHe: "מנורה מבטחים השתלמות הלכה",
            companyHe: "מנורה מבטחים",
            month: 0.82,
            year1: 14.95,
            year3: 33.86,
            year5: null,
            fee: 0.63,
            assets: 128.77
        },
        {
            nameHe: "מנורה השתלמות עוקב S&P500",
            companyHe: "מנורה",
            month: 0.24,
            year1: 3.55,
            year3: 51.23,
            year5: null,
            fee: 0.49,
            assets: 2738.03
        },
        {
            nameHe: "מינהל-השתלמות - הלכה",
            companyHe: "מינהל",
            month: 0.85,
            year1: 16.2,
            year3: null,
            year5: null,
            fee: 0.55,
            assets: 2.33
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע - קיימות",
            companyHe: "קרן החיסכון",
            month: 1.71,
            year1: 18.45,
            year3: 7.62,
            year5: null,
            fee: 0.19,
            assets: 13.18
        },
        {
            nameHe: "אומגה השתלמות מדדי מניות",
            companyHe: "אומגה",
            month: -1.92,
            year1: 12.11,
            year3: null,
            year5: null,
            fee: 0.46,
            assets: 22.25
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול עוקב מדדים גמיש",
            companyHe: "ילין לפידות",
            month: 1.23,
            year1: 2.99,
            year3: null,
            year5: null,
            fee: 0.66,
            assets: 400.09
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים- עוקב מדד S&P 500",
            companyHe: "יחד",
            month: 0.61,
            year1: 4.43,
            year3: null,
            year5: null,
            fee: 0.39,
            assets: 11.17
        },
        {
            nameHe: "רעות - עוקב מדד S&P 500",
            companyHe: "רעות",
            month: 0.6,
            year1: 2.85,
            year3: null,
            year5: null,
            fee: 0.46,
            assets: 28.25
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול עוקב מדד s&p 500",
            companyHe: "ילין לפידות",
            month: 0.11,
            year1: 3.32,
            year3: null,
            year5: null,
            fee: 0.68,
            assets: 938.3
        },
        {
            nameHe: "מנורה השתלמות מדדי מניות",
            companyHe: "מנורה",
            month: 0.89,
            year1: 19.38,
            year3: null,
            year5: null,
            fee: 0.6,
            assets: 712.7
        },
        {
            nameHe: "אקטיון השתלמות  IRA",
            companyHe: "אקטיון",
            month: 0.01,
            year1: 9.83,
            year3: null,
            year5: null,
            fee: 0.26,
            assets: 12.42
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע - כספי (שקלי)",
            companyHe: "קרן החיסכון",
            month: 0.3,
            year1: 4.58,
            year3: null,
            year5: null,
            fee: 0.19,
            assets: 36.23
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע - מניות סחיר",
            companyHe: "קרן החיסכון",
            month: 1.49,
            year1: 58.4,
            year3: null,
            year5: null,
            fee: 0.18,
            assets: 221.03
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע -משולב סחיר",
            companyHe: "קרן החיסכון",
            month: 2.59,
            year1: 4.75,
            year3: null,
            year5: null,
            fee: 0.18,
            assets: 11.64
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע - עוקב מדדים - גמיש",
            companyHe: "קרן החיסכון",
            month: 0.84,
            year1: 17.16,
            year3: null,
            year5: null,
            fee: 0.18,
            assets: 30.37
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע -עוקב מדדי מניות",
            companyHe: "קרן החיסכון",
            month: -2.06,
            year1: 8.87,
            year3: null,
            year5: null,
            fee: 0.18,
            assets: 58.19
        },
        {
            nameHe: "אנליסט השתלמות עוקב מדדים - גמיש",
            companyHe: "אנליסט",
            month: 0.2,
            year1: 49.43,
            year3: null,
            year5: null,
            fee: 0.61,
            assets: 1452.17
        },
        {
            nameHe: "אנליסט השתלמות עוקב מדדי מניות",
            companyHe: "אנליסט",
            month: -1.88,
            year1: 12.13,
            year3: null,
            year5: null,
            fee: 0.62,
            assets: 282.45
        },
        {
            nameHe: "קרן השתלמות של עובדי האוניברסיטה העברית מניות מניות",
            companyHe: "קרן",
            month: 1.16,
            year1: 24.18,
            year3: null,
            year5: null,
            fee: 0.42,
            assets: 34.91
        },
        {
            nameHe: "קרן השתלמות לאקדמאים במדעי החברה והרוח מסלול כללי עוקבי מדדים עוקב מדד s&p 500",
            companyHe: "אקדמאים",
            month: 0.1,
            year1: 2.38,
            year3: null,
            year5: null,
            fee: 0.28,
            assets: 69.55
        },
        {
            nameHe: "הנדסאיםהשתלמות -  מסלול s&p 500",
            companyHe: "הנדסאים",
            month: 0.75,
            year1: 2.35,
            year3: null,
            year5: null,
            fee: 0.34,
            assets: 17.9
        },
        {
            nameHe: "רום עוקב מדד s&p 500",
            companyHe: "רום",
            month: 0.81,
            year1: 2.77,
            year3: null,
            year5: null,
            fee: 0.31,
            assets: 40
        },
        {
            nameHe: "מינהל-השתלמות עוקב מדד s&p 500",
            companyHe: "מינהל",
            month: 0.75,
            year1: 2.56,
            year3: null,
            year5: null,
            fee: 0.55,
            assets: 10.87
        },
        {
            nameHe: "עובדי המדינה עוקבי מדדים עוקב מדד s&p 500",
            companyHe: "עובדי",
            month: 0.83,
            year1: 2.52,
            year3: null,
            year5: null,
            fee: 0.38,
            assets: 39.66
        },
        {
            nameHe: "מנורה מבטחים השתלמות משולב סחיר",
            companyHe: "מנורה מבטחים",
            month: 1.32,
            year1: 7.48,
            year3: null,
            year5: null,
            fee: 0.56,
            assets: 91.65
        },
        {
            nameHe: "ק.ל.ע עוקב מדד s&p 500",
            companyHe: "ק.ל.ע",
            month: 0.55,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 1.75
        },
        {
            nameHe: "קרן השתלמות עובדי חברת חשמל מניות",
            companyHe: "קרן",
            month: 1.2,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 30.87
        }
    ],

    // Pension Funds Data (קרנות פנסיה)
    pension: [
        {
            nameHe: "מיטב פנסיה מקיפה עוקב מדדי מניות",
            companyHe: "מיטב",
            month: -1.77,
            year1: 19.31,
            year3: 79.9,
            year5: 91.64,
            fee: 0.1
        },
        {
            nameHe: "מגדל מקפת משלימה מניות",
            companyHe: "מגדל",
            month: 1.52,
            year1: 30.78,
            year3: 84.7,
            year5: 89.58,
            fee: 0.31
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מניות",
            companyHe: "הפניקס",
            month: 0.92,
            year1: 29.82,
            year3: 84.16,
            year5: 88.87,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה כללית מניות",
            companyHe: "מיטב",
            month: 1.05,
            year1: 30.92,
            year3: 84.04,
            year5: 88.7,
            fee: 0.2
        },
        {
            nameHe: "הראל פנסיה כללית מניות",
            companyHe: "הראל",
            month: 1,
            year1: 31.93,
            year3: 80.3,
            year5: 84.92,
            fee: 0.21
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול מניות",
            companyHe: "מנורה מבטחים",
            month: 0.89,
            year1: 25.3,
            year3: 67.06,
            year5: 82.91,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת אישית מניות",
            companyHe: "מגדל",
            month: 1.14,
            year1: 23.39,
            year3: 66.05,
            year5: 78.71,
            fee: 0.17
        },
        {
            nameHe: "מיטב פנסיה מקיפה מניות",
            companyHe: "מיטב",
            month: 0.86,
            year1: 23.36,
            year3: 64.72,
            year5: 78.11,
            fee: 0.1
        },
        {
            nameHe: "מיטב פנסיה כללית עוקב מדד S&P500",
            companyHe: "מיטב",
            month: 0.01,
            year1: 4.13,
            year3: 54.03,
            year5: 78.08,
            fee: 0.2
        },
        {
            nameHe: "הראל פנסיה - מניות",
            companyHe: "הראל",
            month: 0.83,
            year1: 23.74,
            year3: 61.42,
            year5: 77.43,
            fee: 0.17
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מניות",
            companyHe: "הפניקס",
            month: 0.7,
            year1: 23.41,
            year3: 66.03,
            year5: 77.42,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה מקיפה עוקב מדד S&P500",
            companyHe: "מיטב",
            month: 0.06,
            year1: 5.08,
            year3: 45.12,
            year5: 77.15,
            fee: 0.1
        },
        {
            nameHe: "הראל פנסיה כללית עוקב מדד s&p",
            companyHe: "הראל",
            month: 0.12,
            year1: 3.49,
            year3: 52.49,
            year5: 75.68,
            fee: 0.21
        },
        {
            nameHe: "כלל פנסיה מניות",
            companyHe: "כלל",
            month: 1.52,
            year1: 24.7,
            year3: 63.5,
            year5: 73.4,
            fee: 0.16
        },
        {
            nameHe: "הפניקס פנסיה מקיפה עוקב מדד S&P500",
            companyHe: "הפניקס",
            month: 0.13,
            year1: 3.26,
            year3: 44.33,
            year5: 73.19,
            fee: 0.16
        },
        {
            nameHe: "הפניקס פנסיה מקיפה  - מסלול לבני 50 ומטה",
            companyHe: "הפניקס",
            month: 0.59,
            year1: 19.49,
            year3: 55.45,
            year5: 72.75,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2055",
            companyHe: "מנורה מבטחים",
            month: 0.84,
            year1: 21.81,
            year3: 54.61,
            year5: 71.15,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2060",
            companyHe: "מנורה מבטחים",
            month: 0.9,
            year1: 22.23,
            year3: 55.3,
            year5: 69.94,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה מקיפה לבני 50 ומטה",
            companyHe: "מיטב",
            month: 0.76,
            year1: 19.55,
            year3: 54.46,
            year5: 69.63,
            fee: 0.1
        },
        {
            nameHe: "הראל פנסיה עוקב מדד s&p 500",
            companyHe: "הראל",
            month: 0.11,
            year1: 4.44,
            year3: 45.08,
            year5: 68.85,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2050",
            companyHe: "מנורה מבטחים",
            month: 0.81,
            year1: 20.65,
            year3: 51.49,
            year5: 67.7,
            fee: 0.16
        },
        {
            nameHe: "כלל פנסיה לבני 50 ומטה",
            companyHe: "כלל",
            month: 1.28,
            year1: 21.2,
            year3: 53.2,
            year5: 67.38,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2045",
            companyHe: "מנורה מבטחים",
            month: 0.76,
            year1: 19.95,
            year3: 49.64,
            year5: 66.47,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה יעד לפרישה 2065",
            companyHe: "מנורה מבטחים",
            month: 0.81,
            year1: 22.57,
            year3: 56.54,
            year5: 65.94,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת אישית לבני 50 ומטה",
            companyHe: "מגדל",
            month: 0.98,
            year1: 19.49,
            year3: 52.16,
            year5: 65.42,
            fee: 0.17
        },
        {
            nameHe: "מיטב פנסיה מקיפה לבני 50 עד 60",
            companyHe: "מיטב",
            month: 0.67,
            year1: 17.24,
            year3: 49.01,
            year5: 65.23,
            fee: 0.1
        },
        {
            nameHe: "מנורה מבטחים פנסיה - כללי",
            companyHe: "מנורה מבטחים",
            month: 0.73,
            year1: 19.05,
            year3: 48.13,
            year5: 64.96,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת אישית כללי",
            companyHe: "מגדל",
            month: 0.95,
            year1: 17.55,
            year3: 46.32,
            year5: 63.39,
            fee: 0.17
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול לבני 50 עד 60",
            companyHe: "הפניקס",
            month: 0.68,
            year1: 17.41,
            year3: 49.91,
            year5: 63.28,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2040",
            companyHe: "מנורה מבטחים",
            month: 0.72,
            year1: 18.8,
            year3: 47.34,
            year5: 62.56,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת אישית עוקב מדדים למקבלי קצבה",
            companyHe: "מגדל",
            month: 0.56,
            year1: 14.46,
            year3: 43.7,
            year5: 62.42,
            fee: 0.17
        },
        {
            nameHe: "הראל פנסיה - גילאי 50 ומטה",
            companyHe: "הראל",
            month: 0.73,
            year1: 19.65,
            year3: 46.8,
            year5: 61.87,
            fee: 0.17
        },
        {
            nameHe: "כלל פנסיה כללי",
            companyHe: "כלל",
            month: 1.18,
            year1: 18.97,
            year3: 47.15,
            year5: 61.66,
            fee: 0.16
        },
        {
            nameHe: "הראל פנסיה - הלכה",
            companyHe: "הראל",
            month: 1.14,
            year1: 18.77,
            year3: 49.13,
            year5: 60.47,
            fee: 0.17
        },
        {
            nameHe: "כלל פנסיה לבני 50-60",
            companyHe: "כלל",
            month: 1.09,
            year1: 18.28,
            year3: 47.47,
            year5: 59.72,
            fee: 0.16
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול הלכה",
            companyHe: "הפניקס",
            month: 0.91,
            year1: 17.35,
            year3: 48.26,
            year5: 59.4,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2060",
            companyHe: "מנורה מבטחים",
            month: 0.72,
            year1: 21.75,
            year3: 53.25,
            year5: 58.61,
            fee: 0.34
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2055",
            companyHe: "מנורה מבטחים",
            month: 0.69,
            year1: 21.44,
            year3: 52.8,
            year5: 58.36,
            fee: 0.34
        },
        {
            nameHe: "מגדל מקפת אישית לבני 50 עד 60",
            companyHe: "מגדל",
            month: 0.85,
            year1: 16.79,
            year3: 46.34,
            year5: 58.17,
            fee: 0.17
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה מניות",
            companyHe: "אלטשולר שחם",
            month: -0.44,
            year1: 19.38,
            year3: 58.74,
            year5: 57.93,
            fee: 0.13
        },
        {
            nameHe: "מגדל מקפת אישית הלכה",
            companyHe: "מגדל",
            month: 0.87,
            year1: 17.01,
            year3: 47.3,
            year5: 57.45,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2045",
            companyHe: "מנורה מבטחים",
            month: 0.68,
            year1: 19.98,
            year3: 49.72,
            year5: 57.16,
            fee: 0.34
        },
        {
            nameHe: "הראל  פנסיה - גילעד כללי",
            companyHe: "הראל",
            month: 0.64,
            year1: 16.87,
            year3: 41.95,
            year5: 57.06,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים משלימה עוקב מדדי מניות",
            companyHe: "מנורה מבטחים",
            month: 1.28,
            year1: 10.01,
            year3: 45.33,
            year5: 56.95,
            fee: 0.34
        },
        {
            nameHe: "הראל פנסיה - מנוף כללי",
            companyHe: "הראל",
            month: 0.65,
            year1: 16.84,
            year3: 42.12,
            year5: 56.87,
            fee: 0.17
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית מניות",
            companyHe: "כלל",
            month: -0.81,
            year1: 23.52,
            year3: 70.49,
            year5: 56.68,
            fee: 0.2
        },
        {
            nameHe: "מנורה מבטחים משלימה -יעד לפרישה 2050",
            companyHe: "מנורה מבטחים",
            month: 0.69,
            year1: 20.78,
            year3: 51.16,
            year5: 56.43,
            fee: 0.34
        },
        {
            nameHe: "מיטב פנסיה כללית לבני 50 ומטה",
            companyHe: "מיטב",
            month: 0.79,
            year1: 19.75,
            year3: 53.39,
            year5: 56.36,
            fee: 0.2
        },
        {
            nameHe: "מנורה מבטחים פנסיה עוקב מדדי מניות",
            companyHe: "מנורה מבטחים",
            month: 0.98,
            year1: 9.28,
            year3: 39.93,
            year5: 56.02,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2035",
            companyHe: "מנורה מבטחים",
            month: 0.64,
            year1: 16.08,
            year3: 42,
            year5: 56,
            fee: 0.16
        },
        {
            nameHe: "הראל פנסיה - גילאי 50 עד 60",
            companyHe: "הראל",
            month: 0.66,
            year1: 16.93,
            year3: 41.93,
            year5: 55.66,
            fee: 0.17
        },
        {
            nameHe: "מיטב פנסיה מקיפה הלכה",
            companyHe: "מיטב",
            month: 0.62,
            year1: 16.7,
            year3: 45.97,
            year5: 55.38,
            fee: 0.1
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מסלול לבני 50 ומטה",
            companyHe: "הפניקס",
            month: 0.68,
            year1: 19.07,
            year3: 52.33,
            year5: 55.08,
            fee: 0.16
        },
        {
            nameHe: "כלל פנסיה הלכה",
            companyHe: "כלל",
            month: 0.79,
            year1: 17.76,
            year3: 46.82,
            year5: 54.58,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים משלימה יעד לפרישה 2065",
            companyHe: "מנורה מבטחים",
            month: 0.71,
            year1: 21.75,
            year3: 54.35,
            year5: 54.27,
            fee: 0.34
        },
        {
            nameHe: "מגדל מקפת משלימה לבני 50 ומטה",
            companyHe: "מגדל",
            month: 0.92,
            year1: 19.07,
            year3: 51.2,
            year5: 54.15,
            fee: 0.31
        },
        {
            nameHe: "כלל פנסיה משלימה לבני 50 ומטה",
            companyHe: "כלל",
            month: 1.14,
            year1: 20.92,
            year3: 52.08,
            year5: 53.7,
            fee: 0.27
        },
        {
            nameHe: "הראל פנסיה כללית - גילאי 50 ומטה",
            companyHe: "הראל",
            month: 0.74,
            year1: 21.38,
            year3: 48.92,
            year5: 53.07,
            fee: 0.21
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה מסלול לבני 50 ומטה",
            companyHe: "אלטשולר שחם",
            month: -0.24,
            year1: 16.92,
            year3: 49.9,
            year5: 52.27,
            fee: 0.13
        },
        {
            nameHe: "מיטב פנסיה מקיפה הלכה למקבלי קצבה",
            companyHe: "מיטב",
            month: 0.51,
            year1: 11.83,
            year3: 35.03,
            year5: 51.61,
            fee: 0.1
        },
        {
            nameHe: "מגדל מקפת אישית הלכה למקבלי קצבה",
            companyHe: "מגדל",
            month: 0.51,
            year1: 11.1,
            year3: 34.25,
            year5: 50.71,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2040",
            companyHe: "מנורה מבטחים",
            month: 0.62,
            year1: 17.6,
            year3: 44.07,
            year5: 49.93,
            fee: 0.34
        },
        {
            nameHe: "הראל פנסיה -  הלכה למקבלי קצבה",
            companyHe: "הראל",
            month: 0.4,
            year1: 11.26,
            year3: 32.1,
            year5: 49.81,
            fee: 0.17
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה למקבלי קצבה קיימים",
            companyHe: "אלטשולר שחם",
            month: 0.05,
            year1: 8.83,
            year3: 31.24,
            year5: 49.77,
            fee: 0.13
        },
        {
            nameHe: "מיטב פנסיה כללית לבני 50 עד 60",
            companyHe: "מיטב",
            month: 0.7,
            year1: 17.15,
            year3: 47.42,
            year5: 49.75,
            fee: 0.2
        },
        {
            nameHe: "מנורה מבטחים פנסיה בסיסי למקבלי קצבה",
            companyHe: "מנורה מבטחים",
            month: 0.37,
            year1: 10.84,
            year3: 32.48,
            year5: 49.72,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת אישית בסיסי למקבלי קצבה",
            companyHe: "מגדל",
            month: 0.45,
            year1: 10.05,
            year3: 32.07,
            year5: 49.54,
            fee: 0.17
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול בסיסי למקבלי קצבה",
            companyHe: "הפניקס",
            month: 0.97,
            year1: 10.19,
            year3: 33.09,
            year5: 49.24,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת משלימה כללי",
            companyHe: "מגדל",
            month: 0.81,
            year1: 16.76,
            year3: 45.61,
            year5: 49.19,
            fee: 0.31
        },
        {
            nameHe: "מיטב פנסיה מקיפה בסיסי למקבלי קצבה",
            companyHe: "מיטב",
            month: 0.39,
            year1: 9.93,
            year3: 33.01,
            year5: 49.14,
            fee: 0.1
        },
        {
            nameHe: "כלל פנסיה משלימה - כללי",
            companyHe: "כלל",
            month: 1.19,
            year1: 18.98,
            year3: 45.3,
            year5: 48.57,
            fee: 0.27
        },
        {
            nameHe: "כלל פנסיה מסלול בסיסי למקבלי קצבה",
            companyHe: "כלל",
            month: 0.51,
            year1: 10.05,
            year3: 30.42,
            year5: 48.53,
            fee: 0.16
        },
        {
            nameHe: "כלל פנסיה מסלול הלכה למקבלי קצבה",
            companyHe: "כלל",
            month: 0.4,
            year1: 10.13,
            year3: 32.5,
            year5: 48.5,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2030",
            companyHe: "מנורה מבטחים",
            month: 0.55,
            year1: 13.28,
            year3: 34.79,
            year5: 48.22,
            fee: 0.16
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה מסלול לבני 50-60",
            companyHe: "אלטשולר שחם",
            month: -0.21,
            year1: 14.96,
            year3: 45.28,
            year5: 47.76,
            fee: 0.13
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה בסיסי למקבלי קצבה",
            companyHe: "אלטשולר שחם",
            month: 0.07,
            year1: 8.82,
            year3: 30.48,
            year5: 47.46,
            fee: 0.13
        },
        {
            nameHe: "מיטב פנסיה מקיפה לבני 60 ומעלה",
            companyHe: "מיטב",
            month: 0.5,
            year1: 12.67,
            year3: 37.44,
            year5: 46.78,
            fee: 0.1
        },
        {
            nameHe: "מיטב פנסיה כללית הלכה",
            companyHe: "מיטב",
            month: 0.82,
            year1: 15.71,
            year3: 39.42,
            year5: 46.65,
            fee: 0.2
        },
        {
            nameHe: "כלל פנסיה משלימה לבני 50 עד 60",
            companyHe: "כלל",
            month: 0.98,
            year1: 17.6,
            year3: 45.35,
            year5: 46.57,
            fee: 0.27
        },
        {
            nameHe: "מגדל מקפת משלימה לבני 50 עד 60",
            companyHe: "מגדל",
            month: 0.8,
            year1: 16.68,
            year3: 44.68,
            year5: 46.22,
            fee: 0.31
        },
        {
            nameHe: "הראל  פנסיה - בסיסי למקבלי קצבה",
            companyHe: "הראל",
            month: 0.41,
            year1: 10.31,
            year3: 29.82,
            year5: 46.14,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול הלכה",
            companyHe: "מנורה מבטחים",
            month: 0.79,
            year1: 16.73,
            year3: 41.82,
            year5: 46.12,
            fee: 0.16
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה הלכה",
            companyHe: "אלטשולר שחם",
            month: -0.25,
            year1: 14,
            year3: 43.37,
            year5: 45.31,
            fee: 0.13
        },
        {
            nameHe: "כלל פנסיה לבני 60 ומעלה",
            companyHe: "כלל",
            month: 0.72,
            year1: 13.15,
            year3: 34.86,
            year5: 45.28,
            fee: 0.16
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מסלול לבני 50 עד 60",
            companyHe: "הפניקס",
            month: 0.58,
            year1: 16.65,
            year3: 45.93,
            year5: 45.15,
            fee: 0.16
        },
        {
            nameHe: "הראל פנסיה כללית - כללי",
            companyHe: "הראל",
            month: 0.71,
            year1: 16.51,
            year3: 38.71,
            year5: 44.96,
            fee: 0.21
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2035",
            companyHe: "מנורה מבטחים",
            month: 0.6,
            year1: 16.19,
            year3: 40.11,
            year5: 44.72,
            fee: 0.34
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול לבני 60 ומעלה",
            companyHe: "הפניקס",
            month: 0.49,
            year1: 11.94,
            year3: 35.84,
            year5: 44.59,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת משלימה הלכה",
            companyHe: "מגדל",
            month: 0.87,
            year1: 16.87,
            year3: 44.74,
            year5: 44.08,
            fee: 0.31
        },
        {
            nameHe: "הראל פנסיה כללית - גילאי 50 עד 60",
            companyHe: "הראל",
            month: 0.73,
            year1: 17.16,
            year3: 41.95,
            year5: 43.4,
            fee: 0.21
        },
        {
            nameHe: "מגדל מקפת אישית לבני 60 ומעלה",
            companyHe: "מגדל",
            month: 0.59,
            year1: 12.06,
            year3: 34.41,
            year5: 43.37,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים פנסיה קצבה לזכאים קיימים",
            companyHe: "מנורה מבטחים",
            month: -0.1,
            year1: 6.38,
            year3: 22.72,
            year5: 41.27,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2025",
            companyHe: "מנורה מבטחים",
            month: 0.73,
            year1: 11.31,
            year3: 31.09,
            year5: 41.2,
            fee: 0.16
        },
        {
            nameHe: "כלל פנסיה קצבה לזכאים קיימים",
            companyHe: "כלל",
            month: 0.08,
            year1: 6.54,
            year3: 23.68,
            year5: 41.05,
            fee: 0.16
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית הלכה",
            companyHe: "כלל",
            month: -0.19,
            year1: 12.79,
            year3: 39.56,
            year5: 40.84,
            fee: 0.2
        },
        {
            nameHe: "הראל פנסיה - גילאי 60 ומעלה",
            companyHe: "הראל",
            month: 0.58,
            year1: 12.45,
            year3: 31.51,
            year5: 40.72,
            fee: 0.17
        },
        {
            nameHe: "כלל פנסיה משלימה בסיסי למקבלי קצבה",
            companyHe: "כלל",
            month: 0.77,
            year1: 14.9,
            year3: 40.12,
            year5: 40.05,
            fee: 0.27
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית מסלול לבני 50 ומטה",
            companyHe: "כלל",
            month: -0.24,
            year1: 17.08,
            year3: 47.24,
            year5: 39.9,
            fee: 0.2
        },
        {
            nameHe: "הראל פנסיה כללית - בסיסי למקבלי קצבה",
            companyHe: "הראל",
            month: 0.59,
            year1: 13.56,
            year3: 39.22,
            year5: 39.55,
            fee: 0.21
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2030",
            companyHe: "מנורה מבטחים",
            month: 0.52,
            year1: 14.02,
            year3: 35.23,
            year5: 39.52,
            fee: 0.34
        },
        {
            nameHe: "מיטב פנסיה כללית בסיסי למקבלי קצבה",
            companyHe: "מיטב",
            month: 0.58,
            year1: 13.48,
            year3: 39.96,
            year5: 39.08,
            fee: 0.2
        },
        {
            nameHe: "מגדל מקפת אישית קצבה לזכאים קיימים",
            companyHe: "מגדל",
            month: -0.06,
            year1: 6.57,
            year3: 21.5,
            year5: 37.54,
            fee: 0.17
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית מסלול לבני 50 עד 60",
            companyHe: "כלל",
            month: -0.15,
            year1: 14.79,
            year3: 42.19,
            year5: 37.13,
            fee: 0.2
        },
        {
            nameHe: "מנורה מבטחים פנסיה אשראי ואג\"ח",
            companyHe: "מנורה מבטחים",
            month: 0.31,
            year1: 9.43,
            year3: 28.76,
            year5: 36.69,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה כללית לבני 60 ומעלה",
            companyHe: "מיטב",
            month: 0.53,
            year1: 12.49,
            year3: 35.17,
            year5: 35.9,
            fee: 0.2
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה מסלול לבני 60 ומעלה",
            companyHe: "אלטשולר שחם",
            month: 0.17,
            year1: 9.5,
            year3: 30.71,
            year5: 35.32,
            fee: 0.13
        },
        {
            nameHe: "מסלול קצבה לזכאים קיימים",
            companyHe: "מסלול",
            month: -0.03,
            year1: 5.58,
            year3: 20.31,
            year5: 35.27,
            fee: 0.16
        },
        {
            nameHe: "הראל פנסיה  - קצבה לזכאים קיימים",
            companyHe: "הראל",
            month: -0.12,
            year1: 6.23,
            year3: 20.82,
            year5: 35.27,
            fee: 0.17
        },
        {
            nameHe: "מיטב פנסיה מקיפה קצבה לזכאים קיימים",
            companyHe: "מיטב",
            month: -0.11,
            year1: 5.96,
            year3: 19.65,
            year5: 32.91,
            fee: 0.1
        },
        {
            nameHe: "כלל פנסיה משלימה לבני 60 ומעלה",
            companyHe: "כלל",
            month: 0.61,
            year1: 12.56,
            year3: 33.29,
            year5: 32.51,
            fee: 0.27
        },
        {
            nameHe: "מגדל מקפת משלימה לבני 60 ומעלה",
            companyHe: "מגדל",
            month: 0.52,
            year1: 11.89,
            year3: 33.42,
            year5: 32.34,
            fee: 0.31
        },
        {
            nameHe: "מגדל מקפת אישית הלכה למקבלי קצבה קיימים",
            companyHe: "מגדל",
            month: -0.11,
            year1: 6.2,
            year3: 20.17,
            year5: 31.55,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2025",
            companyHe: "מנורה מבטחים",
            month: 0.8,
            year1: 10.95,
            year3: 28.5,
            year5: 30.85,
            fee: 0.34
        },
        {
            nameHe: "מגדל מקפת אישית  למקבלי קצבה קיימים",
            companyHe: "מגדל",
            month: -0.19,
            year1: 6.08,
            year3: 18.21,
            year5: 30.64,
            fee: 0.17
        },
        {
            nameHe: "הראל  פנסיה - מקבלי קצבה קיימים",
            companyHe: "הראל",
            month: -0.18,
            year1: 5.86,
            year3: 18.88,
            year5: 30.62,
            fee: 0.17
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מסלול לבני 60 ומעלה",
            companyHe: "הפניקס",
            month: 0.48,
            year1: 11.35,
            year3: 32.24,
            year5: 30.55,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים משלימה - בסיסי למקבלי קצבה",
            companyHe: "מנורה מבטחים",
            month: 0.42,
            year1: 10.47,
            year3: 29.68,
            year5: 30.45,
            fee: 0.34
        },
        {
            nameHe: "כלל פנסיה למקבלי קצבה קיימים",
            companyHe: "כלל",
            month: -0.15,
            year1: 5.9,
            year3: 18.25,
            year5: 30.09,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה מקיפה אשראי ואג\"ח",
            companyHe: "מיטב",
            month: 0.32,
            year1: 6.93,
            year3: 23.38,
            year5: 29.84,
            fee: 0.1
        },
        {
            nameHe: "מגדל מקפת משלימה בסיסי למקבלי קצבה",
            companyHe: "מגדל",
            month: 0.53,
            year1: 11.58,
            year3: 31.84,
            year5: 29.74,
            fee: 0.31
        },
        {
            nameHe: "הראל פנסיה כללית - גילאי 60 ומעלה",
            companyHe: "הראל",
            month: 0.6,
            year1: 12.37,
            year3: 31.29,
            year5: 29.38,
            fee: 0.21
        },
        {
            nameHe: "כלל פנסיה מסלול הלכה למקבלי קצבה קיימים",
            companyHe: "כלל",
            month: -0.15,
            year1: 5.79,
            year3: 18.63,
            year5: 29.32,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה מקיפה מקבלי קצבה קיימים",
            companyHe: "מיטב",
            month: -0.15,
            year1: 5.88,
            year3: 18.23,
            year5: 28.93,
            fee: 0.1
        },
        {
            nameHe: "הפניקס פנסיה מקיפה אשראי ואג\"ח",
            companyHe: "הפניקס",
            month: 0.16,
            year1: 5.94,
            year3: 22.73,
            year5: 28.64,
            fee: 0.16
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול מקבלי קצבה קיימים",
            companyHe: "הפניקס",
            month: -0.22,
            year1: 5.57,
            year3: 16.8,
            year5: 28.59,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים משלימה אשראי ואג\"ח",
            companyHe: "מנורה מבטחים",
            month: 0.33,
            year1: 8.86,
            year3: 27.71,
            year5: 27.97,
            fee: 0.34
        },
        {
            nameHe: "הראל פנסיה- הלכה למקבלי קצבה קיימים",
            companyHe: "הראל",
            month: -0.17,
            year1: 5.3,
            year3: 15.84,
            year5: 27.85,
            fee: 0.17
        },
        {
            nameHe: "כלל פנסיה אשראי ואג\"ח",
            companyHe: "כלל",
            month: 0.13,
            year1: 6.46,
            year3: 23.47,
            year5: 27.44,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה מקבלי קצבה קיימים",
            companyHe: "מנורה מבטחים",
            month: -0.17,
            year1: 5.69,
            year3: 15.73,
            year5: 26.46,
            fee: 0.16
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מסלול בסיסי למקבלי קצבה",
            companyHe: "הפניקס",
            month: 0.38,
            year1: 9.03,
            year3: 27.36,
            year5: 25.82,
            fee: 0.16
        },
        {
            nameHe: "כלל פנסיה כספי (שקלי)",
            companyHe: "כלל",
            month: 0.33,
            year1: 5.54,
            year3: 18.34,
            year5: 25.41,
            fee: 0.16
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית מסלול לבני 60 ומעלה",
            companyHe: "כלל",
            month: 0.19,
            year1: 9.75,
            year3: 28.12,
            year5: 24.79,
            fee: 0.2
        },
        {
            nameHe: "מגדל מקפת אישית אשראי ואג\"ח",
            companyHe: "מגדל",
            month: 0.17,
            year1: 6,
            year3: 21.56,
            year5: 23.73,
            fee: 0.17
        },
        {
            nameHe: "הפניקס פנסיה מקיפה -כספי (שקלי)",
            companyHe: "הפניקס",
            month: 0.25,
            year1: 5.17,
            year3: 17.01,
            year5: 23.3,
            fee: 0.16
        },
        {
            nameHe: "הראל פנסיה - כספי (שקלי)",
            companyHe: "הראל",
            month: 0.25,
            year1: 5.16,
            year3: 17.07,
            year5: 23.21,
            fee: 0.17
        },
        {
            nameHe: "הראל פנסיה - אשראי ואג\"ח",
            companyHe: "הראל",
            month: 0.39,
            year1: 7,
            year3: 18.23,
            year5: 23.18,
            fee: 0.17
        },
        {
            nameHe: "מגדל מקפת אישית כספי (שקלי)",
            companyHe: "מגדל",
            month: 0.17,
            year1: 5.24,
            year3: 17.07,
            year5: 22.71,
            fee: 0.17
        },
        {
            nameHe: "מיטב פנסיה כללית אשראי ואג\"ח",
            companyHe: "מיטב",
            month: 0.32,
            year1: 6.93,
            year3: 22.36,
            year5: 21.63,
            fee: 0.2
        },
        {
            nameHe: "כלל פנסיה משלימה כספי(שקלי)",
            companyHe: "כלל",
            month: 0.39,
            year1: 5.04,
            year3: 15.72,
            year5: 16.71,
            fee: 0.27
        },
        {
            nameHe: "הראל פנסיה כללית כספי (שקלי)",
            companyHe: "הראל",
            month: 0.3,
            year1: 4.55,
            year3: 14.34,
            year5: 14.66,
            fee: 0.21
        },
        {
            nameHe: "הפניקס פנסיה משלימה - כספי (שקלי)",
            companyHe: "הפניקס",
            month: 0.27,
            year1: 4.51,
            year3: 13.91,
            year5: 14.51,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת משלימה אשראי ואג\"ח",
            companyHe: "מגדל",
            month: 0.15,
            year1: 5.87,
            year3: 19.45,
            year5: 14.31,
            fee: 0.31
        },
        {
            nameHe: "הפניקס פנסיה משלימה - אשראי ואג\"ח",
            companyHe: "הפניקס",
            month: 0.2,
            year1: 5.06,
            year3: 17.83,
            year5: 14.06,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת משלימה כספי (שקלי)",
            companyHe: "מגדל",
            month: 0.22,
            year1: 4.7,
            year3: 14.29,
            year5: 13.96,
            fee: 0.31
        },
        {
            nameHe: "הפניקס פנסיה מקיפה -מסלול עוקב מדדי אג\"ח",
            companyHe: "הפניקס",
            month: 1.51,
            year1: -2.49,
            year3: 9.65,
            year5: 12.99,
            fee: 0.16
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית בסיסי למקבלי קצבה",
            companyHe: "כלל",
            month: 0.26,
            year1: 9.49,
            year3: 17.49,
            year5: 12.29,
            fee: 0.2
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית למקבלי קצבה קיימים",
            companyHe: "כלל",
            month: 0.17,
            year1: 7.61,
            year3: 15.24,
            year5: 9.89,
            fee: 0.2
        },
        {
            nameHe: "מגדל מקפת משלימה למקבלי קצבה קיימים",
            companyHe: "מגדל",
            month: -0.46,
            year1: 5.03,
            year3: 11.16,
            year5: 8.99,
            fee: 0.31
        },
        {
            nameHe: "הראל פנסיה כללית - מקבלי קצבה קיימים",
            companyHe: "הראל",
            month: -0.35,
            year1: 4.52,
            year3: 9.17,
            year5: 5.98,
            fee: 0.21
        },
        {
            nameHe: "הפניקס פנסיה כללית - מסלול מקבלי קצבה קיימים",
            companyHe: "הפניקס",
            month: -0.53,
            year1: 3.83,
            year3: 7.02,
            year5: 4.6,
            fee: 0.16
        }
    ],

    // Gemel Funds Data (קופות גמל)
    gemel: [
        {
            nameHe: "אינפיניטי השתלמות משולב סחיר",
            companyHe: "אינפיניטי",
            month: 1.33,
            year1: 51.71,
            year3: 145.47,
            year5: 149.6,
            fee: 0.59,
            assets: 176.34
        },
        {
            nameHe: "אינפיניטי פיצויים סל מניות",
            companyHe: "אינפיניטי",
            month: 0.14,
            year1: 26.87,
            year3: 102.57,
            year5: 129.2,
            fee: 0.56,
            assets: 11.6
        },
        {
            nameHe: "אנליסט קופת גמל להשקעה עוקב מדדים - גמיש",
            companyHe: "אנליסט",
            month: 0.19,
            year1: 49.39,
            year3: 122.15,
            year5: 123.17,
            fee: 0.61,
            assets: 971.51
        },
        {
            nameHe: "הראל גמל להשקעה מניות",
            companyHe: "הראל",
            month: 0.94,
            year1: 35.51,
            year3: 107.04,
            year5: 112.99,
            fee: 0.55,
            assets: 4148.7
        },
        {
            nameHe: "אינפיניטי גמל  מניות",
            companyHe: "אינפיניטי",
            month: 0.39,
            year1: 28.94,
            year3: 92.26,
            year5: 111.66,
            fee: 0.56,
            assets: 723.8
        },
        {
            nameHe: "שיבולת-תגמולים מניות מניות",
            companyHe: "שיבולת-תגמולים",
            month: 2.34,
            year1: 33.47,
            year3: 87.73,
            year5: 110.74,
            fee: 0.19,
            assets: 110.8
        },
        {
            nameHe: "השתלמות משפטנים מניות",
            companyHe: "משפטנים",
            month: 0.88,
            year1: 38.01,
            year3: 112.87,
            year5: 109.98,
            fee: 0.41,
            assets: 13.77
        },
        {
            nameHe: "מיטב גמל להשקעה עוקב מדדי מניות",
            companyHe: "מיטב",
            month: -2.62,
            year1: 24.02,
            year3: 107.09,
            year5: 109.9,
            fee: 0.65,
            assets: 1306.12
        },
        {
            nameHe: "מיטב גמל עוקב מדדי מניות",
            companyHe: "מיטב",
            month: -2.62,
            year1: 23.92,
            year3: 106.13,
            year5: 109.51,
            fee: 0.6,
            assets: 3998.84
        },
        {
            nameHe: "אינפיניטי השתלמות מניות",
            companyHe: "אינפיניטי",
            month: 0.44,
            year1: 28.56,
            year3: 88.21,
            year5: 106.46,
            fee: 0.59,
            assets: 884.8
        },
        {
            nameHe: "אינפיניטי גמל להשקעה מניות",
            companyHe: "אינפיניטי",
            month: 0.9,
            year1: 26.17,
            year3: 93.97,
            year5: 106.3,
            fee: 0.6,
            assets: 359.27
        },
        {
            nameHe: "רעות - מניות",
            companyHe: "רעות",
            month: 1.35,
            year1: 30.51,
            year3: 94.07,
            year5: 105.13,
            fee: 0.45,
            assets: 68.89
        },
        {
            nameHe: "מור חיסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "מור",
            month: 1.2,
            year1: 29.81,
            year3: 88.48,
            year5: 104.94,
            fee: 0.01,
            assets: 523.38
        },
        {
            nameHe: "אינפיניטי חיסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "אינפיניטי",
            month: 0.44,
            year1: 27.53,
            year3: 88.9,
            year5: 103.08,
            fee: 0,
            assets: 509.04
        },
        {
            nameHe: "רום ספיר מניות",
            companyHe: "רום ספיר",
            month: 1.5,
            year1: 30.16,
            year3: 97.91,
            year5: 100.28,
            fee: 0.3,
            assets: 111.47
        },
        {
            nameHe: "ילין לפידות קופת גמל מסלול מניות",
            companyHe: "ילין לפידות",
            month: 0.85,
            year1: 24.88,
            year3: 82.11,
            year5: 98.41,
            fee: 0.61,
            assets: 6457.01
        },
        {
            nameHe: "עובדי מדינה - מניות",
            companyHe: "עובדי",
            month: 1.3,
            year1: 29.91,
            year3: 90.07,
            year5: 98.32,
            fee: 0.38,
            assets: 133.04
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול מניות",
            companyHe: "ילין לפידות",
            month: 0.76,
            year1: 24.81,
            year3: 81.72,
            year5: 94.65,
            fee: 0.67,
            assets: 13148.74
        },
        {
            nameHe: "ילין לפידות קופת גמל להשקעה מסלול מניות",
            companyHe: "ילין לפידות",
            month: 0.72,
            year1: 24.88,
            year3: 81.81,
            year5: 94.21,
            fee: 0.67,
            assets: 3491.72
        },
        {
            nameHe: "אנליסט חיסכון לילד- חוסכים המעדיפים סיכון מוגבר",
            companyHe: "אנליסט",
            month: 0.34,
            year1: 23.32,
            year3: 84.34,
            year5: 91.93,
            fee: 0.01,
            assets: 1468.83
        },
        {
            nameHe: "מור השתלמות - מניות",
            companyHe: "מור",
            month: 1.17,
            year1: 29.23,
            year3: 82.53,
            year5: 91.53,
            fee: 0.71,
            assets: 12925.51
        },
        {
            nameHe: "מגדל גמל להשקעה מניות",
            companyHe: "מגדל",
            month: 1.1,
            year1: 32.21,
            year3: 86,
            year5: 91.09,
            fee: 0.59,
            assets: 888.15
        },
        {
            nameHe: "אנליסט השתלמות מניות",
            companyHe: "אנליסט",
            month: 0.29,
            year1: 23.37,
            year3: 85.02,
            year5: 90.89,
            fee: 0.63,
            assets: 16644.08
        },
        {
            nameHe: "מיטב חיסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "מיטב",
            month: 1.15,
            year1: 31.41,
            year3: 86.23,
            year5: 90.77,
            fee: 0.01,
            assets: 508.12
        },
        {
            nameHe: "מור מנורה מבטחים מניות",
            companyHe: "מנורה מבטחים",
            month: 1.03,
            year1: 33.47,
            year3: 86.58,
            year5: 90.61,
            fee: 0.21,
            assets: 258.34
        },
        {
            nameHe: "הראל קמ\"פ מסלול מניות",
            companyHe: "הראל",
            month: 0.97,
            year1: 31.88,
            year3: 78.47,
            year5: 90.22,
            fee: 0.52,
            assets: 45.14
        },
        {
            nameHe: "הראל השתלמות מסלול מניות",
            companyHe: "הראל",
            month: 1.03,
            year1: 32.13,
            year3: 80.19,
            year5: 90.15,
            fee: 0.53,
            assets: 3353.95
        },
        {
            nameHe: "הפניקס חיסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "הפניקס",
            month: 1.23,
            year1: 29.64,
            year3: 84.7,
            year5: 90.14,
            fee: 0.01,
            assets: 503.63
        },
        {
            nameHe: "מגדל לתגמולים ולפיצויים מניות",
            companyHe: "מגדל",
            month: 1.08,
            year1: 31.48,
            year3: 84.82,
            year5: 90.07,
            fee: 0.48,
            assets: 1633.68
        },
        {
            nameHe: "אנליסט קופת גמל להשקעה מניות",
            companyHe: "אנליסט",
            month: 0.23,
            year1: 23.22,
            year3: 84.84,
            year5: 90.02,
            fee: 0.61,
            assets: 6188.21
        },
        {
            nameHe: "אנליסט גמל מניות",
            companyHe: "אנליסט",
            month: 0.31,
            year1: 22.92,
            year3: 84.17,
            year5: 89.57,
            fee: 0.61,
            assets: 7575.25
        },
        {
            nameHe: "מיטב גמל מניות",
            companyHe: "מיטב",
            month: 1.1,
            year1: 31.13,
            year3: 85.31,
            year5: 89.56,
            fee: 0.53,
            assets: 3988.52
        },
        {
            nameHe: "מגדל השתלמות מניות",
            companyHe: "מגדל",
            month: 1.07,
            year1: 30.87,
            year3: 84.13,
            year5: 89.55,
            fee: 0.49,
            assets: 3138.4
        },
        {
            nameHe: "מיטב השתלמות מניות",
            companyHe: "מיטב",
            month: 1.11,
            year1: 31.24,
            year3: 85.53,
            year5: 89.37,
            fee: 0.55,
            assets: 5492.53
        },
        {
            nameHe: "אומגה קרן השתלמות מסלול מניות",
            companyHe: "אומגה",
            month: 1.06,
            year1: 33.3,
            year3: 86.72,
            year5: 89.24,
            fee: 0.44,
            assets: 137.07
        },
        {
            nameHe: "מיטב גמל להשקעה מניות",
            companyHe: "מיטב",
            month: 1.1,
            year1: 31.34,
            year3: 86,
            year5: 89.21,
            fee: 0.59,
            assets: 1509.23
        },
        {
            nameHe: "הראל גמל מסלול מניות",
            companyHe: "הראל",
            month: 1.03,
            year1: 32.21,
            year3: 79.56,
            year5: 88.63,
            fee: 0.5,
            assets: 1874.53
        },
        {
            nameHe: "הראל חיסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "הראל",
            month: 1.22,
            year1: 32.31,
            year3: 80.29,
            year5: 88.35,
            fee: 0.01,
            assets: 1453.18
        },
        {
            nameHe: "מנורה מבטחים תגמולים מסלול מניות",
            companyHe: "מנורה מבטחים",
            month: 1.06,
            year1: 32.88,
            year3: 84.82,
            year5: 88.09,
            fee: 0.46,
            assets: 845.5
        },
        {
            nameHe: "מגדל  חסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "מגדל",
            month: 1.04,
            year1: 31,
            year3: 82.38,
            year5: 87.7,
            fee: 0.01,
            assets: 225.83
        },
        {
            nameHe: "מנורה מבטחים חסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "מנורה מבטחים",
            month: 1.08,
            year1: 33.11,
            year3: 84.38,
            year5: 87.61,
            fee: 0.01,
            assets: 352.08
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע מניות",
            companyHe: "קרן החיסכון",
            month: 1.09,
            year1: 32.5,
            year3: 79.91,
            year5: 87.49,
            fee: 0.19,
            assets: 1490.7
        },
        {
            nameHe: "אלפא מור תגמולים - מניות",
            companyHe: "מור",
            month: 1.12,
            year1: 28.97,
            year3: 79.72,
            year5: 87.16,
            fee: 0.67,
            assets: 7126.97
        },
        {
            nameHe: "קרן השתלמות לאקדמאים במדעי החברה והרוח מסלול מניות",
            companyHe: "אקדמאים",
            month: 1.4,
            year1: 29.8,
            year3: 90.32,
            year5: 87.06,
            fee: 0.28,
            assets: 121.52
        },
        {
            nameHe: "מור גמל להשקעה - מניות",
            companyHe: "מור",
            month: 1.27,
            year1: 29.47,
            year3: 83.77,
            year5: 87.03,
            fee: 0.73,
            assets: 4590.67
        },
        {
            nameHe: "מנורה השתלמות מניות",
            companyHe: "מנורה",
            month: 1.01,
            year1: 32.94,
            year3: 84.24,
            year5: 87.02,
            fee: 0.49,
            assets: 2026.7
        },
        {
            nameHe: "הפניקס גמל מסלול מניות",
            companyHe: "הפניקס",
            month: 0.58,
            year1: 29.55,
            year3: 82.91,
            year5: 86.9,
            fee: 0.56,
            assets: 3531.19
        },
        {
            nameHe: "הפניקס השתלמות מניות",
            companyHe: "הפניקס",
            month: 0.65,
            year1: 29.72,
            year3: 82.21,
            year5: 86.35,
            fee: 0.58,
            assets: 5514.55
        },
        {
            nameHe: "לאומי קופה מרכזית לפיצויים",
            companyHe: "לאומי",
            month: 5.06,
            year1: 8.19,
            year3: 23.16,
            year5: 86.34,
            fee: 1.17,
            assets: 76.59
        },
        {
            nameHe: "הפניקס גמל להשקעה מניות",
            companyHe: "הפניקס",
            month: 0.63,
            year1: 29.72,
            year3: 83.66,
            year5: 85.29,
            fee: 0.59,
            assets: 1399.05
        },
        {
            nameHe: "אל על - מניות",
            companyHe: "אל",
            month: 1.03,
            year1: 29.21,
            year3: 85.54,
            year5: 85.03,
            fee: 0.39,
            assets: 70.76
        },
        {
            nameHe: "מינהל - השתלמות - מניות",
            companyHe: "מינהל",
            month: 1.32,
            year1: 27.87,
            year3: 87.76,
            year5: 82.93,
            fee: 0.55,
            assets: 49.64
        },
        {
            nameHe: "כלל תמר מניות",
            companyHe: "כלל",
            month: 1.58,
            year1: 33.76,
            year3: 82.11,
            year5: 82.11,
            fee: 0.53,
            assets: 1600.71
        },
        {
            nameHe: "הפניקס גמל להשקעה עוקב מדד S&P500",
            companyHe: "הפניקס",
            month: 0.14,
            year1: 3.89,
            year3: 52.23,
            year5: 81.93,
            fee: 0.58,
            assets: 3494.56
        },
        {
            nameHe: "הפניקס השתלמות עוקב  מדד s&p500",
            companyHe: "הפניקס",
            month: 0.16,
            year1: 3.91,
            year3: 52.2,
            year5: 81.87,
            fee: 0.57,
            assets: 10063.93
        },
        {
            nameHe: "הפניקס גמל עוקב  מדד s&p500",
            companyHe: "הפניקס",
            month: 0.15,
            year1: 3.92,
            year3: 52.35,
            year5: 81.85,
            fee: 0.56,
            assets: 5284.81
        },
        {
            nameHe: "הנדסאים השתלמות - מסלול מניות",
            companyHe: "הנדסאים",
            month: 0.75,
            year1: 25.4,
            year3: 78.82,
            year5: 81.38,
            fee: 0.35,
            assets: 56.86
        },
        {
            nameHe: "מנורה מבטחים גמל להשקעה מדדי מניות",
            companyHe: "מנורה מבטחים",
            month: 0.87,
            year1: 19.79,
            year3: 66.45,
            year5: 80.86,
            fee: 0.57,
            assets: 531.98
        },
        {
            nameHe: "מיטב השתלמות עוקב מדד S&P500",
            companyHe: "מיטב",
            month: 0.01,
            year1: 4.13,
            year3: 53.89,
            year5: 80.38,
            fee: 0.54,
            assets: 3486.21
        },
        {
            nameHe: "מיטב גמל עוקב מדד S&P500",
            companyHe: "מיטב",
            month: 0.02,
            year1: 4.2,
            year3: 54.05,
            year5: 80.3,
            fee: 0.53,
            assets: 2023.88
        },
        {
            nameHe: "מיטב גמל להשקעה עוקב מדד S&P 500",
            companyHe: "מיטב",
            month: 0,
            year1: 4.17,
            year3: 54,
            year5: 80.18,
            fee: 0.6,
            assets: 1259.34
        },
        {
            nameHe: "כלל השתלמות מניות",
            companyHe: "כלל",
            month: 1.51,
            year1: 33.7,
            year3: 81.74,
            year5: 80,
            fee: 0.53,
            assets: 3162.61
        },
        {
            nameHe: "הפניקס מרכזית לפיצויים מחקה מדדי מניות",
            companyHe: "הפניקס",
            month: 1.17,
            year1: 23.04,
            year3: 71.78,
            year5: 79.94,
            fee: 1.18,
            assets: 15.56
        },
        {
            nameHe: "עיריית תל אביב תגמולים מסלול מניות",
            companyHe: "עיריית",
            month: 0.63,
            year1: 30.94,
            year3: 87.93,
            year5: 79.91,
            fee: 0.46,
            assets: 28.42
        },
        {
            nameHe: "כלל גמל לעתיד עוקב  מדד s&p 500",
            companyHe: "כלל",
            month: 0.38,
            year1: 3.14,
            year3: 51.53,
            year5: 79.64,
            fee: 0.59,
            assets: 828.63
        },
        {
            nameHe: "כלל תמר עוקב מדד s&p 500",
            companyHe: "כלל",
            month: 0.38,
            year1: 3.15,
            year3: 51.47,
            year5: 78.93,
            fee: 0.47,
            assets: 1645.67
        },
        {
            nameHe: "כלל השתלמות עוקב  מדד s&p 500",
            companyHe: "כלל",
            month: 0.38,
            year1: 3.15,
            year3: 51.41,
            year5: 78.91,
            fee: 0.48,
            assets: 4365.76
        },
        {
            nameHe: "כלל גמל לעתיד מניות",
            companyHe: "כלל",
            month: 1.55,
            year1: 33.65,
            year3: 81.89,
            year5: 78.78,
            fee: 0.64,
            assets: 794.57
        },
        {
            nameHe: "עמ\"י מסלול מניות",
            companyHe: "עמ\"י",
            month: 1.16,
            year1: 29.21,
            year3: 82.81,
            year5: 75.45,
            fee: 0.39,
            assets: 33.36
        },
        {
            nameHe: "מור גמל להשקעה - עוקב מדד S&P500",
            companyHe: "מור",
            month: 0.18,
            year1: 3.91,
            year3: 53,
            year5: 75.01,
            fee: 0.71,
            assets: 1315.35
        },
        {
            nameHe: "אלפא מור תגמולים - עוקב מדד S&P 500",
            companyHe: "מור",
            month: 0.17,
            year1: 3.83,
            year3: 53.01,
            year5: 73.18,
            fee: 0.67,
            assets: 1174.22
        },
        {
            nameHe: "מור השתלמות -עוקב מדד S&P 500",
            companyHe: "מור",
            month: 0.23,
            year1: 3.83,
            year3: 52.72,
            year5: 72.54,
            fee: 0.7,
            assets: 2232.52
        },
        {
            nameHe: "מחר גמל מניות",
            companyHe: "מחר",
            month: 1.45,
            year1: 30.06,
            year3: 80.79,
            year5: 71.03,
            fee: 0.43,
            assets: 18.44
        },
        {
            nameHe: "מור חיסכון לילד - הלכה",
            companyHe: "מור",
            month: 1.05,
            year1: 27.99,
            year3: 69.73,
            year5: 70.42,
            fee: 0.01,
            assets: 118.08
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים-מניות",
            companyHe: "יחד",
            month: 0.77,
            year1: 23.65,
            year3: 66.35,
            year5: 68.53,
            fee: 0.38,
            assets: 23.02
        },
        {
            nameHe: "אנליסט גמל מניות סחיר",
            companyHe: "אנליסט",
            month: 0.04,
            year1: 5.04,
            year3: 54.97,
            year5: 67.61,
            fee: 0.59,
            assets: 1116.5
        },
        {
            nameHe: "אנליסט גמל - מסלול לבני 50 ומטה",
            companyHe: "אנליסט",
            month: 0.15,
            year1: 17.46,
            year3: 59.45,
            year5: 63.81,
            fee: 0.6,
            assets: 7214.26
        },
        {
            nameHe: "השתלמות משפטנים",
            companyHe: "משפטנים",
            month: 0.65,
            year1: 21.11,
            year3: 56.83,
            year5: 62.27,
            fee: 0.42,
            assets: 496.83
        },
        {
            nameHe: "מנורה השתלמות מניות סחיר",
            companyHe: "מנורה",
            month: 1.52,
            year1: 17,
            year3: 56.61,
            year5: 61.69,
            fee: 0.5,
            assets: 753.72
        },
        {
            nameHe: "אלפא מור תגמולים - לבני 50 ומטה",
            companyHe: "מור",
            month: 0.87,
            year1: 17.34,
            year3: 51.12,
            year5: 59.62,
            fee: 0.68,
            assets: 7428.24
        },
        {
            nameHe: "מיטב גמל לבני 50 ומטה",
            companyHe: "מיטב",
            month: 0.75,
            year1: 19.61,
            year3: 52.99,
            year5: 59.41,
            fee: 0.57,
            assets: 4971.41
        },
        {
            nameHe: "עריית חיפה 50-60",
            companyHe: "עריית",
            month: 0.68,
            year1: 20.91,
            year3: 57.88,
            year5: 59.17,
            fee: 0.72,
            assets: 277.42
        },
        {
            nameHe: "תעשיה אוירית לבני 50 עד 60",
            companyHe: "תעשיה",
            month: 0.85,
            year1: 18.26,
            year3: 47.55,
            year5: 59.13,
            fee: 0.32,
            assets: 2803.93
        },
        {
            nameHe: "אינפיניטי גמל מסלול לבני 50 ומטה",
            companyHe: "אינפיניטי",
            month: 0.65,
            year1: 18.13,
            year3: 61.24,
            year5: 58.95,
            fee: 0.61,
            assets: 136.59
        },
        {
            nameHe: "השתלמות שופטים",
            companyHe: "השתלמות",
            month: 0.51,
            year1: 19.68,
            year3: 53.49,
            year5: 58.82,
            fee: 0.33,
            assets: 474.04
        },
        {
            nameHe: "אינפיניטי חיסכון לילד - הלכה",
            companyHe: "אינפיניטי",
            month: 1.85,
            year1: 11.05,
            year3: 48.92,
            year5: 58.79,
            fee: 0,
            assets: 678.89
        },
        {
            nameHe: "אינפיניטי גמל להשקעה הלכה",
            companyHe: "אינפיניטי",
            month: 1.97,
            year1: 11.54,
            year3: 48.36,
            year5: 58.73,
            fee: 0.6,
            assets: 109.15
        },
        {
            nameHe: "גל גמל לבני 50 ומטה",
            companyHe: "גל",
            month: 1.56,
            year1: 20.76,
            year3: 59.98,
            year5: 58.71,
            fee: 0.21,
            assets: 192.23
        },
        {
            nameHe: "קרן השתלמות למורים בבתיה\"ס העי\"ס במכללות ובסמינרים מסלול כללי",
            companyHe: "כלל",
            month: 0.93,
            year1: 17.21,
            year3: 48.65,
            year5: 58.35,
            fee: 0.19,
            assets: 750.51
        },
        {
            nameHe: "תעשיה אוירית מסלול לבני 50 ומטה",
            companyHe: "תעשיה",
            month: 0.62,
            year1: 18.13,
            year3: 56.82,
            year5: 58.32,
            fee: 0.32,
            assets: 134.53
        },
        {
            nameHe: "ק.ה.ר",
            companyHe: "ק.ה.ר",
            month: 0.64,
            year1: 21.29,
            year3: 59.34,
            year5: 58.15,
            fee: 1.02,
            assets: 125.41
        },
        {
            nameHe: "כלנית גמל לבני 50 ומטה",
            companyHe: "כלנית",
            month: 1.54,
            year1: 20.86,
            year3: 59.98,
            year5: 57.96,
            fee: 0.21,
            assets: 139.91
        },
        {
            nameHe: "ארם עד 50",
            companyHe: "ארם",
            month: 0.77,
            year1: 19.79,
            year3: 55.11,
            year5: 57.78,
            fee: 0.37,
            assets: 61.37
        },
        {
            nameHe: "מנורה מבטחים גמל להשקעה מניות סחיר",
            companyHe: "מנורה מבטחים",
            month: -1.67,
            year1: 12.03,
            year3: 47.05,
            year5: 57.7,
            fee: 0.59,
            assets: 222.67
        },
        {
            nameHe: "ילין לפידות קופת גמל מסלול לבני 50 ומטה",
            companyHe: "ילין לפידות",
            month: 0.53,
            year1: 16.08,
            year3: 50.79,
            year5: 57.66,
            fee: 0.63,
            assets: 4171.04
        },
        {
            nameHe: "אלטשולר שחם חיסכון פלוס מניות",
            companyHe: "אלטשולר שחם",
            month: -0.61,
            year1: 23.82,
            year3: 69.83,
            year5: 57.65,
            fee: 0.59,
            assets: 4515.67
        },
        {
            nameHe: "אלטשולר שחם השתלמות מניות",
            companyHe: "אלטשולר שחם",
            month: -0.53,
            year1: 24.02,
            year3: 69.81,
            year5: 57.61,
            fee: 0.68,
            assets: 6679.61
        },
        {
            nameHe: "אלטשולר שחם עוקב מדדי מניות",
            companyHe: "אלטשולר שחם",
            month: -0.81,
            year1: 12.33,
            year3: 59.32,
            year5: 57.54,
            fee: 0.56,
            assets: 960.02
        },
        {
            nameHe: "אינפיניטי גמל מסלול לבני 50 עד 60",
            companyHe: "אינפיניטי",
            month: 0.52,
            year1: 17.04,
            year3: 55.44,
            year5: 57.45,
            fee: 0.58,
            assets: 455.2
        },
        {
            nameHe: "אלטשולר שחם חיסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "אלטשולר שחם",
            month: -0.77,
            year1: 23.28,
            year3: 68.92,
            year5: 57.43,
            fee: 0.01,
            assets: 7958.75
        },
        {
            nameHe: "הראל גמל להשקעה כללי",
            companyHe: "הראל",
            month: 0.62,
            year1: 19.52,
            year3: 52.61,
            year5: 56.98,
            fee: 0.55,
            assets: 4716.68
        },
        {
            nameHe: "קרן השתלמות למורים בבתי הספר העי\"ס במכללות ובסמינרים מסלול כללי",
            companyHe: "כלל",
            month: 0.96,
            year1: 16.93,
            year3: 48.46,
            year5: 56.94,
            fee: 0.2,
            assets: 10217.43
        },
        {
            nameHe: "כלנית גמל לבני 50 עד 60",
            companyHe: "כלנית",
            month: 1.58,
            year1: 19.15,
            year3: 51.7,
            year5: 56.88,
            fee: 0.21,
            assets: 2223.66
        },
        {
            nameHe: "אנליסט חיסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "אנליסט",
            month: 0.33,
            year1: 15.67,
            year3: 50.58,
            year5: 56.85,
            fee: 0.02,
            assets: 215.52
        },
        {
            nameHe: "מור  מנורה מבטחים עד 50",
            companyHe: "מנורה מבטחים",
            month: 0.83,
            year1: 21.44,
            year3: 52.74,
            year5: 56.83,
            fee: 0.28,
            assets: 691.22
        },
        {
            nameHe: "מנורה מבטחים תגמולים מדדי מניות",
            companyHe: "מנורה מבטחים",
            month: 1.31,
            year1: 10.08,
            year3: 44.27,
            year5: 56.82,
            fee: 0.59,
            assets: 745.85
        },
        {
            nameHe: "אלטשולר שחם גמל מניות",
            companyHe: "אלטשולר שחם",
            month: -0.55,
            year1: 24.03,
            year3: 69.52,
            year5: 56.75,
            fee: 0.61,
            assets: 3094.53
        },
        {
            nameHe: "אנליסט השתלמות כללי",
            companyHe: "אנליסט",
            month: 0.19,
            year1: 14.85,
            year3: 49.98,
            year5: 56.67,
            fee: 0.62,
            assets: 20889.02
        },
        {
            nameHe: "אינפיניטי השתלמות  כללי",
            companyHe: "אינפיניטי",
            month: 0.6,
            year1: 17.23,
            year3: 52.7,
            year5: 56.63,
            fee: 0.6,
            assets: 313.98
        },
        {
            nameHe: "הראל חסכון לילד - הלכה",
            companyHe: "הראל",
            month: 1.52,
            year1: 26.2,
            year3: 54.33,
            year5: 56.42,
            fee: 0.01,
            assets: 2968
        },
        {
            nameHe: "עובדי מדינה - כללי",
            companyHe: "כלל",
            month: 1.09,
            year1: 18.06,
            year3: 49.95,
            year5: 56.22,
            fee: 0.38,
            assets: 3333.64
        },
        {
            nameHe: "מגדל לתגמולים ולפיצויים מסלול לבני 50 ומטה",
            companyHe: "מגדל",
            month: 0.68,
            year1: 19.76,
            year3: 51.34,
            year5: 55.87,
            fee: 0.5,
            assets: 2130.37
        },
        {
            nameHe: "מנורה מבטחים תגמולים עד 50",
            companyHe: "מנורה מבטחים",
            month: 0.86,
            year1: 21.51,
            year3: 52.86,
            year5: 55.55,
            fee: 0.39,
            assets: 4573.62
        },
        {
            nameHe: "גל גמל לבני 50 עד 60",
            companyHe: "גל",
            month: 1.55,
            year1: 18.98,
            year3: 51.68,
            year5: 55.42,
            fee: 0.21,
            assets: 3288.14
        },
        {
            nameHe: "תגמולים האוניברסיטה העברית עד 50",
            companyHe: "תגמולים",
            month: 0.66,
            year1: 12.6,
            year3: 36.05,
            year5: 55.35,
            fee: 0.44,
            assets: 2641.64
        },
        {
            nameHe: "מיטב גמל לבני 50 עד 60",
            companyHe: "מיטב",
            month: 0.73,
            year1: 17,
            year3: 47.06,
            year5: 55.34,
            fee: 0.53,
            assets: 22224.03
        },
        {
            nameHe: "אינפיניטי  חיסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "אינפיניטי",
            month: 0.59,
            year1: 17.5,
            year3: 54.58,
            year5: 55.26,
            fee: 0.02,
            assets: 22.9
        },
        {
            nameHe: "מור השתלמות - כללי",
            companyHe: "כלל",
            month: 0.85,
            year1: 15.94,
            year3: 45.62,
            year5: 55.24,
            fee: 0.7,
            assets: 26545.44
        },
        {
            nameHe: "מחוג  מסלול לבני 50 ומטה",
            companyHe: "מחוג",
            month: 0.59,
            year1: 16.47,
            year3: 50.03,
            year5: 54.8,
            fee: 0.25,
            assets: 2064.4
        },
        {
            nameHe: "מיטב השתלמות כללי",
            companyHe: "מיטב",
            month: 0.73,
            year1: 16.96,
            year3: 46.65,
            year5: 54.44,
            fee: 0.6,
            assets: 32825.07
        },
        {
            nameHe: "הפניקס גמל להשקעה שריעה",
            companyHe: "הפניקס",
            month: 0.39,
            year1: 8.27,
            year3: 44.49,
            year5: 54.35,
            fee: 0.69,
            assets: 29.14
        },
        {
            nameHe: "עירית ת\"א תגמולים מסלול לבני 50-60",
            companyHe: "עירית",
            month: 0.67,
            year1: 17.07,
            year3: 45.8,
            year5: 54.33,
            fee: 0.46,
            assets: 1193.14
        },
        {
            nameHe: "כלל תמר עד 50",
            companyHe: "כלל",
            month: 1.05,
            year1: 21.43,
            year3: 50.87,
            year5: 54.32,
            fee: 0.52,
            assets: 2634.7
        },
        {
            nameHe: "אנליסט קופה מרכזית לפיצויים מסלול כללי",
            companyHe: "אנליסט",
            month: 0.24,
            year1: 16.42,
            year3: 50.81,
            year5: 53.72,
            fee: 0.29,
            assets: 474.4
        },
        {
            nameHe: "הראל גמל מסלול לגילאי  50 ומטה",
            companyHe: "הראל",
            month: 0.75,
            year1: 19.81,
            year3: 46.18,
            year5: 53.45,
            fee: 0.56,
            assets: 2554.04
        },
        {
            nameHe: "מיטב פיצויים - כללי",
            companyHe: "מיטב",
            month: 0.7,
            year1: 16.8,
            year3: 47.39,
            year5: 53.39,
            fee: 0.71,
            assets: 1293.67
        },
        {
            nameHe: "מחר גמל לבני 50 ומטה",
            companyHe: "מחר",
            month: 1.11,
            year1: 19.25,
            year3: 51.45,
            year5: 53.14,
            fee: 0.43,
            assets: 1184.94
        },
        {
            nameHe: "הפניקס גמל לבני 50 ומטה",
            companyHe: "הפניקס",
            month: 0.61,
            year1: 20.59,
            year3: 52.95,
            year5: 53.09,
            fee: 0.62,
            assets: 11070.15
        },
        {
            nameHe: "עירית ת\"א תגמולים מסלול לבני 50 ומטה.",
            companyHe: "עירית",
            month: 0.46,
            year1: 19.84,
            year3: 56.42,
            year5: 52.93,
            fee: 0.46,
            assets: 52.46
        },
        {
            nameHe: "אנליסט קופת גמל להשקעה כללי",
            companyHe: "אנליסט",
            month: 0.35,
            year1: 15.37,
            year3: 48.67,
            year5: 52.92,
            fee: 0.62,
            assets: 4034.2
        },
        {
            nameHe: "קופת גמל עמ\"י  50-60",
            companyHe: "קופת",
            month: 0.8,
            year1: 18.27,
            year3: 48.63,
            year5: 52.79,
            fee: 0.39,
            assets: 2019.98
        },
        {
            nameHe: "מיטב בטחון",
            companyHe: "מיטב",
            month: 0.67,
            year1: 16.58,
            year3: 47,
            year5: 52.72,
            fee: 0.63,
            assets: 22.54
        },
        {
            nameHe: "רום קלאסי כללי",
            companyHe: "רום",
            month: 0.92,
            year1: 17.97,
            year3: 48.36,
            year5: 52.5,
            fee: 0.31,
            assets: 5663.03
        },
        {
            nameHe: "אומגה השתלמות מסלול כללי",
            companyHe: "אומגה",
            month: 0.75,
            year1: 18.45,
            year3: 47.73,
            year5: 52.05,
            fee: 0.54,
            assets: 2143.24
        },
        {
            nameHe: "מור גמל להשקעה- כללי",
            companyHe: "כלל",
            month: 0.99,
            year1: 16.15,
            year3: 45.7,
            year5: 52.03,
            fee: 0.72,
            assets: 5803.82
        },
        {
            nameHe: "אנליסט גמל מסלול לבני 50-60",
            companyHe: "אנליסט",
            month: 0.41,
            year1: 15.46,
            year3: 48.41,
            year5: 51.92,
            fee: 0.6,
            assets: 7528.18
        },
        {
            nameHe: "הפניקס השתלמות כללי",
            companyHe: "הפניקס",
            month: 0.54,
            year1: 17.28,
            year3: 46.39,
            year5: 51.86,
            fee: 0.65,
            assets: 23067.71
        },
        {
            nameHe: "קרן השתלמות עובדי חברת חשמל",
            companyHe: "קרן",
            month: 1.14,
            year1: 19.17,
            year3: 51.63,
            year5: 51.8,
            fee: 0.34,
            assets: 796.82
        },
        {
            nameHe: "עו\"ס גמל לבני 50 עד 60",
            companyHe: "עו\"ס",
            month: 1.33,
            year1: 19.52,
            year3: 50.51,
            year5: 51.54,
            fee: 0.74,
            assets: 197
        },
        {
            nameHe: "קרן השתלמות לעובדי בנק ישראל",
            companyHe: "קרן",
            month: 0.65,
            year1: 16.68,
            year3: 46.9,
            year5: 51.38,
            fee: 0.38,
            assets: 185.03
        },
        {
            nameHe: "בנין-אחרות",
            companyHe: "בנין-אחרות",
            month: 1.18,
            year1: 18.56,
            year3: 46.74,
            year5: 51.35,
            fee: 0.75,
            assets: 30.43
        },
        {
            nameHe: "כלל השתלמות כללי",
            companyHe: "כלל",
            month: 0.98,
            year1: 19.37,
            year3: 46.03,
            year5: 51.32,
            fee: 0.54,
            assets: 21252.78
        },
        {
            nameHe: "אלפא מור תגמולים - לבני 50 עד 60",
            companyHe: "מור",
            month: 0.96,
            year1: 15.06,
            year3: 42.78,
            year5: 51.3,
            fee: 0.66,
            assets: 17244.11
        },
        {
            nameHe: "ק.ל.ע מסלול כללי",
            companyHe: "כלל",
            month: 1.34,
            year1: 18.9,
            year3: 50.08,
            year5: 51.18,
            fee: 0.49,
            assets: 728.23
        },
        {
            nameHe: "ילין לפידות קופת גמל מסלול לבני 50 עד 60",
            companyHe: "ילין לפידות",
            month: 0.49,
            year1: 14.03,
            year3: 44.79,
            year5: 51.16,
            fee: 0.63,
            assets: 13329.66
        },
        {
            nameHe: "מגדל השתלמות כללי",
            companyHe: "מגדל",
            month: 0.62,
            year1: 16.8,
            year3: 43.26,
            year5: 50.83,
            fee: 0.54,
            assets: 19881.82
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול כללי",
            companyHe: "ילין לפידות",
            month: 0.46,
            year1: 13.95,
            year3: 44.72,
            year5: 50.82,
            fee: 0.68,
            assets: 24341.57
        },
        {
            nameHe: "מגדל גמל להשקעה כללי",
            companyHe: "מגדל",
            month: 0.69,
            year1: 18.5,
            year3: 47.35,
            year5: 50.8,
            fee: 0.62,
            assets: 1165.17
        },
        {
            nameHe: "מיטב גמל להשקעה כללי",
            companyHe: "מיטב",
            month: 0.69,
            year1: 17.2,
            year3: 47.38,
            year5: 50.75,
            fee: 0.61,
            assets: 3249.05
        },
        {
            nameHe: "הנדסאים גמל - מסלול עד 50",
            companyHe: "הנדסאים",
            month: 0.69,
            year1: 18.84,
            year3: 52.01,
            year5: 50.72,
            fee: 0.44,
            assets: 30.82
        },
        {
            nameHe: "פיצויים עיריית ת\"א - מסלול לבני 50-60",
            companyHe: "פיצויים",
            month: 0.66,
            year1: 16.8,
            year3: 45.16,
            year5: 50.55,
            fee: 0.43,
            assets: 162.99
        },
        {
            nameHe: "מיטב חיסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "מיטב",
            month: 0.74,
            year1: 17.41,
            year3: 48.14,
            year5: 50.3,
            fee: 0.02,
            assets: 295.25
        },
        {
            nameHe: "מגדל לתגמולים ולפיצויים מסלול לבני 50 עד 60",
            companyHe: "מגדל",
            month: 0.66,
            year1: 17.24,
            year3: 44.55,
            year5: 50.18,
            fee: 0.49,
            assets: 4201.45
        },
        {
            nameHe: "מורים תיכוניים - מסלול כללי",
            companyHe: "כלל",
            month: 1.57,
            year1: 17.24,
            year3: 46.73,
            year5: 50.02,
            fee: 0.12,
            assets: 9464.66
        },
        {
            nameHe: "מקפת-אחרות",
            companyHe: "מקפת-אחרות",
            month: 1.17,
            year1: 18.4,
            year3: 46.66,
            year5: 49.99,
            fee: 1.93,
            assets: 52.11
        },
        {
            nameHe: "מורים תיכוניים - מסלול כללי",
            companyHe: "כלל",
            month: 1.55,
            year1: 17.34,
            year3: 46.97,
            year5: 49.92,
            fee: 0.12,
            assets: 804.43
        },
        {
            nameHe: "מנורה השתלמות כללי",
            companyHe: "מנורה",
            month: 0.85,
            year1: 18.64,
            year3: 44.85,
            year5: 49.92,
            fee: 0.63,
            assets: 12905.74
        },
        {
            nameHe: "ילין לפידות קופת גמל להשקעה מסלול כללי",
            companyHe: "ילין לפידות",
            month: 0.31,
            year1: 14.05,
            year3: 45.59,
            year5: 49.73,
            fee: 0.68,
            assets: 3696.22
        },
        {
            nameHe: "אינפיניטי גמל להשקעה כללי",
            companyHe: "אינפיניטי",
            month: 0.4,
            year1: 15.18,
            year3: 49.58,
            year5: 49.73,
            fee: 0.56,
            assets: 164.2
        },
        {
            nameHe: "הפניקס גמל מסלול לבני 50 עד 60",
            companyHe: "הפניקס",
            month: 0.59,
            year1: 17.01,
            year3: 46.73,
            year5: 49.54,
            fee: 0.6,
            assets: 8386.75
        },
        {
            nameHe: "קופת התגמולים של עובדי בנק לאומי",
            companyHe: "קופת",
            month: 0.97,
            year1: 13.61,
            year3: 33.54,
            year5: 49.45,
            fee: 0,
            assets: 4765.31
        },
        {
            nameHe: "ארם 50-60",
            companyHe: "ארם",
            month: 0.83,
            year1: 17.84,
            year3: 46.38,
            year5: 49.32,
            fee: 0.37,
            assets: 972.23
        },
        {
            nameHe: "אל על 50-60",
            companyHe: "אל",
            month: 0.84,
            year1: 17.48,
            year3: 47,
            year5: 49.05,
            fee: 0.41,
            assets: 732.3
        },
        {
            nameHe: "מנורה מבטחים גמל להשקעה כללי",
            companyHe: "מנורה מבטחים",
            month: 0.78,
            year1: 18.88,
            year3: 46.55,
            year5: 49,
            fee: 0.59,
            assets: 1468.65
        },
        {
            nameHe: "בר",
            companyHe: "בר",
            month: 0.96,
            year1: 18.95,
            year3: 43.82,
            year5: 48.97,
            fee: 0.26,
            assets: 4786.58
        },
        {
            nameHe: "מבטחים-אחרות",
            companyHe: "מבטחים-אחרות",
            month: 0.92,
            year1: 18.65,
            year3: 47.2,
            year5: 48.84,
            fee: 2,
            assets: 962.18
        },
        {
            nameHe: "מחוג  מסלול לבני 50 עד 60",
            companyHe: "מחוג",
            month: 0.66,
            year1: 14.75,
            year3: 43.68,
            year5: 48.61,
            fee: 0.25,
            assets: 94.01
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע כללי",
            companyHe: "קרן החיסכון",
            month: 0.83,
            year1: 16.93,
            year3: 41.5,
            year5: 48.6,
            fee: 0.21,
            assets: 5012.97
        },
        {
            nameHe: "קרן השתלמות עוצ\"מ",
            companyHe: "קרן",
            month: 0.98,
            year1: 22.95,
            year3: 53.42,
            year5: 48.54,
            fee: 0.6,
            assets: 68.44
        },
        {
            nameHe: "מחוג מסלול כללי",
            companyHe: "כלל",
            month: 0.55,
            year1: 14.44,
            year3: 43.51,
            year5: 48.53,
            fee: 0.25,
            assets: 356.54
        },
        {
            nameHe: "מורים וגננות - מסלול כללי",
            companyHe: "כלל",
            month: 1.46,
            year1: 16.73,
            year3: 46.37,
            year5: 48.46,
            fee: 0.12,
            assets: 28938.27
        },
        {
            nameHe: "חקלאים-אחרות",
            companyHe: "חקלאים-אחרות",
            month: 1.19,
            year1: 18.67,
            year3: 47.39,
            year5: 48.4,
            fee: 1.97,
            assets: 104.94
        },
        {
            nameHe: "קופת גמל עמ\"י מסלול לבני 50 ומטה",
            companyHe: "קופת",
            month: 0.9,
            year1: 20.21,
            year3: 55.27,
            year5: 48.36,
            fee: 0.39,
            assets: 90.29
        },
        {
            nameHe: "כלל גמל לעתיד כללי",
            companyHe: "כלל",
            month: 0.96,
            year1: 18.94,
            year3: 46.91,
            year5: 48.35,
            fee: 0.65,
            assets: 1643.25
        },
        {
            nameHe: "הפניקס גמל להשקעה כללי",
            companyHe: "הפניקס",
            month: 0.49,
            year1: 16.57,
            year3: 46.69,
            year5: 48.11,
            fee: 0.62,
            assets: 2976.55
        },
        {
            nameHe: "הראל השתלמות כללי",
            companyHe: "הראל",
            month: 0.75,
            year1: 17.07,
            year3: 40.3,
            year5: 47.96,
            fee: 0.6,
            assets: 14840.73
        },
        {
            nameHe: "הראל גמל מסלול לגילאי 50 עד 60",
            companyHe: "הראל",
            month: 0.69,
            year1: 16.75,
            year3: 40.14,
            year5: 47.91,
            fee: 0.41,
            assets: 6651.72
        },
        {
            nameHe: "מנורה מבטחים חסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "מנורה מבטחים",
            month: 0.72,
            year1: 18.04,
            year3: 45.08,
            year5: 47.88,
            fee: 0.01,
            assets: 190.03
        },
        {
            nameHe: "מורים וגננות - מסלול כללי",
            companyHe: "כלל",
            month: 1.55,
            year1: 16.93,
            year3: 46.16,
            year5: 47.71,
            fee: 0.12,
            assets: 1219.46
        },
        {
            nameHe: "מנורה מבטחים תגמולים 50-60",
            companyHe: "מנורה מבטחים",
            month: 0.81,
            year1: 17.55,
            year3: 42.71,
            year5: 47.6,
            fee: 0.59,
            assets: 5039.64
        },
        {
            nameHe: "הפניקס חיסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "הפניקס",
            month: 0.44,
            year1: 17.06,
            year3: 47.7,
            year5: 47.6,
            fee: 0.02,
            assets: 200.25
        },
        {
            nameHe: "עוצ\"מ - מסלול לבני 50 ומטה",
            companyHe: "עוצ\"מ",
            month: 0.59,
            year1: 22.09,
            year3: 53.44,
            year5: 47.46,
            fee: 0.6,
            assets: 501.13
        },
        {
            nameHe: "מור חיסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "מור",
            month: 0.93,
            year1: 15.55,
            year3: 45.43,
            year5: 47.28,
            fee: 0.01,
            assets: 38.12
        },
        {
            nameHe: "אל על עד 50",
            companyHe: "אל",
            month: 0.75,
            year1: 19.69,
            year3: 55.64,
            year5: 47.19,
            fee: 0.4,
            assets: 41.42
        },
        {
            nameHe: "כלל תמר 50-60",
            companyHe: "כלל",
            month: 0.91,
            year1: 18.43,
            year3: 45.12,
            year5: 47.12,
            fee: 0.49,
            assets: 4600.97
        },
        {
            nameHe: "הנדסאים השתלמות - מסלול כללי",
            companyHe: "הנדסאים",
            month: 0.88,
            year1: 17.25,
            year3: 47,
            year5: 46.96,
            fee: 0.35,
            assets: 2048.14
        },
        {
            nameHe: "הפניקס השתלמות הלכה",
            companyHe: "הפניקס",
            month: 0.99,
            year1: 16.61,
            year3: 46.22,
            year5: 46.89,
            fee: 0.66,
            assets: 351.72
        },
        {
            nameHe: "עו\"ס גמל לבני 50 ומטה",
            companyHe: "עו\"ס",
            month: 1.06,
            year1: 17.2,
            year3: 48.67,
            year5: 46.77,
            fee: 0.73,
            assets: 7.59
        },
        {
            nameHe: "הראל השתלמות מסלול הלכה",
            companyHe: "הראל",
            month: 1.23,
            year1: 18.36,
            year3: 44.43,
            year5: 46.68,
            fee: 0.67,
            assets: 629.99
        },
        {
            nameHe: "קו הבריאות לבני 50 ומטה",
            companyHe: "קו",
            month: 0.77,
            year1: 19.97,
            year3: 55.14,
            year5: 46.67,
            fee: 0.34,
            assets: 25.69
        },
        {
            nameHe: "הראל גמל מסלול הלכה",
            companyHe: "הראל",
            month: 1.16,
            year1: 19,
            year3: 44.32,
            year5: 46.63,
            fee: 0.57,
            assets: 312.46
        },
        {
            nameHe: "מור  מנורה מבטחים 50-60",
            companyHe: "מנורה מבטחים",
            month: 0.63,
            year1: 18.33,
            year3: 46.78,
            year5: 46.42,
            fee: 0.18,
            assets: 100.54
        },
        {
            nameHe: "רעות-כללי",
            companyHe: "רעות",
            month: 0.8,
            year1: 17.28,
            year3: 45.72,
            year5: 46.16,
            fee: 0.46,
            assets: 2473.6
        },
        {
            nameHe: "מנורה מרכזית לפיצויים כללי",
            companyHe: "מנורה",
            month: 0.65,
            year1: 18.85,
            year3: 46.78,
            year5: 46.12,
            fee: 0.34,
            assets: 154.86
        },
        {
            nameHe: "הראל קופה לפנסיה תקציבית",
            companyHe: "הראל",
            month: 0.75,
            year1: 18.19,
            year3: 44.97,
            year5: 46.06,
            fee: 1.33,
            assets: 38.69
        },
        {
            nameHe: "מיטב גמל להשקעה הלכה",
            companyHe: "מיטב",
            month: 0.97,
            year1: 17.51,
            year3: 43.35,
            year5: 46,
            fee: 0.67,
            assets: 113.58
        },
        {
            nameHe: "כלל פיצויים למעסיק",
            companyHe: "כלל",
            month: 0.86,
            year1: 17.38,
            year3: 43.84,
            year5: 45.96,
            fee: 0.78,
            assets: 964.28
        },
        {
            nameHe: "ילין לפידות מרכזית לפיצויים כללי ב'",
            companyHe: "ילין לפידות",
            month: 0.33,
            year1: 13.25,
            year3: 43.1,
            year5: 45.93,
            fee: 0.35,
            assets: 333.89
        },
        {
            nameHe: "מיטב פיצויים שוהם כהלכה",
            companyHe: "מיטב",
            month: 0.9,
            year1: 16.03,
            year3: 46.61,
            year5: 45.79,
            fee: 0.77,
            assets: 5.04
        },
        {
            nameHe: "הראל דקל",
            companyHe: "הראל",
            month: 0.75,
            year1: 18.29,
            year3: 44.72,
            year5: 45.72,
            fee: 0.42,
            assets: 76.84
        }
    ],

    /**
     * Get data by fund type
     * @param {string} type - 'training', 'pension', or 'gemel'
     */
    getData(type) {
        return this[type] || [];
    },

    /**
     * Get top performers by period
     * @param {string} type - Fund type
     * @param {string} period - 'month', 'year1', 'year3', 'year5'
     * @param {number} limit - Number of results
     */
    getTopByPeriod(type, period, limit = 5) {
        const data = this.getData(type);
        return [...data]
            .filter(f => f[period] !== null && f[period] !== undefined)
            .sort((a, b) => b[period] - a[period])
            .slice(0, limit);
    },

    /**
     * Get last update info
     */
    getLastUpdate() {
        return this.meta.lastUpdate;
    },

    /**
     * Get source URL for fund type
     */
    getSourceUrl(type) {
        return this.meta.sourceUrls[type] || this.meta.sourceUrls.training;
    },

    /**
     * Update fund data (called from update page)
     * @param {string} type - Fund type
     * @param {Array} newData - New fund data
     */
    updateData(type, newData) {
        if (!['training', 'pension', 'gemel'].includes(type)) {
            console.error('Invalid fund type:', type);
            return false;
        }

        // Save to localStorage for persistence
        const storageKey = `market_funds_${type}`;
        const updateKey = 'market_funds_last_update';

        localStorage.setItem(storageKey, JSON.stringify(newData));
        localStorage.setItem(updateKey, new Date().toISOString().slice(0, 7));

        // Update in-memory data
        this[type] = newData;
        this.meta.lastUpdate = new Date().toISOString().slice(0, 7);

        return true;
    },

    /**
     * Load data from localStorage if available (only if newer than built-in data)
     */
    loadFromStorage() {
        const updateKey = 'market_funds_last_update';
        const storedPeriod = localStorage.getItem(updateKey);
        const builtInPeriod = this.meta.lastUpdate;

        if (storedPeriod && storedPeriod >= builtInPeriod) {
            ['training', 'pension', 'gemel'].forEach(type => {
                const storageKey = `market_funds_${type}`;
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    try {
                        this[type] = JSON.parse(stored);
                    } catch (e) {
                        console.error('Error loading stored fund data:', e);
                    }
                }
            });
            this.meta.lastUpdate = storedPeriod;
        }
    },

    /**
     * Check if data needs update (older than 1 month)
     */
    needsUpdate() {
        const lastUpdate = this.meta.lastUpdate;
        if (!lastUpdate) return true;

        const [year, month] = lastUpdate.split('-').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // Needs update if more than 1 month old
        if (currentYear > year) return true;
        if (currentYear === year && currentMonth > month) return true;

        return false;
    }
};

// Load from storage on init
MarketFunds.loadFromStorage();

// Make available globally
window.MarketFunds = MarketFunds;
