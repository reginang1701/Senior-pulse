import React, { useState, useEffect } from 'react';
import {
  Activity,
  BookOpen,
  Globe2,
  Newspaper,
  Terminal,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  ChevronRight,
  ShieldCheck,
  Calendar,
  User,
  Building2,
  Sparkles,
  TrendingUp,
  Radio,
  Lightbulb,
  ArrowRight,
  Filter,
  BarChart3,
  HelpCircle,
  PlusCircle,
  Share2,
  AlertTriangle,
  Users,
  Compass,
  FileText,
  Target,
  Vote,
  LayoutGrid
} from 'lucide-react';
import { CURRENT_SENIOR_SERVICES, HORIZON_SCAN_TRENDS } from '../lib/services-catalog.js';
import {
  SINGAPORE_EARLY_WARNING_INDICATORS,
  INTERNATIONAL_EXPANSION_LESSONS,
  STAKEHOLDER_MATRIX,
  STRATEGIC_RISK_ANALYSIS
} from '../lib/foresight-singapore.js';

interface SeniorServiceItem {
  id: string;
  category: string;
  title: string;
  description: string;
  target_cohort: string;
  delivery_channel: string;
  current_challenges: string[];
  emerging_signals: string[];
  future_opportunity: string;
}

interface HorizonTrend {
  id: string;
  theme: string;
  weak_signal: string;
  drivers_of_change: string;
  implications_for_seniors: string;
  future_service_concept: string;
  horizon_timeline: string;
}

interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pub_date: string;
  doi: string | null;
  url: string;
}

interface NewsArticle {
  title: string;
  url: string;
  pub_date: string;
  source: string;
  country: string;
}

interface WhoDataPoint {
  indicator: string;
  indicator_name: string;
  country: string;
  year: number;
  sex: string;
  value: number | null;
  display_value: string;
}

interface OecdDataPoint {
  indicator: string;
  indicator_name: string;
  country_code: string;
  country_name: string;
  year: number;
  value: number | null;
  unit: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'board' | 'singapore' | 'horizon' | 'services' | 'oecd' | 'mcp' | 'pubmed' | 'news' | 'who'>('board');

  // Dot voting simulation on the Miro canvas
  const [votes, setVotes] = useState<Record<string, number>>({
    problem: 14,
    solution: 11,
    who_oecd: 18,
    risks_equity: 9,
    stakeholder_aic: 16,
    focal_singapore: 25
  });

  // Singapore Foresight Filter
  const [indicatorCategoryFilter, setIndicatorCategoryFilter] = useState<string>('all');
  const [selectedStakeholder, setSelectedStakeholder] = useState<string>('sh-aic');

  // Horizon Scan State
  const [horizonTrends, setHorizonTrends] = useState<HorizonTrend[]>(HORIZON_SCAN_TRENDS);
  const [selectedHorizonFilter, setSelectedHorizonFilter] = useState<string>('all');
  const [customIdeaTrendId, setCustomIdeaTrendId] = useState<string | null>(null);
  const [customIdeaInput, setCustomIdeaInput] = useState('');
  const [brainstormedIdeas, setBrainstormedIdeas] = useState<Record<string, string[]>>({});

  // Senior Services State
  const [servicesList, setServicesList] = useState<SeniorServiceItem[]>(CURRENT_SENIOR_SERVICES);
  const [serviceChannelFilter, setServiceChannelFilter] = useState<string>('all');
  const [serviceSearch, setServiceSearch] = useState('');

  // OECD Demographics State
  const [oecdCountry, setOecdCountry] = useState('OED');
  const [oecdIndicator, setOecdIndicator] = useState('SP.POP.DPND.OL');
  const [oecdResults, setOecdResults] = useState<OecdDataPoint[]>([]);
  const [oecdLoading, setOecdLoading] = useState(false);
  const [oecdError, setOecdError] = useState<string | null>(null);

  // PubMed Explorer State
  const [pubMedQuery, setPubMedQuery] = useState('geriatric cognitive decline');
  const [pubMedLimit, setPubMedLimit] = useState(6);
  const [pubMedResults, setPubMedResults] = useState<PubMedArticle[]>([]);
  const [pubMedLoading, setPubMedLoading] = useState(false);
  const [pubMedError, setPubMedError] = useState<string | null>(null);

  // News State
  const [newsTopic, setNewsTopic] = useState('elder care');
  const [newsCountry, setNewsCountry] = useState('US');
  const [newsResults, setNewsResults] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  // WHO State
  const [whoCountry, setWhoCountry] = useState('USA');
  const [whoIndicator, setWhoIndicator] = useState('WHOSIS_000001');
  const [whoResults, setWhoResults] = useState<WhoDataPoint[]>([]);
  const [whoLoading, setWhoLoading] = useState(false);
  const [whoError, setWhoError] = useState<string | null>(null);

  // MCP Tester State
  type ToolName =
    | 'silver_pulse_get_singapore_early_warning'
    | 'silver_pulse_get_oecd_demographics'
    | 'silver_pulse_search_pubmed'
    | 'silver_pulse_fetch_news'
    | 'silver_pulse_get_who_demographics';

