'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useReportStore, Report } from '@/stores/reportStore';
import { useTaskStore } from '@/stores/taskStore';
import { useHabitStore } from '@/stores/habitStore';
import { useNoteStore } from '@/stores/noteStore';
import { useAuthStore } from '@/stores/authStore';
import { getLocalDateString } from '@/lib/dateUtils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  HiOutlineDocumentReport,
  HiOutlineDownload,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineCheck,
} from 'react-icons/hi';
import ConfirmModal from '@/components/ui/ConfirmModal';

// I'll skip dynamic import of jspdf for now to avoid build issues if not installed,
// but the logic will be ready.
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

export default function ReportsPage() {
  const { reports, fetchReports, createReport, deleteReport, isLoading } = useReportStore();
  const { tasks, fetchTasksByDate } = useTaskStore();
  const { weeklyHabits, fetchWeeklyHabits } = useHabitStore();
  const { notes, fetchNotes } = useNoteStore();
  const { user } = useAuthStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Customization state
  const [reportTitle, setReportTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [showEditor, setShowShowEditor] = useState(false);

  const todayStr = getLocalDateString();

  const safeFormatDate = (dateStr: any) => {
    if (!dateStr) return 'Fecha no disponible';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Fecha no disponible';
      return format(date, "d 'de' MMMM, yyyy HH:mm", { locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  useEffect(() => {
    fetchReports();
    fetchTasksByDate(todayStr);
    fetchWeeklyHabits(todayStr);
    fetchNotes();
  }, [fetchReports, fetchTasksByDate, fetchWeeklyHabits, fetchNotes, todayStr]);

  // Generate summary data
  const summaryData = useMemo(() => {
    const todayTasks = tasks.filter(t => {
      if (!t.start_date) return false;
      const end = t.end_date || t.start_date;
      return t.start_date <= todayStr && end >= todayStr;
    });
    const completedTasks = todayTasks.filter(t => t.status === 'DONE');
    const pendingTasks = todayTasks.filter(t => t.status !== 'DONE');
    
    const habitsProgress = weeklyHabits.map(h => {
      const todayLog = h.week?.find(d => d.date === todayStr);
      return { name: h.name, completed: todayLog?.is_completed || false };
    });

    const importantNotes = notes.filter(n => n.is_important).slice(0, 5);

    return {
      date: format(new Date(), "eeee, d 'de' MMMM 'yyyy'", { locale: es }),
      tasks: {
        total: todayTasks.length,
        completed: completedTasks.length,
        pending: pendingTasks.map(t => t.title),
      },
      habits: habitsProgress,
      notes: importantNotes.map(n => n.title),
    };
  }, [tasks, weeklyHabits, notes, todayStr]);

  const handleAutoGenerate = () => {
    const title = `Resumen Diario - ${format(new Date(), 'dd/MM/yyyy')}`;
    const content = JSON.stringify(summaryData);
    setReportTitle(title);
    setCustomContent(`Hoy he completado ${summaryData.tasks.completed} de ${summaryData.tasks.total} tareas.
Mis hábitos de hoy: ${summaryData.habits.map(h => `${h.name} (${h.completed ? 'Hecho' : 'Pendiente'})`).join(', ')}.
Notas importantes: ${summaryData.notes.join(', ') || 'Ninguna'}.`);
    setShowShowEditor(true);
  };

  const saveReport = async () => {
    setIsGenerating(true);
    try {
      await createReport({
        title: reportTitle,
        content: customContent,
        type: 'daily',
      });
      setShowShowEditor(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async (report: Report | { title: string, content: string, created_at?: string }) => {
    try {
      // Dynamic import to avoid issues if not installed yet
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const title = report.title;
      const date = report.created_at ? safeFormatDate(report.created_at) : safeFormatDate(new Date().toISOString());
      const content = report.content;

      // PDF Styling
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229); // Indigo 600
      doc.text('Reporte de Actividad', 20, 20);

      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128); // Gray 500
      doc.setFont('helvetica', 'normal');
      doc.text(`Generado el: ${date}`, 20, 30);

      doc.setDrawColor(229, 231, 235); // Gray 200
      doc.line(20, 35, 190, 35);

      doc.setFontSize(16);
      doc.setTextColor(31, 41, 55); // Gray 900
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, 50);

      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81); // Gray 700
      doc.setFont('helvetica', 'normal');
      
      // Split text to fit page width
      const splitContent = doc.splitTextToSize(content, 170);
      doc.text(splitContent, 20, 65);

      // Save
      doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Asegúrate de haber instalado jspdf: npm install jspdf');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Reportes y Resúmenes</h1>
          <p className="text-gray-500 mt-1">Analiza tu progreso y guarda copias de tu actividad diaria.</p>
        </div>
        <button
          onClick={handleAutoGenerate}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <HiOutlinePlus size={20} />
          Generar Reporte de Hoy
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Historial de Reportes</h2>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Cargando reportes...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <HiOutlineDocumentReport size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">Aún no has generado ningún reporte.</p>
            <p className="text-gray-400 text-sm mt-1">Haz clic en "Generar Reporte de Hoy" para comenzar.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reports.map(report => (
              <div key={report.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <HiOutlineDocumentReport size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{report.title}</h3>
                    <p className="text-xs text-gray-400">{safeFormatDate(report.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setViewReport(report)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Ver"
                  >
                    <HiOutlineEye size={18} />
                  </button>
                  <button 
                    onClick={() => downloadPDF(report)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    title="Descargar PDF"
                  >
                    <HiOutlineDownload size={18} />
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteId(report.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Eliminar"
                  >
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generation Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShowEditor(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-indigo-600 text-white">
              <h3 className="font-bold text-lg">Personalizar Reporte</h3>
              <button onClick={() => setShowShowEditor(false)}><HiOutlineX size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Título del Reporte</label>
                <input 
                  type="text" 
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contenido (Puedes editarlo)</label>
                <textarea 
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
                />
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                <div className="text-amber-500 mt-0.5"><HiOutlineCheck size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-amber-800">Sugerencia</p>
                  <p className="text-xs text-amber-700">Este resumen se basa en tu actividad de hoy. Puedes añadir reflexiones personales antes de guardarlo.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowShowEditor(false)}
                className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
              <button 
                onClick={saveReport}
                disabled={isGenerating}
                className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                {isGenerating ? 'Guardando...' : 'Guardar y Finalizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {viewReport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewReport(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{viewReport.title}</h3>
              <button onClick={() => setViewReport(null)}><HiOutlineX size={20} className="text-gray-400" /></button>
            </div>
            <div className="p-8 overflow-y-auto whitespace-pre-wrap text-gray-700 leading-relaxed font-serif text-lg">
              {viewReport.content}
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => downloadPDF(viewReport)}
                className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <HiOutlineDownload size={18} />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="¿Eliminar reporte?"
        message="Esta acción borrará permanentemente este reporte de tu historial."
        onConfirm={async () => {
          if (confirmDeleteId) await deleteReport(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}