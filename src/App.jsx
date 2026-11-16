import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.jsx';
import WidaDashboard from './components/WidaDashboard.jsx';
import QueryManager from './components/QueryManager.jsx';
import LoginPage from './components/LoginPage.jsx';
import {
  fetchDatasets,
  saveDraft,
  discardDraft,
  testRunQuery,
  publishQuery,
  rollbackVersion,
  fetchFilterOptions,
  fetchWidaDashboardData
} from './services/api.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('raptor360_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeView, setActiveView] = useState('wida'); // 'wida' or 'query_manager'
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('dashboard.wida_tests');
  const [filterOptions, setFilterOptions] = useState({});
  const [dashboardData, setDashboardData] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Load datasets, filters, and dashboard analytics independently for current user
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    // 1. Fetch datasets for Query Manager catalog
    try {
      const ds = await fetchDatasets();
      if (Array.isArray(ds) && ds.length > 0) {
        setDatasets(ds);
      }
    } catch (err) {
      console.error('[App] Error fetching datasets:', err);
    }

    // 2. Fetch 8 filter dropdown options from live BigQuery for this user's role
    try {
      const filters = await fetchFilterOptions();
      if (filters && typeof filters === 'object') {
        setFilterOptions(filters);
      }
    } catch (err) {
      console.error('[App] Error fetching filter options:', err);
    }

    // 3. Fetch WIDA dashboard analytics (scorecards, distribution, student table)
    try {
      const wida = await fetchWidaDashboardData({});
      if (wida) {
        setDashboardData(wida);
      }
    } catch (err) {
      console.error('[App] Error fetching WIDA dashboard data:', err);
      setLoadError(err.message || 'Error connecting to BigQuery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser, loadInitialData]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('raptor360_user');
    setCurrentUser(null);
    setDashboardData(null);
    setFilterOptions({});
  };

  // Handle filter changes from WidaDashboard
  const handleFilterChange = async (filters) => {
    setActiveFilters(filters);
    try {
      const data = await fetchWidaDashboardData(filters);
      setDashboardData(data);
    } catch (err) {
      console.error('[App] Error applying filters:', err);
    }
  };

  // Open Query Manager for a specific dataset
  const handleOpenQueryManager = (datasetId = 'dashboard.wida_tests') => {
    setSelectedDatasetId(datasetId);
    setActiveView('query_manager');
  };

  // Query Manager actions
  const handleSaveDraft = async (sql) => {
    try {
      const res = await saveDraft(selectedDatasetId, sql, currentUser?.email || 'Cogniwide data team');
      setDatasets((prev) =>
        prev.map((d) => (d.id === selectedDatasetId ? res.dataset : d))
      );
    } catch (err) {
      console.error('[App] Save draft failed:', err);
    }
  };

  const handleDiscardDraft = async () => {
    try {
      const res = await discardDraft(selectedDatasetId);
      setDatasets((prev) =>
        prev.map((d) => (d.id === selectedDatasetId ? res.dataset : d))
      );
    } catch (err) {
      console.error('[App] Discard draft failed:', err);
    }
  };

  const handleTestRun = async (sql) => {
    const ds = datasets.find((d) => d.id === selectedDatasetId);
    return await testRunQuery(selectedDatasetId, sql, ds?.required_columns);
  };

  const handlePublish = async (sql) => {
    try {
      const res = await publishQuery(
        selectedDatasetId,
        sql,
        currentUser?.email || 'Cogniwide data team',
        'Updated query via Query Manager'
      );
      setDatasets((prev) =>
        prev.map((d) => (d.id === selectedDatasetId ? res.dataset : d))
      );

      // Instantly refresh dashboard data with published query
      setRefreshing(true);
      const [freshFilters, freshWida] = await Promise.all([
        fetchFilterOptions(),
        fetchWidaDashboardData(activeFilters)
      ]);
      setFilterOptions(freshFilters);
      setDashboardData(freshWida);
    } catch (err) {
      console.error('[App] Publish failed:', err);
      throw err;
    } finally {
      setRefreshing(false);
    }
  };

  const handleRollback = async (targetVersion) => {
    try {
      const res = await rollbackVersion(selectedDatasetId, targetVersion, currentUser?.email || 'Cogniwide data team');
      setDatasets((prev) =>
        prev.map((d) => (d.id === selectedDatasetId ? res.dataset : d))
      );

      // Refresh dashboard after rollback
      setRefreshing(true);
      const [freshFilters, freshWida] = await Promise.all([
        fetchFilterOptions(),
        fetchWidaDashboardData(activeFilters)
      ]);
      setFilterOptions(freshFilters);
      setDashboardData(freshWida);
    } catch (err) {
      console.error('[App] Error refreshing dashboard after rollback:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // If user is not logged in, show Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Loading screen when authenticating or loading BigQuery data
  if (loading && !dashboardData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f4f6fb] text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin"></div>
          <span className="text-xs text-slate-600 font-semibold tracking-wide">
            Applying BigQuery permissions for {currentUser?.email}...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#f4f6fb]">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeView === 'wida' ? (
          <WidaDashboard
            dashboardData={dashboardData}
            filterOptions={filterOptions}
            onOpenQueryManager={handleOpenQueryManager}
            onFilterChange={handleFilterChange}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        ) : (
          <div className="flex-1 flex flex-col h-full bg-[#0d1322]">
            {/* Top Return Bar for Query Manager */}
            <div className="h-11 bg-[#111728] border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
              <button
                onClick={() => setActiveView('wida')}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-white font-semibold transition cursor-pointer"
              >
                <span>← Back to WIDA Dashboard</span>
              </button>
              <div className="text-xs text-slate-400 font-mono">
                Raptor360 BigQuery Query Manager (Looker Studio Replacement)
              </div>
            </div>

            <QueryManager
              datasets={datasets}
              selectedDatasetId={selectedDatasetId}
              onSelectDataset={setSelectedDatasetId}
              onSaveDraft={handleSaveDraft}
              onDiscardDraft={handleDiscardDraft}
              onTestRun={handleTestRun}
              onPublish={handlePublish}
              onRollback={handleRollback}
            />
          </div>
        )}
      </main>
    </div>
  );
}
