// // ===============================
// // REACT NATIVE MENTAL HEALTH COMPONENTS
// // ===============================

// import { useEffect, useState } from 'react';
// import {
//     ActivityIndicator,
//     Alert,
//     Dimensions,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View
// } from 'react-native';
// import { LineChart } from 'react-native-chart-kit';
import { checkCrisisIndicators, getComprehensiveAnalysis } from '../../utils/Aihelper/clientForAi.js';

// const { width } = Dimensions.get('window');



// const mockAnalysisData = {
//     analyses: {
//         '1day': {
//             data: {
//                 overallAssessment: {
//                     averageMood: 6.2,
//                     moodTrend: 'improving',
//                     moodVariability: 'moderate',
//                     overallRisk: 'low'
//                 },
//                 mentalHealthIndicators: {
//                     depression: { level: 'mild', score: 35 },
//                     anxiety: { level: 'moderate', score: 60 },
//                     stress: { level: 'mild', score: 40 }
//                 },
//                 moodData: {
//                     labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
//                     values: [5.2, 6.1, 7.3, 6.8, 6.5, 6.2]
//                 },
//                 recommendations: {
//                     immediate_actions: [
//                         'Take a 10-minute walk outside',
//                         'Practice deep breathing for 5 minutes',
//                         'Drink a glass of water'
//                     ],
//                     weekly_activities: [
//                         'Schedule 3 workout sessions',
//                         'Plan a social activity with friends',
//                         'Try a new relaxing activity'
//                     ],
//                     coping_strategies: [
//                         'Mindfulness meditation when feeling anxious',
//                         'Journaling before bed',
//                         'Progressive muscle relaxation'
//                     ],
//                     professional_help: {
//                         needed: false,
//                         urgency: 'consider',
//                         type: 'therapist',
//                         reasoning: 'Mild symptoms that could benefit from professional guidance'
//                     }
//                 }
//             }
//         },
//         '7days': {
//             data: {
//                 overallAssessment: {
//                     averageMood: 6.5,
//                     moodTrend: 'stable',
//                     moodVariability: 'low',
//                     overallRisk: 'low'
//                 },
//                 mentalHealthIndicators: {
//                     depression: { level: 'mild', score: 30 },
//                     anxiety: { level: 'mild', score: 45 },
//                     stress: { level: 'moderate', score: 55 }
//                 },
//                 moodData: {
//                     labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//                     values: [6.0, 6.8, 7.2, 6.5, 6.2, 7.5, 6.0]
//                 },
//                 recommendations: {
//                     immediate_actions: [
//                         'Practice gratitude journaling',
//                         'Connect with a friend or family member',
//                         'Get at least 7 hours of sleep'
//                     ],
//                     weekly_activities: [
//                         'Try a new physical activity',
//                         'Schedule time for hobbies',
//                         'Prepare healthy meals in advance'
//                     ],
//                     coping_strategies: [
//                         'Box breathing technique during stressful moments',
//                         'Scheduled worry time',
//                         'Positive self-talk practice'
//                     ],
//                     professional_help: {
//                         needed: false,
//                         urgency: 'consider',
//                         type: 'counselor',
//                         reasoning: 'Generally good mental health with occasional stress'
//                     }
//                 }
//             }
//         },
//         '30days': {
//             data: {
//                 overallAssessment: {
//                     averageMood: 6.8,
//                     moodTrend: 'improving',
//                     moodVariability: 'moderate',
//                     overallRisk: 'low'
//                 },
//                 mentalHealthIndicators: {
//                     depression: { level: 'minimal', score: 20 },
//                     anxiety: { level: 'moderate', score: 65 },
//                     stress: { level: 'moderate', score: 50 }
//                 },
//                 moodData: {
//                     labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
//                     values: [6.2, 6.5, 7.1, 7.4]
//                 },
//                 recommendations: {
//                     immediate_actions: [
//                         'Practice morning meditation',
//                         'Review and adjust sleep schedule',
//                         'Limit caffeine intake after 2pm'
//                     ],
//                     weekly_activities: [
//                         'Schedule regular digital detox time',
//                         'Join a group activity or class',
//                         'Plan nature time on weekends'
//                     ],
//                     coping_strategies: [
//                         'Cognitive restructuring for anxious thoughts',
//                         'Sensory grounding techniques',
//                         'Scheduled relaxation time'
//                     ],
//                     professional_help: {
//                         needed: true,
//                         urgency: 'soon',
//                         type: 'therapist',
//                         reasoning: 'Persistent anxiety symptoms that could benefit from professional support'
//                     }
//                 }
//             }
//         }
//     },
//     predictions: {
//         short_term_predictions: {
//             next_24_hours: {
//                 mood_forecast: 6.8,
//                 energy_level: 'moderate',
//                 anxiety_likelihood: 'moderate',
//                 recommended_actions: [
//                     'Morning light exposure',
//                     'Balanced breakfast with protein',
//                     'Evening wind-down routine'
//                 ]
//             },
//             next_week: {
//                 mood_trajectory: 'improving',
//                 stress_periods: ['Tuesday afternoon', 'Thursday morning'],
//                 positive_periods: ['Wednesday', 'Weekend'],
//                 preventive_measures: [
//                     'Prepare for Tuesday meetings in advance',
//                     'Schedule breaks during high-stress periods'
//                 ]
//             }
//         }
//     }
// };



// export const MentalHealthDashboard = () => {
//     const [analysisData, setAnalysisData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [selectedTimeframe, setSelectedTimeframe] = useState('30days');

//     useEffect(() => {
//         loadAnalysis();
//     }, [selectedTimeframe]);

//     const loadAnalysis = async () => {
//         setLoading(true);
//         try {
//             // setAnalysisData(mockAnalysisData);
//             const result = await getComprehensiveAnalysis();
//             if (result.success) {
//                 setAnalysisData(result.data);

