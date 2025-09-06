import TakeData from '@/components/Takedata';
import React from 'react';

interface AboutProps {
    onAboutSubmit?: (about: string) => void;
}

const About: React.FC<AboutProps> = ({ onAboutSubmit }) => {
    const handleSubmit = (value: string) => {
        console.log('About submitted:', value);

        // Save about info to your preferred storage/state management
        // Examples:
        // - AsyncStorage.setItem('userAbout', value);
        // - dispatch(setAbout(value));
        // - saveToAPI(value);

        if (onAboutSubmit) {
            onAboutSubmit(value);
        }

        // You might want to navigate to next screen or show success message
        // navigation.navigate('Dashboard') or showSuccessToast()
    };

    return (
        <TakeData
            title="Tell us about yourself"
            description="Share your background, interests, and what makes you unique. This helps the AI understand your personality and provide more personalized diary insights and reflections."
            inputPlaceholder="I'm a creative person who loves reading, hiking, and learning new things. I value deep conversations and meaningful connections. I'm currently working in tech but have always been passionate about writing and art..."
            handleSubmit={handleSubmit}
            buttonText="Complete Profile"
            multiline={true}
            maxLength={450}
        />
    );
};

export default About;