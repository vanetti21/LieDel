import { useState } from "react";
import Ventas_Fecha from "../components/reports/Ventas_Fecha";
import ExcelExporter from "../components/reports/Excel_Exporter";
import PDFGenerator from "../components/reports/PDFGenerator";


const ReportsPage = () => {

  const [formato, setFormato] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="flex-1 relative z-10 overflow-auto">

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">

        <Ventas_Fecha
          formato={formato}
          setFormato={setFormato}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />

        {formato === "excel" && (
          <ExcelExporter
            startDate={startDate}
            endDate={endDate}
          />
        )}

        {formato === "pdf" && (
          <PDFGenerator
            startDate={startDate}
            endDate={endDate}
          />
        )}

      </main>

    </div>
  );
};

export default ReportsPage;