  const [mcpSelectedTool, setMcpSelectedTool] = useState<ToolName>('silver_pulse_get_singapore_early_warning');
  const [mcpArguments, setMcpArguments] = useState('{\n  "category": "Caregiver Strain"\n}');
  const [mcpResponse, setMcpResponse] = useState<string | null>(null);
  const [mcpLoading, setMcpLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Initial load
  useEffect(() => {
    fetchOecdData();
    fetchPubMed();
    fetchNewsArticles();
    fetchWhoData();
  }, []);

  const handleVote = (key: string) => {
    setVotes((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  };

  const fetchOecdData = async () => {
    setOecdLoading(true);
    setOecdError(null);
    try {
      const res = await fetch(`/api/oecd-demographics?country=${encodeURIComponent(oecdCountry)}&indicator=${encodeURIComponent(oecdIndicator)}`);
      if (!res.ok) throw new Error(`OECD request failed with status ${res.status}`);
      const data = await res.json();
      setOecdResults(data.items || []);
    } catch (err: any) {
      setOecdError(err.message || 'Error querying OECD demographics');
    } finally {
      setOecdLoading(false);
    }
  };

  const fetchPubMed = async (queryToUse?: string) => {
    const q = queryToUse || pubMedQuery;
    if (!q.trim()) return;
    setPubMedLoading(true);
    setPubMedError(null);
    try {
      const res = await fetch(`/api/pubmed?query=${encodeURIComponent(q)}&limit=${pubMedLimit}`);
      if (!res.ok) throw new Error(`PubMed request failed with status ${res.status}`);
      const data = await res.json();
      setPubMedResults(data.items || []);
    } catch (err: any) {
      setPubMedError(err.message || 'Error querying PubMed');
    } finally {
      setPubMedLoading(false);
    }
  };

  const fetchNewsArticles = async () => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const res = await fetch(`/api/news?topic=${encodeURIComponent(newsTopic)}&country=${encodeURIComponent(newsCountry)}`);
      if (!res.ok) throw new Error(`News request failed with status ${res.status}`);
      const data = await res.json();
      setNewsResults(data.items || []);
    } catch (err: any) {
      setNewsError(err.message || 'Error fetching health news');
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchWhoData = async () => {
    setWhoLoading(true);
    setWhoError(null);
    try {
      const res = await fetch(`/api/who-demographics?country=${encodeURIComponent(whoCountry)}&indicator=${encodeURIComponent(whoIndicator)}`);
      if (!res.ok) throw new Error(`WHO request failed with status ${res.status}`);
      const data = await res.json();
      setWhoResults(data.items || []);
    } catch (err: any) {
      setWhoError(err.message || 'Error querying WHO demographics');
    } finally {
      setWhoLoading(false);
    }
  };

  const handleTestMcpCall = async () => {
    setMcpLoading(true);
    setMcpResponse(null);
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(mcpArguments);
      } catch {
        throw new Error('Invalid JSON arguments format');
      }

      const payload = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: mcpSelectedTool,
          arguments: parsedArgs
        }
      };

      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      setMcpResponse(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setMcpResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setMcpLoading(false);
    }
  };

  const selectPresetMcpTool = (tool: ToolName) => {
    setMcpSelectedTool(tool);
    if (tool === 'silver_pulse_get_singapore_early_warning') {
      setMcpArguments('{\n  "category": "Caregiver Strain"\n}');
    } else if (tool === 'silver_pulse_get_oecd_demographics') {
      setMcpArguments('{\n  "country": "OED",\n  "indicator": "SP.POP.DPND.OL"\n}');
    } else if (tool === 'silver_pulse_search_pubmed') {
      setMcpArguments('{\n  "query": "geriatric frailty syndrome",\n  "max_results": 5\n}');
    } else if (tool === 'silver_pulse_fetch_news') {
      setMcpArguments('{\n  "topic": "senior living dementia care",\n  "country": "US"\n}');
    } else {
      setMcpArguments('{\n  "country": "USA",\n  "indicator": "WHOSIS_000001"\n}');
    }
  };

