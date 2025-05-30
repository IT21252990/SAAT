import React, { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import { HiX, HiCheck, HiExclamation, HiInformationCircle, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useToast } from "../../contexts/ToastContext";

const MarkingPanel = ({ isOpen, onClose, submissionData, assignmentId }) => {
  const [marks, setMarks] = useState({});
  const [markingScheme, setMarkingScheme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCriteria, setExpandedCriteria] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [existingMarks, setExistingMarks] = useState({});
  const {showToast} = useToast();

  // Fetch marking scheme when panel opens
  useEffect(() => {
    if (isOpen && assignmentId) {
      fetchMarkingScheme();

      if (submissionData?.id) {
      fetchExistingMarks();
    }
      // Reset save success state when panel opens
      setSaveSuccess(false);
    }
  }, [isOpen, assignmentId, submissionData?.id]);

  const fetchMarkingScheme = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/marking-scheme/markingScheme/${assignmentId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch marking scheme');
      }
      
      const data = await response.json();
      
      // Fix: Extract the first marking scheme from the array
      const markingSchemeData = data.marking_schemes && data.marking_schemes.length > 0 
        ? data.marking_schemes[0] 
        : null;
      
      if (!markingSchemeData) {
        throw new Error('No marking scheme found in response');
      }
      
      setMarkingScheme(markingSchemeData);
      
      // Initialize marks state based on viva criteria and existing marks
      if (markingSchemeData.criteria?.viva) {
        const initialMarks = {};
        markingSchemeData.criteria.viva.forEach((criterion, index) => {
          const criterionKey = `viva_${index}`;
          // Check if we have existing marks for this criterion, otherwise assign 0
          const existingMark = existingMarks[criterion.criterion];
          initialMarks[criterionKey] = existingMark !== undefined ? existingMark.toString() : '0';
        });
        setMarks(initialMarks);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching marking scheme:', err);
    } finally {
      setLoading(false);
    }
  };    

  // useEffect to update marks when existingMarks changes
  useEffect(() => {
    if (markingScheme?.criteria?.viva && Object.keys(existingMarks).length >= 0) {
      const updatedMarks = {};
      markingScheme.criteria.viva.forEach((criterion, index) => {
        const criterionKey = `viva_${index}`;
        const existingMark = existingMarks[criterion.criterion];
        // If no existing mark found, assign 0 as default
        updatedMarks[criterionKey] = existingMark !== undefined ? existingMark.toString() : '0';
      });
      setMarks(updatedMarks);
    }
  }, [existingMarks, markingScheme]);

  const fetchExistingMarks = async () => {
    if (!submissionData?.id) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/marks/get-viva-marks/${submissionData.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setExistingMarks(data.viva || {});
      } else if (response.status === 404) {
        // No existing marks found - assign them to 0
        setExistingMarks({});
        console.log('No existing marks found for submission - will assign 0 as default');
      } else {
        console.error('Error fetching existing marks:', response.status);
      }
    } catch (err) {
      console.error('Error fetching existing marks:', err);
      // Don't set error state as this is optional data
    }
  };

  // Get viva criteria from marking scheme
  const getVivaCriteria = () => {
    if (!markingScheme?.criteria?.viva) return [];
    
    return markingScheme.criteria.viva.map((criterion, index) => ({
      id: `viva_${index}`,
      title: criterion.criterion,
      description: `Low: ${criterion.low_description} | Medium: ${criterion.medium_description} | High: ${criterion.high_description}`,
      weightage: criterion.weightage,
      maxMarks: criterion.weightage, // Individual criterion max is its weightage
      lowDesc: criterion.low_description,
      mediumDesc: criterion.medium_description,
      highDesc: criterion.high_description
    }));
  };

  const handleMarkChange = (criteriaId, value) => {
    setMarks(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };

  const toggleCriteriaExpansion = (criteriaId) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [criteriaId]: !prev[criteriaId]
    }));
  };

  // Calculate total marks out of 100
  const calculateTotalMarks = () => {
    const vivaCriteria = getVivaCriteria();
    return vivaCriteria.reduce((total, criterion) => {
      const mark = parseFloat(marks[criterion.id]) || 0;
      return total + mark; // Direct sum since each criterion is already weighted
    }, 0);
  };

  // Calculate the total possible marks (sum of all weightages = 100)
  const calculateMaxMarks = () => {
    const vivaCriteria = getVivaCriteria();
    return vivaCriteria.reduce((total, criterion) => {
      return total + criterion.weightage;
    }, 0);
  };

  // Get individual criterion contribution (same as the mark since it's already weighted)
  const getCriterionContribution = (criterionId) => {
    return parseFloat(marks[criterionId]) || 0;
  };

  // Enhanced save functionality
  const handleSubmitMarks = async () => {
    if (!submissionData?.id) {
      showToast("No Submission Data available. Cannot save marks." , "error")
      return;
    }

    const vivaCriteria = getVivaCriteria();
    const totalMarks = calculateTotalMarks();
    const maxMarks = calculateMaxMarks();
    
    // Prepare the marks data in the format expected by your backend
    const vivaMarksData = {};
    vivaCriteria.forEach((criterion, index) => {
       vivaMarksData[criterion.title] = parseFloat(marks[criterion.id]) || 0;
    });
    
    const payload = {
      submissionId: submissionData.id,
      marks: {
        viva: vivaMarksData
      },
      // Additional data for comprehensive marking
      totalMarks: Math.round(totalMarks * 100) / 100,
      maxMarks,
      percentage: maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0,
      assignmentId: assignmentId,
      markedAt: new Date().toISOString(),
      criteria: vivaCriteria.map((criterion, index) => ({
        criterionId: criterion.id,
        criterionName: criterion.title,
        weightage: criterion.weightage,
        assignedMark: parseFloat(marks[criterion.id]) || 0,
        maxMark: criterion.maxMarks
      }))
    };

    
    vivaCriteria.forEach((criterion, index) => {
      const assignedMark = parseFloat(marks[criterion.id]) || 0;
      
      console.log(`Criterion ${index + 1}:`, {
        title: criterion.title,
        criterionWeightage: criterion.weightage + '%',
        maxMarks: criterion.maxMarks,
        assignedMark: assignedMark + '/' + criterion.maxMarks,
        contributionToTotal: assignedMark,
        descriptions: {
          low: criterion.lowDesc,
          medium: criterion.mediumDesc,
          high: criterion.highDesc
        }
      });
    });


    // Save marks to backend
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/marks/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const result = await response.json();
      console.log('Save result:', result);
      
      // Show success state
      setSaveSuccess(true);
      
      // Auto-close after 2 seconds or let user close manually
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error saving viva marks:', error);
      setError(`Failed to save marks: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-1/3 transition-transform duration-300 ease-in-out transform bg-white shadow-2xl dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-white">
          Viva Marking Panel
        </h3>
        <button
          onClick={onClose}
          className="text-white transition-colors hover:text-gray-200"
        >
          <HiX className="w-5 h-5" />
        </button>
      </div>

      {/* Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-0">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-center">
                <HiExclamation className="flex-shrink-0 w-4 h-4 mr-2 text-red-600" />
                <span className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </span>
              </div>
            </div>
          )}

          {/* Success State */}
          {saveSuccess && (
            <div className="p-3 mb-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-center">
                <HiCheck className="flex-shrink-0 w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Marks saved successfully! Closing panel...
                </span>
              </div>
            </div>
          )}

          {/* Total Marks Display - Top for better UX */}
          {!loading && !error && markingScheme && (
            <div className="p-3 mb-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total Score:
                </span>
                <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {Math.round(calculateTotalMarks() * 100) / 100}/{calculateMaxMarks()}
                </span>
              </div>
              <div className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                {calculateMaxMarks() > 0 ? Math.round((calculateTotalMarks() / calculateMaxMarks()) * 100) : 0}% • {getVivaCriteria().length} criteria
              </div>
            </div>
          )}

          {/* Marking Criteria - Compact Design */}
          {!loading && !error && markingScheme && (
            <div className="space-y-3">
              {getVivaCriteria().map((criterion, index) => (
                <div key={criterion.id} className="bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-600 dark:bg-gray-800">
                  {/* Criterion Header - Always Visible */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center flex-1 gap-2">
                        <span className="inline-flex items-center justify-center flex-shrink-0 w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                          {index + 1}
                        </span>
                        <h5 className="text-sm font-medium text-gray-900 truncate dark:text-white">
                          {criterion.title}
                        </h5>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-200 flex-shrink-0">
                          {criterion.weightage}%
                        </span>
                      </div>
                      <button
                        onClick={() => toggleCriteriaExpansion(criterion.id)}
                        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {expandedCriteria[criterion.id] ? 
                          <HiChevronUp className="w-4 h-4" /> : 
                          <HiChevronDown className="w-4 h-4" />
                        }
                      </button>
                    </div>
                    
                  {/* Mark Input - Always Visible */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max={criterion.maxMarks}
                        step="0.5"
                        value={marks[criterion.id] || ''}
                        onChange={(e) => handleMarkChange(criterion.id, e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          existingMarks[criterion.title] ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300'
                        }`}
                        placeholder={`0-${criterion.maxMarks}`}
                        disabled={saving}
                      />
                      {existingMarks[criterion.title] && (
                        <div className="absolute top-0 right-0 w-2 h-2 transform translate-x-1 -translate-y-1 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="flex-shrink-0 w-12 text-sm text-right text-gray-500 dark:text-gray-400">
                      /{criterion.maxMarks}
                    </span>
                  </div>
                </div>

                  {existingMarks[criterion.title] && (
                    <div className="flex items-center gap-1 mt-1">
                      <HiInformationCircle className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Previously saved: {existingMarks[criterion.title]}
                      </span>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedCriteria[criterion.id] && (
                    <div className="px-3 pt-3 pb-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-12 font-medium text-red-600">Low:</span>
                          <span className="text-gray-700 dark:text-gray-300">{criterion.lowDesc}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-12 font-medium text-yellow-600">Mid:</span>
                          <span className="text-gray-700 dark:text-gray-300">{criterion.mediumDesc}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-12 font-medium text-green-600">High:</span>
                          <span className="text-gray-700 dark:text-gray-300">{criterion.highDesc}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Default message when no marking scheme */}
          {!loading && !error && !markingScheme && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <HiInformationCircle className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No marking scheme found for this assignment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex gap-3">
          <Button
            color="green"
            onClick={handleSubmitMarks}
            className="flex items-center justify-center flex-1 gap-2 py-2"
            disabled={calculateTotalMarks() === 0 || saving || !submissionData?.id}
            size="sm"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <HiCheck className="w-4 h-4" />
                Submit Marks
              </>
            )}
          </Button>
          <Button
            color="gray"
            onClick={onClose}
            className="flex-1 py-2"
            size="sm"
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
        
        {/* Submission Info */}
        {submissionData?.id && (
          <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
            Submission ID: {submissionData.id}
          </div>
        )}
        
        {!submissionData?.id && (
          <div className="mt-2 text-xs text-center text-red-500">
            No submission data - cannot save marks
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkingPanel;