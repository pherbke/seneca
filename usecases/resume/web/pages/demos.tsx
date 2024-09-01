import Link from 'next/link';
import React from 'react';

const demos = [
    { id: 'resume-credential', title: 'Resume Credential Demo' },
    { id: 'issuer', title: 'Credential Issuer Demo' },
    { id: 'blockchain-education', title: 'Blockchain for Education Demo' },
];

const Demos: React.FC = () => {
    return (
        <div>
            <h1>Demos</h1>
            <ul>
                {demos.map((demo) => (
                    <li key={demo.id}>
                        <Link href={`/demos/${demo.id}`}>
                            {demo.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Demos;