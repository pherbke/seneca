import Link from 'next/link';
import React from 'react';

const projects = [
    { id: '1', title: 'Decentralized Identifiers' },
    { id: '2', title: 'Verifiable Credentials' },
    { id: '3', title: 'Blockchain for Education' },
];

const Research: React.FC = () => {
    return (
        <div className="main">
            <h1>Research Projects</h1>
            <div className="project-grid">
                {projects.map((project) => (
                    <div key={project.id} className="project-card">
                        <Link href={`/research/${project.id}`}>
                            <h2>{project.title}</h2>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Research;