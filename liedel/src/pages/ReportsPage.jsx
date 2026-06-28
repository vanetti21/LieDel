import { useState } from "react";
import Ventas_Fecha from "../components/reports/Ventas_Fecha";
import ExcelExporter from "../components/reports/Excel_Exporter";

const ReportsPage = () => {
  const [formato,     setFormato]     = useState(null);
  const [excelStart,  setExcelStart]  = useState("");
  const [excelEnd,    setExcelEnd]    = useState("");

  return (
    <div className='flex-1 relative z-10 overflow-auto'>
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <Ventas_Fecha
          formato={formato}
          setFormato={setFormato}
          onExcelDates={(s, e) => { setExcelStart(s); setExcelEnd(e); }}
        />
        {formato === "excel" && (
            <ExcelExporter
              startDate={excelStart}
              endDate={excelEnd}
            />
        )}
      </main>
    </div>
  );
};

export default ReportsPage;