//                 // Check for crisis indicators
//                 const crisisCheck = checkCrisisIndicators(result.data.analyses['30days'].data);
//                 if (crisisCheck.needs_immediate_support) {
//                     showCrisisAlert(crisisCheck);
//                 }
//             }
//         } catch (error) {
//             Alert.alert('Error', 'Failed to load mental health analysis');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const showCrisisAlert = (crisisInfo) => {
//         Alert.alert(
//             'Support Available',
//             'We noticed some concerning patterns. Please consider reaching out for professional support.',
//             [
//                 { text: 'Crisis Resources', onPress: () => showCrisisResources(crisisInfo) },
//                 { text: 'Later', style: 'cancel' }
//             ]
//         );
//     };

//     if (loading) {
//         return (
//             <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#4A90E2" />
//                 <Text style={styles.loadingText}>Analyzing your mental health patterns...</Text>
//             </View>
//         );
//     }

//     return (
//         <ScrollView style={styles.container}>
//             <Text style={styles.title}>Mental Health Analysis</Text>

//             {/* Timeframe Selector */}
//             <TimeframeSelector
//                 selected={selectedTimeframe}
//                 onSelect={setSelectedTimeframe}
//             />

//             {/* Overview Cards */}
//             <OverviewCards data={analysisData?.analyses[selectedTimeframe]?.data} />

//             {/* Mental Health Indicators */}
//             <MentalHealthIndicators data={analysisData?.analyses[selectedTimeframe]?.data} />

//             {/* Mood Trend Chart */}
//             <MoodTrendChart data={analysisData?.analyses[selectedTimeframe]?.data} />

//             {/* Predictive Insights */}
//             <PredictiveInsights data={analysisData?.predictions} />

//             {/* Recommendations */}
//             <RecommendationsCard data={analysisData?.analyses[selectedTimeframe]?.data} />

//             {/* Professional Help Assessment */}
//             <ProfessionalHelpCard data={analysisData?.analyses[selectedTimeframe]?.data} />
//         </ScrollView>
//     );
// };

// // ===============================
// // 2. TIMEFRAME SELECTOR
// // ===============================

// const TimeframeSelector = ({ selected, onSelect }) => {
//     const timeframes = [
//         { key: '1day', label: '24h' },
//         { key: '7days', label: '7 days' },
//         { key: '30days', label: '30 days' }
//     ];

//     return (
//         <View style={styles.timeframeContainer}>
//             {timeframes.map((timeframe) => (
//                 <TouchableOpacity
//                     key={timeframe.key}
//                     style={[
//                         styles.timeframeButton,
//                         selected === timeframe.key && styles.timeframeButtonActive
//                     ]}
//                     onPress={() => onSelect(timeframe.key)}
//                 >
//                     <Text style={[
//                         styles.timeframeText,
//                         selected === timeframe.key && styles.timeframeTextActive
//                     ]}>
//                         {timeframe.label}
//                     </Text>
//                 </TouchableOpacity>
//             ))}
//         </View>
//     );
// };

// // ===============================
// // 3. OVERVIEW CARDS
// // ===============================

// const OverviewCards = ({ data }) => {
//     if (!data) return null;

//     const cards = [
//         {
//             title: 'Overall Mood',
//             value: data.overallAssessment?.averageMood?.toFixed(1) || 'N/A',
//             subtitle: data.overallAssessment?.moodTrend || 'stable',
//             color: getMoodColor(data.overallAssessment?.averageMood)
//         },
//         {
//             title: 'Risk Level',
//             value: data.overallAssessment?.overallRisk || 'low',
//             subtitle: 'Current assessment',
//             color: getRiskColor(data.overallAssessment?.overallRisk)
//         },
//         {
//             title: 'Mood Stability',
//             value: data.overallAssessment?.moodVariability || 'low',
//             subtitle: 'Variability pattern',
//             color: getStabilityColor(data.overallAssessment?.moodVariability)
//         }
//     ];

//     return (
//         <View style={styles.overviewContainer}>
//             {cards.map((card, index) => (
//                 <View key={index} style={[styles.overviewCard, { borderTopColor: card.color }]}>
//                     <Text style={styles.cardTitle}>{card.title}</Text>
//                     <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
//                     <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
//                 </View>
//             ))}
//         </View>
//     );
// };

// // ===============================
// // 4. MENTAL HEALTH INDICATORS
// // ===============================

// const MentalHealthIndicators = ({ data }) => {
//     if (!data?.mentalHealthIndicators) return null;

//     const indicators = [
//         {
//             name: 'Depression',
//             level: data.mentalHealthIndicators.depression?.level,
//             score: data.mentalHealthIndicators.depression?.score,
//             color: '#FF6B6B'
//         },
//         {
//             name: 'Anxiety',
//             level: data.mentalHealthIndicators.anxiety?.level,
//             score: data.mentalHealthIndicators.anxiety?.score,
//             color: '#FFD93D'
//         },
//         {
//             name: 'Stress',
//             level: data.mentalHealthIndicators.stress?.level,
//             score: data.mentalHealthIndicators.stress?.score,
//             color: '#FF8E53'
//         }
//     ];

//     return (
//         <View style={styles.indicatorsContainer}>
//             <Text style={styles.sectionTitle}>Mental Health Indicators</Text>
//             {indicators.map((indicator, index) => (
//                 <View key={index} style={styles.indicatorRow}>
//                     <View style={styles.indicatorInfo}>
//                         <Text style={styles.indicatorName}>{indicator.name}</Text>
//                         <Text style={styles.indicatorLevel}>{indicator.level}</Text>
//                     </View>
//                     <View style={styles.progressBarContainer}>
//                         <View
//                             style={[
//                                 styles.progressBar,
//                                 {
//                                     width: `${indicator.score || 0}%`,
//                                     backgroundColor: indicator.color
//                                 }
//                             ]}
//                         />
//                     </View>
//                     <Text style={styles.indicatorScore}>{indicator.score || 0}%</Text>
//                 </View>
//             ))}
//         </View>
//     );
// };

// // ===============================
// // 5. MOOD TREND CHART
// // ===============================

// const MoodTrendChart = ({ data }) => {
//     // Mock data for demonstration - replace with actual mood data over time
//     const chartData = {
//         labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
//         datasets: [{
//             data: [6.2, 5.8, 7.1, 6.9],
//             color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
//             strokeWidth: 2
//         }]
//     };

