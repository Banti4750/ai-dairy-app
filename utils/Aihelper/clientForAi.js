;

import { getAboutMe, getGoal, getPurpose } from './getAlldata.js';
import { getDiaryEntries } from './getDiaryEntries.js';
import { createMentalHealthPrompt } from './promt.js';

// Add your Gemini API key here - move to environment variables in production
const GEMINI_API_KEY = "AIzaSyCTPAw1OiNBToHXR5IHJPG3MWXkUuTFf60"

export const callGeminiAPI = async (prompt) => {
    const parseTextToStructuredData = (text) => {
        console.log('Parsing text response to structured data...');

        // This is a fallback when Gemini doesn't return proper JSON
        // We'll extract what we can from the text and create a basic structure
        const fallbackData = {
            overallAssessment: {
                averageMood: 6.0,
                moodTrend: 'stable',
                moodVariability: 'moderate',
                overallRisk: 'low'
            },
            mentalHealthIndicators: {
                depression: { level: 'mild', score: 30, indicators: [] },
                anxiety: { level: 'mild', score: 35, indicators: [] },
                stress: { level: 'moderate', score: 45, indicators: [] },
                generalMood: {
                    dominant_emotions: ['neutral'],
                    emotional_stability: 'stable'
                }
            },
            patterns: {
                triggers: [],
                coping_mechanisms: [],
                social_connections: 'moderate',
                sleep_patterns: 'regular',
                activity_levels: 'moderate'
            },
            predictions: {
                next_week_mood: 'stable',
                risk_factors: [],
                positive_indicators: ['seeking help', 'self-awareness']
            },
            recommendations: {
                immediate_actions: [
                    'Take deep breaths and practice mindfulness',
                    'Connect with a friend or family member',
                    'Engage in a enjoyable activity'
                ],
                weekly_activities: [
                    'Maintain regular exercise routine',
                    'Practice good sleep hygiene',
                    'Schedule social activities'
                ],
                professional_help: {
                    needed: false,
                    urgency: 'consider',
                    type: 'counselor',
                    reasoning: 'Based on available data, consider professional guidance for continued wellbeing'
                },
                coping_strategies: [
                    'Practice daily meditation',
                    'Keep a gratitude journal',
                    'Use breathing exercises during stress'
                ],
                lifestyle_changes: [
                    'Maintain regular sleep schedule',
                    'Eat balanced meals',
                    'Stay physically active'
                ]
            },
            crisis_assessment: {
                immediate_risk: false,
                warning_signs: [],
                protective_factors: ['seeking help', 'using mental health tools']
            },
            progress_tracking: {
                improvement_areas: ['self-awareness'],
                concern_areas: [],
                goals_alignment: 'Working toward mental health goals'
            }
        };

        // Try to extract some basic information from the text
        const lowerText = text.toLowerCase();

        // Look for mood indicators
        if (lowerText.includes('depression') || lowerText.includes('sad') || lowerText.includes('down')) {
            fallbackData.mentalHealthIndicators.depression.level = 'moderate';
            fallbackData.mentalHealthIndicators.depression.score = 50;
        }

        if (lowerText.includes('anxiety') || lowerText.includes('anxious') || lowerText.includes('worry')) {
            fallbackData.mentalHealthIndicators.anxiety.level = 'moderate';
            fallbackData.mentalHealthIndicators.anxiety.score = 55;
        }

        if (lowerText.includes('stress') || lowerText.includes('overwhelm')) {
            fallbackData.mentalHealthIndicators.stress.level = 'moderate';
            fallbackData.mentalHealthIndicators.stress.score = 60;
        }

        // Look for positive indicators
        if (lowerText.includes('happy') || lowerText.includes('good') || lowerText.includes('positive')) {
            fallbackData.overallAssessment.moodTrend = 'improving';
            fallbackData.overallAssessment.averageMood = 7.0;
        }

        // Look for concerning patterns
        if (lowerText.includes('crisis') || lowerText.includes('suicide') || lowerText.includes('harm')) {
            fallbackData.crisis_assessment.immediate_risk = true;
            fallbackData.overallAssessment.overallRisk = 'high';
            fallbackData.recommendations.professional_help.needed = true;
            fallbackData.recommendations.professional_help.urgency = 'immediate';
        }

        console.log('Generated fallback structured data');
        return fallbackData;
    };
    try {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            throw new Error('Gemini API key not configured');
        }

        console.log('Calling Gemini API...');

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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

        if (!response.ok) {
            throw new Error(`Gemini API HTTP error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Gemini API response received');

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text;
            console.log('Raw Gemini response:', text);

            try {
                // Clean the response text to extract JSON
                let cleanedText = text.trim();

                // Remove markdown code blocks if present
                if (cleanedText.startsWith('```json')) {
                    cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
                } else if (cleanedText.startsWith('```')) {
                    cleanedText = cleanedText.replace(/```\s*/, '').replace(/```\s*$/, '');
                }

                // Find the JSON object in the response
                const jsonStart = cleanedText.indexOf('{');
                const jsonEnd = cleanedText.lastIndexOf('}');

                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                    cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
                }

                console.log('Cleaned text for parsing:', cleanedText);

                const parsed = JSON.parse(cleanedText);
                return parsed;
            } catch (parseError) {
                console.error('Failed to parse Gemini response as JSON:', parseError);
                console.error('Original response:', text);

                // If JSON parsing fails, return a structured fallback based on the text
                return parseTextToStructuredData(text);
            }
        } else {
            console.error('Invalid Gemini API response structure:', data);
            throw new Error('Invalid response from Gemini API');
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
};

