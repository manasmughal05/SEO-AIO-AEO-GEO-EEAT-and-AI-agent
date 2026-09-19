import React from 'react';
import { 
  Cpu, Globe2, Shield, Settings2, Smartphone, Monitor, Sparkles, 
  ChevronDown, ChevronUp, Zap, HelpCircle, Wifi, Compass, Network
} from 'lucide-react';

export interface EnterpriseAuditSettings {
  targetEngine: 'google' | 'chatgpt' | 'copilot' | 'perplexity' | 'baidu' | 'yandex';
  deviceSimulation: 'mobile' | 'desktop' | 'googlebot' | 'bingbot';
  crawlDepth: 3 | 6 | 12;
  connectionSpeed: '5g' | '4g' | '3g';
}

interface EnterpriseAuditOptionsProps {
  settings: EnterpriseAuditSettings;
  onChange: (settings: EnterpriseAuditSettings) => void;
  crawlerRegion: string;
  onCrawlerRegionChange: (region: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const EnterpriseAuditOptions: React.FC<EnterpriseAuditOptionsProps> = ({
  settings,
  onChange,
  crawlerRegion,
  onCrawlerRegionChange,
  isOpen,
  onToggle
}) => {

  const handleUpdate = <K extends keyof EnterpriseAuditSettings>(key: K, value: EnterpriseAuditSettings[K]) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="w-full bg-slate-900/40 rounded-3xl border border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
      
      {/* Accordion Toggle Header */}
      <button
        type="button"
        id="enterprise-settings-toggle-btn"
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-slate-950/80 to-slate-900/60 hover:from-slate-950 hover:to-slate-900 transition-colors cursor-pointer select-none border-b border-slate-800/60"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-400">
            <Settings2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Enterprise Suite
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold uppercase border border-emerald-500/30 animate-pulse">
                Active Global Profile
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-100">
              Configure Global Search Engines, Crawler Nodes & User Agents
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
            Region: <span className="text-cyan-400 font-bold uppercase">{crawlerRegion}</span> • Agent: <span className="text-indigo-400 font-bold uppercase">{settings.deviceSimulation}</span>
          </span>
          <div className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Accordion Content Panel */}
      {isOpen && (
        <div className="p-5 bg-slate-950/40 divide-y divide-slate-800/60 space-y-5 animate-fade-in">
          
          {/* Section 1: Target Engine Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-4">
            <div className="lg:col-span-3">
              <h5 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Target Search Engine
              </h5>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Choose the target platform index model you wish to simulate visibility for.
              </p>
            </div>
            
            <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'google', label: 'Google Search', detail: 'AI Overviews & Search', color: 'border-blue-500/30 hover:border-blue-500/60 text-blue-400' },
                { id: 'chatgpt', label: 'OpenAI SearchGPT', detail: 'Conversational Indexing', color: 'border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400' },
                { id: 'copilot', label: 'Bing Copilot', detail: 'Microsoft Unified Index', color: 'border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400' },
                { id: 'perplexity', label: 'Perplexity AI', detail: 'Smart Discovery Model', color: 'border-fuchsia-500/30 hover:border-fuchsia-500/60 text-fuchsia-400' },
                { id: 'baidu', label: 'Baidu Search', detail: 'East Asia Index Core', color: 'border-indigo-500/30 hover:border-indigo-500/60 text-indigo-400' },
                { id: 'yandex', label: 'Yandex Web', detail: 'Eastern Europe Portal', color: 'border-amber-500/30 hover:border-amber-500/60 text-amber-400' },
              ].map((engine) => (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => handleUpdate('targetEngine', engine.id as any)}
                  className={`p-3 rounded-2xl bg-slate-900/60 border text-left transition-all relative overflow-hidden group cursor-pointer ${
                    settings.targetEngine === engine.id
                      ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-slate-900 shadow-md shadow-cyan-950/50'
                      : 'border-slate-800 hover:bg-slate-900/30'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {engine.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {engine.detail}
                    </span>
                  </div>
                  {settings.targetEngine === engine.id && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Regional Crawler Nodes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4 pb-4">
            <div className="lg:col-span-3">
              <h5 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                Regional Crawler Node
              </h5>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Select from premium global network nodes to bypass localized ISP latency restrictions.
              </p>
            </div>
            
            <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'us-east', label: 'US-East (Virginia)', ping: '12ms', ip: '34.86.x.x', status: 'Online' },
                { id: 'europe-west', label: 'EU-West (Frankfurt)', ping: '35ms', ip: '35.244.x.x', status: 'Online' },
                { id: 'asia-east', label: 'Asia-East (Singapore)', ping: '68ms', ip: '104.199.x.x', status: 'Online' },
                { id: 'me-south', label: 'ME-South (Karachi)', ping: '92ms', ip: '34.120.x.x', status: 'Online' },
                { id: 'sa-east', label: 'SA-East (São Paulo)', ping: '115ms', ip: '35.198.x.x', status: 'Online' },
              ].map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onCrawlerRegionChange(node.id)}
                  className={`p-3 rounded-2xl bg-slate-900/60 border text-left transition-all relative overflow-hidden cursor-pointer ${
                    crawlerRegion === node.id
                      ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-slate-900 shadow-md'
                      : 'border-slate-800 hover:bg-slate-900/30'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-slate-100">
                      {node.label}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-slate-400">
                      <span className="text-emerald-400 font-bold">● {node.status}</span>
                      <span>•</span>
                      <span>Ping: {node.ping}</span>
                    </div>
                  </div>
                  {crawlerRegion === node.id && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Device simulation and connection speed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            {/* User Agent Device Simulation */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                User Agent & Device Simulation
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'mobile', label: 'iPhone (Safari)', icon: Smartphone, detail: 'Mobile simulation' },
                  { id: 'desktop', label: 'Chrome Windows', icon: Monitor, detail: 'High-end workstation' },
                  { id: 'googlebot', label: 'Googlebot Mobile', icon: Cpu, detail: 'Official Search Crawler' },
                  { id: 'bingbot', label: 'Bingbot Desktop', icon: Network, detail: 'Microsoft Crawler' },
                ].map((device) => {
                  const Icon = device.icon;
                  return (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => handleUpdate('deviceSimulation', device.id as any)}
                      className={`p-2.5 rounded-xl bg-slate-900/60 border text-left transition-all flex items-center gap-2 relative cursor-pointer ${
                        settings.deviceSimulation === device.id
                          ? 'border-indigo-500 bg-slate-900 ring-1 ring-indigo-500/20'
                          : 'border-slate-800 hover:bg-slate-900/30'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-100 truncate">{device.label}</div>
                        <div className="text-[9px] text-slate-400 font-mono leading-none">{device.detail}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Depth and speed parameters */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                Simulated Latency & Crawl Depth
              </h5>
              <div className="grid grid-cols-2 gap-2">
                
                {/* Pages depth */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Crawl Depth Limit:
                  </span>
                  <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-0.5">
                    {[3, 6, 12].map((depth) => (
                      <button
                        key={depth}
                        type="button"
                        onClick={() => handleUpdate('crawlDepth', depth as any)}
                        className={`flex-1 py-1 text-center font-mono text-xs rounded-lg transition-all cursor-pointer ${
                          settings.crawlDepth === depth
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {depth}p
                      </button>
                    ))}
                  </div>
                </div>

                {/* Connection Speed */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Connection Speed:
                  </span>
                  <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-0.5">
                    {[
                      { id: '5g', label: '5G' },
                      { id: '4g', label: '4G' },
                      { id: '3g', label: '3G' },
                    ].map((speed) => (
                      <button
                        key={speed.id}
                        type="button"
                        onClick={() => handleUpdate('connectionSpeed', speed.id as any)}
                        className={`flex-1 py-1 text-center font-mono text-xs rounded-lg transition-all cursor-pointer ${
                          settings.connectionSpeed === speed.id
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {speed.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
