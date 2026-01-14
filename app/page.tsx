"use client";

import React, { useState } from "react";
import { useTheme } from "@/app/components/theme-provider";
import { toCorsUrl } from "@/lib/utils";

type ResourceType = 'image' | 'video';
type ResourceInfo = {
  filename: string;
  width: number;
  height: number;
  url: string;
  type: ResourceType;
};

export default function Home() {
  const { isDarkMode, toggleDarkMode, primaryColor, setPrimaryColor } = useTheme();

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ResourceInfo[] | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }
    // Allow any URL for demo purposes if it looks vaguely valid, but warn if not IG
    if (!url.includes("instagram.com") && !url.includes("ig.me")) {
      // We still allow it for the mock demo, but could block here
      // setError("Please enter a valid Instagram URL.");
      // return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`/api/ig/analyze?url=${encodeURIComponent(url)}`);
      console.log('Res: ', res)
      const json = await res.json();
      console.log('Json: ', json)
      if (res.ok && json.data.length > 0) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to analyze URL.");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 transition-colors duration-300  text-[17px]">
      <div className="max-w-2xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">IG Downloader</h1>
            <p className="text-sm text-gray-500 mt-1">Download Videos & Photos instantly</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors">
              <span className="text-xs text-foreground/70">主题色</span>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-6 w-6 rounded cursor-pointer border border-border"
                title="更改主题颜色"
              />
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors text-foreground"
              title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-8 transition-all">
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Instagram Link</label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste link here (e.g. https://www.instagram.com/p/...)"
                className="w-full px-4 py-3 rounded-lg border border-input bg-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-primary-foreground font-medium transition-all shadow-md active:scale-[0.98] 
                ${loading ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'} font-youshe`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-primary-foreground" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "解析"
              )}
            </button>
          </div>
        </div>

        {data && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {data.map((item, idx) => (
              <ResourceCard key={idx} info={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const ResourceCard: React.FC<{ info: ResourceInfo }> = ({ info }) => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="aspect-[4/5] bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center">
        {info.type === 'video' ? (
          <video
            src={toCorsUrl(info.url)}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            key={info.filename}
            src={toCorsUrl(info.url)}
            alt={info.filename}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}

        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          {info.type.toUpperCase()}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="truncate pr-4 w-full">
            <h3 className="text-sm font-medium text-foreground truncate" title={info.filename}>
              {info.filename}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {info.width} x {info.height}
            </p>
          </div>
        </div>

        <a
        
          href={`/api/download?url=${encodeURIComponent(info.url)}&filename=${encodeURIComponent(info.filename)}`}
          download={info.filename}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2.5 rounded-lg border-2 border-primary bg-primary text-primary-foreground hover:bg-primary-hover font-12px font-youshe text-base transition-colors"
        >
          下载
        </a>
      </div>
    </div>
  );
};