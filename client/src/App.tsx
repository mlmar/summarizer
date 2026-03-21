import './App.css';

function App() {
    return (
        <main className='flex flex-col h-full w-full text-white gap-2'>
            <h1> Upload your pdf</h1>
            <input type='file' accept='pdf' />
        </main>
    );
}

export default App;
