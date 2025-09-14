import { getGoal, getPurpose, getUserProfile } from "./getAlldata";
import { getDiaryEntries } from "./getDiaryEntries";
import { createMentalHealthPrompt, createPredictivePrompt } from "./promt";
const GEMINI_API_KEY = "AIzaSyCTPAw1OiNBToHXR5IHJPG3MWXkUuTFf60"
export const callGeminiAPI = async (prompt) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 4096,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text;
            return JSON.parse(text);
        } else {
            throw new Error('Invalid response from Gemini API');
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
};

// ===============================
// 5. COMPREHENSIVE ANALYSIS FUNCTIONS
// ===============================

export const analyzeMentalHealth = async (timeframe = '30days') => {

    try {
        const [entries, userProfile, goals, purpose] = await Promise.all([
            getDiaryEntries(timeframe),
            getUserProfile(),
            getGoal(),
            getPurpose()
        ]);

        const enhancedProfile = {
            ...userProfile,
            goals: goals.data,
            purpose: purpose.data
        };

        const prompt = createMentalHealthPrompt(entries.data, enhancedProfile, timeframe);
        const analysis = await callGeminiAPI(prompt);

        // Store analysis for historical tracking
        await storeAnalysis(analysis, timeframe);

        return {
            success: true,
            data: analysis,
            metadata: {
                entries_analyzed: entries.data.length,
                analysis_date: new Date().toISOString(),
                timeframe
            }
        };
    } catch (error) {
        console.error('Mental health analysis error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const getPredictiveInsights = async () => {
    try {
        // Get historical analyses
        const historicalAnalyses = await getStoredAnalyses();
        const userProfile = await getUserProfile();
        const recentEntries = await getDiaryEntries('7days');

        // Calculate current trends
        const currentTrends = calculateCurrentTrends(recentEntries.data);

        const predictivePrompt = createPredictivePrompt(
            historicalAnalyses,
            currentTrends,
            userProfile
        );

        const predictions = await callGeminiAPI(predictivePrompt);

        return {
            success: true,
            data: predictions,
            generated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('Predictive analysis error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// ===============================
// 6. MULTI-TIMEFRAME ANALYSIS
// ===============================

export const getComprehensiveAnalysis = async () => {
    try {
        const timeframes = ['1day', '7days', '30days'];
        const analyses = {};

        for (const timeframe of timeframes) {
            analyses[timeframe] = await analyzeMentalHealth(timeframe);
        }

        // Get predictive insights
        const predictions = await getPredictiveInsights();

        // Compare trends across timeframes
        const trendComparison = compareTrendAcrossTimeframes(analyses);

        return {
            success: true,
            data: {
                analyses,
                predictions: predictions.data,
                trend_comparison: trendComparison,
                summary: generateExecutiveSummary(analyses, predictions.data)
            }
        };
    } catch (error) {
        console.error('Comprehensive analysis error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// ===============================
// 7. CRISIS DETECTION & SUPPORT
// ===============================

export const checkCrisisIndicators = (analysis) => {
    const crisisKeywords = [
        'suicide', 'kill myself', 'end it all', 'no point', 'hopeless',
        'harm myself', 'better off dead', 'can\'t go on', 'give up'
    ];

    const riskFactors = [
        analysis.crisis_assessment?.immediate_risk,
        analysis.mentalHealthIndicators?.depression?.level === 'severe',
        analysis.overallAssessment?.overallRisk === 'high'
    ];

    const needsCrisisSupport = riskFactors.some(factor => factor === true);

    if (needsCrisisSupport) {
        return {
            needs_immediate_support: true,
            crisis_resources: getCrisisResources(),
            recommended_actions: [
                'Contact a mental health professional immediately',
                'Reach out to a trusted friend or family member',
                'Use crisis hotline if feeling unsafe'
            ]
        };
    }

    return { needs_immediate_support: false };
};

const getCrisisResources = () => {
    return {
        hotlines: [
            {
                name: 'National Suicide Prevention Lifeline',
                number: '988',
                available: '24/7'
            },
            {
                name: 'Crisis Text Line',
                number: 'Text HOME to 741741',
                available: '24/7'
            }
        ],
        professional_help: [
            'Contact your healthcare provider',
            'Visit nearest emergency room if immediate danger',
            'Schedule appointment with mental health professional'
        ]
    };
};

// ===============================
// 8. HELPER FUNCTIONS
// ===============================


const calculateCurrentTrends = (entries) => {
    if (!entries || entries.length === 0) return {};

    const moods = entries.map(e => e.mood).filter(m => m !== null);
    const avgMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;

    return {
        average_mood: avgMood,
        entries_count: entries.length,
        mood_variance: calculateMoodVariance(moods),
        recent_trend: calculateMoodTrend(moods)
    };
};

const calculateMoodVariance = (moods) => {
    if (moods.length < 2) return 0;
    const avg = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    const variance = moods.reduce((sum, mood) => sum + Math.pow(mood - avg, 2), 0) / moods.length;
    return Math.sqrt(variance);
};

const calculateMoodTrend = (moods) => {
    if (moods.length < 2) return 'stable';

    const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
    const secondHalf = moods.slice(Math.floor(moods.length / 2));

    const firstAvg = firstHalf.reduce((sum, mood) => sum + mood, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, mood) => sum + mood, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 0.5) return 'improving';
    if (secondAvg < firstAvg - 0.5) return 'declining';
    return 'stable';
};

const compareTrendAcrossTimeframes = (analyses) => {
    return {
        mood_consistency: 'Analysis of mood patterns across different timeframes',
        improvement_areas: 'Areas showing consistent improvement',
        concern_areas: 'Areas showing consistent concern across timeframes'
    };
};

const generateExecutiveSummary = (analyses, predictions) => {
    return {
        key_findings: 'Top 3 most important insights',
        immediate_actions: 'Most critical actions to take today',
        weekly_focus: 'Main area to focus on this week',
        long_term_outlook: 'Overall trajectory and prognosis'
    };
};

// Storage functions (implement based on your database)
const storeAnalysis = async (analysis, timeframe) => {
    // Implement storage logic
};

const getStoredAnalyses = async () => {
    // Implement retrieval logic
    return [];
};