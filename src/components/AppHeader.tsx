"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

type AppHeaderProps = {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
};

type MenuItem = {
  label: string;
  icon: JSX.Element;
};

const menuItems: MenuItem[] = [
  {
    label: "Inicio",
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} stroke="currentColor" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5 12 4l9 5.5" />
        <path d="M5 10v9h4v-5h6v5h4v-9" />
      </svg>
    ),
  },
  {
    label: "Buscar",
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} stroke="currentColor" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx={11} cy={11} r={6} />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
  {
    label: "Configuracoes",
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} stroke="currentColor" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
  },
  {
    label: "Sobre",
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} stroke="currentColor" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx={12} cy={12} r={10} />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
];

export function AppHeader({ options, selected, onSelect }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const current = useMemo(() => options.find((opt) => opt.value === selected) ?? options[0], [options, selected]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFilterOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="max-w-[990px] mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
          >
            <svg viewBox="0 0 24 24" width={22} height={22} stroke="currentColor" strokeWidth={1.8} fill="none" strokeLinecap="round">
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center">
            <Image src="/logo.png" width={150} height={34} alt="ComMarilia" priority className="h-7 w-auto" />
          </div>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((prev) => !prev)}
              className="flex items-center border border-slate-200 bg-white px-2 py-1 text-[12px] font-normal text-slate-600 transition hover:bg-slate-50"
              aria-expanded={filterOpen}
              aria-haspopup="listbox"
            >
              <svg viewBox="0 0 24 24" width={18} height={18} stroke="currentColor" strokeWidth={1.8} fill="none" strokeLinecap="round">
                <path d="M4 5h16" />
                <path d="M6 10h12" />
                <path d="M9 15h6" />
                <path d="m11 20 2-2v-3" />
              </svg>
              <span className="mx-2 text-slate-800">{current.label}</span>
              <svg
                className={"transition-transform " + (filterOpen ? "rotate-180" : "rotate-0")}
                viewBox="0 0 24 24"
                width={18}
                height={18}
                stroke="currentColor"
                strokeWidth={1.8}
                fill="none"
                strokeLinecap="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {filterOpen ? (
              <div className="absolute right-0 mt-2 w-48 border border-slate-200 bg-white p-1 shadow-xl">
                <ul role="listbox" className="max-h-64 overflow-auto py-1 text-[13px] text-slate-600">
                  {options.map((opt) => {
                    const isActive = opt.value === selected;
                    return (
                      <li key={opt.value}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(opt.value);
                            setFilterOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-2.5 py-1.5 text-left transition hover:bg-slate-100 ${isActive ? "font-medium text-blue-600" : "text-slate-600"}`}
                          role="option"
                          aria-selected={isActive}
                        >
                          <span>{opt.label}</span>
                          {isActive ? (
                            <svg viewBox="0 0 24 24" width={18} height={18} stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round">
                              <path d="m20 6-11 11-5-5" />
                            </svg>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {menuOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/60" onClick={() => setMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col gap-6 border-r border-slate-200 bg-white/98 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Menu</p>
              </div>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
              >
                <svg viewBox="0 0 24 24" width={20} height={20} stroke="currentColor" strokeWidth={1.8} fill="none" strokeLinecap="round">
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-2 text-slate-700">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 rounded-xl px-3 py-3 text-left text-sm font-medium transition hover:bg-slate-100"
                >
                  <span className="text-slate-600">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </>
      ) : null}
    </header>
  );
}











