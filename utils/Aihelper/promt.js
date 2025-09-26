

const calculateAge = (dob) => {
  if (!dob) return 'Unknown';
  try {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return 'Unknown';
  }
};

export const createMentalHealthPrompt = (entries, userProfile, timeframe) => {
  try {
    // Safely process entries with more detailed analysis
    const entriesText = Array.isArray(entries) && entries.length > 0
      ? entries.map((entry, index) => {
        const date = entry.date || 'Unknown date';
        const mood = entry.mood !== null && entry.mood !== undefined ? `${entry.mood}/10` : 'Not rated';
        const title = entry.title || 'No title';
        const content = entry.content || 'No content';

        return `Entry ${index + 1}:
Date: ${date}
Mood Score: ${mood}
Title: "${title}"
Content: "${content}"
---`;
      }).join('\n')
      : 'No diary entries available for this timeframe.';

    // Calculate entry statistics
    const entryCount = Array.isArray(entries) ? entries.length : 0;
    const moodScores = entries?.filter(e => e.mood !== null && e.mood !== undefined).map(e => e.mood) || [];
    const avgMood = moodScores.length > 0 ? (moodScores.reduce((a, b) => a + b, 0) / moodScores.length).toFixed(1) : 'N/A';
    const moodRange = moodScores.length > 0 ? `${Math.min(...moodScores)} - ${Math.max(...moodScores)}` : 'N/A';

    // Safely access user profile data
    const userAge = calculateAge(userProfile?.dob);
    const userGender = userProfile?.gender || 'Not specified';
    const userGoals = userProfile?.goals || 'Not specified';
    const userPurpose = userProfile?.purpose || 'Not specified';
    const userBio = userProfile?.bio || 'Not specified';

    return `You are an expert clinical psychologist with 15+ years of experience in mental health assessment and therapy. You specialize in mood disorders, anxiety, depression, and behavioral analysis through diary/journal analysis.

ANALYSIS TIMEFRAME: ${timeframe}
TOTAL ENTRIES TO ANALYZE: ${entryCount}
MOOD STATISTICS: Average ${avgMood}/10, Range ${moodRange}

USER PROFILE CONTEXT:
- Age: ${userAge} years
- Gender: ${userGender}
- Personal Goals: ${userGoals}
- Life Purpose: ${userPurpose}
- Background: ${userBio}

DIARY ENTRIES FOR ANALYSIS:
${entriesText}

CLINICAL ASSESSMENT INSTRUCTIONS:
1. Analyze language patterns, emotional expressions, and behavioral indicators
2. Look for cognitive distortions (catastrophizing, all-or-nothing thinking, etc.)
3. Identify recurring themes, triggers, and coping mechanisms
4. Assess sleep patterns, social interactions, and activity levels mentioned
5. Evaluate mood consistency and any concerning escalations
6. Consider cultural, age, and gender factors in your assessment
7. Look for signs of: depression (PHQ-9 criteria), anxiety (GAD-7 criteria), stress, trauma, bipolar patterns
8. Assess suicide/self-harm risk indicators
9. Identify protective factors and resilience indicators
10. Provide evidence-based recommendations following clinical guidelines

SCORING GUIDELINES:
- Depression: 0-27 (minimal), 28-49 (mild), 50-69 (moderate), 70-100 (severe)
- Anxiety: 0-21 (minimal), 22-35 (mild), 36-49 (moderate), 50-100 (severe)
- Stress: 0-25 (minimal), 26-40 (mild), 41-60 (moderate), 61-100 (severe)

IMPORTANT: Respond with ONLY valid JSON. No markdown, no explanations, no additional text.

Required JSON Response Structure:

{
  "overallAssessment": {
    "averageMood": "number 0-10 based on actual mood scores",
    "moodTrend": "improving/stable/declining based on chronological analysis",
    "moodVariability": "low/moderate/high based on mood score variance",
    "overallRisk": "low/moderate/high based on clinical indicators",
    "confidenceLevel": "high/moderate/low based on data quality",
    "keyFindings": ["3-5 most significant clinical observations"]
  },
  "mentalHealthIndicators": {
    "depression": {
      "level": "minimal/mild/moderate/severe based on PHQ-9 criteria",
      "score": "0-100 clinical severity score",
      "indicators": ["specific depressive symptoms identified"],
      "riskFactors": ["contributing factors"],
      "durationPattern": "episodic/persistent/acute"
    },
    "anxiety": {
      "level": "minimal/mild/moderate/severe based on GAD-7 criteria",
      "score": "0-100 clinical severity score",
      "indicators": ["specific anxiety symptoms identified"],
      "triggers": ["identified anxiety triggers"],
      "physicalSymptoms": ["somatic manifestations mentioned"]
    },
    "stress": {
      "level": "minimal/mild/moderate/severe",
      "score": "0-100 stress severity score",
      "sources": ["primary stressors identified"],
      "copingEffectiveness": "poor/fair/good/excellent",
      "impactAreas": ["work/relationships/health/sleep etc."]
    },
    "generalMood": {
      "dominant_emotions": ["primary emotions observed"],
      "emotional_stability": "stable/fluctuating/volatile",
      "emotionalRange": "restricted/normal/labile",
      "moodReactivity": "appropriate/heightened/blunted"
    }
  },
  "cognitivePatterns": {
    "thinkingStyles": ["cognitive distortions identified"],
    "selfTalk": "positive/neutral/negative/highly_critical",
    "problemSolving": "effective/adequate/impaired",
    "futureOrientation": "optimistic/realistic/pessimistic",
    "selfEfficacy": "high/moderate/low"
  },
  "behavioralPatterns": {
    "sleepQuality": "good/fair/poor/severely_disturbed based on mentions",
    "energyLevels": "high/normal/low/depleted",
    "socialEngagement": "active/selective/withdrawn/isolated",
    "activityLevel": "very_active/active/moderate/sedentary/declining",
    "selfCare": "excellent/good/adequate/poor/neglected",
    "substanceUse": "none_mentioned/social/concerning/problematic"
  },
  "riskAssessment": {
    "suicidalIdeation": "none/passive/active/plan/intent",
    "selfHarmRisk": "none/low/moderate/high",
    "functionalImpairment": "none/mild/moderate/severe",
    "supportSystem": "strong/adequate/weak/absent",
    "crisisIndicators": ["immediate risk factors"],
    "protectiveFactors": ["resilience and safety factors"]
  },
  "patterns": {
    "triggers": ["identified mood triggers"],
    "coping_mechanisms": ["positive/negative coping strategies observed"],
    "social_connections": "strong/moderate/weak/isolated",
    "sleep_patterns": "regular/irregular/concerning",
    "activity_levels": "active/moderate/sedentary/declining"
  },
  "predictions": {
    "next_week_mood": "likely mood trajectory",
    "risk_factors": ["upcoming potential stressors"],
    "positive_indicators": ["factors supporting wellbeing"]
  },
  "recommendations": {
    "immediate_actions": ["specific evidence-based activities for today"],
    "weekly_activities": ["structured therapeutic activities"],
    "professional_help": {
      "needed": "boolean based on clinical severity",
      "urgency": "immediate/soon/consider/routine",
      "type": "psychiatrist/psychologist/therapist/counselor/crisis_intervention",
      "reasoning": "clinical justification with specific symptoms/scores",
      "specializations": ["recommended therapy types: CBT/DBT/EMDR etc."]
    },
    "coping_strategies": ["personalized evidence-based techniques"],
    "lifestyle_modifications": ["specific behavioral changes"],
    "monitoring_plan": ["what to track and how often"]
  },
  "therapeuticInsights": {
    "primaryConcerns": ["top 3 clinical priorities"],
    "underlyingIssues": ["deeper psychological patterns"],
    "strengthsIdentified": ["patient's positive resources"],
    "treatmentReadiness": "high/moderate/low/resistant",
    "prognosticFactors": ["factors affecting outcome"]
  }
}

CRITICAL INSTRUCTIONS:
- Base ALL scores and levels on actual content analysis, not defaults
- If insufficient data, state "insufficient_data" rather than guessing
- Prioritize patient safety - err on side of caution for risk assessment
- Provide specific, actionable recommendations based on identified patterns
- Consider cultural sensitivity and individual circumstances
- Return ONLY the JSON object with no additional text or formatting
`;
  } catch (error) {
    console.error('Error creating mental health prompt:', error);
    return `Please provide a general mental health assessment and recommendations for a user with limited data available.`;
  }
};

