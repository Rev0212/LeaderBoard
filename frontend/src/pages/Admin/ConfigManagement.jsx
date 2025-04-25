import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import FormFieldsConfig from '../../components/admin/FormFieldsConfig';
import CategoryPointsConfig from '../../components/admin/CategoryPointsConfig';

const ConfigManagement = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configuration Management</h1>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Category Form Fields Configuration" id="tab-0" />
          <Tab label="Category Points Configuration" id="tab-1" />
        </Tabs>
      </Box>

      <div className="mt-4">
        {activeTab === 0 && <FormFieldsConfig />}
        {activeTab === 1 && <CategoryPointsConfig />}
      </div>
    </div>
  );
};

export default ConfigManagement;