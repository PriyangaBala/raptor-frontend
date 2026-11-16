import React, { useState, useMemo, useEffect } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Terminal,
  ExternalLink,
  Calendar,
  Layers,
  Award,
  LogOut
} from 'lucide-react';

const DOMAIN_SCORECARDS = [
  { key: 'overall', label: 'Overall Proficiency', defaultVal: 4.3 },
  { key: 'oral', label: 'Oral Proficiency', defaultVal: 4.7 },
  { key: 'literacy', label: 'Literacy Proficiency', defaultVal: 4.2 },
  { key: 'writing', label: 'Writing Proficiency', defaultVal: 3.8 },
  { key: 'speaking', label: 'Speaking Proficiency', defaultVal: 4.2 },
  { key: 'reading', label: 'Reading proficiency', defaultVal: 5.0 },
  { key: 'listening', label: 'Listening Proficiency', defaultVal: 5.1 }
];

const DOMAINS_DISTRIBUTION = [
  { key: 'overall', label: 'Overall' },
  { key: 'oral', label: 'Oral Language' },
  { key: 'literacy', label: 'Literacy' },
  { key: 'writing', label: 'Writing' },
  { key: 'speaking', label: 'Speaking' },
  { key: 'reading', label: 'Reading' },
  { key: 'listening', label: 'Listening' }
];

const BANDS = [
  { id: '5-6', label: '5-6', desc: '5.0 - 6.0', color: '#1253a4', textClass: 'text-[#1253a4]', bgClass: 'bg-[#1253a4]' },
  { id: '4-5', label: '4-5', desc: '4.0 - 4.9', color: '#15803d', textClass: 'text-[#15803d]', bgClass: 'bg-[#15803d]' },
  { id: '3-4', label: '3-4', desc: '3.0 - 3.9', color: '#eab308', textClass: 'text-[#ca8a04]', bgClass: 'bg-[#eab308]' },
  { id: '2-3', label: '2-3', desc: '2.0 - 2.9', color: '#ea580c', textClass: 'text-[#ea580c]', bgClass: 'bg-[#ea580c]' },
  { id: '1-2', label: '1-2', desc: '1.0 - 1.9', color: '#dc2626', textClass: 'text-[#dc2626]', bgClass: 'bg-[#dc2626]' }
];

