import React from 'react';
import { usePage } from '@inertiajs/react';

const Error500 = () => {
  const { url } = usePage().props;

  return (
    <div>
      <h1>500 Internal Server Error</h1>
      <p>Requested URL: {url}</p>
      {/* Add your custom design elements */}
    </div>
  );
};

export default Error500;