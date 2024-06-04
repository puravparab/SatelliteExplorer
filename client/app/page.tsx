import Earth from "./components/earth";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-start p-0 font-sans">
      <div className="flex flex-row w-full h-full bg-slate-950">
        <div className="w-4/6 my-4 mx-2">
          <Earth />
        </div>
        <div className="flex flex-col w-2/6 m-4">
          <h1 className="mr-auto text-2xl ">Satellite Explorer</h1>
        </div>
      </div>
    </main>
  );
}