//     return (
//         <View style={styles.chartContainer}>
//             <Text style={styles.sectionTitle}>Mood Trend</Text>
//             <LineChart
//                 data={chartData}
//                 width={width - 40}
//                 height={200}
//                 chartConfig={{
//                     backgroundColor: '#ffffff',
//                     backgroundGradientFrom: '#ffffff',
//                     backgroundGradientTo: '#ffffff',
//                     decimalPlaces: 1,
//                     color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
//                     labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                     style: {
//                         borderRadius: 16
//                     },
//                     propsForDots: {
//                         r: '6',
//                         strokeWidth: '2',
//                         stroke: '#4A90E2'
//                     }
//                 }}
//                 style={{
//                     marginVertical: 8,
//                     borderRadius: 16
//                 }}
//             />
//         </View>
//     );
// };

// // ===============================
// // 6. PREDICTIVE INSIGHTS
// // ===============================

// const PredictiveInsights = ({ data }) => {
//     if (!data) return null;

//     return (
//         <View style={styles.predictiveContainer}>
//             <Text style={styles.sectionTitle}>Predictive Insights</Text>

//             {/* Next 24 Hours */}
//             <View style={styles.predictionCard}>
//                 <Text style={styles.predictionTitle}>Next 24 Hours</Text>
//                 <View style={styles.predictionRow}>
//                     <Text style={styles.predictionLabel}>Mood Forecast:</Text>
//                     <Text style={styles.predictionValue}>
//                         {data.short_term_predictions?.next_24_hours?.mood_forecast}/10
//                     </Text>
//                 </View>
//                 <View style={styles.predictionRow}>
//                     <Text style={styles.predictionLabel}>Energy Level:</Text>
//                     <Text style={styles.predictionValue}>
//                         {data.short_term_predictions?.next_24_hours?.energy_level}
//                     </Text>
//                 </View>
//             </View>

//             {/* Next Week */}
//             <View style={styles.predictionCard}>
//                 <Text style={styles.predictionTitle}>Next Week</Text>
//                 <Text style={styles.predictionText}>
//                     Mood trajectory: {data.short_term_predictions?.next_week?.mood_trajectory}
//                 </Text>
//                 {data.short_term_predictions?.next_week?.recommended_actions?.map((action, index) => (
//                     <Text key={index} style={styles.actionItem}>• {action}</Text>
//                 ))}
//             </View>
//         </View>
//     );
// };

// // ===============================
// // 7. RECOMMENDATIONS CARD
// // ===============================

// const RecommendationsCard = ({ data }) => {
//     if (!data?.recommendations) return null;

//     return (
//         <View style={styles.recommendationsContainer}>
//             <Text style={styles.sectionTitle}>Personalized Recommendations</Text>

//             {/* Immediate Actions */}
//             <View style={styles.recommendationSection}>
//                 <Text style={styles.recommendationTitle}>Today's Actions</Text>
//                 {data.recommendations.immediate_actions?.map((action, index) => (
//                     <TouchableOpacity key={index} style={styles.actionButton}>
//                         <Text style={styles.actionButtonText}>{action}</Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>

//             {/* Weekly Activities */}
//             <View style={styles.recommendationSection}>
//                 <Text style={styles.recommendationTitle}>Weekly Activities</Text>
//                 {data.recommendations.weekly_activities?.map((activity, index) => (
//                     <View key={index} style={styles.activityItem}>
//                         <Text style={styles.activityText}>{activity}</Text>
//                     </View>
//                 ))}
//             </View>

//             {/* Coping Strategies */}
//             <View style={styles.recommendationSection}>
//                 <Text style={styles.recommendationTitle}>Coping Strategies</Text>
//                 {data.recommendations.coping_strategies?.map((strategy, index) => (
//                     <View key={index} style={styles.strategyItem}>
//                         <Text style={styles.strategyText}>{strategy}</Text>
//                     </View>
//                 ))}
//             </View>
//         </View>
//     );
// };

// // ===============================
// // 8. PROFESSIONAL HELP CARD
// // ===============================

// const ProfessionalHelpCard = ({ data }) => {
//     if (!data?.recommendations?.professional_help) return null;

//     const { professional_help } = data.recommendations;

//     const getUrgencyColor = (urgency) => {
//         switch (urgency) {
//             case 'immediate': return '#FF4757';
//             case 'soon': return '#FFA502';
//             case 'consider': return '#2ED573';
//             default: return '#747D8C';
//         }
//     };

//     if (!professional_help.needed) {
//         return (
//             <View style={styles.professionalContainer}>
//                 <Text style={styles.sectionTitle}>Professional Support</Text>
//                 <View style={[styles.professionalCard, { backgroundColor: '#E8F8F5' }]}>
//                     <Text style={styles.professionalText}>
//                         Your current patterns don't indicate immediate need for professional support.
//                         Continue with self-care practices and monitor your wellbeing.
//                     </Text>
//                 </View>
//             </View>
//         );
//     }

//     return (
//         <View style={styles.professionalContainer}>
//             <Text style={styles.sectionTitle}>Professional Support Recommended</Text>
//             <View style={[
//                 styles.professionalCard,
//                 { borderLeftColor: getUrgencyColor(professional_help.urgency) }
//             ]}>
//                 <View style={styles.urgencyBadge}>
//                     <Text style={[
//                         styles.urgencyText,
//                         { color: getUrgencyColor(professional_help.urgency) }
//                     ]}>
//                         {professional_help.urgency.toUpperCase()}
//                     </Text>
//                 </View>

//                 <Text style={styles.professionalType}>
//                     Recommended: {professional_help.type}
//                 </Text>

//                 <Text style={styles.professionalReasoning}>
//                     {professional_help.reasoning}
//                 </Text>

//                 <TouchableOpacity style={styles.findHelpButton}>
//                     <Text style={styles.findHelpButtonText}>Find Professional Help</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.crisisButton}>
//                     <Text style={styles.crisisButtonText}>Crisis Resources</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

// // ===============================
// // 9. ACTIVITY SUGGESTIONS COMPONENT
// // ===============================

// const ActivitySuggestions = ({ data }) => {
//     const [selectedCategory, setSelectedCategory] = useState('immediate');

