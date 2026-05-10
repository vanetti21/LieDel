import Header from "../components/common/Header";
import Profile from "../components/settings/Profile";
import Account from "../components/settings/Account";

const SettingsPage = () => {
    return (
        <div className='flex-1 overflow-auto relative z-10' style={{ backgroundColor: 'rgb(198, 213, 252)' }}>
            <Header title='Settings' />
            <main className='max-w-4xl mx-auto py-6 px-4 lg:px-8'>
                <Profile />
                <Account />
            </main>
        </div>
    );
};
export default SettingsPage;