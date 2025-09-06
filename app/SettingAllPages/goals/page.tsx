import TakeData from '@/components/Takedata';
import React from 'react';

interface GoalsProps {
    onGoalsSubmit?: (goals: string) => void;
}

const Goals: React.FC<GoalsProps> = ({ onGoalsSubmit }) => {
    const handleSubmit = (value: string) => {
        console.log('Goals submitted:', value);

        // Save goals to your preferred storage/state management
        // Examples:
        // - AsyncStorage.setItem('userGoals', value);
        // - dispatch(setGoals(value));
        // - saveToAPI(value);

        if (onGoalsSubmit) {
            onGoalsSubmit(value);
        }

        // You might want to navigate to next screen or show success message
        // navigation.navigate('Purpose') or showSuccessToast()
    };

    return (
        <TakeData
            title="What do you want to achieve?"
            description="Share your goals to help AI diary create personalized recaps that track your progress and keep you motivated. Be specific about what success looks like to you."
            inputPlaceholder="I want to become a successful writer by publishing my first novel within the next year. I also want to improve my physical health by exercising regularly and eating mindfully..."
            handleSubmit={handleSubmit}
            buttonText="Set My Goals"
            multiline={true}
            maxLength={400}
        />
    );
};

export default Goals;