import Header from "../components/common/Header";

import SalesForecastChart from "../components/predictions/SalesForecastChart";
import StockPrediction from "../components/predictions/StockPrediction";
import SupplierRiskTable from "../components/predictions/SupplierRiskTable";
import AIBusinessInsights from "../components/predictions/AIBusinessInsights";
import CustomerInsights from "../components/predictions/CustomerInsights";
import PredictDemandTable from "../components/predictions/PredictDemandTable";

const PredictionsPage = () => {

	return (
		<div className='flex-1 overflow-auto relative z-10'>

			<Header title='Predictive Analytics' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>

				<div className='mb-8'>
					<SalesForecastChart />
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					<StockPrediction />
					<SupplierRiskTable />
				</div>

				<div className='mb-10'>
					<PredictDemandTable />
				</div>
				
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					<AIBusinessInsights />
					<CustomerInsights />
				</div>



			</main>
		</div>
	);
};

export default PredictionsPage;