//     const activities = {
//         immediate: [
//             { title: 'Deep Breathing', duration: '5 min', difficulty: 'Easy' },
//             { title: 'Mindful Walking', duration: '10 min', difficulty: 'Easy' },
//             { title: 'Gratitude Journaling', duration: '15 min', difficulty: 'Easy' },
//             { title: 'Progressive Muscle Relaxation', duration: '20 min', difficulty: 'Medium' }
//         ],
//         daily: [
//             { title: 'Morning Meditation', duration: '15 min', difficulty: 'Easy' },
//             { title: 'Exercise/Yoga', duration: '30 min', difficulty: 'Medium' },
//             { title: 'Social Connection', duration: '30 min', difficulty: 'Easy' },
//             { title: 'Creative Activity', duration: '45 min', difficulty: 'Medium' }
//         ],
//         weekly: [
//             { title: 'Nature Therapy', duration: '2 hours', difficulty: 'Easy' },
//             { title: 'Social Activities', duration: '3 hours', difficulty: 'Medium' },
//             { title: 'New Hobby/Skill', duration: '4 hours', difficulty: 'Hard' },
//             { title: 'Self-Care Day', duration: '6 hours', difficulty: 'Easy' }
//         ]
//     };

//     return (
//         <View style={styles.activitiesContainer}>
//             <Text style={styles.sectionTitle}>Recommended Activities</Text>

//             {/* Category Selector */}
//             <View style={styles.categorySelector}>
//                 {Object.keys(activities).map((category) => (
//                     <TouchableOpacity
//                         key={category}
//                         style={[
//                             styles.categoryButton,
//                             selectedCategory === category && styles.categoryButtonActive
//                         ]}
//                         onPress={() => setSelectedCategory(category)}
//                     >
//                         <Text style={[
//                             styles.categoryButtonText,
//                             selectedCategory === category && styles.categoryButtonTextActive
//                         ]}>
//                             {category.charAt(0).toUpperCase() + category.slice(1)}
//                         </Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>

//             {/* Activity List */}
//             <View style={styles.activityList}>
//                 {activities[selectedCategory].map((activity, index) => (
//                     <TouchableOpacity key={index} style={styles.activityCard}>
//                         <View style={styles.activityHeader}>
//                             <Text style={styles.activityTitle}>{activity.title}</Text>
//                             <View style={styles.activityBadges}>
//                                 <View style={styles.durationBadge}>
//                                     <Text style={styles.badgeText}>{activity.duration}</Text>
//                                 </View>
//                                 <View style={[
//                                     styles.difficultyBadge,
//                                     { backgroundColor: getDifficultyColor(activity.difficulty) }
//                                 ]}>
//                                     <Text style={styles.badgeText}>{activity.difficulty}</Text>
//                                 </View>
//                             </View>
//                         </View>
//                         <TouchableOpacity style={styles.startActivityButton}>
//                             <Text style={styles.startActivityText}>Start Activity</Text>
//                         </TouchableOpacity>
//                     </TouchableOpacity>
//                 ))}
//             </View>
//         </View>
//     );
// };

// // ===============================
// // 10. CRISIS RESOURCES MODAL
// // ===============================

// const showCrisisResources = (crisisInfo) => {
//     Alert.alert(
//         'Immediate Support Available',
//         'If you are in immediate danger, please contact emergency services (911).\n\nFor mental health support:',
//         [
//             {
//                 text: 'Call 988 (Suicide Prevention)',
//                 onPress: () => {
//                     // In a real app, use Linking.openURL('tel:988')
//                 }
//             },
//             {
//                 text: 'Text Crisis Line',
//                 onPress: () => {
//                     // In a real app, use Linking.openURL('sms:741741')
//                 }
//             },
//             {
//                 text: 'Find Local Help',
//                 onPress: () => {
//                     // Navigate to local resources
//                 }
//             },
//             {
//                 text: 'Close',
//                 style: 'cancel'
//             }
//         ]
//     );
// };

// // ===============================
// // 11. HELPER FUNCTIONS
// // ===============================

// const getMoodColor = (mood) => {
//     if (!mood) return '#747D8C';
//     if (mood >= 7) return '#2ED573';
//     if (mood >= 5) return '#FFA502';
//     return '#FF4757';
// };

// const getRiskColor = (risk) => {
//     switch (risk) {
//         case 'low': return '#2ED573';
//         case 'moderate': return '#FFA502';
//         case 'high': return '#FF4757';
//         default: return '#747D8C';
//     }
// };

// const getStabilityColor = (stability) => {
//     switch (stability) {
//         case 'low': return '#2ED573';
//         case 'moderate': return '#FFA502';
//         case 'high': return '#FF4757';
//         default: return '#747D8C';
//     }
// };

// const getDifficultyColor = (difficulty) => {
//     switch (difficulty) {
//         case 'Easy': return '#2ED573';
//         case 'Medium': return '#FFA502';
//         case 'Hard': return '#FF4757';
//         default: return '#747D8C';
//     }
// };

// // ===============================
// // 12. STYLES
// // ===============================

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F8F9FA',
//         padding: 20
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#F8F9FA'
//     },
//     loadingText: {
//         marginTop: 10,
//         fontSize: 16,
//         color: '#747D8C'
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#2C3E50',
//         marginBottom: 20,
//         textAlign: 'center'
//     },

//     // Timeframe Selector
//     timeframeContainer: {
//         flexDirection: 'row',
//         backgroundColor: '#FFFFFF',
//         borderRadius: 12,
//         padding: 4,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3
//     },
//     timeframeButton: {
//         flex: 1,
//         paddingVertical: 10,
//         alignItems: 'center',
//         borderRadius: 8
//     },
//     timeframeButtonActive: {
//         backgroundColor: '#4A90E2'
//     },
//     timeframeText: {
//         fontSize: 14,
//         color: '#747D8C',
//         fontWeight: '500'
//     },
//     timeframeTextActive: {
//         color: '#FFFFFF'
//     },

//     // Overview Cards
//     overviewContainer: {
//         flexDirection: 'row',
//         marginBottom: 20,
//         gap: 10
//     },
//     overviewCard: {
//         flex: 1,
//         backgroundColor: '#FFFFFF',
//         borderRadius: 12,
//         padding: 15,
//         borderTopWidth: 4,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3
//     },
//     cardTitle: {
//         fontSize: 12,
//         color: '#747D8C',
//         marginBottom: 5
//     },
//     cardValue: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         marginBottom: 5
//     },
//     cardSubtitle: {
//         fontSize: 11,
//         color: '#95A5A6'
//     },

