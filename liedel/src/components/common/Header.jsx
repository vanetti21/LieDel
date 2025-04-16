const Header = ({ title }) => {
  return (
    <header className="backdrop-blur-md p-4 border-b border-gray-200" style={{ backgroundColor: 'rgb(240, 243, 249)' }}>
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-black-100">{title}</h1>
        </div>
    </header>
  );
};

export default Header;
