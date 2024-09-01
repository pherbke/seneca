// web/pages/demos/[demo].tsx
import { useRouter } from 'next/router';
import React from 'react';

const DemoDetail: React.FC = () => {
    const router = useRouter();
    const { demo } = router.query;

    const demoData = {
        demo,
        title: `Demo ${demo}`,
        description: `This is a detailed explanation of the Demo ${demo}.`,
        link: `/path-to-demo-${demo}`,
    };

    return (
            <div>
                <h1>{demoData.title}</h1>
                <p>{demoData.description}</p>
                <a href={demoData.link} target="_blank" rel="noopener noreferrer">
                    Access Demo
                </a>
            </div>
    );
};

export default DemoDetail;