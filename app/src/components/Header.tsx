'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_PROJECTS } from '@/lib/mockData';

export default function Header() {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(MOCK_PROJECTS[0]);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6">
      {/* Project Selector */}
      <div className="relative">
        <button
          onClick={() => {
            setProjectMenuOpen(!projectMenuOpen);
            setUserMenuOpen(false);
          }}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 transition-colors"
        >
          <span className="font-medium">{selectedProject.business_name}</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {projectMenuOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50">
            <div className="py-1">
              <p className="px-3 py-2 text-xs text-slate-500 uppercase tracking-wider">Switch Project</p>
              {MOCK_PROJECTS.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project);
                    setProjectMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition-colors ${
                    selectedProject.id === project.id ? 'text-blue-400' : 'text-slate-200'
                  }`}
                >
                  {project.business_name}
                </button>
              ))}
              <div className="border-t border-slate-700 mt-1 pt-1">
                <Link
                  href="/projects/new"
                  onClick={() => setProjectMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Project
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setProjectMenuOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50">
              <div className="py-1">
                <div className="px-3 py-2 border-b border-slate-700">
                  <p className="text-sm text-slate-200 font-medium">Admin User</p>
                  <p className="text-xs text-slate-500">admin@tool.local</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  Settings
                </Link>
                <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside overlay */}
      {(projectMenuOpen || userMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setProjectMenuOpen(false);
            setUserMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}
