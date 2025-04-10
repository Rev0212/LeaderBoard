import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box, Button, CircularProgress, TextField, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from '@mui/material';
import { Save, AlertTriangle, Info, TrendingUp } from 'lucide-react';

const PointsConfigPage = () => {
  const [currentConfig, setCurrentConfig] = useState({});
  const [editedConfig, setEditedConfig] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [impactData, setImpactData] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [positionOptions, setPositionOptions] = useState([]);

  useEffect(() => {
    fetchPositionOptions();
    fetchCurrentConfig();
  }, []);

  const fetchPositionOptions = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin/config/type/positionSecured`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setPositionOptions(response.data.data.values || []);
      }
    } catch (error) {
      console.error("Failed to fetch position options:", error);
    }
  };

  const fetchCurrentConfig = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin-token");
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin/config/points`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.data) {
        // Convert from Map to regular object if needed
        const config = response.data.data.configuration || {};
        setCurrentConfig(config);
        setEditedConfig({...config});
      } else {
        // Initialize with empty config
        setCurrentConfig({});
        setEditedConfig({});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error');
      toast.error('Failed to load points configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePointChange = (position, value) => {
    const numValue = parseInt(value) || 0;
    setEditedConfig({
      ...editedConfig,
      [position]: numValue
    });
  };

  const calculateImpact = async () => {
    setImpactLoading(true);
    try {
      const token = localStorage.getItem("admin-token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/config/points/impact-analysis`,
        { configuration: editedConfig },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setImpactData(response.data.data);
        setShowPreview(true);
      } else {
        toast.error('Failed to calculate impact');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to calculate impact');
    } finally {
      setImpactLoading(false);
    }
  };

  const saveChanges = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem("admin-token");
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/admin/config/points`,
        { 
          configuration: editedConfig,
          configType: 'positionPoints',
          notes: 'Updated via admin interface'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setCurrentConfig({...editedConfig});
        setSuccess('Points configuration updated successfully');
        toast.success('Points configuration updated successfully');
      } else {
        setError(response.data.message);
        toast.error(response.data.message);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update points configuration';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
      setShowPreview(false);
    }
  };

  // Check if there are changes
  const hasChanges = () => {
    if (!currentConfig || Object.keys(currentConfig).length === 0) return true;
    
    return Object.keys(editedConfig).some(key => 
      editedConfig[key] !== currentConfig[key]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Position Points Configuration</h2>
        <Button
          variant="outlined"
          color="primary"
          onClick={calculateImpact}
          startIcon={<TrendingUp size={16} />}
          disabled={isLoading || impactLoading || !hasChanges()}
        >
          Preview Impact
        </Button>
      </div>
      
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" className="mb-4" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      {!isLoading ? (
        <TableContainer component={Paper} className="mb-6">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Position</TableCell>
                <TableCell align="right">Points</TableCell>
                <TableCell align="right">Change</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {positionOptions.map((position) => (
                <TableRow key={position}>
                  <TableCell component="th" scope="row">
                    {position}
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      variant="outlined"
                      size="small"
                      value={editedConfig[position] || 0}
                      onChange={(e) => handlePointChange(position, e.target.value)}
                      InputProps={{
                        inputProps: { min: 0, max: 1000 }
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {currentConfig[position] !== editedConfig[position] && (
                      <div className={`text-sm ${(editedConfig[position] || 0) > (currentConfig[position] || 0) ? 'text-green-600' : 'text-red-600'}`}>
                        {(editedConfig[position] || 0) > (currentConfig[position] || 0) ? '+' : ''}
                        {(editedConfig[position] || 0) - (currentConfig[position] || 0)}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <div className="flex justify-center my-8">
          <CircularProgress />
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
        <div className="flex items-start">
          <Info size={20} className="text-blue-500 mt-1 mr-2" />
          <div>
            <p className="text-blue-800 font-medium">Important Note</p>
            <p className="text-blue-700 text-sm">
              Changing point values will automatically update all existing events and recalculate student point totals. 
              Use the Preview Impact button to see how these changes will affect your data.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="contained"
          color="primary"
          onClick={saveChanges}
          disabled={isLoading || !hasChanges()}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      
      {/* Impact Preview Dialog */}
      <Dialog 
        open={showPreview} 
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className="flex items-center">
            <AlertTriangle size={24} className="text-amber-500 mr-2" />
            Point Change Impact Preview
          </div>
        </DialogTitle>
        <DialogContent>
          {impactLoading ? (
            <div className="flex justify-center my-8">
              <CircularProgress />
            </div>
          ) : impactData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Typography variant="h6" className="text-xl font-bold text-blue-900">
                    {impactData.totalEventsAffected}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Events Affected
                  </Typography>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Typography variant="h6" className="text-xl font-bold text-blue-900">
                    {impactData.totalStudentsAffected}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Students Affected
                  </Typography>
                </div>
                <div className={`p-4 rounded-lg ${impactData.totalPointsChange >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <Typography 
                    variant="h6" 
                    className={`text-xl font-bold ${impactData.totalPointsChange >= 0 ? 'text-green-700' : 'text-red-700'}`}
                  >
                    {impactData.totalPointsChange >= 0 ? '+' : ''}{impactData.totalPointsChange}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Points Change
                  </Typography>
                </div>
              </div>

              <div>
                <Typography variant="subtitle1" className="font-semibold mb-2">
                  Student Impact
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <Typography variant="h6" className="font-bold text-green-700">
                      +{impactData.studentsGainingPoints}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Students gaining points
                    </Typography>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <Typography variant="h6" className="font-bold text-red-700">
                      {impactData.studentsLosingPoints}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Students losing points
                    </Typography>
                  </div>
                </div>
              </div>

              {impactData.positionImpacts && Object.keys(impactData.positionImpacts).length > 0 && (
                <div>
                  <Typography variant="subtitle1" className="font-semibold mb-2">
                    Position Impacts
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Position</TableCell>
                          <TableCell align="right">Events</TableCell>
                          <TableCell align="right">Old Points</TableCell>
                          <TableCell align="right">New Points</TableCell>
                          <TableCell align="right">Total Change</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(impactData.positionImpacts).map(([position, data]) => (
                          <TableRow key={position}>
                            <TableCell component="th" scope="row">
                              {position}
                            </TableCell>
                            <TableCell align="right">{data.eventCount}</TableCell>
                            <TableCell align="right">{data.oldAvgPointValue}</TableCell>
                            <TableCell align="right">{data.newPointValue}</TableCell>
                            <TableCell align="right">
                              <span className={data.totalPointChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {data.totalPointChange >= 0 ? '+' : ''}{data.totalPointChange}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              )}

              {impactData.mostImpactedStudents?.length > 0 && (
                <div>
                  <Typography variant="subtitle1" className="font-semibold mb-2">
                    Most Impacted Students
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Register No</TableCell>
                          <TableCell align="right">Events</TableCell>
                          <TableCell align="right">Points Change</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {impactData.mostImpactedStudents.slice(0, 5).map((student) => (
                          <TableRow key={student.studentId}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.registerNo}</TableCell>
                            <TableCell align="right">{student.eventCount}</TableCell>
                            <TableCell align="right">
                              <span className={student.pointsDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {student.pointsDifference >= 0 ? '+' : ''}{student.pointsDifference}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowPreview(false)} 
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={saveChanges} 
            color="primary" 
            variant="contained"
            disabled={isLoading}
          >
            Apply Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PointsConfigPage;