import TakeData from '@/components/Takedata';
import React from 'react';

interface PurposeProps {
    onPurposeSubmit?: (purpose: string) => void;
}

const Purpose: React.FC<PurposeProps> = ({ onPurposeSubmit }) => {
    const handleSubmit = (value: string) => {
        console.log('Purpose submitted:', value);

        // Save purpose to your preferred storage/state management
        // Examples:
        // - AsyncStorage.setItem('userPurpose', value);
        // - dispatch(setPurpose(value));
        // - saveToAPI(value);

        if (onPurposeSubmit) {
            onPurposeSubmit(value);
        }

        // You might want to navigate to next screen or show success message
        // navigation.navigate('About') or showSuccessToast()
    };

    return (
        <TakeData
            title="What's your deeper purpose?"
            description="Understanding your core purpose helps the AI provide more meaningful insights and suggestions that align with what truly matters to you in life."
            inputPlaceholder="My purpose is to inspire others through storytelling and creativity. I want to make a positive impact by sharing experiences that help people feel less alone and more connected to their own potential..."
            handleSubmit={handleSubmit}
            buttonText="Define My Purpose"
            multiline={true}
            maxLength={350}
        />
    );
};

export default Purpose;