//     // Mental Health Indicators
//     indicatorsContainer: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 12,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#2C3E50',
//         marginBottom: 15
//     },
//     indicatorRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 15
//     },
//     indicatorInfo: {
//         width: 80
//     },
//     indicatorName: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#2C3E50'
//     },
//     indicatorLevel: {
//         fontSize: 12,
//         color: '#747D8C',
//         textTransform: 'capitalize'
//     },
//     progressBarContainer: {
//         flex: 1,
//         height: 8,
//         backgroundColor: '#E9ECEF',
//         borderRadius: 4,
//         marginHorizontal: 15
//     },
//     progressBar: {
//         height: '100%',
//         borderRadius: 4
//     },
//     indicatorScore: {
//         fontSize: 12,
//         color: '#747D8C',
//         width: 35,
//         textAlign: 'right'
//     },

//     // Chart Container
//     chartContainer: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 12,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3
//     },

//     // Predictive Insights
//     predictiveContainer: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 12,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3
//     },
//     predictionCard: {
//         backgroundColor: '#F8F9FA',
//         borderRadius: 8,
//         padding: 15,
//         marginBottom: 10
//     },
//     predictionTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#2C3E50',
//         marginBottom: 10
//     },
//     predictionRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 5
//     },
//     predictionLabel: {
//         fontSize: 14,
//         color: '#747D8C'
//     },
//     predictionValue: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#2C3E50'
//     },
//     predictionText: {
//         fontSize: 14,
//         color: '#2C3E50',
//         marginBottom: 10,
//         textTransform: 'capitalize'
//     },
//     actionItem: {
//         fontSize: 13,
//         color: '#747D8C',
//         marginBottom: 3
//     },

//     // Recommendations
//     recommendationsContainer: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 12,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3
//     },
//     recommendationSection: {
//         marginBottom: 20
//     },
//     recommendationTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#2C3E50',
//         marginBottom: 10
//     },
//     actionButton: {
//         backgroundColor: '#E3F2FD',
//         borderRadius: 8,
//         padding: 12,
//         marginBottom: 8,
//         borderLeftWidth: 4,
//         borderLeftColor: '#4A90E2'
//     },
//     actionButtonText: {
//         fontSize: 14,
//         color: '#1976D2',
//         fontWeight: '500'
//     },
//     activityItem: {
//         backgroundColor: '#F3E5F5',
//         borderRadius: 8,
//         padding: 12,
//         marginBottom: 8,
//         borderLeftWidth: 4,
//         borderLeftColor: '#9C27B0'
//     },
//     activityText: {
//         fontSize: 14,
//         color: '#7B1FA2'
//     },
//     strategyItem: {
//         backgroundColor: '#E8F5E8',
//         borderRadius: 8,
//         padding: 12,
//         marginBottom: 8,
//         borderLeftWidth: 4,
//         borderLeftColor: '#4CAF50'
//     },
//     strategyText: {
//         fontSize: 14,
//         color: '#388E3C'
//     },

//     // Professional Help
//     professionalContainer: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 12,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3
//     },
//     professionalCard: {
//         borderRadius: 8,
//         padding: 15,
//         borderLeftWidth: 4
//     },
//     urgencyBadge: {
//         alignSelf: 'flex-start',
//         backgroundColor: '#FFF3E0',
//         borderRadius: 12,
//         paddingHorizontal: 8,
//         paddingVertical: 4,
//         marginBottom: 10
//     },
//     urgencyText: {
//         fontSize: 12,
//         fontWeight: 'bold'
//     },
//     professionalType: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#2C3E50',
//         marginBottom: 10,
//         textTransform: 'capitalize'
//     },
//     professionalReasoning: {
//         fontSize: 14,
//         color: '#747D8C',
//         lineHeight: 20,
//         marginBottom: 15
//     },
//     professionalText: {
//         fontSize: 14,
//         color: '#2C3E50',
//         lineHeight: 20
//     },
//     findHelpButton: {
//         backgroundColor: '#4A90E2',
//         borderRadius: 8,
//         padding: 15,
//         alignItems: 'center',
//         marginBottom: 10
//     },
//     findHelpButtonText: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontWeight: '600'
//     },
//     crisisButton: {
//         backgroundColor: '#FF4757',
//         borderRadius: 8,
//         padding: 15,
//         alignItems: 'center'
//     },
//     crisisButtonText: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontWeight: '600'
//     },

//     // Activity Suggestions
//     activitiesContainer: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 12,
//         padding: 20,
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3
//     },
//     categorySelector: {
//         flexDirection: 'row',
//         backgroundColor: '#F8F9FA',
//         borderRadius: 8,
//         padding: 4,
//         marginBottom: 15
//     },
//     categoryButton: {
//         flex: 1,
//         paddingVertical: 8,
//         alignItems: 'center',
//         borderRadius: 6
//     },
//     categoryButtonActive: {
//         backgroundColor: '#4A90E2'
//     },
//     categoryButtonText: {
//         fontSize: 14,
//         color: '#747D8C'
//     },
//     categoryButtonTextActive: {
//         color: '#FFFFFF',
//         fontWeight: '600'
//     },
//     activityList: {
//         gap: 10
//     },
//     activityCard: {
//         backgroundColor: '#F8F9FA',
//         borderRadius: 8,
//         padding: 15
//     },
//     activityHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         marginBottom: 10
//     },
//     activityTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#2C3E50',
//         flex: 1
//     },
//     activityBadges: {
//         flexDirection: 'row',
//         gap: 5
//     },
//     durationBadge: {
//         backgroundColor: '#E3F2FD',
//         borderRadius: 12,
//         paddingHorizontal: 8,
//         paddingVertical: 4
//     },
//     difficultyBadge: {
//         borderRadius: 12,
//         paddingHorizontal: 8,
//         paddingVertical: 4
//     },
//     badgeText: {
//         fontSize: 12,
//         color: '#FFFFFF',
//         fontWeight: '500'
//     },
//     startActivityButton: {
//         backgroundColor: '#4A90E2',
//         borderRadius: 6,
//         padding: 10,
//         alignItems: 'center'
//     },
//     startActivityText: {
//         color: '#FFFFFF',
//         fontSize: 14,
//         fontWeight: '600'
//     }
// });