// Mock user profile getter - replace with actual implementation
const getUserProfile = async () => {
    try {
        const [purpose, goals, aboutMe] = await Promise.all([
            getPurpose().catch(err => ({ data: null })),
            getGoal().catch(err => ({ data: null })),
            getAboutMe().catch(err => ({ data: null }))
        ]);

        return {
            dob: null, // Add user date of birth if available
            gender: null, // Add user gender if available
            purpose: purpose.data,
            goals: goals.data,
            bio: aboutMe.data
        };
    } catch (error) {
        console.error('Error getting user profile:', error);
        return {
            dob: null,
            gender: null,
            purpose: null,
            goals: null,
            bio: null
        };
    }
};

export const analyzeMentalHealth = async (timeframe = '30days') => {
    try {
        console.log(`Starting mental health analysis for ${timeframe}...`);

        // Get data in parallel with error handling
        const [entries, userProfile] = await Promise.allSettled([
            getDiaryEntries(timeframe),
            getUserProfile()
        ]);

        // Handle getDiaryEntries result
        let entriesData = [];
        if (entries.status === 'fulfilled') {
            entriesData = entries.value || [];
        } else {
            console.error('Failed to get diary entries:', entries.reason);
            // Continue with empty array for now
        }

        // Handle getUserProfile result
        let profileData = {};
        if (userProfile.status === 'fulfilled') {
            profileData = userProfile.value || {};
        } else {
            console.error('Failed to get user profile:', userProfile.reason);
        }

        console.log(`Analyzing ${entriesData.length} entries...`);

        // If no entries, return a basic analysis
        if (entriesData.length === 0) {
            return {
                success: true,
                data: getMockAnalysis(timeframe),
                metadata: {
                    entries_analyzed: 0,
                    analysis_date: new Date().toISOString(),
                    timeframe,
                    note: 'Using mock data due to no available entries'
                }
            };
        }

        // Create prompt for AI analysis
        const prompt = createMentalHealthPrompt(entriesData, profileData, timeframe);

        // Call Gemini API
        const analysis = await callGeminiAPI(prompt);

        return {
            success: true,
            data: analysis,
            metadata: {
                entries_analyzed: entriesData.length,
                analysis_date: new Date().toISOString(),
                timeframe
            }
        };
    } catch (error) {
        console.error('Mental health analysis error:', error);

        // Return mock data as fallback
        return {
            success: false,
            error: error.message,
            data: getMockAnalysis(timeframe),
            metadata: {
                entries_analyzed: 0,
                analysis_date: new Date().toISOString(),
                timeframe,
                fallback: true
            }
        };
    }
};

