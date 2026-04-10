import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Users, LogOut } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: implement Supabase logout
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 border-t-4 border-[#350285]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col hidden md:flex">
        <div className="flex items-center justify-center h-16 border-b border-gray-100 px-4">
          <span className="text-xl font-bold bg-gradient-to-r from-[#350285] to-[#f4268e] bg-clip-text text-transparent">ComMarília SaaS</span>
        </div>
        <div className="overflow-y-auto overflow-x-hidden flex-grow">
          <ul className="flex flex-col py-4 space-y-1 px-4">
            <li>
              <Link to="/dashboard" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-[#f4268e] pr-6 rounded-md">
                <span className="inline-flex justify-center items-center ml-2">
                  <LayoutDashboard className="w-5 h-5" />
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Visão Geral</span>
              </Link>
            </li>
            <li className="px-5">
              <div className="flex flex-row items-center h-8">
                <div className="text-sm font-light tracking-wide text-gray-400">Conteúdo</div>
              </div>
            </li>
            <li>
              <Link to="/dashboard/stories" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-[#350285] pr-6 rounded-md">
                <span className="inline-flex justify-center items-center ml-2">
                  <FileText className="w-5 h-5" />
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Meus Stories</span>
              </Link>
            </li>
            <li>
              <Link to="/dashboard/card-builder" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-[#f4268e] pr-6 rounded-md">
                <span className="inline-flex justify-center items-center ml-2">
                  <FileText className="w-5 h-5" />
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Criador de Cards</span>
              </Link>
            </li>
            <li className="px-5">
              <div className="flex flex-row items-center h-8">
                <div className="text-sm font-light tracking-wide text-gray-400">Configurações</div>
              </div>
            </li>
            <li>
              <Link to="/dashboard/tenant" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-[#350285] pr-6 rounded-md">
                <span className="inline-flex justify-center items-center ml-2">
                  <Users className="w-5 h-5" />
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Seu Portal</span>
              </Link>
            </li>
            <li>
              <Link to="/dashboard/settings" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-[#f4268e] pr-6 rounded-md">
                <span className="inline-flex justify-center items-center ml-2">
                  <Settings className="w-5 h-5" />
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">Assinatura</span>
              </Link>
            </li>
          </ul>
        </div>
        
        {/* User context footer */}
        <div className="border-t border-gray-100 p-4">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">Painel de Controle</h1>
          <div className="flex items-center space-x-4">
            {/* Header actions */}
            <Link to="/" className="text-sm text-blue-600 hover:underline">Ver Portal Público</Link>
          </div>
        </header>
        
        <div className="p-6">
          {/* Renders the nested routes */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
