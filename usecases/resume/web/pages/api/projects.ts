// pages/api/projects.ts
import { NextApiRequest, NextApiResponse } from 'next';

const projects = [
    { id: '1', title: 'Decentralized Identifiers' },
    { id: '2', title: 'Verifiable Credentials' },
    { id: '3', title: 'Blockchain for Education' },
];

export default (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json(projects);
};