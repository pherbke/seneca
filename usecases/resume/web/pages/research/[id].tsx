// pages/research/[id].tsx
import { useRouter } from 'next/router';
import React from 'react';

const ProjectDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // For now, we'll use a placeholder for the project data
  const projectData = {
    id,
    title: `Project ${id}`,
    description: `This is a detailed description for Project ${id}.`,
  };

  return (
    <div>
      <h1>{projectData.title}</h1>
      <p>{projectData.description}</p>
    </div>
  );
};

export default ProjectDetail;
