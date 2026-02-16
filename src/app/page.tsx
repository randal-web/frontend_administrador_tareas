'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HiOutlineClipboardCheck,
  HiOutlineViewGrid,
  HiOutlineChartBar,
  HiOutlineRefresh,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';

const features = [
  {
    icon: HiOutlineClipboardCheck,
    title: 'Gestión de tareas',
    description: 'Organiza tus tareas personales, laborales y de proyecto con prioridades, estados y fechas límite.',
  },
  {
    icon: HiOutlineViewGrid,
    title: 'Tablero Kanban',
    description: 'Visualiza el progreso de tus proyectos con columnas de estado arrastrables e intuitivas.',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Diagrama de Gantt',
    description: 'Planifica y supervisa la línea temporal de tus proyectos con vista de Gantt integrada.',
  },
  {
    icon: HiOutlineRefresh,
    title: 'Seguimiento de hábitos',
    description: 'Crea hábitos, marca tu progreso diario y observa tu racha de cumplimiento semanal.',
  },
  {
    icon: HiOutlineLightningBolt,
    title: 'Panel inteligente',
    description: 'Un dashboard que resume tu día: tareas pendientes, hábitos y próximos vencimientos.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Autenticación segura',
    description: 'Inicia sesión con email y contraseña o mediante Google y Outlook de forma segura.',
  },
];

const plans = [
  {
    name: 'Gratis',
    price: '0',
    description: 'Para empezar a organizarte',
    features: ['Hasta 50 tareas', 'Hasta 3 proyectos', '5 hábitos', 'Panel principal'],
    cta: 'Empezar gratis',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '9',
    description: 'Para profesionales exigentes',
    features: ['Tareas ilimitadas', 'Proyectos ilimitados', 'Hábitos ilimitados', 'Tablero Kanban y Gantt', 'Estadísticas avanzadas', 'Soporte prioritario'],
    cta: 'Comenzar prueba',
    highlighted: true,
  },
  {
    name: 'Equipo',
    price: '19',
    description: 'Para equipos y empresas',
    features: ['Todo lo de Pro', 'Colaboración en equipo', 'Roles y permisos', 'Informes de equipo', 'API de integración', 'Soporte dedicado'],
    cta: 'Contactar ventas',
    highlighted: false,
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <HiOutlineClipboardCheck className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              TaskFlow
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Precios</a>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-3 py-2"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-white px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200"
            >
              Registrarse
            </Link>
          </div>
          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
          </button>
        </div>
        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-indigo-600">Funcionalidades</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-600 hover:text-indigo-600">Precios</a>
            <hr className="border-gray-100" />
            <Link href="/login" className="block text-sm font-medium text-gray-700 hover:text-indigo-600">Iniciar sesión</Link>
            <Link href="/register" className="block text-sm font-medium text-white text-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600">Registrarse</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium mb-6">
            <HiOutlineLightningBolt size={14} />
            Productividad inteligente para tu día a día
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Organiza tu vida,{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              logra más
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Gestiona tareas, proyectos y hábitos desde un solo lugar. Visualiza tu progreso con tableros Kanban, diagramas de Gantt y un panel que te mantiene enfocado.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 text-base"
            >
              Empezar gratis
              <HiOutlineArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-gray-700 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-base"
            >
              Ver funcionalidades
            </a>
          </div>
        </div>

        {/* Hero visual */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="rounded-2xl border border-gray-200 shadow-2xl shadow-indigo-100/50 overflow-hidden bg-gradient-to-br from-gray-50 to-white p-1">
            <div className="rounded-xl bg-white border border-gray-100 p-6 md:p-8">
              {/* Mock dashboard */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Tareas hoy', value: '12', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Completadas', value: '8', color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'En progreso', value: '3', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Hábitos', value: '5/7', color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((card) => (
                  <div key={card.label} className={`${card.bg} rounded-xl p-4`}>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                  </div>
                ))}
              </div>
              {/* Mock kanban */}
              <div className="grid md:grid-cols-4 gap-3">
                {['Por hacer', 'En curso', 'Revisión', 'Hecho'].map((col, ci) => (
                  <div key={col}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        ci === 0 ? 'bg-gray-400' : ci === 1 ? 'bg-blue-500' : ci === 2 ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      <span className="text-xs font-semibold text-gray-500">{col}</span>
                    </div>
                    {[...Array(ci === 3 ? 3 : ci === 0 ? 2 : 1)].map((_, j) => (
                      <div key={j} className="mb-2 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                        <div className="h-2.5 rounded-full bg-gray-200 w-3/4 mb-2" />
                        <div className="h-2 rounded-full bg-gray-100 w-1/2" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Todo lo que necesitas para ser{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">productivo</span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Herramientas potentes y fáciles de usar, diseñadas para que te concentres en lo que importa.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors">
                  <feature.icon className="text-indigo-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Empieza en{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">3 pasos</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Crea tu cuenta', desc: 'Regístrate gratis con tu email o inicia sesión con Google o Outlook.' },
              { step: '2', title: 'Organiza tu día', desc: 'Añade tareas, asigna prioridades y categorías. Crea proyectos y hábitos.' },
              { step: '3', title: 'Alcanza tus metas', desc: 'Revisa tu progreso en el panel, completa hábitos y mantén el enfoque.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50/70">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Planes para cada{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">necesidad</span>
            </h2>
            <p className="mt-4 text-gray-500">Sin compromiso. Cancela cuando quieras.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 sm:p-8 flex flex-col ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-200 md:scale-[1.03] relative'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-bold shadow-md">
                    Más popular
                  </div>
                )}
                <h3 className={`text-lg font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mt-1 ${plan.highlighted ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="mt-6 mb-6">
                  <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-indigo-200' : 'text-gray-400'}`}>/mes</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <HiOutlineCheck
                        size={16}
                        className={plan.highlighted ? 'text-indigo-200' : 'text-indigo-600'}
                      />
                      <span className={plan.highlighted ? 'text-indigo-50' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlighted
                      ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-md'
                      : 'border border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            ¿Listo para ser más productivo?
          </h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Únete a miles de personas que ya organizan su día con TaskFlow. Empieza gratis, sin tarjeta de crédito.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 text-base"
          >
            Crear mi cuenta gratis
            <HiOutlineArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <HiOutlineClipboardCheck className="text-white" size={14} />
            </div>
            <span className="font-bold text-gray-800">TaskFlow</span>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} TaskFlow. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Términos</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