export default function WidaDashboard({
  dashboardData,
  filterOptions = {},
  onOpenQueryManager,
  onFilterChange,
  currentUser,
  onLogout
}) {
  // Global & WIDA Filters State
  const [filters, setFilters] = useState({
    // Global Filters
    school: 'all',
    gender: 'all',
    ethnicity: 'all',
    student: 'all',
    grade: 'all',
    teacher: 'all',
    course: 'all',
    block: 'all',
    // WIDA Filters
    domain: 'all',
    proficiencyLevel: 'all',
    testType: 'all',
    dateRange: 'all',
  });

  const [graphBandFilter, setGraphBandFilter] = useState(null); // { domain, band }
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterUpdate = (newFilters) => {
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange({ ...newFilters, graphBand: graphBandFilter });
    }
  };

  const resetAllFilters = () => {
    const cleared = {
      school: 'all',
      gender: 'all',
      ethnicity: 'all',
      student: 'all',
      grade: 'all',
      teacher: 'all',
      course: 'all',
      block: 'all',
      domain: 'all',
      proficiencyLevel: 'all',
      testType: 'all',
      dateRange: 'all',
    };
    setGraphBandFilter(null);
    setSearchQuery('');
    handleFilterUpdate(cleared);
  };

  const handleBandClick = (domain, band) => {
    const nextBand = (graphBandFilter?.domain === domain && graphBandFilter?.band === band)
      ? null
      : { domain, band };
    setGraphBandFilter(nextBand);
    if (onFilterChange) {
      onFilterChange({ ...filters, graphBand: nextBand });
    }
  };

  const constraints = dashboardData?.constraints || {
    grades: [], schools: [], teachers: [], students: [], courses: [], blocks: [], genders: [], ethnicities: []
  };

  const kpis = dashboardData?.kpis || {
    overall: 4.3, oral: 4.7, literacy: 4.2, writing: 3.8, speaking: 4.2, reading: 5.0, listening: 5.1,
    totalStudents: 0
  };

  const distributions = dashboardData?.distributions || {};
  const records = dashboardData?.records || [];

  // Search filter inside table rows
  const searchedRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((r) =>
      (r.student && r.student.toLowerCase().includes(q)) ||
      (r.studentNumberLabel && r.studentNumberLabel.toLowerCase().includes(q)) ||
      (r.id && r.id.toLowerCase().includes(q))
    );
  }, [records, searchQuery]);

  // Badge pill color helper
  const getScorePill = (scoreVal) => {
    const num = parseFloat(scoreVal);
    if (isNaN(num) || num <= 0) return <span className="text-slate-400 font-mono">-</span>;
    let bg = '#1253a4';
    if (num >= 5.0) bg = '#1253a4';
    else if (num >= 4.0) bg = '#15803d';
    else if (num >= 3.0) bg = '#ca8a04';
    else if (num >= 2.0) bg = '#ea580c';
    else bg = '#dc2626';

    return (
      <span
        style={{ backgroundColor: bg }}
        className="inline-flex items-center justify-center min-w-[34px] px-2 py-0.5 rounded text-white font-bold font-mono text-xs shadow-2xs"
      >
        {num.toFixed(1)}
      </span>
    );
  };

  const isAnyFilterActive = Object.values(filters).some((v) => v !== 'all') || graphBandFilter !== null;

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f8f9fc] text-slate-800">
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER (MATCHING LOOKER STUDIO BANNER & METADATA)       */}
      {/* ============================================================== */}
      <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          {/* Official AISC Logo */}
          <div className="flex items-center gap-4">
            <img
              src="/aisc-logo.png"
              alt="American International School Chennai"
              className="h-11 w-auto object-contain"
            />
            <div className="h-9 w-px bg-slate-200"></div>
            <div>
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                RAPTOR360 ANALYTICS
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
                WIDA Dashboard
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-medium">Signed In Staff</div>
            <div className="font-semibold text-slate-800 font-mono text-xs truncate max-w-[180px]">
              {currentUser?.email || 'cogniwide@aischennai.org'}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Role</div>
            <div className="font-bold text-blue-900 text-sm">
              {currentUser?.role || 'Principal'}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <button
            onClick={() => onOpenQueryManager('dashboard.wida_tests')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition shadow-2xs cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-600" />
            <span>SQL Manager</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Blue Top Sub-bar with Read Me, Academic, Reset */}
      <div className="bg-[#3850a0] text-white px-8 py-2 flex items-center justify-between text-xs font-semibold shadow-xs">
        <div className="flex items-center gap-6">
          <span className="hover:underline cursor-pointer opacity-90 hover:opacity-100">Read Me</span>
          <span className="hover:underline cursor-pointer opacity-90 hover:opacity-100">Academic</span>
        </div>
        <button
          onClick={resetAllFilters}
          className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded transition text-xs font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="p-8 space-y-6">

        {/* ============================================================== */}
        {/* 2. SECTION: GLOBAL FILTERS (TWO ROWS + RECORD COUNT CARD)      */}
        {/* ============================================================== */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#3850a0] flex items-center justify-between">
            <span>GLOBAL FILTERS</span>
            {isAnyFilterActive && (
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Filters Active
              </span>
            )}
          </div>

          {/* Filter Inputs Grid (Two Rows spanning full width) */}
          <div className="space-y-3 w-full">
            {/* Row 1: School, Gender, Ethnicity, Student, Grade */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. School */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  School
                </label>
                <select
                  value={filters.school}
                  onChange={(e) => handleFilterUpdate({ ...filters, school: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 hover:border-blue-400 font-medium text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">School (All)</option>
                  {(filterOptions.schools || []).map((sc) => {
                    const val = sc.school_name || sc.school || sc;
                    return <option key={val} value={val}>{val}</option>;
                  })}
                </select>
              </div>

              {/* 2. Gender */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Gender
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterUpdate({ ...filters, gender: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 hover:border-blue-400 font-medium text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Gender (All)</option>
                  {(filterOptions.genders || []).map((g) => {
                    const val = g.gender || g;
                    return <option key={val} value={val}>{val}</option>;
                  })}
                </select>
              </div>

              {/* 3. Ethnicity */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Ethnicity
                </label>
                <select
                  value={filters.ethnicity}
                  onChange={(e) => handleFilterUpdate({ ...filters, ethnicity: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 hover:border-blue-400 font-medium text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Ethnicity (All)</option>
                  {(filterOptions.ethnicities || []).map((et) => {
                    const val = et.ethnicity || et;
                    return <option key={val} value={val}>{val}</option>;
                  })}
                </select>
              </div>

              {/* 4. Student */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Student
                </label>
                <select
                  value={filters.student}
                  onChange={(e) => handleFilterUpdate({ ...filters, student: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 hover:border-blue-400 font-medium text-blue-900 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Student (All)</option>
                  {(filterOptions.students || []).map((s) => {
                    const lbl = s.label || s.student_name || s.id;
                    return <option key={s.id || lbl} value={lbl}>{lbl}</option>;
                  })}
                </select>
              </div>

              {/* 5. Grade */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Grade
                </label>
                <select
                  value={filters.grade}
                  onChange={(e) => handleFilterUpdate({ ...filters, grade: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 hover:border-blue-400 font-medium text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Grade (All)</option>
                  {(filterOptions.grades || []).map((gr) => {
                    const val = String(gr.grade ?? gr);
                    return <option key={val} value={val}>Grade {val}</option>;
                  })}
                </select>
              </div>
            </div>

            {/* Row 2: Teacher, Course, Block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 6. Teacher */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Teacher
                </label>
                <select
                  value={filters.teacher}
                  onChange={(e) => handleFilterUpdate({ ...filters, teacher: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 hover:border-blue-400 font-medium text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Teacher (All)</option>
                  {(filterOptions.teachers || []).map((t) => {
                    const val = t.teacher || t.lastfirst || t;
                    return <option key={val} value={val}>{val}</option>;
                  })}
                </select>
              </div>

              {/* 7. Course */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Course
                </label>
                <select
                  value={filters.course}
                  onChange={(e) => handleFilterUpdate({ ...filters, course: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 hover:border-blue-400 font-medium text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Course (All)</option>
                  {(filterOptions.courses || []).map((c) => {
                    const val = c.course_name || c.course || c;
                    return <option key={val} value={val}>{val}</option>;
                  })}
                </select>
              </div>

              {/* 8. Block */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Block
                </label>
                <select
                  value={filters.block}
                  onChange={(e) => handleFilterUpdate({ ...filters, block: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 hover:border-blue-400 font-medium text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Block (All)</option>
                  {(filterOptions.blocks || []).map((b) => {
                    const val = b.block || b.section_expression || b.expression || b;
                    return <option key={val} value={val}>{val}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 3. SECTION: WIDA FILTERS (DOMAIN, PROFICIENCY, TEST TYPE, DATE) */}
        {/* ============================================================== */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">WIDA Dashboard</h2>
          </div>

          <div className="pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#3850a0] mb-2">
              WIDA FILTERS
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Domain */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Domain
                </label>
                <select
                  value={filters.domain}
                  onChange={(e) => handleFilterUpdate({ ...filters, domain: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 font-semibold text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Domain (All)</option>
                  {(filterOptions.domains || []).map((d) => (
                    <option key={d.domain} value={d.domain}>{d.domain}</option>
                  ))}
                </select>
              </div>

              {/* 2. Proficiency Level */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Proficiency Level
                </label>
                <select
                  value={filters.proficiencyLevel}
                  onChange={(e) => handleFilterUpdate({ ...filters, proficiencyLevel: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 font-semibold text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Proficiency Level (All)</option>
                  {(filterOptions.proficiencyLevels || []).map((pl) => (
                    <option key={pl.level} value={pl.level}>{pl.label}</option>
                  ))}
                </select>
              </div>

              {/* 3. Test Type */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Test Type
                </label>
                <select
                  value={filters.testType}
                  onChange={(e) => handleFilterUpdate({ ...filters, testType: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 font-semibold text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Test Type (All)</option>
                  {(filterOptions.testTypes || []).map((tt) => (
                    <option key={tt.testType} value={tt.testType}>{tt.testType}</option>
                  ))}
                </select>
              </div>

              {/* 4. Select date range */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Select date range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterUpdate({ ...filters, dateRange: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 font-semibold text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Select date range (All)</option>
                  {(filterOptions.dateRanges || []).map((dr) => (
                    <option key={dr.range} value={dr.range}>{dr.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 4. SECTION: PROFICIENCY SCORECARDS (7 SCORECARDS MATCHING PDF) */}
        {/* ============================================================== */}
        <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {DOMAIN_SCORECARDS.map((card) => {
            const rawVal = kpis[card.key] !== undefined ? kpis[card.key] : card.defaultVal;
            const scoreNum = parseFloat(rawVal) || 0.0;

            return (
              <div
                key={card.key}
                className="rounded-xl p-3.5 text-center text-white bg-[#6375b9] hover:bg-[#5869a8] transition shadow-sm"
              >
                <div className="text-[11px] font-bold leading-tight opacity-95">
                  {card.label}
                </div>
                <div className="text-3xl font-black mt-2 font-mono tracking-tight drop-shadow-2xs">
                  {scoreNum > 0 ? scoreNum.toFixed(1) : '-'}
                </div>
              </div>
            );
          })}
        </section>

        {/* ============================================================== */}
        {/* 5. SECTION: PROFICIENCY DISTRIBUTION BY DOMAIN (100% STACKED) */}
        {/* ============================================================== */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Proficiency Distribution by Domain
              </h3>
              <p className="text-xs text-slate-400">
                100% horizontal stacked bands. Click any colored segment to filter.
              </p>
            </div>

            {/* Legend matching exact Looker Studio colors */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              {BANDS.map((b) => (
                <span
                  key={b.id}
                  onClick={() => handleBandClick('overall', b.id)}
                  className={`flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition px-1.5 py-0.5 rounded ${
                    graphBandFilter?.band === b.id ? 'bg-slate-100 ring-1 ring-blue-500' : ''
                  }`}
                >
                  <span
                    style={{ backgroundColor: b.color }}
                    className="w-3.5 h-3.5 rounded-xs"
                  ></span>
                  <span className="text-slate-700 font-mono text-[11px]">{b.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 100% Stacked Bars Visual Container */}
          <div className="relative pt-2 pb-2">
            {/* Background 10-column axis grid lines */}
            <div className="absolute inset-y-0 left-28 right-0 grid grid-cols-10 pointer-events-none opacity-20 border-l border-r border-slate-400">
              <div className="border-r border-slate-400 h-full"></div>
              <div className="border-r border-slate-400 h-full"></div>
              <div className="border-r border-slate-400 h-full"></div>
              <div className="border-r border-slate-400 h-full"></div>
              <div className="border-r border-slate-400 h-full"></div>
              <div className="border-r border-slate-400 h-full"></div>
              <div className="border-r border-slate-400 h-full"></div>
              <div className="border-r border-slate-400 h-full"></div>
              <div className="border-r border-slate-400 h-full"></div>
              <div></div>
            </div>

            {/* 7 Horizontal Domain Bars */}
            <div className="space-y-3.5 relative z-10">
              {DOMAINS_DISTRIBUTION.map((dom) => {
                const dist = distributions[dom.key] || {
                  percentages: { '5-6': 32, '4-5': 24, '3-4': 20, '2-3': 15, '1-2': 9 },
                  counts: { '5-6': 32, '4-5': 24, '3-4': 20, '2-3': 15, '1-2': 9 },
                  total: 100
                };

                return (
                  <div key={dom.key} className="flex items-center gap-3">
                    <div className="w-24 text-right text-xs font-semibold text-slate-700 shrink-0 truncate">
                      {dom.label}
                    </div>

                    <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden flex shadow-2xs border border-slate-200/80">
                      {BANDS.map((b) => {
                        const pct = dist.percentages?.[b.id] || 0;
                        const cnt = dist.counts?.[b.id] || 0;
                        if (pct <= 0) return null;

                        const isSelected = graphBandFilter?.domain === dom.key && graphBandFilter?.band === b.id;

                        return (
                          <div
                            key={b.id}
                            onClick={() => handleBandClick(dom.key, b.id)}
                            style={{
                              width: `${pct}%`,
                              backgroundColor: b.color
                            }}
                            title={`${dom.label} - ${b.label}: ${pct}% (${cnt.toLocaleString()} records)`}
                            className={`h-full cursor-pointer transition hover:opacity-90 relative flex items-center justify-center text-[10px] text-white font-mono font-bold select-none ${
                              isSelected ? 'ring-2 ring-white ring-inset' : ''
                            }`}
                          >
                            {pct >= 6 && <span>{Math.round(pct)}%</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Percentage Labels */}
            <div className="flex items-center justify-between pl-28 pt-3 text-[10px] text-slate-400 font-mono font-semibold">
              <span>0%</span>
              <span>10%</span>
              <span>20%</span>
              <span>30%</span>
              <span>40%</span>
              <span>50%</span>
              <span>60%</span>
              <span>70%</span>
              <span>80%</span>
              <span>90%</span>
              <span>100%</span>
            </div>
            <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Proficiency
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 6. SECTION: STUDENT DATA TABLE (FULL INTERNAL SCROLL)         */}
        {/* ============================================================== */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Student Proficiency Records
              </h3>
              <p className="text-xs text-slate-500">
                Showing all <strong className="text-slate-800 font-bold">{searchedRecords.length.toLocaleString()}</strong> records &bull; Scroll vertically to browse
              </p>
            </div>

            {/* Search Input Box */}
            <div className="relative w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student name or ID..."
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Table Container with Internal Vertical & Horizontal Scroll */}
          <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="max-h-[520px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 shadow-xs">
                  <tr className="bg-[#c2cdf0] text-slate-900 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3 text-center">Grade at test</th>
                    <th className="py-2.5 px-3 text-center">Current Grade</th>
                    <th className="py-2.5 px-3">Test Date</th>
                    <th className="py-2.5 px-3 text-center">Overall</th>
                    <th className="py-2.5 px-3 text-center">Oral</th>
                    <th className="py-2.5 px-3 text-center">Literacy</th>
                    <th className="py-2.5 px-3 text-center">Writing</th>
                    <th className="py-2.5 px-3 text-center">Speaking</th>
                    <th className="py-2.5 px-3 text-center">Reading</th>
                    <th className="py-2.5 px-3 text-center">Listening</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {searchedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-10 text-center text-slate-400 text-xs">
                        No matching student records found.
                      </td>
                    </tr>
                  ) : (
                    searchedRecords.map((r, idx) => (
                      <tr
                        key={`${r.id}-${r.testDate}-${idx}`}
                        className="hover:bg-blue-50/50 transition cursor-pointer"
                        onClick={() => handleFilterUpdate({ ...filters, student: r.studentNumberLabel || r.student })}
                      >
                        <td className="py-2 px-3 font-mono text-slate-600 font-semibold">{r.id || '-'}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{r.student || '-'}</td>
                        <td className="py-2 px-3 text-center text-slate-700">{r.gradeAtTest || '-'}</td>
                        <td className="py-2 px-3 text-center text-slate-700 font-bold">{r.currentGrade || '-'}</td>
                        <td className="py-2 px-3 text-slate-600">{r.testDate || '-'}</td>
                        <td className="py-2 px-3 text-center">{getScorePill(r.overall)}</td>
                        <td className="py-2 px-3 text-center">{getScorePill(r.oral)}</td>
                        <td className="py-2 px-3 text-center">{getScorePill(r.literacy)}</td>
                        <td className="py-2 px-3 text-center">{getScorePill(r.writing)}</td>
                        <td className="py-2 px-3 text-center">{getScorePill(r.speaking)}</td>
                        <td className="py-2 px-3 text-center">{getScorePill(r.reading)}</td>
                        <td className="py-2 px-3 text-center">{getScorePill(r.listening)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
