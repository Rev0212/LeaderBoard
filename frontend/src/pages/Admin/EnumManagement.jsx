import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import EnumConfigPage from './EnumConfigPage';
import PointsConfigPage from './PointsConfigPage';

const EnumManagement = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = ["Categories", "Event Scopes", "Position Types", "Category Rules", "Form Fields"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configuration Management</h1>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          {tabs.map((tab, index) => (
            <Tab label={tab} id={`tab-${index}`} key={index} />
          ))}
        </Tabs>
      </Box>

      <div className="mt-4">
        {activeTab === 0 && <EnumConfigPage />}
        {activeTab === 1 && <PointsConfigPage />}
      </div>
    </div>
  );
};

export default EnumManagement;