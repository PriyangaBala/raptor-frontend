import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  History,
  FileCode2,
  Database,
  SlidersHorizontal,
  LayoutDashboard,
  Check
} from 'lucide-react';

export default function QueryManager({
  datasets = [],
  selectedDatasetId,
  onSelectDataset,
  onSaveDraft,
  onDiscardDraft,
  onTestRun,
  onPublish,
  onRollback
}) {
  const currentDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0] || {};
  const [activeTab, setActiveTab] = useState('editor');
  const [sql, setSql] = useState('');
  const [testing, setTesting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [publishMessage, setPublishMessage] = useState(null);

  useEffect(() => {
    if (currentDataset) {
      setSql(currentDataset.draft_sql || currentDataset.live_sql || '');
      setTestResult(null);
      setPublishMessage(null);
    }
  }, [currentDataset.id, currentDataset.draft_sql, currentDataset.live_sql]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunTest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sql]);

  const handleEditorChange = (newVal) => {
    setSql(newVal || '');
    onSaveDraft(newVal || '');
  };

  const handleRunTest = async () => {
    setTesting(true);
    setPublishMessage(null);
    try {
      const result = await onTestRun(sql);
      setTestResult(result);
    } catch (err) {
      setTestResult({
        valid: false,
        syntax_valid: false,
        error: err.message || 'Validation request failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handlePublishClick = async () => {
    setPublishing(true);
    try {
      await onPublish(sql);
      setPublishMessage({ type: 'success', text: 'Query published successfully! Dashboard refreshed.' });
      setTestResult(null);
    } catch (err) {
      setPublishMessage({ type: 'error', text: err.message || 'Publishing failed' });
    } finally {
      setPublishing(false);
    }
  };

  const isDraft = Boolean(currentDataset.draft_sql);
  const requiredCols = currentDataset.required_columns || [];
  const filterDatasets = datasets.filter((d) => d.category === 'Filter Queries');
  const dashboardDatasets = datasets.filter((d) => d.category !== 'Filter Queries');

  return (
    <div className="flex-1 flex h-full bg-[#0d1322] overflow-hidden text-slate-200">
      {/* 1. Left Catalog Sidebar (Categorized by Filter Queries & Dashboard Analytics) */}
      <aside className="w-72 bg-[#090d18] border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Query Manager Catalog
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Configure custom SQL for each filter and dashboard view.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-5 text-xs">
          {/* Dashboard Analytics Section */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-2 py-1 flex items-center gap-1.5">
              <LayoutDashboard className="w-3 h-3" />
              <span>Dashboard Analytics</span>
            </div>
            <div className="mt-1 space-y-1">
              {dashboardDatasets.map((d) => {
                const isSelected = d.id === currentDataset.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => onSelectDataset(d.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-mono text-xs">{d.name || d.id}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {d.used_by || 'Scorecards & Table'}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ml-1 uppercase font-bold shrink-0 ${
                        d.status === 'DRAFT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {d.status || 'LIVE'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Queries Section */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              <span>Filter Queries ({filterDatasets.length})</span>
            </div>
            <div className="mt-1 space-y-1">
              {filterDatasets.map((d) => {
                const isSelected = d.id === currentDataset.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => onSelectDataset(d.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-mono text-xs">{d.name}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {d.used_by}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ml-1 uppercase font-bold shrink-0 ${
                        d.status === 'DRAFT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {d.status || 'LIVE'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-3 bg-black/40 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300 mb-0.5">BigQuery Live Mode</div>
          <div>Queries live as views. Publishing refreshes the connected UI component immediately.</div>
        </div>
      </aside>

      {/* 2. Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dataset Header Bar */}
        <div className="p-5 pb-3 border-b border-slate-800 bg-[#111728]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white font-mono">{currentDataset.id}</h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300 font-mono text-[10px]">
                  Connected to: {currentDataset.used_by}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{currentDataset.description}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 mt-4 border-b border-slate-800 -mb-3 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('editor')}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>SQL Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Version History ({currentDataset.versions?.length || 1})</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Draft status, Test Run, Publish */}
        <div className="px-5 py-2.5 bg-[#0f1629] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isDraft ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            ></span>
            <span className="text-slate-300 font-medium">
              {isDraft ? 'Draft (Unpublished)' : `Live v${currentDataset.version || 1}`}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">
              {testResult?.valid ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Syntax & Schema Valid ({testResult.bytes_scanned_mb} MB)
                </span>
              ) : testResult?.error ? (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Error in Query
                </span>
              ) : (
                'Dry-run before publishing'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {isDraft && (
              <button
                onClick={onDiscardDraft}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Discard Draft
              </button>
            )}

            <button
              onClick={handleRunTest}
              disabled={testing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Checking BigQuery...' : 'Test Run'}</span>
              <kbd className="hidden sm:inline-block font-mono text-[9px] bg-blue-700/80 px-1 rounded text-blue-200">
                Ctrl+Enter
              </kbd>
            </button>

            <button
              onClick={handlePublishClick}
              disabled={publishing}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{publishing ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>

        {/* Publish / Error Messages */}
        {publishMessage && (
          <div
            className={`px-5 py-2 text-xs font-semibold flex items-center gap-2 ${
              publishMessage.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800'
                : 'bg-rose-950/80 text-rose-300 border-b border-rose-800'
            }`}
          >
            {publishMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{publishMessage.text}</span>
          </div>
        )}

        {/* Tab 1: Monaco Editor */}
        {activeTab === 'editor' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language="sql"
                theme="vs-dark"
                value={sql}
                onChange={handleEditorChange}
                options={{
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  lineNumbers: 'on',
                  padding: { top: 12, bottom: 12 }
                }}
              />
            </div>

            {/* Bottom Schema & Validation Bar */}
            <div className="p-3 bg-[#0a0f1d] border-t border-slate-800/80 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wide">
                    Columns required by component:
                  </span>
                  {requiredCols.map((col) => {
                    const isMatched = testResult?.matched_columns?.includes(col);
                    const isMissing = testResult?.missing_columns?.includes(col);
                    return (
                      <span
                        key={col}
                        className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                          isMatched
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                            : isMissing
                            ? 'bg-rose-950/50 text-rose-300 border-rose-800'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700'
                        }`}
                      >
                        {col}
                      </span>
                    );
                  })}
                </div>

                {testResult?.bytes_scanned_mb !== undefined && (
                  <div className="text-[11px] text-slate-400 font-mono">
                    Estimated data scan: <strong className="text-white">{testResult.bytes_scanned_mb} MB</strong>
                  </div>
                )}
              </div>

              {testResult?.error && (
                <div className="mt-2 p-2 rounded bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs font-mono">
                  {testResult.error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Version History Drawer */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Published Version History
            </h2>
            <div className="space-y-3">
              {(currentDataset.versions || []).map((v) => {
                const isCurrent = v.version === currentDataset.version;
                return (
                  <div
                    key={v.version}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-xs font-bold text-white">Version {v.version}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            CURRENT LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{v.summary}</p>
                      <div className="text-[11px] text-slate-500 mt-2 font-mono">
                        Author: {v.author} · Published: {new Date(v.published_at).toLocaleString()}
                      </div>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => onRollback(v.version)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-blue-600 text-white transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Rollback to v{v.version}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