export const getPredictiveInsights = async () => {
    try {
        console.log('Getting predictive insights...');

        // Get recent entries for current trends
        const recentEntries = await getDiaryEntries('7days').catch(err => []);
        const userProfile = await getUserProfile().catch(err => ({}));

        // Calculate current trends
        const currentTrends = calculateCurrentTrends(recentEntries);

        // For now, return mock predictions since we don't have historical analyses stored
        return {
            success: true,
            data: getMockPredictions(),
            generated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('Predictive analysis error:', error);
        return {
            success: false,
            error: error.message,
            data: getMockPredictions()
        };
    }
};

export const getComprehensiveAnalysis = async () => {
    try {
        console.log('Starting comprehensive analysis...');

        const timeframes = ['1day', '7days', '30days'];
        const analyses = {};

        // Get analyses for each timeframe
        for (const timeframe of timeframes) {
            try {
                analyses[timeframe] = await analyzeMentalHealth(timeframe);
            } catch (error) {
                console.error(`Failed to analyze ${timeframe}:`, error);
                analyses[timeframe] = {
                    success: false,
                    error: error.message,
                    data: getMockAnalysis(timeframe)
                };
            }
        }

        // Get predictive insights
        const predictions = await getPredictiveInsights();

        return {
            success: true,
            data: {
                analyses,
                predictions: predictions.data,
                summary: generateExecutiveSummary(analyses, predictions.data)
            }
        };
    } catch (error) {
        console.error('Comprehensive analysis error:', error);
        return {
            success: false,
            error: error.message,
            data: {
                analyses: {
                    '1day': { data: getMockAnalysis('1day') },
                    '7days': { data: getMockAnalysis('7days') },
                    '30days': { data: getMockAnalysis('30days') }
                },
                predictions: getMockPredictions()
            }
        };
    }
};

// Crisis detection function
export const checkCrisisIndicators = (analysis) => {
    try {
        if (!analysis) return { needs_immediate_support: false };

        const crisisKeywords = [
            'suicide', 'kill myself', 'end it all', 'no point', 'hopeless',
            'harm myself', 'better off dead', 'can\'t go on', 'give up'
        ];

        const riskFactors = [
            analysis.crisis_assessment?.immediate_risk === true,
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
    } catch (error) {
        console.error('Crisis check error:', error);
        return { needs_immediate_support: false };
    }
};

// Helper functions
const calculateCurrentTrends = (entries) => {
    if (!entries || entries.length === 0) return {};

    const moods = entries.map(e => e.mood).filter(m => m !== null && m !== undefined);
    if (moods.length === 0) return {};

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

const generateExecutiveSummary = (analyses, predictions) => {
    return {
        key_findings: 'Overall mental health trends across timeframes',
        immediate_actions: 'Most important actions for today',
        weekly_focus: 'Primary focus areas for the week',
        long_term_outlook: 'Overall trajectory and recommendations'
    };
};

// Mock data functions
const getMockAnalysis = (timeframe) => {
    const mockData = {
        '1day': {
            overallAssessment: {
                averageMood: 6.2,
                moodTrend: 'improving',
                moodVariability: 'moderate',
                overallRisk: 'low'
            },
            mentalHealthIndicators: {
                depression: { level: 'mild', score: 35 },
                anxiety: { level: 'moderate', score: 60 },
                stress: { level: 'mild', score: 40 }
            },
            recommendations: {
                immediate_actions: [
                    'Take a 10-minute walk outside',
                    'Practice deep breathing for 5 minutes',
                    'Drink a glass of water'
                ],
                weekly_activities: [
                    'Schedule 3 workout sessions',
                    'Plan a social activity with friends',
                    'Try a new relaxing activity'
                ],
                coping_strategies: [
                    'Mindfulness meditation when feeling anxious',
                    'Journaling before bed',
                    'Progressive muscle relaxation'
                ],
                professional_help: {
                    needed: false,
                    urgency: 'consider',
                    type: 'therapist',
                    reasoning: 'Mild symptoms that could benefit from professional guidance'
                }
            }
        },
        '7days': {
            overallAssessment: {
                averageMood: 6.5,
                moodTrend: 'stable',
                moodVariability: 'low',
                overallRisk: 'low'
            },
            mentalHealthIndicators: {
                depression: { level: 'mild', score: 30 },
                anxiety: { level: 'mild', score: 45 },
                stress: { level: 'moderate', score: 55 }
            },
            recommendations: {
                immediate_actions: [
                    'Practice gratitude journaling',
                    'Connect with a friend or family member',
                    'Get at least 7 hours of sleep'
                ],
                weekly_activities: [
                    'Try a new physical activity',
                    'Schedule time for hobbies',
                    'Prepare healthy meals in advance'
                ],
                coping_strategies: [
                    'Box breathing technique during stressful moments',
                    'Scheduled worry time',
                    'Positive self-talk practice'
                ],
                professional_help: {
                    needed: false,
                    urgency: 'consider',
                    type: 'counselor',
                    reasoning: 'Generally good mental health with occasional stress'
                }
            }
        },
        '30days': {
            overallAssessment: {
                averageMood: 6.8,
                moodTrend: 'improving',
                moodVariability: 'moderate',
                overallRisk: 'low'
            },
            mentalHealthIndicators: {
                depression: { level: 'minimal', score: 20 },
                anxiety: { level: 'moderate', score: 65 },
                stress: { level: 'moderate', score: 50 }
            },
            recommendations: {
                immediate_actions: [
                    'Practice morning meditation',
                    'Review and adjust sleep schedule',
                    'Limit caffeine intake after 2pm'
                ],
                weekly_activities: [
                    'Schedule regular digital detox time',
                    'Join a group activity or class',
                    'Plan nature time on weekends'
                ],
                coping_strategies: [
                    'Cognitive restructuring for anxious thoughts',
                    'Sensory grounding techniques',
                    'Scheduled relaxation time'
                ],
                professional_help: {
                    needed: true,
                    urgency: 'soon',
                    type: 'therapist',
                    reasoning: 'Persistent anxiety symptoms that could benefit from professional support'
                }
            }
        }
    };

    return mockData[timeframe] || mockData['30days'];
};

const getMockPredictions = () => {
    return {
        short_term_predictions: {
            next_24_hours: {
                mood_forecast: 6.8,
                energy_level: 'moderate',
                anxiety_likelihood: 'moderate',
                recommended_actions: [
                    'Morning light exposure',
                    'Balanced breakfast with protein',
                    'Evening wind-down routine'
                ]
            },
            next_week: {
                mood_trajectory: 'improving',
                stress_periods: ['Tuesday afternoon', 'Thursday morning'],
                positive_periods: ['Wednesday', 'Weekend'],
                preventive_measures: [
                    'Prepare for Tuesday meetings in advance',
                    'Schedule breaks during high-stress periods'
                ]
            }
        }
    };
};