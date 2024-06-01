import Earth from "./components/earth";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-start p-12">
      <h1 className="mr-auto text-4xl pb-10">SatelliteXplorer</h1>
      <Earth />
    </main>
  );
}