  const copyMcpCurl = () => {
    const curl = `curl -X POST "http://localhost:3000/api/mcp" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "${mcpSelectedTool}",
      "arguments": ${mcpArguments.replace(/\n/g, ' ')}
    }
  }'`;
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleAddBrainstormIdea = (trendId: string) => {
    if (!customIdeaInput.trim()) return;
    setBrainstormedIdeas((prev) => ({
      ...prev,
      [trendId]: [...(prev[trendId] || []), customIdeaInput.trim()]
    }));
    setCustomIdeaInput('');
    setCustomIdeaTrendId(null);
  };

  const filteredIndicators = SINGAPORE_EARLY_WARNING_INDICATORS.filter((ind) => {
    if (indicatorCategoryFilter === 'all') return true;
    return ind.category.toLowerCase().includes(indicatorCategoryFilter.toLowerCase());
  });

  const activeStakeholderData = STAKEHOLDER_MATRIX.find((s) => s.id === selectedStakeholder) || STAKEHOLDER_MATRIX[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  SILVER PULSE
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-pink-950 text-pink-300 border border-pink-800/60">
                  Horizon Scanning for Seniors of the Future
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                Singapore 2030–2035 Eldercare Foresight &amp; MCP Integration Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>5 MCP Tools Live</span>
            </div>
            <button
              onClick={() => setActiveTab('mcp')}
              className="text-xs font-medium text-slate-300 hover:text-white transition-colors bg-slate-800/90 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              MCP Server (/api/mcp)
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Bar */}
      <nav className="border-b border-slate-800/80 bg-slate-900/60 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center space-x-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'board'
                  ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Strategic Canvas (Miro View)</span>
            </button>
            <button
              onClick={() => setActiveTab('singapore')}
              className={`flex items-center space-x-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'singapore'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Singapore 2030–2035 Early Warning</span>
            </button>
            <button
              onClick={() => setActiveTab('horizon')}
              className={`flex items-center space-x-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'horizon'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Radio className="h-4 w-4" />
              <span>Weak Signals &amp; Horizon 1-3</span>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center space-x-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'services'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Current Senior Services</span>
            </button>
            <button
              onClick={() => setActiveTab('oecd')}
              className={`flex items-center space-x-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'oecd'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>OECD Demographics</span>
            </button>
            <button
              onClick={() => setActiveTab('mcp')}
              className={`flex items-center space-x-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'mcp'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="h-4 w-4" />
              <span>MCP Protocol Inspector</span>
            </button>
            <button
              onClick={() => setActiveTab('pubmed')}
              className={`flex items-center space-x-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'pubmed'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>PubMed Citations</span>
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center space-x-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'news'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Newspaper className="h-4 w-4" />
              <span>Senior Care News</span>
            </button>
            <button
              onClick={() => setActiveTab('who')}
              className={`flex items-center space-x-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'who'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Globe2 className="h-4 w-4" />
              <span>WHO Longevity</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: STRATEGIC CANVAS (DIRECT 1:1 INTERACTIVE DECONSTRUCTION OF V2 IMAGE) */}
        {/* ========================================================================= */}
        {activeTab === 'board' && (
          <div className="space-y-8">
            {/* Miro Canvas Title Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-pink-950/80 border border-pink-800/50 text-pink-300 text-xs font-semibold mb-2">
                    <Vote className="h-3.5 w-3.5" />
                    <span>Miro Collaborative Board Synthesis</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    SILVER PULSE – Horizon Scanning for Seniors of the Future
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-3xl">
                    Deconstructed ideation framework mapping the strategic planning problem, multi-source MCP resources, stakeholders (MOH, AIC, CCOs), risk mitigations, and the focal Singapore 2030–2035 ageing-in-place inquiry.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Dot Voting Total</div>
                    <div className="text-lg font-black text-pink-400">
                      {Object.values(votes).reduce((a, b) => a + b, 0)} Votes
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas 2x2 Top Grid: Problem, Solution, Resources, Purpose */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CARD 1: WHAT IS THE PROBLEM? */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <Target className="h-4 w-4 text-pink-400" />
                      <span>What is the problem? Who has the problem? Why is it important?</span>
                    </h2>
                    <button
                      onClick={() => handleVote('problem')}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-pink-950 hover:bg-pink-900 text-pink-300 text-xs font-mono border border-pink-800 transition-colors"
                    >
                      <span>👍</span>
                      <span>{votes.problem}</span>
                    </button>
                  </div>

                  {/* Pink Sticky Notes Representation */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-pink-900/40 to-pink-950/60 border border-pink-700/50 rounded-xl p-4 shadow-md flex flex-col justify-between">
                      <div className="text-[11px] font-bold text-pink-300 uppercase tracking-wider mb-2">
                        Target Persona
                      </div>
                      <p className="text-sm font-semibold text-white leading-snug">
                        Strategic planning team in an eldercare sector
                      </p>
                      <div className="mt-3 text-[10px] text-pink-300 font-mono">
                        MOH • AIC • Cluster Planners
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-800/40 to-pink-950/70 border border-pink-600/60 rounded-xl p-4 shadow-md flex flex-col justify-between">
                      <div className="text-[11px] font-bold text-pink-300 uppercase tracking-wider mb-2">
                        Core Mission
                      </div>
                      <p className="text-xs text-pink-100 leading-relaxed">
                        &ldquo;To find out healthcare, emerging trends &amp; weak signals and information to inform future services of seniors.&rdquo;
                      </p>
                      <div className="mt-3 text-[10px] text-pink-300 font-mono">
                        Early detection of systemic breakdowns
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                  <span>Addresses macro demographic shifts &amp; eldercare service readiness</span>
                  <span className="text-pink-400 font-semibold cursor-pointer hover:underline" onClick={() => setActiveTab('horizon')}>
                    View Weak Signals →
                  </span>
                </div>
              </div>

              {/* CARD 2: WHAT IS THE PROPOSED SOLUTION? */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4 text-amber-400" />
                      <span>What is the proposed solution? How does the solution relate?</span>
                    </h2>
                    <button
                      onClick={() => handleVote('solution')}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-950 hover:bg-amber-900 text-amber-300 text-xs font-mono border border-amber-800 transition-colors"
                    >
                      <span>👍</span>
                      <span>{votes.solution}</span>
                    </button>
                  </div>

                  {/* Orange Sticky Notes Representation */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-amber-900/40 to-amber-950/60 border border-amber-700/50 rounded-xl p-4 shadow-md flex flex-col justify-between">
                      <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">
                        Core Engine
                      </div>
                      <p className="text-xs text-amber-100 leading-relaxed font-medium">
                        &ldquo;Provide information and trends based on various studies (clinical, demographic, news feeds, and comparative country analyses).&rdquo;
                      </p>
                      <div className="mt-3 text-[10px] text-amber-300 font-mono">
                        Multi-Source Synthesis Engine
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-800/30 to-slate-950 border border-amber-600/40 rounded-xl p-4 shadow-md flex flex-col justify-between">
                      <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">
                        How It Relates
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        Translates raw macro data into actionable foresight horizons (1-2y, 3-5y, 5-10y) so planners can redesign delivery before capacity breaks.
                      </p>
                      <div className="mt-3 text-[10px] text-amber-300 font-mono">
                        Adaptive Service Concepts
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                  <span>Connects research studies to future services</span>
                  <span className="text-amber-400 font-semibold cursor-pointer hover:underline" onClick={() => setActiveTab('services')}>
                    Inspect Services →
                  </span>
                </div>
              </div>

              {/* CARD 3: REQUIRED RESOURCES & MCPS */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-yellow-400" />
                      <span>What tangible and intangible resources are required? (MCPs)</span>
                    </h2>
                    <button
                      onClick={() => handleVote('who_oecd')}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-yellow-950 hover:bg-yellow-900 text-yellow-300 text-xs font-mono border border-yellow-800 transition-colors"
                    >
                      <span>👍</span>
                      <span>{votes.who_oecd}</span>
                    </button>
                  </div>

                  {/* 5 Yellow Sticky Notes */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setActiveTab('who')}
                      className="bg-yellow-950/40 hover:bg-yellow-900/50 border border-yellow-600/50 p-3 rounded-xl cursor-pointer transition-all"
                    >
                      <div className="text-[10px] font-mono uppercase text-yellow-400">MCP Tool 1</div>
                      <div className="font-bold text-white text-xs mt-1">WHO Demographic Data</div>
                      <div className="text-[10px] text-slate-400 mt-1">Life Expectancy &amp; HALE</div>
                    </div>

                    <div
                      onClick={() => setActiveTab('news')}
                      className="bg-yellow-950/40 hover:bg-yellow-900/50 border border-yellow-600/50 p-3 rounded-xl cursor-pointer transition-all"
                    >
                      <div className="text-[10px] font-mono uppercase text-yellow-400">MCP Tool 2</div>
                      <div className="font-bold text-white text-xs mt-1">Google News</div>
                      <div className="text-[10px] text-slate-400 mt-1">Senior policy &amp; media</div>
                    </div>

                    <div
                      onClick={() => setActiveTab('pubmed')}
                      className="bg-yellow-950/40 hover:bg-yellow-900/50 border border-yellow-600/50 p-3 rounded-xl cursor-pointer transition-all"
                    >
                      <div className="text-[10px] font-mono uppercase text-yellow-400">MCP Tool 3</div>
                      <div className="font-bold text-white text-xs mt-1">PubMed</div>
                      <div className="text-[10px] text-slate-400 mt-1">Clinical geriatric citations</div>
                    </div>

                    <div
                      onClick={() => setActiveTab('oecd')}
                      className="bg-yellow-950/40 hover:bg-yellow-900/50 border border-yellow-600/50 p-3 rounded-xl cursor-pointer transition-all"
                    >
                      <div className="text-[10px] font-mono uppercase text-yellow-400">MCP Tool 4</div>
                      <div className="font-bold text-white text-xs mt-1">OECD Demographic Data</div>
                      <div className="text-[10px] text-slate-400 mt-1">Dependency ratios &amp; spend</div>
                    </div>

                    <div
                      onClick={() => setActiveTab('services')}
                      className="bg-yellow-950/40 hover:bg-yellow-900/50 border border-yellow-600/50 p-3 rounded-xl cursor-pointer transition-all col-span-2 sm:col-span-2"
                    >
                      <div className="text-[10px] font-mono uppercase text-yellow-400">MCP Tool 5 / Baseline</div>
                      <div className="font-bold text-white text-xs mt-1">Current Services for Seniors Data</div>
                      <div className="text-[10px] text-slate-400 mt-1">In-home, memory hubs, telegeriatrics, nutrition, paratransit</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                  <span>Available directly via MCP server at /api/mcp</span>
                  <span className="text-yellow-400 font-semibold cursor-pointer hover:underline" onClick={() => setActiveTab('mcp')}>
                    Open Tool Console →
                  </span>
                </div>
              </div>

              {/* CARD 4: WHY ARE WE DOING THIS? EXPECTED BENEFITS */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-teal-400" />
                      <span>Why are we doing this? Expected Benefits?</span>
                    </h2>
                    <button
                      onClick={() => handleVote('solution')}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-teal-950 hover:bg-teal-900 text-teal-300 text-xs font-mono border border-teal-800 transition-colors"
                    >
                      <span>👍</span>
                      <span>17</span>
                    </button>
                  </div>

                  {/* Teal Sticky Notes */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-teal-900/40 to-teal-950/60 border border-teal-700/50 rounded-xl p-4 shadow-md flex flex-col justify-between">
                      <div className="text-[11px] font-bold text-teal-300 uppercase tracking-wider mb-2">
                        Objective 1
                      </div>
                      <p className="text-xs text-teal-100 leading-relaxed font-semibold">
                        &ldquo;Identify the trends and concerns which may affect seniors&rdquo;
                      </p>
                      <div className="mt-3 text-[10px] text-teal-300">
                        • Early isolation warnings<br/>
                        • Caregiver burnout signals
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-teal-800/30 to-slate-950 border border-teal-600/40 rounded-xl p-4 shadow-md flex flex-col justify-between">
                      <div className="text-[11px] font-bold text-teal-300 uppercase tracking-wider mb-2">
                        Objective 2
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                        &ldquo;Brainstorm on ideas to address their issues&rdquo;
                      </p>
                      <div className="mt-3 text-[10px] text-teal-300">
                        • Financial: Avoid $10k+ acute hospital stays<br/>
                        • Non-Financial: Prolonged independence
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                  <span>Tangible reduction in avoidable acute hospital bed days</span>
                  <span className="text-teal-400 font-semibold cursor-pointer hover:underline" onClick={() => setActiveTab('singapore')}>
                    Explore 2030 Impact →
                  </span>
                </div>
              </div>
            </div>

            {/* Canvas Row 3 & 4: Risks, Project Scope & Technology, Stakeholders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* BOX 5: WHAT COULD GO WRONG? RISKS & MITIGATIONS */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertTriangle className="h-4 w-4 text-sky-400" />
                    <span>What could go wrong? Risks?</span>
                  </h3>
                  <button
                    onClick={() => handleVote('risks_equity')}
                    className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 text-[10px] font-mono border border-sky-800"
                  >
                    👍 {votes.risks_equity}
                  </button>
                </div>

                {/* Light Blue Notes from Image */}
                <div className="space-y-3">
                  <div className="bg-sky-950/40 border border-sky-800/60 p-3 rounded-xl">
                    <div className="text-[11px] font-bold text-sky-300 mb-1">Risk Note 1</div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      &ldquo;information might be less relevant such as lifestyle decisions&rdquo;
                    </p>
                    <div className="mt-2 text-[10px] text-sky-400 bg-sky-950 p-1.5 rounded border border-sky-900">
                      <strong>Mitigation:</strong> Filter by clinical ADL/IADL impairment drivers and PubMed endpoints rather than lifestyle noise.
                    </div>
                  </div>

                  <div className="bg-sky-950/40 border border-sky-800/60 p-3 rounded-xl">
                    <div className="text-[11px] font-bold text-sky-300 mb-1">Risk Note 2</div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      &ldquo;differing access to healthcare&rdquo;
                    </p>
                    <div className="mt-2 text-[10px] text-sky-400 bg-sky-950 p-1.5 rounded border border-sky-900">
                      <strong>Mitigation:</strong> Embed Silver Generation Ambassadors &amp; Active Ageing Centres (AACs 2.0) into every public housing cluster.
                    </div>
                  </div>
                </div>
              </div>

              {/* BOX 6: WHAT DOES SOLUTION INVOLVE? TECH & SCOPE */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="h-4 w-4 text-purple-400" />
                    <span>Solution Scope &amp; Tech</span>
                  </h3>
                  <span className="text-[10px] font-mono text-purple-400">Vite • Node • MCP</span>
                </div>

                <div className="space-y-3">
                  <div className="bg-purple-950/40 border border-purple-800/60 p-3 rounded-xl">
                    <div className="text-[11px] font-bold text-purple-300 mb-1">Primary Scope</div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      &ldquo;the solution should inform the future service for seniors&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Aligns with national Age Well SG &amp; Healthier SG masterplans by enabling early warning modeling.
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs space-y-1.5 text-slate-300">
                    <div className="font-semibold text-white">Technology Stack:</div>
                    <div>• <strong>Protocol:</strong> Model Context Protocol 1.30.1</div>
                    <div>• <strong>Engine:</strong> Stateless Streamable HTTP (/api/mcp)</div>
                    <div>• <strong>Integrations:</strong> NCBI, WHO, OECD, News syndication</div>
                  </div>
                </div>
              </div>

              {/* BOX 7: WHO ARE THE STAKEHOLDERS? */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span>Who are the Stakeholders?</span>
                  </h3>
                  <button
                    onClick={() => handleVote('stakeholder_aic')}
                    className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 text-[10px] font-mono border border-blue-800"
                  >
                    👍 {votes.stakeholder_aic}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-blue-950/40 border border-blue-800/60 p-2.5 rounded-xl">
                    <div className="text-[10px] text-blue-300 font-mono uppercase font-semibold">Stakeholder 1</div>
                    <div className="text-xs font-bold text-white mt-0.5">Healthcare Planning Teams</div>
                    <div className="text-[10px] text-slate-400 mt-1">Regional Health Systems</div>
                  </div>

                  <div className="bg-blue-950/40 border border-blue-800/60 p-2.5 rounded-xl">
                    <div className="text-[10px] text-blue-300 font-mono uppercase font-semibold">Stakeholder 2</div>
                    <div className="text-xs font-bold text-white mt-0.5">Ministry of Health (MOH)</div>
                    <div className="text-[10px] text-slate-400 mt-1">Policy &amp; Financing</div>
                  </div>

                  <div className="bg-blue-950/40 border border-blue-800/60 p-2.5 rounded-xl">
                    <div className="text-[10px] text-blue-300 font-mono uppercase font-semibold">Stakeholder 3</div>
                    <div className="text-xs font-bold text-white mt-0.5">Community Care Organisations</div>
                    <div className="text-[10px] text-slate-400 mt-1">Day Care &amp; Nursing VWOs</div>
                  </div>

                  <div className="bg-blue-950/40 border border-blue-800/60 p-2.5 rounded-xl">
                    <div className="text-[10px] text-blue-300 font-mono uppercase font-semibold">Stakeholder 4</div>
                    <div className="text-xs font-bold text-white mt-0.5">Agency for Integrated Care (AIC)</div>
                    <div className="text-[10px] text-slate-400 mt-1">National Sector Integrator</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* BOX 8: THE FOCAL FORESIGHT INQUIRY (HIGHLIGHTED ARROW AT BOTTOM OF IMAGE) */}
            {/* ===================================================================== */}
            <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-2 border-cyan-500/70 rounded-2xl p-6 shadow-2xl relative">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-900/60 border border-cyan-700/60 text-cyan-300 text-xs font-bold font-mono">
                    <Compass className="h-3.5 w-3.5 animate-spin" />
                    <span>THE FOCAL STRATEGIC INQUIRY (Bottom Cyan Note)</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    &ldquo;What problems emerged after countries expanded ageing-in-place and long-term-care provision, and which early warning indicators suggest Singapore may face the same problems between 2030 and 2035?&rdquo;
                  </h3>
                  <p className="text-xs sm:text-sm text-cyan-200/80 max-w-4xl">
                    Analyzing lessons from universal LTCI in Japan, UK NHS/social care bed-blocking, and German informal cash-care markets to insulate Singapore’s super-aged trajectory.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleVote('focal_singapore')}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center space-x-2"
                  >
                    <span>🔥 Priority Vote:</span>
                    <span className="text-cyan-400">{votes.focal_singapore}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('singapore')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/30 flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>Launch Singapore 2030–2035 Simulator</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SINGAPORE 2030-2035 EARLY WARNING RADAR & COMPARATIVE EXPANSION    */}
        {/* ========================================================================= */}
        {activeTab === 'singapore' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold mb-1">
                    <Compass className="h-4 w-4" />
                    <span>Foresight Deep-Dive: Singapore 2030–2035 Super-Aged Transition</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Ageing-in-Place Early Warning Indicator Radar
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                    By 2026, Singapore becomes a &ldquo;super-aged&rdquo; society (&gt;21% aged 65+), approaching 1 in 4 citizens by 2030. Here is how international pitfalls translate into early warning indicators for Singapore.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['all', 'Demographic', 'Healthcare', 'Caregiver', 'Social'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setIndicatorCategoryFilter(cat)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                        indicatorCategoryFilter === cat
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? 'All Metrics' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Early Warning Indicator Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredIndicators.map((ind) => (
                <div
                  key={ind.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                        {ind.category}
                      </span>
                      <span className="text-[10px] text-rose-400 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">
                        Alert: {ind.warning_threshold}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-sm leading-snug">{ind.metric}</h3>

                    {/* Timeline Comparison */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-center font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">2020</div>
                        <div className="font-semibold text-slate-300 mt-0.5">{ind.baseline_2020}</div>
                      </div>
                      <div className="border-x border-slate-800 px-1">
                        <div className="text-[10px] text-amber-400">2030 (Proj)</div>
                        <div className="font-bold text-amber-300 mt-0.5">{ind.projected_2030}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-rose-400">2035 (Critical)</div>
                        <div className="font-bold text-rose-400 mt-0.5">{ind.projected_2035}</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <strong className="text-slate-400">Singapore Implication:</strong>
                      <p className="text-slate-300">{ind.singapore_implication}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      Recommended Mitigation Policy:
                    </div>
                    <p className="text-xs text-slate-200 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40">
                      {ind.mitigation_strategy}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* International Lessons Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-800">
                <Globe2 className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  What Problems Emerged After Countries Expanded Ageing-In-Place?
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTERNATIONAL_EXPANSION_LESSONS.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                        {item.country}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Policy Reform Benchmark</span>
                    </div>

                    <div className="text-xs text-slate-300 font-semibold">{item.policy_reform}</div>

                    <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-xs text-rose-200">
                      <strong>Unintended Pitfall:</strong> {item.unintended_consequence}
                    </div>

                    <div className="text-xs text-slate-400">
                      <strong className="text-cyan-400">Relevance to Singapore 2030–2035:</strong> {item.relevance_to_singapore}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stakeholder Action Matrix Interactive Tabs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-800">
                <Users className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Stakeholder Engagement &amp; 2030 Action Roadmap
                </h3>
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-3 mb-4 border-b border-slate-800">
                {STAKEHOLDER_MATRIX.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStakeholder(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedStakeholder === s.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[11px] font-mono text-blue-400 uppercase">Mandate &amp; Role</div>
                  <div className="text-sm font-bold text-white">{activeStakeholderData.name}</div>
                  <p className="text-xs text-slate-300">{activeStakeholderData.role}</p>
                  <div className="pt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                      Status: {activeStakeholderData.engagement_status}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[11px] font-mono text-amber-400 uppercase">Key Systemic Risks</div>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {activeStakeholderData.systemic_risks_faced.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[11px] font-mono text-emerald-400 uppercase">Recommended 2030 Action Plan</div>
                  <ul className="list-disc list-inside text-xs text-slate-200 space-y-1">
                    {activeStakeholderData.recommended_actions_2030.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: WEAK SIGNALS & HORIZON 1-3 SCANNING MATRIX                         */}
        {/* ========================================================================= */}
        {activeTab === 'horizon' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Radio className="h-5 w-5 text-pink-400" />
                    <span>Emerging Trends &amp; Weak Signals Matrix</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Detecting faint clinical, technological, and societal signals across Horizons 1, 2, and 3 before they become macro crises.
                  </p>
                </div>

                <div className="flex space-x-1.5">
                  {['all', 'Horizon 1', 'Horizon 2', 'Horizon 3'].map((h) => (
                    <button
                      key={h}
                      onClick={() => setSelectedHorizonFilter(h)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedHorizonFilter === h
                          ? 'bg-pink-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {h === 'all' ? 'All Horizons' : h}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {horizonTrends
                .filter((t) => selectedHorizonFilter === 'all' || t.horizon_timeline.includes(selectedHorizonFilter))
                .map((trend) => (
                  <div
                    key={trend.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-pink-950 text-pink-300 border border-pink-800">
                          {trend.horizon_timeline}
                        </span>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          {trend.theme}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-3">
                        <div className="text-[11px] font-bold text-pink-400 flex items-center space-x-1 mb-1">
                          <Radio className="h-3 w-3" />
                          <span>WEAK SIGNAL</span>
                        </div>
                        <p className="text-xs text-slate-200">{trend.weak_signal}</p>
                      </div>

                      <div className="text-xs text-slate-300 space-y-2">
                        <div>
                          <strong className="text-slate-400">Drivers:</strong> {trend.drivers_of_change}
                        </div>
                        <div>
                          <strong className="text-slate-400">Senior Implication:</strong> {trend.implications_for_seniors}
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-indigo-950/40 border border-indigo-900/50 rounded-xl text-xs text-indigo-100">
                        <div className="text-[11px] font-bold text-indigo-400 flex items-center space-x-1 mb-1">
                          <Lightbulb className="h-3 w-3 text-amber-400" />
                          <span>FUTURE ADAPTIVE SERVICE CONCEPT</span>
                        </div>
                        {trend.future_service_concept}
                      </div>

                      {brainstormedIdeas[trend.id] && brainstormedIdeas[trend.id].length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800 space-y-1">
                          <div className="text-[10px] text-teal-400 font-semibold">User Ideas:</div>
                          {brainstormedIdeas[trend.id].map((idea, idx) => (
                            <div key={idx} className="text-xs text-slate-300 bg-slate-950 p-1.5 rounded border border-slate-800">
                              • {idea}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      {customIdeaTrendId === trend.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={customIdeaInput}
                            onChange={(e) => setCustomIdeaInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddBrainstormIdea(trend.id)}
                            placeholder="Type an adaptive service idea..."
                            className="w-full text-xs p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-pink-500"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAddBrainstormIdea(trend.id)}
                              className="px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded text-xs font-semibold"
                            >
                              Save Idea
                            </button>
                            <button
                              onClick={() => {
                                setCustomIdeaTrendId(null);
                                setCustomIdeaInput('');
                              }}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCustomIdeaTrendId(trend.id)}
                          className="text-xs text-pink-400 hover:text-pink-300 font-medium flex items-center space-x-1"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>Brainstorm Adaptive Service Idea</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CURRENT SERVICES FOR SENIORS                                       */}
        {/* ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-amber-400" />
                    <span>Current Services for Seniors — Baseline Catalog</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Analyzing existing operational eldercare models, friction points, and opportunities for systemic adaptation.
                  </p>
                </div>

                <div className="flex space-x-1.5">
                  {['all', 'Home', 'Facility', 'Digital'].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setServiceChannelFilter(ch)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                        serviceChannelFilter === ch
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ch === 'all' ? 'All Channels' : ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Filter existing services (e.g. personal care, memory, meal, mobility)..."
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {servicesList
                .filter((s) => {
                  const matchCh = serviceChannelFilter === 'all' || s.delivery_channel.includes(serviceChannelFilter);
                  const matchQ =
                    !serviceSearch ||
                    s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                    s.description.toLowerCase().includes(serviceSearch.toLowerCase());
                  return matchCh && matchQ;
                })
                .map((svc) => (
                  <div
                    key={svc.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50">
                          {svc.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {svc.delivery_channel}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-100 text-sm">{svc.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">{svc.description}</p>

                      <div className="mt-3 text-xs text-slate-400">
                        <strong>Target:</strong> {svc.target_cohort}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-rose-400">Friction Points:</span>
                          <ul className="list-disc list-inside text-slate-300 mt-0.5 space-y-0.5">
                            {svc.current_challenges.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                        Adaptive Opportunity:
                      </div>
                      <p className="text-xs text-slate-200 bg-slate-950 p-2 rounded-lg border border-slate-800">
                        {svc.future_opportunity}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: OECD DEMOGRAPHIC DATA                                              */}
        {/* ========================================================================= */}
        {activeTab === 'oecd' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-indigo-400" />
                    <span>OECD Demographic Data &amp; Aging Society Statistics</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Macro indicators on old-age dependency ratios, elder population shares, and health economics across OECD member states.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Country / Member Group</label>
                  <select
                    value={oecdCountry}
                    onChange={(e) => setOecdCountry(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="OED">OECD Members (Aggregate)</option>
                    <option value="USA">United States (USA)</option>
                    <option value="JPN">Japan (JPN)</option>
                    <option value="DEU">Germany (DEU)</option>
                    <option value="GBR">United Kingdom (GBR)</option>
                    <option value="FRA">France (FRA)</option>
                    <option value="ITA">Italy (ITA)</option>
                    <option value="CAN">Canada (CAN)</option>
                    <option value="AUS">Australia (AUS)</option>
                    <option value="KOR">South Korea (KOR)</option>
                    <option value="SWE">Sweden (SWE)</option>
                    <option value="ESP">Spain (ESP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">OECD Indicator</label>
                  <select
                    value={oecdIndicator}
                    onChange={(e) => setOecdIndicator(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SP.POP.DPND.OL">Age dependency ratio, old (% of working-age pop)</option>
                    <option value="SP.POP.65UP.TO.ZS">Population ages 65 and above (% of total)</option>
                    <option value="SP.DYN.LE00.IN">Life expectancy at birth (years)</option>
                    <option value="SH.XPD.CHEX.GD.ZS">Current health expenditure (% of GDP)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => fetchOecdData()}
                    disabled={oecdLoading}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20"
                  >
                    {oecdLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    <span>Query OECD Data</span>
                  </button>
                </div>
              </div>
            </div>

            {oecdError && (
              <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <span>{oecdError}</span>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">
                  OECD Historical Timeline: {oecdCountry} ({oecdResults.length} data points)
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Upstream: OECD / World Bank Open Data
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Country</th>
                      <th className="py-3 px-4">Metric Value</th>
                      <th className="py-3 px-4">Trend Bar</th>
                      <th className="py-3 px-4">Indicator Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {oecdResults.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white">{item.year}</td>
                        <td className="py-3 px-4 text-slate-300 font-medium">{item.country_name} ({item.country_code})</td>
                        <td className="py-3 px-4 font-mono text-indigo-400 font-semibold text-sm">
                          {item.value != null ? `${item.value} ${item.unit}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-32 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, Math.max(5, (item.value || 0) * 1.5))}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono">{item.indicator_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: MCP PROTOCOL & TOOL INSPECTOR                                      */}
        {/* ========================================================================= */}
        {activeTab === 'mcp' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: 5 Registered Tools List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-emerald-400" />
                  <span>5 Registered MCP Tools</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Select a tool below to view its schema, annotations, and trigger real-time tool execution.
                </p>

                <div className="space-y-3">
                  {/* Tool 1 */}
                  <div
                    onClick={() => selectPresetMcpTool('silver_pulse_get_singapore_early_warning')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      mcpSelectedTool === 'silver_pulse_get_singapore_early_warning'
                        ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        silver_pulse_get_singapore_early_warning
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="mt-2 text-xs text-slate-300 line-clamp-2">
                      Early warning indicators and international lessons for Singapore’s 2030-2035 ageing-in-place transition.
                    </p>
                    <div className="mt-3 flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        readOnlyHint: true
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        openWorldHint: true
                      </span>
                    </div>
                  </div>

                  {/* Tool 2 */}
                  <div
                    onClick={() => selectPresetMcpTool('silver_pulse_get_oecd_demographics')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      mcpSelectedTool === 'silver_pulse_get_oecd_demographics'
                        ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        silver_pulse_get_oecd_demographics
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="mt-2 text-xs text-slate-300 line-clamp-2">
                      OECD demographic statistics (dependency ratios, elder population %, health expenditures).
                    </p>
                    <div className="mt-3 flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        readOnlyHint: true
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        openWorldHint: true
                      </span>
                    </div>
                  </div>

                  {/* Tool 3 */}
                  <div
                    onClick={() => selectPresetMcpTool('silver_pulse_search_pubmed')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      mcpSelectedTool === 'silver_pulse_search_pubmed'
                        ? 'bg-slate-900 border-teal-500 shadow-lg shadow-teal-950/40 ring-1 ring-teal-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-teal-400">
                        silver_pulse_search_pubmed
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="mt-2 text-xs text-slate-300 line-clamp-2">
                      NCBI PubMed E-utilities to retrieve medical literature citations, study abstracts, and authors.
                    </p>
                    <div className="mt-3 flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        readOnlyHint: true
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        openWorldHint: true
                      </span>
                    </div>
                  </div>

                  {/* Tool 4 */}
                  <div
                    onClick={() => selectPresetMcpTool('silver_pulse_fetch_news')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      mcpSelectedTool === 'silver_pulse_fetch_news'
                        ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        silver_pulse_fetch_news
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="mt-2 text-xs text-slate-300 line-clamp-2">
                      Google News RSS syndication feeds for senior care, policy, and geriatric news.
                    </p>
                    <div className="mt-3 flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        readOnlyHint: true
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        openWorldHint: true
                      </span>
                    </div>
                  </div>

                  {/* Tool 5 */}
                  <div
                    onClick={() => selectPresetMcpTool('silver_pulse_get_who_demographics')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      mcpSelectedTool === 'silver_pulse_get_who_demographics'
                        ? 'bg-slate-900 border-violet-500 shadow-lg shadow-violet-950/40 ring-1 ring-violet-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-violet-400">
                        silver_pulse_get_who_demographics
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                    <p className="mt-2 text-xs text-slate-300 line-clamp-2">
                      WHO Global Health Observatory Athena OData for national longevity statistics.
                    </p>
                    <div className="mt-3 flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        readOnlyHint: true
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        openWorldHint: true
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs space-y-2">
                  <div className="font-semibold text-slate-300 flex items-center space-x-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Guardrails &amp; Specs</span>
                  </div>
                  <div className="text-slate-400 space-y-1">
                    <div>• <strong>Protocol:</strong> Model Context Protocol 1.30.1</div>
                    <div>• <strong>Transport:</strong> Streamable HTTP (Stateless)</div>
                    <div>• <strong>Method:</strong> POST /api/mcp</div>
                    <div>• <strong>Non-POST response:</strong> 405 Method Not Allowed</div>
                    <div>• <strong>Security:</strong> Read-only tools, no write, no keys exposed</div>
                  </div>
                </div>
              </div>

              {/* Right Columns: Tool Tester & Live JSON-RPC Runner */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Active Tool Target</div>
                      <div className="font-mono text-base text-cyan-400 font-bold mt-0.5">{mcpSelectedTool}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={copyMcpCurl}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                      >
                        {copiedCurl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                        <span>{copiedCurl ? 'Copied cURL' : 'Copy cURL'}</span>
                      </button>
                      <button
                        onClick={handleTestMcpCall}
                        disabled={mcpLoading}
                        className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                      >
                        {mcpLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Terminal className="h-3.5 w-3.5" />}
                        <span>Execute Tool Call</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className="block text-xs font-medium text-slate-300">
                      Tool Arguments JSON <span className="text-slate-500">(validated with Zod schema)</span>:
                    </label>
                    <textarea
                      value={mcpArguments}
                      onChange={(e) => setMcpArguments(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-950 font-mono text-xs text-cyan-300 p-3 rounded-lg border border-slate-800 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-300">
                        Live MCP Server Response <span className="text-slate-500">(JSON-RPC 2.0 via StreamableHTTP)</span>:
                      </label>
                      {mcpResponse && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                          JSON-RPC 2.0 Success
                        </span>
                      )}
                    </div>

                    <div className="relative bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs max-h-96 overflow-y-auto">
                      {mcpLoading ? (
                        <div className="flex items-center space-x-2 text-cyan-400 py-6 justify-center">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Dispatching tool request to /api/mcp...</span>
                        </div>
                      ) : mcpResponse ? (
                        <pre className="text-slate-300 whitespace-pre-wrap">{mcpResponse}</pre>
                      ) : (
                        <div className="text-slate-500 py-6 text-center">
                          Click &quot;Execute Tool Call&quot; above to test this tool directly against the local MCP server endpoint.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: PUBMED RESEARCH EXPLORER                                           */}
        {/* ========================================================================= */}
        {activeTab === 'pubmed' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-teal-400" />
                    <span>NCBI PubMed Geriatric Literature Explorer</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct integration with NCBI E-utilities API returning peer-reviewed clinical citations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {['Cognitive decline', 'Frailty & sarcopenia', 'Polypharmacy', 'Fall prevention'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setPubMedQuery(tag);
                        fetchPubMed(tag);
                      }}
                      className="px-2.5 py-1 text-xs rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={pubMedQuery}
                    onChange={(e) => setPubMedQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchPubMed()}
                    placeholder="Search PubMed medical literature..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="w-28">
                  <select
                    value={pubMedLimit}
                    onChange={(e) => setPubMedLimit(parseInt(e.target.value, 10))}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value={5}>5 items</option>
                    <option value={10}>10 items</option>
                    <option value={15}>15 items</option>
                    <option value={20}>20 items</option>
                  </select>
                </div>
                <button
                  onClick={() => fetchPubMed()}
                  disabled={pubMedLoading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-md shadow-teal-600/20"
                >
                  {pubMedLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span>Search</span>
                </button>
              </div>
            </div>

            {pubMedError && (
              <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <span>{pubMedError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pubMedResults.map((article) => (
                <div
                  key={article.pmid}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                        PMID: {article.pmid}
                      </span>
                      <span>{article.pub_date}</span>
                    </div>
                    <h3 className="font-semibold text-slate-100 text-sm line-clamp-3 leading-snug">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-400 line-clamp-1 italic">
                      {article.journal}
                    </p>
                    {article.authors.length > 0 && (
                      <p className="mt-1 text-xs text-slate-400 line-clamp-1 flex items-center space-x-1">
                        <User className="h-3 w-3 text-slate-400" />
                        <span>{article.authors.slice(0, 3).join(', ')}{article.authors.length > 3 ? ' et al.' : ''}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    {article.doi ? (
                      <span className="text-slate-400 font-mono text-[11px] truncate max-w-[180px]">
                        DOI: {article.doi}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">PubMed Indexed</span>
                    )}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
                    >
                      <span>NCBI Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: SENIOR CARE NEWS                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Newspaper className="h-5 w-5 text-blue-400" />
                    <span>Global &amp; Regional Senior Care News</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Syndicated health and public policy updates on aging and elderly healthcare services.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newsTopic}
                    onChange={(e) => setNewsTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchNewsArticles()}
                    placeholder="Topic (e.g. dementia, long-term care, Medicare)..."
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="w-36">
                  <select
                    value={newsCountry}
                    onChange={(e) => setNewsCountry(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="US">United States (US)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="CA">Canada (CA)</option>
                    <option value="AU">Australia (AU)</option>
                  </select>
                </div>
                <button
                  onClick={() => fetchNewsArticles()}
                  disabled={newsLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20"
                >
                  {newsLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span>Fetch News</span>
                </button>
              </div>
            </div>

            {newsError && (
              <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <span>{newsError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsResults.map((article, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-medium text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                        {article.source}
                      </span>
                      <span className="text-[11px]">{article.pub_date ? article.pub_date.substring(0, 16) : ''}</span>
                    </div>
                    <h3 className="font-semibold text-slate-100 text-sm line-clamp-3 leading-snug">
                      {article.title}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 uppercase font-mono text-[10px]">
                      Country: {article.country}
                    </span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
                    >
                      <span>Read Story</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: WHO LONGEVITY                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'who' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Globe2 className="h-5 w-5 text-violet-400" />
                    <span>WHO Global Health Observatory Demographics</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Official OData indicators for national longevity, healthy life expectancies (HALE), and aging metrics.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Country</label>
                  <select
                    value={whoCountry}
                    onChange={(e) => setWhoCountry(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="USA">United States (USA)</option>
                    <option value="JPN">Japan (JPN)</option>
                    <option value="DEU">Germany (DEU)</option>
                    <option value="GBR">United Kingdom (GBR)</option>
                    <option value="CAN">Canada (CAN)</option>
                    <option value="FRA">France (FRA)</option>
                    <option value="AUS">Australia (AUS)</option>
                    <option value="ITA">Italy (ITA)</option>
                    <option value="ESP">Spain (ESP)</option>
                    <option value="CHE">Switzerland (CHE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Indicator</label>
                  <select
                    value={whoIndicator}
                    onChange={(e) => setWhoIndicator(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="WHOSIS_000001">Life expectancy at birth (years)</option>
                    <option value="WHOSIS_000002">Healthy life expectancy (HALE) at birth</option>
                    <option value="WHOSIS_000015">Life expectancy at age 60 (years)</option>
                    <option value="WHOSIS_000007">Healthy life expectancy (HALE) at age 60</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => fetchWhoData()}
                    disabled={whoLoading}
                    className="w-full py-2 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-md shadow-violet-600/20"
                  >
                    {whoLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    <span>Query WHO API</span>
                  </button>
                </div>
              </div>
            </div>

            {whoError && (
              <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <span>{whoError}</span>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">
                  Historical Records: {whoCountry} ({whoResults.length} records returned)
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Upstream: WHO GHO Athena OData
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Demographic Cohort</th>
                      <th className="py-3 px-4">Value (Years)</th>
                      <th className="py-3 px-4">Display Range</th>
                      <th className="py-3 px-4">Indicator Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {whoResults.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white">{item.year}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              item.sex === 'Both sexes'
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                                : item.sex === 'Female'
                                ? 'bg-pink-950 text-pink-300 border border-pink-800/60'
                                : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                            }`}
                          >
                            {item.sex}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-cyan-400 font-semibold text-sm">
                          {item.value != null ? item.value : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono">{item.display_value}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{item.indicator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-cyan-500" />
            <span className="font-semibold text-slate-300">Silver Pulse</span>
            <span>— Horizon Scanning for Seniors of the Future</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>5 Model Context Protocol Tools</span>
            <span>•</span>
            <span>MOH / AIC Strategic Alignment</span>
            <span>•</span>
            <span>Singapore 2030–2035 Horizon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
