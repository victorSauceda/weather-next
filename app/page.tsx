import AutocompleteSearch from "./components/AutocompleteSearch";

export default function Home() {
  return (
    <div className="min-h-screen text-black flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-8">Weather App</h1>
      <AutocompleteSearch mode="home" />
    </div>
  );
}
