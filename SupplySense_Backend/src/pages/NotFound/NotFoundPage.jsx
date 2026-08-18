import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';

import { FiAlertOctagon, FiHome } from 'react-icons/fi';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon">
          <FiAlertOctagon size={48} />
        </div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Route Vector Not Found</h2>
        <p className="not-found-desc">
          The requested SupplySense telemetry endpoint or page coordinate does not exist.
        </p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          <FiHome size={16} /> Return to Executive Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
