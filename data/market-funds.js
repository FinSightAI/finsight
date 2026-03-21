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
        lastUpdate: '2026-01',
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
            month: 7.63,
            year1: 53.8,
            year3: 138.71,
            year5: 148.56,
            fee: 0.59,
            assets: 153.95
        },
        {
            nameHe: "השתלמות משפטנים מניות",
            companyHe: "משפטנים",
            month: 6.31,
            year1: 36.01,
            year3: 107.45,
            year5: 111.29,
            fee: 0.41,
            assets: 12.83
        },
        {
            nameHe: "אינפיניטי השתלמות מניות",
            companyHe: "אינפיניטי",
            month: 4.09,
            year1: 26.67,
            year3: 92.95,
            year5: 110.94,
            fee: 0.59,
            assets: 854.94
        },
        {
            nameHe: "רעות - מניות",
            companyHe: "רעות",
            month: 4.45,
            year1: 27.37,
            year3: 87.67,
            year5: 107.16,
            fee: 0.45,
            assets: 66.98
        },
        {
            nameHe: "רום ספיר מניות",
            companyHe: "רום ספיר",
            month: 4.14,
            year1: 27.2,
            year3: 92.89,
            year5: 102.78,
            fee: 0.3,
            assets: 106.24
        },
        {
            nameHe: "עובדי מדינה - מניות",
            companyHe: "עובדי",
            month: 4.28,
            year1: 26.9,
            year3: 86.4,
            year5: 97.76,
            fee: 0.38,
            assets: 126.55
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול מניות",
            companyHe: "ילין לפידות",
            month: 2.84,
            year1: 22.37,
            year3: 76.58,
            year5: 96.5,
            fee: 0.67,
            assets: 13142.95
        },
        {
            nameHe: "אנליסט השתלמות מניות",
            companyHe: "אנליסט",
            month: 3.31,
            year1: 21,
            year3: 80.87,
            year5: 93.57,
            fee: 0.63,
            assets: 16572.98
        },
        {
            nameHe: "מור השתלמות - מניות",
            companyHe: "מור",
            month: 4.71,
            year1: 27.57,
            year3: 76.51,
            year5: 93.03,
            fee: 0.71,
            assets: 12567.62
        },
        {
            nameHe: "אומגה קרן השתלמות מסלול מניות",
            companyHe: "אומגה",
            month: 4.74,
            year1: 30.1,
            year3: 79.36,
            year5: 92.01,
            fee: 0.44,
            assets: 130.86
        },
        {
            nameHe: "הראל השתלמות מסלול מניות",
            companyHe: "הראל",
            month: 5.06,
            year1: 29.37,
            year3: 74.23,
            year5: 91.7,
            fee: 0.53,
            assets: 3130.81
        },
        {
            nameHe: "מגדל השתלמות מניות",
            companyHe: "מגדל",
            month: 4.74,
            year1: 27.93,
            year3: 77.42,
            year5: 91.3,
            fee: 0.49,
            assets: 2939.19
        },
        {
            nameHe: "מיטב השתלמות מניות",
            companyHe: "מיטב",
            month: 4.29,
            year1: 28.63,
            year3: 79.55,
            year5: 90.89,
            fee: 0.55,
            assets: 4983.45
        },
        {
            nameHe: "מנורה השתלמות מניות",
            companyHe: "מנורה",
            month: 4.58,
            year1: 29.67,
            year3: 76.9,
            year5: 89.73,
            fee: 0.49,
            assets: 1794.36
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע מניות",
            companyHe: "קרן החיסכון",
            month: 5.01,
            year1: 29.66,
            year3: 73.75,
            year5: 88.89,
            fee: 0.19,
            assets: 1446.51
        },
        {
            nameHe: "הפניקס השתלמות מניות",
            companyHe: "הפניקס",
            month: 4.57,
            year1: 28.13,
            year3: 75.98,
            year5: 88.88,
            fee: 0.58,
            assets: 5122.8
        },
        {
            nameHe: "קרן השתלמות לאקדמאים במדעי החברה והרוח מסלול מניות",
            companyHe: "אקדמאים",
            month: 4.25,
            year1: 26.64,
            year3: 83.27,
            year5: 86.84,
            fee: 0.28,
            assets: 112.85
        },
        {
            nameHe: "מיטב השתלמות עוקב מדד S&P500",
            companyHe: "מיטב",
            month: -1.41,
            year1: 0.21,
            year3: 59.1,
            year5: 86.33,
            fee: 0.54,
            assets: 3625.75
        },
        {
            nameHe: "הפניקס השתלמות עוקב  מדד s&p500",
            companyHe: "הפניקס",
            month: -1.78,
            year1: -0.15,
            year3: 56.77,
            year5: 85.92,
            fee: 0.57,
            assets: 10408.93
        },
        {
            nameHe: "כלל השתלמות עוקב  מדד s&p 500",
            companyHe: "כלל",
            month: -2.04,
            year1: -0.45,
            year3: 56.07,
            year5: 82.46,
            fee: 0.48,
            assets: 4460.46
        },
        {
            nameHe: "הנדסאים השתלמות - מסלול מניות",
            companyHe: "הנדסאים",
            month: 3.6,
            year1: 23.43,
            year3: 75.57,
            year5: 81.99,
            fee: 0.35,
            assets: 53.24
        },
        {
            nameHe: "כלל השתלמות מניות",
            companyHe: "כלל",
            month: 5.41,
            year1: 30.38,
            year3: 73.6,
            year5: 81.78,
            fee: 0.53,
            assets: 2917.96
        },
        {
            nameHe: "מינהל - השתלמות - מניות",
            companyHe: "מינהל",
            month: 3.89,
            year1: 25.4,
            year3: 83.83,
            year5: 80.76,
            fee: 0.55,
            assets: 46.52
        },
        {
            nameHe: "מור השתלמות -עוקב מדד S&P 500",
            companyHe: "מור",
            month: -1.73,
            year1: 0.02,
            year3: 54.49,
            year5: 75.59,
            fee: 0.7,
            assets: 2374.36
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים-מניות",
            companyHe: "יחד",
            month: 2.63,
            year1: 21.96,
            year3: 61.83,
            year5: 68.11,
            fee: 0.38,
            assets: 22.83
        },
        {
            nameHe: "מנורה השתלמות מניות סחיר",
            companyHe: "מנורה",
            month: 1.53,
            year1: 11.81,
            year3: 55.93,
            year5: 64.44,
            fee: 0.5,
            assets: 747.17
        },
        {
            nameHe: "השתלמות משפטנים",
            companyHe: "משפטנים",
            month: 2.89,
            year1: 20,
            year3: 54.27,
            year5: 62.65,
            fee: 0.42,
            assets: 499.06
        },
        {
            nameHe: "אלטשולר שחם השתלמות מניות",
            companyHe: "אלטשולר שחם",
            month: 2.92,
            year1: 21.39,
            year3: 68.34,
            year5: 60.45,
            fee: 0.68,
            assets: 6923.34
        },
        {
            nameHe: "השתלמות שופטים",
            companyHe: "השתלמות",
            month: 2.61,
            year1: 18.81,
            year3: 51.03,
            year5: 59.52,
            fee: 0.33,
            assets: 471.27
        },
        {
            nameHe: "ק.ה.ר",
            companyHe: "ק.ה.ר",
            month: 2.52,
            year1: 20.51,
            year3: 57.17,
            year5: 58.54,
            fee: 1.02,
            assets: 125.73
        },
        {
            nameHe: "אנליסט השתלמות כללי",
            companyHe: "אנליסט",
            month: 1.73,
            year1: 14.89,
            year3: 46.6,
            year5: 57.62,
            fee: 0.62,
            assets: 20347.75
        },
        {
            nameHe: "קרן השתלמות למורים בבתיה\"ס העי\"ס במכללות ובסמינרים מסלול כללי",
            companyHe: "כלל",
            month: 1.99,
            year1: 16.13,
            year3: 45.97,
            year5: 57.5,
            fee: 0.19,
            assets: 746.59
        },
        {
            nameHe: "אינפיניטי השתלמות  כללי",
            companyHe: "אינפיניטי",
            month: 2.1,
            year1: 16.39,
            year3: 50.19,
            year5: 56.99,
            fee: 0.6,
            assets: 301.67
        },
        {
            nameHe: "קרן השתלמות למורים בבתי הספר העי\"ס במכללות ובסמינרים מסלול כללי",
            companyHe: "כלל",
            month: 1.96,
            year1: 15.82,
            year3: 45.68,
            year5: 55.97,
            fee: 0.2,
            assets: 10102.42
        },
        {
            nameHe: "עובדי מדינה - כללי",
            companyHe: "כלל",
            month: 2.22,
            year1: 16.76,
            year3: 47.37,
            year5: 55.6,
            fee: 0.38,
            assets: 3307.06
        },
        {
            nameHe: "מור השתלמות - כללי",
            companyHe: "כלל",
            month: 2.11,
            year1: 15.34,
            year3: 42.66,
            year5: 54.87,
            fee: 0.7,
            assets: 26356.51
        },
        {
            nameHe: "מיטב השתלמות כללי",
            companyHe: "מיטב",
            month: 2.05,
            year1: 16.05,
            year3: 43.63,
            year5: 54.85,
            fee: 0.6,
            assets: 32162.28
        },
        {
            nameHe: "הפניקס השתלמות כללי",
            companyHe: "הפניקס",
            month: 2.09,
            year1: 16.53,
            year3: 43.3,
            year5: 52.31,
            fee: 0.65,
            assets: 22687.84
        },
        {
            nameHe: "קרן השתלמות לעובדי בנק ישראל",
            companyHe: "קרן",
            month: 2.09,
            year1: 15.9,
            year3: 43.57,
            year5: 52.07,
            fee: 0.38,
            assets: 183.65
        },
        {
            nameHe: "אומגה השתלמות מסלול כללי",
            companyHe: "אומגה",
            month: 2.55,
            year1: 17.08,
            year3: 43.88,
            year5: 52.01,
            fee: 0.54,
            assets: 2133.02
        },
        {
            nameHe: "כלל השתלמות כללי",
            companyHe: "כלל",
            month: 2.66,
            year1: 18.29,
            year3: 42.17,
            year5: 51.76,
            fee: 0.54,
            assets: 21046.87
        },
        {
            nameHe: "רום קלאסי כללי",
            companyHe: "רום",
            month: 2.22,
            year1: 16.97,
            year3: 45.95,
            year5: 51.75,
            fee: 0.31,
            assets: 5623.83
        },
        {
            nameHe: "קרן השתלמות עובדי חברת חשמל",
            companyHe: "קרן",
            month: 2.19,
            year1: 17.58,
            year3: 46.98,
            year5: 50.93,
            fee: 0.34,
            assets: 790.49
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול כללי",
            companyHe: "ילין לפידות",
            month: 1.4,
            year1: 13.5,
            year3: 41.81,
            year5: 50.93,
            fee: 0.68,
            assets: 24702.02
        },
        {
            nameHe: "מגדל השתלמות כללי",
            companyHe: "מגדל",
            month: 2.2,
            year1: 15.92,
            year3: 40.29,
            year5: 50.89,
            fee: 0.54,
            assets: 19835.38
        },
        {
            nameHe: "ק.ל.ע מסלול כללי",
            companyHe: "כלל",
            month: 3.02,
            year1: 16.93,
            year3: 45.4,
            year5: 50.28,
            fee: 0.49,
            assets: 722.29
        },
        {
            nameHe: "מנורה השתלמות כללי",
            companyHe: "מנורה",
            month: 2.26,
            year1: 17.2,
            year3: 41.25,
            year5: 49.76,
            fee: 0.63,
            assets: 12749.93
        },
        {
            nameHe: "מורים תיכוניים - מסלול כללי",
            companyHe: "כלל",
            month: 1.68,
            year1: 14.77,
            year3: 42.38,
            year5: 49.13,
            fee: 0.12,
            assets: 9317.94
        },
        {
            nameHe: "קרן השתלמות עוצ\"מ",
            companyHe: "קרן",
            month: 3.71,
            year1: 20.43,
            year3: 50.35,
            year5: 49.1,
            fee: 0.6,
            assets: 68.44
        },
        {
            nameHe: "מורים תיכוניים - מסלול כללי",
            companyHe: "כלל",
            month: 1.66,
            year1: 14.94,
            year3: 42.48,
            year5: 49.05,
            fee: 0.12,
            assets: 795.03
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע כללי",
            companyHe: "קרן החיסכון",
            month: 2.42,
            year1: 15.77,
            year3: 38.6,
            year5: 48.66,
            fee: 0.21,
            assets: 4988.29
        },
        {
            nameHe: "מורים וגננות - מסלול כללי",
            companyHe: "כלל",
            month: 1.62,
            year1: 14.34,
            year3: 42.17,
            year5: 48.21,
            fee: 0.12,
            assets: 28490.03
        },
        {
            nameHe: "הראל השתלמות כללי",
            companyHe: "הראל",
            month: 2.43,
            year1: 15.96,
            year3: 37.64,
            year5: 47.91,
            fee: 0.6,
            assets: 14782.58
        },
        {
            nameHe: "מורים וגננות - מסלול כללי",
            companyHe: "כלל",
            month: 1.62,
            year1: 14.42,
            year3: 41.85,
            year5: 47.01,
            fee: 0.12,
            assets: 1201.86
        },
        {
            nameHe: "רעות-כללי",
            companyHe: "רעות",
            month: 2.6,
            year1: 16.05,
            year3: 42.62,
            year5: 46.65,
            fee: 0.46,
            assets: 2462.84
        },
        {
            nameHe: "הנדסאים השתלמות - מסלול כללי",
            companyHe: "הנדסאים",
            month: 2.1,
            year1: 15.76,
            year3: 43.91,
            year5: 46.25,
            fee: 0.35,
            assets: 2043.73
        },
        {
            nameHe: "הפניקס השתלמות הלכה",
            companyHe: "הפניקס",
            month: 2.16,
            year1: 15.36,
            year3: 42.15,
            year5: 45.64,
            fee: 0.66,
            assets: 342.08
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים- כללי",
            companyHe: "כלל",
            month: 1.59,
            year1: 13.79,
            year3: 36.58,
            year5: 45.45,
            fee: 0.38,
            assets: 1204.14
        },
        {
            nameHe: "קרן השתלמות לאקדמאים במדעי החברה והרוח מסלול כללי",
            companyHe: "אקדמאים",
            month: 2.22,
            year1: 15.29,
            year3: 42.4,
            year5: 44.99,
            fee: 0.28,
            assets: 2652.77
        },
        {
            nameHe: "אחים ואחיות - מסלול כללי",
            companyHe: "כלל",
            month: 2.61,
            year1: 16.17,
            year3: 41.79,
            year5: 44.78,
            fee: 0.27,
            assets: 2257.27
        },
        {
            nameHe: "הראל השתלמות מסלול הלכה",
            companyHe: "הראל",
            month: 2.9,
            year1: 16.41,
            year3: 40.49,
            year5: 44.58,
            fee: 0.67,
            assets: 609.64
        },
        {
            nameHe: "עובדי המדינה הלכתי הלכה יהודית",
            companyHe: "עובדי",
            month: 2.09,
            year1: 14.32,
            year3: 39.5,
            year5: 43.75,
            fee: 0.38,
            assets: 20.42
        },
        {
            nameHe: "קרן השתלמות של עובדי האוניברסיטה העברית כללי",
            companyHe: "כלל",
            month: 1.6,
            year1: 11.92,
            year3: 34.23,
            year5: 43.65,
            fee: 0.44,
            assets: 473.05
        },
        {
            nameHe: "מיטב השתלמות כהלכה",
            companyHe: "מיטב",
            month: 2.18,
            year1: 14.95,
            year3: 39.1,
            year5: 42.72,
            fee: 0.72,
            assets: 459.78
        },
        {
            nameHe: "ק.ס.מ",
            companyHe: "ק.ס.מ",
            month: 2.23,
            year1: 13.84,
            year3: 39.58,
            year5: 42.62,
            fee: 0.51,
            assets: 275.2
        },
        {
            nameHe: "מגדל השתלמות  הלכה",
            companyHe: "מגדל",
            month: 2.11,
            year1: 15.82,
            year3: 40.13,
            year5: 42.19,
            fee: 0.59,
            assets: 492.58
        },
        {
            nameHe: "מינהל-השתלמות - כללי",
            companyHe: "מינהל",
            month: 2.2,
            year1: 15.8,
            year3: 43.48,
            year5: 41.93,
            fee: 0.56,
            assets: 1103.08
        },
        {
            nameHe: "רום הלכה",
            companyHe: "רום",
            month: 2.12,
            year1: 13.36,
            year3: 38.09,
            year5: 41.69,
            fee: 0.31,
            assets: 49.27
        },
        {
            nameHe: "כלל השתלמות הלכה",
            companyHe: "כלל",
            month: 2.73,
            year1: 16.85,
            year3: 40.18,
            year5: 41.47,
            fee: 0.56,
            assets: 327.99
        },
        {
            nameHe: "קרן השתלמות למורים בבתי הספר העי\"ס במכללות ובסמינרים מסלול הלכה",
            companyHe: "כלל",
            month: 2.31,
            year1: 14.27,
            year3: 38.85,
            year5: 40.91,
            fee: 0.17,
            assets: 14.11
        },
        {
            nameHe: "אלטשולר שחם השתלמות כללי ב'",
            companyHe: "כלל",
            month: 2.04,
            year1: 14.81,
            year3: 43,
            year5: 40.91,
            fee: 0.69,
            assets: 693.79
        },
        {
            nameHe: "מנורה השתלמות עוקב מדדים גמיש",
            companyHe: "מנורה",
            month: 2.25,
            year1: 13.4,
            year3: 38.53,
            year5: 40.26,
            fee: 0.62,
            assets: 1042.05
        },
        {
            nameHe: "מורים וגננות - מסלול הלכה",
            companyHe: "מור",
            month: 1.98,
            year1: 13.72,
            year3: 40.02,
            year5: 39.86,
            fee: 0.12,
            assets: 37.63
        },
        {
            nameHe: "קרן השתלמות למורים בבתיה\"ס העי\"ס במכללות ובסמינרים מסלול הלכה",
            companyHe: "כלל",
            month: 2.16,
            year1: 13.48,
            year3: 37.94,
            year5: 39.85,
            fee: 0.2,
            assets: 342.83
        },
        {
            nameHe: "מורים תיכוניים - מסלול הלכה",
            companyHe: "מור",
            month: 1.95,
            year1: 13.84,
            year3: 39.66,
            year5: 38.81,
            fee: 0.12,
            assets: 18.95
        },
        {
            nameHe: "מורים וגננות - מסלול הלכה",
            companyHe: "מור",
            month: 1.93,
            year1: 13.52,
            year3: 39.55,
            year5: 38.64,
            fee: 0.12,
            assets: 1582.95
        },
        {
            nameHe: "מורים תיכוניים - מסלול הלכה",
            companyHe: "מור",
            month: 1.98,
            year1: 13.6,
            year3: 38.76,
            year5: 38.32,
            fee: 0.12,
            assets: 394.46
        },
        {
            nameHe: "הפניקס השתלמות שריעה",
            companyHe: "הפניקס",
            month: -2.06,
            year1: 1.89,
            year3: 46,
            year5: 37.42,
            fee: 0.67,
            assets: 148.06
        },
        {
            nameHe: "פ.ר.ח - כללי",
            companyHe: "כלל",
            month: 1.54,
            year1: 14.24,
            year3: 38.94,
            year5: 37.06,
            fee: 0.76,
            assets: 136.33
        },
        {
            nameHe: "אלטשולר שחם השתלמות כללי",
            companyHe: "כלל",
            month: 1.65,
            year1: 13.24,
            year3: 37.93,
            year5: 36.76,
            fee: 0.69,
            assets: 32003.06
        },
        {
            nameHe: "מיטב השתלמות עוקב מדדים גמיש",
            companyHe: "מיטב",
            month: -0.46,
            year1: 5.18,
            year3: 36.06,
            year5: 36.11,
            fee: 0.63,
            assets: 1286.22
        },
        {
            nameHe: "מור השתלמות - אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "מור",
            month: 0.98,
            year1: 9.33,
            year3: 29.56,
            year5: 35.99,
            fee: 0.68,
            assets: 1519.53
        },
        {
            nameHe: "אלטשולר שחם השתלמות הלכה",
            companyHe: "אלטשולר שחם",
            month: 1.84,
            year1: 13.06,
            year3: 38.55,
            year5: 34.44,
            fee: 0.74,
            assets: 310.54
        },
        {
            nameHe: "מיטב השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "מיטב",
            month: 1.1,
            year1: 11.37,
            year3: 30.78,
            year5: 33.99,
            fee: 0.57,
            assets: 3549.69
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול אג\"ח עם מניות (עד 25% מניות)",
            companyHe: "ילין לפידות",
            month: 0.77,
            year1: 9.04,
            year3: 27.63,
            year5: 33.11,
            fee: 0.7,
            assets: 4727.29
        },
        {
            nameHe: "הראל השתלמות משולב סחיר",
            companyHe: "הראל",
            month: -0.72,
            year1: 1.16,
            year3: 27.87,
            year5: 29.46,
            fee: 0.54,
            assets: 679.13
        },
        {
            nameHe: "מנורה השתלמות אשראי ואג\"ח",
            companyHe: "מנורה",
            month: 1.04,
            year1: 10,
            year3: 30.42,
            year5: 27.72,
            fee: 0.47,
            assets: 550.32
        },
        {
            nameHe: "אנליסט השתלמות אשראי ואג\"ח עד 25% מניות",
            companyHe: "אנליסט",
            month: 1.19,
            year1: 10.32,
            year3: 27.69,
            year5: 27.42,
            fee: 0.5,
            assets: 477.26
        },
        {
            nameHe: "אינפיניטי השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "אינפיניטי",
            month: 1.37,
            year1: 9.82,
            year3: 30.81,
            year5: 26.54,
            fee: 0.34,
            assets: 82.83
        },
        {
            nameHe: "אנליסט השתלמות משולב סחיר",
            companyHe: "אנליסט",
            month: -2.41,
            year1: -4.1,
            year3: 22.95,
            year5: 26.38,
            fee: 0.62,
            assets: 826.24
        },
        {
            nameHe: "רעות - אשראי ואג\"ח עד 25% מניות",
            companyHe: "רעות",
            month: 1.4,
            year1: 11.12,
            year3: 25.17,
            year5: 25.63,
            fee: 0.46,
            assets: 15.03
        },
        {
            nameHe: "הפניקס השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "הפניקס",
            month: 0.2,
            year1: 7.97,
            year3: 22.68,
            year5: 25.21,
            fee: 0.63,
            assets: 2917.52
        },
        {
            nameHe: "כלל השתלמות אשראי ואג\"ח עם מניות(עד 25% מניות)",
            companyHe: "כלל",
            month: 1.21,
            year1: 10.49,
            year3: 25.94,
            year5: 25.14,
            fee: 0.51,
            assets: 444.28
        },
        {
            nameHe: "מיטב השתלמות אשראי ואג\"ח",
            companyHe: "מיטב",
            month: 0.48,
            year1: 6.98,
            year3: 18.86,
            year5: 24.91,
            fee: 0.59,
            assets: 942.87
        },
        {
            nameHe: "עובדי מדינה - משולב-אג\"ח עד 25 אחוז מניות",
            companyHe: "עובדי",
            month: 0.98,
            year1: 9.03,
            year3: 24.64,
            year5: 24.79,
            fee: 0.38,
            assets: 22.36
        },
        {
            nameHe: "ק.ל.ע אג\"ח עד 25% מניות",
            companyHe: "ק.ל.ע",
            month: 1.22,
            year1: 8.69,
            year3: 24.21,
            year5: 24.51,
            fee: 0.49,
            assets: 10.03
        },
        {
            nameHe: "אומגה השתלמות עד 25% מניות",
            companyHe: "אומגה",
            month: 0.69,
            year1: 8.23,
            year3: 24.06,
            year5: 24.49,
            fee: 0.48,
            assets: 21.04
        },
        {
            nameHe: "הראל השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "הראל",
            month: 0.64,
            year1: 7.25,
            year3: 18.71,
            year5: 24.43,
            fee: 0.55,
            assets: 2757.19
        },
        {
            nameHe: "הפניקס השתלמות עוקב מדדים גמיש",
            companyHe: "הפניקס",
            month: -1.58,
            year1: 0.24,
            year3: 21.44,
            year5: 24.32,
            fee: 0.61,
            assets: 471.91
        },
        {
            nameHe: "אלטשולר שחם השתלמות אשראי ואג\"ח עם מניות (עד 25% מניות)",
            companyHe: "אלטשולר שחם",
            month: 0.83,
            year1: 8.3,
            year3: 21.46,
            year5: 23.06,
            fee: 0.7,
            assets: 4282.71
        },
        {
            nameHe: "הנדסאים השתלמות - מסלול אשראי ואג\"ח",
            companyHe: "הנדסאים",
            month: 1.1,
            year1: 8.81,
            year3: 25.08,
            year5: 22.14,
            fee: 0.35,
            assets: 67.02
        },
        {
            nameHe: "אינפיניטי השתלמות אשראי ואג\"ח",
            companyHe: "אינפיניטי",
            month: 0.72,
            year1: 7.28,
            year3: 22.61,
            year5: 21.99,
            fee: 0.68,
            assets: 156.22
        },
        {
            nameHe: "מנורה השתלמות עוקב מדדי אגח עד 25% מניות",
            companyHe: "מנורה",
            month: 1.21,
            year1: 10.47,
            year3: 23.05,
            year5: 20.06,
            fee: 0.54,
            assets: 136.87
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול אשראי ואג\"ח",
            companyHe: "ילין לפידות",
            month: 0.53,
            year1: 7.02,
            year3: 17.63,
            year5: 19.58,
            fee: 0.68,
            assets: 576.13
        },
        {
            nameHe: "השתלמות משפטנים אשראי ואג\"ח",
            companyHe: "משפטנים",
            month: 1.38,
            year1: 12.32,
            year3: 21.93,
            year5: 19.38,
            fee: 0.42,
            assets: 3.61
        },
        {
            nameHe: "מינהל - השתלמות - אשראי ואג\"ח",
            companyHe: "מינהל",
            month: 0.34,
            year1: 5.23,
            year3: 15.01,
            year5: 19.36,
            fee: 0.56,
            assets: 18.08
        },
        {
            nameHe: "שיבולת - השתלמות",
            companyHe: "שיבולת",
            month: 0.41,
            year1: 4.7,
            year3: 14.95,
            year5: 18.83,
            fee: 0.21,
            assets: 211.76
        },
        {
            nameHe: "כלל השתלמות אשראי ואג\"ח",
            companyHe: "כלל",
            month: 0.57,
            year1: 7.08,
            year3: 17.77,
            year5: 18.51,
            fee: 0.54,
            assets: 397.54
        },
        {
            nameHe: "רום רביד אשראי ואג\"ח",
            companyHe: "רום",
            month: 0.63,
            year1: 6.3,
            year3: 16.46,
            year5: 18.38,
            fee: 0.31,
            assets: 101.46
        },
        {
            nameHe: "כלל השתלמות כספי(שקלי)",
            companyHe: "כלל",
            month: 0.45,
            year1: 5.05,
            year3: 15.41,
            year5: 16.67,
            fee: 0.52,
            assets: 220.19
        },
        {
            nameHe: "אלטשולר שחם השתלמות כספי (שקלי)",
            companyHe: "אלטשולר שחם",
            month: 0.54,
            year1: 5.29,
            year3: 15.14,
            year5: 16.46,
            fee: 0.66,
            assets: 260.49
        },
        {
            nameHe: "מנורה השתלמות אג\"ח עד 25% מניות",
            companyHe: "מנורה",
            month: -0.14,
            year1: 5.35,
            year3: 15.02,
            year5: 15.89,
            fee: 0.62,
            assets: 1542.52
        },
        {
            nameHe: "מיטב השתלמות אג\"ח ממשלות",
            companyHe: "מיטב",
            month: 0.44,
            year1: 6.23,
            year3: 14.74,
            year5: 15.79,
            fee: 0.62,
            assets: 181.09
        },
        {
            nameHe: "הפניקס השתלמות אשראי ואג\"ח",
            companyHe: "הפניקס",
            month: 0.21,
            year1: 5.83,
            year3: 16.35,
            year5: 15.79,
            fee: 0.64,
            assets: 714.06
        },
        {
            nameHe: "אחים ואחיות - מסלול אשראי ואג\"ח",
            companyHe: "אחים",
            month: 0.53,
            year1: 5.92,
            year3: 15.74,
            year5: 15.64,
            fee: 0.27,
            assets: 30.04
        },
        {
            nameHe: "אלטשולר שחם השתלמות  אג\"ח ממשלות",
            companyHe: "אלטשולר שחם",
            month: 0.6,
            year1: 6.46,
            year3: 14.95,
            year5: 15.59,
            fee: 0.7,
            assets: 211.86
        },
        {
            nameHe: "אלטשולר שחם השתלמות אשראי ואג\"ח",
            companyHe: "אלטשולר שחם",
            month: 0.2,
            year1: 5.31,
            year3: 14.67,
            year5: 15.36,
            fee: 0.66,
            assets: 575.31
        },
        {
            nameHe: "אנליסט השתלמות אשראי ואג\"ח",
            companyHe: "אנליסט",
            month: 0.65,
            year1: 6.68,
            year3: 16.09,
            year5: 15.01,
            fee: 0.61,
            assets: 235.56
        },
        {
            nameHe: "מור השתלמות -כספי (שקלי)",
            companyHe: "מור",
            month: 0.39,
            year1: 4.44,
            year3: 13.54,
            year5: 14.92,
            fee: 0.68,
            assets: 117.72
        },
        {
            nameHe: "מיטב השתלמות כספי (שקלי)",
            companyHe: "מיטב",
            month: 0.37,
            year1: 4.57,
            year3: 14.18,
            year5: 14.58,
            fee: 0.52,
            assets: 225
        },
        {
            nameHe: "הפניקס השתלמות כספי (שקלי)",
            companyHe: "הפניקס",
            month: 0.3,
            year1: 4.59,
            year3: 13.58,
            year5: 14.58,
            fee: 0.6,
            assets: 248.25
        },
        {
            nameHe: "מגדל השתלמות אשראי ואג\"ח",
            companyHe: "מגדל",
            month: 0.52,
            year1: 6.5,
            year3: 16.84,
            year5: 14.48,
            fee: 0.56,
            assets: 457.25
        },
        {
            nameHe: "רעות - אשראי ואג\"ח",
            companyHe: "רעות",
            month: 0.44,
            year1: 4.85,
            year3: 9.99,
            year5: 14.34,
            fee: 0.46,
            assets: 40.3
        },
        {
            nameHe: "אנליסט השתלמות כספי (שקלי)",
            companyHe: "אנליסט",
            month: 0.39,
            year1: 4.43,
            year3: 13.62,
            year5: 14.15,
            fee: 0.58,
            assets: 112.32
        },
        {
            nameHe: "מגדל השתלמות עוקב מדדים - גמיש",
            companyHe: "מגדל",
            month: -1.6,
            year1: -1.18,
            year3: 11.96,
            year5: 14.02,
            fee: 0.54,
            assets: 386.57
        },
        {
            nameHe: "מגדל השתלמות כספי (שקלי)",
            companyHe: "מגדל",
            month: 0.39,
            year1: 4.79,
            year3: 13.65,
            year5: 13.66,
            fee: 0.5,
            assets: 181.08
        },
        {
            nameHe: "מנורה השתלמות כספי (שקלי)",
            companyHe: "מנורה",
            month: 0.34,
            year1: 4.38,
            year3: 13.45,
            year5: 13.57,
            fee: 0.51,
            assets: 167.4
        },
        {
            nameHe: "הראל השתלמות אשראי ואג\"ח",
            companyHe: "הראל",
            month: 0.49,
            year1: 7.04,
            year3: 14.16,
            year5: 13.1,
            fee: 0.6,
            assets: 325.31
        },
        {
            nameHe: "קרן השתלמות לאקדמאים במדעי החברה והרוח מסלול אשראי ואג\"ח",
            companyHe: "אקדמאים",
            month: 0.71,
            year1: 6.92,
            year3: 14.1,
            year5: 12.93,
            fee: 0.28,
            assets: 50.96
        },
        {
            nameHe: "עובדי המדינה - אג\"ח ממשלות",
            companyHe: "עובדי",
            month: 0.52,
            year1: 5.58,
            year3: 13.43,
            year5: 12.51,
            fee: 0.38,
            assets: 27.38
        },
        {
            nameHe: "מורים תיכוניים - מסלול אשראי ואג\"ח",
            companyHe: "מור",
            month: 0.5,
            year1: 6.37,
            year3: 14.34,
            year5: 12.24,
            fee: 0.11,
            assets: 8.4
        },
        {
            nameHe: "מורים וגננות - מסלול אשראי ואג\"ח",
            companyHe: "מור",
            month: 0.5,
            year1: 6.4,
            year3: 14.25,
            year5: 12.22,
            fee: 0.11,
            assets: 10.5
        },
        {
            nameHe: "מורים וגננות - מסלול אשראי ואג\"ח",
            companyHe: "מור",
            month: 0.5,
            year1: 6.44,
            year3: 13.89,
            year5: 11.66,
            fee: 0.12,
            assets: 2
        },
        {
            nameHe: "פ.ר.ח אשראי ואג\"ח",
            companyHe: "פ.ר.ח",
            month: 0.48,
            year1: 5.72,
            year3: 14.14,
            year5: 11.49,
            fee: 0.75,
            assets: 1.12
        },
        {
            nameHe: "מורים תיכוניים - מסלול אשראי ואג\"ח",
            companyHe: "מור",
            month: 0.53,
            year1: 6.35,
            year3: 13.97,
            year5: 11.35,
            fee: 0.12,
            assets: 2.9
        },
        {
            nameHe: "אומגה השתלמות אשראי ואג\"ח",
            companyHe: "אומגה",
            month: 1.03,
            year1: 9.48,
            year3: 15.62,
            year5: 11.26,
            fee: 0.53,
            assets: 47.15
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים- אג\"ח ממשלות",
            companyHe: "יחד",
            month: 0.45,
            year1: 4.96,
            year3: 11.58,
            year5: 10.31,
            fee: 0.38,
            assets: 7.21
        },
        {
            nameHe: "אנליסט השתלמות אג\"ח ממשלות",
            companyHe: "אנליסט",
            month: 0.77,
            year1: 6.53,
            year3: 13.73,
            year5: 10.13,
            fee: 0.58,
            assets: 59.28
        },
        {
            nameHe: "קרן השתלמות למורים בבתי הספר העי\"ס במכללות ובסמינרים  מסלול אשראי ואג\"ח",
            companyHe: "כלל",
            month: 0.36,
            year1: 4.89,
            year3: 12.91,
            year5: 9.36,
            fee: 0.17,
            assets: 2.17
        },
        {
            nameHe: "קרן השתלמות למורים בבתי הספר העי\"ס במכללות ובסמינרים מסלול אשראי ואג\"ח",
            companyHe: "כלל",
            month: 0.37,
            year1: 4.85,
            year3: 12.87,
            year5: 8.69,
            fee: 0.21,
            assets: 3.36
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע אשראי ואג\"ח",
            companyHe: "קרן החיסכון",
            month: 0.5,
            year1: 6.09,
            year3: 9.76,
            year5: 8.51,
            fee: 0.19,
            assets: 140.4
        },
        {
            nameHe: "רעות - כספי (שקלי)",
            companyHe: "רעות",
            month: 0.38,
            year1: 4.32,
            year3: 13.2,
            year5: 8.18,
            fee: 0.46,
            assets: 21.19
        },
        {
            nameHe: "אינפיניטי השתלמות אג\"ח ממשלות",
            companyHe: "אינפיניטי",
            month: 0.62,
            year1: 5.6,
            year3: 11.96,
            year5: 7.88,
            fee: 0.35,
            assets: 47.85
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול אג\"ח ממשלות",
            companyHe: "ילין לפידות",
            month: 0.61,
            year1: 5.44,
            year3: 10.55,
            year5: 6.87,
            fee: 0.7,
            assets: 132.33
        },
        {
            nameHe: "גלובל נט השתלמות IRA",
            companyHe: "גלובל",
            month: 0,
            year1: 0,
            year3: 0,
            year5: 6.52,
            fee: 0.29,
            assets: 443.76
        },
        {
            nameHe: "מגדל השתלמות אג\"ח ממשלות",
            companyHe: "מגדל",
            month: 0.31,
            year1: 5.31,
            year3: 8.71,
            year5: 2.84,
            fee: 0.61,
            assets: 131.22
        },
        {
            nameHe: "סלייס השתלמות בניהול אישי",
            companyHe: "סלייס",
            month: 0,
            year1: 0,
            year3: 0,
            year5: 0,
            fee: 0.34,
            assets: 101.79
        },
        {
            nameHe: "גלובל נט השתלמות בניהול אישי",
            companyHe: "גלובל",
            month: 0,
            year1: 0,
            year3: 0,
            year5: 0,
            fee: 0.31,
            assets: 2224.46
        },
        {
            nameHe: "מגדל השתלמות בניהול אישי IRA",
            companyHe: "מגדל",
            month: 0,
            year1: 0,
            year3: 0,
            year5: 0,
            fee: 0.36,
            assets: 139.83
        },
        {
            nameHe: "הפניקס השתלמות בניהול אישי",
            companyHe: "הפניקס",
            month: 0,
            year1: 0,
            year3: 0,
            year5: 0,
            fee: 0.24,
            assets: 1131.92
        },
        {
            nameHe: "מיטב השתלמות בניהול אישי",
            companyHe: "מיטב",
            month: 0,
            year1: 0,
            year3: 0,
            year5: 0,
            fee: 0.3,
            assets: 4557.46
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
            month: -1.64,
            year1: -0.07,
            year3: 59.42,
            year5: null,
            fee: 0.19,
            assets: 1330.33
        },
        {
            nameHe: "אנליסט השתלמות עוקב מדד S&P500",
            companyHe: "אנליסט",
            month: -1.86,
            year1: -0.4,
            year3: 55.72,
            year5: null,
            fee: 0.62,
            assets: 1633.18
        },
        {
            nameHe: "מנורה מבטחים השתלמות הלכה",
            companyHe: "מנורה מבטחים",
            month: 2.17,
            year1: 14.02,
            year3: 28.91,
            year5: null,
            fee: 0.63,
            assets: 124.76
        },
        {
            nameHe: "מנורה השתלמות עוקב S&P500",
            companyHe: "מנורה",
            month: -1.85,
            year1: 0.14,
            year3: 57.52,
            year5: null,
            fee: 0.49,
            assets: 2793.5
        },
        {
            nameHe: "מינהל-השתלמות - הלכה",
            companyHe: "מינהל",
            month: 2.63,
            year1: 14.89,
            year3: null,
            year5: null,
            fee: 0.55,
            assets: 2.27
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע - קיימות",
            companyHe: "קרן החיסכון",
            month: 3.15,
            year1: 16.34,
            year3: 2.85,
            year5: null,
            fee: 0.19,
            assets: 12.39
        },
        {
            nameHe: "אומגה השתלמות מדדי מניות",
            companyHe: "אומגה",
            month: 2.96,
            year1: 12,
            year3: null,
            year5: null,
            fee: 0.46,
            assets: 22.89
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול עוקב מדדים גמיש",
            companyHe: "ילין לפידות",
            month: -1.36,
            year1: 0.95,
            year3: null,
            year5: null,
            fee: 0.66,
            assets: 423.51
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים- עוקב מדד S&P 500",
            companyHe: "יחד",
            month: -2.23,
            year1: 0.62,
            year3: null,
            year5: null,
            fee: 0.39,
            assets: 10.67
        },
        {
            nameHe: "רעות - עוקב מדד S&P 500",
            companyHe: "רעות",
            month: -2.17,
            year1: -0.5,
            year3: null,
            year5: null,
            fee: 0.46,
            assets: 28.92
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול עוקב מדד s&p 500",
            companyHe: "ילין לפידות",
            month: -1.97,
            year1: -0.67,
            year3: null,
            year5: null,
            fee: 0.68,
            assets: 1001.16
        },
        {
            nameHe: "מנורה השתלמות מדדי מניות",
            companyHe: "מנורה",
            month: 3.95,
            year1: 19.1,
            year3: null,
            year5: null,
            fee: 0.6,
            assets: 710.61
        },
        {
            nameHe: "אקטיון השתלמות  IRA",
            companyHe: "אקטיון",
            month: -0.36,
            year1: 9.93,
            year3: null,
            year5: null,
            fee: 0.26,
            assets: 12.25
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע - כספי (שקלי)",
            companyHe: "קרן החיסכון",
            month: 0.37,
            year1: 4.6,
            year3: null,
            year5: null,
            fee: 0.19,
            assets: 36.35
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע - מניות סחיר",
            companyHe: "קרן החיסכון",
            month: 7.84,
            year1: 58.54,
            year3: null,
            year5: null,
            fee: 0.18,
            assets: 177.96
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע -משולב סחיר",
            companyHe: "קרן החיסכון",
            month: -0.7,
            year1: 0.77,
            year3: null,
            year5: null,
            fee: 0.18,
            assets: 11.87
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע - עוקב מדדים - גמיש",
            companyHe: "קרן החיסכון",
            month: 2.3,
            year1: 16.41,
            year3: null,
            year5: null,
            fee: 0.18,
            assets: 29.69
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע -עוקב מדדי מניות",
            companyHe: "קרן החיסכון",
            month: -0.28,
            year1: 4.71,
            year3: null,
            year5: null,
            fee: 0.18,
            assets: 59.39
        },
        {
            nameHe: "אנליסט השתלמות עוקב מדדים - גמיש",
            companyHe: "אנליסט",
            month: 6.98,
            year1: 51.3,
            year3: null,
            year5: null,
            fee: 0.61,
            assets: 1300.27
        },
        {
            nameHe: "אנליסט השתלמות עוקב מדדי מניות",
            companyHe: "אנליסט",
            month: 0.84,
            year1: 9.9,
            year3: null,
            year5: null,
            fee: 0.62,
            assets: 287.71
        },
        {
            nameHe: "קרן השתלמות של עובדי האוניברסיטה העברית מניות מניות",
            companyHe: "קרן",
            month: 4.22,
            year1: 21.44,
            year3: null,
            year5: null,
            fee: 0.42,
            assets: 33.41
        },
        {
            nameHe: "קרן השתלמות לאקדמאים במדעי החברה והרוח מסלול כללי עוקבי מדדים עוקב מדד s&p 500",
            companyHe: "אקדמאים",
            month: -1.53,
            year1: -0.24,
            year3: null,
            year5: null,
            fee: 0.28,
            assets: 67.23
        },
        {
            nameHe: "הנדסאיםהשתלמות -  מסלול s&p 500",
            companyHe: "הנדסאים",
            month: -2.41,
            year1: -0.67,
            year3: null,
            year5: null,
            fee: 0.34,
            assets: 19.26
        },
        {
            nameHe: "רום עוקב מדד s&p 500",
            companyHe: "רום",
            month: -2.26,
            year1: -0.44,
            year3: null,
            year5: null,
            fee: 0.31,
            assets: 39.95
        },
        {
            nameHe: "מינהל-השתלמות עוקב מדד s&p 500",
            companyHe: "מינהל",
            month: -2.27,
            year1: -0.53,
            year3: null,
            year5: null,
            fee: 0.55,
            assets: 11.05
        },
        {
            nameHe: "עובדי המדינה עוקבי מדדים עוקב מדד s&p 500",
            companyHe: "עובדי",
            month: -2.26,
            year1: -0.75,
            year3: null,
            year5: null,
            fee: 0.38,
            assets: 39.14
        },
        {
            nameHe: "מנורה מבטחים השתלמות משולב סחיר",
            companyHe: "מנורה מבטחים",
            month: -0.21,
            year1: 3.41,
            year3: null,
            year5: null,
            fee: 0.56,
            assets: 94
        },
        {
            nameHe: "ק.ל.ע עוקב מדד s&p 500",
            companyHe: "ק.ל.ע",
            month: -2.12,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 1.67
        },
        {
            nameHe: "קרן השתלמות עובדי חברת חשמל מניות",
            companyHe: "קרן",
            month: 4.12,
            year1: null,
            year3: null,
            year5: null,
            fee: null,
            assets: 29.2
        }
    ],

    // Pension Funds Data (קרנות פנסיה)
    pension: [
        {
            nameHe: "מיטב פנסיה מקיפה עוקב מדדי מניות",
            companyHe: "מיטב",
            month: 2.57,
            year1: 17.29,
            year3: 83.32,
            year5: 97.75,
            fee: 0.1
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מניות",
            companyHe: "הפניקס",
            month: 4.48,
            year1: 28.71,
            year3: 77.67,
            year5: 90.85,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת משלימה מניות",
            companyHe: "מגדל",
            month: 4.43,
            year1: 28.26,
            year3: 77.11,
            year5: 90.51,
            fee: 0.31
        },
        {
            nameHe: "מיטב פנסיה כללית מניות",
            companyHe: "מיטב",
            month: 4.39,
            year1: 28.4,
            year3: 78.4,
            year5: 90.42,
            fee: 0.2
        },
        {
            nameHe: "הראל פנסיה כללית מניות",
            companyHe: "הראל",
            month: 5.13,
            year1: 29.13,
            year3: 74.5,
            year5: 86.45,
            fee: 0.21
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול מניות",
            companyHe: "מנורה מבטחים",
            month: 3.36,
            year1: 23.16,
            year3: 63.17,
            year5: 84.65,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה כללית עוקב מדד S&P500",
            companyHe: "מיטב",
            month: -1.39,
            year1: 0.2,
            year3: 59.11,
            year5: 83.82,
            fee: 0.2
        },
        {
            nameHe: "מיטב פנסיה מקיפה עוקב מדד S&P500",
            companyHe: "מיטב",
            month: -0.88,
            year1: 2.45,
            year3: 49.11,
            year5: 82.6,
            fee: 0.1
        },
        {
            nameHe: "מיטב פנסיה מקיפה מניות",
            companyHe: "מיטב",
            month: 3.09,
            year1: 21.73,
            year3: 61.63,
            year5: 79.55,
            fee: 0.1
        },
        {
            nameHe: "מגדל מקפת אישית מניות",
            companyHe: "מגדל",
            month: 3.29,
            year1: 21.99,
            year3: 61.75,
            year5: 79.5,
            fee: 0.17
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מניות",
            companyHe: "הפניקס",
            month: 3.38,
            year1: 22.82,
            year3: 61.96,
            year5: 78.95,
            fee: 0.16
        },
        {
            nameHe: "הראל פנסיה - מניות",
            companyHe: "הראל",
            month: 3.5,
            year1: 22.02,
            year3: 58.43,
            year5: 78.49,
            fee: 0.17
        },
        {
            nameHe: "הפניקס פנסיה מקיפה עוקב מדד S&P500",
            companyHe: "הפניקס",
            month: -1.18,
            year1: 2.3,
            year3: 47.74,
            year5: 76.13,
            fee: 0.16
        },
        {
            nameHe: "כלל פנסיה מניות",
            companyHe: "כלל",
            month: 3.7,
            year1: 22.98,
            year3: 58.73,
            year5: 73.93,
            fee: 0.16
        },
        {
            nameHe: "הפניקס פנסיה מקיפה  - מסלול לבני 50 ומטה",
            companyHe: "הפניקס",
            month: 2.48,
            year1: 19.22,
            year3: 52.87,
            year5: 73.59,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2055",
            companyHe: "מנורה מבטחים",
            month: 2.72,
            year1: 20.25,
            year3: 51.62,
            year5: 71.9,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2060",
            companyHe: "מנורה מבטחים",
            month: 2.82,
            year1: 20.54,
            year3: 52.13,
            year5: 70.65,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה מקיפה לבני 50 ומטה",
            companyHe: "מיטב",
            month: 2.45,
            year1: 18.48,
            year3: 52.14,
            year5: 70.29,
            fee: 0.1
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2050",
            companyHe: "מנורה מבטחים",
            month: 2.67,
            year1: 19.16,
            year3: 48.86,
            year5: 68.4,
            fee: 0.16
        },
        {
            nameHe: "כלל פנסיה לבני 50 ומטה",
            companyHe: "כלל",
            month: 2.89,
            year1: 20.11,
            year3: 49.74,
            year5: 67.91,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2045",
            companyHe: "מנורה מבטחים",
            month: 2.62,
            year1: 18.59,
            year3: 47.18,
            year5: 67.11,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה מקיפה לבני 50 עד 60",
            companyHe: "מיטב",
            month: 2.08,
            year1: 16.52,
            year3: 46.95,
            year5: 66.04,
            fee: 0.1
        },
        {
            nameHe: "מנורה מבטחים פנסיה יעד לפרישה 2065",
            companyHe: "מנורה מבטחים",
            month: 2.97,
            year1: 21.05,
            year3: 53.38,
            year5: 65.9,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת אישית לבני 50 ומטה",
            companyHe: "מגדל",
            month: 2.61,
            year1: 18.65,
            year3: 49.2,
            year5: 65.69,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים פנסיה - כללי",
            companyHe: "מנורה מבטחים",
            month: 2.49,
            year1: 17.86,
            year3: 45.77,
            year5: 65.54,
            fee: 0.16
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול לבני 50 עד 60",
            companyHe: "הפניקס",
            month: 2.22,
            year1: 17.27,
            year3: 47.38,
            year5: 63.55,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת אישית כללי",
            companyHe: "מגדל",
            month: 2.26,
            year1: 16.95,
            year3: 43.97,
            year5: 63.38,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2040",
            companyHe: "מנורה מבטחים",
            month: 2.34,
            year1: 17.64,
            year3: 44.96,
            year5: 63.22,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת אישית עוקב מדדים למקבלי קצבה",
            companyHe: "מגדל",
            month: 1.4,
            year1: 14.06,
            year3: 42.23,
            year5: 62.53,
            fee: 0.17
        },
        {
            nameHe: "כלל פנסיה כללי",
            companyHe: "כלל",
            month: 2.6,
            year1: 18.17,
            year3: 43.9,
            year5: 62.16,
            fee: 0.16
        },
        {
            nameHe: "הראל פנסיה - גילאי 50 ומטה",
            companyHe: "הראל",
            month: 2.9,
            year1: 18.45,
            year3: 44.49,
            year5: 62.16,
            fee: 0.17
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה מניות",
            companyHe: "אלטשולר שחם",
            month: 2.33,
            year1: 17.96,
            year3: 57.89,
            year5: 60.88,
            fee: 0.13
        },
        {
            nameHe: "כלל פנסיה לבני 50-60",
            companyHe: "כלל",
            month: 2.53,
            year1: 17.58,
            year3: 44.6,
            year5: 60.09,
            fee: 0.16
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית מניות",
            companyHe: "כלל",
            month: 3.07,
            year1: 21.18,
            year3: 70.36,
            year5: 59.48,
            fee: 0.2
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2060",
            companyHe: "מנורה מבטחים",
            month: 2.75,
            year1: 20.21,
            year3: 49.42,
            year5: 59.32,
            fee: 0.34
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2055",
            companyHe: "מנורה מבטחים",
            month: 2.72,
            year1: 20.03,
            year3: 48.92,
            year5: 59.1,
            fee: 0.34
        },
        {
            nameHe: "הראל פנסיה - הלכה",
            companyHe: "הראל",
            month: 2.89,
            year1: 16.91,
            year3: 46.19,
            year5: 58.87,
            fee: 0.17
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול הלכה",
            companyHe: "הפניקס",
            month: 2.27,
            year1: 16.76,
            year3: 45.88,
            year5: 58.59,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת אישית לבני 50 עד 60",
            companyHe: "מגדל",
            month: 2.12,
            year1: 16.28,
            year3: 43.79,
            year5: 58.17,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2045",
            companyHe: "מנורה מבטחים",
            month: 2.56,
            year1: 18.57,
            year3: 46.1,
            year5: 57.71,
            fee: 0.34
        },
        {
            nameHe: "מנורה מבטחים פנסיה עוקב מדדי מניות",
            companyHe: "מנורה מבטחים",
            month: 2.24,
            year1: 8.37,
            year3: 40.74,
            year5: 57.58,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים משלימה עוקב מדדי מניות",
            companyHe: "מנורה מבטחים",
            month: 2.9,
            year1: 8.45,
            year3: 46.53,
            year5: 57.54,
            fee: 0.34
        },
        {
            nameHe: "הראל  פנסיה - גילעד כללי",
            companyHe: "הראל",
            month: 2.43,
            year1: 15.97,
            year3: 40.18,
            year5: 57.42,
            fee: 0.17
        },
        {
            nameHe: "הראל פנסיה - מנוף כללי",
            companyHe: "הראל",
            month: 2.42,
            year1: 15.93,
            year3: 40.32,
            year5: 57.14,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים משלימה -יעד לפרישה 2050",
            companyHe: "מנורה מבטחים",
            month: 2.68,
            year1: 19.35,
            year3: 47.53,
            year5: 57.08,
            fee: 0.34
        },
        {
            nameHe: "מיטב פנסיה כללית לבני 50 ומטה",
            companyHe: "מיטב",
            month: 2.53,
            year1: 18.63,
            year3: 49.65,
            year5: 56.67,
            fee: 0.2
        },
        {
            nameHe: "מגדל מקפת אישית הלכה",
            companyHe: "מגדל",
            month: 2.19,
            year1: 16.6,
            year3: 44.71,
            year5: 56.62,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2035",
            companyHe: "מנורה מבטחים",
            month: 2.04,
            year1: 15.16,
            year3: 40.07,
            year5: 56.5,
            fee: 0.16
        },
        {
            nameHe: "הראל פנסיה - גילאי 50 עד 60",
            companyHe: "הראל",
            month: 2.47,
            year1: 16.06,
            year3: 39.98,
            year5: 55.76,
            fee: 0.17
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מסלול לבני 50 ומטה",
            companyHe: "הפניקס",
            month: 2.55,
            year1: 18.75,
            year3: 48.21,
            year5: 55.44,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה מקיפה הלכה",
            companyHe: "מיטב",
            month: 2.25,
            year1: 15.8,
            year3: 43.69,
            year5: 54.95,
            fee: 0.1
        },
        {
            nameHe: "מנורה מבטחים משלימה יעד לפרישה 2065",
            companyHe: "מנורה מבטחים",
            month: 2.88,
            year1: 20.24,
            year3: 50.23,
            year5: 54.27,
            fee: 0.34
        },
        {
            nameHe: "מגדל מקפת משלימה לבני 50 ומטה",
            companyHe: "מגדל",
            month: 2.65,
            year1: 18.2,
            year3: 47.09,
            year5: 54.09,
            fee: 0.31
        },
        {
            nameHe: "כלל פנסיה הלכה",
            companyHe: "כלל",
            month: 2.55,
            year1: 17.28,
            year3: 44.71,
            year5: 54.02,
            fee: 0.16
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה מסלול לבני 50 ומטה",
            companyHe: "אלטשולר שחם",
            month: 1.88,
            year1: 15.83,
            year3: 49.43,
            year5: 53.92,
            fee: 0.13
        },
        {
            nameHe: "כלל פנסיה משלימה לבני 50 ומטה",
            companyHe: "כלל",
            month: 2.91,
            year1: 20.02,
            year3: 47.24,
            year5: 53.64,
            fee: 0.27
        },
        {
            nameHe: "הראל פנסיה כללית - גילאי 50 ומטה",
            companyHe: "הראל",
            month: 2.98,
            year1: 20.14,
            year3: 45.52,
            year5: 53.1,
            fee: 0.21
        },
        {
            nameHe: "מיטב פנסיה מקיפה הלכה למקבלי קצבה",
            companyHe: "מיטב",
            month: 1.36,
            year1: 11.66,
            year3: 34.49,
            year5: 51.36,
            fee: 0.1
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2040",
            companyHe: "מנורה מבטחים",
            month: 2.2,
            year1: 16.45,
            year3: 40.86,
            year5: 50.55,
            fee: 0.34
        },
        {
            nameHe: "מגדל מקפת אישית הלכה למקבלי קצבה",
            companyHe: "מגדל",
            month: 1.18,
            year1: 11.26,
            year3: 33.47,
            year5: 50.4,
            fee: 0.17
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה למקבלי קצבה קיימים",
            companyHe: "אלטשולר שחם",
            month: 0.75,
            year1: 9.06,
            year3: 31.66,
            year5: 50.3,
            fee: 0.13
        },
        {
            nameHe: "מיטב פנסיה כללית לבני 50 עד 60",
            companyHe: "מיטב",
            month: 2.14,
            year1: 16.34,
            year3: 43.85,
            year5: 49.92,
            fee: 0.2
        },
        {
            nameHe: "מנורה מבטחים פנסיה בסיסי למקבלי קצבה",
            companyHe: "מנורה מבטחים",
            month: 1.02,
            year1: 10.89,
            year3: 31.87,
            year5: 49.77,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת אישית בסיסי למקבלי קצבה",
            companyHe: "מגדל",
            month: 0.95,
            year1: 10.39,
            year3: 31.48,
            year5: 49.72,
            fee: 0.17
        },
        {
            nameHe: "הראל פנסיה -  הלכה למקבלי קצבה",
            companyHe: "הראל",
            month: 1.38,
            year1: 11.21,
            year3: 31.79,
            year5: 49.54,
            fee: 0.17
        },
        {
            nameHe: "מיטב פנסיה מקיפה בסיסי למקבלי קצבה",
            companyHe: "מיטב",
            month: 0.84,
            year1: 10.12,
            year3: 32.45,
            year5: 49.3,
            fee: 0.1
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה מסלול לבני 50-60",
            companyHe: "אלטשולר שחם",
            month: 1.67,
            year1: 14.19,
            year3: 45.02,
            year5: 49.06,
            fee: 0.13
        },
        {
            nameHe: "כלל פנסיה מסלול בסיסי למקבלי קצבה",
            companyHe: "כלל",
            month: 1.06,
            year1: 10.33,
            year3: 29.99,
            year5: 48.94,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת משלימה כללי",
            companyHe: "מגדל",
            month: 2.21,
            year1: 16.22,
            year3: 42.1,
            year5: 48.84,
            fee: 0.31
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול בסיסי למקבלי קצבה",
            companyHe: "הפניקס",
            month: 0.32,
            year1: 10.03,
            year3: 31.6,
            year5: 48.73,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול יעד לפרישה 2030",
            companyHe: "מנורה מבטחים",
            month: 1.62,
            year1: 12.82,
            year3: 33.17,
            year5: 48.56,
            fee: 0.16
        },
        {
            nameHe: "כלל פנסיה מסלול הלכה למקבלי קצבה",
            companyHe: "כלל",
            month: 1.14,
            year1: 10.51,
            year3: 32.23,
            year5: 48.47,
            fee: 0.16
        },
        {
            nameHe: "כלל פנסיה משלימה - כללי",
            companyHe: "כלל",
            month: 2.6,
            year1: 18.19,
            year3: 40.88,
            year5: 48.42,
            fee: 0.27
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה בסיסי למקבלי קצבה",
            companyHe: "אלטשולר שחם",
            month: 0.77,
            year1: 8.96,
            year3: 30.68,
            year5: 47.97,
            fee: 0.13
        },
        {
            nameHe: "מיטב פנסיה מקיפה לבני 60 ומעלה",
            companyHe: "מיטב",
            month: 1.39,
            year1: 12.49,
            year3: 35.68,
            year5: 46.91,
            fee: 0.1
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה הלכה",
            companyHe: "אלטשולר שחם",
            month: 1.67,
            year1: 13.26,
            year3: 43.38,
            year5: 46.69,
            fee: 0.13
        },
        {
            nameHe: "כלל פנסיה משלימה לבני 50 עד 60",
            companyHe: "כלל",
            month: 2.54,
            year1: 17.04,
            year3: 41.25,
            year5: 46.45,
            fee: 0.27
        },
        {
            nameHe: "הראל  פנסיה - בסיסי למקבלי קצבה",
            companyHe: "הראל",
            month: 1.06,
            year1: 10.36,
            year3: 29.33,
            year5: 45.89,
            fee: 0.17
        },
        {
            nameHe: "מגדל מקפת משלימה לבני 50 עד 60",
            companyHe: "מגדל",
            month: 2.18,
            year1: 16.16,
            year3: 40.97,
            year5: 45.78,
            fee: 0.31
        },
        {
            nameHe: "כלל פנסיה לבני 60 ומעלה",
            companyHe: "כלל",
            month: 1.67,
            year1: 13.04,
            year3: 32.76,
            year5: 45.65,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה כללית הלכה",
            companyHe: "מיטב",
            month: 1.62,
            year1: 14.96,
            year3: 36.04,
            year5: 45.58,
            fee: 0.2
        },
        {
            nameHe: "מנורה מבטחים פנסיה - מסלול הלכה",
            companyHe: "מנורה מבטחים",
            month: 2.31,
            year1: 15.82,
            year3: 38.01,
            year5: 45.32,
            fee: 0.16
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מסלול לבני 50 עד 60",
            companyHe: "הפניקס",
            month: 2.25,
            year1: 16.69,
            year3: 42.01,
            year5: 45.17,
            fee: 0.16
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2035",
            companyHe: "מנורה מבטחים",
            month: 2.09,
            year1: 15.24,
            year3: 36.84,
            year5: 44.93,
            fee: 0.34
        },
        {
            nameHe: "הראל פנסיה כללית - כללי",
            companyHe: "הראל",
            month: 2.41,
            year1: 15.48,
            year3: 35.91,
            year5: 44.87,
            fee: 0.21
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול לבני 60 ומעלה",
            companyHe: "הפניקס",
            month: 1.29,
            year1: 12.23,
            year3: 33.88,
            year5: 44.73,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת אישית לבני 60 ומעלה",
            companyHe: "מגדל",
            month: 1.43,
            year1: 12.06,
            year3: 32.32,
            year5: 43.21,
            fee: 0.17
        },
        {
            nameHe: "הראל פנסיה כללית - גילאי 50 עד 60",
            companyHe: "הראל",
            month: 2.48,
            year1: 16.08,
            year3: 38.96,
            year5: 42.95,
            fee: 0.21
        },
        {
            nameHe: "מגדל מקפת משלימה הלכה",
            companyHe: "מגדל",
            month: 2.18,
            year1: 16.17,
            year3: 40.95,
            year5: 42.8,
            fee: 0.31
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית הלכה",
            companyHe: "כלל",
            month: 1.77,
            year1: 12.07,
            year3: 39.14,
            year5: 42.2,
            fee: 0.2
        },
        {
            nameHe: "מנורה מבטחים פנסיה קצבה לזכאים קיימים",
            companyHe: "מנורה מבטחים",
            month: 0.34,
            year1: 7.51,
            year3: 23.47,
            year5: 41.53,
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
            nameHe: "אלטשולר שחם פנסיה כללית מסלול לבני 50 ומטה",
            companyHe: "כלל",
            month: 2.01,
            year1: 15.94,
            year3: 46.09,
            year5: 41.07,
            fee: 0.2
        },
        {
            nameHe: "כלל פנסיה קצבה לזכאים קיימים",
            companyHe: "כלל",
            month: 0.4,
            year1: 7.49,
            year3: 23.57,
            year5: 40.47,
            fee: 0.16
        },
        {
            nameHe: "הראל פנסיה - גילאי 60 ומעלה",
            companyHe: "הראל",
            month: 1.55,
            year1: 12.16,
            year3: 29.51,
            year5: 40.44,
            fee: 0.17
        },
        {
            nameHe: "כלל פנסיה משלימה בסיסי למקבלי קצבה",
            companyHe: "כלל",
            month: 2.06,
            year1: 14.74,
            year3: 36.21,
            year5: 40.32,
            fee: 0.27
        },
        {
            nameHe: "מנורה מבטחים משלימה - יעד לפרישה 2030",
            companyHe: "מנורה מבטחים",
            month: 1.74,
            year1: 13.41,
            year3: 32.03,
            year5: 39.64,
            fee: 0.34
        },
        {
            nameHe: "הראל פנסיה כללית - בסיסי למקבלי קצבה",
            companyHe: "הראל",
            month: 1.7,
            year1: 13.03,
            year3: 36.06,
            year5: 39.4,
            fee: 0.21
        },
        {
            nameHe: "מיטב פנסיה כללית בסיסי למקבלי קצבה",
            companyHe: "מיטב",
            month: 1.54,
            year1: 13.02,
            year3: 36.65,
            year5: 38.94,
            fee: 0.2
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית מסלול לבני 50 עד 60",
            companyHe: "כלל",
            month: 1.82,
            year1: 13.86,
            year3: 41.35,
            year5: 37.96,
            fee: 0.2
        },
        {
            nameHe: "מגדל מקפת אישית קצבה לזכאים קיימים",
            companyHe: "מגדל",
            month: 0.34,
            year1: 7.63,
            year3: 20.88,
            year5: 37.22,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים פנסיה אשראי ואג\"ח",
            companyHe: "מנורה מבטחים",
            month: 0.78,
            year1: 9.45,
            year3: 30.66,
            year5: 36.77,
            fee: 0.16
        },
        {
            nameHe: "אלטשולר שחם פנסיה מקיפה מסלול לבני 60 ומעלה",
            companyHe: "אלטשולר שחם",
            month: 0.94,
            year1: 9.4,
            year3: 30.2,
            year5: 35.53,
            fee: 0.13
        },
        {
            nameHe: "מיטב פנסיה כללית לבני 60 ומעלה",
            companyHe: "מיטב",
            month: 1.45,
            year1: 12.23,
            year3: 32.15,
            year5: 35.49,
            fee: 0.2
        },
        {
            nameHe: "הראל פנסיה  - קצבה לזכאים קיימים",
            companyHe: "הראל",
            month: 0.32,
            year1: 7.38,
            year3: 20.25,
            year5: 34.9,
            fee: 0.17
        },
        {
            nameHe: "מסלול קצבה לזכאים קיימים",
            companyHe: "מסלול",
            month: 0.33,
            year1: 6.6,
            year3: 20.41,
            year5: 34.72,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה מקיפה קצבה לזכאים קיימים",
            companyHe: "מיטב",
            month: 0.28,
            year1: 7.09,
            year3: 18.76,
            year5: 32.35,
            fee: 0.1
        },
        {
            nameHe: "כלל פנסיה משלימה לבני 60 ומעלה",
            companyHe: "כלל",
            month: 1.68,
            year1: 12.62,
            year3: 29.85,
            year5: 32.33,
            fee: 0.27
        },
        {
            nameHe: "מגדל מקפת משלימה לבני 60 ומעלה",
            companyHe: "מגדל",
            month: 1.47,
            year1: 11.95,
            year3: 30.13,
            year5: 31.82,
            fee: 0.31
        },
        {
            nameHe: "מגדל מקפת אישית הלכה למקבלי קצבה קיימים",
            companyHe: "מגדל",
            month: 0.35,
            year1: 7.3,
            year3: 19.4,
            year5: 31.13,
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
            nameHe: "מנורה מבטחים משלימה - בסיסי למקבלי קצבה",
            companyHe: "מנורה מבטחים",
            month: 1.02,
            year1: 10.27,
            year3: 26.95,
            year5: 30.4,
            fee: 0.34
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מסלול לבני 60 ומעלה",
            companyHe: "הפניקס",
            month: 1.25,
            year1: 11.62,
            year3: 29.12,
            year5: 30.3,
            fee: 0.16
        },
        {
            nameHe: "הראל  פנסיה - מקבלי קצבה קיימים",
            companyHe: "הראל",
            month: 0.29,
            year1: 7.06,
            year3: 17.75,
            year5: 30.24,
            fee: 0.17
        },
        {
            nameHe: "מגדל מקפת אישית  למקבלי קצבה קיימים",
            companyHe: "מגדל",
            month: 0.27,
            year1: 7.27,
            year3: 17.36,
            year5: 30.21,
            fee: 0.17
        },
        {
            nameHe: "כלל פנסיה למקבלי קצבה קיימים",
            companyHe: "כלל",
            month: 0.22,
            year1: 7.06,
            year3: 17.22,
            year5: 29.79,
            fee: 0.16
        },
        {
            nameHe: "מיטב פנסיה מקיפה אשראי ואג\"ח",
            companyHe: "מיטב",
            month: 0.47,
            year1: 7.35,
            year3: 21.97,
            year5: 29.48,
            fee: 0.1
        },
        {
            nameHe: "מגדל מקפת משלימה בסיסי למקבלי קצבה",
            companyHe: "מגדל",
            month: 1.39,
            year1: 11.61,
            year3: 28.48,
            year5: 28.97,
            fee: 0.31
        },
        {
            nameHe: "כלל פנסיה מסלול הלכה למקבלי קצבה קיימים",
            companyHe: "כלל",
            month: 0.26,
            year1: 6.92,
            year3: 17.75,
            year5: 28.96,
            fee: 0.16
        },
        {
            nameHe: "הפניקס פנסיה מקיפה אשראי ואג\"ח",
            companyHe: "הפניקס",
            month: 0.39,
            year1: 6.62,
            year3: 21.53,
            year5: 28.74,
            fee: 0.16
        },
        {
            nameHe: "הראל פנסיה כללית - גילאי 60 ומעלה",
            companyHe: "הראל",
            month: 1.59,
            year1: 12.05,
            year3: 28.16,
            year5: 28.73,
            fee: 0.21
        },
        {
            nameHe: "מיטב פנסיה מקיפה מקבלי קצבה קיימים",
            companyHe: "מיטב",
            month: 0.26,
            year1: 7.05,
            year3: 17.04,
            year5: 28.15,
            fee: 0.1
        },
        {
            nameHe: "הפניקס פנסיה מקיפה - מסלול מקבלי קצבה קיימים",
            companyHe: "הפניקס",
            month: 0.25,
            year1: 6.77,
            year3: 16.14,
            year5: 27.99,
            fee: 0.16
        },
        {
            nameHe: "כלל פנסיה אשראי ואג\"ח",
            companyHe: "כלל",
            month: 0.51,
            year1: 7.44,
            year3: 22.33,
            year5: 27.22,
            fee: 0.16
        },
        {
            nameHe: "הראל פנסיה- הלכה למקבלי קצבה קיימים",
            companyHe: "הראל",
            month: 0.25,
            year1: 6.38,
            year3: 15.17,
            year5: 27.21,
            fee: 0.17
        },
        {
            nameHe: "מנורה מבטחים משלימה אשראי ואג\"ח",
            companyHe: "מנורה מבטחים",
            month: 0.82,
            year1: 8.74,
            year3: 30.13,
            year5: 26.78,
            fee: 0.34
        },
        {
            nameHe: "מנורה מבטחים פנסיה מקבלי קצבה קיימים",
            companyHe: "מנורה מבטחים",
            month: 0.3,
            year1: 6.82,
            year3: 14.47,
            year5: 25.59,
            fee: 0.16
        },
        {
            nameHe: "הפניקס פנסיה משלימה - מסלול בסיסי למקבלי קצבה",
            companyHe: "הפניקס",
            month: 0.96,
            year1: 9.44,
            year3: 24.65,
            year5: 25.52,
            fee: 0.16
        },
        {
            nameHe: "כלל פנסיה כספי (שקלי)",
            companyHe: "כלל",
            month: 0.46,
            year1: 5.81,
            year3: 18.2,
            year5: 25.07,
            fee: 0.16
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית מסלול לבני 60 ומעלה",
            companyHe: "כלל",
            month: 1.1,
            year1: 9.58,
            year3: 26.8,
            year5: 24.42,
            fee: 0.2
        },
        {
            nameHe: "הפניקס פנסיה מקיפה -כספי (שקלי)",
            companyHe: "הפניקס",
            month: 0.43,
            year1: 5.41,
            year3: 16.83,
            year5: 23.14,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת אישית אשראי ואג\"ח",
            companyHe: "מגדל",
            month: 0.48,
            year1: 6.79,
            year3: 19.82,
            year5: 23.09,
            fee: 0.17
        },
        {
            nameHe: "הראל פנסיה - כספי (שקלי)",
            companyHe: "הראל",
            month: 0.37,
            year1: 5.39,
            year3: 16.89,
            year5: 22.98,
            fee: 0.17
        },
        {
            nameHe: "מגדל מקפת אישית כספי (שקלי)",
            companyHe: "מגדל",
            month: 0.39,
            year1: 5.61,
            year3: 16.85,
            year5: 22.59,
            fee: 0.17
        },
        {
            nameHe: "הראל פנסיה - אשראי ואג\"ח",
            companyHe: "הראל",
            month: 0.54,
            year1: 7.28,
            year3: 16.6,
            year5: 22.32,
            fee: 0.17
        },
        {
            nameHe: "מיטב פנסיה כללית אשראי ואג\"ח",
            companyHe: "מיטב",
            month: 0.49,
            year1: 7.34,
            year3: 20.04,
            year5: 20.89,
            fee: 0.2
        },
        {
            nameHe: "כלל פנסיה משלימה כספי(שקלי)",
            companyHe: "כלל",
            month: 0.49,
            year1: 5.11,
            year3: 15.28,
            year5: 16.22,
            fee: 0.27
        },
        {
            nameHe: "הראל פנסיה כללית כספי (שקלי)",
            companyHe: "הראל",
            month: 0.37,
            year1: 4.58,
            year3: 13.87,
            year5: 14.32,
            fee: 0.21
        },
        {
            nameHe: "הפניקס פנסיה משלימה - כספי (שקלי)",
            companyHe: "הפניקס",
            month: 0.45,
            year1: 4.54,
            year3: 13.45,
            year5: 14.23,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת משלימה כספי (שקלי)",
            companyHe: "מגדל",
            month: 0.41,
            year1: 4.81,
            year3: 13.67,
            year5: 13.66,
            fee: 0.31
        },
        {
            nameHe: "הפניקס פנסיה משלימה - אשראי ואג\"ח",
            companyHe: "הפניקס",
            month: 0.4,
            year1: 5.79,
            year3: 15.28,
            year5: 13.57,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת משלימה אשראי ואג\"ח",
            companyHe: "מגדל",
            month: 0.53,
            year1: 6.67,
            year3: 16.82,
            year5: 13.45,
            fee: 0.31
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית בסיסי למקבלי קצבה",
            companyHe: "כלל",
            month: 1.05,
            year1: 9.24,
            year3: 13.48,
            year5: 10.46,
            fee: 0.2
        },
        {
            nameHe: "הפניקס פנסיה מקיפה -מסלול עוקב מדדי אג\"ח",
            companyHe: "הפניקס",
            month: -1.74,
            year1: -2.1,
            year3: 9.45,
            year5: 9.48,
            fee: 0.16
        },
        {
            nameHe: "מגדל מקפת משלימה למקבלי קצבה קיימים",
            companyHe: "מגדל",
            month: 0.24,
            year1: 6.36,
            year3: 8.48,
            year5: 7.92,
            fee: 0.31
        },
        {
            nameHe: "אלטשולר שחם פנסיה כללית למקבלי קצבה קיימים",
            companyHe: "כלל",
            month: 1.01,
            year1: 7.67,
            year3: 11.26,
            year5: 7.39,
            fee: 0.2
        },
        {
            nameHe: "הראל פנסיה כללית - מקבלי קצבה קיימים",
            companyHe: "הראל",
            month: 0.16,
            year1: 5.81,
            year3: 6.09,
            year5: 4.6,
            fee: 0.21
        },
        {
            nameHe: "הפניקס פנסיה כללית - מסלול מקבלי קצבה קיימים",
            companyHe: "הפניקס",
            month: 0.17,
            year1: 5.15,
            year3: 4.76,
            year5: 3.47,
            fee: 0.16
        },
        {
            nameHe: "כלל פנסיה משלימה למקבלי קצבה קיימים",
            companyHe: "כלל",
            month: 0.14,
            year1: 5.53,
            year3: 4.94,
            year5: 2.86,
            fee: 0.27
        },
        {
            nameHe: "מנורה מבטחים משלימה - מקבלי קצבה קיימים",
            companyHe: "מנורה מבטחים",
            month: 0.29,
            year1: 5.57,
            year3: 3.82,
            year5: 1.47,
            fee: 0.34
        }
    ],

    // Gemel Funds Data (קופות גמל)
    gemel: [
        {
            nameHe: "אינפיניטי השתלמות משולב סחיר",
            companyHe: "אינפיניטי",
            month: 7.63,
            year1: 53.8,
            year3: 138.71,
            year5: 148.56,
            fee: 0.59,
            assets: 153.95
        },
        {
            nameHe: "אינפיניטי פיצויים סל מניות",
            companyHe: "אינפיניטי",
            month: 4.04,
            year1: 25.49,
            year3: 103.36,
            year5: 132.43,
            fee: 0.56,
            assets: 11.59
        },
        {
            nameHe: "אנליסט קופת גמל להשקעה עוקב מדדים - גמיש",
            companyHe: "אנליסט",
            month: 6.97,
            year1: 51.36,
            year3: 118.83,
            year5: 123.08,
            fee: 0.61,
            assets: 878.63
        },
        {
            nameHe: "מיטב גמל להשקעה עוקב מדדי מניות",
            companyHe: "מיטב",
            month: 3.45,
            year1: 20.77,
            year3: 111.58,
            year5: 119.32,
            fee: 0.65,
            assets: 1320.68
        },
        {
            nameHe: "מיטב גמל עוקב מדדי מניות",
            companyHe: "מיטב",
            month: 3.45,
            year1: 20.68,
            year3: 111,
            year5: 119.02,
            fee: 0.6,
            assets: 4053.41
        },
        {
            nameHe: "אינפיניטי גמל  מניות",
            companyHe: "אינפיניטי",
            month: 4.2,
            year1: 26.89,
            year3: 97.68,
            year5: 116.26,
            fee: 0.56,
            assets: 701.93
        },
        {
            nameHe: "הראל גמל להשקעה מניות",
            companyHe: "הראל",
            month: 4.56,
            year1: 34.35,
            year3: 100.95,
            year5: 114.83,
            fee: 0.55,
            assets: 3544.5
        },
        {
            nameHe: "שיבולת-תגמולים מניות מניות",
            companyHe: "שיבולת-תגמולים",
            month: 5.95,
            year1: 29.44,
            year3: 80.41,
            year5: 112.49,
            fee: 0.19,
            assets: 108.12
        },
        {
            nameHe: "השתלמות משפטנים מניות",
            companyHe: "משפטנים",
            month: 6.31,
            year1: 36.01,
            year3: 107.45,
            year5: 111.29,
            fee: 0.41,
            assets: 12.83
        },
        {
            nameHe: "אינפיניטי השתלמות מניות",
            companyHe: "אינפיניטי",
            month: 4.09,
            year1: 26.67,
            year3: 92.95,
            year5: 110.94,
            fee: 0.59,
            assets: 854.94
        },
        {
            nameHe: "אינפיניטי גמל להשקעה מניות",
            companyHe: "אינפיניטי",
            month: 3.87,
            year1: 24.31,
            year3: 90.95,
            year5: 107.88,
            fee: 0.6,
            assets: 355.49
        },
        {
            nameHe: "רעות - מניות",
            companyHe: "רעות",
            month: 4.45,
            year1: 27.37,
            year3: 87.67,
            year5: 107.16,
            fee: 0.45,
            assets: 66.98
        },
        {
            nameHe: "אינפיניטי חיסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "אינפיניטי",
            month: 4.3,
            year1: 26.43,
            year3: 91.24,
            year5: 106.94,
            fee: 0,
            assets: 489.56
        },
        {
            nameHe: "רום ספיר מניות",
            companyHe: "רום ספיר",
            month: 4.14,
            year1: 27.2,
            year3: 92.89,
            year5: 102.78,
            fee: 0.3,
            assets: 106.24
        },
        {
            nameHe: "מור חיסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "מור",
            month: 4.6,
            year1: 28.85,
            year3: 84.95,
            year5: 102.41,
            fee: 0.01,
            assets: 505.17
        },
        {
            nameHe: "ילין לפידות קופת גמל מסלול מניות",
            companyHe: "ילין לפידות",
            month: 2.79,
            year1: 22.43,
            year3: 76.53,
            year5: 100.37,
            fee: 0.61,
            assets: 6475.11
        },
        {
            nameHe: "עובדי מדינה - מניות",
            companyHe: "עובדי",
            month: 4.28,
            year1: 26.9,
            year3: 86.4,
            year5: 97.76,
            fee: 0.38,
            assets: 126.55
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול מניות",
            companyHe: "ילין לפידות",
            month: 2.84,
            year1: 22.37,
            year3: 76.58,
            year5: 96.5,
            fee: 0.67,
            assets: 13142.95
        },
        {
            nameHe: "ילין לפידות קופת גמל להשקעה מסלול מניות",
            companyHe: "ילין לפידות",
            month: 2.8,
            year1: 22.47,
            year3: 76.79,
            year5: 96.1,
            fee: 0.67,
            assets: 3501.36
        },
        {
            nameHe: "אנליסט חיסכון לילד- חוסכים המעדיפים סיכון מוגבר",
            companyHe: "אנליסט",
            month: 3.32,
            year1: 20.93,
            year3: 80.41,
            year5: 94.84,
            fee: 0.01,
            assets: 1443.88
        },
        {
            nameHe: "אנליסט השתלמות מניות",
            companyHe: "אנליסט",
            month: 3.31,
            year1: 21,
            year3: 80.87,
            year5: 93.57,
            fee: 0.63,
            assets: 16572.98
        },
        {
            nameHe: "מור מנורה מבטחים מניות",
            companyHe: "מנורה מבטחים",
            month: 4.74,
            year1: 30.28,
            year3: 79.25,
            year5: 93.27,
            fee: 0.21,
            assets: 251.66
        },
        {
            nameHe: "מור השתלמות - מניות",
            companyHe: "מור",
            month: 4.71,
            year1: 27.57,
            year3: 76.51,
            year5: 93.03,
            fee: 0.71,
            assets: 12567.62
        },
        {
            nameHe: "הראל קמ\"פ מסלול מניות",
            companyHe: "הראל",
            month: 5.28,
            year1: 28.88,
            year3: 72.89,
            year5: 92.85,
            fee: 0.52,
            assets: 44.64
        },
        {
            nameHe: "מגדל גמל להשקעה מניות",
            companyHe: "מגדל",
            month: 4.87,
            year1: 29.45,
            year3: 79.14,
            year5: 92.75,
            fee: 0.59,
            assets: 821.37
        },
        {
            nameHe: "אנליסט קופת גמל להשקעה מניות",
            companyHe: "אנליסט",
            month: 3.32,
            year1: 20.94,
            year3: 80.54,
            year5: 92.56,
            fee: 0.61,
            assets: 6187.69
        },
        {
            nameHe: "מיטב חיסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "מיטב",
            month: 4.38,
            year1: 28.8,
            year3: 79.84,
            year5: 92.39,
            fee: 0.01,
            assets: 490.92
        },
        {
            nameHe: "אנליסט גמל מניות",
            companyHe: "אנליסט",
            month: 3.28,
            year1: 20.55,
            year3: 79.73,
            year5: 92.33,
            fee: 0.61,
            assets: 7521.97
        },
        {
            nameHe: "אומגה קרן השתלמות מסלול מניות",
            companyHe: "אומגה",
            month: 4.74,
            year1: 30.1,
            year3: 79.36,
            year5: 92.01,
            fee: 0.44,
            assets: 130.86
        },
        {
            nameHe: "הראל השתלמות מסלול מניות",
            companyHe: "הראל",
            month: 5.06,
            year1: 29.37,
            year3: 74.23,
            year5: 91.7,
            fee: 0.53,
            assets: 3130.81
        },
        {
            nameHe: "מגדל לתגמולים ולפיצויים מניות",
            companyHe: "מגדל",
            month: 4.83,
            year1: 28.6,
            year3: 78,
            year5: 91.69,
            fee: 0.48,
            assets: 1479.28
        },
        {
            nameHe: "מגדל השתלמות מניות",
            companyHe: "מגדל",
            month: 4.74,
            year1: 27.93,
            year3: 77.42,
            year5: 91.3,
            fee: 0.49,
            assets: 2939.19
        },
        {
            nameHe: "מיטב גמל מניות",
            companyHe: "מיטב",
            month: 4.29,
            year1: 28.53,
            year3: 79.33,
            year5: 90.97,
            fee: 0.53,
            assets: 3616.75
        },
        {
            nameHe: "מיטב השתלמות מניות",
            companyHe: "מיטב",
            month: 4.29,
            year1: 28.63,
            year3: 79.55,
            year5: 90.89,
            fee: 0.55,
            assets: 4983.45
        },
        {
            nameHe: "מיטב גמל להשקעה מניות",
            companyHe: "מיטב",
            month: 4.34,
            year1: 28.73,
            year3: 80.15,
            year5: 90.69,
            fee: 0.59,
            assets: 1408.31
        },
        {
            nameHe: "מנורה מבטחים תגמולים מסלול מניות",
            companyHe: "מנורה מבטחים",
            month: 4.64,
            year1: 29.57,
            year3: 77.5,
            year5: 90.64,
            fee: 0.46,
            assets: 753.08
        },
        {
            nameHe: "מנורה מבטחים חסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "מנורה מבטחים",
            month: 4.7,
            year1: 29.75,
            year3: 76.98,
            year5: 90.21,
            fee: 0.01,
            assets: 343.79
        },
        {
            nameHe: "הראל גמל מסלול מניות",
            companyHe: "הראל",
            month: 5.06,
            year1: 29.45,
            year3: 73.57,
            year5: 90.12,
            fee: 0.5,
            assets: 1719.72
        },
        {
            nameHe: "מנורה השתלמות מניות",
            companyHe: "מנורה",
            month: 4.58,
            year1: 29.67,
            year3: 76.9,
            year5: 89.73,
            fee: 0.49,
            assets: 1794.36
        },
        {
            nameHe: "הפניקס גמל מסלול מניות",
            companyHe: "הפניקס",
            month: 4.65,
            year1: 27.97,
            year3: 76.8,
            year5: 89.58,
            fee: 0.56,
            assets: 3263.55
        },
        {
            nameHe: "הראל חיסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "הראל",
            month: 5.07,
            year1: 29.29,
            year3: 74.05,
            year5: 89.42,
            fee: 0.01,
            assets: 1418.27
        },
        {
            nameHe: "מגדל  חסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "מגדל",
            month: 4.79,
            year1: 28.25,
            year3: 76.21,
            year5: 89.41,
            fee: 0.01,
            assets: 220.43
        },
        {
            nameHe: "הפניקס חיסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "הפניקס",
            month: 4.34,
            year1: 27.35,
            year3: 78.59,
            year5: 89.37,
            fee: 0.01,
            assets: 490.02
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע מניות",
            companyHe: "קרן החיסכון",
            month: 5.01,
            year1: 29.66,
            year3: 73.75,
            year5: 88.89,
            fee: 0.19,
            assets: 1446.51
        },
        {
            nameHe: "הפניקס השתלמות מניות",
            companyHe: "הפניקס",
            month: 4.57,
            year1: 28.13,
            year3: 75.98,
            year5: 88.88,
            fee: 0.58,
            assets: 5122.8
        },
        {
            nameHe: "אלפא מור תגמולים - מניות",
            companyHe: "מור",
            month: 4.72,
            year1: 27.38,
            year3: 74.19,
            year5: 88.6,
            fee: 0.67,
            assets: 6958.74
        },
        {
            nameHe: "מור גמל להשקעה - מניות",
            companyHe: "מור",
            month: 4.61,
            year1: 28.25,
            year3: 77.36,
            year5: 87.99,
            fee: 0.73,
            assets: 4488.16
        },
        {
            nameHe: "הפניקס גמל להשקעה מניות",
            companyHe: "הפניקס",
            month: 4.65,
            year1: 28.11,
            year3: 77.75,
            year5: 86.97,
            fee: 0.59,
            assets: 1282.66
        },
        {
            nameHe: "קרן השתלמות לאקדמאים במדעי החברה והרוח מסלול מניות",
            companyHe: "אקדמאים",
            month: 4.25,
            year1: 26.64,
            year3: 83.27,
            year5: 86.84,
            fee: 0.28,
            assets: 112.85
        },
        {
            nameHe: "אל על - מניות",
            companyHe: "אל",
            month: 3.96,
            year1: 25.49,
            year3: 82.14,
            year5: 86.42,
            fee: 0.39,
            assets: 67.77
        },
        {
            nameHe: "מיטב השתלמות עוקב מדד S&P500",
            companyHe: "מיטב",
            month: -1.41,
            year1: 0.21,
            year3: 59.1,
            year5: 86.33,
            fee: 0.54,
            assets: 3625.75
        },
        {
            nameHe: "מיטב גמל עוקב מדד S&P500",
            companyHe: "מיטב",
            month: -1.41,
            year1: 0.26,
            year3: 59.26,
            year5: 86.18,
            fee: 0.53,
            assets: 2117.24
        },
        {
            nameHe: "מיטב גמל להשקעה עוקב מדד S&P 500",
            companyHe: "מיטב",
            month: -1.4,
            year1: 0.25,
            year3: 59.23,
            year5: 86.1,
            fee: 0.6,
            assets: 1312.44
        },
        {
            nameHe: "הפניקס גמל עוקב  מדד s&p500",
            companyHe: "הפניקס",
            month: -1.78,
            year1: -0.13,
            year3: 56.94,
            year5: 85.93,
            fee: 0.56,
            assets: 5472.64
        },
        {
            nameHe: "הפניקס גמל להשקעה עוקב מדד S&P500",
            companyHe: "הפניקס",
            month: -1.78,
            year1: -0.15,
            year3: 56.82,
            year5: 85.92,
            fee: 0.58,
            assets: 3637.52
        },
        {
            nameHe: "הפניקס השתלמות עוקב  מדד s&p500",
            companyHe: "הפניקס",
            month: -1.78,
            year1: -0.15,
            year3: 56.77,
            year5: 85.92,
            fee: 0.57,
            assets: 10408.93
        },
        {
            nameHe: "לאומי קופה מרכזית לפיצויים",
            companyHe: "לאומי",
            month: -0.11,
            year1: 5.32,
            year3: 16.75,
            year5: 85.8,
            fee: 1.17,
            assets: 73.03
        },
        {
            nameHe: "כלל תמר מניות",
            companyHe: "כלל",
            month: 5.42,
            year1: 30.39,
            year3: 73.71,
            year5: 83.76,
            fee: 0.53,
            assets: 1492.89
        },
        {
            nameHe: "כלל גמל לעתיד עוקב  מדד s&p 500",
            companyHe: "כלל",
            month: -2.03,
            year1: -0.45,
            year3: 56.19,
            year5: 83.7,
            fee: 0.59,
            assets: 859.97
        },
        {
            nameHe: "כלל תמר עוקב מדד s&p 500",
            companyHe: "כלל",
            month: -2.04,
            year1: -0.45,
            year3: 56.11,
            year5: 82.53,
            fee: 0.47,
            assets: 1705.76
        },
        {
            nameHe: "כלל השתלמות עוקב  מדד s&p 500",
            companyHe: "כלל",
            month: -2.04,
            year1: -0.45,
            year3: 56.07,
            year5: 82.46,
            fee: 0.48,
            assets: 4460.46
        },
        {
            nameHe: "הנדסאים השתלמות - מסלול מניות",
            companyHe: "הנדסאים",
            month: 3.6,
            year1: 23.43,
            year3: 75.57,
            year5: 81.99,
            fee: 0.35,
            assets: 53.24
        },
        {
            nameHe: "מנורה מבטחים גמל להשקעה מדדי מניות",
            companyHe: "מנורה מבטחים",
            month: 4.03,
            year1: 19.54,
            year3: 63.81,
            year5: 81.78,
            fee: 0.57,
            assets: 524.65
        },
        {
            nameHe: "כלל השתלמות מניות",
            companyHe: "כלל",
            month: 5.41,
            year1: 30.38,
            year3: 73.6,
            year5: 81.78,
            fee: 0.53,
            assets: 2917.96
        },
        {
            nameHe: "עיריית תל אביב תגמולים מסלול מניות",
            companyHe: "עיריית",
            month: 5.11,
            year1: 29.13,
            year3: 80.31,
            year5: 81.42,
            fee: 0.46,
            assets: 27.1
        },
        {
            nameHe: "מינהל - השתלמות - מניות",
            companyHe: "מינהל",
            month: 3.89,
            year1: 25.4,
            year3: 83.83,
            year5: 80.76,
            fee: 0.55,
            assets: 46.52
        },
        {
            nameHe: "כלל גמל לעתיד מניות",
            companyHe: "כלל",
            month: 5.49,
            year1: 30.31,
            year3: 73.54,
            year5: 80.21,
            fee: 0.64,
            assets: 747.35
        },
        {
            nameHe: "הפניקס מרכזית לפיצויים מחקה מדדי מניות",
            companyHe: "הפניקס",
            month: 3,
            year1: 20.05,
            year3: 67.16,
            year5: 79.23,
            fee: 1.18,
            assets: 15.7
        },
        {
            nameHe: "מור גמל להשקעה - עוקב מדד S&P500",
            companyHe: "מור",
            month: -1.7,
            year1: 0.12,
            year3: 55.42,
            year5: 78.47,
            fee: 0.71,
            assets: 1397.81
        },
        {
            nameHe: "אלפא מור תגמולים - עוקב מדד S&P 500",
            companyHe: "מור",
            month: -1.71,
            year1: 0.06,
            year3: 54.84,
            year5: 76.58,
            fee: 0.67,
            assets: 1253.48
        },
        {
            nameHe: "עמ\"י מסלול מניות",
            companyHe: "עמ\"י",
            month: 4.53,
            year1: 26.35,
            year3: 74.9,
            year5: 76.17,
            fee: 0.39,
            assets: 31.07
        },
        {
            nameHe: "מור השתלמות -עוקב מדד S&P 500",
            companyHe: "מור",
            month: -1.73,
            year1: 0.02,
            year3: 54.49,
            year5: 75.59,
            fee: 0.7,
            assets: 2374.36
        },
        {
            nameHe: "מחר גמל מניות",
            companyHe: "מחר",
            month: 4.5,
            year1: 26.15,
            year3: 72,
            year5: 71.3,
            fee: 0.43,
            assets: 18.05
        },
        {
            nameHe: "אנליסט גמל מניות סחיר",
            companyHe: "אנליסט",
            month: -1.13,
            year1: 1.29,
            year3: 58.64,
            year5: 70.54,
            fee: 0.59,
            assets: 1190.39
        },
        {
            nameHe: "מור חיסכון לילד - הלכה",
            companyHe: "מור",
            month: 4.33,
            year1: 25.67,
            year3: 65.63,
            year5: 68.43,
            fee: 0.01,
            assets: 115.42
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים-מניות",
            companyHe: "יחד",
            month: 2.63,
            year1: 21.96,
            year3: 61.83,
            year5: 68.11,
            fee: 0.38,
            assets: 22.83
        },
        {
            nameHe: "אנליסט גמל - מסלול לבני 50 ומטה",
            companyHe: "אנליסט",
            month: 2.19,
            year1: 17.15,
            year3: 56.13,
            year5: 64.92,
            fee: 0.6,
            assets: 7078.26
        },
        {
            nameHe: "מנורה השתלמות מניות סחיר",
            companyHe: "מנורה",
            month: 1.53,
            year1: 11.81,
            year3: 55.93,
            year5: 64.44,
            fee: 0.5,
            assets: 747.17
        },
        {
            nameHe: "השתלמות משפטנים",
            companyHe: "משפטנים",
            month: 2.89,
            year1: 20,
            year3: 54.27,
            year5: 62.65,
            fee: 0.42,
            assets: 499.06
        },
        {
            nameHe: "מנורה מבטחים גמל להשקעה מניות סחיר",
            companyHe: "מנורה מבטחים",
            month: 2.67,
            year1: 11.55,
            year3: 52.68,
            year5: 61.35,
            fee: 0.59,
            assets: 231.36
        },
        {
            nameHe: "אלטשולר שחם חיסכון לילד - חוסכים המעדיפים סיכון מוגבר",
            companyHe: "אלטשולר שחם",
            month: 3.05,
            year1: 20.94,
            year3: 68.24,
            year5: 60.7,
            fee: 0.01,
            assets: 7990.39
        },
        {
            nameHe: "אלטשולר שחם חיסכון פלוס מניות",
            companyHe: "אלטשולר שחם",
            month: 2.99,
            year1: 21.28,
            year3: 68.63,
            year5: 60.61,
            fee: 0.59,
            assets: 4643.62
        },
        {
            nameHe: "אלטשולר שחם עוקב מדדי מניות",
            companyHe: "אלטשולר שחם",
            month: 0.75,
            year1: 8.53,
            year3: 59.25,
            year5: 60.57,
            fee: 0.56,
            assets: 1044.6
        },
        {
            nameHe: "אלטשולר שחם השתלמות מניות",
            companyHe: "אלטשולר שחם",
            month: 2.92,
            year1: 21.39,
            year3: 68.34,
            year5: 60.45,
            fee: 0.68,
            assets: 6923.34
        },
        {
            nameHe: "מיטב גמל לבני 50 ומטה",
            companyHe: "מיטב",
            month: 2.51,
            year1: 18.53,
            year3: 49.42,
            year5: 59.87,
            fee: 0.57,
            assets: 4756.1
        },
        {
            nameHe: "אינפיניטי חיסכון לילד - הלכה",
            companyHe: "אינפיניטי",
            month: -0.39,
            year1: 8.15,
            year3: 50.06,
            year5: 59.83,
            fee: 0,
            assets: 650.42
        },
        {
            nameHe: "אלפא מור תגמולים - לבני 50 ומטה",
            companyHe: "מור",
            month: 2.55,
            year1: 16.69,
            year3: 47.84,
            year5: 59.63,
            fee: 0.68,
            assets: 7348.19
        },
        {
            nameHe: "אינפיניטי גמל להשקעה הלכה",
            companyHe: "אינפיניטי",
            month: -0.58,
            year1: 8.59,
            year3: 49.4,
            year5: 59.63,
            fee: 0.6,
            assets: 108.2
        },
        {
            nameHe: "אלטשולר שחם גמל מניות",
            companyHe: "אלטשולר שחם",
            month: 2.92,
            year1: 21.47,
            year3: 68.04,
            year5: 59.62,
            fee: 0.61,
            assets: 3211.11
        },
        {
            nameHe: "השתלמות שופטים",
            companyHe: "השתלמות",
            month: 2.61,
            year1: 18.81,
            year3: 51.03,
            year5: 59.52,
            fee: 0.33,
            assets: 471.27
        },
        {
            nameHe: "תעשיה אוירית לבני 50 עד 60",
            companyHe: "תעשיה",
            month: 2.36,
            year1: 17.01,
            year3: 44.36,
            year5: 59.18,
            fee: 0.32,
            assets: 2766.06
        },
        {
            nameHe: "עריית חיפה 50-60",
            companyHe: "עריית",
            month: 2.94,
            year1: 19.96,
            year3: 55.52,
            year5: 59.05,
            fee: 0.72,
            assets: 277.33
        },
        {
            nameHe: "אינפיניטי גמל מסלול לבני 50 ומטה",
            companyHe: "אינפיניטי",
            month: 2.53,
            year1: 17.4,
            year3: 57.53,
            year5: 58.89,
            fee: 0.61,
            assets: 135.31
        },
        {
            nameHe: "ק.ה.ר",
            companyHe: "ק.ה.ר",
            month: 2.52,
            year1: 20.51,
            year3: 57.17,
            year5: 58.54,
            fee: 1.02,
            assets: 125.73
        },
        {
            nameHe: "הפניקס גמל לבני 50 ומטה",
            companyHe: "הפניקס",
            month: 2.62,
            year1: 19.54,
            year3: 49.19,
            year5: 58.31,
            fee: 0.62,
            assets: 10876.52
        },
        {
            nameHe: "תעשיה אוירית מסלול לבני 50 ומטה",
            companyHe: "תעשיה",
            month: 2.47,
            year1: 17.53,
            year3: 53.67,
            year5: 58.27,
            fee: 0.32,
            assets: 130.71
        },
        {
            nameHe: "ילין לפידות קופת גמל מסלול לבני 50 ומטה",
            companyHe: "ילין לפידות",
            month: 1.7,
            year1: 15.11,
            year3: 47.49,
            year5: 57.96,
            fee: 0.63,
            assets: 4243.68
        },
        {
            nameHe: "ארם עד 50",
            companyHe: "ארם",
            month: 2.72,
            year1: 18.4,
            year3: 52.28,
            year5: 57.95,
            fee: 0.37,
            assets: 60.64
        },
        {
            nameHe: "אנליסט השתלמות כללי",
            companyHe: "אנליסט",
            month: 1.73,
            year1: 14.89,
            year3: 46.6,
            year5: 57.62,
            fee: 0.62,
            assets: 20347.75
        },
        {
            nameHe: "מנורה מבטחים תגמולים מדדי מניות",
            companyHe: "מנורה מבטחים",
            month: 2.91,
            year1: 8.5,
            year3: 45.33,
            year5: 57.54,
            fee: 0.59,
            assets: 754.93
        },
        {
            nameHe: "אינפיניטי גמל מסלול לבני 50 עד 60",
            companyHe: "אינפיניטי",
            month: 2.22,
            year1: 16.42,
            year3: 53.29,
            year5: 57.51,
            fee: 0.58,
            assets: 434.03
        },
        {
            nameHe: "קרן השתלמות למורים בבתיה\"ס העי\"ס במכללות ובסמינרים מסלול כללי",
            companyHe: "כלל",
            month: 1.99,
            year1: 16.13,
            year3: 45.97,
            year5: 57.5,
            fee: 0.19,
            assets: 746.59
        },
        {
            nameHe: "מור  מנורה מבטחים עד 50",
            companyHe: "מנורה מבטחים",
            month: 2.8,
            year1: 19.67,
            year3: 48.35,
            year5: 57.14,
            fee: 0.28,
            assets: 688.15
        },
        {
            nameHe: "הראל גמל להשקעה כללי",
            companyHe: "הראל",
            month: 2.44,
            year1: 18.97,
            year3: 49.34,
            year5: 57.12,
            fee: 0.55,
            assets: 4324.49
        },
        {
            nameHe: "אנליסט חיסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "אנליסט",
            month: 1.78,
            year1: 15.15,
            year3: 46.51,
            year5: 57.03,
            fee: 0.02,
            assets: 213.81
        },
        {
            nameHe: "גל גמל לבני 50 ומטה",
            companyHe: "גל",
            month: 3.56,
            year1: 18.38,
            year3: 54.93,
            year5: 57.02,
            fee: 0.21,
            assets: 188.82
        },
        {
            nameHe: "אינפיניטי השתלמות  כללי",
            companyHe: "אינפיניטי",
            month: 2.1,
            year1: 16.39,
            year3: 50.19,
            year5: 56.99,
            fee: 0.6,
            assets: 301.67
        },
        {
            nameHe: "מגדל לתגמולים ולפיצויים מסלול לבני 50 ומטה",
            companyHe: "מגדל",
            month: 2.79,
            year1: 18.54,
            year3: 47.7,
            year5: 56.24,
            fee: 0.5,
            assets: 2080.77
        },
        {
            nameHe: "כלנית גמל לבני 50 ומטה",
            companyHe: "כלנית",
            month: 3.63,
            year1: 18.48,
            year3: 54.91,
            year5: 56.22,
            fee: 0.21,
            assets: 137.4
        },
        {
            nameHe: "קרן השתלמות למורים בבתי הספר העי\"ס במכללות ובסמינרים מסלול כללי",
            companyHe: "כלל",
            month: 1.96,
            year1: 15.82,
            year3: 45.68,
            year5: 55.97,
            fee: 0.2,
            assets: 10102.42
        },
        {
            nameHe: "מנורה מבטחים תגמולים עד 50",
            companyHe: "מנורה מבטחים",
            month: 2.89,
            year1: 19.81,
            year3: 48.38,
            year5: 55.87,
            fee: 0.39,
            assets: 4531.67
        },
        {
            nameHe: "מיטב גמל לבני 50 עד 60",
            companyHe: "מיטב",
            month: 2.08,
            year1: 16.13,
            year3: 43.91,
            year5: 55.75,
            fee: 0.53,
            assets: 21546.43
        },
        {
            nameHe: "כלנית גמל לבני 50 עד 60",
            companyHe: "כלנית",
            month: 3.08,
            year1: 16.95,
            year3: 48,
            year5: 55.67,
            fee: 0.21,
            assets: 2199.75
        },
        {
            nameHe: "תגמולים האוניברסיטה העברית עד 50",
            companyHe: "תגמולים",
            month: 1.7,
            year1: 11.46,
            year3: 35.31,
            year5: 55.66,
            fee: 0.44,
            assets: 2641.61
        },
        {
            nameHe: "עובדי מדינה - כללי",
            companyHe: "כלל",
            month: 2.22,
            year1: 16.76,
            year3: 47.37,
            year5: 55.6,
            fee: 0.38,
            assets: 3307.06
        },
        {
            nameHe: "אינפיניטי  חיסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "אינפיניטי",
            month: 2.52,
            year1: 16.77,
            year3: 51.51,
            year5: 55.45,
            fee: 0.02,
            assets: 22.53
        },
        {
            nameHe: "מחוג  מסלול לבני 50 ומטה",
            companyHe: "מחוג",
            month: 2.13,
            year1: 15.12,
            year3: 46.27,
            year5: 55.12,
            fee: 0.25,
            assets: 2057.08
        },
        {
            nameHe: "כלל תמר עד 50",
            companyHe: "כלל",
            month: 3.05,
            year1: 20.01,
            year3: 46.29,
            year5: 54.9,
            fee: 0.52,
            assets: 2591.81
        },
        {
            nameHe: "מור השתלמות - כללי",
            companyHe: "כלל",
            month: 2.11,
            year1: 15.34,
            year3: 42.66,
            year5: 54.87,
            fee: 0.7,
            assets: 26356.51
        },
        {
            nameHe: "מיטב השתלמות כללי",
            companyHe: "מיטב",
            month: 2.05,
            year1: 16.05,
            year3: 43.63,
            year5: 54.85,
            fee: 0.6,
            assets: 32162.28
        },
        {
            nameHe: "מיטב פיצויים - כללי",
            companyHe: "מיטב",
            month: 2.08,
            year1: 15.96,
            year3: 43.93,
            year5: 54.33,
            fee: 0.71,
            assets: 1294.75
        },
        {
            nameHe: "גל גמל לבני 50 עד 60",
            companyHe: "גל",
            month: 3.03,
            year1: 16.83,
            year3: 47.98,
            year5: 54.23,
            fee: 0.21,
            assets: 3251.8
        },
        {
            nameHe: "אנליסט קופה מרכזית לפיצויים מסלול כללי",
            companyHe: "אנליסט",
            month: 2.12,
            year1: 15.75,
            year3: 47.59,
            year5: 53.77,
            fee: 0.29,
            assets: 464.46
        },
        {
            nameHe: "הראל חסכון לילד - הלכה",
            companyHe: "הראל",
            month: 4.12,
            year1: 22.93,
            year3: 49.92,
            year5: 53.72,
            fee: 0.01,
            assets: 2918.68
        },
        {
            nameHe: "הראל גמל מסלול לגילאי  50 ומטה",
            companyHe: "הראל",
            month: 2.95,
            year1: 18.45,
            year3: 43.1,
            year5: 53.59,
            fee: 0.56,
            assets: 2519.22
        },
        {
            nameHe: "עירית ת\"א תגמולים מסלול לבני 50-60",
            companyHe: "עירית",
            month: 2.59,
            year1: 16.38,
            year3: 42.06,
            year5: 53.55,
            fee: 0.46,
            assets: 1189.85
        },
        {
            nameHe: "הפניקס גמל להשקעה שריעה",
            companyHe: "הפניקס",
            month: -2.08,
            year1: 1.86,
            year3: 46.9,
            year5: 53.28,
            fee: 0.69,
            assets: 27.98
        },
        {
            nameHe: "מיטב בטחון",
            companyHe: "מיטב",
            month: 2.13,
            year1: 15.86,
            year3: 43.48,
            year5: 53.01,
            fee: 0.63,
            assets: 22.52
        },
        {
            nameHe: "אנליסט קופת גמל להשקעה כללי",
            companyHe: "אנליסט",
            month: 2.03,
            year1: 14.78,
            year3: 45.51,
            year5: 52.92,
            fee: 0.62,
            assets: 3977.32
        },
        {
            nameHe: "עירית ת\"א תגמולים מסלול לבני 50 ומטה.",
            companyHe: "עירית",
            month: 3.35,
            year1: 19.22,
            year3: 51.64,
            year5: 52.72,
            fee: 0.46,
            assets: 51.96
        },
        {
            nameHe: "הפניקס השתלמות כללי",
            companyHe: "הפניקס",
            month: 2.09,
            year1: 16.53,
            year3: 43.3,
            year5: 52.31,
            fee: 0.65,
            assets: 22687.84
        },
        {
            nameHe: "קופת גמל עמ\"י  50-60",
            companyHe: "קופת",
            month: 2.38,
            year1: 17.19,
            year3: 45.2,
            year5: 52.29,
            fee: 0.39,
            assets: 2018.14
        },
        {
            nameHe: "מחר גמל לבני 50 ומטה",
            companyHe: "מחר",
            month: 2.56,
            year1: 17.54,
            year3: 47.35,
            year5: 52.14,
            fee: 0.43,
            assets: 1185.13
        },
        {
            nameHe: "קרן השתלמות לעובדי בנק ישראל",
            companyHe: "קרן",
            month: 2.09,
            year1: 15.9,
            year3: 43.57,
            year5: 52.07,
            fee: 0.38,
            assets: 183.65
        },
        {
            nameHe: "אומגה השתלמות מסלול כללי",
            companyHe: "אומגה",
            month: 2.55,
            year1: 17.08,
            year3: 43.88,
            year5: 52.01,
            fee: 0.54,
            assets: 2133.02
        },
        {
            nameHe: "אנליסט גמל מסלול לבני 50-60",
            companyHe: "אנליסט",
            month: 2.07,
            year1: 14.88,
            year3: 44.99,
            year5: 51.83,
            fee: 0.6,
            assets: 7375.75
        },
        {
            nameHe: "כלל השתלמות כללי",
            companyHe: "כלל",
            month: 2.66,
            year1: 18.29,
            year3: 42.17,
            year5: 51.76,
            fee: 0.54,
            assets: 21046.87
        },
        {
            nameHe: "רום קלאסי כללי",
            companyHe: "רום",
            month: 2.22,
            year1: 16.97,
            year3: 45.95,
            year5: 51.75,
            fee: 0.31,
            assets: 5623.83
        },
        {
            nameHe: "מור גמל להשקעה- כללי",
            companyHe: "כלל",
            month: 2.15,
            year1: 15.51,
            year3: 42.47,
            year5: 51.62,
            fee: 0.72,
            assets: 5746.21
        },
        {
            nameHe: "ילין לפידות קופת גמל מסלול לבני 50 עד 60",
            companyHe: "ילין לפידות",
            month: 1.38,
            year1: 13.54,
            year3: 41.82,
            year5: 51.28,
            fee: 0.63,
            assets: 13537.24
        },
        {
            nameHe: "מיטב גמל להשקעה כללי",
            companyHe: "מיטב",
            month: 2.12,
            year1: 16.35,
            year3: 44.29,
            year5: 51.05,
            fee: 0.61,
            assets: 3124.5
        },
        {
            nameHe: "קרן השתלמות עובדי חברת חשמל",
            companyHe: "קרן",
            month: 2.19,
            year1: 17.58,
            year3: 46.98,
            year5: 50.93,
            fee: 0.34,
            assets: 790.49
        },
        {
            nameHe: "ילין לפידות קרן השתלמות מסלול כללי",
            companyHe: "ילין לפידות",
            month: 1.4,
            year1: 13.5,
            year3: 41.81,
            year5: 50.93,
            fee: 0.68,
            assets: 24702.02
        },
        {
            nameHe: "מגדל השתלמות כללי",
            companyHe: "מגדל",
            month: 2.2,
            year1: 15.92,
            year3: 40.29,
            year5: 50.89,
            fee: 0.54,
            assets: 19835.38
        },
        {
            nameHe: "עו\"ס גמל לבני 50 עד 60",
            companyHe: "עו\"ס",
            month: 3.17,
            year1: 17.37,
            year3: 46.01,
            year5: 50.74,
            fee: 0.74,
            assets: 195.77
        },
        {
            nameHe: "אלפא מור תגמולים - לבני 50 עד 60",
            companyHe: "מור",
            month: 2.12,
            year1: 14.33,
            year3: 39.64,
            year5: 50.73,
            fee: 0.66,
            assets: 17152.36
        },
        {
            nameHe: "מגדל גמל להשקעה כללי",
            companyHe: "מגדל",
            month: 2.55,
            year1: 17.57,
            year3: 43.95,
            year5: 50.58,
            fee: 0.62,
            assets: 1109.82
        },
        {
            nameHe: "מיטב חיסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "מיטב",
            month: 2.14,
            year1: 16.56,
            year3: 44.65,
            year5: 50.42,
            fee: 0.02,
            assets: 292.93
        },
        {
            nameHe: "פיצויים עיריית ת\"א - מסלול לבני 50-60",
            companyHe: "פיצויים",
            month: 2.65,
            year1: 15.99,
            year3: 41.38,
            year5: 50.4,
            fee: 0.43,
            assets: 163.08
        },
        {
            nameHe: "ק.ל.ע מסלול כללי",
            companyHe: "כלל",
            month: 3.02,
            year1: 16.93,
            year3: 45.4,
            year5: 50.28,
            fee: 0.49,
            assets: 722.29
        },
        {
            nameHe: "מגדל לתגמולים ולפיצויים מסלול לבני 50 עד 60",
            companyHe: "מגדל",
            month: 2.35,
            year1: 16.27,
            year3: 41.37,
            year5: 50.23,
            fee: 0.49,
            assets: 4107.71
        },
        {
            nameHe: "הנדסאים גמל - מסלול עד 50",
            companyHe: "הנדסאים",
            month: 2.55,
            year1: 17.2,
            year3: 48.57,
            year5: 50.2,
            fee: 0.44,
            assets: 32.36
        },
        {
            nameHe: "ארם 50-60",
            companyHe: "ארם",
            month: 2.28,
            year1: 16.69,
            year3: 43.49,
            year5: 50.15,
            fee: 0.37,
            assets: 975.08
        },
        {
            nameHe: "אינפיניטי גמל להשקעה כללי",
            companyHe: "אינפיניטי",
            month: 1.94,
            year1: 14.45,
            year3: 47.16,
            year5: 50.01,
            fee: 0.56,
            assets: 162.19
        },
        {
            nameHe: "ילין לפידות קופת גמל להשקעה מסלול כללי",
            companyHe: "ילין לפידות",
            month: 1.38,
            year1: 13.71,
            year3: 42.79,
            year5: 49.94,
            fee: 0.68,
            assets: 3751
        },
        {
            nameHe: "קופת התגמולים של עובדי בנק לאומי",
            companyHe: "קופת",
            month: 0.84,
            year1: 12.94,
            year3: 30.64,
            year5: 49.93,
            fee: 0,
            assets: 4784.27
        },
        {
            nameHe: "מנורה השתלמות כללי",
            companyHe: "מנורה",
            month: 2.26,
            year1: 17.2,
            year3: 41.25,
            year5: 49.76,
            fee: 0.63,
            assets: 12749.93
        },
        {
            nameHe: "הפניקס גמל מסלול לבני 50 עד 60",
            companyHe: "הפניקס",
            month: 2.05,
            year1: 16.32,
            year3: 43.33,
            year5: 49.68,
            fee: 0.6,
            assets: 8021.96
        },
        {
            nameHe: "בנין-אחרות",
            companyHe: "בנין-אחרות",
            month: 2.77,
            year1: 17.44,
            year3: 43.26,
            year5: 49.48,
            fee: 0.75,
            assets: 30.08
        },
        {
            nameHe: "מחוג מסלול כללי",
            companyHe: "כלל",
            month: 1.81,
            year1: 13.39,
            year3: 40.47,
            year5: 49.24,
            fee: 0.25,
            assets: 358.03
        },
        {
            nameHe: "בר",
            companyHe: "בר",
            month: 2.75,
            year1: 17.82,
            year3: 39.64,
            year5: 49.21,
            fee: 0.26,
            assets: 4771.94
        },
        {
            nameHe: "מורים תיכוניים - מסלול כללי",
            companyHe: "כלל",
            month: 1.68,
            year1: 14.77,
            year3: 42.38,
            year5: 49.13,
            fee: 0.12,
            assets: 9317.94
        },
        {
            nameHe: "קרן השתלמות עוצ\"מ",
            companyHe: "קרן",
            month: 3.71,
            year1: 20.43,
            year3: 50.35,
            year5: 49.1,
            fee: 0.6,
            assets: 68.44
        },
        {
            nameHe: "מורים תיכוניים - מסלול כללי",
            companyHe: "כלל",
            month: 1.66,
            year1: 14.94,
            year3: 42.48,
            year5: 49.05,
            fee: 0.12,
            assets: 795.03
        },
        {
            nameHe: "מנורה מבטחים גמל להשקעה כללי",
            companyHe: "מנורה מבטחים",
            month: 2.2,
            year1: 17.48,
            year3: 42.69,
            year5: 48.9,
            fee: 0.59,
            assets: 1450.79
        },
        {
            nameHe: "אל על 50-60",
            companyHe: "אל",
            month: 1.92,
            year1: 15.83,
            year3: 44.52,
            year5: 48.75,
            fee: 0.41,
            assets: 729.57
        },
        {
            nameHe: "מחוג  מסלול לבני 50 עד 60",
            companyHe: "מחוג",
            month: 1.82,
            year1: 13.61,
            year3: 41.2,
            year5: 48.72,
            fee: 0.25,
            assets: 93.86
        },
        {
            nameHe: "עוצ\"מ - מסלול לבני 50 ומטה",
            companyHe: "עוצ\"מ",
            month: 3.49,
            year1: 20.05,
            year3: 50.68,
            year5: 48.68,
            fee: 0.6,
            assets: 502.64
        },
        {
            nameHe: "קרן החיסכון לצבא הקבע כללי",
            companyHe: "קרן החיסכון",
            month: 2.42,
            year1: 15.77,
            year3: 38.6,
            year5: 48.66,
            fee: 0.21,
            assets: 4988.29
        },
        {
            nameHe: "הפניקס גמל להשקעה כללי",
            companyHe: "הפניקס",
            month: 2.09,
            year1: 15.96,
            year3: 43.32,
            year5: 48.55,
            fee: 0.62,
            assets: 2912.08
        },
        {
            nameHe: "כלל גמל לעתיד כללי",
            companyHe: "כלל",
            month: 2.68,
            year1: 17.87,
            year3: 43.01,
            year5: 48.25,
            fee: 0.65,
            assets: 1616.44
        },
        {
            nameHe: "מורים וגננות - מסלול כללי",
            companyHe: "כלל",
            month: 1.62,
            year1: 14.34,
            year3: 42.17,
            year5: 48.21,
            fee: 0.12,
            assets: 28490.03
        },
        {
            nameHe: "מקפת-אחרות",
            companyHe: "מקפת-אחרות",
            month: 2.79,
            year1: 17.35,
            year3: 43.02,
            year5: 48.15,
            fee: 1.93,
            assets: 51.57
        },
        {
            nameHe: "הראל גמל מסלול לגילאי 50 עד 60",
            companyHe: "הראל",
            month: 2.43,
            year1: 15.66,
            year3: 37.53,
            year5: 48.15,
            fee: 0.41,
            assets: 6615.71
        },
        {
            nameHe: "הפניקס חיסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "הפניקס",
            month: 2.5,
            year1: 16.57,
            year3: 44.19,
            year5: 48.12,
            fee: 0.02,
            assets: 199.05
        },
        {
            nameHe: "מנורה מבטחים חסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "מנורה מבטחים",
            month: 2.22,
            year1: 16.78,
            year3: 41.42,
            year5: 47.94,
            fee: 0.01,
            assets: 188.18
        },
        {
            nameHe: "הראל השתלמות כללי",
            companyHe: "הראל",
            month: 2.43,
            year1: 15.96,
            year3: 37.64,
            year5: 47.91,
            fee: 0.6,
            assets: 14782.58
        },
        {
            nameHe: "קופת גמל עמ\"י מסלול לבני 50 ומטה",
            companyHe: "קופת",
            month: 2.91,
            year1: 18.46,
            year3: 49.7,
            year5: 47.7,
            fee: 0.39,
            assets: 89.83
        },
        {
            nameHe: "מנורה מבטחים תגמולים 50-60",
            companyHe: "מנורה מבטחים",
            month: 2.23,
            year1: 16.15,
            year3: 39.2,
            year5: 47.64,
            fee: 0.59,
            assets: 4982.27
        },
        {
            nameHe: "כלל תמר 50-60",
            companyHe: "כלל",
            month: 2.6,
            year1: 17.42,
            year3: 41.17,
            year5: 47.53,
            fee: 0.49,
            assets: 4422.74
        },
        {
            nameHe: "מבטחים-אחרות",
            companyHe: "מבטחים-אחרות",
            month: 2.8,
            year1: 17.88,
            year3: 43.92,
            year5: 47.49,
            fee: 2,
            assets: 954.59
        },
        {
            nameHe: "אל על עד 50",
            companyHe: "אל",
            month: 2.47,
            year1: 17.78,
            year3: 52.86,
            year5: 47.09,
            fee: 0.4,
            assets: 41.33
        },
        {
            nameHe: "מורים וגננות - מסלול כללי",
            companyHe: "כלל",
            month: 1.62,
            year1: 14.42,
            year3: 41.85,
            year5: 47.01,
            fee: 0.12,
            assets: 1201.86
        },
        {
            nameHe: "חקלאים-אחרות",
            companyHe: "חקלאים-אחרות",
            month: 2.81,
            year1: 17.58,
            year3: 43.62,
            year5: 46.85,
            fee: 1.97,
            assets: 103.84
        },
        {
            nameHe: "רעות-כללי",
            companyHe: "רעות",
            month: 2.6,
            year1: 16.05,
            year3: 42.62,
            year5: 46.65,
            fee: 0.46,
            assets: 2462.84
        },
        {
            nameHe: "מור  מנורה מבטחים 50-60",
            companyHe: "מנורה מבטחים",
            month: 2.43,
            year1: 17.24,
            year3: 42.87,
            year5: 46.61,
            fee: 0.18,
            assets: 100.41
        },
        {
            nameHe: "קו הבריאות לבני 50 ומטה",
            companyHe: "קו",
            month: 2.9,
            year1: 18.43,
            year3: 49.58,
            year5: 46.54,
            fee: 0.34,
            assets: 25.5
        },
        {
            nameHe: "הנדסאים השתלמות - מסלול כללי",
            companyHe: "הנדסאים",
            month: 2.1,
            year1: 15.76,
            year3: 43.91,
            year5: 46.25,
            fee: 0.35,
            assets: 2043.73
        },
        {
            nameHe: "מנורה מרכזית לפיצויים כללי",
            companyHe: "מנורה",
            month: 2.51,
            year1: 17.85,
            year3: 42.64,
            year5: 46.21,
            fee: 0.34,
            assets: 154.29
        },
        {
            nameHe: "ילין לפידות מרכזית לפיצויים כללי ב'",
            companyHe: "ילין לפידות",
            month: 1.32,
            year1: 12.72,
            year3: 40.43,
            year5: 46.14,
            fee: 0.35,
            assets: 331.32
        },
        {
            nameHe: "עו\"ס גמל לבני 50 ומטה",
            companyHe: "עו\"ס",
            month: 2.66,
            year1: 15.16,
            year3: 44.09,
            year5: 46.08,
            fee: 0.73,
            assets: 7.57
        },
        {
            nameHe: "הפניקס מרכזית לפיצויים",
            companyHe: "הפניקס",
            month: 2.19,
            year1: 15.56,
            year3: 40.7,
            year5: 45.85,
            fee: 0.55,
            assets: 1079.71
        },
        {
            nameHe: "כלל פיצויים למעסיק",
            companyHe: "כלל",
            month: 2.51,
            year1: 16.5,
            year3: 40.19,
            year5: 45.75,
            fee: 0.78,
            assets: 961.38
        },
        {
            nameHe: "הפניקס השתלמות הלכה",
            companyHe: "הפניקס",
            month: 2.16,
            year1: 15.36,
            year3: 42.15,
            year5: 45.64,
            fee: 0.66,
            assets: 342.08
        },
        {
            nameHe: "מנורה מבטחים אמיר כללי",
            companyHe: "מנורה מבטחים",
            month: 1.75,
            year1: 14.2,
            year3: 37.57,
            year5: 45.63,
            fee: 0.5,
            assets: 472.2
        },
        {
            nameHe: "מור חיסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "מור",
            month: 1.75,
            year1: 15.19,
            year3: 41.8,
            year5: 45.53,
            fee: 0.01,
            assets: 37.38
        },
        {
            nameHe: "הראל קופה לפנסיה תקציבית",
            companyHe: "הראל",
            month: 2.86,
            year1: 17.06,
            year3: 41.46,
            year5: 45.52,
            fee: 1.33,
            assets: 38.35
        },
        {
            nameHe: "יחד קרן השתלמות לרופאים- כללי",
            companyHe: "כלל",
            month: 1.59,
            year1: 13.79,
            year3: 36.58,
            year5: 45.45,
            fee: 0.38,
            assets: 1204.14
        },
        {
            nameHe: "קו הבריאות לבני 50-60",
            companyHe: "קו",
            month: 2.45,
            year1: 16.53,
            year3: 42.95,
            year5: 45.43,
            fee: 0.34,
            assets: 1463.9
        },
        {
            nameHe: "מגדל  חסכון לילד - חוסכים המעדיפים סיכון בינוני",
            companyHe: "מגדל",
            month: 2.35,
            year1: 16.07,
            year3: 41.17,
            year5: 45.41,
            fee: 0.01,
            assets: 148.06
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
