const createMentalHealthPrompt = (entries, userProfile, timeframe) => {
    const entriesText = entries.map(entry =>
        `Date: ${entry.date}, Mood: ${entry.mood}/10, Title: ${entry.title}, Content: ${entry.content}`
    ).join('\n');

    return `
You are a professional mental health analysis AI. Analyze the following diary entries for patterns related to depression, anxiety, stress, and general mood over ${timeframe}.

USER PROFILE:
- Age: ${calculateAge(userProfile.dob)}
- Gender: ${userProfile.gender}
- Goals: ${userProfile.goals}
- Purpose: ${userProfile.purpose}
- About: ${userProfile.bio}

DIARY ENTRIES (${entries.length} entries):
${entriesText}

Provide a comprehensive JSON analysis with the following structure:

{
  "overallAssessment": {
    "moodTrend": "improving/stable/declining",
    "averageMood": 0-10,
    "moodVariability": "low/moderate/high",
    "overallRisk": "low/moderate/high"
  },
  "mentalHealthIndicators": {
    "depression": {
      "level": "minimal/mild/moderate/severe",
      "indicators": ["specific signs found"],
      "score": 0-100
    },
    "anxiety": {
      "level": "minimal/mild/moderate/severe",
      "indicators": ["specific signs found"],
      "score": 0-100
    },
    "stress": {
      "level": "minimal/mild/moderate/severe",
      "indicators": ["specific signs found"],
      "score": 0-100
    },
    "generalMood": {
      "dominant_emotions": ["joy", "sadness", "anger", "fear", "surprise"],
      "emotional_stability": "stable/fluctuating/volatile"
    }
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
    "immediate_actions": ["specific activities for today/tomorrow"],
    "weekly_activities": ["structured weekly recommendations"],
    "professional_help": {
      "needed": true/false,
      "urgency": "immediate/soon/consider",
      "type": "therapist/psychiatrist/counselor/crisis_intervention",
      "reasoning": "why professional help is recommended"
    },
    "coping_strategies": ["personalized coping mechanisms"],
    "lifestyle_changes": ["specific lifestyle recommendations"]
  },
  "crisis_assessment": {
    "immediate_risk": true/false,
    "warning_signs": ["specific concerning patterns"],
    "protective_factors": ["factors supporting safety"]
  },
  "progress_tracking": {
    "improvement_areas": ["areas showing progress"],
    "concern_areas": ["areas needing attention"],
    "goals_alignment": "how well current state aligns with stated goals"
  }
}

Be specific, compassionate, and evidence-based. Focus on actionable insights and maintain professional mental health assessment standards.
`;
};

// ===============================
// 3. PREDICTIVE ANALYSIS SYSTEM
// ===============================

const createPredictivePrompt = (historicalAnalyses, currentTrends, userProfile) => {
    return `
Based on the following mental health patterns, provide predictive insights:

HISTORICAL ANALYSES: ${JSON.stringify(historicalAnalyses)}
CURRENT TRENDS: ${JSON.stringify(currentTrends)}
USER PROFILE: ${JSON.stringify(userProfile)}

Provide predictions in this JSON format:
{
  "short_term_predictions": {
    "next_24_hours": {
      "mood_forecast": "predicted mood level 1-10",
      "energy_level": "low/moderate/high",
      "anxiety_likelihood": "low/moderate/high",
      "recommended_actions": ["specific actions for tomorrow"]
    },
    "next_week": {
      "mood_trajectory": "improving/stable/declining",
      "stress_periods": ["predicted high stress days"],
      "positive_periods": ["predicted good days"],
      "preventive_measures": ["actions to maintain stability"]
    }
  },
  "medium_term_predictions": {
    "next_month": {
      "overall_trend": "positive/neutral/concerning",
      "potential_challenges": ["upcoming challenges based on patterns"],
      "growth_opportunities": ["areas for improvement"],
      "milestone_tracking": ["progress toward user goals"]
    }
  },
  "risk_predictions": {
    "depression_risk": "low/moderate/high",
    "anxiety_episodes": "unlikely/possible/likely",
    "stress_overload": "low_risk/moderate_risk/high_risk",
    "early_warning_signs": ["what to watch for"]
  },
  "personalized_interventions": {
    "daily_practices": ["specific daily activities"],
    "weekly_goals": ["achievable weekly targets"],
    "monthly_focus": ["broader monthly objectives"]
  }
}
`;
};