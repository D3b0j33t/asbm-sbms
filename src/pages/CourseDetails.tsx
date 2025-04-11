
import React from 'react';
import { useParams } from 'react-router-dom';

const CourseDetails = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Course Details</h1>
      <p>Viewing details for course ID: {id}</p>
      <p>Course details page content will be implemented soon.</p>
    </div>
  );
};

export default CourseDetails;
