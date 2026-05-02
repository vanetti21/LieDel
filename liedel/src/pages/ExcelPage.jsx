import Header from "../components/common/Header";
import Excel from "../components/excel/Excel";

const ExcelPage = () => {
	return (
		<div className='flex-1 relative z-10 overflow-auto'>
			<Header title={"Excel DB"} />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
            <Excel />

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
				
				</div>
				
			</main>
		</div>
	);
};
export default ExcelPage;