// // In your profile/settings component
// import { useAuth } from '@/context/AuthContext';
// import * as SecureStore from 'expo-secure-store';

// const Mood = () => {
//     const { logout, user } = useAuth();
//     const [token, setToken] = useState("")


//     useEffect(() => {

//         (async () => {
//             setToken(await SecureStore.getItemAsync('authToken') || "")
//         })();

//     }, []);

//     const handleLogout = async () => {
//         try {
//             const result = await logout();
//             if (result.success) {
//                 Alert.alert('Success', 'Logged out successfully');
//                 // Will automatically redirect to Auth screen
//             } else {
//                 Alert.alert('Error', result.error);
//             }
//         } catch (error) {
//             Alert.alert('Error', 'Failed to logout');
//         }
//     };

//     return (
//         <>

//             <MentalHealthDashboard />


//         </>
//     );
// };

// export default Mood

import { useAuth } from '@/context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// Mock data as fallback
const mockAnalysisData = {
    analyses: {
        '1day': {
            data: {
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
            }
        },
        '7days': {
            data: {
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
            }
        },
        '30days': {
            data: {
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
        }
    },
    predictions: {
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
    }
};

export const MentalHealthDashboard = () => {
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('30days');
    const [error, setError] = useState(null);
    const [usingMockData, setUsingMockData] = useState(false);

    useEffect(() => {
        loadAnalysis();
    }, [selectedTimeframe]);

    const loadAnalysis = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Loading analysis for timeframe:', selectedTimeframe);

            // Try to get real analysis first
            const result = await getComprehensiveAnalysis();

            if (result.success && result.data) {
                console.log('Analysis loaded successfully');
                setAnalysisData(result.data);
                setUsingMockData(false);

                // Check for crisis indicators
                try {
                    const crisisCheck = checkCrisisIndicators(result.data.analyses['30days']?.data);
                    if (crisisCheck?.needs_immediate_support) {
                        showCrisisAlert(crisisCheck);
                    }
                } catch (crisisError) {
                    console.error('Crisis check failed:', crisisError);
                }
            } else {
                // Use mock data as fallback
                console.warn('Using mock data as fallback. Reason:', result.error);
                setAnalysisData(mockAnalysisData);
                setUsingMockData(true);
                setError(result.error || 'Failed to load analysis');
            }
        } catch (error) {
            console.error('Analysis loading failed:', error);
            setAnalysisData(mockAnalysisData);
            setUsingMockData(true);
            setError(error.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const showCrisisAlert = (crisisInfo) => {
        Alert.alert(
            'Support Available',
            'We noticed some concerning patterns. Please consider reaching out for professional support.',
            [
                { text: 'Crisis Resources', onPress: () => showCrisisResources(crisisInfo) },
                { text: 'Later', style: 'cancel' }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.loadingText}>Analyzing your mental health patterns...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Mental Health Analysis</Text>

            {/* Error/Mock Data Warning */}
            {(error || usingMockData) && (
                <View style={styles.warningContainer}>
                    <Text style={styles.warningText}>
                        {usingMockData ?
                            'Using sample data for demonstration' :
                            `Note: ${error}`
                        }
                    </Text>
                    <TouchableOpacity onPress={loadAnalysis} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Timeframe Selector */}
            <TimeframeSelector
                selected={selectedTimeframe}
                onSelect={setSelectedTimeframe}
            />

            {/* Overview Cards */}
            <OverviewCards data={analysisData?.analyses[selectedTimeframe]?.data} />

            {/* Mental Health Indicators */}
            <MentalHealthIndicators data={analysisData?.analyses[selectedTimeframe]?.data} />

            {/* Mood Trend Chart */}
            <MoodTrendChart
                data={analysisData?.analyses[selectedTimeframe]?.data}
                timeframe={selectedTimeframe}
            />

            {/* Predictive Insights */}
            <PredictiveInsights data={analysisData?.predictions} />

            {/* Recommendations */}
            <RecommendationsCard data={analysisData?.analyses[selectedTimeframe]?.data} />

            {/* Professional Help Assessment */}
            <ProfessionalHelpCard data={analysisData?.analyses[selectedTimeframe]?.data} />
        </ScrollView>
    );
};

// Timeframe Selector Component
const TimeframeSelector = ({ selected, onSelect }) => {
    const timeframes = [
        { key: '1day', label: '24h' },
        { key: '7days', label: '7 days' },
        { key: '30days', label: '30 days' }
    ];

    return (
        <View style={styles.timeframeContainer}>
            {timeframes.map((timeframe) => (
                <TouchableOpacity
                    key={timeframe.key}
                    style={[
                        styles.timeframeButton,
                        selected === timeframe.key && styles.timeframeButtonActive
                    ]}
                    onPress={() => onSelect(timeframe.key)}
                >
                    <Text style={[
                        styles.timeframeText,
                        selected === timeframe.key && styles.timeframeTextActive
                    ]}>
                        {timeframe.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

// Overview Cards Component
const OverviewCards = ({ data }) => {
    if (!data) return null;

    const cards = [
        {
            title: 'Overall Mood',
            value: data.overallAssessment?.averageMood || 'N/A',
            subtitle: data.overallAssessment?.moodTrend || 'stable',
            color: getMoodColor(data.overallAssessment?.averageMood)
        },
        {
            title: 'Risk Level',
            value: data.overallAssessment?.overallRisk || 'low',
            subtitle: 'Current assessment',
            color: getRiskColor(data.overallAssessment?.overallRisk)
        },
        {
            title: 'Mood Stability',
            value: data.overallAssessment?.moodVariability || 'low',
            subtitle: 'Variability pattern',
            color: getStabilityColor(data.overallAssessment?.moodVariability)
        }
    ];

    return (
        <View style={styles.overviewContainer}>
            {cards.map((card, index) => (
                <View key={index} style={[styles.overviewCard, { borderTopColor: card.color }]}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
                    <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                </View>
            ))}
        </View>
    );
};

// Mental Health Indicators Component
const MentalHealthIndicators = ({ data }) => {
    if (!data?.mentalHealthIndicators) return null;

    const indicators = [
        {
            name: 'Depression',
            level: data.mentalHealthIndicators.depression?.level,
            score: data.mentalHealthIndicators.depression?.score,
            color: '#FF6B6B'
        },
        {
            name: 'Anxiety',
            level: data.mentalHealthIndicators.anxiety?.level,
            score: data.mentalHealthIndicators.anxiety?.score,
            color: '#FFD93D'
        },
        {
            name: 'Stress',
            level: data.mentalHealthIndicators.stress?.level,
            score: data.mentalHealthIndicators.stress?.score,
            color: '#FF8E53'
        }
    ];

    return (
        <View style={styles.indicatorsContainer}>
            <Text style={styles.sectionTitle}>Mental Health Indicators</Text>
            {indicators.map((indicator, index) => (
                <View key={index} style={styles.indicatorRow}>
                    <View style={styles.indicatorInfo}>
                        <Text style={styles.indicatorName}>{indicator.name}</Text>
                        <Text style={styles.indicatorLevel}>
                            {indicator.level || 'Not assessed'}
                        </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBar,
                                {
                                    width: `${indicator.score || 0}%`,
                                    backgroundColor: indicator.color
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.indicatorScore}>{indicator.score || 0}%</Text>
                </View>
            ))}
        </View>
    );
};

// Mood Trend Chart Component
const MoodTrendChart = ({ data, timeframe }) => {
    // Generate chart data based on timeframe
    const getChartData = () => {
        if (timeframe === '1day') {
            return {
                labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
                datasets: [{
                    data: [5.2, 6.1, 7.3, 6.8, 6.5, 6.2],
                    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                    strokeWidth: 2
                }]
            };
        } else if (timeframe === '7days') {
            return {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    data: [6.0, 6.8, 7.2, 6.5, 6.2, 7.5, 6.0],
                    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                    strokeWidth: 2
                }]
            };
        } else {
            return {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    data: [6.2, 6.5, 7.1, 7.4],
                    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                    strokeWidth: 2
                }]
            };
        }
    };

    const chartData = getChartData();

    return (
        <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Mood Trend</Text>
            <LineChart
                data={chartData}
                width={width - 40}
                height={200}
                chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: '#4A90E2'
                    }
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16
                }}
            />
        </View>
    );
};

// Predictive Insights Component
const PredictiveInsights = ({ data }) => {
    if (!data?.short_term_predictions) return null;

    return (
        <View style={styles.predictiveContainer}>
            <Text style={styles.sectionTitle}>Predictive Insights</Text>

            {/* Next 24 Hours */}
            {data.short_term_predictions?.next_24_hours && (
                <View style={styles.predictionCard}>
                    <Text style={styles.predictionTitle}>Next 24 Hours</Text>
                    <View style={styles.predictionRow}>
                        <Text style={styles.predictionLabel}>Mood Forecast:</Text>
                        <Text style={styles.predictionValue}>
                            {data.short_term_predictions.next_24_hours.mood_forecast}/10
                        </Text>
                    </View>
                    <View style={styles.predictionRow}>
                        <Text style={styles.predictionLabel}>Energy Level:</Text>
                        <Text style={styles.predictionValue}>
                            {data.short_term_predictions.next_24_hours.energy_level}
                        </Text>
                    </View>
                </View>
            )}

            {/* Next Week */}
            {data.short_term_predictions?.next_week && (
                <View style={styles.predictionCard}>
                    <Text style={styles.predictionTitle}>Next Week</Text>
                    <Text style={styles.predictionText}>
                        Mood trajectory: {data.short_term_predictions.next_week.mood_trajectory}
                    </Text>
                    {data.short_term_predictions.next_week.recommended_actions?.map((action, index) => (
                        <Text key={index} style={styles.actionItem}>• {action}</Text>
                    ))}
                </View>
            )}
        </View>
    );
};

// Recommendations Card Component
const RecommendationsCard = ({ data }) => {
    if (!data?.recommendations) return null;

    return (
        <View style={styles.recommendationsContainer}>
            <Text style={styles.sectionTitle}>Personalized Recommendations</Text>

            {/* Immediate Actions */}
            {data.recommendations.immediate_actions && (
                <View style={styles.recommendationSection}>
                    <Text style={styles.recommendationTitle}>Today's Actions</Text>
                    {data.recommendations.immediate_actions.map((action, index) => (
                        <TouchableOpacity key={index} style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>{action}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Weekly Activities */}
            {data.recommendations.weekly_activities && (
                <View style={styles.recommendationSection}>
                    <Text style={styles.recommendationTitle}>Weekly Activities</Text>
                    {data.recommendations.weekly_activities.map((activity, index) => (
                        <View key={index} style={styles.activityItem}>
                            <Text style={styles.activityText}>{activity}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Coping Strategies */}
            {data.recommendations.coping_strategies && (
                <View style={styles.recommendationSection}>
                    <Text style={styles.recommendationTitle}>Coping Strategies</Text>
                    {data.recommendations.coping_strategies.map((strategy, index) => (
                        <View key={index} style={styles.strategyItem}>
                            <Text style={styles.strategyText}>{strategy}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

// Professional Help Card Component
const ProfessionalHelpCard = ({ data }) => {
    if (!data?.recommendations?.professional_help) return null;

    const { professional_help } = data.recommendations;

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'immediate': return '#FF4757';
            case 'soon': return '#FFA502';
            case 'consider': return '#2ED573';
            default: return '#747D8C';
        }
    };

    if (!professional_help.needed) {
        return (
            <View style={styles.professionalContainer}>
                <Text style={styles.sectionTitle}>Professional Support</Text>
                <View style={[styles.professionalCard, { backgroundColor: '#E8F8F5' }]}>
                    <Text style={styles.professionalText}>
                        Your current patterns don't indicate immediate need for professional support.
                        Continue with self-care practices and monitor your wellbeing.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.professionalContainer}>
            <Text style={styles.sectionTitle}>Professional Support Recommended</Text>
            <View style={[
                styles.professionalCard,
                { borderLeftColor: getUrgencyColor(professional_help.urgency) }
            ]}>
                <View style={styles.urgencyBadge}>
                    <Text style={[
                        styles.urgencyText,
                        { color: getUrgencyColor(professional_help.urgency) }
                    ]}>
                        {professional_help.urgency?.toUpperCase() || 'CONSIDER'}
                    </Text>
                </View>

                <Text style={styles.professionalType}>
                    Recommended: {professional_help.type || 'Mental health professional'}
                </Text>

                <Text style={styles.professionalReasoning}>
                    {professional_help.reasoning || 'Professional guidance may be beneficial'}
                </Text>

                <TouchableOpacity style={styles.findHelpButton}>
                    <Text style={styles.findHelpButtonText}>Find Professional Help</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.crisisButton}>
                    <Text style={styles.crisisButtonText}>Crisis Resources</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Crisis Resources Modal
const showCrisisResources = (crisisInfo) => {
    Alert.alert(
        'Immediate Support Available',
        'If you are in immediate danger, please contact emergency services (911).\n\nFor mental health support:',
        [
            {
                text: 'Call 988 (Suicide Prevention)',
                onPress: () => {
                    console.log('Opening crisis hotline...');
                }
            },
            {
                text: 'Text Crisis Line',
                onPress: () => {
                    console.log('Opening text crisis line...');
                }
            },
            {
                text: 'Find Local Help',
                onPress: () => {
                    console.log('Finding local resources...');
                }
            },
            {
                text: 'Close',
                style: 'cancel'
            }
        ]
    );
};

// Helper Functions
const getMoodColor = (mood) => {
    if (!mood) return '#747D8C';
    if (mood >= 7) return '#2ED573';
    if (mood >= 5) return '#FFA502';
    return '#FF4757';
};

const getRiskColor = (risk) => {
    switch (risk) {
        case 'low': return '#2ED573';
        case 'moderate': return '#FFA502';
        case 'high': return '#FF4757';
        default: return '#747D8C';
    }
};

const getStabilityColor = (stability) => {
    switch (stability) {
        case 'low': return '#2ED573';
        case 'moderate': return '#FFA502';
        case 'high': return '#FF4757';
        default: return '#747D8C';
    }
};

// Main Mood Component
const Mood = () => {
    const { logout, user } = useAuth();
    const [token, setToken] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const authToken = await SecureStore.getItemAsync('authToken');
                setToken(authToken || "");
            } catch (error) {
                console.error('Error getting auth token:', error);
            }
        })();
    }, []);

    const handleLogout = async () => {
        try {
            const result = await logout();
            if (result.success) {
                Alert.alert('Success', 'Logged out successfully');
            } else {
                Alert.alert('Error', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to logout');
        }
    };

    return (
        <MentalHealthDashboard />
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        padding: 20
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#747D8C'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 20,
        textAlign: 'center'
    },
    warningContainer: {
        backgroundColor: '#FFF3CD',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        color: '#856404'
    },
    retryButton: {
        backgroundColor: '#FFC107',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginLeft: 10
    },
    retryButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#212529'
    },

    // Timeframe Selector
    timeframeContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    timeframeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8
    },
    timeframeButtonActive: {
        backgroundColor: '#4A90E2'
    },
    timeframeText: {
        fontSize: 14,
        color: '#747D8C',
        fontWeight: '500'
    },
    timeframeTextActive: {
        color: '#FFFFFF'
    },

    // Overview Cards
    overviewContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10
    },
    overviewCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        borderTopWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    cardTitle: {
        fontSize: 12,
        color: '#747D8C',
        marginBottom: 5
    },
    cardValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5
    },
    cardSubtitle: {
        fontSize: 11,
        color: '#95A5A6'
    },

    // Mental Health Indicators
    indicatorsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 15
    },
    indicatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    indicatorInfo: {
        width: 80
    },
    indicatorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C3E50'
    },
    indicatorLevel: {
        fontSize: 12,
        color: '#747D8C',
        textTransform: 'capitalize'
    },
    progressBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#E9ECEF',
        borderRadius: 4,
        marginHorizontal: 15
    },
    progressBar: {
        height: '100%',
        borderRadius: 4
    },
    indicatorScore: {
        fontSize: 12,
        color: '#747D8C',
        width: 35,
        textAlign: 'right'
    },

    // Chart Container
    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },

    // Predictive Insights
    predictiveContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    predictionCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10
    },
    predictionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 10
    },
    predictionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
    },
    predictionLabel: {
        fontSize: 14,
        color: '#747D8C'
    },
    predictionValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C3E50'
    },
    predictionText: {
        fontSize: 14,
        color: '#2C3E50',
        marginBottom: 10,
        textTransform: 'capitalize'
    },
    actionItem: {
        fontSize: 13,
        color: '#747D8C',
        marginBottom: 3
    },

    // Recommendations
    recommendationsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    recommendationSection: {
        marginBottom: 20
    },
    recommendationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 10
    },
    actionButton: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4A90E2'
    },
    actionButtonText: {
        fontSize: 14,
        color: '#1976D2',
        fontWeight: '500'
    },
    activityItem: {
        backgroundColor: '#F3E5F5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#9C27B0'
    },
    activityText: {
        fontSize: 14,
        color: '#7B1FA2'
    },
    strategyItem: {
        backgroundColor: '#E8F5E8',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50'
    },
    strategyText: {
        fontSize: 14,
        color: '#388E3C'
    },

    // Professional Help
    professionalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    professionalCard: {
        borderRadius: 8,
        padding: 15,
        borderLeftWidth: 4
    },
    urgencyBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 10
    },
    urgencyText: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    professionalType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 10,
        textTransform: 'capitalize'
    },
    professionalReasoning: {
        fontSize: 14,
        color: '#747D8C',
        lineHeight: 20,
        marginBottom: 15
    },
    professionalText: {
        fontSize: 14,
        color: '#2C3E50',
        lineHeight: 20
    },
    findHelpButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10
    },
    findHelpButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600'
    },
    crisisButton: {
        backgroundColor: '#FF4757',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center'
    },
    crisisButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600'
    }
});

export default Mood;