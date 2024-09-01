// pages/api/demos.ts
import { NextApiRequest, NextApiResponse } from 'next';

const demos = [
    { id: 'resume-credential', title: 'Resume Credential Demo' },
    { id: 'issuer', title: 'Credential Issuer Demo' },
    { id: 'blockchain-education', title: 'Blockchain for Education Demo' },
];

export default (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json(demos);
};