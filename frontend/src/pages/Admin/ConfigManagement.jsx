import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import EnumConfigPage from './EnumConfigPage';
import PointsConfigPage from './PointsConfigPage';
import CategoryRulesConfig from '../../components/admin/CategoryRulesConfig';
import FormFieldsConfig from '../../components/admin/FormFieldsConfig';

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
          <Tab label="Category Management" id="tab-0" />
          <Tab label="Position Points" id="tab-1" />
          <Tab label="Category Rules" id="tab-2" />
          <Tab label="Form Fields" id="tab-3" />
        </Tabs>
      </Box>

      <div className="mt-4">
        {activeTab === 0 && <EnumConfigPage />}
        {activeTab === 1 && <PointsConfigPage />}
        {activeTab === 2 && <CategoryRulesConfig />}
        {activeTab === 3 && <FormFieldsConfig />}
      </div>
    </div>
  );
};

export default ConfigManagement;